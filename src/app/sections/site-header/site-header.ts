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
import { HEADER } from '../../content/ar';

/** Scroll distance before the floating header collapses into a compact top bar. */
const SCROLL_COLLAPSE_THRESHOLD = 40;

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  selector: 'app-site-header',
  styleUrl: './site-header.scss',
  templateUrl: './site-header.html',
})
export class SiteHeader implements OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);

  protected readonly header = HEADER;
  protected readonly scrolled = signal(false);
  protected readonly drawerOpen = signal(false);

  private onScroll = () => this.scrolled.set(window.scrollY > SCROLL_COLLAPSE_THRESHOLD);

  constructor() {
    afterNextRender(() => {
      if (!isPlatformBrowser(this.platformId)) return;
      window.addEventListener('scroll', this.onScroll, { passive: true });
      this.onScroll();
    });
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.removeEventListener('scroll', this.onScroll);
    }
  }

  protected toggleDrawer(): void {
    this.drawerOpen.update((open) => !open);
  }

  protected closeDrawer(): void {
    this.drawerOpen.set(false);
  }
}
