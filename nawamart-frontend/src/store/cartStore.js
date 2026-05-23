import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useCartStore = create(
  persist(
    (set, get) => ({
      // State
      items: [],        // [{ product, quantity, selectedOptions }]
      storeSlug: null,  // cart belongs to one store at a time
      isOpen: false,    // cart drawer open state

      // Actions
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),

      addItem: (product, quantity = 1, selectedOptions = {}) => {
        const { items, storeSlug } = get()

        // If cart has items from a different store, clear it first
        if (storeSlug && storeSlug !== product.storeSlug) {
          set({ items: [], storeSlug: null })
        }

        const existing = items.find(
          (i) => i.product._id === product._id &&
                 JSON.stringify(i.selectedOptions) === JSON.stringify(selectedOptions)
        )

        if (existing) {
          set({
            items: items.map((i) =>
              i === existing
                ? { ...i, quantity: i.quantity + quantity }
                : i
            ),
          })
        } else {
          set({
            items: [...items, { product, quantity, selectedOptions }],
            storeSlug: product.storeSlug || storeSlug,
          })
        }
      },

      removeItem: (productId, selectedOptions = {}) => {
        set((s) => ({
          items: s.items.filter(
            (i) =>
              !(i.product._id === productId &&
                JSON.stringify(i.selectedOptions) === JSON.stringify(selectedOptions))
          ),
        }))
      },

      updateQuantity: (productId, quantity, selectedOptions = {}) => {
        if (quantity <= 0) {
          get().removeItem(productId, selectedOptions)
          return
        }
        set((s) => ({
          items: s.items.map((i) =>
            i.product._id === productId &&
            JSON.stringify(i.selectedOptions) === JSON.stringify(selectedOptions)
              ? { ...i, quantity }
              : i
          ),
        }))
      },

      clearCart: () => set({ items: [], storeSlug: null }),

      // Computed
      get itemCount() {
        return get().items.reduce((sum, i) => sum + i.quantity, 0)
      },

      get total() {
        return get().items.reduce(
          (sum, i) => sum + i.product.price * i.quantity,
          0
        )
      },

      get isEmpty() {
        return get().items.length === 0
      },
    }),
    {
      name: 'nawamart-cart',
      partialize: (state) => ({
        items: state.items,
        storeSlug: state.storeSlug,
      }),
    }
  )
)
