import {
  ApplicationConfig,
  importProvidersFrom,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { routes } from './app.routes';
import {
  provideClientHydration,
  withEventReplay,
} from '@angular/platform-browser';
import {
  provideHttpClient,
  withFetch,
  withInterceptors,
} from '@angular/common/http';
import { authInterceptor } from './auth.interceptor';
import { Cloudinary } from '@cloudinary/angular-5.x';
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
const config: SocketIoConfig = { url: 'http://localhost:8080', options: {} };

// Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyC5VF2g82q5iikC-4aMBiMxITGZ08-v0RE',
  authDomain: 'split-e99d6.firebaseapp.com',
  projectId: 'split-e99d6',
  storageBucket: 'split-e99d6.appspot.com',
  messagingSenderId: '792851395689',
  appId: '1:792851395689:web:a0013a030121b8aff55ef8',
  measurementId: 'G-4YXE4FR7RS',
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withInterceptors([authInterceptor]), withFetch()),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideAuth(() => getAuth()),
    importProvidersFrom(SocketIoModule.forRoot(config)),
    {
      provide: Cloudinary,
      useValue: Cloudinary,
    },
  ],
};
