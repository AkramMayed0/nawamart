import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      token: null,
      user: null,           // { _id, name, email, role: 'merchant'|'customer' }
      store: null,          // merchant's store data (if any)
      isLoading: false,

      // Actions
      setToken: (token) => set({ token }),
      setUser: (user) => set({ user }),
      setStore: (store) => set({ store }),
      setLoading: (isLoading) => set({ isLoading }),

      login: (token, user) => set({ token, user }),

      logout: () => set({ token: null, user: null, store: null }),

      updateStore: (storeData) => set((state) => ({
        store: { ...state.store, ...storeData },
      })),

      // Computed helpers
      isMerchant: () => get().user?.role === 'merchant',
      isCustomer: () => get().user?.role === 'customer',
      isLoggedIn: () => !!get().token,
    }),
    {
      name: 'nawamart-auth',
      // Only persist these keys
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        store: state.store,
      }),
    }
  )
)
