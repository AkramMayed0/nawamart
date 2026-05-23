import { useState } from 'react'
import { Outlet }   from 'react-router-dom'
import { Menu, ShieldCheck } from 'lucide-react'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminMobileDrawer from '@/components/admin/AdminMobileDrawer'

export default function AdminLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <div className="min-h-screen bg-slate-50 flex" dir="rtl">

      {/* ── Desktop sidebar (hidden on mobile) ── */}
      <div className="hidden md:flex flex-col w-60 shrink-0 sticky top-0 h-screen overflow-y-auto border-l border-slate-200 shadow-sm">
        <AdminSidebar />
      </div>

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">

        {/* ── Mobile top bar (visible only on mobile) ── */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 shrink-0 z-30 shadow-sm">
          {/* Brand name */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center shrink-0">
              <ShieldCheck size={16} className="text-white" />
            </div>
            <span className="font-cairo font-extrabold text-slate-800 truncate">
              لوحة الإدارة
            </span>
          </div>

          {/* Hamburger */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-colors"
            aria-label="فتح القائمة"
          >
            <Menu size={20} />
          </button>
        </header>

        {/* ── Page content ── */}
        <main className="flex-1 overflow-y-auto min-h-0 p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>

      </div>

      {/* ── Mobile drawer overlay ── */}
      <AdminMobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />

    </div>
  )
}
