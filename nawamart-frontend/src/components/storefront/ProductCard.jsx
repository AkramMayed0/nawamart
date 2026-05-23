import { Link, useParams } from 'react-router-dom'
import Icon from '@/components/ui/Icon'

export default function ProductCard({ product }) {
  const { slug } = useParams()

  return (
    <Link
      to={`/store/${slug}/product/${product._id}`}
      className="group bg-white rounded-xl border border-border overflow-hidden hover:shadow-card hover:border-border-strong transition-all duration-default"
    >
      {/* Image */}
      <div className="aspect-square bg-bg-soft overflow-hidden">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Icon name="image" size={32} className="text-border-strong" />
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
        <p className="font-extrabold text-base text-primary dk-num">
          {product.price?.toLocaleString('ar-YE')}
          <span className="font-cairo font-normal text-xs text-text-muted mr-1">ر.ي</span>
        </p>
      </div>
    </Link>
  )
}
