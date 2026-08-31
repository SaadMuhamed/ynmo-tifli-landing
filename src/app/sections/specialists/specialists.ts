import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SPECIALISTS } from '../../content/ar';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  selector: 'app-specialists',
  styleUrl: './specialists.scss',
  templateUrl: './specialists.html',
})
export class Specialists {
  protected readonly specialists = SPECIALISTS;
}
