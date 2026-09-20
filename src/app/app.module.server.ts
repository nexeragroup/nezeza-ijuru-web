import { HTTP_TRANSFER_CACHE_ORIGIN_MAP } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { App } from './app';
import { AppModule } from './app-module';
import { serverRoutes } from './app.routes.server';
import { API_HTTP_CONFIG } from './config/api-http.config';
import { API_URL } from './core/tokens/api-url.token';
import { environment } from '../environments/environment';

function ssrApiBaseUrl(): string {
  const configured = process.env['SSR_API_BASE_URL']?.trim();
  if (!configured && environment.name !== 'dev') {
    throw new Error('SSR_API_BASE_URL is required outside development.');
  }
  return (configured || 'http://localhost:3300/api/v1').replace(/\/+$/, '');
}

function ssrApiOrigin(): string {
  return new URL(ssrApiBaseUrl()).origin;
}

@NgModule({
  imports: [AppModule],
  providers: [
    provideServerRendering(withRoutes(serverRoutes)),
    { provide: API_URL, useFactory: ssrApiBaseUrl },
    { provide: API_HTTP_CONFIG, useFactory: () => ({ apiBaseUrl: ssrApiBaseUrl() }) },
    {
      provide: HTTP_TRANSFER_CACHE_ORIGIN_MAP,
      useFactory: () => ({ [ssrApiOrigin()]: environment.siteUrl }),
    },
  ],
  bootstrap: [App],
})
export class AppServerModule {}
