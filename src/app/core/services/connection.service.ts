import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpContext, HttpErrorResponse } from '@angular/common/http';
import { computed, DestroyRef, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  catchError,
  EMPTY,
  exhaustMap,
  filter,
  finalize,
  fromEvent,
  map,
  merge,
  Subject,
  tap,
  timer,
} from 'rxjs';
import { CONNECTION_CONFIG } from '../../config/connection.config';
import { SEND_API_CREDENTIALS } from '../context/api-http.context';
import { SKIP_ERROR_NORMALIZATION } from '../context/error-http.context';
import { SKIP_GLOBAL_LOADING } from '../context/loading.context';

import type { NetworkStatus, BackendStatus, ConnectionStatus, BackendHealthResponse } from '../types/connection.type';

@Injectable({
  providedIn: 'root',
})
export class ConnectionService {
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);
  private readonly config = inject(CONNECTION_CONFIG);
  private readonly browser = isPlatformBrowser(this.platformId);
  private readonly manualCheck$ = new Subject<void>();

  // ===========================================================================
  // Internal state
  // ===========================================================================

  private readonly networkStatusState = signal<NetworkStatus>('unknown');
  private readonly backendStatusState = signal<BackendStatus>('unknown');
  private readonly checkingState = signal(false);
  private readonly latencyState = signal<number | null>(null);
  private readonly lastCheckedAtState = signal<Date | null>(null);
  private readonly consecutiveFailuresState = signal(0);

  // ===========================================================================
  // Public state
  // ===========================================================================

  readonly networkStatus = this.networkStatusState.asReadonly();
  readonly backendStatus = this.backendStatusState.asReadonly();
  readonly checking = this.checkingState.asReadonly();
  readonly latency = this.latencyState.asReadonly();
  readonly lastCheckedAt = this.lastCheckedAtState.asReadonly();
  readonly consecutiveFailures = this.consecutiveFailuresState.asReadonly();

  // ===========================================================================
  // Derived state
  // ===========================================================================

  /**
   * User device currently has a network connection.
   */
  readonly networkAvailable = computed(() => this.networkStatusState() === 'online');

  /**
   * NestJS backend is reachable.
   */
  readonly backendAvailable = computed(
    () => this.backendStatusState() === 'reachable' || this.backendStatusState() === 'degraded',
  );

  /**
   * Full application connectivity.
   */
  readonly connected = computed(
    () => this.networkStatusState() === 'online' && this.backendStatusState() === 'reachable',
  );

  /**
   * Combined status primarily intended for UI.
   */
  readonly status = computed<ConnectionStatus>(() => {
    const network = this.networkStatusState();
    const backend = this.backendStatusState();

    if (network === 'offline') {
      return 'offline';
    }

    if (network === 'unknown' || backend === 'unknown' || backend === 'checking') {
      return 'checking';
    }

    if (backend === 'unreachable') {
      return 'server-unreachable';
    }

    if (backend === 'degraded') {
      return 'degraded';
    }

    return 'online';
  });

  // ===========================================================================
  // Initialization
  // ===========================================================================

  constructor() {
    if (!this.browser) {
      return;
    }

    this.initializeNetworkStatus();
    this.listenForNetworkChanges();
    this.listenForVisibilityChanges();
    this.startBackendMonitoring();
  }

  // ===========================================================================
  // Public API
  // ===========================================================================

  /**
   * Immediately verify backend connectivity.
   *
   * Useful for a "Try again" button.
   */
  checkNow(): void {
    if (!this.browser) {
      return;
    }
    if (!navigator.onLine) {
      this.markOffline();
      return;
    }
    this.manualCheck$.next();
  }

  // ===========================================================================
  // Device network
  // ===========================================================================

  private initializeNetworkStatus(): void {
    if (navigator.onLine) {
      this.networkStatusState.set('online');
      this.backendStatusState.set('checking');
      return;
    }
    this.markOffline();
  }

  private listenForNetworkChanges(): void {
    const online$ = fromEvent(window, 'online').pipe(
      tap(() => {
        this.networkStatusState.set('online');
        this.backendStatusState.set('checking');
        this.manualCheck$.next();
      }),
    );
    const offline$ = fromEvent(window, 'offline').pipe(
      tap(() => {
        this.markOffline();
      }),
    );
    merge(online$, offline$).pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }

  // ===========================================================================
  // Browser visibility
  // ===========================================================================

  private listenForVisibilityChanges(): void {
    fromEvent(document, 'visibilitychange')
      .pipe(
        filter(() => document.visibilityState === 'visible'),
        tap(() => {
          /**
           * The user returned to the POS.
           *
           * Refresh network state because a laptop
           * may have slept or changed Wi-Fi networks.
           */
          if (!navigator.onLine) {
            this.markOffline();
            return;
          }
          this.networkStatusState.set('online');
          this.manualCheck$.next();
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }

  // ===========================================================================
  // Backend monitoring
  // ===========================================================================

  private startBackendMonitoring(): void {
    const polling$ = timer(0, this.config.pollIntervalMs);
    merge(polling$, this.manualCheck$)
      .pipe(
        /**
         * Never call NestJS if the device itself
         * has no network connection.
         */
        filter(() => navigator.onLine),

        /**
         * Avoid unnecessary background traffic
         * while the POS tab is hidden.
         */
        filter(() => document.visibilityState === 'visible'),

        /**
         * Prevent overlapping health requests.
         */
        exhaustMap(() => this.checkBackend()),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }

  // ===========================================================================
  // Backend health
  // ===========================================================================

  private checkBackend() {
    const startedAt = performance.now();
    this.checkingState.set(true);

    /**
     * Only show "checking" during initial connection.
     *
     * Don't cause the UI to switch:
     *
     * online → checking → online
     *
     * every 30 seconds.
     */
    if (this.backendStatusState() === 'unknown') {
      this.backendStatusState.set('checking');
    }

    const context = new HttpContext()
      .set(SKIP_GLOBAL_LOADING, true)
      .set(SKIP_ERROR_NORMALIZATION, true)
      .set(SEND_API_CREDENTIALS, false);

    return this.http
      .get<BackendHealthResponse>(this.config.healthEndpoint, {
        context,
        timeout: this.config.timeoutMs,
      })
      .pipe(
        tap((response) => {
          const latency = Math.round(performance.now() - startedAt);
          this.networkStatusState.set('online');
          this.latencyState.set(latency);
          this.lastCheckedAtState.set(new Date());
          this.consecutiveFailuresState.set(0);
          if (response.status === 'degraded' || latency >= this.config.degradedLatencyMs) {
            this.backendStatusState.set('degraded');
            return;
          }
          this.backendStatusState.set('reachable');
        }),
        map(() => undefined),
        catchError((error: unknown) => {
          this.handleBackendFailure(error);
          return EMPTY;
        }),
        finalize(() => {
          this.checkingState.set(false);
        }),
      );
  }

  // ===========================================================================
  // Failure handling
  // ===========================================================================

  private handleBackendFailure(error: unknown): void {
    this.lastCheckedAtState.set(new Date());
    this.latencyState.set(null);
    this.consecutiveFailuresState.update((count) => count + 1);

    /**
     * Re-check the actual device state first.
     *
     * Browser network state remains the authority
     * for device-level connectivity.
     */
    if (!navigator.onLine) {
      this.markOffline();
      return;
    }
    this.networkStatusState.set('online');

    // -------------------------------------------------------------------------
    // Request never reached a responding HTTP server
    // -------------------------------------------------------------------------
    if (error instanceof HttpErrorResponse && error.status === 0) {
      this.backendStatusState.set('unreachable');

      return;
    }

    // -------------------------------------------------------------------------
    // Server responded, but health endpoint failed
    // -------------------------------------------------------------------------
    if (error instanceof HttpErrorResponse && error.status > 0) {
      /**
       * 4xx:
       * health route/configuration problem
       *
       * 5xx:
       * backend is reachable but unhealthy
       */
      this.backendStatusState.set('degraded');
      return;
    }

    /**
     * Timeout, DNS, browser/network or another
     * lower-level connectivity error.
     */
    this.backendStatusState.set('unreachable');
  }

  // ===========================================================================
  // State helpers
  // ===========================================================================

  private markOffline(): void {
    this.networkStatusState.set('offline');

    /**
     * We do NOT claim NestJS itself is down.
     *
     * We simply cannot determine its state while
     * the device is offline.
     */
    this.backendStatusState.set('unknown');

    this.checkingState.set(false);

    this.latencyState.set(null);
  }
}
