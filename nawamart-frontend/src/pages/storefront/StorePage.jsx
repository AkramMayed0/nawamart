import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getStoreBySlug } from '@/api/stores'
import { getProductsByStore } from '@/api/products'
import StoreHeader from '@/components/storefront/StoreHeader'
import ProductCard from '@/components/storefront/ProductCard'
import { ProductCardSkeleton, StoreHeaderSkeleton } from '@/components/ui/Skeleton'
import NotFound from '@/components/ui/NotFound'
import Icon from '@/components/ui/Icon'

export default function StorePage() {
  const { slug } = useParams()

  // ── Fetch store ──────────────────────────────────────────────────────
  const {
    data: store,
    isLoading: storeLoading,
    isError: storeError,
  } = useQuery({
    queryKey: ['store', slug],
    queryFn: () => getStoreBySlug(slug).then(r => r.data.data),
    staleTime: 1000 * 60 * 5,
    retry: false,
  })

  // ── Fetch products (only when store is loaded) ────────────────────────
  const {
    data: products = [],
    isLoading: productsLoading,
  } = useQuery({
    queryKey: ['products', store?._id],
    queryFn: () => getProductsByStore(store._id).then(r => r.data.data),
    enabled: !!store?._id,
    staleTime: 1000 * 60 * 2,
  })

  // ── 404 ──────────────────────────────────────────────────────────────
  if (storeError) {
    return (
      <NotFound
        message="المتجر غير موجود"
        sub="تحقق من رابط المتجر أو تواصل مع صاحبه."
      />
    )
  }

  // ── Loading ───────────────────────────────────────────────────────────
  if (storeLoading) {
    return (
      <div dir="rtl">
        <StoreHeaderSkeleton />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ── Main render ───────────────────────────────────────────────────────
  return (
    <div dir="rtl">
      {/* Store header */}
      <StoreHeader store={store} />

      {/* Products section */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Section title */}
        <h2 className="font-cairo font-bold text-lg text-text mb-5">
          المنتجات
          {!productsLoading && products.length > 0 && (
            <span className="font-cairo font-normal text-sm text-text-muted mr-2">
              ({products.length})
            </span>
          )}
        </h2>

        {/* Products loading skeleton */}
        {productsLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!productsLoading && products.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-bg-soft border border-border flex items-center justify-center mb-4">
              <Icon name="package" size={28} className="text-text-subtle" />
            </div>
            <h3 className="font-cairo font-bold text-text mb-1">لا توجد منتجات بعد</h3>
            <p className="font-cairo text-sm text-text-muted">
              لم يُضف صاحب المتجر أي منتجات حتى الآن.
            </p>
          </div>
        )}

        {/* Product grid */}
        {!productsLoading && products.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
