export const THEME_COLORS = ['blue', 'green'] as const;

export type ThemeColor = (typeof THEME_COLORS)[number];

export const THEME_MODES = ['light', 'dark', 'system'] as const;

export type ThemeMode = (typeof THEME_MODES)[number];

export type ResolvedThemeMode = 'light' | 'dark';

export interface ThemePreference {
  color: ThemeColor;
  mode: ThemeMode;
}

export function isThemeColor(value: unknown): value is ThemeColor {
  return typeof value === 'string' && THEME_COLORS.includes(value as ThemeColor);
}

export function isThemeMode(value: unknown): value is ThemeMode {
  return typeof value === 'string' && THEME_MODES.includes(value as ThemeMode);
}
