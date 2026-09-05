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

  protected readonly dots = SPECIALISTS.practitioners.map((_, i) => i);
  protected readonly activeDotIndex = signal(0);
  protected readonly atStart = signal(true);
  protected readonly atEnd = signal(false);

  /** Maps rail scroll progress onto the dots — RTL scrollLeft runs 0 → -max
   * as the (visually right-to-left) rail advances, per the modern browser
   * convention, so |scrollLeft| / max is the fraction scrolled either way. */
  protected onRailScroll(rail: HTMLUListElement): void {
    const max = rail.scrollWidth - rail.clientWidth;
    const offset = Math.abs(rail.scrollLeft);
    const progress = max > 0 ? offset / max : 0;
    const index = Math.round(progress * (this.dots.length - 1));
    this.activeDotIndex.set(index);
    this.atStart.set(offset <= 1);
    this.atEnd.set(max <= 1 || max - offset <= 1);
  }

  protected scrollRail(rail: HTMLUListElement, direction: 1 | -1): void {
    const card = rail.querySelector<HTMLElement>('.practitioner-card');
    const distance = card?.getBoundingClientRect().width ?? 381.33;
    rail.scrollBy({ left: direction * distance, behavior: 'smooth' });
  }
}
