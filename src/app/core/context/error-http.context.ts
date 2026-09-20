// error-http.context.ts

import { HttpContextToken } from '@angular/common/http';

/**
 * Prevent global error normalization for special requests.
 *
 * Example:
 * - file downloads with custom error handling
 * - third-party API requests
 */
export const SKIP_ERROR_NORMALIZATION = new HttpContextToken<boolean>(() => false);
