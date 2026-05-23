/**
 * DashboardLayout
 *
 * Desktop (md+):
 * ┌──────────┬────────────────────────────┐
 * │          │                            │
 * │ Sidebar  │      <Outlet />            │
 * │  240px   │   (scrollable content)     │
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
  const store = useAuthStore(s => s.store)

  return (
    <div className="min-h-screen bg-bg flex" dir="rtl">

      {/* ── Desktop sidebar (hidden on mobile) ── */}
      <div className="hidden md:flex flex-col w-60 shrink-0 sticky top-0 h-screen overflow-y-auto border-l border-border">
        <DashboardSidebar />
      </div>

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">

        {/* ── Mobile top bar (visible only on mobile) ── */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-border shrink-0 z-30">
          {/* Store name */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Store size={14} className="text-primary" />
            </div>
            <span className="font-cairo font-bold text-sm text-text truncate">
              {store?.name ?? 'لوحة التحكم'}
            </span>
          </div>

          {/* Hamburger */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-bg-soft text-text-muted hover:bg-border hover:text-text transition-colors"
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

      {/* ── Mobile drawer overlay ── */}
      <MobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />

    </div>
  )
}
