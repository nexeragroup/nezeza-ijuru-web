import type { EnvironmentProviders, Provider } from '@angular/core';
import { provideClientHydration } from '@angular/platform-browser';

export const renderingProviders: (Provider | EnvironmentProviders)[] = [provideClientHydration()];
