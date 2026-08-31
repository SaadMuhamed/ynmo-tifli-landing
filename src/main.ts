import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { mountAgentationInDev } from './app/dev/agentation.dev';

bootstrapApplication(App, appConfig)
  .then(() => mountAgentationInDev())
  .catch((err) => console.error(err));
