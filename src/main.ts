import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { mountAgentationInDev } from './app/dev/agentation.dev';

// Browsers restore the prior scroll offset on a plain reload by default
// (history.scrollRestoration: 'auto') — since this is a single-route SPA,
// Angular Router's own scroll config never fires to override that on
// reload (only on in-app navigations), so it's disabled here instead and
// every load explicitly starts at the top.
//
// A single synchronous scrollTo isn't enough on its own: Safari (desktop
// and iOS) can apply its scroll restoration *later* than this module
// executes — on the 'load' event once the page has finished loading, and
// again on 'pageshow' for a back-forward-cache restore — so both are
// covered too, each re-forcing the top regardless of when Safari's own
// restore lands relative to this script.
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);
window.addEventListener('load', () => window.scrollTo(0, 0));
window.addEventListener('pageshow', () => window.scrollTo(0, 0));

bootstrapApplication(App, appConfig)
  .then(() => mountAgentationInDev())
  .catch((err) => console.error(err));
