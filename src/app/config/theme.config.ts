import { InjectionToken } from '@angular/core';
import { ThemeColor, ThemeMode } from '../core/models/theme.model';

export interface ThemeConfig {
  defaultColor: ThemeColor;
  defaultMode: ThemeMode;
}

export const THEME_CONFIG = new InjectionToken<ThemeConfig>('THEME_CONFIG', {
  factory: () => ({
    defaultColor: 'blue',
    defaultMode: 'light',
  }),
});
