import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  afterNextRender,
  inject,
} from '@angular/core';
import { CAROUSEL_FEATURES, SERVICES_HEADLINE } from '../../content/services.data';
import { isBrowser } from '../../core/platform';
import {
  SLOT_STEP,
  STAGE_WIDTH,
  TILE_PITCH,
  activeIndex,
  clamp,
  headIconPose,
  headPose,
  poseFor,
  ramp,
  tileActiveIconOpacity,
  tileInactiveIconOpacity,
  tileRingFill,
} from './carousel.animation';

/**
 * S03b · pinned features carousel — see YNMO-TIFLI-FEATURES-CAROUSEL-BUILD.md.
 *
 * Progressive enhancement, exactly as services-grid does it: the template
 * already renders feature 1 finished at rest, so SSR / no-JS / reduced-motion
 * readers get a complete, readable section with zero extra code. This driver
 * only runs in the browser, and only when motion is allowed and the viewport
 * is wide enough to pin (§8, D4).
 *
 * All motion is `f(T)` from carousel.animation.ts. Nothing here decides what
 * anything looks like — it measures, runs one rAF loop, and writes styles.
 */
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
const NARROW_QUERY = '(max-width: 1023px)';

/** Scroll distance per feature, in viewport-heights (§10 open decision 1).
 * 9 x 0.75 = 6.75vh pinned total. Below ~0.5 the ring fill feels frantic;
 * above ~1.0 the section reads as a trap. Tuning this does not change the
 * beat map. */
const VH_PER_FEATURE = 0.75;

/** Damped follow on T (§3.1). Binding transforms straight to raw scroll reads
 * as jittery on trackpads. */
const SMOOTHING = 0.11;
/** Below this delta the follow has converged; stop re-rendering so an idle
 * section costs nothing. */
const SETTLE_EPSILON = 0.00005;

/** Clears the floating header (48px gap + ~90px bar) plus breathing room —
 * matches services-grid's MIN_STICKY_TOP exactly, so every pinned section
 * on the page holds its headline the same distance under the header. Desktop
 * only: narrow's own header sits much closer to the top (site-header.scss'
 * inset-block-start drops from 48px to var(--space-16) below 1024, and the
 * bar itself is shorter there too) — reusing this same fixed 162px for
 * narrow left a large dead gap between the header and the pinned rail
 * (explicit report). See stickyTopOffset()/HEADER_SELECTOR below for the
 * narrow replacement — measured off the real header rather than a second
 * hardcoded guess, since guessing this exactly is what produced the gap in
 * the first place. */
const MIN_STICKY_TOP = 162;

/** app-site-header is position: fixed, so its own rect is already in
 * viewport (not page) coordinates — exactly what a sticky `top` offset
 * needs, and unaffected by scroll position, so it's safe to read once in
 * measure() rather than every frame (§3.1). */
const HEADER_SELECTOR = 'app-site-header';
/** px of breathing room below the header's own bottom edge, narrow only. */
const NARROW_STICKY_BREATHING_ROOM = 16;

/** Staged entrance sub-windows, in entrance progress E (0 → 1; E = 1 at
 * pinStart()). Explicit order — headline, then the rail, then the head+
 * mockup column — mirrors the read a reader should get approaching the
 * section: the section's own name first, then its own navigation, then its
 * content, never the mockup arriving ahead of the title the way the old
 * single all-at-once reveal did. */
const ENTRANCE_HEADLINE: readonly [number, number] = [0, 0.35];
const ENTRANCE_RAIL: readonly [number, number] = [0.35, 0.7];
const ENTRANCE_COLUMN: readonly [number, number] = [0.7, 1];

/** px the rail slides in from — physical, matching the mockup stack's own
 * "translateX doesn't mirror under RTL" convention (§8): the rail already
 * sits at the physical right edge, so entering "from the right" (explicit
 * request) means starting even further right and sliding to rest. */
const RAIL_ENTER_TRAVEL = 32;

/** Cinematic headline entrance, matching the fade+rise+blur treatment used
 * on every other section's scroll reveal (hero, journey) — px risen and px
 * of blur cleared over ENTRANCE_HEADLINE, driven off the same headlineP
 * used for opacity so it stays perfectly in sync, both directions. */
const HEADLINE_ENTER_RISE = 40;
const HEADLINE_ENTER_BLUR = 8;

/** offsetTop walked up the offsetParent chain — transform-immune, unlike
 * getBoundingClientRect(), so it cannot be corrupted by being read while an
 * element already carries an in-flight animation transform. */
function pageOffsetTop(el: HTMLElement): number {
  let y = 0;
  let node: HTMLElement | null = el;
  while (node) {
    y += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return y;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-features-carousel',
  styleUrl: './features-carousel.scss',
  templateUrl: './features-carousel.html',
})
export class FeaturesCarousel implements OnDestroy {
  protected readonly headline = SERVICES_HEADLINE;
  protected readonly features = CAROUSEL_FEATURES;
  protected readonly count = CAROUSEL_FEATURES.length;
  protected readonly tilePitch = TILE_PITCH;

  private readonly elRef: ElementRef<HTMLElement> = inject(ElementRef);
  private readonly browser = isBrowser();

  private section: HTMLElement | null = null;
  private track: HTMLElement | null = null;
  /** the sticky element on desktop — the driver sets its `top` and reads its
   * height. Narrow uses `body` for both instead (§ mobile rebuild): the
   * headline isn't part of the pinned block there, only rail+divider+column
   * are, so the element that actually needs position:sticky differs — see
   * pinTargetEl(). */
  private sticky: HTMLElement | null = null;
  private body: HTMLElement | null = null;
  /** the mockup stage region — measured only to scale SLOT_STEP */
  private stage: HTMLElement | null = null;
  /** the four elements the staged entrance (updateEntrance()) fades in */
  private headlineEl: HTMLElement | null = null;
  private railEl: HTMLElement | null = null;
  private dividerEl: HTMLElement | null = null;
  private columnEl: HTMLElement | null = null;
  private mockups: HTMLElement[] = [];
  private heads: HTMLElement[] = [];
  private headIcons: HTMLElement[] = [];
  /** two stacked glyphs per tile (node 1521:34733/1521:34740 — different
   * assets per state, not one dimmed/brightened) — see
   * tileActiveIconOpacity's doc comment. */
  private tileGlyphsInactive: HTMLElement[] = [];
  private tileGlyphsActive: HTMLElement[] = [];
  private tiles: HTMLElement[] = [];
  /** one ring per tile, fixed in place — see tileRingFill's doc comment for
   * why this replaced a single ring translated between tiles. */
  private ringPaths: SVGPathElement[] = [];

  private trackTop = 0;
  /** the sticky `top` actually in effect — MIN_STICKY_TOP on desktop, the
   * real measured header height (+ breathing room) on narrow; pinStart()
   * reads this instead of the constant directly so it stays correct on
   * whichever breakpoint set it last. */
  private stickyTopOffset = MIN_STICKY_TOP;
  /** document-flow top of the SECTION itself (not the track) — see
   * updateEntrance()'s doc comment for why the entrance is timed off this
   * instead of a fixed lead distance. */
  private sectionTop = 0;
  private extraScrollPx = 0;
  private stageWidth = STAGE_WIDTH;
  private narrow = false;
  private reducedMotion = false;
  private rafHandle = 0;
  private dirty = true;
  private targetT = 0;
  private smoothedT = 0;
  /** last values written to the DOM, so a settled frame writes nothing */
  private lastActive = -1;
  private resizeObserver?: ResizeObserver;
  private mqReduced?: MediaQueryList;

  constructor() {
    // Mirrors services-grid: afterNextRender fires *before* a later
    // hydration-mismatch reconciliation pass finishes discarding and
    // recreating this section's DOM, so setup applied immediately gets
    // silently thrown away along with the nodes it mutated. The delay is
    // imperceptible — this section sits well below the fold.
    if (this.browser) afterNextRender(() => setTimeout(() => this.init(), 1000));
  }

  ngOnDestroy(): void {
    // init() only ever runs client-side, but ngOnDestroy also runs on the
    // server when the SSR injector tears down after each render —
    // cancelAnimationFrame and window are undefined in Node.
    if (typeof window === 'undefined') return;
    cancelAnimationFrame(this.rafHandle);
    window.removeEventListener('scroll', this.onScroll);
    window.removeEventListener('resize', this.onResize);
    this.resizeObserver?.disconnect();
    this.mqReduced?.removeEventListener('change', this.onMotionPrefChange);
  }

  private init(): void {
    this.mqReduced = window.matchMedia(REDUCED_MOTION_QUERY);
    this.reducedMotion = this.mqReduced.matches;
    this.mqReduced.addEventListener('change', this.onMotionPrefChange);

    const section = this.elRef.nativeElement.querySelector('.fcar') as HTMLElement | null;
    if (!section) return;
    this.section = section;
    this.track = section.querySelector('.fcar__track') as HTMLElement | null;
    this.sticky = section.querySelector('.fcar__sticky') as HTMLElement | null;
    this.body = section.querySelector('.fcar__body') as HTMLElement | null;
    this.stage = section.querySelector('.fcar__stage') as HTMLElement | null;
    this.headlineEl = section.querySelector('.fcar__headline') as HTMLElement | null;
    this.railEl = section.querySelector('.fcar__rail') as HTMLElement | null;
    this.dividerEl = section.querySelector('.fcar__divider') as HTMLElement | null;
    this.columnEl = section.querySelector('.fcar__column') as HTMLElement | null;
    this.mockups = Array.from(section.querySelectorAll<HTMLElement>('[data-mockup]'));
    this.heads = Array.from(section.querySelectorAll<HTMLElement>('[data-head]'));
    this.headIcons = Array.from(section.querySelectorAll<HTMLElement>('[data-head-icon]'));
    this.tiles = Array.from(section.querySelectorAll<HTMLElement>('[data-tile]'));
    this.tileGlyphsInactive = Array.from(section.querySelectorAll<HTMLElement>('[data-tile-glyph-inactive]'));
    this.tileGlyphsActive = Array.from(section.querySelectorAll<HTMLElement>('[data-tile-glyph-active]'));
    this.ringPaths = Array.from(section.querySelectorAll<SVGPathElement>('[data-ring]'));

    // The rest markup renders feature 1 finished; hand the driver the same
    // state so its first frame is a no-op rather than a jump.
    section.classList.add('is-driven');

    this.measure();

    this.resizeObserver = new ResizeObserver(() => {
      this.dirty = true;
      this.measure();
    });
    this.resizeObserver.observe(section);

    window.addEventListener('scroll', this.onScroll, { passive: true });
    window.addEventListener('resize', this.onResize, { passive: true });

    if (this.reducedMotion) return; // static list stands as-is

    // Snap to wherever the reader already is rather than easing there from
    // T = 0: on a refresh part-way into the section, the damped follow would
    // otherwise play the whole timeline backwards on load. Also guarantees
    // the DOM matches the model from frame one instead of relying on the CSS
    // rest state agreeing with it.
    this.targetT = this.readTargetT();
    this.smoothedT = this.targetT;
    this.render(this.smoothedT);

    this.rafHandle = requestAnimationFrame(this.frame);
  }

  /** The element position:sticky actually gets applied to. Desktop pins
   * .fcar__sticky whole (headline included, per services-grid's own
   * convention) — narrow pins only .fcar__body instead (§ explicit request:
   * the headline should scroll away normally, only the rail+divider+column
   * "stop at the top"), features-carousel.scss switches which one actually
   * gets `position: sticky` for the same breakpoint this reads. */
  private pinTargetEl(): HTMLElement | null {
    return this.narrow ? this.body : this.sticky;
  }

  /** Cached geometry only — never read inside the rAF loop (§3.1, hard rule). */
  private measure(): void {
    if (!this.section || !this.track || !this.sticky || !this.body || !this.stage) return;
    const rect = this.section.getBoundingClientRect();
    // A ResizeObserver can fire mid-transition (hidden tab, browser chrome
    // animating) with a momentary zero box. Keep the last good measurement
    // rather than corrupting every anchor with it.
    if (rect.width <= 0) return;

    this.narrow = window.matchMedia(NARROW_QUERY).matches;

    // Narrow still pins/drives (§ mobile rebuild) — only the LAYOUT differs
    // (features-carousel.scss stacks head above a re-anchored mockup depth
    // stack instead of desktop's side-by-side one); the same T timeline,
    // entrance fade, ring fill, glyph cross-fade and mockup/head poses all
    // keep running so the mobile experience stays in sync with the
    // identical scroll-driven model, just re-skinned. Only reduced-motion
    // still bails outright — there's no reduced version of a scroll-jacked
    // pin to fall back to, so that stays a plain unpinned list
    // (fcar-list-fallback). Re-read AFTER updating this.narrow, since which
    // element this is depends on it.
    const pinTarget = this.pinTargetEl();
    if (!pinTarget) return;

    if (this.reducedMotion) {
      this.teardownPin();
      return;
    }

    this.stageWidth = this.stage.offsetWidth || STAGE_WIDTH;
    // Desktop's header sits much lower (48px gap + a taller bar) than
    // narrow's (site-header.scss drops to var(--space-16) below 1024, with
    // a shorter bar too) — reusing MIN_STICKY_TOP's fixed 162px for narrow
    // left a large dead gap between the header and the pinned rail
    // (explicit report). app-site-header is position: fixed, so its rect is
    // already viewport-relative and safe to read here (not per-frame).
    if (this.narrow) {
      const header = document.querySelector(HEADER_SELECTOR);
      const headerBottom = header ? header.getBoundingClientRect().bottom : MIN_STICKY_TOP;
      this.stickyTopOffset = Math.max(headerBottom + NARROW_STICKY_BREATHING_ROOM, 0);
    } else {
      this.stickyTopOffset = MIN_STICKY_TOP;
    }
    pinTarget.style.top = `${this.stickyTopOffset}px`;
    this.section.classList.add('is-pinned');

    // position: sticky consumes the whole buffer by keeping the stage visibly
    // pinned while it is scrolled through, releasing exactly as the track's
    // bottom reaches the sticky point — no scroll-jacking. Always measured
    // off .fcar__sticky (headline + body together), even on narrow where
    // only .fcar__body itself gets position: sticky — .fcar__sticky's own
    // offsetHeight is unaffected by which of its descendants is sticky, and
    // this needs the FULL content height (headline included) for the track
    // to end up tall enough; measuring just pinTarget there would undercount
    // by the headline's own height and release the pin that much early.
    const stickyHeight = this.sticky.offsetHeight;
    this.extraScrollPx = window.innerHeight * VH_PER_FEATURE * this.count;
    this.track.style.height = `${stickyHeight + this.extraScrollPx}px`;
    this.trackTop = pageOffsetTop(this.track);
    this.sectionTop = pageOffsetTop(this.section);
    // trackTop/sectionTop just changed, so pinStart() and the entrance
    // window did too — resync immediately rather than waiting for the next
    // scroll event, otherwise a reader who loads the page already scrolled
    // past the section would briefly see it hidden.
    this.updateEntrance();
  }

  private teardownPin(): void {
    if (!this.section || !this.track || !this.sticky || !this.body) return;
    this.section.classList.remove('is-pinned');
    this.sticky.style.top = '';
    this.body.style.top = '';
    this.track.style.height = '';
    this.extraScrollPx = 0;
    const entranceEls = [this.headlineEl, this.railEl, this.dividerEl, this.columnEl].filter(
      (el): el is HTMLElement => el !== null,
    );
    for (const el of [
      ...this.mockups,
      ...this.heads,
      ...this.headIcons,
      ...this.tileGlyphsInactive,
      ...this.tileGlyphsActive,
      ...entranceEls,
    ]) {
      el.style.transform = '';
      el.style.opacity = '';
      el.style.visibility = '';
      el.style.willChange = '';
      el.style.filter = '';
    }
    for (const path of this.ringPaths) path.style.strokeDashoffset = '';
  }

  /**
   * Fades the section in over ORDINARY pre-pin scroll — features-carousel.
   * scss' `.fcar.is-pinned` rule starts every one of these at opacity 0, and
   * this is what raises them, tracking scroll continuously rather than
   * flipping a single threshold. Explicit staged order: the headline first,
   * then the rail (sliding in from further right — physical, §8), then the
   * head+mockup column last, together — so the mockup never reads as
   * arriving ahead of the section's own title/rail the way a single
   * all-at-once reveal did.
   *
   * E runs 0 → 1 from the instant the section's own top edge first touches
   * the viewport's bottom (sectionTop - innerHeight — i.e. nothing of the
   * section is visible yet) through pinStart() (position:sticky itself
   * starts holding the header there), so by the time the column finishes
   * fading in the headline is already sitting fixed under the header, not
   * still mid-page. Anchoring to the section's OWN geometry here — rather
   * than a fixed lead distance counted back from pinStart — matters
   * specifically because whatever sits ABOVE this section on the page can
   * be taller than that fixed distance: a fixed-vh lead was measured
   * starting the headline while the PREVIOUS section still filled the
   * screen, well before the reader had scrolled anywhere near this one.
   * Tying it to the section's own top instead makes the entrance begin
   * exactly when the reader could first possibly see any part of it,
   * regardless of how tall the preceding content is.
   */
  private updateEntrance(): void {
    if (!this.headlineEl || !this.railEl || !this.columnEl) return;
    const E =
      this.extraScrollPx > 0
        ? ramp(window.scrollY, this.sectionTop - window.innerHeight, this.pinStart())
        : 1;

    const headlineP = ramp(E, ...ENTRANCE_HEADLINE);
    this.headlineEl.style.opacity = headlineP.toFixed(4);
    this.headlineEl.style.transform = `translate3d(0, ${((1 - headlineP) * HEADLINE_ENTER_RISE).toFixed(2)}px, 0)`;
    this.headlineEl.style.filter = `blur(${((1 - headlineP) * HEADLINE_ENTER_BLUR).toFixed(2)}px)`;

    const railP = ramp(E, ...ENTRANCE_RAIL);
    this.railEl.style.opacity = railP.toFixed(4);
    this.railEl.style.transform = `translate3d(${((1 - railP) * RAIL_ENTER_TRAVEL).toFixed(2)}px, 0, 0)`;
    if (this.dividerEl) this.dividerEl.style.opacity = railP.toFixed(4);

    this.columnEl.style.opacity = ramp(E, ...ENTRANCE_COLUMN).toFixed(4);
  }

  private readonly onScroll = (): void => {
    this.dirty = true;
  };

  private readonly onResize = (): void => {
    this.dirty = true;
    this.measure();
  };

  private readonly onMotionPrefChange = (e: MediaQueryListEvent): void => {
    this.reducedMotion = e.matches;
    cancelAnimationFrame(this.rafHandle);
    this.measure();
    if (this.reducedMotion) {
      this.teardownPin();
    } else {
      this.dirty = true;
      this.rafHandle = requestAnimationFrame(this.frame);
    }
  };

  /**
   * Scrolls to the middle of a feature's dwell (T = i + 0.45, §3.8), so the
   * rail tiles are real navigation and keyboard Tab through them never fights
   * the driver — the driver reads scroll position, it does not own it.
   */
  protected goTo(index: number): void {
    if (typeof window === 'undefined' || this.extraScrollPx <= 0) return;
    const T = index + 0.45;
    window.scrollTo({
      top: this.pinStart() + (T / this.count) * this.extraScrollPx,
      behavior: 'smooth',
    });
  }

  /**
   * Scroll position at which the sticky stage actually starts sticking —
   * stickyTopOffset above the track's own top.
   *
   * Measuring T from `trackTop` instead loses exactly stickyTopOffset of
   * travel: position:sticky releases when the track's bottom meets the
   * stage's bottom, which is that much earlier than `trackTop +
   * extraScrollPx`. T would then top out around 8.76 and the tail of the
   * last feature would play out while the section was already scrolling
   * away. Anchoring here makes T = 0 exactly at stick and T = count exactly
   * at release.
   */
  private pinStart(): number {
    return this.trackTop - this.stickyTopOffset;
  }

  private readonly frame = (): void => {
    if (this.dirty) {
      this.targetT = this.readTargetT();
      // Always recomputed on scroll, independent of whether T actually
      // changed: T stays pinned at 0 for the whole pre-pin approach (T only
      // moves once scrollY reaches pinStart()), so gating this behind T's
      // own settle check below would mean it never runs during exactly the
      // stretch it exists for.
      this.updateEntrance();
      this.dirty = false;
    }

    // Damped follow (§3.1). Snap when close enough, so the loop can go quiet
    // instead of chasing an asymptote forever.
    const delta = this.targetT - this.smoothedT;
    if (Math.abs(delta) > SETTLE_EPSILON) {
      this.smoothedT += delta * SMOOTHING;
      this.render(this.smoothedT);
    } else if (this.smoothedT !== this.targetT) {
      this.smoothedT = this.targetT;
      this.render(this.smoothedT);
    }

    this.rafHandle = requestAnimationFrame(this.frame);
  };

  private readTargetT(): number {
    if (this.extraScrollPx <= 0) return 0;
    const progress = clamp((window.scrollY - this.pinStart()) / this.extraScrollPx, 0, 1);
    return progress * this.count;
  }

  private render(T: number): void {
    // Same depth-stack math on both breakpoints now (§ mobile rebuild: the
    // "2 mockups, front + a smaller low-opacity one to the side" look is
    // this same poseFor(), not a mobile-only effect) — only the CSS anchor
    // each .fcar__mockup positions against differs (features-carousel.scss),
    // scaled automatically since stageWidth is read from the real
    // .fcar__stage at whatever width that resolves to per breakpoint.
    for (let i = 0; i < this.mockups.length; i++) {
      const el = this.mockups[i];
      const pose = poseFor(i, T, this.stageWidth, this.count);
      if (!pose.visible) {
        el.style.visibility = 'hidden';
        el.style.opacity = '0';
        el.style.willChange = '';
        continue;
      }
      el.style.visibility = 'visible';
      // translateX stays physical: this is a spatial depth composition, not
      // text flow, and must not mirror under dir="rtl" (§8).
      //
      // The vertical centring is entirely CSS's job (.fcar__mockup's
      // inset-block-start + its base translateY(-50%), the same line
      // .fcar__head centres on below) — this transform must only ever carry
      // x/scale. An earlier version of this line also added an absolute px
      // shift down to that same centre line before the translateY(-50%),
      // which duplicated the CSS offset (inline transform doesn't replace
      // inset-block-start, it stacks on top of it) and shoved every mockup
      // ~430px below its intended spot. translateY(-50%) alone still
      // self-centres correctly here because it's percentage-based: it
      // resolves against THIS element's own rendered height, whatever that
      // is for its current scale/aspect.
      el.style.transform = `translate3d(${pose.x.toFixed(2)}px, 0, 0) translateY(-50%) scale(${pose.scale.toFixed(4)})`;
      el.style.opacity = pose.opacity.toFixed(4);
      // Only the live layers get a compositing hint — never all nine (§8).
      el.style.willChange = 'transform, opacity';
    }

    for (let i = 0; i < this.heads.length; i++) {
      const head = this.heads[i];
      const pose = headPose(i, T, this.count);
      head.style.opacity = pose.opacity.toFixed(4);
      // translateY(-50%) here is the same self-centring piece the mockup
      // transform carries above (see its comment): CSS sets a base
      // translateY(-50%) against the CENTRE of the head's own zone (beside
      // the mockup on desktop, above it on narrow — features-carousel.scss),
      // and since this inline transform replaces the whole property, it has
      // to re-include that piece itself or the head would jump to that
      // zone's top edge the moment the driver takes over.
      head.style.transform = `translate3d(0, ${pose.y.toFixed(2)}px, 0) translateY(-50%)`;
      head.style.visibility = pose.opacity > 0 ? 'visible' : 'hidden';

      const icon = this.headIcons[i];
      if (icon) {
        const ic = headIconPose(i, T, this.count);
        icon.style.opacity = ic.opacity.toFixed(4);
        icon.style.transform = `translate3d(0, ${ic.y.toFixed(2)}px, 0)`;
      }
    }

    for (let i = 0; i < this.tileGlyphsActive.length; i++) {
      this.tileGlyphsActive[i].style.opacity = tileActiveIconOpacity(i, T, this.count).toFixed(4);
      this.tileGlyphsInactive[i].style.opacity = tileInactiveIconOpacity(i, T, this.count).toFixed(4);
    }

    // Each tile's ring is fixed in place — only its own fill changes, never
    // a shared position. See tileRingFill's doc comment.
    for (let i = 0; i < this.ringPaths.length; i++) {
      this.ringPaths[i].style.strokeDashoffset = (1 - tileRingFill(i, T)).toFixed(4);
    }

    const active = activeIndex(T, this.count);
    if (active !== this.lastActive) {
      for (let i = 0; i < this.tiles.length; i++) {
        const isActive = i === active;
        this.tiles[i].classList.toggle('is-active', isActive);
        if (isActive) this.tiles[i].setAttribute('aria-current', 'true');
        else this.tiles[i].removeAttribute('aria-current');
      }
      // Narrow only — desktop's rail is a fixed column, never scrolls.
      // Narrow's is a horizontally-scrollable row (features-carousel.scss),
      // so switching to a feature whose tile has scrolled out of view
      // (explicit report: the newly-active tile was left clipped at the
      // row's edge) needs to bring it back on screen itself. `inline` is
      // what moves the row horizontally; `block: 'nearest'` is there
      // specifically to stop this from ALSO nudging the page's own
      // (vertical) scroll — the tile is already vertically in view inside
      // the pinned rail, so "nearest" is a no-op on that axis.
      if (this.narrow) {
        this.tiles[active]?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
      }
      this.lastActive = active;
    }
  }
}
