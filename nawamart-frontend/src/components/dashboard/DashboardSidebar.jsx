/**
 * DashboardSidebar
 * Renders nav links for desktop (always visible) and inside the mobile drawer.
 * Pass `onNavClick` to close the drawer when a link is tapped on mobile.
 */
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  MessageSquare,
  Banknote,
  Settings,
  LogOut,
  Store,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

const NAV_ITEMS = [
  { to: '/dashboard',           label: 'الرئيسية',    icon: LayoutDashboard, end: true },
  { to: '/dashboard/orders',    label: 'الطلبات',     icon: ShoppingBag },
  { to: '/dashboard/products',  label: 'المنتجات',    icon: Package },
  { to: '/dashboard/customers', label: 'العملاء',     icon: Users },
  { to: '/dashboard/chat',      label: 'المحادثات',   icon: MessageSquare },
  { to: '/dashboard/finance',   label: 'المالية',     icon: Banknote },
  { to: '/dashboard/settings',  label: 'الإعدادات',   icon: Settings },
]

export default function DashboardSidebar({ onNavClick }) {
  const navigate = useNavigate()
  const logout   = useAuthStore(s => s.logout)
  const store    = useAuthStore(s => s.store)
  const user     = useAuthStore(s => s.user)

  function handleLogout() {
    logout()
    navigate('/merchant/login', { replace: true })
  }

  return (
    <aside className="flex flex-col h-full bg-white border-l border-border" dir="rtl">

      {/* ── Brand / store name ── */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-border shrink-0">
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <Store size={18} className="text-primary" />
        </div>
        <div className="min-w-0">
          <p className="font-cairo font-bold text-sm text-text truncate leading-tight">
            {store?.name ?? 'متجري'}
          </p>
          <p className="font-cairo text-[11px] text-text-subtle truncate mt-0.5">
            {user?.email ?? ''}
          </p>
        </div>
      </div>

      {/* ── Nav links ── */}
      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavClick}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl font-cairo text-sm font-semibold transition-colors ${
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

      {/* ── Logout ── */}
      <div className="px-3 py-3 border-t border-border shrink-0">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl font-cairo text-sm font-semibold text-danger hover:bg-danger-100 transition-colors"
        >
          <LogOut size={17} />
          تسجيل الخروج
        </button>
      </div>

    </aside>
  )
}
