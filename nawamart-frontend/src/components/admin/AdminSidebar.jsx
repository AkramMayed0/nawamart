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
  BarChart3,
  Settings,
  Bell,
} from 'lucide-react'
import { useAdminStore } from '@/store/adminStore'

const NAV_SECTIONS = [
  {
    label: 'الرئيسية',
    items: [
      { to: '/admin/dashboard', label: 'لوحة التحكم', icon: LayoutDashboard, end: true },
    ],
  },
  {
    label: 'الإدارة',
    items: [
      { to: '/admin/dashboard/subscriptions', label: 'الاشتراكات', icon: ClipboardList },
      { to: '/admin/dashboard/merchants', label: 'التجار', icon: Store },
      { to: '/admin/dashboard/stores', label: 'المتاجر', icon: ShoppingBag },
      { to: '/admin/dashboard/orders', label: 'الطلبات', icon: Package },
      { to: '/admin/dashboard/customers', label: 'العملاء', icon: Users },
    ],
  },
  {
    label: 'التحليلات',
    items: [
      { to: '/admin/dashboard', label: 'التقارير', icon: BarChart3, end: true },
    ],
  },
]

export default function AdminSidebar({ onNavClick }) {
  const navigate = useNavigate()
  const logout = useAdminStore((state) => state.logout)
  const admin = useAdminStore((state) => state.admin)

  function handleLogout() {
    logout()
    navigate('/admin/login', { replace: true })
  }

  const initials = admin?.email
    ? admin.email.slice(0, 2).toUpperCase()
    : 'AD'

  return (
    <aside className="flex h-full flex-col bg-primary-800 text-white" dir="rtl" style={{ background: 'linear-gradient(180deg, #1a2537 0%, #0f1825 100%)' }}>
      {/* Logo / Brand */}
      <div className="shrink-0 px-5 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent shadow-lg shadow-accent/30">
            <ShieldCheck size={18} className="text-white" />
          </div>
          <div className="min-w-0">
            <p className="font-cairo text-[15px] font-extrabold text-white leading-tight">
              NawaMart
            </p>
            <p className="font-cairo text-[10px] text-white/40 mt-0.5">لوحة الإدارة</p>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-5 h-px bg-white/8" />

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            <p className="mb-1.5 px-3 font-cairo text-[10px] font-bold tracking-widest text-white/30 uppercase">
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.items.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={`${to}-${label}`}
                  to={to}
                  end={end}
                  onClick={onNavClick}
                  className={({ isActive }) =>
                    `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 font-cairo text-sm font-bold transition-all duration-150 ${
                      isActive
                        ? 'bg-accent text-white shadow-md shadow-accent/30'
                        : 'text-white/50 hover:bg-white/6 hover:text-white/90'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {/* Active indicator */}
                      {isActive && (
                        <span className="absolute right-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-white/60" />
                      )}
                      <Icon size={16} className={`shrink-0 transition-colors ${isActive ? 'text-white' : 'text-white/40 group-hover:text-white/70'}`} />
                      <span>{label}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom: Admin profile + logout */}
      <div className="shrink-0 mx-3 mb-4 rounded-2xl bg-white/5 border border-white/8 p-3">
        {/* Admin info */}
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-accent-700 text-white font-cairo font-extrabold text-sm shadow-md shadow-accent/20">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-cairo text-sm font-extrabold text-white leading-tight">المشرف</p>
            <p className="truncate font-cairo text-[11px] text-white/40 mt-0.5">{admin?.email ?? 'admin@nawamart.com'}</p>
          </div>
          <button className="flex h-7 w-7 items-center justify-center rounded-lg text-white/30 hover:text-white/70 hover:bg-white/8 transition-colors">
            <Bell size={14} />
          </button>
        </div>

        {/* Logout */}
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 font-cairo text-sm font-bold text-white/40 transition-all hover:bg-danger-100/10 hover:text-danger"
        >
          <LogOut size={15} />
          تسجيل الخروج
        </button>
      </div>
    </aside>
  )
}
