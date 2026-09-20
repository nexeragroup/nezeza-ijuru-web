import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { SKIP_ERROR_NORMALIZATION } from '../context/error-http.context';
import {
  ApplicationError,
  ApplicationErrorCategory,
} from '../models/application-error.model';
import { ApiErrorPayload } from '../models/api-response.model';

// =============================================================================
// Interceptor
// =============================================================================

export const errorInterceptor: HttpInterceptorFn = (request, next) => {
  if (request.context.get(SKIP_ERROR_NORMALIZATION)) {
    return next(request);
  }

  return next(request).pipe(
    catchError((error: unknown) => {
      /**
       * Preserve errors that have already been normalized.
       *
       * This becomes useful when requests are retried or
       * several HTTP layers are involved.
       */
      if (error instanceof ApplicationError) {
        return throwError(() => error);
      }

      /**
       * Non-HTTP programming/RxJS errors should not be
       * incorrectly converted into API errors.
       */
      if (!(error instanceof HttpErrorResponse)) {
        return throwError(() => error);
      }

      const applicationError = normalizeHttpError(error);

      return throwError(() => applicationError);
    }),
  );
};

// =============================================================================
// Normalization
// =============================================================================

function normalizeHttpError(error: HttpErrorResponse): ApplicationError {
  const payload = parseApiErrorPayload(error.error);
  const status = error.status;
  const code = getErrorCode(payload);
  const category = categoryForStatus(status);
  const requestId = getRequestId(error, payload);
  const backendMessage = getBackendMessage(payload);
  const message = isSafeBackendMessage(backendMessage) ? backendMessage : messageForStatus(status);
  return new ApplicationError(message, {
    status,
    code,
    category,
    requestId,
    retryable: isRetryableStatus(status),
    details: getErrorDetails(payload),
    originalError: error,
  });
}
function parseApiErrorPayload(value: unknown): Partial<ApiErrorPayload> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }
  return value as Partial<ApiErrorPayload>;
}

function getBackendMessage(payload: Partial<ApiErrorPayload>): string | undefined {
  const message = payload.message;
  if (Array.isArray(message)) {
    const messages = message
      .filter((item): item is string => typeof item === 'string')
      .map((item) => item.trim())
      .filter(Boolean);
    return messages.length ? messages.join('. ') : undefined;
  }
  if (typeof message === 'string') {
    const normalized = message.trim();
    return normalized || undefined;
  }
  return undefined;
}

function isSafeBackendMessage(message?: string): message is string {
  if (!message) {
    return false;
  }

  /**
   * Prevent unexpectedly huge server responses
   * from reaching UI notifications.
   */
  if (message.length > 500) {
    return false;
  }

  /**
   * Common signs of HTML error responses.
   */
  if (/<\/?[a-z][\s\S]*>/i.test(message)) {
    return false;
  }

  return true;
}

function getErrorCode(payload: Partial<ApiErrorPayload>): string | undefined {
  const code = payload.code;
  return typeof code === 'string' && code.trim() ? code.trim() : undefined;
}

function getErrorDetails(payload: Partial<ApiErrorPayload>): unknown {
  if ('details' in payload) {
    return payload.details;
  }
  return undefined;
}

function getRequestId(
  error: HttpErrorResponse,
  payload: Partial<ApiErrorPayload>,
): string | undefined {
  const payloadRequestId = 'requestId' in payload ? payload.requestId : undefined;
  if (typeof payloadRequestId === 'string' && payloadRequestId.trim()) {
    return payloadRequestId;
  }
  return error.headers.get('x-request-id') ?? error.headers.get('x-correlation-id') ?? undefined;
}

function categoryForStatus(status: number): ApplicationErrorCategory {
  if (status === 0) {
    return 'network';
  }

  if (status === 401) {
    return 'authentication';
  }

  if (status === 403) {
    return 'authorization';
  }

  if (status === 400 || status === 422) {
    return 'validation';
  }

  if (status === 404) {
    return 'not-found';
  }

  if (status === 409 || status === 412) {
    return 'conflict';
  }

  if (status === 429) {
    return 'rate-limit';
  }

  if (status >= 400 && status < 500) {
    return 'client';
  }

  if (status >= 500 && status < 600) {
    return 'server';
  }

  return 'unknown';
}

function isRetryableStatus(status: number): boolean {
  return (
    status === 0 ||
    status === 408 ||
    status === 425 ||
    status === 429 ||
    status === 502 ||
    status === 503 ||
    status === 504
  );
}

function messageForStatus(status: number): string {
  switch (status) {
    case 0:
      return 'Unable to reach the server. ' + 'Check your connection and try again.';

    case 400:
      return 'The request contains invalid information.';

    case 401:
      return 'Your session is invalid or has expired. ' + 'Please sign in again.';

    case 403:
      return 'You do not have permission ' + 'to perform this action.';

    case 404:
      return 'The requested resource could not be found.';

    case 408:
      return 'The request took too long to complete. ' + 'Please try again.';

    case 409:
      return (
        'The operation conflicts with the current state. ' +
        'Refresh the information and try again.'
      );

    case 412:
      return 'The information has changed since it was loaded. ' + 'Refresh and try again.';

    case 413:
      return 'The submitted data is too large.';

    case 415:
      return 'The submitted data format is not supported.';

    case 422:
      return 'Some of the submitted information is invalid.';

    case 429:
      return 'Too many requests. Please wait a moment ' + 'before trying again.';

    case 500:
      return 'The server encountered an unexpected error.';

    case 502:
    case 503:
    case 504:
      return 'The service is temporarily unavailable. ' + 'Please try again shortly.';

    default:
      return status >= 500
        ? 'The service could not complete the request.'
        : 'The request could not be completed.';
  }
}
