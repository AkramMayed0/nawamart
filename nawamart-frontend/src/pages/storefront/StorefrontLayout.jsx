import { useState } from 'react'
import { Link, Outlet, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Menu, Search, ShieldCheck, ShoppingBag, Store, X } from 'lucide-react'
import { getStoreBySlug } from '@/api/stores'
import { useCartStore } from '@/store/cartStore'
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
        <p className="truncate font-cairo text-xs font-semibold text-text-muted">
          {store?.type === 'digital' ? 'متجر رقمي' : 'متجر بتوصيل'}
        </p>
      </div>
    </Link>
  )
}

export default function StorefrontLayout() {
  const { slug } = useParams()
  const [mobileOpen, setMobileOpen] = useState(false)
  const itemCount = useCartStore((state) => state.itemCount)

  const { data: store } = useQuery({
    queryKey: ['store', slug],
    queryFn: () => getStoreBySlug(slug).then((response) => response.data.data),
    staleTime: 1000 * 60 * 5,
    retry: false,
  })

  const navItems = [
    { label: 'الرئيسية', href: `/store/${slug}` },
    { label: 'المنتجات', href: `/store/${slug}#products` },
    { label: 'السلة', href: `/store/${slug}/cart` },
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
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className="rounded-lg px-4 py-2 text-sm font-extrabold text-text-muted transition-colors hover:bg-primary-50 hover:text-primary"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="relative mx-auto hidden max-w-xl flex-1 lg:block">
            <Search size={17} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-subtle" />
            <a
              href={`/store/${slug}#products`}
              className="flex h-11 w-full items-center rounded-lg border border-border bg-bg pr-10 pl-4 text-sm font-semibold text-text-muted transition-colors hover:border-primary hover:bg-white"
            >
              ابحث داخل منتجات المتجر
            </a>
          </div>

          <Link
            to={`/store/${slug}/cart`}
            className="relative mr-auto flex h-11 items-center justify-center gap-2 rounded-lg bg-accent px-4 text-sm font-extrabold text-white transition-colors hover:bg-accent-700"
            aria-label="سلة التسوق"
          >
            <ShoppingBag size={18} />
            <span className="hidden sm:inline">السلة</span>
            {itemCount > 0 && (
              <span className="absolute -left-2 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-danger px-1.5 font-inter text-xs font-extrabold text-white">
                {itemCount.toLocaleString('en-US')}
              </span>
            )}
          </Link>
        </div>

        {mobileOpen && (
          <div className="border-t border-border bg-white px-4 py-3 lg:hidden">
            <div className="mb-3">
              <StoreMark store={store ? { ...store, slug } : { slug }} compact />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg border border-border bg-bg px-3 py-2 text-center text-sm font-extrabold text-text-muted"
                >
                  {item.label}
                </Link>
              ))}
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
