import { Link, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Heart, ShoppingCart } from 'lucide-react'
import { getProductPrice, useCartStore } from '@/store/cartStore'
import { resolveAssetUrl } from '@/utils/assets'

function formatPrice(value) {
  return (value ?? 0).toLocaleString('en-US')
}

export default function ProductCard({ product, featured = false }) {
  const { slug } = useParams()
  const addItem = useCartStore((state) => state.addItem)

  const hasDiscount = product.salePrice && product.salePrice < product.price
  const price = getProductPrice(product)
  const outOfStock = !product.unlimitedStock && product.stock === 0
  const productUrl = `/store/${slug}/product/${product._id}`

  function handleAddToCart() {
    if (outOfStock) return

    addItem({ ...product, storeSlug: slug })
    toast.success('تمت الإضافة إلى السلة')
  }

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-white transition-all duration-default hover:-translate-y-0.5 hover:border-border-strong hover:shadow-card">
      <div className="relative aspect-[4/5] overflow-hidden bg-bg-soft">
        <Link to={productUrl} className="block h-full w-full" aria-label={product.name}>
          {product.images?.[0] ? (
            <img
              src={resolveAssetUrl(product.images[0])}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-primary-50 text-primary">
              <ShoppingCart size={38} />
            </div>
          )}
        </Link>

        <div className="absolute right-2 top-2 flex flex-col gap-1.5">
          {featured && (
            <span className="rounded bg-accent px-2 py-1 font-cairo text-[11px] font-extrabold text-white shadow-sm">
              مميز
            </span>
          )}
          {hasDiscount && (
            <span className="rounded bg-danger px-2 py-1 font-cairo text-[11px] font-extrabold text-white shadow-sm">
              خصم
            </span>
          )}
        </div>

        <button
          type="button"
          className="absolute left-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-text-muted shadow-sm transition-colors hover:text-danger"
          aria-label="إضافة للمفضلة"
        >
          <Heart size={16} />
        </button>

        {outOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/75">
            <span className="rounded-full bg-danger-100 px-3 py-1 font-cairo text-xs font-extrabold text-danger">
              نفد المخزون
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-3">
        {product.category && (
          <p className="mb-1 truncate font-cairo text-[11px] font-semibold text-text-subtle">{product.category}</p>
        )}
        <Link to={productUrl} className="line-clamp-2 min-h-[42px] font-cairo text-sm font-bold leading-5 text-text hover:text-primary">
          {product.name}
        </Link>

        <div className="mt-auto pt-3">
          <div className="mb-2 flex items-end justify-between gap-2">
            <div>
              <p className="font-inter text-lg font-extrabold leading-none text-primary">
                {formatPrice(price)}
                <span className="mr-1 font-cairo text-xs font-normal text-text-muted">ر.ي</span>
              </p>
              {hasDiscount && (
                <p className="mt-1 font-inter text-xs text-text-subtle line-through">
                  {formatPrice(product.price)} ر.ي
                </p>
              )}
            </div>
            {!outOfStock && product.stock > 0 && (
              <span className="font-cairo text-[11px] font-semibold text-success-dark">
                {product.stock} متاح
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={outOfStock}
            className={`flex h-9 w-full items-center justify-center gap-2 rounded font-cairo text-xs font-extrabold transition-colors ${
              outOfStock
                ? 'cursor-not-allowed bg-bg-soft text-text-subtle'
                : 'bg-primary text-white hover:bg-primary-700'
            }`}
          >
            <ShoppingCart size={15} />
            {outOfStock ? 'غير متوفر' : 'أضف للسلة'}
          </button>
        </div>
      </div>
    </article>
  )
}
