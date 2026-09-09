import { ChangeDetectionStrategy, Component } from '@angular/core';
import { WHY_US } from '../../content/ar';
import { ScrollRevealDirective } from '../../core/scroll-reveal.directive';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ScrollRevealDirective],
  selector: 'app-why-us',
  styleUrl: './why-us.scss',
  templateUrl: './why-us.html',
})
export class WhyUs {
  protected readonly content = WHY_US;
}
