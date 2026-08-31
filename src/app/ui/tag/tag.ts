import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  selector: 'app-tag',
  styleUrl: './tag.scss',
  templateUrl: './tag.html',
})
export class Tag {}
