import { HttpClient, HttpResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiRequestOptions, ApiDeleteOptions } from '../models/api-request-options.model';
import { API_URL } from '../tokens/api-url.token';
import { API_REQUEST_TIMEOUT } from '../tokens/api-request-timeout.token';

type PreparedApiOptions<T extends ApiRequestOptions> = T & {
  observe: 'body';
  responseType: 'json';
  timeout: number;
};

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = this.normalizeBaseUrl(inject(API_URL));
  private readonly defaultTimeout = inject(API_REQUEST_TIMEOUT);

  // ===========================================================================
  // GET
  // ===========================================================================
  get<TResponse>(path: string, options: ApiRequestOptions = {}): Observable<TResponse> {
    return this.http.get<TResponse>(this.resolveUrl(path), this.prepareOptions(options));
  }

  // ===========================================================================
  // POST
  // ===========================================================================
  post<TResponse, TBody = unknown>(
    path: string,
    body: TBody,
    options: ApiRequestOptions = {},
  ): Observable<TResponse> {
    return this.http.post<TResponse>(this.resolveUrl(path), body, this.prepareOptions(options));
  }

  // ===========================================================================
  // PUT
  // ===========================================================================
  put<TResponse, TBody = unknown>(
    path: string,
    body: TBody,
    options: ApiRequestOptions = {},
  ): Observable<TResponse> {
    return this.http.put<TResponse>(this.resolveUrl(path), body, this.prepareOptions(options));
  }

  // ===========================================================================
  // PATCH
  patch<TResponse, TBody = unknown>(
    path: string,
    body: TBody,
    options: ApiRequestOptions = {},
  ): Observable<TResponse> {
    return this.http.patch<TResponse>(this.resolveUrl(path), body, this.prepareOptions(options));
  }

  // ===========================================================================
  // DELETE
  // ===========================================================================
  delete<TResponse, TBody = never>(
    path: string,
    options: ApiDeleteOptions<TBody> = {},
  ): Observable<TResponse> {
    return this.http.delete<TResponse>(this.resolveUrl(path), this.prepareOptions(options));
  }

  // ===========================================================================
  // HEAD
  // ===========================================================================
  head<TResponse>(path: string, options: ApiRequestOptions = {}): Observable<TResponse> {
    return this.http.head<TResponse>(this.resolveUrl(path), this.prepareOptions(options));
  }

  // ===========================================================================
  // Full response
  // ===========================================================================
  /**
   * Use when headers/status are required in addition
   * to the JSON response body.
   *
   * Example:
   * - pagination headers
   * - ETag
   * - rate-limit headers
   * - correlation ID
   */
  getResponse<TResponse>(
    path: string,
    options: ApiRequestOptions = {},
  ): Observable<HttpResponse<TResponse>> {
    return this.http.get<TResponse>(this.resolveUrl(path), {
      ...this.prepareOptions(options),
      observe: 'response' as const,
    });
  }

  // ===========================================================================
  // Blob/download
  // ===========================================================================
  /**
   * Download binary content.
   *
   * Examples:
   * - PDF
   * - Excel
   * - ZIP
   * - images
   */
  download(path: string, options: ApiRequestOptions = {}): Observable<Blob> {
    return this.http.get(this.resolveUrl(path), {
      ...this.prepareOptions(options),
      observe: 'body' as const,
      responseType: 'blob' as const,
    });
  }

  // ===========================================================================
  // Text
  // ===========================================================================

  /**
   * Retrieve a plain-text response.
   */
  getText(path: string, options: ApiRequestOptions = {}): Observable<string> {
    return this.http.get(this.resolveUrl(path), {
      ...this.prepareOptions(options),
      observe: 'body' as const,
      responseType: 'text' as const,
    });
  }

  // ===========================================================================
  // URL
  // ===========================================================================
  private resolveUrl(path: string): string {
    const normalized = path.trim();
    if (!normalized) {
      throw new Error('[ApiService] Request path cannot be empty.');
    }

    /**
     * ApiService is intentionally restricted to
     * our NestJS API.
     *
     * External APIs should have their own dedicated
     * clients/services.
     */
    if (this.isAbsoluteUrl(normalized) || normalized.startsWith('//')) {
      throw new Error(`[ApiService] Absolute URLs are not allowed: "${normalized}".`);
    }
    this.assertSafePath(normalized);
    const relativePath = normalized.replace(/^\/+/, '');
    return `${this.apiUrl}/${relativePath}`;
  }

  private normalizeBaseUrl(value: string): string {
    const normalized = value.trim().replace(/\/+$/, '');
    if (!normalized) {
      throw new Error('[ApiService] API_URL is not configured.');
    }
    return normalized;
  }

  private isAbsoluteUrl(value: string): boolean {
    return /^[a-z][a-z\d+\-.]*:/i.test(value);
  }

  /**
   * Prevent paths such as:
   *
   * ../admin
   * products/../../internal
   *
   * from escaping the configured API base path.
   */
  private assertSafePath(value: string): void {
    const pathOnly = value.split(/[?#]/, 1)[0];
    const segments = pathOnly.split('/');
    for (const segment of segments) {
      let decoded: string;
      try {
        decoded = decodeURIComponent(segment);
      } catch {
        throw new Error(`[ApiService] Invalid URL encoding in path: "${value}".`);
      }

      if (decoded === '..' || decoded === '.') {
        throw new Error(`[ApiService] Path traversal is not allowed: "${value}".`);
      }
    }
  }

  // ===========================================================================
  // Options
  // ===========================================================================
  private prepareOptions<T extends ApiRequestOptions>(options: T): PreparedApiOptions<T> {
    return {
      ...options,

      observe: 'body',
      responseType: 'json',

      timeout: options.timeout ?? this.defaultTimeout,
    };
  }
}
