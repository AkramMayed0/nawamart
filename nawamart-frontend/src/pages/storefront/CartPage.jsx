import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Minus, Plus, ShieldCheck, ShoppingBag, Trash2 } from 'lucide-react'
import { getProductPrice, useCartStore } from '@/store/cartStore'
import { useQuery } from '@tanstack/react-query'
import { getStoreBySlug } from '@/api/stores'
import usePageTitle from '@/hooks/usePageTitle'
import { resolveAssetUrl } from '@/utils/assets'

function formatPrice(value) {
  return (value ?? 0).toLocaleString('en-US')
}

function cartKey(item) {
  return `${item.product._id}-${JSON.stringify(item.selectedOptions || {})}`
}

export default function CartPage() {
  usePageTitle('سلة التسوق')
  const { slug } = useParams()
  const items = useCartStore((state) => state.items)
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const removeItem = useCartStore((state) => state.removeItem)
  const clearCart = useCartStore((state) => state.clearCart)

  const { data: store } = useQuery({
    queryKey: ['store', slug],
    queryFn: () => getStoreBySlug(slug).then((response) => response.data.data),
    staleTime: 1000 * 60 * 5,
  })

  const isDigital = store?.type === 'digital'
  const subtotal = items.reduce((sum, item) => sum + getProductPrice(item.product) * item.quantity, 0)
  // Shipping is calculated at checkout based on selected city
  const total = subtotal

  if (items.length === 0) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-24 text-center" dir="rtl">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[2rem] bg-primary/5 text-primary shadow-inner mb-6 relative">
          <div className="absolute inset-0 bg-primary/10 blur-xl rounded-full" />
          <ShoppingBag size={40} className="relative z-10" />
        </div>
        <h1 className="mt-5 font-cairo text-3xl font-extrabold text-text">سلتك فارغة تماماً</h1>
        <p className="mx-auto mt-4 max-w-md font-cairo text-base leading-relaxed text-text-muted">
          ابدأ باكتشاف منتجات المتجر، أضف ما يعجبك، ثم عد إلى هنا لإتمام طلبك بكل سهولة.
        </p>
        <Link
          to={`/store/${slug}`}
          className="hover-lift mt-8 inline-flex h-12 items-center justify-center gap-3 rounded-xl bg-primary px-8 font-cairo text-base font-extrabold text-white transition-all hover:bg-primary-700 shadow-lg shadow-primary/20"
        >
          اكتشف المنتجات
          <ArrowLeft size={18} />
        </Link>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-10" dir="rtl">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-cairo text-sm font-bold text-primary mb-1">سلة التسوق</p>
          <h1 className="font-cairo text-3xl font-extrabold text-text tracking-tight">راجع طلبك قبل الدفع</h1>
          <p className="mt-2 font-cairo text-sm font-medium text-text-muted bg-text-muted/5 inline-flex px-3 py-1 rounded-full">
            {items.length.toLocaleString('en-US')} منتج في السلة من {store?.name ?? 'المتجر'}
          </p>
        </div>
        <Link
          to={`/store/${slug}`}
          className="hover-lift inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-border/50 bg-white px-5 font-cairo text-sm font-extrabold text-text-muted transition-all hover:border-primary/30 hover:text-primary hover:shadow-sm"
        >
          متابعة التسوق
          <ArrowLeft size={16} />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]">
        <div className="overflow-hidden rounded-3xl border border-border/50 bg-white shadow-sm">
          <div className="border-b border-border/50 bg-bg-soft/30 px-6 py-4">
            <h2 className="font-cairo text-base font-extrabold text-text">المنتجات المختارة</h2>
          </div>

          <div className="divide-y divide-border/50">
            {items.map((item) => {
              const price = getProductPrice(item.product)
              const selectedOptions = Object.values(item.selectedOptions || {}).filter(Boolean)

              return (
                <article key={cartKey(item)} className="grid grid-cols-[100px_1fr] gap-5 p-6 sm:grid-cols-[120px_1fr_auto] hover:bg-bg-soft/20 transition-colors">
                  <Link
                    to={`/store/${slug}/product/${item.product._id}`}
                    className="aspect-square overflow-hidden rounded-2xl border border-border/50 bg-bg-soft group"
                  >
                    {item.product.images?.[0] ? (
                      <img src={resolveAssetUrl(item.product.images[0])} alt={item.product.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-primary/50">
                        <ShoppingBag size={32} />
                      </div>
                    )}
                  </Link>

                  <div className="min-w-0 flex flex-col">
                    <Link
                      to={`/store/${slug}/product/${item.product._id}`}
                      className="line-clamp-2 font-cairo text-lg font-extrabold leading-tight text-text hover:text-primary transition-colors"
                    >
                      {item.product.name}
                    </Link>
                    {item.product.category && (
                      <p className="mt-1.5 font-cairo text-[11px] font-bold text-accent tracking-wide">{item.product.category}</p>
                    )}
                    {selectedOptions.length > 0 && (
                      <p className="mt-2 font-cairo text-xs font-semibold text-text-muted bg-bg-soft inline-block px-2 py-1 rounded-md">{selectedOptions.join('، ')}</p>
                    )}

                    <div className="mt-auto pt-4 flex flex-wrap items-center gap-4">
                      <div className="flex h-11 items-center overflow-hidden rounded-xl border border-border/80 bg-white shadow-sm">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product._id, item.quantity + 1, item.selectedOptions)}
                          className="flex h-11 w-11 items-center justify-center text-primary transition-colors hover:bg-primary-50 active:scale-95"
                          aria-label="زيادة الكمية"
                        >
                          <Plus size={16} />
                        </button>
                        <span className="min-w-[40px] px-2 text-center font-inter text-sm font-extrabold text-text">
                          {item.quantity.toLocaleString('en-US')}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product._id, item.quantity - 1, item.selectedOptions)}
                          className="flex h-11 w-11 items-center justify-center text-primary transition-colors hover:bg-primary-50 active:scale-95"
                          aria-label="تقليل الكمية"
                        >
                          <Minus size={16} />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(item.product._id, item.selectedOptions)}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl px-4 font-cairo text-sm font-bold text-danger transition-all hover:bg-danger/10 hover:shadow-sm"
                      >
                        <Trash2 size={16} />
                        حذف
                      </button>
                    </div>
                  </div>

                  <div className="col-span-2 flex items-end justify-between border-t border-border/50 pt-4 sm:col-span-1 sm:block sm:border-0 sm:pt-0 sm:text-left">
                    <p className="font-cairo text-xs font-bold text-text-muted mb-1">الإجمالي</p>
                    <p className="font-inter text-xl font-extrabold text-primary">
                      {formatPrice(price * item.quantity)}
                      <span className="mr-1 font-cairo text-sm font-bold text-text-muted">ر.ي</span>
                    </p>
                    {item.product.salePrice && item.product.salePrice < item.product.price && (
                      <p className="mt-1 font-inter text-xs font-medium text-text-subtle line-through">
                        {formatPrice(item.product.price * item.quantity)} ر.ي
                      </p>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        </div>

        <aside className="h-fit rounded-3xl border border-border/50 bg-white p-6 shadow-sm lg:sticky lg:top-32">
          <div className="mb-6 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h2 className="font-cairo text-xl font-extrabold text-text">ملخص الطلب</h2>
              <p className="font-cairo text-xs font-semibold text-text-muted mt-0.5">
                {isDigital ? 'تسليم رقمي فوري بدون شحن' : 'توصيل موثوق بعد تأكيد الطلب'}
              </p>
            </div>
          </div>

          <div className="space-y-4 border-y border-border/50 py-5">
            <div className="flex justify-between font-cairo text-sm font-semibold text-text-muted">
              <span>المجموع الفرعي</span>
              <span className="font-inter font-extrabold text-text">{formatPrice(subtotal)} ر.ي</span>
            </div>
            <div className="flex justify-between font-cairo text-sm font-semibold text-text-muted">
              <span>{isDigital ? 'رسوم التسليم' : 'رسوم الشحن المتوقعة'}</span>
              <span className={isDigital ? 'font-bold text-success-dark bg-success/10 px-2 py-0.5 rounded-md' : 'font-cairo font-bold text-text'}>
                {isDigital ? 'مجاناً' : 'تُحدد لاحقاً'}
              </span>
            </div>
            <div className="flex justify-between pt-3 font-cairo text-lg font-extrabold text-primary border-t border-border/30">
              <span>الإجمالي الكلي</span>
              <span className="font-inter dk-num">{formatPrice(total)} ر.ي</span>
            </div>
          </div>

          <Link
            to={`/store/${slug}/checkout`}
            className="hover-lift mt-6 flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-accent font-cairo text-base font-extrabold text-white transition-all hover:bg-accent-600 shadow-lg shadow-accent/20"
          >
            الانتقال لإتمام الدفع
            <ArrowLeft size={18} />
          </Link>

          <button
            type="button"
            onClick={clearCart}
            className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl font-cairo text-sm font-bold text-text-muted transition-all hover:bg-danger/5 hover:text-danger"
          >
            <Trash2 size={16} />
            تفريغ السلة بالكامل
          </button>
        </aside>
      </div>
    </section>
  )
}
