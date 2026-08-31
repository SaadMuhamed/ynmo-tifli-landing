import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SECURITY_BANNER } from '../../content/ar';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  selector: 'app-security-banner',
  styleUrl: './security-banner.scss',
  templateUrl: './security-banner.html',
})
export class SecurityBanner {
  protected readonly content = SECURITY_BANNER;
}
