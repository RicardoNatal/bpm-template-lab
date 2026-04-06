import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import {
  AppInitializerFactory,
  AppInitializerService,
} from './core/initializer/app-initializer.service';
import {
  HTTP_INTERCEPTORS,
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { TokenInterceptor } from './core/interceptor/token.interceptor';
import { ErrorInterceptor } from './core/interceptor/error.interceptor';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessagesModule } from 'primeng/messages';

const HTTP_INTERCEPTORS_PROVIDERS = [
  { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true },
  { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
];

const APP_INITIALIZER_PROVIDERS = [
  {
    provide: APP_INITIALIZER,
    useFactory: AppInitializerFactory,
    deps: [AppInitializerService],
    multi: true,
  },
];

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    CommonModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    ToastModule,
    ProgressSpinnerModule,
    MessagesModule,
  ],
  exports: [ToastModule, MessagesModule, ProgressSpinnerModule],
  providers: [
    provideHttpClient(withInterceptorsFromDi()),
    ...APP_INITIALIZER_PROVIDERS,
    ...HTTP_INTERCEPTORS_PROVIDERS,
    MessageService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
