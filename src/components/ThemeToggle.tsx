import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'
import './ThemeToggle.css'

export default function ThemeToggle() {
  const { toggleTheme, isDark } = useTheme()

  return (
    <button
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  )
}

