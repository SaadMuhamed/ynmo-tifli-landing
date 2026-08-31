import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  selector: 'app-partners',
  styleUrl: './partners.scss',
  templateUrl: './partners.html',
})
export class Partners {}
