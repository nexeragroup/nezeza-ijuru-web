export interface AppEnvironment {
  readonly name: 'dev' | 'staging' | 'prod';

  readonly production: boolean;

  readonly indexable: boolean;

  readonly siteUrl: string;

  readonly socialImagePath: string;

  /** REST API base URL. */
  readonly apiBaseUrl: string;

}
