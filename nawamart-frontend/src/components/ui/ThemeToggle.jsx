import { Moon, Sun } from 'lucide-react'
import { useThemeStore } from '@/store/themeStore'
import clsx from 'clsx'

export default function ThemeToggle({ className = '', compact = false }) {
  const theme = useThemeStore((s) => s.theme)
  const toggleTheme = useThemeStore((s) => s.toggleTheme)
  const isDark = theme === 'dark'

  if (compact) {
    return (
      <button
        onClick={toggleTheme}
        className={clsx(
          'flex items-center justify-center w-9 h-9 rounded-xl transition-colors',
          'text-text-muted hover:text-text hover:bg-bg-soft',
          className,
        )}
        aria-label={isDark ? 'الوضع النهاري' : 'الوضع الليلي'}
      >
        {isDark ? <Sun size={16} /> : <Moon size={16} />}
      </button>
    )
  }

  return (
    <button
      onClick={toggleTheme}
      className={clsx(
        'flex items-center gap-3 rounded-2xl px-3 py-2.5 font-cairo text-sm font-semibold transition-all w-full',
        'text-text-muted hover:bg-bg-soft hover:text-text',
        className,
      )}
      aria-label={isDark ? 'الوضع النهاري' : 'الوضع الليلي'}
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
      {isDark ? 'الوضع النهاري' : 'الوضع الليلي'}
    </button>
  )
}
