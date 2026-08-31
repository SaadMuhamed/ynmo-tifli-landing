import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FOOTER } from '../../content/ar';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  selector: 'app-site-footer',
  styleUrl: './site-footer.scss',
  templateUrl: './site-footer.html',
})
export class SiteFooter {
  protected readonly content = FOOTER;
}
