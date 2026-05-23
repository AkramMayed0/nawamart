import { Outlet, Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getStoreBySlug } from '@/api/stores'
import Icon from '@/components/ui/Icon'

export default function StorefrontLayout() {
  const { slug } = useParams()

  const { data } = useQuery({
    queryKey: ['store', slug],
    queryFn: () => getStoreBySlug(slug).then(r => r.data.data),
    staleTime: 1000 * 60 * 5,
    retry: false,
  })

  const store = data

  return (
    <div className="min-h-screen bg-bg" dir="rtl">
      {/* ── Top nav ── */}
      <header className="bg-white border-b border-border sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          {/* Store brand */}
          <Link to={`/store/${slug}`} className="flex items-center gap-2.5 min-w-0">
            {store?.logo ? (
              <img
                src={store.logo}
                alt={store.name}
                className="w-8 h-8 rounded-lg object-cover shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-primary-50 border border-primary-100 flex items-center justify-center shrink-0">
                <Icon name="store" size={16} className="text-primary" />
              </div>
            )}
            <span className="font-cairo font-bold text-text truncate">
              {store?.name || '…'}
            </span>
            {/* Store type badge */}
            {store?.type && (
              <span className={`hidden sm:inline-flex items-center gap-1 text-xs font-semibold font-cairo px-2 py-0.5 rounded-pill shrink-0 ${
                store.type === 'digital'
                  ? 'bg-accent-50 text-accent-700 border border-accent-200'
                  : 'bg-primary-50 text-primary border border-primary-200'
              }`}>
                {store.type === 'digital' ? '⚡ رقمي' : '🚚 مادي'}
              </span>
            )}
          </Link>

          {/* Powered by */}
          <a
            href="/"
            className="flex items-center gap-1.5 text-xs text-text-subtle font-cairo hover:text-text transition-colors shrink-0"
          >
            <Icon name="globe" size={13} />
            نوامارت
          </a>
        </div>
      </header>

      {/* ── Page content ── */}
      <main>
        <Outlet />
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-border mt-16 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <a href="/" className="inline-flex items-center gap-1.5 text-xs text-text-subtle font-cairo hover:text-text transition-colors">
            <Icon name="sparkles" size={13} />
            مدعوم بـ نوامارت — أنشئ متجرك مجاناً
          </a>
        </div>
      </footer>
    </div>
  )
}
