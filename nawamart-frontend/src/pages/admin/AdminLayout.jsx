import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Menu, ShieldCheck } from 'lucide-react'
import AdminMobileDrawer from '@/components/admin/AdminMobileDrawer'
import AdminSidebar from '@/components/admin/AdminSidebar'

export default function AdminLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-bg" dir="rtl">
      <div className="sticky top-0 hidden h-screen w-60 shrink-0 overflow-y-auto md:flex">
        <AdminSidebar />
      </div>

      <div className="flex h-screen min-w-0 flex-1 flex-col overflow-hidden">
        <header className="z-30 flex shrink-0 items-center justify-between border-b border-border bg-white px-4 py-3 md:hidden">
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary">
              <ShieldCheck size={17} />
            </div>
            <span className="truncate font-cairo text-sm font-extrabold text-text">
              إدارة نوا مارت
            </span>
          </div>

          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-bg-soft text-text-muted transition-colors hover:bg-border hover:text-text"
            aria-label="فتح القائمة"
          >
            <Menu size={20} />
          </button>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 md:px-8 md:py-8">
            <Outlet />
          </div>
        </main>
      </div>

      <AdminMobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  )
}
