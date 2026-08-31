import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  selector: 'app-feature-scroll',
  styleUrl: './feature-scroll.scss',
  templateUrl: './feature-scroll.html',
})
export class FeatureScroll {}
