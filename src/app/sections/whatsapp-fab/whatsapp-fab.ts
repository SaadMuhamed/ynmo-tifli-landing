import { ChangeDetectionStrategy, Component } from '@angular/core';
import { WHATSAPP_FAB, WHATSAPP_FAB_ENABLED } from '../../content/ar';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  selector: 'app-whatsapp-fab',
  styleUrl: './whatsapp-fab.scss',
  templateUrl: './whatsapp-fab.html',
})
export class WhatsappFab {
  protected readonly content = WHATSAPP_FAB;
  protected readonly enabled = WHATSAPP_FAB_ENABLED;
}
