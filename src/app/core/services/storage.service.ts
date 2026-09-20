import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { STORAGE_CONFIG, type StorageArea } from '../../config/storage.config';
import {
  StorageFailure,
  StorageReadOptions,
  StorageWriteOptions,
  StoredEnvelope,
} from '../models/storage.model';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly config = inject(STORAGE_CONFIG);
  private readonly lastFailureState = signal<StorageFailure | null>(null);

  /**
   * Last storage problem.
   *
   * Useful for diagnostics without forcing
   * every caller to catch browser storage errors.
   */
  readonly lastFailure = this.lastFailureState.asReadonly();

  // ===========================================================================
  // Read
  // ===========================================================================

  get<T>(key: string, options: StorageReadOptions<T> = {}): T | null {
    this.assertKey(key);
    const area = options.area ?? this.config.defaultArea;
    const storage = this.getStorage(area);
    if (!storage) {
      this.fail('unavailable', area, key);

      return null;
    }
    const storageKey = this.createKey(key);
    let rawValue: string | null;
    try {
      rawValue = storage.getItem(storageKey);
    } catch {
      this.fail('unavailable', area, key);
      return null;
    }
    if (rawValue === null) {
      return null;
    }
    let parsed: unknown;
    try {
      parsed = JSON.parse(rawValue);
    } catch {
      this.remove(key, { area });
      this.fail('deserialization-failed', area, key);
      return null;
    }

    if (!this.isEnvelope(parsed)) {
      /**
       * Data at a versioned application key should
       * always use our storage envelope.
       *
       * Treat unknown/corrupted data as invalid.
       */
      this.remove(key, { area });
      this.fail('deserialization-failed', area, key);
      return null;
    }

    // -------------------------------------------------------------------------
    // Expiration
    // -------------------------------------------------------------------------

    if (parsed.expiresAt !== null && Date.now() >= parsed.expiresAt) {
      this.remove(key, { area });
      return null;
    }
    const value = parsed.value;

    // -------------------------------------------------------------------------
    // Optional runtime validation
    // -------------------------------------------------------------------------

    if (options.validate && !options.validate(value)) {
      this.remove(key, { area });
      this.fail('validation-failed', area, key);
      return null;
    }
    this.clearFailure();
    return value as T;
  }

  // ===========================================================================
  // Write
  // ===========================================================================

  set<T>(key: string, value: T, options: StorageWriteOptions = {}): boolean {
    this.assertKey(key);
    const area = options.area ?? this.config.defaultArea;
    this.assertTtl(options.ttlMs);
    const storage = this.getStorage(area);
    if (!storage) {
      this.fail('unavailable', area, key);
      return false;
    }
    const now = Date.now();
    const envelope: StoredEnvelope<T> = {
      storedAt: now,
      expiresAt: options.ttlMs === undefined ? null : now + options.ttlMs,
      value,
    };
    let serialized: string;
    try {
      serialized = JSON.stringify(envelope);
    } catch {
      this.fail('serialization-failed', area, key);
      return false;
    }

    try {
      storage.setItem(this.createKey(key), serialized);
      this.clearFailure();
      return true;
    } catch (error: unknown) {
      if (this.isQuotaExceeded(error)) {
        this.fail('quota-exceeded', area, key);
        return false;
      }
      this.fail('unavailable', area, key);
      return false;
    }
  }

  // ===========================================================================
  // Existence
  // ===========================================================================

  has(key: string, area: StorageArea = this.config.defaultArea): boolean {
    this.assertKey(key);
    const storage = this.getStorage(area);
    if (!storage) {
      return false;
    }
    try {
      return storage.getItem(this.createKey(key)) !== null;
    } catch {
      return false;
    }
  }

  // ===========================================================================
  // Remove
  // ===========================================================================

  remove(
    key: string,
    options: {
      area?: StorageArea;
    } = {},
  ): boolean {
    this.assertKey(key);
    const area = options.area ?? this.config.defaultArea;
    const storage = this.getStorage(area);
    if (!storage) {
      this.fail('unavailable', area, key);
      return false;
    }
    try {
      storage.removeItem(this.createKey(key));
      this.clearFailure();
      return true;
    } catch {
      this.fail('unavailable', area, key);
      return false;
    }
  }

  // ===========================================================================
  // Clear
  // ===========================================================================

  /**
   * Clears only this application's namespaced values.
   *
   * It intentionally does NOT call:
   *
   * localStorage.clear()
   *
   * because other applications may share the same origin.
   */
  clear(area: StorageArea = this.config.defaultArea): boolean {
    const storage = this.getStorage(area);
    if (!storage) {
      this.fail('unavailable', area);
      return false;
    }
    const prefix = this.keyPrefix();
    try {
      const keysToRemove: string[] = [];
      for (let index = 0; index < storage.length; index++) {
        const key = storage.key(index);
        if (key?.startsWith(prefix)) {
          keysToRemove.push(key);
        }
      }

      /**
       * Remove after enumeration instead of mutating
       * storage while walking its indexes.
       */
      for (const key of keysToRemove) {
        storage.removeItem(key);
      }
      this.clearFailure();
      return true;
    } catch {
      this.fail('unavailable', area);
      return false;
    }
  }

  /**
   * Clears this application's values from both
   * localStorage and sessionStorage.
   */
  clearAll(): void {
    this.clear('local');
    this.clear('session');
  }

  // ===========================================================================
  // Availability
  // ===========================================================================

  isAvailable(area: StorageArea = this.config.defaultArea): boolean {
    const storage = this.getStorage(area);
    if (!storage) {
      return false;
    }
    const testKey = `${this.keyPrefix()}__test__`;
    try {
      storage.setItem(testKey, '1');
      storage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  // ===========================================================================
  // Internal
  // ===========================================================================

  private getStorage(area: StorageArea): Storage | null {
    if (!this.browser) {
      return null;
    }

    /**
     * Merely accessing localStorage/sessionStorage can
     * throw a SecurityError in some browser environments.
     */
    try {
      return area === 'local' ? window.localStorage : window.sessionStorage;
    } catch {
      return null;
    }
  }

  private createKey(key: string): string {
    return `${this.keyPrefix()}${key}`;
  }

  private keyPrefix(): string {
    return `${this.config.namespace}` + `:v${this.config.version}:`;
  }

  private isEnvelope(value: unknown): value is StoredEnvelope<unknown> {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return false;
    }

    const record = value as Record<string, unknown>;

    return (
      typeof record['storedAt'] === 'number' &&
      (record['expiresAt'] === null || typeof record['expiresAt'] === 'number') &&
      Object.prototype.hasOwnProperty.call(record, 'value')
    );
  }

  private isQuotaExceeded(error: unknown): boolean {
    return (
      error instanceof DOMException &&
      (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED')
    );
  }

  private assertKey(key: string): void {
    if (!key.trim()) {
      throw new Error('[StorageService] Storage key cannot be empty.');
    }
  }

  private assertTtl(ttlMs: number | undefined): void {
    if (ttlMs === undefined) {
      return;
    }

    if (!Number.isFinite(ttlMs) || ttlMs < 0) {
      throw new RangeError('[StorageService] ttlMs must be a finite non-negative number.');
    }
  }

  private fail(reason: StorageFailure['reason'], area: StorageArea, key?: string): void {
    this.lastFailureState.set({
      reason,
      area,
      key,
    });
  }

  private clearFailure(): void {
    this.lastFailureState.set(null);
  }
}
