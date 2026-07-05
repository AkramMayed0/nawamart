import { useState, useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Check, ChevronDown, Plus, Store } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { getMyStores, switchActiveStore } from '@/api/stores'
import { Link } from 'react-router-dom'

export default function StoreSwitcher({ onNavClick }) {
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef(null)

  const activeStore = useAuthStore((state) => state.store)
  const setStores = useAuthStore((state) => state.setStores)
  const switchStore = useAuthStore((state) => state.switchStore)
  const token = useAuthStore((state) => state.token)

  const { data: stores = [] } = useQuery({
    queryKey: ['my-stores', token],
    queryFn: () => getMyStores().then((res) => res.data.data ?? []),
    enabled: !!token,
    staleTime: 60_000,
  })

  useEffect(() => {
    if (stores.length > 0) {
      setStores(stores)
    }
  }, [stores, setStores])

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function handleSwitch(store) {
    try {
      await switchActiveStore(store._id)
      switchStore(store)
      setOpen(false)
      if (onNavClick) onNavClick()
    } catch {
      // toast already handled by axios interceptor
    }
  }

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2 rounded-xl bg-bg-soft px-3 py-2 text-right transition-colors hover:bg-primary-50"
      >
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <Store size={14} className="text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-cairo text-xs font-bold text-text">
            {activeStore?.name ?? 'اختر المتجر'}
          </p>
        </div>
        <ChevronDown size={14} className="shrink-0 text-text-subtle" />
      </button>

      {open && (
        <div className="absolute bottom-full right-0 z-50 mb-2 w-full rounded-xl border border-border bg-white py-2 shadow-lg">
          {stores.length === 0 && (
            <p className="px-3 py-2 font-cairo text-xs text-text-muted">لا توجد متاجر</p>
          )}

          {stores.map((store) => {
            const isActive = activeStore?._id === store._id
            return (
              <button
                key={store._id}
                type="button"
                onClick={() => handleSwitch(store)}
                className={`flex w-full items-center gap-3 px-3 py-2 text-right transition-colors hover:bg-bg-soft ${
                  isActive ? 'bg-primary-50' : ''
                }`}
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-bg-soft">
                  {store.logo ? (
                    <img src={store.logo} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <Store size={13} className="text-text-subtle" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-cairo text-xs font-bold text-text">{store.name}</p>
                  <p className="truncate font-cairo text-[10px] text-text-subtle">{store.plan}</p>
                </div>
                {isActive && <Check size={14} className="shrink-0 text-primary" />}
              </button>
            )
          })}

          <div className="mt-1 border-t border-border pt-1">
            <Link
              to="/onboarding"
              onClick={() => { setOpen(false); if (onNavClick) onNavClick() }}
              className="flex items-center gap-3 px-3 py-2 text-right font-cairo text-xs font-bold text-primary transition-colors hover:bg-bg-soft"
            >
              <Plus size={14} />
              متجر جديد
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}