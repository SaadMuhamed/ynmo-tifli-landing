import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TESTIMONIALS } from '../../content/ar';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  selector: 'app-testimonials',
  styleUrl: './testimonials.scss',
  templateUrl: './testimonials.html',
})
export class Testimonials {
  protected readonly content = TESTIMONIALS;
  protected readonly stars = [0, 1, 2, 3, 4];
}
