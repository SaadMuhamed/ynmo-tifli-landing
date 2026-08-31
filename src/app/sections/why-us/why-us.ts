import { ChangeDetectionStrategy, Component } from '@angular/core';
import { WHY_US } from '../../content/ar';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  selector: 'app-why-us',
  styleUrl: './why-us.scss',
  templateUrl: './why-us.html',
})
export class WhyUs {
  protected readonly content = WHY_US;
}
