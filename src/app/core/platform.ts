import { PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/** Call only from a component/directive field initializer or constructor (valid injection context). */
export function isBrowser(): boolean {
  return isPlatformBrowser(inject(PLATFORM_ID));
}
