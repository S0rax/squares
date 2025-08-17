import '@angular/compiler';
import { bootstrapApplication } from '@angular/platform-browser';
import { SquaresAnswersComponent } from 'src/app/squares-answers.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { enableProdMode, provideZonelessChangeDetection } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { env } from 'src/envs/env';

if (env.production) {
    enableProdMode();
}

const appRoot = document.createElement('squares-answers');
document.body.appendChild(appRoot);

bootstrapApplication(SquaresAnswersComponent, {
    providers: [
        provideHttpClient(withInterceptorsFromDi()),
        provideZonelessChangeDetection(),
        provideAnimations()
    ]
}).catch(console.error);
