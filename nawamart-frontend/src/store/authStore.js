import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      token: null,
      refreshToken: null,
      user: null,
      store: null,
      stores: [],
      storeRole: null,
      isLoading: false,
      mfaEnabled: false,

      setToken: (token) => set({ token }),
      setRefreshToken: (refreshToken) => set({ refreshToken }),
      setUser: (user) => set({ user }),
      setStore: (store) => set({ store }),
      setStores: (stores) => set({ stores }),
      setLoading: (isLoading) => set({ isLoading }),
      setStoreRole: (storeRole) => set({ storeRole }),
      setMfaEnabled: (mfaEnabled) => set({ mfaEnabled }),

      login: (token, user, refreshToken = null) => set({
        token,
        user,
        refreshToken,
        storeRole: user?.storeRole || null,
        mfaEnabled: user?.mfaEnabled || false,
      }),

      logout: () => set({
        token: null,
        refreshToken: null,
        user: null,
        store: null,
        stores: [],
        storeRole: null,
        mfaEnabled: false,
      }),

      updateUser: (userData) => set((state) => ({
        user: state.user ? { ...state.user, ...userData } : null,
      })),

      updateStore: (storeData) => set((state) => ({
        store: state.store ? { ...state.store, ...storeData } : null,
        stores: state.stores.map((s) =>
          s._id === storeData._id ? { ...s, ...storeData } : s
        ),
      })),

      switchStore: (store) => set({
        store,
        storeRole: store.storeRole || null,
      }),

      isLoggedIn: () => !!get().token,
    }),
    {
      name: 'nawamart-auth',
      partialize: (state) => ({
        token: state.token,
        refreshToken: state.refreshToken,
        user: state.user,
        store: state.store,
        stores: state.stores,
        storeRole: state.storeRole,
        mfaEnabled: state.mfaEnabled,
      }),
    }
  )
)