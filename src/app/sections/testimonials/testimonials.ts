import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TESTIMONIALS } from '../../content/ar';
import { ScrollRevealDirective } from '../../core/scroll-reveal.directive';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ScrollRevealDirective],
  selector: 'app-testimonials',
  styleUrl: './testimonials.scss',
  templateUrl: './testimonials.html',
})
export class Testimonials {
  protected readonly content = TESTIMONIALS;
  protected readonly stars = [0, 1, 2, 3, 4];
}
