import { NavLink, useNavigate } from 'react-router-dom'
import {
  Banknote,
  BarChart3,
  Eye,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Package,
  Settings,
  ShoppingBag,
  Store,
  User,
  Users,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

const NAV_ITEMS = [
  { to: '/dashboard', label: 'الرئيسية', icon: LayoutDashboard, end: true },
  { to: '/dashboard/shop', label: 'متجري العام', icon: Eye },
  { to: '/dashboard/orders', label: 'الطلبات', icon: ShoppingBag },
  { to: '/dashboard/products', label: 'المنتجات', icon: Package },
  { to: '/dashboard/customers', label: 'العملاء', icon: Users },
  { to: '/dashboard/chat', label: 'التسليم', icon: MessageSquare },
  { to: '/dashboard/finance', label: 'المالية', icon: Banknote },
  { to: '/dashboard/reports', label: 'التقارير', icon: BarChart3 },
  { to: '/dashboard/profile', label: 'الملف الشخصي', icon: User },
  { to: '/dashboard/settings', label: 'الإعدادات', icon: Settings },
]

export default function DashboardSidebar({ onNavClick }) {
  const navigate = useNavigate()
  const logout = useAuthStore((state) => state.logout)
  const store = useAuthStore((state) => state.store)
  const user = useAuthStore((state) => state.user)

  function handleLogout() {
    logout()
    navigate('/merchant/login', { replace: true })
  }

  return (
    <aside className="flex h-full flex-col border-l border-border bg-white" dir="rtl">
      <div className="flex shrink-0 items-center gap-3 border-b border-border px-5 py-5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
          <Store size={18} className="text-primary" />
        </div>
        <div className="min-w-0">
          <p className="truncate font-cairo text-sm font-bold leading-tight text-text">
            {store?.name ?? 'متجري'}
          </p>
          <p className="mt-0.5 truncate font-cairo text-[11px] text-text-subtle">
            {user?.email ?? ''}
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-3">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavClick}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 font-cairo text-sm font-semibold transition-colors ${
                isActive
                  ? 'bg-primary text-white'
                  : 'text-text-muted hover:bg-bg-soft hover:text-text'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={17} className={isActive ? 'text-white' : 'text-text-subtle'} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="shrink-0 border-t border-border px-3 py-3">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 font-cairo text-sm font-semibold text-danger transition-colors hover:bg-danger-100"
        >
          <LogOut size={17} />
          تسجيل الخروج
        </button>
      </div>
    </aside>
  )
}
