import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Minus, Plus, ShieldCheck, ShoppingBag, Trash2 } from 'lucide-react'
import { getProductPrice, useCartStore } from '@/store/cartStore'
import { useQuery } from '@tanstack/react-query'
import { getStoreBySlug } from '@/api/stores'
import { resolveAssetUrl } from '@/utils/assets'

function formatPrice(value) {
  return (value ?? 0).toLocaleString('en-US')
}

function cartKey(item) {
  return `${item.product._id}-${JSON.stringify(item.selectedOptions || {})}`
}

export default function CartPage() {
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
  const shipping = isDigital || subtotal === 0 ? 0 : 1500
  const total = subtotal + shipping

  if (items.length === 0) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-20 text-center" dir="rtl">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-xl border border-border bg-white text-primary shadow-sm">
          <ShoppingBag size={34} />
        </div>
        <h1 className="mt-5 font-cairo text-2xl font-extrabold text-text">سلتك فارغة</h1>
        <p className="mx-auto mt-2 max-w-md font-cairo text-sm leading-7 text-text-muted">
          ابدأ من منتجات المتجر، أضف ما تريد، ثم ارجع هنا لإتمام الطلب بشكل مرتب.
        </p>
        <Link
          to={`/store/${slug}`}
          className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 font-cairo text-sm font-extrabold text-white transition-colors hover:bg-primary-700"
        >
          العودة للتسوق
          <ArrowLeft size={16} />
        </Link>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-8" dir="rtl">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-cairo text-sm font-bold text-primary">سلة التسوق</p>
          <h1 className="mt-1 font-cairo text-3xl font-extrabold text-text">راجع طلبك قبل الدفع</h1>
          <p className="mt-2 font-cairo text-sm text-text-muted">
            {items.length.toLocaleString('en-US')} منتج في السلة من {store?.name ?? 'المتجر'}
          </p>
        </div>
        <Link
          to={`/store/${slug}`}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-white px-4 font-cairo text-sm font-extrabold text-text-muted transition-colors hover:border-primary hover:text-primary"
        >
          متابعة التسوق
          <ArrowLeft size={15} />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        <div className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
          <div className="border-b border-border px-4 py-3">
            <h2 className="font-cairo text-base font-extrabold text-text">المنتجات المختارة</h2>
          </div>

          <div className="divide-y divide-border">
            {items.map((item) => {
              const price = getProductPrice(item.product)
              const selectedOptions = Object.values(item.selectedOptions || {}).filter(Boolean)

              return (
                <article key={cartKey(item)} className="grid grid-cols-[88px_1fr] gap-4 p-4 sm:grid-cols-[104px_1fr_auto]">
                  <Link
                    to={`/store/${slug}/product/${item.product._id}`}
                    className="aspect-square overflow-hidden rounded-lg border border-border bg-bg-soft"
                  >
                    {item.product.images?.[0] ? (
                      <img src={resolveAssetUrl(item.product.images[0])} alt={item.product.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-primary">
                        <ShoppingBag size={28} />
                      </div>
                    )}
                  </Link>

                  <div className="min-w-0">
                    <Link
                      to={`/store/${slug}/product/${item.product._id}`}
                      className="line-clamp-2 font-cairo text-base font-extrabold leading-6 text-text hover:text-primary"
                    >
                      {item.product.name}
                    </Link>
                    {item.product.category && (
                      <p className="mt-1 font-cairo text-xs font-semibold text-text-subtle">{item.product.category}</p>
                    )}
                    {selectedOptions.length > 0 && (
                      <p className="mt-2 font-cairo text-xs text-text-muted">{selectedOptions.join('، ')}</p>
                    )}

                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <div className="flex h-10 items-center overflow-hidden rounded-lg border border-border bg-bg">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product._id, item.quantity + 1, item.selectedOptions)}
                          className="flex h-10 w-10 items-center justify-center text-primary transition-colors hover:bg-white"
                          aria-label="زيادة الكمية"
                        >
                          <Plus size={16} />
                        </button>
                        <span className="min-w-10 px-3 text-center font-inter text-sm font-extrabold text-text">
                          {item.quantity.toLocaleString('en-US')}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product._id, item.quantity - 1, item.selectedOptions)}
                          className="flex h-10 w-10 items-center justify-center text-primary transition-colors hover:bg-white"
                          aria-label="تقليل الكمية"
                        >
                          <Minus size={16} />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(item.product._id, item.selectedOptions)}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg px-3 font-cairo text-xs font-extrabold text-danger transition-colors hover:bg-danger-100"
                      >
                        <Trash2 size={15} />
                        حذف
                      </button>
                    </div>
                  </div>

                  <div className="col-span-2 flex items-end justify-between border-t border-border pt-3 sm:col-span-1 sm:block sm:border-0 sm:pt-0 sm:text-left">
                    <p className="font-cairo text-xs font-bold text-text-muted">الإجمالي</p>
                    <p className="mt-1 font-inter text-lg font-extrabold text-primary">
                      {formatPrice(price * item.quantity)}
                      <span className="mr-1 font-cairo text-xs font-normal text-text-muted">ر.ي</span>
                    </p>
                    {item.product.salePrice && item.product.salePrice < item.product.price && (
                      <p className="mt-1 font-inter text-xs text-text-subtle line-through">
                        {formatPrice(item.product.price * item.quantity)} ر.ي
                      </p>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        </div>

        <aside className="h-fit rounded-xl border border-border bg-white p-5 shadow-sm lg:sticky lg:top-28">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h2 className="font-cairo text-lg font-extrabold text-text">ملخص الطلب</h2>
              <p className="font-cairo text-xs font-semibold text-text-muted">
                {isDigital ? 'تسليم رقمي بدون شحن' : 'توصيل محلي بعد تأكيد الطلب'}
              </p>
            </div>
          </div>

          <div className="space-y-3 border-y border-border py-4">
            <div className="flex justify-between font-cairo text-sm text-text-muted">
              <span>المجموع الفرعي</span>
              <span className="font-inter font-bold text-text">{formatPrice(subtotal)} ر.ي</span>
            </div>
            <div className="flex justify-between font-cairo text-sm text-text-muted">
              <span>{isDigital ? 'التسليم' : 'الشحن المتوقع'}</span>
              <span className={isDigital ? 'font-bold text-success-dark' : 'font-inter font-bold text-text'}>
                {isDigital ? 'مجانا' : `${formatPrice(shipping)} ر.ي`}
              </span>
            </div>
            <div className="flex justify-between pt-2 font-cairo text-base font-extrabold text-text">
              <span>الإجمالي</span>
              <span className="font-inter">{formatPrice(total)} ر.ي</span>
            </div>
          </div>

          <Link
            to={`/store/${slug}/checkout`}
            className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-accent font-cairo text-sm font-extrabold text-white transition-colors hover:bg-accent-700"
          >
            الانتقال للدفع
            <ArrowLeft size={16} />
          </Link>

          <button
            type="button"
            onClick={clearCart}
            className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-lg font-cairo text-xs font-extrabold text-text-muted transition-colors hover:bg-bg hover:text-danger"
          >
            <Trash2 size={14} />
            تفريغ السلة
          </button>
        </aside>
      </div>
    </section>
  )
}
