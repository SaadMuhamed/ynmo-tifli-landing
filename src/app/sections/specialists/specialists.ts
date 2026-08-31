import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
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

  protected readonly dots = [0, 1, 2];
  protected readonly activeDotIndex = signal(0);

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
