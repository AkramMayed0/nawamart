import { create } from 'zustand'
import { persist } from 'zustand/middleware'

function applyTheme(theme) {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

// Apply on load
const saved = (() => {
  try {
    const raw = localStorage.getItem('nawamart-theme')
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed?.state?.theme === 'dark') return 'dark'
    }
  } catch {}
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
})()
applyTheme(saved)

export const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: saved,
      setTheme: (theme) => {
        applyTheme(theme)
        set({ theme })
      },
      toggleTheme: () => {
        const next = get().theme === 'dark' ? 'light' : 'dark'
        applyTheme(next)
        set({ theme: next })
      },
    }),
    {
      name: 'nawamart-theme',
      partialize: (state) => ({ theme: state.theme }),
    }
  )
)
