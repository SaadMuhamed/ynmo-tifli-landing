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
  tileGlyphOpacity,
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
 * on the page holds its headline the same distance under the header. */
const MIN_STICKY_TOP = 162;

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
  /** the sticky element — the driver sets its `top` and reads its height */
  private sticky: HTMLElement | null = null;
  /** the mockup stage region — measured only to scale SLOT_STEP */
  private stage: HTMLElement | null = null;
  private mockups: HTMLElement[] = [];
  private heads: HTMLElement[] = [];
  private headIcons: HTMLElement[] = [];
  private tileGlyphs: HTMLElement[] = [];
  private tiles: HTMLElement[] = [];
  /** one ring per tile, fixed in place — see tileRingFill's doc comment for
   * why this replaced a single ring translated between tiles. */
  private ringPaths: SVGPathElement[] = [];

  private trackTop = 0;
  private extraScrollPx = 0;
  private stageWidth = STAGE_WIDTH;
  /** whether the reader has scrolled far enough to reveal the section — see
   * updateRevealed()'s doc comment. */
  private revealed = false;
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
    this.stage = section.querySelector('.fcar__stage') as HTMLElement | null;
    this.mockups = Array.from(section.querySelectorAll<HTMLElement>('[data-mockup]'));
    this.heads = Array.from(section.querySelectorAll<HTMLElement>('[data-head]'));
    this.headIcons = Array.from(section.querySelectorAll<HTMLElement>('[data-head-icon]'));
    this.tiles = Array.from(section.querySelectorAll<HTMLElement>('[data-tile]'));
    this.tileGlyphs = Array.from(section.querySelectorAll<HTMLElement>('[data-tile-glyph]'));
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

    if (this.reducedMotion || this.narrow) return; // static list stands as-is

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

  /** Cached geometry only — never read inside the rAF loop (§3.1, hard rule). */
  private measure(): void {
    if (!this.section || !this.track || !this.sticky || !this.stage) return;
    const rect = this.section.getBoundingClientRect();
    // A ResizeObserver can fire mid-transition (hidden tab, browser chrome
    // animating) with a momentary zero box. Keep the last good measurement
    // rather than corrupting every anchor with it.
    if (rect.width <= 0) return;

    this.narrow = window.matchMedia(NARROW_QUERY).matches;

    if (this.narrow || this.reducedMotion) {
      this.teardownPin();
      return;
    }

    this.stageWidth = this.stage.offsetWidth || STAGE_WIDTH;
    this.sticky.style.top = `${MIN_STICKY_TOP}px`;
    this.section.classList.add('is-pinned');

    // position: sticky consumes the whole buffer by keeping the stage visibly
    // pinned while it is scrolled through, releasing exactly as the track's
    // bottom reaches the sticky point — no scroll-jacking.
    const stickyHeight = this.sticky.offsetHeight;
    this.extraScrollPx = window.innerHeight * VH_PER_FEATURE * this.count;
    this.track.style.height = `${stickyHeight + this.extraScrollPx}px`;
    this.trackTop = pageOffsetTop(this.track);
    // trackTop just changed, so pinStart() did too — resync immediately
    // rather than waiting for the next scroll event, otherwise a reader who
    // loads the page already scrolled past the section would briefly see it
    // hidden.
    this.updateRevealed();
  }

  private teardownPin(): void {
    if (!this.section || !this.track || !this.sticky) return;
    this.section.classList.remove('is-pinned', 'is-revealed');
    this.revealed = false;
    this.sticky.style.top = '';
    this.track.style.height = '';
    this.extraScrollPx = 0;
    for (const el of [...this.mockups, ...this.heads, ...this.headIcons, ...this.tileGlyphs]) {
      el.style.transform = '';
      el.style.opacity = '';
      el.style.visibility = '';
      el.style.willChange = '';
    }
    for (const path of this.ringPaths) path.style.strokeDashoffset = '';
  }

  /**
   * Hides the section (features-carousel.scss' `.fcar.is-pinned:not(.is-
   * revealed)` rule) until the reader has scrolled far enough that the pin
   * is about to engage — explicit request: the section's own "feature 1
   * finished" rest state (rail lit, mockups full size) was otherwise
   * visible peeking up from below the fold while still reading the
   * PREVIOUS section. Threshold is exactly pinStart(), the same scroll
   * position position:sticky itself starts holding the header at, so
   * reveal and "already fixed under the header" happen in the same frame.
   * Symmetric (re-hides on scrolling back above it) rather than sticky-once,
   * matching "hide them till I scroll down till I reach the section"
   * literally in both directions.
   */
  private updateRevealed(): void {
    if (!this.section || this.extraScrollPx <= 0) return;
    const shouldReveal = window.scrollY >= this.pinStart();
    if (shouldReveal === this.revealed) return;
    this.revealed = shouldReveal;
    this.section.classList.toggle('is-revealed', shouldReveal);
  }

  private readonly onScroll = (): void => {
    this.dirty = true;
    this.updateRevealed();
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
    } else if (!this.narrow) {
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
   * MIN_STICKY_TOP above the track's own top.
   *
   * Measuring T from `trackTop` instead loses exactly MIN_STICKY_TOP of
   * travel: position:sticky releases when the track's bottom meets the
   * stage's bottom, which is that much earlier than `trackTop +
   * extraScrollPx`. T would then top out around 8.76 and the tail of the
   * last feature would play out while the section was already scrolling
   * away. Anchoring here makes T = 0 exactly at stick and T = count exactly
   * at release.
   */
  private pinStart(): number {
    return this.trackTop - MIN_STICKY_TOP;
  }

  private readonly frame = (): void => {
    if (this.dirty) {
      this.targetT = this.readTargetT();
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
      // inset-block-start: 50% + its base translateY(-50%), the same line
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
      // transform carries above (see its comment) — the head now sits
      // beside the mockup on that same shared centre line instead of being
      // pinned to the column's top, so it needs the identical treatment:
      // CSS sets the base translateY(-50%), and since this inline transform
      // replaces the whole property, it has to re-include that piece itself
      // or the head would jump to the column's top the moment the driver
      // takes over.
      head.style.transform = `translate3d(0, ${pose.y.toFixed(2)}px, 0) translateY(-50%)`;
      head.style.visibility = pose.opacity > 0 ? 'visible' : 'hidden';

      const icon = this.headIcons[i];
      if (icon) {
        const ic = headIconPose(i, T, this.count);
        icon.style.opacity = ic.opacity.toFixed(4);
        icon.style.transform = `translate3d(0, ${ic.y.toFixed(2)}px, 0)`;
      }
    }

    for (let i = 0; i < this.tileGlyphs.length; i++) {
      this.tileGlyphs[i].style.opacity = tileGlyphOpacity(i, T, this.count).toFixed(4);
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
      this.lastActive = active;
    }
  }
}
