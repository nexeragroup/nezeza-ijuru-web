import { computed, Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  private static readonly SHOW_DELAY_MS = 150;
  private static readonly MIN_VISIBLE_MS = 300;

  private readonly activeRequestsState = signal(0);
  private readonly visibleState = signal(false);
  private showTimer: ReturnType<typeof setTimeout> | null = null;
  private hideTimer: ReturnType<typeof setTimeout> | null = null;
  private visibleSince: number | null = null;
  readonly activeRequests = this.activeRequestsState.asReadonly();
  readonly loading = computed(() => this.activeRequestsState() > 0);
  readonly visible = this.visibleState.asReadonly();

  start(): void {
    const previousCount = this.activeRequestsState();
    this.activeRequestsState.update((count) => count + 1);
    if (previousCount > 0) {
      return;
    }
    this.cancelHideTimer();
    this.showTimer = setTimeout(() => {
      this.showTimer = null;
      if (this.activeRequestsState() === 0) {
        return;
      }
      this.visibleSince = Date.now();
      this.visibleState.set(true);
    }, LoadingService.SHOW_DELAY_MS);
  }

  stop(): void {
    this.activeRequestsState.update((count) => Math.max(0, count - 1));
    if (this.activeRequestsState() > 0) {
      return;
    }
    this.cancelShowTimer();
    if (!this.visibleState()) {
      return;
    }
    const elapsed = this.visibleSince === null ? 0 : Date.now() - this.visibleSince;
    const remaining = Math.max(0, LoadingService.MIN_VISIBLE_MS - elapsed);
    this.hideTimer = setTimeout(() => {
      this.hideTimer = null;
      if (this.activeRequestsState() > 0) {
        return;
      }
      this.visibleState.set(false);
      this.visibleSince = null;
    }, remaining);
  }

  reset(): void {
    this.cancelShowTimer();
    this.cancelHideTimer();
    this.activeRequestsState.set(0);
    this.visibleState.set(false);
    this.visibleSince = null;
  }

  private cancelShowTimer(): void {
    if (this.showTimer === null) {
      return;
    }
    clearTimeout(this.showTimer);
    this.showTimer = null;
  }

  private cancelHideTimer(): void {
    if (this.hideTimer === null) {
      return;
    }
    clearTimeout(this.hideTimer);
    this.hideTimer = null;
  }
}
