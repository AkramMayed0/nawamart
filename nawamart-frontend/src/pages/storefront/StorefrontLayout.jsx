import { useEffect, useState, useMemo } from 'react'
import { Link, Outlet, useLocation, useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { LogOut, Menu, Moon, Package, ShieldCheck, ShoppingBag, Store, Sun, User, UserRound, X } from 'lucide-react'
import { getStoreBySlug } from '@/api/stores'
import { getPublicThemeSettings } from '@/api/themeSettings'
import { useCartStore } from '@/store/cartStore'
import { useCustomerAuthStore } from '@/store/customerAuthStore'
import { useThemeStore } from '@/store/themeStore'
import { resolveAssetUrl } from '@/utils/assets'
import FloatingChatButton from '@/components/chat/FloatingChatButton'

function StoreMark({ store, compact = false }) {
  return (
    <Link to={`/store/${store?.slug ?? ''}`} className="flex min-w-0 items-center gap-3">
      <div className={`${compact ? 'h-10 w-10' : 'h-12 w-12'} overflow-hidden rounded-lg bg-surface shadow-sm`}>
        {store?.logo ? (
          <img src={resolveAssetUrl(store.logo)} alt={store.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center" style={{ backgroundColor: 'color-mix(in srgb, var(--theme-primary, #18212F) 10%, transparent)', color: 'var(--theme-primary, #18212F)' }}>
            <Store size={compact ? 20 : 24} />
          </div>
        )}
      </div>
      <div className="min-w-0">
        <p className="truncate font-cairo text-sm font-extrabold text-text">{store?.name ?? 'NawaMart'}</p>
      </div>
    </Link>
  )
}

export default function StorefrontLayout() {
  const { slug } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const itemCount = useCartStore((state) => state.itemCount)
  const token = useCustomerAuthStore((state) => state.token)
  const user = useCustomerAuthStore((state) => state.user)
  const logout = useCustomerAuthStore((state) => state.logout)
  const isCustomer = token && user?.role === 'customer'
  const theme = useThemeStore((s) => s.theme)
  const toggleTheme = useThemeStore((s) => s.toggleTheme)

  function handleLogout() {
    logout()
    setUserMenuOpen(false)
  }

  const { data: store } = useQuery({
    queryKey: ['store', slug],
    queryFn: () => getStoreBySlug(slug).then((response) => response.data.data),
    staleTime: 1000 * 60 * 5,
    retry: false,
  })

  // Validate customer belongs to this store — log out if mismatch
  useEffect(() => {
    if (store && isCustomer && user?.store) {
      const storeIdStr = typeof store._id === 'string' ? store._id : store._id?.toString()
      const userStoreStr = typeof user.store === 'string' ? user.store : user.store?.toString()
      if (storeIdStr && userStoreStr && storeIdStr !== userStoreStr) {
        toast.error('هذا الحساب غير مسجل في هذا المتجر')
        logout()
      }
    }
  }, [store, isCustomer, user, logout])

  const { data: themeSettings } = useQuery({
    queryKey: ['public-theme-settings', store?._id],
    queryFn: () => getPublicThemeSettings(store._id).then((r) => r.data.data),
    enabled: !!store?._id,
    staleTime: 1000 * 60 * 5,
  })

  const themeVars = useMemo(() => {
    if (!themeSettings) return {}
    const c = themeSettings.colors || {}
    const f = themeSettings.typography || themeSettings.fonts || {}
    const l = themeSettings.layout || {}
    const s = themeSettings.spacing || {}
    return {
      '--theme-primary': c.primary,
      '--theme-secondary': c.secondary,
      '--theme-accent': c.accent,
      '--theme-header': c.header || c.headerColors?.background,
      '--theme-footer': c.footer || c.footerColors?.background,
      '--theme-button': c.button,
      '--theme-button-text': c.buttonText,
      '--theme-success': c.success,
      '--theme-danger': c.danger,
      '--theme-warning': c.warning,
      '--font-heading': f.heading?.family || 'Cairo',
      '--font-body': f.body?.family || 'Cairo',
      '--section-padding': s.sectionPadding || l.sectionSpacing || '4rem',
      '--element-gap': s.elementGap || '1.5rem',
      '--theme-rounded': l.borderRadius || '0.75rem',
      '--theme-card-shadow': l.card?.shadow ? '0 4px 12px rgba(0,0,0,0.08)' : 'none',
      '--theme-card-radius': l.card?.radius || l.borderRadius || '0.75rem',
      '--theme-card-padding': l.card?.padding || '1rem',
      '--color-bg': c.background || '#F6F3EE',
      '--color-bg-soft': c.surface ? `${c.surface}E6` : '#ECE8E1',
      '--color-surface': c.surface || '#FFFFFF',
      '--color-text': c.text || c.textColors?.body || '#1D2430',
      '--color-text-muted': c.textMuted || c.textColors?.muted || '#5F6673',
      '--color-text-subtle': c.textColors?.muted || '#9298A3',
      '--color-border': c.borders?.default || '#E1DED8',
      '--color-border-strong': c.borders?.hover || '#CFC8BE',
      '--h1-size': f.sizes?.h1 || '2.5rem',
      '--h2-size': f.sizes?.h2 || '2rem',
      '--h3-size': f.sizes?.h3 || '1.75rem',
      '--h4-size': f.sizes?.h4 || '1.5rem',
      '--body-size': f.sizes?.body || '1rem',
      '--body-small-size': f.sizes?.bodySmall || '0.875rem',
    }
  }, [themeSettings])

  const customCss = themeSettings?.customCss

  const onStoreHome = location.pathname === `/store/${slug}`
  const navItems = [
    { label: 'الرئيسية', to: `/store/${slug}`, scrollTo: 'top' },
    { label: 'المنتجات', to: `/store/${slug}#products`, scrollTo: 'products' },
  ]

  return (
    <div dir="rtl" className="min-h-screen bg-bg font-cairo text-text transition-colors" style={themeVars}>
      {customCss && <style>{customCss}</style>}
      <header className="sticky top-0 z-40 bg-surface/95 backdrop-blur-xl shadow-sm transition-all border-b border-border/50">
        <div className="border-b border-border/10 text-white shadow-inner" style={{ background: 'linear-gradient(to left, var(--theme-primary, #18212F), var(--theme-primary, #18212F))' }}>
          <div className="mx-auto flex h-9 max-w-7xl items-center justify-between px-4 text-xs font-bold tracking-wide">
            <span className="inline-flex items-center gap-2">
              <ShieldCheck size={14} className="text-accent-300" />
              دفع موثق وطلبات مباشرة من المتجر
            </span>
            <span className="hidden sm:inline text-white/70">تجربة تسوق منظمة وسريعة</span>
          </div>
        </div>

        <div className="mx-auto flex h-16 md:h-20 max-w-7xl items-center gap-5 px-4 py-2 md:py-3">
          <button
            type="button"
            onClick={() => setMobileOpen((value) => !value)}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-border/50 bg-surface/50 text-text-muted lg:hidden hover:bg-white hover:text-primary transition-all shadow-sm"
            aria-label="فتح القائمة"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          <StoreMark store={store ? { ...store, slug } : { slug }} />

          <nav className="mr-4 hidden items-center gap-2 lg:flex">
            {navItems.map((item) =>
              item.scrollTo ? (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    if (!onStoreHome) {
                      navigate(item.to);
                      return;
                    }
                    if (item.scrollTo === 'top') {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    } else {
                      const el = document.getElementById(item.scrollTo);
                      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }}
                  className="rounded-xl px-4 py-2.5 text-sm font-extrabold text-text-muted transition-all hover:bg-primary-50/80 hover:text-primary hover:shadow-sm"
                >
                  {item.label}
                </button>
              ) : (
                <Link
                  key={item.label}
                  to={item.href}
                  className="rounded-xl px-4 py-2.5 text-sm font-extrabold text-text-muted transition-all hover:bg-primary-50/80 hover:text-primary hover:shadow-sm"
                >
                  {item.label}
                </Link>
              )
            )}
          </nav>

          <button
            type="button"
            onClick={toggleTheme}
            className="mr-auto flex h-11 w-11 items-center justify-center rounded-xl border border-border/50 bg-surface/50 text-text-muted transition-all hover:bg-bg hover:text-text shadow-sm"
            aria-label={theme === 'dark' ? 'الوضع النهاري' : 'الوضع الليلي'}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <Link
            to={`/store/${slug}/cart`}
            className="hover-lift relative flex h-12 items-center justify-center gap-2.5 rounded-xl px-5 text-sm font-extrabold text-white transition-all active:scale-95"
            style={{ backgroundColor: 'var(--theme-accent, #C93F2B)' }}
            aria-label="سلة التسوق"
          >
            <ShoppingBag size={18} />
            {itemCount > 0 && (
              <span className="absolute -left-2 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-danger px-1.5 font-inter text-xs font-extrabold text-white">
                {itemCount.toLocaleString('en-US')}
              </span>
            )}
          </Link>

          {/* ── User / Auth ── */}
          <div className="relative">
            {isCustomer ? (
              <>
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className="flex h-11 w-11 items-center justify-center rounded-lg border border-border text-text-muted transition-colors hover:bg-bg hover:text-text"
                  aria-label="قائمة المستخدم"
                >
                  <User size={18} />
                </button>
                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute left-0 top-full z-20 mt-2 w-56 rounded-xl border border-border bg-surface p-2 shadow-lg">
                      <div className="border-b border-border px-3 py-2.5">
                        <p className="truncate font-cairo text-sm font-bold text-text">{user?.name}</p>
                        <p className="truncate font-cairo text-xs text-text-muted">{user?.email}</p>
                      </div>
                      <Link
                        to="#"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 font-cairo text-sm font-semibold text-text transition-colors hover:bg-bg"
                      >
                        <UserRound size={16} />
                        الملف الشخصي
                      </Link>
                      <Link
                        to={`/store/${slug}/orders`}
                        onClick={() => setUserMenuOpen(false)}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 font-cairo text-sm font-semibold text-text transition-colors hover:bg-bg"
                      >
                        <Package size={16} />
                        طلباتي
                      </Link>
                      <div className="border-t border-border my-1" />
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 font-cairo text-sm font-semibold text-danger transition-colors hover:bg-danger-100"
                      >
                        <LogOut size={16} />
                        تسجيل الخروج
                      </button>
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to={`/customer/login?storeId=${store?._id ?? ''}&redirect=${encodeURIComponent(location.pathname + location.search)}`}
                  className="flex h-11 items-center justify-center gap-2 rounded-lg border border-border bg-surface px-4 text-sm font-extrabold text-text transition-colors hover:bg-bg"
                >
                  تسجيل الدخول
                </Link>
              </div>
            )}
          </div>
        </div>

        {mobileOpen && (
          <div className="border-t border-border bg-surface px-4 py-3 lg:hidden">
            <div className="mb-3">
              <StoreMark store={store ? { ...store, slug } : { slug }} compact />
            </div>
            <div className="grid grid-cols-2 gap-2">
              {navItems.map((item) =>
                item.scrollTo ? (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => {
                      setMobileOpen(false);
                      setTimeout(() => {
                        if (!onStoreHome) {
                          navigate(item.to);
                          return;
                        }
                        if (item.scrollTo === 'top') {
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        } else {
                          const el = document.getElementById(item.scrollTo);
                          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                      }, 120);
                    }}
                    className="rounded-lg border border-border bg-bg px-3 py-2 text-center text-sm font-extrabold text-text-muted"
                  >
                    {item.label}
                  </button>
                ) : (
                  <Link
                    key={item.label}
                    to={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-lg border border-border bg-bg px-3 py-2 text-center text-sm font-extrabold text-text-muted"
                  >
                    {item.label}
                  </Link>
                )
              )}
            </div>
          </div>
        )}
      </header>

      <main>
        <div className="page-enter">
          <Outlet />
        </div>
      </main>

      {/* ── Multi-Tenant Live Chat widget (Pro/Business plan) ── */}
      {store?._id && ['pro', 'business'].includes(store?.subscription?.plan) && (
        <FloatingChatButton storeId={store._id} />
      )}

      <footer className="border-t border-border" style={{ backgroundColor: 'var(--theme-footer, var(--color-surface, #FFFFFF))' }}>
        <div className="mx-auto grid max-w-7xl gap-4 px-4 py-8 md:grid-cols-[1fr_auto] md:items-center">
          <StoreMark store={store ? { ...store, slug } : { slug }} compact />
          <div className="flex flex-wrap gap-2 text-xs font-bold text-text-muted">
            <span className="rounded-full bg-bg px-3 py-1.5">طلبات موثقة</span>
            <span className="rounded-full bg-bg px-3 py-1.5">رفع وصل الدفع</span>
            <span className="rounded-full bg-bg px-3 py-1.5">متابعة حالة الطلب</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
