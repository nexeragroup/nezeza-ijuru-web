import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { environment } from '../environments/environment';
import { CoreModule } from './core';
import { SharedModule } from './shared/shared.module';
import { renderingProviders } from './rendering.providers';
import { LayoutModule } from './layout/layout.module';

@NgModule({
  declarations: [App],
  imports: [
    BrowserModule,
    AppRoutingModule,
    CoreModule.forRoot({
      apiBaseUrl: environment.apiBaseUrl,
      apiRequestTimeoutMs: 15_000,

      storage: {
        namespace: 'default',
        version: 1,
        defaultArea: 'local',
      },

      connection: {
        pollIntervalMs: 30_000,
        timeoutMs: 5_000,
        degradedLatencyMs: 2_500,
      },

      theme: {
        defaultColor: 'blue',
        defaultMode: 'light',
      },
    }),
    SharedModule,
    LayoutModule,
  ],
  providers: [provideBrowserGlobalErrorListeners(), ...renderingProviders],
  bootstrap: [App],
})
export class AppModule {}
