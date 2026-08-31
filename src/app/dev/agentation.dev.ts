import { isDevMode } from '@angular/core';

/**
 * Dev-only visual annotation overlay (agentation.com). Lazy-imported so
 * react/react-dom/agentation never enter the production bundle — isDevMode()
 * alone can't guarantee tree-shaking of a static import.
 */
export function mountAgentationInDev(): void {
  if (!isDevMode() || typeof window === 'undefined') return;

  Promise.all([import('react'), import('react-dom/client'), import('agentation')]).then(
    ([React, ReactDOM, { Agentation }]) => {
      const host = document.createElement('div');
      host.id = 'agentation-root';
      document.body.appendChild(host);
      ReactDOM.createRoot(host).render(React.createElement(Agentation));
    },
  );
}
