import { colors, ThemeMode, ColorToken } from './colors'

/**
 * Get theme colors for a specific mode
 */
export const getTheme = (mode: ThemeMode): ColorToken => colors[mode]

/**
 * Default theme mode (can be changed based on user preference or system)
 */
export const defaultTheme: ThemeMode = 'dark'

/**
 * Theme utility functions
 */
export const theme = {
  get: getTheme,
  colors,
  defaultMode: defaultTheme,
}

