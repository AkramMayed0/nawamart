/**
 * DashboardLayout
 *
 * Desktop (md+):
 * ┌──────────┬────────────────────────────┐
 * │          │                            │
 * │ Sidebar  │      <Outlet />            │
 * │  256px   │   (scrollable content)     │
 * │          │                            │
 * └──────────┴────────────────────────────┘
 *
 * Mobile (<md):
 * ┌────────────────────────────────────────┐
 * │  ☰  NawaMart              [hamburger]  │  ← top bar
 * ├────────────────────────────────────────┤
 * │                                        │
 * │          <Outlet />                    │
 * │                                        │
 * └────────────────────────────────────────┘
 * Tapping ☰ slides in MobileDrawer from the right.
 */
import { useState } from 'react'
import { Outlet }   from 'react-router-dom'
import { Menu, Store } from 'lucide-react'
import DashboardSidebar from '@/components/dashboard/DashboardSidebar'
import MobileDrawer     from '@/components/dashboard/MobileDrawer'
import { useAuthStore } from '@/store/authStore'

export default function DashboardLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const storeRaw = useAuthStore(s => s.store)
  const store    = Array.isArray(storeRaw) ? storeRaw[0] : storeRaw

  return (
    <div className="min-h-screen bg-bg flex flex-col" dir="rtl">

      {/* ── Thin accent gradient line at very top ── */}
      <div className="h-0.5 w-full bg-gradient-to-l from-accent via-primary to-accent shrink-0" />

      <div className="flex flex-1 min-h-0">

        {/* ── Desktop sidebar (hidden on mobile) ── */}
        <div className="hidden md:flex flex-col w-64 shrink-0 sticky top-0 h-screen overflow-y-auto shadow-sm">
          <DashboardSidebar />
        </div>

        {/* ── Main area ── */}
        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">

          {/* ── Mobile top bar (visible only on mobile) ── */}
          <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-border shadow-sm shrink-0 z-30">
            {/* Store name */}
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center shrink-0 ring-1 ring-primary/10">
                <Store size={15} className="text-primary" />
              </div>
              <span className="font-cairo font-bold text-sm text-text truncate">
                {store?.name ?? 'لوحة التحكم'}
              </span>
            </div>

            {/* Hamburger */}
            <button
              onClick={() => setDrawerOpen(true)}
              className="w-9 h-9 flex items-center justify-center rounded-2xl bg-bg-soft text-text-muted hover:bg-accent/10 hover:text-accent transition-colors"
              aria-label="فتح القائمة"
            >
              <Menu size={20} />
            </button>
          </header>

          {/* ── Page content ── */}
          <main className="flex-1 overflow-y-auto min-h-0">
            <Outlet />
          </main>

        </div>

      </div>

      {/* ── Mobile drawer overlay ── */}
      <MobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />

    </div>
  )
}
