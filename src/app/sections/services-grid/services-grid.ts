import { ChangeDetectionStrategy, Component, ElementRef, OnDestroy, afterNextRender, inject } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { SERVICES, SERVICES_HEADLINE, type ServiceCard } from '../../content/services.data';
import {
  BENTO_CONFIG,
  BENTO_CONFIG_REDUCED,
  DURATION,
  DURATION_REDUCED,
  clamp,
  easeOutQuad,
  sampleTrack,
  type BentoCardConfig,
  type BentoKey,
  type BentoRow,
} from './bento.animation';

/** Bento assembly-scroll animation — see YNMO-TIFLI-FEATURES-BENTO-ANIMATION.md §5.
 * Progressive enhancement: the template above already renders every card at
 * rest (full opacity, no transform), so SSR / no-JS / reduced-motion readers
 * see the finished bento with zero extra code. This driver only runs in the
 * browser and only when motion is allowed. */
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
const NARROW_QUERY = '(max-width: 1023px)';
const STAGE_WIDTH = 1440;
/** representative card per row anchor (§4.2), used by the narrow/mobile
 * fallback only — its measured centre stands in for the row line. */
const ROW_ANCHOR_KEY: Record<BentoRow, BentoKey> = { r1: 'c1', r2: 'c4', r3: 'c8' };

/** Desktop pin: the section is captured for this many viewport-heights of
 * scroll per row (3 rows, in sequence) before releasing, so a reader keeps
 * scrolling through the assembly instead of it playing out passively in
 * normal flow. Forbidden on touch (§9 of the build plan) — narrow viewports
 * use the plain per-card fallback below instead. */
const EXTRA_VH_PER_ROW = 1;
const ROW_INDEX: Record<BentoRow, number> = { r1: 0, r2: 1, r3: 2 };
const ROW_COUNT = 3;
/** Minimum sticky offset for the whole pinned stage — clears the floating
 * header (48px gap + ~90px bar) plus a little breathing room. The
 * headline always sits here; only the porthole below it (.services__stack)
 * shifts further down to center itself in whatever viewport height
 * remains (see setupPin). */
const MIN_STICKY_TOP = 162;
/** Headline-to-porthole gap while pinned (the static 72px design gap,
 * §3.1, reads as dead space here) — must match the SCSS `gap` on
 * `.services__pin-stage.is-pinned`. */
const PINNED_HEADLINE_GAP = 24;
/** Porthole headroom above/below one row's own height. Small at the top —
 * that's the mask's fade zone, and a receding row is meant to visibly
 * clip there. Generous at the bottom so an entering row's own
 * downward-displaced start pose isn't cut off. */
const OVERSHOOT_TOP = 50;
const OVERSHOOT_BOTTOM = 150;

/** offsetTop walked up the offsetParent chain — transform-immune, unlike
 * getBoundingClientRect(), so it can't be corrupted by reading it while the
 * element already has an in-flight animation transform applied. */
function pageOffsetTop(el: HTMLElement): number {
  let y = 0;
  let node: HTMLElement | null = el;
  while (node) {
    y += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return y;
}

interface RuntimeCard {
  key: BentoKey;
  el: HTMLElement;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet],
  selector: 'app-services-grid',
  styleUrl: './services-grid.scss',
  templateUrl: './services-grid.html',
})
export class ServicesGrid implements OnDestroy {
  protected readonly headline = SERVICES_HEADLINE;

  private readonly byId = new Map(SERVICES.map((s) => [s.id, s]));

  private get(id: string): ServiceCard {
    const card = this.byId.get(id);
    if (!card) throw new Error(`Unknown service card id: ${id}`);
    return card;
  }

  protected readonly growthAssessment = this.get('growth-assessment');
  protected readonly shadowTeacher = this.get('shadow-teacher');
  protected readonly hearingTest = this.get('hearing-test');
  protected readonly comprehensiveDiagnosis = this.get('comprehensive-diagnosis');
  protected readonly therapyPrograms = this.get('therapy-programs');
  protected readonly remoteSpecialist = this.get('remote-specialist');
  protected readonly doctorConsultation = this.get('doctor-consultation');
  protected readonly nurseryPicker = this.get('nursery-picker');
  protected readonly daycareCenters = this.get('daycare-centers');

  /** `[ngTemplateOutletContext]="{ $implicit: x }"` builds a new object
   * literal every change-detection run; NgTemplateOutlet compares that
   * context by reference and, seeing a "new" one, tears down and rebuilds
   * the embedded view — destroying and recreating every card's DOM even
   * though the underlying data never changed. That silently orphans the
   * animation driver's cached element references. Cache one stable context
   * object per value instead. */
  private readonly ctxCache = new Map<unknown, { $implicit: unknown }>();
  protected ctx<T>(value: T): { $implicit: T } {
    let entry = this.ctxCache.get(value);
    if (!entry) {
      entry = { $implicit: value };
      this.ctxCache.set(value, entry);
    }
    return entry as { $implicit: T };
  }

  private readonly elRef: ElementRef<HTMLElement> = inject(ElementRef);

  private section: HTMLElement | null = null;
  private track: HTMLElement | null = null;
  private stage: HTMLElement | null = null;
  private stack: HTMLElement | null = null;
  private rows: HTMLElement | null = null;
  private cards: RuntimeCard[] = [];
  /** px (incl. row gap) that row 1 and row 2 each recede by once the next
   * row starts entering — see render()'s groupOffsetY. */
  private rowShiftPx: [number, number] = [0, 0];
  private rowAnchorY: Record<BentoRow, number> = { r1: 0, r2: 0, r3: 0 };
  private trackTop = 0;
  private extraScrollPx = 0;
  private stageScale = 1;
  private narrow = false;
  private reducedMotion = false;
  private rafHandle = 0;
  private lastScrollY = -1;
  private dirty = true;
  private readonly forcedRest = new Set<BentoKey>();
  private resizeObserver?: ResizeObserver;
  private mqReduced?: MediaQueryList;

  constructor() {
    afterNextRender(() => this.init());
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.rafHandle);
    window.removeEventListener('scroll', this.onScroll);
    window.removeEventListener('resize', this.onResize);
    this.section?.removeEventListener('focusin', this.onFocusIn);
    this.resizeObserver?.disconnect();
    this.mqReduced?.removeEventListener('change', this.onMotionPrefChange);
  }

  private init(): void {
    this.mqReduced = window.matchMedia(REDUCED_MOTION_QUERY);
    this.reducedMotion = this.mqReduced.matches;
    this.mqReduced.addEventListener('change', this.onMotionPrefChange);
    if (this.reducedMotion) return; // static rest markup stands as-is

    const section = this.elRef.nativeElement.querySelector('.services') as HTMLElement | null;
    if (!section) return;
    this.section = section;
    this.track = section.querySelector('.services__pin-track') as HTMLElement | null;
    this.stage = section.querySelector('.services__pin-stage') as HTMLElement | null;
    this.stack = section.querySelector('.services__stack') as HTMLElement | null;
    this.rows = section.querySelector('.services__rows') as HTMLElement | null;

    this.cards = Array.from(section.querySelectorAll('[data-bento-key]'))
      .map((node) => {
        const el = node as HTMLElement;
        return { key: el.dataset['bentoKey'] as BentoKey, el };
      })
      .filter((c) => !!BENTO_CONFIG[c.key]);

    for (const card of this.cards) {
      if (BENTO_CONFIG[card.key].originY === 'top') {
        card.el.style.transformOrigin = '50% 0%';
      }
    }

    this.measure();

    this.resizeObserver = new ResizeObserver(() => {
      this.dirty = true;
      this.measure();
    });
    this.resizeObserver.observe(section);

    window.addEventListener('scroll', this.onScroll, { passive: true });
    window.addEventListener('resize', this.onResize, { passive: true });
    section.addEventListener('focusin', this.onFocusIn);

    this.rafHandle = requestAnimationFrame(this.frame);
  }

  /** Cached geometry only — never read inside the rAF loop (§5, hard rule). */
  private measure(): void {
    if (!this.section) return;
    const rect = this.section.getBoundingClientRect();
    // A ResizeObserver can fire mid-transition (e.g. a hidden tab, or a
    // browser-chrome animation resizing the viewport) with a momentary
    // zero/invalid box. Keep the last good measurement rather than
    // corrupting every anchor with it.
    if (rect.width <= 0) return;

    this.narrow = window.matchMedia(NARROW_QUERY).matches;
    this.stageScale = Math.min(1, rect.width / STAGE_WIDTH);

    if (this.narrow) {
      this.teardownPin();
      (Object.keys(ROW_ANCHOR_KEY) as BentoRow[]).forEach((row) => {
        const anchorEl = this.cards.find((c) => c.key === ROW_ANCHOR_KEY[row])?.el;
        if (!anchorEl) return;
        // offsetTop (unlike getBoundingClientRect) ignores the in-flight
        // transform, so a ResizeObserver re-measure mid-animation can't bake
        // a transformed position in as the row's anchor.
        this.rowAnchorY[row] = pageOffsetTop(anchorEl) + anchorEl.offsetHeight / 2;
      });
    } else {
      this.setupPin();
    }
  }

  /** Pins `.services__pin-stage` in place for `extraScrollPx` of scroll by
   * giving its `.services__pin-track` parent that much extra height —
   * releases on its own once the track's bottom passes the sticky point,
   * no scroll-jacking JS required. */
  private setupPin(): void {
    if (!this.track || !this.stage || !this.stack || !this.rows) return;

    const row1 = this.rows.querySelector('[data-bento-row="r1"]') as HTMLElement | null;
    const row2 = this.rows.querySelector('[data-bento-row="r2"]') as HTMLElement | null;
    const row3 = this.rows.querySelector('[data-bento-row="r3"]') as HTMLElement | null;
    const gap = 13;
    this.rowShiftPx = [row1 ? row1.offsetHeight + gap : 0, row2 ? row2.offsetHeight + gap : 0];

    // Only one row is ever visible at a time (the rest recede off-porthole
    // via .services__rows' transform) — size the porthole to the tallest
    // row plus headroom, not the sum of all three rows' heights (that
    // reserved space for content that's never actually shown at once,
    // which is what left a dead gap once the pin released). Asymmetric on
    // purpose: OVERSHOOT_TOP only needs to cover the mask's own fade zone
    // (a receding row is meant to visibly clip there); OVERSHOOT_BOTTOM
    // is generous so an entering row's own downward-displaced start pose
    // isn't cut off.
    const rowH = Math.max(row1?.offsetHeight ?? 0, row2?.offsetHeight ?? 0, row3?.offsetHeight ?? 0);
    this.stack.style.maxHeight = `${rowH + OVERSHOOT_TOP + OVERSHOOT_BOTTOM}px`;
    this.stage.classList.add('is-pinned');
    this.stack.classList.add('is-pinned');
    // Headline stays fixed right below the header; only the porthole
    // shifts down within the remaining viewport to center itself there —
    // centering the whole stage (headline included) moved the headline
    // away from its usual place, which isn't wanted.
    this.stage.style.top = `${MIN_STICKY_TOP}px`;

    const vh = window.innerHeight;
    const headlineEl = this.stage.querySelector('.services__headline') as HTMLElement | null;
    const headlineH = headlineEl?.offsetHeight ?? 0;
    const stackNaturalTop = MIN_STICKY_TOP + headlineH + PINNED_HEADLINE_GAP;
    const stackHeight = this.stack.offsetHeight; // reflects the max-height just set
    const extraMargin = Math.max(0, (vh - stackNaturalTop - stackHeight) / 2);
    this.stack.style.marginTop = `${extraMargin}px`;

    // stage's own intrinsic height is unaffected by position: sticky, but
    // is affected by the stack's new max-height/margin set just above.
    const stageHeight = this.stage.offsetHeight;
    this.extraScrollPx = vh * EXTRA_VH_PER_ROW * ROW_COUNT;
    this.track.style.height = `${stageHeight + this.extraScrollPx}px`;
    this.trackTop = pageOffsetTop(this.track);
  }

  private teardownPin(): void {
    if (!this.track || !this.stage || !this.stack || !this.rows) return;
    this.stage.classList.remove('is-pinned');
    this.stack.classList.remove('is-pinned');
    this.stage.style.top = '';
    this.stack.style.maxHeight = '';
    this.stack.style.marginTop = '';
    this.track.style.height = '';
    this.rows.style.transform = '';
    this.extraScrollPx = 0;
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
    if (this.reducedMotion) {
      cancelAnimationFrame(this.rafHandle);
      for (const card of this.cards) this.applyRest(card.el, card.key);
    } else {
      this.rafHandle = requestAnimationFrame(this.frame);
    }
  };

  private readonly onFocusIn = (e: FocusEvent): void => {
    const target = e.target as HTMLElement | null;
    const cardEl = target?.closest<HTMLElement>('[data-bento-key]');
    const key = cardEl?.dataset['bentoKey'] as BentoKey | undefined;
    if (!key || !cardEl) return;
    this.forcedRest.add(key);
    this.applyRest(cardEl, key);
  };

  private readonly frame = (): void => {
    const scrollY = window.scrollY;
    if (this.dirty || scrollY !== this.lastScrollY) {
      this.render(scrollY);
      this.lastScrollY = scrollY;
      this.dirty = false;
    }
    this.rafHandle = requestAnimationFrame(this.frame);
  };

  private render(scrollY: number): void {
    const vh = window.innerHeight;
    const table = this.narrow ? BENTO_CONFIG_REDUCED : BENTO_CONFIG;
    const duration = this.narrow ? DURATION_REDUCED : DURATION;

    // Desktop: one pinned progress (0→1) split into 3 equal sequential
    // windows, one per row — row 2 doesn't start until row 1's window ends.
    // Narrow: no pin, each row triggers independently as its own anchor
    // line crosses the viewport bottom during normal scroll (§4.2 as built).
    const pinnedProgress =
      !this.narrow && this.extraScrollPx > 0
        ? clamp((scrollY - this.trackTop) / this.extraScrollPx, 0, 1)
        : 0;
    // each row's own 0→1 window within the pin — row 2's is what drives row
    // 1 receding (see groupOffsetY below), row 3's drives row 2 receding.
    const rowProgress: [number, number, number] = [0, 1, 2].map((i) =>
      clamp((pinnedProgress - i / ROW_COUNT) * ROW_COUNT, 0, 1),
    ) as [number, number, number];

    for (const card of this.cards) {
      if (this.forcedRest.has(card.key)) continue;

      const cfg: BentoCardConfig = table[card.key];
      const el = card.el;
      const q = this.narrow
        ? (scrollY + vh - this.rowAnchorY[cfg.row]) / vh
        : rowProgress[ROW_INDEX[cfg.row]];
      const p = clamp((q - cfg.delay) / duration, 0, 1);

      if (p <= 0) {
        el.style.visibility = 'hidden';
        el.style.opacity = '0';
        continue;
      }

      const pose = sampleTrack(cfg.track, p);
      el.style.visibility = 'visible';
      // .svc-card__hub-icon centres itself via a static CSS
      // `translate(-50%, -50%)` — reapply it here or our own translate3d
      // overwrites it and the logo anchors by its top-left corner instead.
      const staticPrefix = card.key === 'logo' ? 'translate(-50%, -50%) ' : '';
      el.style.transform = `${staticPrefix}translate3d(${(pose.dx * this.stageScale).toFixed(2)}px, ${(pose.dy * this.stageScale).toFixed(2)}px, 0) scale(${pose.s.toFixed(4)})`;
      el.style.opacity = easeOutQuad(p).toFixed(4);
      el.style.zIndex = String((p < 1 ? 30 : 10) + cfg.zBump);

      if (p < 1) {
        el.dataset['inFlight'] = 'true';
        el.style.willChange = 'transform, opacity';
      } else {
        delete el.dataset['inFlight'];
        el.style.willChange = '';
      }
    }

    // Row 1 recedes (under the headline's fade mask) as row 2 enters; row 2
    // recedes as row 3 enters. Row 3 never recedes — nothing follows it.
    if (!this.narrow && this.rows) {
      const groupOffsetY =
        -this.rowShiftPx[0] * easeOutQuad(rowProgress[1]) -
        this.rowShiftPx[1] * easeOutQuad(rowProgress[2]);
      this.rows.style.transform = `translate3d(0, ${groupOffsetY.toFixed(2)}px, 0)`;
    }
  }

  private applyRest(el: HTMLElement, key: BentoKey): void {
    el.style.visibility = 'visible';
    el.style.opacity = '1';
    el.style.transform = key === 'logo' ? 'translate(-50%, -50%)' : 'none';
    el.style.zIndex = '';
    el.style.willChange = '';
    delete el.dataset['inFlight'];
  }
}
