import { colors, ThemeMode } from './colors'

/**
 * Get theme colors for a specific mode
 */
export const getTheme = (mode: ThemeMode) => colors[mode]

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

