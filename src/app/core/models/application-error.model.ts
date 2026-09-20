import type { HttpErrorResponse } from '@angular/common/http';

export type ApplicationErrorCategory =
  | 'network'
  | 'authentication'
  | 'authorization'
  | 'validation'
  | 'not-found'
  | 'conflict'
  | 'rate-limit'
  | 'client'
  | 'server'
  | 'unknown';


export interface ApplicationErrorOptions {
  status: number;
  code?: string;
  category: ApplicationErrorCategory;
  requestId?: string;
  retryable: boolean;
  details?: unknown;
  originalError?: HttpErrorResponse;
}

export class ApplicationError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly category: ApplicationErrorCategory;
  readonly requestId?: string;
  readonly retryable: boolean;
  readonly details?: unknown;
  readonly originalError?: HttpErrorResponse;

  constructor(message: string, options: ApplicationErrorOptions) {
    super(message);
    this.name = 'ApplicationError';
    this.status = options.status;
    this.code = options.code;
    this.category = options.category;
    this.requestId = options.requestId;
    this.retryable = options.retryable;
    this.details = options.details;
    this.originalError = options.originalError;
  }
}
