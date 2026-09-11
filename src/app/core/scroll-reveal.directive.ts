import { Directive, ElementRef, OnDestroy, PLATFORM_ID, afterNextRender, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * Toggles `.scroll-reveal--visible` on the host as it enters/exits the
 * viewport — unlike a load-time animation this re-fires every time,
 * so consumers get a fade in on scroll down and fade out on scroll up.
 */
@Directive({
  selector: '[appScrollReveal]',
  standalone: true,
  host: { class: 'scroll-reveal' },
})
export class ScrollRevealDirective implements OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly el = inject(ElementRef<HTMLElement>);
  private observer?: IntersectionObserver;
  private setupTimer?: ReturnType<typeof setTimeout>;

  constructor() {
    // Mirrors features-carousel.ts' / scroll-fab.ts' own drivers: afterNextRender
    // fires *before* a later hydration-mismatch reconciliation pass finishes
    // discarding and recreating some sections' DOM, silently orphaning an
    // observer set up against the stale, soon-to-be-replaced node — the
    // element that actually ends up on screen never gets one at all, so it
    // just sits at whatever its CSS default is (visible, in every consumer's
    // case) with no reveal ever playing (explicit report: specialists' own
    // collage/text/cards never animate in, unlike the rest of the page).
    // The delay is imperceptible — every current consumer of this directive
    // sits well below the fold.
    afterNextRender(() => {
      if (!isPlatformBrowser(this.platformId)) return;
      this.setupTimer = setTimeout(() => {
        this.observer = new IntersectionObserver(
          ([entry]) => {
            this.el.nativeElement.classList.toggle('scroll-reveal--visible', entry.isIntersecting);
          },
          { threshold: 0.2, rootMargin: '0px 0px -10% 0px' },
        );
        this.observer.observe(this.el.nativeElement);
      }, 1000);
    });
  }

  ngOnDestroy(): void {
    clearTimeout(this.setupTimer);
    this.observer?.disconnect();
  }
}
