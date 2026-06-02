import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const DEFAULTS = {
  showRecentOrders: true,
  showSubscriptionSummary: true,
  showFeaturedProducts: true,
}

export const usePreferencesStore = create(
  persist(
    (set) => ({
      ...DEFAULTS,

      setShowRecentOrders: (val) => set({ showRecentOrders: val }),
      setShowSubscriptionSummary: (val) => set({ showSubscriptionSummary: val }),
      setShowFeaturedProducts: (val) => set({ showFeaturedProducts: val }),

      resetAll: () => set({ ...DEFAULTS }),
    }),
    { name: 'nawamart-dashboard-preferences' }
  )
)
