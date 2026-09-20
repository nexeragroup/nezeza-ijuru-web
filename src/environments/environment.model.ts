export interface AppEnvironment {
  readonly name: 'dev' | 'prod';

  readonly production: boolean;

  readonly indexable: boolean;

  readonly siteUrl: string;

  readonly socialImagePath: string;

  /**
   * REST API base URL.
   *
   * Same-origin absolute URL. The browser still reaches NestJS through the
   * reverse proxy, while SSR can map its API origin into the hydration cache.
   */
  readonly apiBaseUrl: string;

}
