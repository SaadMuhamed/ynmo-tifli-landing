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
/** representative card per row anchor (§4.2) — its measured centre stands in for the row line */
const ROW_ANCHOR_KEY: Record<BentoRow, BentoKey> = { r1: 'c1', r2: 'c4', r3: 'c8' };

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

  private readonly elRef: ElementRef<HTMLElement> = inject(ElementRef);

  private section: HTMLElement | null = null;
  private cards: RuntimeCard[] = [];
  private rowAnchorY: Record<BentoRow, number> = { r1: 0, r2: 0, r3: 0 };
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
    this.narrow = window.matchMedia(NARROW_QUERY).matches;
    const rect = this.section.getBoundingClientRect();
    this.stageScale = Math.min(1, rect.width / STAGE_WIDTH);

    (Object.keys(ROW_ANCHOR_KEY) as BentoRow[]).forEach((row) => {
      const anchorEl = this.cards.find((c) => c.key === ROW_ANCHOR_KEY[row])?.el;
      if (!anchorEl) return;
      const r = anchorEl.getBoundingClientRect();
      this.rowAnchorY[row] = r.top + window.scrollY + r.height / 2;
    });
  }

  private readonly onScroll = (): void => {
    this.dirty = true;
  };

  private readonly onResize = (): void => {
    this.dirty = true;
  };

  private readonly onMotionPrefChange = (e: MediaQueryListEvent): void => {
    this.reducedMotion = e.matches;
    if (this.reducedMotion) {
      cancelAnimationFrame(this.rafHandle);
      for (const card of this.cards) this.applyRest(card.el);
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
    this.applyRest(cardEl);
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

    for (const card of this.cards) {
      if (this.forcedRest.has(card.key)) continue;

      const cfg: BentoCardConfig = table[card.key];
      const el = card.el;
      const anchorY = this.rowAnchorY[cfg.row];
      const q = (scrollY + vh - anchorY) / vh;
      const p = clamp((q - cfg.delay) / duration, 0, 1);

      if (p <= 0) {
        el.style.visibility = 'hidden';
        el.style.opacity = '0';
        continue;
      }

      const pose = sampleTrack(cfg.track, p);
      el.style.visibility = 'visible';
      el.style.transform = `translate3d(${(pose.dx * this.stageScale).toFixed(2)}px, ${(pose.dy * this.stageScale).toFixed(2)}px, 0) scale(${pose.s.toFixed(4)})`;
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
  }

  private applyRest(el: HTMLElement): void {
    el.style.visibility = 'visible';
    el.style.opacity = '1';
    el.style.transform = 'none';
    el.style.zIndex = '';
    el.style.willChange = '';
    delete el.dataset['inFlight'];
  }
}
