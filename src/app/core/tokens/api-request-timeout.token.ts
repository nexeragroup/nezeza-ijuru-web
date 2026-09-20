import { InjectionToken } from '@angular/core';

export const API_REQUEST_TIMEOUT = new InjectionToken<number>('API_REQUEST_TIMEOUT', {
  factory: () => 15_000,
});
