import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  selector: 'app-whatsapp-fab',
  styleUrl: './whatsapp-fab.scss',
  templateUrl: './whatsapp-fab.html',
})
export class WhatsappFab {}
