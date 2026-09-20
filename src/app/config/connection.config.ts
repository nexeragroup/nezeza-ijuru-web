import { InjectionToken } from '@angular/core';

export interface ConnectionConfig {
  /**
   * NestJS lightweight health endpoint.
   */
  healthEndpoint: string;

  /**
   * How often Angular verifies backend availability.
   */
  pollIntervalMs: number;

  /**
   * Maximum time allowed for the health request.
   */
  timeoutMs: number;

  /**
   * Backend response time above this threshold is
   * considered degraded.
   */
  degradedLatencyMs: number;
}

export const CONNECTION_CONFIG = new InjectionToken<ConnectionConfig>('CONNECTION_CONFIG');
