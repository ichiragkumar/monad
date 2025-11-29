/**
 * Centralized color system with semantic design tokens
 * Elegant Dark-Green Palette - Professional & Premium
 * NO purple, NO blue, NO gradients - ONLY approved colors
 */

export const colors = {
  light: {
    bg: {
      app: '#F9FAFB',
      surface: '#FFFFFF',
      elevated: '#F3F4F6',
      hover: '#E5E7EB',
    },
    text: {
      primary: '#111827',
      muted: '#6B7280',
      inverted: '#F9FAFB',
      secondary: '#4B5563',
    },
    accent: {
      primary: '#0F7A45',
      primaryDark: '#12A55C',
      primaryPressed: '#0A5B34',
      secondary: '#134E3A',
    },
    border: {
      subtle: '#E5E7EB',
      strong: '#D1D5DB',
      focus: '#0F7A45',
    },
    status: {
      success: '#0F7A45',
      error: '#EF4444',
      warning: '#F59E0B',
      info: '#0F7A45',
    },
    shadow: {
      soft: 'rgba(0, 0, 0, 0.05)',
      medium: 'rgba(0, 0, 0, 0.1)',
      strong: 'rgba(0, 0, 0, 0.15)',
    },
  },
  dark: {
    bg: {
      app: '#0A0A0C',
      surface: '#111113',
      elevated: '#0D0D10',
      hover: '#1A1A1E',
    },
    text: {
      primary: '#F3F4F6',
      muted: '#A1A1AA',
      inverted: '#0A0A0C',
      secondary: '#A1A1AA',
    },
    accent: {
      primary: '#0F7A45',
      primaryDark: '#12A55C',
      primaryPressed: '#0A5B34',
      secondary: '#134E3A',
    },
    border: {
      subtle: '#1A1A1E',
      strong: '#27272A',
      focus: '#0F7A45',
    },
    status: {
      success: '#0F7A45',
      error: '#EF4444',
      warning: '#F59E0B',
      info: '#0F7A45',
    },
    shadow: {
      soft: 'rgba(0, 0, 0, 0.3)',
      medium: 'rgba(0, 0, 0, 0.5)',
      strong: 'rgba(0, 0, 0, 0.7)',
    },
  },
} as const

export type ThemeMode = keyof typeof colors
export type ColorToken = typeof colors.light
