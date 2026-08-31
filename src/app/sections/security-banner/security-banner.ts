import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  selector: 'app-security-banner',
  styleUrl: './security-banner.scss',
  templateUrl: './security-banner.html',
})
export class SecurityBanner {}
