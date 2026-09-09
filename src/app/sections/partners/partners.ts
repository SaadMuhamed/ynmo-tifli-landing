import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PARTNERS, UI } from '../../content/ar';
import { ScrollRevealDirective } from '../../core/scroll-reveal.directive';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ScrollRevealDirective],
  selector: 'app-partners',
  styleUrl: './partners.scss',
  templateUrl: './partners.html',
})
export class Partners {
  protected readonly content = PARTNERS;
  protected readonly ui = UI;
}
