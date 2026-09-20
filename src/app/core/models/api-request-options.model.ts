import { HttpContext, HttpHeaders, HttpParams } from '@angular/common/http';

export type ApiHeaderValue = string | string[];

export type ApiParamValue = string | number | boolean | readonly (string | number | boolean)[];

export interface ApiRequestOptions {
  /**
   * Request headers.
   *
   * Important:
   * Angular expects string | string[] here.
   * Do not use readonly string[].
   */
  headers?: HttpHeaders | Record<string, ApiHeaderValue>;

  /**
   * Query parameters.
   *
   * Angular supports readonly arrays for query
   * parameter values.
   */
  params?: HttpParams | Record<string, ApiParamValue>;

  /**
   * Request metadata consumed by interceptors.
   */
  context?: HttpContext;

  /**
   * Override credentials handling when required.
   *
   * Normally the API defaults interceptor
   * should control this.
   */
  withCredentials?: boolean;

  /**
   * Maximum request duration in milliseconds.
   */
  timeout?: number;

  /**
   * Angular SSR transfer cache configuration.
   */
  transferCache?:
    | boolean
    | {
        includeHeaders?: string[];
      };
}

export interface ApiDeleteOptions<TBody = never> extends ApiRequestOptions {
  body?: TBody;
}
