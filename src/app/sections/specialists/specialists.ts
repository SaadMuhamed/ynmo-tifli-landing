import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { SPECIALISTS, UI } from '../../content/ar';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  selector: 'app-specialists',
  styleUrl: './specialists.scss',
  templateUrl: './specialists.html',
})
export class Specialists {
  protected readonly specialists = SPECIALISTS;
  protected readonly ui = UI;

  protected readonly dots = SPECIALISTS.practitioners.map((_, i) => i);
  protected readonly activeDotIndex = signal(0);

  /** Same dot-index the rail-nav dots key off, reused so the prev/next
   * arrows go disabled in lockstep with the dots instead of drifting out
   * of sync with a separately-computed scroll threshold. */
  protected readonly atStart = computed(() => this.activeDotIndex() === 0);
  protected readonly atEnd = computed(() => this.activeDotIndex() === this.dots.length - 1);

  /** Maps rail scroll progress onto the dots — RTL scrollLeft runs 0 → -max
   * as the (visually right-to-left) rail advances, per the modern browser
   * convention, so |scrollLeft| / max is the fraction scrolled either way. */
  protected onRailScroll(rail: HTMLUListElement): void {
    const max = rail.scrollWidth - rail.clientWidth;
    const progress = max > 0 ? Math.abs(rail.scrollLeft) / max : 0;
    const index = Math.round(progress * (this.dots.length - 1));
    this.activeDotIndex.set(index);
  }
}
