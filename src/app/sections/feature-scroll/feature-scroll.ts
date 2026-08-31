import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  PLATFORM_ID,
  afterNextRender,
  inject,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FEATURES, FEATURES_HEADLINE, FEATURES_UI } from '../../content/features.data';
import { DriverDom, N, ScrollDriver } from '../../core/scroll-driver';

/** Figma "Vector 57": the 50×50 rounded-square ring, drawn clockwise from top-centre. */
const RING_D =
  'M26.2475 1H38C45.1797 1 51 6.8203 51 14V38C51 45.1797 45.1797 51 38 51H14C6.8203 51 1 45.1797 1 38V14C1 6.8203 6.8203 1 14 1H27';

const MOBILE_BREAKPOINT = '(min-width: 1024px)';
const MOBILE_AUTOADVANCE_MS = 4500;

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  selector: 'app-feature-scroll',
  styleUrl: './feature-scroll.scss',
  templateUrl: './feature-scroll.html',
})
export class FeatureScroll implements OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly zone = inject(NgZone);
  private readonly host = inject(ElementRef<HTMLElement>);

  protected readonly features = FEATURES;
  protected readonly headline = FEATURES_HEADLINE;
  protected readonly ui = FEATURES_UI;
  protected readonly ringD = RING_D;
  protected readonly n = N;

  /** Mobile/tablet fallback state (<1024px) — plain Angular signals, low frequency. */
  protected readonly mobileActiveIndex = signal(0);
  protected readonly reducedMotion = signal(false);

  private driver: ScrollDriver | null = null;
  private mediaQuery: MediaQueryList | null = null;
  private mediaQueryHandler: ((e: MediaQueryListEvent) => void) | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private windowResizeHandler: (() => void) | null = null;
  private mobileTimer: ReturnType<typeof setInterval> | null = null;
  private mobileIntersectionObserver: IntersectionObserver | null = null;
  private mobileInteracted = false;
  private touchStartX = 0;
  private desktopActive = false;

  constructor() {
    afterNextRender(() => {
      if (!isPlatformBrowser(this.platformId)) return;
      this.zone.runOutsideAngular(() => this.initBrowser());
    });
  }

  ngOnDestroy(): void {
    this.driver?.stop();
    if (this.mediaQuery && this.mediaQueryHandler) {
      this.mediaQuery.removeEventListener('change', this.mediaQueryHandler);
    }
    this.resizeObserver?.disconnect();
    this.mobileIntersectionObserver?.disconnect();
    if (this.mobileTimer !== null) clearInterval(this.mobileTimer);
    if (this.windowResizeHandler) {
      window.removeEventListener('resize', this.windowResizeHandler);
    }
  }

  private initBrowser(): void {
    const root: HTMLElement = this.host.nativeElement;
    const track: HTMLElement | null = root.querySelector('.feature-scroll');
    const design: HTMLElement | null = root.querySelector('.design');
    const flipper: HTMLElement | null = root.querySelector('.flipper');
    const ground: HTMLElement | null = root.querySelector('.ground');
    const faceA: HTMLImageElement | null = root.querySelector('.face--a img');
    const faceB: HTMLImageElement | null = root.querySelector('.face--b img');
    const heads: HTMLElement[] = Array.from(root.querySelectorAll('.head'));
    const chipEls: HTMLElement[] = Array.from(root.querySelectorAll('.chip'));

    if (!track || !design || !flipper || !ground || !faceA || !faceB || heads.length !== N || chipEls.length !== N) {
      return; // defensive: template didn't render as expected, skip rather than throw
    }

    const chips: DriverDom['chips'] = chipEls.map((el: HTMLElement) => {
      const ringSvg = el.querySelector('.ring') as SVGSVGElement;
      const ring = el.querySelector('.ring path') as SVGPathElement;
      return { el, ringSvg, ring };
    });

    const dom: DriverDom = { track, design, flipper, ground, faces: [faceA, faceB], heads, chips };
    this.reducedMotion.set(window.matchMedia('(prefers-reduced-motion: reduce)').matches);

    this.driver = new ScrollDriver(window, dom, {
      scenes: this.features,
      reducedMotion: this.reducedMotion(),
    });

    // Boot: heads at their resting opacity with no transition, faces 0/1 primed.
    heads.forEach((el, i) => {
      el.style.transition = 'none';
      el.style.opacity = i === 0 ? '1' : '0';
    });
    this.driver.primeFaces();

    this.mediaQuery = window.matchMedia(MOBILE_BREAKPOINT);
    this.mediaQueryHandler = (e) => this.applyMode(e.matches);
    this.mediaQuery.addEventListener('change', this.mediaQueryHandler);
    this.applyMode(this.mediaQuery.matches);

    if (this.reducedMotion()) {
      // Reduced motion gets the same non-scroll-jacking fallback as mobile,
      // regardless of viewport width — no 3D flip, no scroll pin (§8.8).
      this.applyMode(false);
    }

    this.resizeObserver = new ResizeObserver(() => {
      if (this.desktopActive) this.driver?.layout();
    });
    this.resizeObserver.observe(design);

    this.windowResizeHandler = () => {
      if (this.desktopActive) this.driver?.layout();
    };
    window.addEventListener('resize', this.windowResizeHandler);

    if (document.fonts?.ready) {
      document.fonts.ready.then(() => {
        if (this.desktopActive) this.driver?.layout();
      });
    }
  }

  private applyMode(isDesktop: boolean): void {
    if (isDesktop) {
      this.desktopActive = true;
      this.stopMobile();
      this.driver?.layout();
      this.driver?.start();
    } else {
      this.desktopActive = false;
      this.driver?.stop();
      const track: HTMLElement | null = this.host.nativeElement.querySelector('.feature-scroll');
      if (track) track.style.height = 'auto';
      this.startMobile();
    }
  }

  private startMobile(): void {
    if (this.reducedMotion()) return; // no auto-advance under reduced motion
    const section: HTMLElement | null = this.host.nativeElement.querySelector('.feature-scroll');
    if (!section) return;
    this.mobileIntersectionObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries[0]?.isIntersecting ?? false;
        if (visible && !this.mobileInteracted) {
          this.scheduleMobileAdvance();
        } else {
          this.clearMobileTimer();
        }
      },
      { threshold: 0.6 },
    );
    this.mobileIntersectionObserver.observe(section);
  }

  private stopMobile(): void {
    this.mobileIntersectionObserver?.disconnect();
    this.mobileIntersectionObserver = null;
    this.clearMobileTimer();
  }

  private clearMobileTimer(): void {
    if (this.mobileTimer !== null) {
      clearInterval(this.mobileTimer);
      this.mobileTimer = null;
    }
  }

  private scheduleMobileAdvance(): void {
    this.clearMobileTimer();
    this.mobileTimer = setInterval(() => {
      this.zone.run(() => {
        this.mobileActiveIndex.update((i) => (i + 1) % N);
      });
    }, MOBILE_AUTOADVANCE_MS);
  }

  private markMobileInteracted(): void {
    if (this.mobileInteracted) return;
    this.mobileInteracted = true;
    this.clearMobileTimer();
  }

  protected onMobileChipClick(i: number): void {
    this.markMobileInteracted();
    this.mobileActiveIndex.set(i);
  }

  protected onMobileTouchStart(e: TouchEvent): void {
    this.touchStartX = e.touches[0]?.clientX ?? 0;
  }

  protected onMobileTouchEnd(e: TouchEvent): void {
    const endX = e.changedTouches[0]?.clientX ?? this.touchStartX;
    const delta = endX - this.touchStartX;
    if (Math.abs(delta) < 40) return;
    this.markMobileInteracted();
    // RTL: a swipe toward the start (right, positive delta) goes to the previous scene.
    const direction = delta > 0 ? -1 : 1;
    this.mobileActiveIndex.update((i) => (i + direction + N) % N);
  }

  protected onRailChipClick(i: number): void {
    this.driver?.scrollToScene(i);
  }
}
