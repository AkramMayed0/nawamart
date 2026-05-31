import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useCustomerAuthStore = create(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isLoading: false,

      login: (token, user) => set({ token, user }),
      logout: () => set({ token: null, user: null }),

      setUser: (user) => set({ user }),
      setLoading: (isLoading) => set({ isLoading }),

      isLoggedIn: () => !!get().token,
    }),
    {
      name: 'nawamart-customer-auth',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
      }),
      merge: (persisted, current) => ({
        ...current,
        ...persisted,
      }),
    }
  )
)
