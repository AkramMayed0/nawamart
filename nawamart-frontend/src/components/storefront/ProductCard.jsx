import { Link, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useCartStore } from '@/store/cartStore'
import Icon from '@/components/ui/Icon'

export default function ProductCard({ product }) {
  const { slug } = useParams()
  const addItem  = useCartStore(s => s.addItem)

  const outOfStock = product.stock === 0

  function handleAddToCart(e) {
    e.preventDefault()   // don't navigate to detail page
    e.stopPropagation()
    addItem({ ...product, storeSlug: slug })
    toast.success('أُضيف إلى السلة 🛒')
  }

  return (
    <Link
      to={`/store/${slug}/product/${product._id}`}
      className="group bg-white rounded-xl border border-border overflow-hidden hover:shadow-card hover:border-border-strong transition-all duration-default"
    >
      {/* Image */}
      <div className="aspect-square bg-bg-soft overflow-hidden relative">
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Icon name="image" size={32} className="text-border-strong" />
          </div>
        )}
        {outOfStock && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="font-cairo font-bold text-xs text-danger bg-danger-100 px-2 py-1 rounded-pill">
              نفد المخزون
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3" dir="rtl">
        <h3 className="font-cairo font-semibold text-sm text-text truncate mb-0.5">
          {product.name}
        </h3>
        {product.description && (
          <p className="font-cairo text-xs text-text-muted line-clamp-1 mb-2">
            {product.description}
          </p>
        )}

        <div className="flex items-center justify-between gap-2 mt-2">
          <p className="font-extrabold text-base text-primary dk-num">
            {product.price?.toLocaleString('ar-YE')}
            <span className="font-cairo font-normal text-xs text-text-muted mr-1">ر.ي</span>
          </p>

          <button
            onClick={handleAddToCart}
            disabled={outOfStock}
            className={`flex items-center gap-1 text-xs font-semibold font-cairo px-2.5 py-1.5 rounded-lg transition-colors ${
              outOfStock
                ? 'bg-bg-soft text-text-subtle cursor-not-allowed'
                : 'bg-primary text-white hover:bg-primary-700'
            }`}
          >
            <Icon name="cart" size={13} />
            {outOfStock ? 'نفد' : 'أضف'}
          </button>
        </div>
      </div>
    </Link>
  )
}
