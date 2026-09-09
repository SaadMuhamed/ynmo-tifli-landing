import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HERO } from '../../content/ar';
import { ScrollRevealDirective } from '../../core/scroll-reveal.directive';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ScrollRevealDirective],
  selector: 'app-hero',
  styleUrl: './hero.scss',
  templateUrl: './hero.html',
})
export class Hero {
  protected readonly hero = HERO;
}
