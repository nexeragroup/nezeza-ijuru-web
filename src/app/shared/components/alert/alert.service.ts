import { DestroyRef, Injectable, PLATFORM_ID, inject, signal } from '@angular/core';

import { isPlatformBrowser } from '@angular/common';

import { Subject } from 'rxjs';

import { AlertItem, AlertOptions, ConfirmationOptions } from './model/alert.model';

@Injectable({
  providedIn: 'root',
})
export class AlertService {
  // ===========================================================================
  // Configuration
  // ===========================================================================

  private readonly maxAlerts = 50;

  /**
   * Must match the CSS exit animation duration.
   */
  private readonly exitDuration = 180;

  // ===========================================================================
  // Dependencies
  // ===========================================================================

  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));

  private readonly destroyRef = inject(DestroyRef);

  // ===========================================================================
  // State
  // ===========================================================================

  private readonly alertsState = signal<readonly AlertItem[]>([]);

  readonly alerts = this.alertsState.asReadonly();

  // ===========================================================================
  // Action events
  // ===========================================================================

  private readonly actionEvents = new Subject<{
    id: string;
    value: unknown;
  }>();

  readonly actions = this.actionEvents.asObservable();

  // ===========================================================================
  // Confirmation resolvers
  // ===========================================================================

  private readonly confirmationResolvers = new Map<string, (value: boolean) => void>();

  // ===========================================================================
  // Timers
  // ===========================================================================

  /**
   * Auto-dismiss timers.
   */
  private readonly timers = new Map<string, ReturnType<typeof setTimeout>>();

  /**
   * Exit-animation removal timers.
   */
  private readonly exitTimers = new Map<string, ReturnType<typeof setTimeout>>();

  /**
   * Remaining duration after pause.
   */
  private readonly remaining = new Map<string, number>();

  /**
   * Absolute timestamp at which an alert
   * should automatically disappear.
   */
  private readonly deadlines = new Map<string, number>();

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.dismissAll();

      this.actionEvents.complete();
    });
  }

  // ===========================================================================
  // Generic
  // ===========================================================================

  show(options: AlertOptions): string {
    this.ensureCapacity();

    const alert = this.createAlert(options);

    this.alertsState.update((current) => [...current, alert]);

    if (alert.duration > 0 && alert.mode !== 'confirmation') {
      this.scheduleDismiss(alert);
    }

    return alert.id;
  }

  // ===========================================================================
  // Convenience methods
  // ===========================================================================

  success(message: string, options: Partial<AlertOptions> = {}): string {
    return this.show({
      ...options,
      message,
      color: 'success',
    });
  }

  error(message: string, options: Partial<AlertOptions> = {}): string {
    return this.show({
      ...options,
      message,
      color: 'error',
    });
  }

  warning(message: string, options: Partial<AlertOptions> = {}): string {
    return this.show({
      ...options,
      message,
      color: 'warning',
    });
  }

  danger(message: string, options: Partial<AlertOptions> = {}): string {
    return this.show({
      ...options,
      message,
      color: 'danger',
    });
  }

  info(message: string, options: Partial<AlertOptions> = {}): string {
    return this.show({
      ...options,
      message,
      color: 'info',
    });
  }

  primary(message: string, options: Partial<AlertOptions> = {}): string {
    return this.show({
      ...options,
      message,
      color: 'primary',
    });
  }

  // ===========================================================================
  // Confirmation
  // ===========================================================================

  confirm(options: ConfirmationOptions): Promise<boolean> {
    this.ensureCapacity();
    const message = options.message.trim();
    if (!message) {
      throw new Error('Alert message is required.');
    }
    const id = this.generateId();
    const alert: AlertItem = {
      id,
      title: options.title ?? 'Confirm action',
      message,
      color: options.color ?? 'confirmation',
      appearance: 'soft',
      position: 'center',
      mode: 'confirmation',
      duration: 0,
      dismissible: false,
      confirmText: options.confirmText ?? 'Confirm',
      cancelText: options.cancelText ?? 'Cancel',
      createdAt: Date.now(),
      closing: false,
    };

    this.alertsState.update((current) => [...current, alert]);
    return new Promise<boolean>((resolve) => {
      this.confirmationResolvers.set(id, resolve);
    });
  }

  confirmAction(id: string): void {
    this.resolveConfirmation(id, true);
  }

  cancelConfirmation(id: string): void {
    this.resolveConfirmation(id, false);
  }

  // ===========================================================================
  // Actions
  // ===========================================================================

  runAction(id: string): void {
    const item = this.alerts().find((alert) => alert.id === id);
    if (!item?.action || item.closing) {
      return;
    }
    item.action.handler?.();
    this.actionEvents.next({
      id,
      value: item.action.value,
    });
    this.dismiss(id);
  }

  // ===========================================================================
  // Pause / Resume
  // ===========================================================================
  pause(id: string): void {
    const item = this.alerts().find((alert) => alert.id === id);
    if (!item || item.closing) {
      return;
    }
    const deadline = this.deadlines.get(id);
    if (deadline === undefined) {
      return;
    }
    this.remaining.set(id, Math.max(0, deadline - Date.now()));
    this.clearTimer(id);
  }

  resume(id: string): void {
    const duration = this.remaining.get(id);
    const item = this.alerts().find((alert) => alert.id === id);
    if (duration === undefined || !item || item.closing) {
      return;
    }
    this.remaining.delete(id);
    if (duration <= 0) {
      this.dismiss(id);

      return;
    }
    this.scheduleDismiss({
      ...item,
      duration,
    });
  }

  // ===========================================================================
  // Dismiss
  // ===========================================================================
  dismiss(id: string): void {
    const item = this.alerts().find((alert) => alert.id === id);
    if (!item || item.closing) {
      return;
    }
    this.clearTimer(id);
    this.remaining.delete(id);

    /**
     * If a confirmation is dismissed without
     * explicitly confirming it, treat that as false.
     */
    const resolver = this.confirmationResolvers.get(id);
    if (resolver) {
      this.confirmationResolvers.delete(id);

      resolver(false);
    }

    /**
     * Keep it in the DOM while CSS performs
     * the exit animation.
     */
    this.alertsState.update((current) =>
      current.map((alert) =>
        alert.id === id
          ? {
              ...alert,
              closing: true,
            }
          : alert,
      ),
    );
    /**
     * Server-rendered content has no visible animation.
     */
    if (!this.browser) {
      this.finalizeDismiss(id);
      return;
    }
    const timer = setTimeout(() => {
      this.finalizeDismiss(id);
    }, this.exitDuration);
    this.exitTimers.set(id, timer);
  }

  dismissAll(): void {
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }
    for (const timer of this.exitTimers.values()) {
      clearTimeout(timer);
    }
    this.timers.clear();
    this.exitTimers.clear();
    this.remaining.clear();
    this.deadlines.clear();
    for (const resolve of this.confirmationResolvers.values()) {
      resolve(false);
    }
    this.confirmationResolvers.clear();
    this.alertsState.set([]);
  }

  // ===========================================================================
  // Alert creation
  // ===========================================================================

  private createAlert(options: AlertOptions): AlertItem {
    const message = options.message.trim();
    if (!message) {
      throw new Error('Alert message is required.');
    }
    const mode = options.mode ?? 'toast';
    const requestedDuration = options.duration ?? (mode === 'toast' && !options.action ? 5000 : 0);
    this.validateDuration(requestedDuration);

    /**
     * Centered popups and confirmations stay visible
     * until explicitly dismissed.
     */
    const duration = mode === 'popup' || mode === 'confirmation' ? 0 : requestedDuration;

    return {
      id: this.generateId(),
      title: options.title,
      message,
      color: options.color ?? 'primary',
      appearance: options.appearance ?? 'soft',
      position:
        mode === 'popup' || mode === 'confirmation' ? 'center' : (options.position ?? 'top-right'),
      mode,
      duration,
      dismissible: mode === 'confirmation' ? false : (options.dismissible ?? true),
      action: options.action,
      createdAt: Date.now(),
      closing: false,
    };
  }

  // ===========================================================================
  // Auto dismiss
  // ===========================================================================

  private scheduleDismiss(alert: AlertItem): void {
    if (!this.browser || alert.duration <= 0 || alert.closing) {
      return;
    }
    this.clearTimer(alert.id);
    this.deadlines.set(alert.id, Date.now() + alert.duration);
    const timer = setTimeout(() => {
      this.dismiss(alert.id);
    }, alert.duration);
    this.timers.set(alert.id, timer);
  }

  // ===========================================================================
  // Confirmation resolution
  // ===========================================================================

  private resolveConfirmation(id: string, result: boolean): void {
    const resolver = this.confirmationResolvers.get(id);
    if (!resolver) {
      return;
    }
    /**
     * Delete first so dismiss() does not
     * resolve it a second time as false.
     */
    this.confirmationResolvers.delete(id);
    resolver(result);
    this.dismiss(id);
  }

  // ===========================================================================
  // Final removal
  // ===========================================================================

  private finalizeDismiss(id: string): void {
    const exitTimer = this.exitTimers.get(id);
    if (exitTimer) {
      clearTimeout(exitTimer);
    }
    this.exitTimers.delete(id);
    this.clearTimer(id);
    this.remaining.delete(id);
    this.alertsState.update((current) => current.filter((item) => item.id !== id));
  }

  // ===========================================================================
  // Timer cleanup
  // ===========================================================================

  private clearTimer(id: string): void {
    this.deadlines.delete(id);
    const timer = this.timers.get(id);
    if (!timer) {
      return;
    }
    clearTimeout(timer);
    this.timers.delete(id);
  }

  // ===========================================================================
  // Validation
  // ===========================================================================
  private ensureCapacity(): void {
    if (this.alerts().length >= this.maxAlerts) {
      throw new Error(`Dismiss existing alerts before adding more (limit: ${this.maxAlerts}).`);
    }
  }

  private validateDuration(duration: number): void {
    if (!Number.isFinite(duration) || duration < 0 || duration > 2_147_483_647) {
      throw new RangeError('Alert duration must be between 0 and 2147483647 milliseconds.');
    }
  }

  // ===========================================================================
  // ID
  // ===========================================================================
  private generateId(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    return `alert-${Date.now()}-` + Math.random().toString(36).slice(2);
  }
}
