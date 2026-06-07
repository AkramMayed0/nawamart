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
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl bg-white hover-lift border border-transparent hover:border-primary/10 hover:shadow-glass-hover">
      <div className="relative aspect-[4/5] overflow-hidden bg-bg-soft rounded-t-2xl">
        <Link to={productUrl} className="block h-full w-full" aria-label={product.name}>
          {product.images?.[0] ? (
            <img
              src={resolveAssetUrl(product.images[0])}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-primary-50 text-primary">
              <ShoppingCart size={38} className="opacity-50" />
            </div>
          )}
        </Link>

        {/* Top Badges */}
        <div className="absolute right-3 top-3 flex flex-col gap-2">
          {featured && (
            <span className="glass-panel px-2.5 py-1 rounded-pill font-cairo text-[11px] font-extrabold text-primary shadow-sm backdrop-blur-md">
              مميز
            </span>
          )}
          {hasDiscount && (
            <span className="glass-panel px-2.5 py-1 rounded-pill bg-danger/10 font-cairo text-[11px] font-extrabold text-danger shadow-sm backdrop-blur-md">
              خصم
            </span>
          )}
        </div>

        {/* Favorite Button */}
        <button
          type="button"
          className="absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-full glass-panel text-text-muted shadow-sm transition-all hover:bg-white hover:text-danger active:scale-95"
          aria-label="إضافة للمفضلة"
        >
          <Heart size={16} />
        </button>

        {/* Hover overlay for cart (Desktop only) */}
        {!outOfStock && (
          <div className="absolute inset-x-0 bottom-0 flex translate-y-full items-center justify-center p-3 opacity-0 transition-all duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100 hidden md:flex bg-gradient-to-t from-black/50 to-transparent">
            <button
              onClick={handleAddToCart}
              className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-white font-cairo text-sm font-extrabold text-primary shadow-lg transition-transform active:scale-95 hover:bg-primary-50"
            >
              <ShoppingCart size={16} />
              أضف للسلة
            </button>
          </div>
        )}

        {outOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[2px]">
            <span className="rounded-pill bg-danger px-4 py-1.5 font-cairo text-xs font-extrabold text-white shadow-lg">
              نفد المخزون
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        {product.category && (
          <p className="mb-1.5 truncate font-cairo text-[11px] font-bold text-accent tracking-wide">{product.category}</p>
        )}
        <Link to={productUrl} className="line-clamp-2 min-h-[44px] font-cairo text-sm font-extrabold leading-tight text-text transition-colors group-hover:text-primary">
          {product.name}
        </Link>

        <div className="mt-auto pt-4 flex items-end justify-between gap-2">
          <div>
            <p className="dk-num text-lg font-extrabold leading-none text-primary">
              {formatPrice(price)}
              <span className="mr-1 font-cairo text-xs font-bold text-text-muted">ر.ي</span>
            </p>
            {hasDiscount && (
              <p className="mt-1.5 dk-num text-xs font-medium text-text-subtle line-through">
                {formatPrice(product.price)} ر.ي
              </p>
            )}
          </div>
          
          {/* Mobile Cart Button / Stock indicator */}
          <div className="flex flex-col items-end">
             {!outOfStock && product.stock > 0 && (
              <span className="font-cairo text-[10px] font-bold text-success mb-2 bg-success/10 px-2 py-0.5 rounded-full">
                {product.stock} متاح
              </span>
            )}
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={outOfStock}
              className={`md:hidden flex h-9 w-9 items-center justify-center rounded-full shadow-sm transition-all active:scale-95 ${
                outOfStock
                  ? 'cursor-not-allowed bg-bg-soft text-text-subtle'
                  : 'bg-primary text-white'
              }`}
              aria-label="أضف للسلة"
            >
              <ShoppingCart size={16} />
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}
