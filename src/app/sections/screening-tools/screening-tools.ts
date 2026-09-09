import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SCREENING_TOOLS } from '../../content/ar';
import { ScrollRevealDirective } from '../../core/scroll-reveal.directive';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ScrollRevealDirective],
  selector: 'app-screening-tools',
  styleUrl: './screening-tools.scss',
  templateUrl: './screening-tools.html',
})
export class ScreeningTools {
  protected readonly content = SCREENING_TOOLS;
}
