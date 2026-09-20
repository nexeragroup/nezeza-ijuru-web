import type { AppEnvironment } from './environment.model';

// Public build-time settings.
// Never store secrets here.
export const environment: AppEnvironment = {
  name: 'dev',

  production: false,

  indexable: false,

  siteUrl: 'http://localhost:4200',

  socialImagePath: '/brand/logos/logo-primary.png',

  /**
   * Same-origin API keeps browser requests on the Angular origin.
   *
   * Angular:
   * http://localhost:4200
   *
   * /api/v1/*
   *      ↓ proxy
   *
   * NestJS:
   * http://localhost:3300/api/v1/*
   */
  apiBaseUrl: 'http://localhost:4200/api/v1',

} as const satisfies AppEnvironment;
