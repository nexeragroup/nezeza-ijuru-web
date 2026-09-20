// api-http.config.ts

import { InjectionToken } from '@angular/core';

export interface ApiHttpConfig {
  apiBaseUrl: string;
}

export const API_HTTP_CONFIG = new InjectionToken<ApiHttpConfig>('API_HTTP_CONFIG');
