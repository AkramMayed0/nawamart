import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ── Separate admin store so it never conflicts with merchant/customer auth ──
export const useAdminStore = create(
  persist(
    (set, get) => ({
      token:     null,
      admin:     null,

      login:  (token, admin) => set({ token, admin }),
      logout: () => set({ token: null, admin: null }),

      isLoggedIn: () => !!get().token,
    }),
    {
      name: 'nawamart-admin',
      partialize: (state) => ({ token: state.token, admin: state.admin }),
    }
  )
)
