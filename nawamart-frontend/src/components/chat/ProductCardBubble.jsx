import { ShoppingCart, Zap, Package, Tag, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import clsx from 'clsx'

function formatPrice(n) {
  if (n == null) return ''
  return Number(n).toLocaleString('en-US')
}

export default function ProductCardBubble({ card, isMine, time, onBuy }) {
  const navigate = useNavigate()
  if (!card) return null

  const hasDiscount = card.salePrice != null && card.salePrice < card.price
  const displayPrice = hasDiscount ? card.salePrice : card.price

  const handleBuy = () => {
    if (onBuy) { onBuy(); return }
    if (card.storeSlug && card.productId) {
      navigate(`/store/${card.storeSlug}/product/${card.productId}`)
    }
  }

  return (
    <div className={clsx(
      'product-card-bubble',
      isMine ? 'product-card-bubble--mine' : 'product-card-bubble--theirs'
    )}>
      {/* Product image */}
      <div className="product-card-image">
        {card.image ? (
          <img
            src={card.image}
            alt={card.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#F4F7FA] to-[#E7EDF3]">
            <Package size={32} className="text-[#9298A3]" />
          </div>
        )}
        {/* Digital / Physical badge */}
        <div className={clsx(
          'absolute top-2 right-2 flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full',
          card.isDigital
            ? 'bg-[#6750A4] text-white'
            : 'bg-[#18212F] text-white'
        )}>
          {card.isDigital ? <Zap size={9} /> : <Package size={9} />}
          {card.isDigital ? 'رقمي' : 'مادي'}
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="font-bold text-sm text-[#1D2430] leading-snug mb-2 line-clamp-2">
          {card.name}
        </p>

        {/* Price row */}
        <div className="flex items-center gap-2 mb-3">
          <span className="font-extrabold text-base text-[#C93F2B] font-en">
            {formatPrice(displayPrice)}
            <span className="text-xs font-bold text-[#9298A3] mr-1">ر.ي</span>
          </span>
          {hasDiscount && (
            <span className="text-xs text-[#9298A3] line-through font-en">
              {formatPrice(card.price)}
            </span>
          )}
          {hasDiscount && (
            <span className="flex items-center gap-0.5 text-[10px] font-bold text-white bg-[#C93F2B] px-1.5 py-0.5 rounded-full">
              <Tag size={8} />
              {Math.round((1 - card.salePrice / card.price) * 100)}%
            </span>
          )}
        </div>

        {/* Buy CTA */}
        <button
          onClick={handleBuy}
          className="product-card-buy-btn"
        >
          <ShoppingCart size={14} />
          <span>شراء الآن</span>
          <ArrowLeft size={12} className="mr-auto icon-flip" />
        </button>
      </div>

      {/* Time */}
      {time && (
        <p className="text-[10px] text-[#9298A3] px-3 pb-2 font-en">{time}</p>
      )}
    </div>
  )
}
