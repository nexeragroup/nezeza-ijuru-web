import { HttpContextToken } from '@angular/common/http';

/**
 * Skip the global application loader for this request.
 *
 * Useful for:
 * - background polling
 * - health checks
 * - silent refreshes
 * - autocomplete
 * - telemetry
 * - prefetching
 */
export const SKIP_GLOBAL_LOADING = new HttpContextToken<boolean>(() => false);
