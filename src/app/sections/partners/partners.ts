import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PARTNERS, UI } from '../../content/ar';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  selector: 'app-partners',
  styleUrl: './partners.scss',
  templateUrl: './partners.html',
})
export class Partners {
  protected readonly content = PARTNERS;
  protected readonly ui = UI;
}
