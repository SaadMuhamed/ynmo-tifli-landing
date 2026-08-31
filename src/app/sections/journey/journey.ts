import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  selector: 'app-journey',
  styleUrl: './journey.scss',
  templateUrl: './journey.html',
})
export class Journey {}
