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
        className="inline-flex items-center gap-2 font-cairo text-sm font-bold text-text-muted hover:text-primary transition-all mb-8 bg-bg-soft/50 hover:bg-white px-4 py-2 rounded-xl hover-lift border border-transparent hover:border-border/50 hover:shadow-sm"
      >
        <Icon name="arrow-right" size={16} />
        العودة للمتجر
      </button>

      {/* ── Two-column layout ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-14">

        {/* Left col — image gallery */}
        <div className="rounded-3xl overflow-hidden border border-border/50 bg-surface shadow-sm">
           <ImageGallery images={product.images || []} />
        </div>

        {/* Right col — info */}
        <div className="flex flex-col gap-6">

          {/* Name + price + stock */}
          <div>
            <h1 className="font-cairo font-extrabold text-3xl text-text mb-3 leading-tight">
              {product.name}
            </h1>
            <p className="dk-num font-extrabold text-4xl text-primary mb-4 flex items-end gap-1">
              {product.price?.toLocaleString('ar-YE')}
              <span className="font-cairo font-bold text-lg text-text-muted mb-1">ر.ي</span>
            </p>
            <span className={`inline-flex items-center gap-1.5 text-xs font-bold font-cairo px-3 py-1.5 rounded-pill shadow-sm ${
              outOfStock
                ? 'bg-danger/10 text-danger border border-danger/20'
                : 'bg-success/10 text-success-dark border border-success/20'
            }`}>
              <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
              {outOfStock ? 'نفد المخزون' : product.unlimitedStock ? 'متوفر وجاهز للتسليم' : `متوفر · ${product.stock} قطعة`}
            </span>
          </div>

          {/* Description */}
          {product.description && (
            <div className="bg-surface rounded-2xl p-5 border border-border/50 shadow-sm">
              <h2 className="font-cairo font-extrabold text-sm text-primary mb-2">وصف المنتج</h2>
              <p className="font-cairo text-sm text-text-muted leading-relaxed">
                {product.description}
              </p>
            </div>
          )}

          {/* Product details grid */}
          {(product.sku || product.brand || product.barcode || product.weight || product.category || product.isFeatured) && (
            <div className="grid grid-cols-2 gap-3">
              {product.sku && (
                <div className="flex items-center gap-3 rounded-xl bg-surface border border-border/50 px-4 py-3 shadow-sm hover:border-primary/20 transition-colors">
                  <div className="bg-primary-50 text-primary p-2 rounded-lg">
                    <Hash size={16} />
                  </div>
                  <div>
                    <p className="font-cairo text-[11px] font-bold text-text-subtle">رقم الصنف (SKU)</p>
                    <p className="font-inter text-sm font-extrabold text-text dk-num">{product.sku}</p>
                  </div>
                </div>
              )}
              {product.brand && (
                <div className="flex items-center gap-3 rounded-xl bg-surface border border-border/50 px-4 py-3 shadow-sm hover:border-primary/20 transition-colors">
                  <div className="bg-primary-50 text-primary p-2 rounded-lg">
                    <Building2 size={16} />
                  </div>
                  <div>
                    <p className="font-cairo text-[11px] font-bold text-text-subtle">العلامة التجارية</p>
                    <p className="font-cairo text-sm font-extrabold text-text">{product.brand}</p>
                  </div>
                </div>
              )}
              {product.barcode && (
                <div className="flex items-center gap-3 rounded-xl bg-surface border border-border/50 px-4 py-3 shadow-sm hover:border-primary/20 transition-colors">
                  <div className="bg-primary-50 text-primary p-2 rounded-lg">
                    <Barcode size={16} />
                  </div>
                  <div>
                    <p className="font-cairo text-[11px] font-bold text-text-subtle">الباركود</p>
                    <p className="font-inter text-sm font-extrabold text-text dk-num">{product.barcode}</p>
                  </div>
                </div>
              )}
              {product.weight && (
                <div className="flex items-center gap-3 rounded-xl bg-surface border border-border/50 px-4 py-3 shadow-sm hover:border-primary/20 transition-colors">
                  <div className="bg-primary-50 text-primary p-2 rounded-lg">
                    <Weight size={16} />
                  </div>
                  <div>
                    <p className="font-cairo text-[11px] font-bold text-text-subtle">الوزن</p>
                    <p className="font-inter text-sm font-extrabold text-text dk-num">{product.weight} غرام</p>
                  </div>
                </div>
              )}
              {product.category && (
                <div className="flex items-center gap-3 rounded-xl bg-surface border border-border/50 px-4 py-3 shadow-sm hover:border-primary/20 transition-colors">
                   <div className="bg-primary-50 text-primary p-2 rounded-lg">
                    <Tag size={16} />
                  </div>
                  <div>
                    <p className="font-cairo text-[11px] font-bold text-text-subtle">التصنيف</p>
                    <p className="font-cairo text-sm font-extrabold text-text">{product.category}</p>
                  </div>
                </div>
              )}
              {product.isFeatured && (
                <div className="flex items-center gap-3 rounded-xl bg-accent-50 border border-accent/20 px-4 py-3 shadow-sm">
                  <div className="bg-accent/10 text-accent p-2 rounded-lg">
                     <Star size={16} className="fill-current" />
                  </div>
                  <span className="font-cairo text-sm font-extrabold text-accent-700">منتج مميز</span>
                </div>
              )}
            </div>
          )}

          {/* Delivery info — physical */}
          {!isDigital && (
            <div className="flex items-start gap-4 bg-primary-50 border border-primary-100 rounded-2xl p-5 shadow-sm">
              <div className="bg-primary/10 text-primary p-2 rounded-xl shrink-0">
                 <Icon name="truck" size={22} />
              </div>
              <div>
                <p className="font-cairo font-extrabold text-sm text-primary mb-1">توصيل للمنزل الموثوق</p>
                <p className="font-cairo text-xs text-primary/80 leading-relaxed font-semibold">
                  بعد تأكيد طلبك ورفع صورة الوصل، سيقوم التاجر بتجهيز شحنتك فوراً وإرسالها عبر أفضل المناديب.
                </p>
              </div>
            </div>
          )}

          {/* Delivery info — digital */}
          {isDigital && (
            <div className="flex items-start gap-4 bg-accent-50 border border-accent-200 rounded-2xl p-5 shadow-sm">
              <div className="bg-accent/10 text-accent-700 p-2 rounded-xl shrink-0">
                 <Icon name="bolt" size={22} />
              </div>
              <div>
                <p className="font-cairo font-extrabold text-sm text-accent-700 mb-1">تسليم فوري (رقمي)</p>
                <p className="font-cairo text-xs text-accent-700/80 leading-relaxed font-semibold">
                  بمجرد إتمام الدفع، ستحصل على منتجك الرقمي عبر محادثة سرية وآمنة مباشرة مع التاجر.
                </p>
              </div>
            </div>
          )}

          {/* Add to cart button */}
          <div className="mt-2 sticky bottom-4 z-10 bg-surface/80 backdrop-blur-md p-2 -mx-2 rounded-2xl border border-white/20 shadow-[0_-10px_40px_rgba(255,255,255,0.8)]">
            <button
              disabled={outOfStock}
              onClick={handleAddToCart}
              className={`w-full hover-lift flex h-14 items-center justify-center gap-3 rounded-xl font-cairo text-base font-extrabold transition-all active:scale-95 ${
                outOfStock
                  ? 'cursor-not-allowed bg-bg-soft text-text-muted shadow-none'
                  : 'bg-primary text-white hover:bg-primary-700 shadow-lg shadow-primary/20'
              }`}
            >
              {outOfStock ? (
                <>
                  <Icon name="x" size={20} />
                  عذراً، نفد المخزون
                </>
              ) : (
                <>
                  <Icon name="cart" size={20} />
                  أضف إلى السلة
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
