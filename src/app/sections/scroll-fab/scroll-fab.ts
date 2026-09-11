import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  PLATFORM_ID,
  afterNextRender,
  inject,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { SCROLL_FAB } from '../../content/ar';

type ScrollFabMode = 'hidden' | 'skip' | 'ctas';

/** Clears the floating header, matching MIN_STICKY_TOP in
 * features-carousel.ts — the target this FAB's own skip button scrolls to.
 * Desktop only: below 1024 the header sits much closer to the top
 * (site-header.scss) — skipFeatures() measures the real header there
 * instead, same fix as features-carousel.ts' own stickyTopOffset and for
 * the same reason (this fixed value left a large gap under the header on
 * narrow). */
const HEADER_CLEARANCE = 162;
const HEADER_SELECTOR = 'app-site-header';
const NARROW_QUERY = '(max-width: 1023px)';
const NARROW_HEADER_BREATHING_ROOM = 16;

/**
 * Global bottom-center FAB (nodes 1534:34879 / 1542:34979). One fixed anchor,
 * two possible contents cross-fading in place:
 *  - 'skip'  — while the pinned features carousel (.fcar) is in view, lets a
 *    reader jump straight past its whole scroll-jacked stretch.
 *  - 'ctas'  — HERO's own two CTAs, resurfaced everywhere else in the
 *    middle of the page once a reader has scrolled them out of view.
 *  - 'hidden' — while hero's own two buttons (.hero__ctas) are still in view
 *    (this FAB exists to resurface them, so it has nothing to add there yet)
 *    or inside the footer (which has its own CTA block).
 *
 * Reads three other elements' DOM directly (.hero__ctas, .fcar__sticky,
 * #site-footer) via IntersectionObserver — the same "measure via plain DOM
 * queries and observers" idiom features-carousel.ts already uses for its own
 * driver, just aimed across component boundaries instead of within one.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  selector: 'app-scroll-fab',
  styleUrl: './scroll-fab.scss',
  templateUrl: './scroll-fab.html',
})
export class ScrollFab implements OnDestroy {
  protected readonly content = SCROLL_FAB;
  protected readonly mode = signal<ScrollFabMode>('hidden');

  private readonly platformId = inject(PLATFORM_ID);
  private readonly browser = isPlatformBrowser(this.platformId);

  private heroCtasVisible = false;
  private footerVisible = false;

  /** .hero__ctas / #site-footer suppression — see the top-shrink rootMargin
   * on hero in init() for why this isn't a bare edge test either. */
  private edgeObserver?: IntersectionObserver;
  /** .fcar__sticky (the pinned CONTENT box, not the tall scroll-jack .fcar
   * section) — see init() for the top-shrink rootMargin this uses for the
   * same reason hero's own observer does. Below 1024, .fcar__sticky is
   * `display: contents` (features-carousel.scss' mobile rebuild — the
   * headline is deliberately excluded from what's pinned there, so
   * .fcar__sticky no longer generates a box at all), so it can never
   * intersect anything on that breakpoint; .fcar__body is the equivalent
   * on-screen pinned box there instead. Both are observed and OR'd in
   * recompute() — on any given breakpoint only one of them has a real box
   * to begin with, so the other's callback simply never fires. */
  private featuresObserver?: IntersectionObserver;
  private featuresStickyVisible = false;
  private featuresBodyVisible = false;

  constructor() {
    // Mirrors features-carousel.ts' own driver: afterNextRender fires before
    // a later hydration-mismatch reconciliation pass would otherwise discard
    // and recreate the sections this reads, silently dropping the observers
    // set up against the stale nodes.
    if (this.browser) afterNextRender(() => setTimeout(() => this.init(), 1000));
  }

  ngOnDestroy(): void {
    this.edgeObserver?.disconnect();
    this.featuresObserver?.disconnect();
  }

  private init(): void {
    // .hero__ctas, not #hero — hero itself keeps filling the viewport well
    // after its own two buttons have scrolled away (the illustration/stats
    // band underneath them is still hero content), so gating on the whole
    // section left the FAB hidden through that entire stretch even though
    // the reader had clearly moved past the buttons it exists to resurface.
    // Once THOSE are gone, showing the FAB's copy is no longer redundant.
    const heroCtas = document.querySelector('.hero__ctas');
    const footer = document.getElementById('site-footer');
    // .fcar__sticky, not .fcar — .fcar's own box includes the scroll-jack
    // buffer needed to drive the pin, which is much taller than the content
    // actually on screen. .fcar__sticky IS the on-screen content: pinned in
    // place for the whole scroll-jacked stretch, then released and scrolled
    // away with no trailing dead space, so its intersection tracks what a
    // reader actually sees far more precisely. Below 1024 it's `display:
    // contents` instead (features-carousel.scss) and generates no box at
    // all — .fcar__body is the equivalent on-screen pinned box there (see
    // the featuresObserver field's own doc comment).
    const featuresSticky = document.querySelector('.fcar__sticky');
    const featuresBody = document.querySelector('.fcar__body');

    this.edgeObserver = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === heroCtas) this.heroCtasVisible = entry.isIntersecting;
        else if (entry.target === footer) this.footerVisible = entry.isIntersecting;
      }
      this.recompute();
    });
    if (heroCtas) this.edgeObserver.observe(heroCtas);
    if (footer) this.edgeObserver.observe(footer);

    this.featuresObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.target === featuresSticky) this.featuresStickyVisible = entry.isIntersecting;
          else if (entry.target === featuresBody) this.featuresBodyVisible = entry.isIntersecting;
        }
        this.recompute();
      },
      // The pinned box enters once (rising from below into journey→
      // features) then stays put — same screen rect — for the whole multi-
      // viewport scroll-jacked stretch, so this only actually re-fires once
      // per target, at RELEASE: the pin lets go and the now-static element
      // scrolls away through the TOP like any normal-flow content (same as
      // hero). A bare "any pixel still overlapping" test stayed true well
      // after release, while only a sliver still poked above the
      // viewport's top edge — same top-shrink fix as hero's own observer,
      // same reasoning.
      { rootMargin: '-20% 0px 0px 0px' },
    );
    if (featuresSticky) this.featuresObserver.observe(featuresSticky);
    if (featuresBody) this.featuresObserver.observe(featuresBody);
  }

  private recompute(): void {
    if (this.heroCtasVisible || this.footerVisible) {
      this.mode.set('hidden');
      return;
    }
    this.mode.set(this.featuresStickyVisible || this.featuresBodyVisible ? 'skip' : 'ctas');
  }

  /** Same one-off smooth scrollTo features-carousel.ts' own skipToNext()
   * used — global `scroll-behavior: smooth` stays off everywhere (it would
   * desync that section's scroll-position-driven timeline, see _base.scss),
   * so every jump-to-section action opts in explicitly like this instead. */
  protected skipFeatures(): void {
    if (!this.browser) return;
    const next = document.getElementById('specialists');
    if (!next) return;
    const narrow = window.matchMedia(NARROW_QUERY).matches;
    const clearance = narrow ? this.narrowHeaderClearance() : HEADER_CLEARANCE;
    const top = next.getBoundingClientRect().top + window.scrollY - clearance;
    window.scrollTo({ top, behavior: 'smooth' });
  }

  /** app-site-header is position: fixed, so its rect is already viewport-
   * relative — safe to read once here rather than caching it, since this
   * only runs on an explicit tap, not per frame. */
  private narrowHeaderClearance(): number {
    const header = document.querySelector(HEADER_SELECTOR);
    const headerBottom = header ? header.getBoundingClientRect().bottom : HEADER_CLEARANCE;
    return Math.max(headerBottom + NARROW_HEADER_BREATHING_ROOM, 0);
  }
}
