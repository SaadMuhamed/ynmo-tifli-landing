import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PARTNERS } from '../../content/ar';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  selector: 'app-partners',
  styleUrl: './partners.scss',
  templateUrl: './partners.html',
})
export class Partners {
  protected readonly content = PARTNERS;
}
