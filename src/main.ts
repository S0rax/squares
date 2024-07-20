import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';

const appRoot = document.createElement('app-root');
document.body.appendChild(appRoot)
const primeIcons = document.createElement('link');
primeIcons.rel = 'stylesheet';
primeIcons.href = 'https://cdn.jsdelivr.net/npm/primeicons@7.0.0/primeicons.min.css';
document.body.appendChild(primeIcons)

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch((err) => console.error(err));
