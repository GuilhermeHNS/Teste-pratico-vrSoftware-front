import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { httpErrorInterceptor } from './services/http-error.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes), provideAnimationsAsync(),
  providePrimeNG({
    theme: {
      preset: Aura,
      options: {
        darkModeSelector: false
      }
    }
  }),
  provideHttpClient(
    withInterceptors([httpErrorInterceptor])
  ),
  importProvidersFrom(
    ToastModule
  ),
  MessageService
  ]
};
