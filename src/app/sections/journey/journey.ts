import { ChangeDetectionStrategy, Component } from '@angular/core';
import { JOURNEY } from '../../content/ar';
import { ScrollRevealDirective } from '../../core/scroll-reveal.directive';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ScrollRevealDirective],
  selector: 'app-journey',
  styleUrl: './journey.scss',
  templateUrl: './journey.html',
})
export class Journey {
  protected readonly journey = JOURNEY;
}
