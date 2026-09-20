import { isApiRequest } from '../utils/api-url.util';
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { API_HTTP_CONFIG } from '../../config/api-http.config';
import { SKIP_API_DEFAULTS, SEND_API_CREDENTIALS } from '../context/api-http.context';

export const apiDefaultsInterceptor: HttpInterceptorFn = (request, next) => {
  const config = inject(API_HTTP_CONFIG);

  // ---------------------------------------------------------------------------
  // Explicit bypass
  // ---------------------------------------------------------------------------
  if (request.context.get(SKIP_API_DEFAULTS)) {
    return next(request);
  }

  // ---------------------------------------------------------------------------
  // Only modify requests sent to our own API
  // ---------------------------------------------------------------------------
  if (!isApiRequest(request.url, config.apiBaseUrl)) {
    return next(request);
  }
  const sendCredentials = request.context.get(SEND_API_CREDENTIALS);
  let enriched = request;

  // ---------------------------------------------------------------------------
  // Default Accept header
  // ---------------------------------------------------------------------------
  /**
   * Never overwrite a caller-defined Accept header.
   *
   * Examples:
   *
   * Accept: application/pdf
   * Accept: text/csv
   * Accept: image/*
   */
  if (!request.headers.has('Accept')) {
    enriched = enriched.clone({
      headers: enriched.headers.set('Accept', 'application/json'),
    });
  }

  // ---------------------------------------------------------------------------
  // Credentials
  // ---------------------------------------------------------------------------
  if (sendCredentials && !enriched.withCredentials) {
    enriched = enriched.clone({
      withCredentials: true,
    });
  }

  return next(enriched);
};

// =============================================================================
// API boundary
// =============================================================================
