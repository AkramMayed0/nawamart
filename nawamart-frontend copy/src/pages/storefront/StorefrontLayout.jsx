import { useState } from 'react'
import { Link, Outlet, useLocation, useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { LogOut, Menu, ShieldCheck, ShoppingBag, Store, User, X } from 'lucide-react'
import { getStoreBySlug } from '@/api/stores'
import { useCartStore } from '@/store/cartStore'
import { useAuthStore } from '@/store/authStore'
import { resolveAssetUrl } from '@/utils/assets'

function StoreMark({ store, compact = false }) {
  return (
    <Link to={`/store/${store?.slug ?? ''}`} className="flex min-w-0 items-center gap-3">
      <div className={`${compact ? 'h-10 w-10' : 'h-12 w-12'} overflow-hidden rounded-lg border border-border bg-white shadow-sm`}>
        {store?.logo ? (
          <img src={resolveAssetUrl(store.logo)} alt={store.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-primary-50 text-primary">
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
  const token = useAuthStore((state) => state.token)
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const isCustomer = token && user?.role === 'customer'

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

  const onStoreHome = location.pathname === `/store/${slug}`
  const navItems = [
    { label: 'الرئيسية', to: `/store/${slug}`, scrollTo: 'top' },
    { label: 'المنتجات', to: `/store/${slug}#products`, scrollTo: 'products' },
  ]

  return (
    <div dir="rtl" className="min-h-screen bg-bg font-cairo text-text">
      <header className="sticky top-0 z-40 border-b border-border bg-white/95 backdrop-blur">
        <div className="border-b border-border bg-primary text-white">
          <div className="mx-auto flex h-9 max-w-7xl items-center justify-between px-4 text-xs font-bold">
            <span className="inline-flex items-center gap-2">
              <ShieldCheck size={14} />
              دفع موثق وطلبات مباشرة من المتجر
            </span>
            <span className="hidden sm:inline">تجربة تسوق منظمة وسريعة</span>
          </div>
        </div>

        <div className="mx-auto flex h-18 max-w-7xl items-center gap-4 px-4 py-3">
          <button
            type="button"
            onClick={() => setMobileOpen((value) => !value)}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-border text-text-muted lg:hidden"
            aria-label="فتح القائمة"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <StoreMark store={store ? { ...store, slug } : { slug }} />

          <nav className="mr-2 hidden items-center gap-1 lg:flex">
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
                  className="rounded-lg px-4 py-2 text-sm font-extrabold text-text-muted transition-colors hover:bg-primary-50 hover:text-primary"
                >
                  {item.label}
                </button>
              ) : (
                <Link
                  key={item.label}
                  to={item.href}
                  className="rounded-lg px-4 py-2 text-sm font-extrabold text-text-muted transition-colors hover:bg-primary-50 hover:text-primary"
                >
                  {item.label}
                </Link>
              )
            )}
          </nav>



          <Link
            to={`/store/${slug}/cart`}
            className="relative mr-auto flex h-11 items-center justify-center gap-2 rounded-lg bg-accent px-4 text-sm font-extrabold text-white transition-colors hover:bg-accent-700"
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
                    <div className="absolute left-0 top-full z-20 mt-2 w-56 rounded-xl border border-border bg-white p-2 shadow-lg">
                      <div className="border-b border-border px-3 py-2.5">
                        <p className="truncate font-cairo text-sm font-bold text-text">{user?.name}</p>
                        <p className="truncate font-cairo text-xs text-text-muted">{user?.email}</p>
                      </div>
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
                  to={`/customer/login?redirect=${encodeURIComponent(`/store/${slug}`)}`}
                  className="flex h-11 items-center justify-center gap-2 rounded-lg border border-border bg-white px-4 text-sm font-extrabold text-text transition-colors hover:bg-bg"
                >
                  تسجيل الدخول
                </Link>
              </div>
            )}
          </div>
        </div>

        {mobileOpen && (
          <div className="border-t border-border bg-white px-4 py-3 lg:hidden">
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
        <Outlet />
      </main>

      <footer className="border-t border-border bg-white">
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
