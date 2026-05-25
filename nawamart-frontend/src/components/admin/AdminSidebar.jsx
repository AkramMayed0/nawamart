import { NavLink, useNavigate } from 'react-router-dom'
import {
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Package,
  ShieldCheck,
  ShoppingBag,
  Store,
  Users,
} from 'lucide-react'
import { useAdminStore } from '@/store/adminStore'

const NAV_ITEMS = [
  { to: '/admin/dashboard', label: 'الرئيسية', icon: LayoutDashboard, end: true },
  { to: '/admin/dashboard/subscriptions', label: 'الاشتراكات', icon: ClipboardList },
  { to: '/admin/dashboard/merchants', label: 'التجار', icon: Store },
  { to: '/admin/dashboard/stores', label: 'المتاجر', icon: ShoppingBag },
  { to: '/admin/dashboard/orders', label: 'الطلبات', icon: Package },
  { to: '/admin/dashboard/customers', label: 'العملاء', icon: Users },
]

export default function AdminSidebar({ onNavClick }) {
  const navigate = useNavigate()
  const logout = useAdminStore((state) => state.logout)
  const admin = useAdminStore((state) => state.admin)

  function handleLogout() {
    logout()
    navigate('/admin/login', { replace: true })
  }

  return (
    <aside className="flex h-full flex-col border-l border-border bg-white" dir="rtl">
      <div className="shrink-0 border-b border-border px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary">
            <ShieldCheck size={20} />
          </div>
          <div className="min-w-0">
            <p className="truncate font-cairo text-sm font-extrabold leading-tight text-text">
              إدارة نوا مارت
            </p>
            <p className="mt-0.5 truncate font-cairo text-[11px] text-text-subtle">
              {admin?.email ?? 'admin@nawamart.com'}
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-3">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavClick}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 font-cairo text-sm font-bold transition-colors ${
                isActive
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-text-muted hover:bg-bg-soft hover:text-text'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={17} className={isActive ? 'text-white' : 'text-text-subtle'} />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="shrink-0 border-t border-border px-3 py-3">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 font-cairo text-sm font-bold text-danger transition-colors hover:bg-danger-100"
        >
          <LogOut size={17} />
          تسجيل الخروج
        </button>
      </div>
    </aside>
  )
}
