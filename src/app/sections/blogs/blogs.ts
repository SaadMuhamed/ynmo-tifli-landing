import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { BLOGS, UI } from '../../content/ar';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  selector: 'app-blogs',
  styleUrl: './blogs.scss',
  templateUrl: './blogs.html',
})
export class Blogs {
  protected readonly content = BLOGS;
  protected readonly ui = UI;

  protected readonly dots = this.content.posts.map((_, i) => i);
  protected readonly activeDotIndex = signal(0);

  /** RTL scrollLeft runs 0 → -max as the rail advances (modern browser
   * convention), so |scrollLeft| / max is the fraction scrolled either way. */
  protected onRailScroll(rail: HTMLUListElement): void {
    const max = rail.scrollWidth - rail.clientWidth;
    const progress = max > 0 ? Math.abs(rail.scrollLeft) / max : 0;
    const index = Math.round(progress * (this.dots.length - 1));
    this.activeDotIndex.set(index);
  }
}
