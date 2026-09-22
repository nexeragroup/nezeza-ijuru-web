import type { AppEnvironment } from './environment.model';

// Public build-time settings.
// Never store secrets here.
export const environment: AppEnvironment = {
  name: 'dev',

  production: false,

  indexable: false,

  siteUrl: 'http://localhost:4200',

  socialImagePath: '/brand/logos/logo-primary.png',

  apiBaseUrl: '/api/v1',

} as const satisfies AppEnvironment;
