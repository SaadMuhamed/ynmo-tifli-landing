import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SCREENING_TOOLS } from '../../content/ar';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  selector: 'app-screening-tools',
  styleUrl: './screening-tools.scss',
  templateUrl: './screening-tools.html',
})
export class ScreeningTools {
  protected readonly content = SCREENING_TOOLS;
}
