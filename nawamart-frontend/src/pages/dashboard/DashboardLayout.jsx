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
import { useState, useEffect } from 'react'
import { Outlet, useLocation }   from 'react-router-dom'
import { Menu, Store, Sun, Moon, Bell, ChevronDown, User } from 'lucide-react'
import DashboardSidebar from '@/components/dashboard/DashboardSidebar'
import MobileDrawer     from '@/components/dashboard/MobileDrawer'
import TourTooltip      from '@/components/dashboard/TourTooltip'
import ContextualHelp   from '@/components/dashboard/ContextualHelp'
import GlobalSearch     from '@/components/dashboard/GlobalSearch'
import { useAuthStore } from '@/store/authStore'
import { useThemeStore } from '@/store/themeStore'
import { resolveAssetUrl } from '@/utils/assets'

/* ── Map path segments → Arabic page names ── */
const PAGE_NAMES = {
  '':            'لوحة التحكم',
  'dashboard':   'لوحة التحكم',
  'shop':        'متجري',
  'orders':      'الطلبات',
  'products':    'المنتجات',
  'inventory':   'المخزون',
  'customers':   'العملاء',
  'chat':        'التسليم',
  'finance':     'المالية',
  'reports':     'التقارير',
  'discounts':   'الخصومات',
  'support':     'الدعم',
  'knowledge':   'المعرفة',
  'customize':   'مركز التخصيص',
  'themes':      'القوالب',
  'pages':       'الصفحات',
  'profile':     'الملف الشخصي',
  'staff':       'الفريق',
  'activity':    'النشاطات',
  'security':    'الأمان',
  'sessions':    'الجلسات',
  'settings':    'الإعدادات',
  'api-keys':    'مفاتيح API',
  'webhooks':    'Webhooks',
  'compliance':  'الامتثال',
  'legal-pages': 'الصفحات القانونية',
  'anti-fraud':  'درع المرتجعات',
  'couriers':    'إدارة المناديب',
}

function usePageName() {
  const { pathname } = useLocation()
  const segments = pathname.split('/').filter(Boolean)
  // Last meaningful segment
  for (let i = segments.length - 1; i >= 0; i--) {
    const name = PAGE_NAMES[segments[i]]
    if (name) return name
  }
  return 'لوحة التحكم'
}

function ThemeToggleCompact() {
  const theme = useThemeStore((s) => s.theme)
  const toggle = useThemeStore((s) => s.toggleTheme)
  return (
    <button
      onClick={toggle}
      className="w-9 h-9 flex items-center justify-center rounded-xl text-text-muted hover:text-text hover:bg-bg-soft transition-colors"
      aria-label={theme === 'dark' ? 'الوضع النهاري' : 'الوضع الليلي'}
    >
      {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
    </button>
  )
}

export default function DashboardLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [showTour, setShowTour] = useState(false)
  const storeRaw = useAuthStore(s => s.store)
  const user     = useAuthStore(s => s.user)
  const store    = Array.isArray(storeRaw) ? storeRaw[0] : storeRaw
  const pageName = usePageName()

  useEffect(() => {
    const tourDone = localStorage.getItem('nawamart-tour-done')
    if (!tourDone) {
      const timer = setTimeout(() => setShowTour(true), 1000)
      return () => clearTimeout(timer)
    }
  }, [])

  const avatarSrc = user?.profileImage ? resolveAssetUrl(user.profileImage) : null
  const initials  = (user?.name || 'م').charAt(0)

  return (
    <div className="min-h-screen bg-bg flex flex-col" dir="rtl">

      <div className="flex flex-1 min-h-0">

        {/* ── Desktop sidebar (hidden on mobile) ── */}
        <div className="hidden md:flex flex-col w-64 shrink-0 sticky top-0 h-screen overflow-y-auto shadow-sm">
          <DashboardSidebar />
        </div>

        {/* ── Main area ── */}
        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">

          {/* ── Mobile top bar (visible only on mobile) ── */}
          <header className="md:hidden flex items-center justify-between px-4 py-3 bg-surface border-b border-border shadow-sm shrink-0 z-30">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center shrink-0 ring-1 ring-primary/10">
                <Store size={15} className="text-primary" />
              </div>
              <span className="font-cairo font-bold text-sm text-text truncate">
                {store?.name ?? 'لوحة التحكم'}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <ThemeToggleCompact />
              <button
                onClick={() => setDrawerOpen(true)}
                className="w-9 h-9 flex items-center justify-center rounded-2xl bg-bg-soft text-text-muted hover:bg-accent/10 hover:text-accent transition-colors"
                aria-label="فتح القائمة"
              >
                <Menu size={20} />
              </button>
            </div>
          </header>

          {/* ── Desktop top bar ── */}
          <div
            className="hidden md:flex items-center justify-between px-6 py-3 bg-surface border-b border-border shrink-0"
            style={{ minHeight: '56px' }}
          >
            {/* Left side: breadcrumb page title */}
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-cairo text-xs text-text-muted">لوحة التحكم</span>
              {pageName !== 'لوحة التحكم' && (
                <>
                  <span className="text-text-subtle text-xs">/</span>
                  <span className="font-cairo text-sm font-bold text-text">{pageName}</span>
                </>
              )}
              {pageName === 'لوحة التحكم' && (
                <span className="font-cairo text-sm font-bold text-text">{pageName}</span>
              )}
            </div>

            {/* Right side: search + notifications + user pill */}
            <div className="flex items-center gap-2">
              <GlobalSearch />

              {/* Notification bell */}
              <div className="relative">
                <button
                  className="w-9 h-9 flex items-center justify-center rounded-xl text-text-muted hover:text-text hover:bg-bg-soft transition-colors"
                  aria-label="الإشعارات"
                >
                  <Bell size={17} />
                </button>
                {/* Dot badge */}
                <span
                  className="absolute top-1.5 end-1.5 w-2 h-2 rounded-full"
                  style={{ background: '#C93F2B', boxShadow: '0 0 0 2px var(--color-surface)' }}
                />
              </div>

              <ThemeToggleCompact />

              {/* User pill */}
              <button className="flex items-center gap-2 rounded-xl px-2.5 py-1.5 border border-border hover:bg-bg-soft transition-colors">
                <div className="w-6 h-6 rounded-full overflow-hidden bg-bg-soft flex items-center justify-center shrink-0">
                  {avatarSrc
                    ? <img src={avatarSrc} alt={user?.name} className="w-full h-full object-cover" />
                    : <span className="font-cairo font-bold text-[11px] text-text-muted">{initials}</span>
                  }
                </div>
                <span className="font-cairo text-sm font-semibold text-text hidden lg:block max-w-[120px] truncate">
                  {user?.name || store?.name || 'حسابي'}
                </span>
                <ChevronDown size={13} className="text-text-muted hidden lg:block" />
              </button>
            </div>
          </div>

          {/* ── Page content ── */}
          <main className="flex-1 overflow-y-auto min-h-0">
            <div className="page-enter">
              <Outlet />
            </div>
          </main>

        </div>

      </div>

      {/* ── Mobile drawer overlay ── */}
      <MobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />

      {/* ── Guided tour for first-time users ── */}
      {showTour && <TourTooltip onComplete={() => setShowTour(false)} />}

      {/* ── Contextual help floating button ── */}
      <ContextualHelp topic="store-setup" />

    </div>
  )
}
