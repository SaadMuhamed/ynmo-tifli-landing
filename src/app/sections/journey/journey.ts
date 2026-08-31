import { ChangeDetectionStrategy, Component } from '@angular/core';
import { JOURNEY } from '../../content/ar';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  selector: 'app-journey',
  styleUrl: './journey.scss',
  templateUrl: './journey.html',
})
export class Journey {
  protected readonly journey = JOURNEY;
}
