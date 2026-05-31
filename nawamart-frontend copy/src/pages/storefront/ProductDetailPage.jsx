import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Star, Tag, Barcode, Weight, Building2, Hash } from 'lucide-react'
import { getProductById } from '@/api/products'
import { getStoreBySlug } from '@/api/stores'
import { useCartStore } from '@/store/cartStore'
import usePageTitle from '@/hooks/usePageTitle'
import NotFound from '@/components/ui/NotFound'
import { ProductCardSkeleton } from '@/components/ui/Skeleton'
import ImageGallery from '@/components/storefront/ImageGallery'
import Icon from '@/components/ui/Icon'
import Button from '@/components/ui/Button'

export default function ProductDetailPage() {
  const { slug, productId } = useParams()
  const navigate  = useNavigate()
  const addItem   = useCartStore(s => s.addItem)

  const { data: store } = useQuery({
    queryKey: ['store', slug],
    queryFn: () => getStoreBySlug(slug).then(r => r.data.data),
    staleTime: 1000 * 60 * 5,
    retry: false,
  })

  // ── Fetch product ────────────────────────────────────────────────────
  const { data: product, isLoading, isError } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => getProductById(productId).then(r => r.data.data),
    retry: false,
  })
  usePageTitle(product?.name)

  // ── Loading ──────────────────────────────────────────────────────────
  if (isLoading) return (
    <div className="max-w-4xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-2 gap-8" dir="rtl">
      <ProductCardSkeleton />
      <ProductCardSkeleton />
    </div>
  )

  // ── 404 ──────────────────────────────────────────────────────────────
  if (isError || !product) return (
    <NotFound message="المنتج غير موجود" sub="ربما تم حذف هذا المنتج أو الرابط خاطئ." />
  )

  const outOfStock = !product.unlimitedStock && product.stock === 0
  const isDigital  = store?.type === 'digital' || product.type === 'digital'

  function handleAddToCart() {
    addItem({ ...product, storeSlug: slug })
    toast.success('أُضيف إلى السلة')
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8" dir="rtl">

      {/* ── Back button ── */}
      <button
        onClick={() => navigate(`/store/${slug}`)}
        className="inline-flex items-center gap-1.5 font-cairo text-sm text-text-muted hover:text-text transition-colors mb-6"
      >
        <Icon name="arrow-right" size={16} />
        العودة للمتجر
      </button>

      {/* ── Two-column layout ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* Left col — image gallery */}
        <ImageGallery images={product.images || []} />

        {/* Right col — info */}
        <div className="flex flex-col gap-5">

          {/* Name + price + stock */}
          <div>
            <h1 className="font-cairo font-extrabold text-2xl text-text mb-2">
              {product.name}
            </h1>
            <p className="dk-num font-extrabold text-3xl text-primary mb-3">
              {product.price?.toLocaleString('ar-YE')}
              <span className="font-cairo font-normal text-base text-text-muted mr-1">ر.ي</span>
            </p>
            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold font-cairo px-2.5 py-1 rounded-pill ${
              outOfStock
                ? 'bg-danger-100 text-danger'
                : 'bg-success-100 text-success-dark'
            }`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              {outOfStock ? 'نفد المخزون' : product.unlimitedStock ? 'متوفر' : `متوفر · ${product.stock} قطعة`}
            </span>
          </div>

          {/* Description */}
          {product.description && (
            <div>
              <h2 className="font-cairo font-bold text-sm text-text mb-1">الوصف</h2>
              <p className="font-cairo text-sm text-text-muted leading-relaxed">
                {product.description}
              </p>
            </div>
          )}

          {/* Product details grid */}
          {(product.sku || product.brand || product.barcode || product.weight || product.category || product.isFeatured) && (
            <div className="grid grid-cols-2 gap-2">
              {product.sku && (
                <div className="flex items-center gap-2 rounded-lg bg-bg px-3 py-2">
                  <Hash size={14} className="text-text-subtle shrink-0" />
                  <div>
                    <p className="font-cairo text-[11px] text-text-subtle">SKU</p>
                    <p className="font-inter text-sm font-semibold text-text dk-num">{product.sku}</p>
                  </div>
                </div>
              )}
              {product.brand && (
                <div className="flex items-center gap-2 rounded-lg bg-bg px-3 py-2">
                  <Building2 size={14} className="text-text-subtle shrink-0" />
                  <div>
                    <p className="font-cairo text-[11px] text-text-subtle">العلامة التجارية</p>
                    <p className="font-cairo text-sm font-semibold text-text">{product.brand}</p>
                  </div>
                </div>
              )}
              {product.barcode && (
                <div className="flex items-center gap-2 rounded-lg bg-bg px-3 py-2">
                  <Barcode size={14} className="text-text-subtle shrink-0" />
                  <div>
                    <p className="font-cairo text-[11px] text-text-subtle">الباركود</p>
                    <p className="font-inter text-sm font-semibold text-text dk-num">{product.barcode}</p>
                  </div>
                </div>
              )}
              {product.weight && (
                <div className="flex items-center gap-2 rounded-lg bg-bg px-3 py-2">
                  <Weight size={14} className="text-text-subtle shrink-0" />
                  <div>
                    <p className="font-cairo text-[11px] text-text-subtle">الوزن</p>
                    <p className="font-inter text-sm font-semibold text-text dk-num">{product.weight} غرام</p>
                  </div>
                </div>
              )}
              {product.category && (
                <div className="flex items-center gap-2 rounded-lg bg-bg px-3 py-2">
                  <Tag size={14} className="text-text-subtle shrink-0" />
                  <div>
                    <p className="font-cairo text-[11px] text-text-subtle">التصنيف</p>
                    <p className="font-cairo text-sm font-semibold text-text">{product.category}</p>
                  </div>
                </div>
              )}
              {product.isFeatured && (
                <div className="flex items-center gap-2 rounded-lg bg-accent-50 px-3 py-2">
                  <Star size={14} className="text-accent-700 shrink-0" />
                  <span className="font-cairo text-sm font-bold text-accent-700">منتج مميز</span>
                </div>
              )}
            </div>
          )}

          {/* Delivery info — physical */}
          {!isDigital && (
            <div className="flex items-start gap-3 bg-primary-50 border border-primary-100 rounded-xl p-4">
              <Icon name="truck" size={20} className="text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-cairo font-bold text-sm text-primary mb-0.5">توصيل للمنزل</p>
                <p className="font-cairo text-xs text-primary/70 leading-relaxed">
                  بعد تأكيد طلبك ورفع صورة الوصل، سيقوم التاجر بشحن منتجك وإبلاغك بالتفاصيل.
                </p>
              </div>
            </div>
          )}

          {/* Delivery info — digital */}
          {isDigital && (
            <div className="flex items-start gap-3 bg-accent-50 border border-accent-200 rounded-xl p-4">
              <Icon name="bolt" size={20} className="text-accent-700 shrink-0 mt-0.5" />
              <div>
                <p className="font-cairo font-bold text-sm text-accent-700 mb-0.5">تسليم فوري</p>
                <p className="font-cairo text-xs text-accent-700/70 leading-relaxed">
                  بعد تأكيد الدفع ستُفتح قناة محادثة خاصة مع التاجر لتسليم المنتج الرقمي مباشرةً.
                </p>
              </div>
            </div>
          )}

          {/* Add to cart button */}
          <Button
            variant="primary"
            size="lg"
            className="w-full justify-center"
            disabled={outOfStock}
            onClick={handleAddToCart}
          >
            {outOfStock ? (
              <>
                <Icon name="x" size={16} />
                نفد المخزون
              </>
            ) : (
              <>
                <Icon name="cart" size={16} />
                أضف إلى السلة
              </>
            )}
          </Button>

        </div>
      </div>
    </div>
  )
}
