import Icon from '@/components/ui/Icon'
import { resolveAssetUrl } from '@/utils/assets'

export default function StoreHeader({ store }) {
  const isDigital = store.type === 'digital'

  return (
    <div className="bg-white border-b border-border">
      <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center sm:items-start gap-5" dir="rtl">

        {/* Logo */}
        {store.logo ? (
          <img
            src={resolveAssetUrl(store.logo)}
            alt={store.name}
            className="w-20 h-20 rounded-2xl object-cover border border-border shrink-0"
          />
        ) : (
          <div className="w-20 h-20 rounded-2xl bg-primary-50 border border-primary-100 flex items-center justify-center shrink-0">
            <Icon name="store" size={32} className="text-primary" />
          </div>
        )}

        {/* Info */}
        <div className="flex-1 text-center sm:text-start">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
            <h1 className="font-cairo font-extrabold text-2xl text-text">{store.name}</h1>
            <span className={`inline-flex items-center gap-1 text-xs font-semibold font-cairo px-2.5 py-1 rounded-pill border ${
              isDigital
                ? 'bg-accent-50 text-accent-700 border-accent-200'
                : 'bg-primary-50 text-primary border-primary-200'
            }`}>
              {isDigital ? '⚡ رقمي' : '🚚 مادي'}
            </span>
          </div>

          {store.description && (
            <p className="font-cairo text-sm text-text-muted leading-relaxed max-w-xl">
              {store.description}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
