// api-http.context.ts

import { HttpContextToken } from '@angular/common/http';

/**
 * Completely bypass global API defaults.
 *
 * Useful for requests that need full manual control.
 */
export const SKIP_API_DEFAULTS = new HttpContextToken<boolean>(() => false);

/**
 * Controls whether cookies/credentials should be sent
 * to our API.
 *
 * Defaults to true because authentication may use
 * HttpOnly refresh/session cookies.
 */
export const SEND_API_CREDENTIALS = new HttpContextToken<boolean>(() => true);
