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

  constructor() {
    afterNextRender(() => {
      if (!isPlatformBrowser(this.platformId)) return;
      this.observer = new IntersectionObserver(
        ([entry]) => {
          this.el.nativeElement.classList.toggle('scroll-reveal--visible', entry.isIntersecting);
        },
        { threshold: 0.2, rootMargin: '0px 0px -10% 0px' },
      );
      this.observer.observe(this.el.nativeElement);
    });
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
