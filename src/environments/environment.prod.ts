import type { AppEnvironment } from './environment.model';

export const environment: AppEnvironment = {
  name: 'prod',

  production: true,

  indexable: true,

  siteUrl: 'https://nezezaijuru.org',

  socialImagePath: '/brand/logos/logo-primary.png',

  apiBaseUrl: 'https://nezezaijuru.org/api/v1',
} as const satisfies AppEnvironment;
