import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  selector: 'app-screening-tools',
  styleUrl: './screening-tools.scss',
  templateUrl: './screening-tools.html',
})
export class ScreeningTools {}
