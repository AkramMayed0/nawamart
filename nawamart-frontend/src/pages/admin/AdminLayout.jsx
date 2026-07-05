import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Menu, Bell, Search, ChevronDown, Settings } from 'lucide-react'
import AdminMobileDrawer from '@/components/admin/AdminMobileDrawer'
import AdminSidebar from '@/components/admin/AdminSidebar'
import { useAdminStore } from '@/store/adminStore'

export default function AdminLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const admin = useAdminStore((state) => state.admin)

  return (
    <div className="flex min-h-screen" dir="rtl" style={{ background: '#0d1117' }}>
      {/* Dark sidebar */}
      <div className="sticky top-0 hidden h-screen w-64 shrink-0 overflow-y-auto md:flex">
        <AdminSidebar />
      </div>

      {/* Main column */}
      <div className="flex h-screen min-w-0 flex-1 flex-col overflow-hidden">
        {/* Top header — dark */}
        <header
          className="z-30 flex shrink-0 items-center justify-between px-5 py-3.5 border-b"
          style={{ background: '#161b22', borderColor: 'rgba(255,255,255,0.06)' }}
        >
          {/* Search */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-white/40 hover:text-white/80 hover:bg-white/8 transition-colors md:hidden"
              aria-label="فتح القائمة"
            >
              <Menu size={18} />
            </button>
            <div className="hidden md:flex items-center gap-2.5 rounded-xl px-4 py-2 w-64 border" style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)' }}>
              <Search size={14} className="text-white/30 shrink-0" />
              <input
                type="text"
                placeholder="بحث في الإدارة..."
                className="bg-transparent font-cairo text-sm text-white/70 outline-none placeholder:text-white/30 w-full"
              />
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <button className="relative flex h-9 w-9 items-center justify-center rounded-xl text-white/40 hover:text-white/70 hover:bg-white/6 transition-colors">
              <Bell size={17} />
              <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-accent" />
            </button>
            <button className="flex h-9 w-9 items-center justify-center rounded-xl text-white/40 hover:text-white/70 hover:bg-white/6 transition-colors">
              <Settings size={17} />
            </button>
            <button
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 border transition-colors hover:bg-white/6"
              style={{ borderColor: 'rgba(255,255,255,0.08)' }}
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-accent-700 text-white font-cairo font-extrabold text-xs shadow-sm shadow-accent/30">
                {admin?.email?.slice(0, 2).toUpperCase() ?? 'AD'}
              </div>
              <span className="hidden font-cairo text-sm font-bold text-white/60 md:block">المشرف</span>
              <ChevronDown size={13} className="text-white/30" />
            </button>
          </div>
        </header>

        {/* Page content — dark bg */}
        <main className="min-h-0 flex-1 overflow-y-auto" style={{ background: '#0d1117' }}>
          <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6 px-5 py-6 md:px-8 md:py-8 page-enter">
            <Outlet />
          </div>
        </main>
      </div>

      <AdminMobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  )
}
