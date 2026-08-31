import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  selector: 'app-specialists',
  styleUrl: './specialists.scss',
  templateUrl: './specialists.html',
})
export class Specialists {}
