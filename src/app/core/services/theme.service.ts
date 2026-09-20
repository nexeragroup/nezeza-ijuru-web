import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { computed, DestroyRef, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { THEME_CONFIG } from '../../config/theme.config';
import {
  ThemeColor,
  ThemeMode,
  THEME_COLORS,
  ResolvedThemeMode,
  ThemePreference,
  isThemeColor,
  isThemeMode,
} from '../models/theme.model';
import { StorageService } from './storage.service';

const STORAGE_KEYS = {
  color: 'theme.color',
  mode: 'theme.mode',
} as const;

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly storage = inject(StorageService);
  private readonly config = inject(THEME_CONFIG);
  private readonly browser = isPlatformBrowser(this.platformId);

  // ===========================================================================
  // Browser media query
  // ===========================================================================
  private systemThemeQuery: MediaQueryList | null = null;

  // ===========================================================================
  // Internal state
  // ===========================================================================
  private readonly colorState = signal<ThemeColor>(this.config.defaultColor);
  private readonly modeState = signal<ThemeMode>(this.config.defaultMode);
  private readonly systemDarkState = signal(false);
  private readonly initializedState = signal(false);

  // ===========================================================================
  // Public state
  // ===========================================================================
  readonly colorTheme = this.colorState.asReadonly();
  readonly mode = this.modeState.asReadonly();
  readonly initialized = this.initializedState.asReadonly();
  readonly systemDark = this.systemDarkState.asReadonly();
  readonly availableColors = THEME_COLORS;

  // ===========================================================================
  // Derived state
  // ===========================================================================
  readonly resolvedMode = computed<ResolvedThemeMode>(() => {
    const mode = this.modeState();
    if (mode !== 'system') {
      return mode;
    }
    return this.systemDarkState() ? 'dark' : 'light';
  });
  readonly dark = computed(() => this.resolvedMode() === 'dark');
  readonly light = computed(() => this.resolvedMode() === 'light');
  readonly preference = computed<ThemePreference>(() => ({
    color: this.colorState(),
    mode: this.modeState(),
  }));

  // ===========================================================================
  // Initialization
  // ===========================================================================

  initialize(): void {
    if (this.initializedState()) {
      return;
    }
    if (!this.browser) {
      this.initializedState.set(true);
      return;
    }
    this.initializeSystemTheme();
    this.restorePreference();
    this.applyTheme();
    this.listenForStorageChanges();
    this.initializedState.set(true);
  }

  // ===========================================================================
  // Color
  // ===========================================================================

  setColorTheme(color: ThemeColor): void {
    this.ensureInitialized();
    if (!isThemeColor(color)) {
      throw new Error(`[ThemeService] Unsupported color theme: "${color}".`);
    }
    if (this.colorState() === color) {
      return;
    }
    this.colorState.set(color);
    this.persistColor(color);
    this.applyTheme();
  }

  // ===========================================================================
  // Mode
  // ===========================================================================

  setMode(mode: ThemeMode): void {
    this.ensureInitialized();
    if (!isThemeMode(mode)) {
      throw new Error(`[ThemeService] Unsupported theme mode: "${mode}".`);
    }
    if (this.modeState() === mode) {
      return;
    }
    this.modeState.set(mode);
    this.persistMode(mode);
    this.applyTheme();
  }

  // ===========================================================================
  // Toggle
  // ===========================================================================
  toggleMode(): void {
    this.ensureInitialized();
    /**
     * If mode = system, use the currently resolved
     * OS mode to determine the opposite mode.
     *
     * system + dark
     *      ↓
     * light
     *
     * system + light
     *      ↓
     * dark
     */
    const nextMode: ThemeMode = this.resolvedMode() === 'dark' ? 'light' : 'dark';
    this.setMode(nextMode);
  }

  // ===========================================================================
  // System mode
  // ===========================================================================
  useSystemMode(): void {
    this.setMode('system');
  }

  // ===========================================================================
  // Combined theme
  // ===========================================================================
  setTheme(color: ThemeColor, mode: ThemeMode): void {
    this.ensureInitialized();
    if (!isThemeColor(color)) {
      throw new Error(`[ThemeService] Unsupported color theme: "${color}".`);
    }
    if (!isThemeMode(mode)) {
      throw new Error(`[ThemeService] Unsupported theme mode: "${mode}".`);
    }
    this.colorState.set(color);
    this.modeState.set(mode);
    this.persistColor(color);
    this.persistMode(mode);
    /**
     * Apply once instead of applying after
     * each individual change.
     */
    this.applyTheme();
  }

  // ===========================================================================
  // Reset
  // ===========================================================================

  reset(): void {
    this.ensureInitialized();
    this.storage.remove(STORAGE_KEYS.color, {
      area: 'local',
    });
    this.storage.remove(STORAGE_KEYS.mode, {
      area: 'local',
    });
    this.colorState.set(this.config.defaultColor);
    this.modeState.set(this.config.defaultMode);
    this.applyTheme();
  }

  // ===========================================================================
  // Restoration
  // ===========================================================================
  private restorePreference(): void {
    const color = this.storage.get<ThemeColor>(STORAGE_KEYS.color, {
      area: 'local',
      validate: isThemeColor,
    });
    const mode = this.storage.get<ThemeMode>(STORAGE_KEYS.mode, {
      area: 'local',
      validate: isThemeMode,
    });
    this.colorState.set(color ?? this.config.defaultColor);
    this.modeState.set(mode ?? this.config.defaultMode);
  }

  // ===========================================================================
  // Persistence
  // ===========================================================================
  private persistColor(color: ThemeColor): void {
    this.storage.set(STORAGE_KEYS.color, color, {
      area: 'local',
    });
  }

  private persistMode(mode: ThemeMode): void {
    this.storage.set(STORAGE_KEYS.mode, mode, {
      area: 'local',
    });
  }

  // ===========================================================================
  // System theme
  // ===========================================================================

  private initializeSystemTheme(): void {
    if (typeof window.matchMedia !== 'function') {
      this.systemDarkState.set(false);
      return;
    }
    this.systemThemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    this.systemDarkState.set(this.systemThemeQuery.matches);
    const listener = (event: MediaQueryListEvent) => {
      this.systemDarkState.set(event.matches);
      /**
       * Only modify the application when the
       * user selected "system".
       */
      if (this.modeState() === 'system') {
        this.applyTheme();
      }
    };

    this.systemThemeQuery.addEventListener('change', listener);
    this.destroyRef.onDestroy(() => {
      this.systemThemeQuery?.removeEventListener('change', listener);
    });
  }

  // ===========================================================================
  // Cross-tab synchronization
  // ===========================================================================

  private listenForStorageChanges(): void {
    const listener = (event: StorageEvent) => {
      if (event.storageArea !== window.localStorage) {
        return;
      }
      /**
       * Another browser tab may have changed
       * the user's theme.
       *
       * Reload our namespaced preferences.
       */
      this.syncFromStorage();
    };

    window.addEventListener('storage', listener);

    this.destroyRef.onDestroy(() => {
      window.removeEventListener('storage', listener);
    });
  }

  private syncFromStorage(): void {
    const previousColor = this.colorState();

    const previousMode = this.modeState();

    this.restorePreference();

    if (previousColor !== this.colorState() || previousMode !== this.modeState()) {
      this.applyTheme();
    }
  }

  // ===========================================================================
  // DOM
  // ===========================================================================

  private applyTheme(): void {
    if (!this.browser) {
      return;
    }

    const root = this.document.documentElement;

    const color = this.colorState();

    const mode = this.resolvedMode();

    root.setAttribute('data-color-theme', color);

    root.setAttribute('data-theme', mode);

    /**
     * Helps native browser controls such as
     * form elements and scrollbars use the
     * appropriate light/dark appearance.
     */
    root.style.colorScheme = mode;
  }

  // ===========================================================================
  // Initialization safety
  // ===========================================================================

  private ensureInitialized(): void {
    if (!this.initializedState()) {
      this.initialize();
    }
  }
}
