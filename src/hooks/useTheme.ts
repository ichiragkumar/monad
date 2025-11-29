import { useState, useEffect } from 'react'
import { ThemeMode } from '@/theme/colors'

/**
 * Hook for managing theme (light/dark mode)
 */
export function useTheme() {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    // Check localStorage first
    const stored = localStorage.getItem('theme') as ThemeMode | null
    if (stored && (stored === 'light' || stored === 'dark')) {
      return stored
    }
    
    // Check system preference
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark'
    }
    
    return 'dark' // Default to dark
  })

  useEffect(() => {
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }

  return {
    theme,
    setTheme,
    toggleTheme,
    isDark: theme === 'dark',
    isLight: theme === 'light',
  }
}

