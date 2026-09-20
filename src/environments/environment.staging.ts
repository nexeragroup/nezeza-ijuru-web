import type { AppEnvironment } from './environment.model';

export const environment: AppEnvironment = {
  name: 'staging',

  production: false,

  indexable: false,

  siteUrl: 'https://staging.nezezaijuru.org',

  socialImagePath: '/brand/logos/logo-primary.png',

  apiBaseUrl: 'https://staging.nezezaijuru.org/api/v1',
} as const satisfies AppEnvironment;
