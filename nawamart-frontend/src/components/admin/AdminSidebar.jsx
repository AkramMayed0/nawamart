import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  ClipboardList,
  Store,
  ShoppingBag,
  Package,
  Users,
  LogOut,
  ShieldCheck
} from 'lucide-react'
import { useAdminStore } from '@/store/adminStore'

const NAV_ITEMS = [
  { to: '/admin/dashboard',               label: 'الرئيسية',     icon: LayoutDashboard, end: true },
  { to: '/admin/dashboard/subscriptions', label: 'الاشتراكات',   icon: ClipboardList },
  { to: '/admin/dashboard/merchants',     label: 'التجار',       icon: Store },
  { to: '/admin/dashboard/stores',        label: 'المتاجر',      icon: ShoppingBag },
  { to: '/admin/dashboard/orders',        label: 'الطلبات',      icon: Package },
  { to: '/admin/dashboard/customers',     label: 'العملاء',      icon: Users },
]

export default function AdminSidebar({ onNavClick }) {
  const navigate = useNavigate()
  const logout   = useAdminStore(s => s.logout)
  const admin    = useAdminStore(s => s.admin)

  function handleLogout() {
    logout()
    navigate('/admin/login', { replace: true })
  }

  return (
    <aside className="flex flex-col h-full bg-white border-l border-border" dir="rtl">

      {/* ── Brand / store name ── */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-border shrink-0">
        <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center shrink-0 shadow-md">
          <ShieldCheck size={18} className="text-white" />
        </div>
        <div className="min-w-0">
          <p className="font-cairo font-bold text-sm text-slate-800 truncate leading-tight">
            لوحة الإدارة
          </p>
          <p className="font-cairo text-[11px] text-text-subtle truncate mt-0.5">
            {admin?.email ?? 'admin@nawamart.com'}
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
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={17} className={isActive ? 'text-white' : 'text-slate-400'} />
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
