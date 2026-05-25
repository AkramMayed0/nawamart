import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useCartStore } from '@/store/cartStore'
import Icon from '@/components/ui/Icon'
import { resolveAssetUrl } from '@/utils/assets'

export default function CartDrawer() {
  const { slug } = useParams()
  const { items, isOpen, closeCart, removeItem, updateQuantity } = useCartStore()

  const total    = items.reduce((s, i) => s + i.product.price * i.quantity, 0)
  const isEmpty  = items.length === 0
  const navigate = useNavigate()

  // Lock body scroll while drawer is open
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else        document.body.style.overflow = ''
    return ()  => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  function goCheckout() {
    closeCart()
    navigate(`/store/${slug}/checkout`)
  }

  return (
    /* ── Overlay ── */
    <div
      className="fixed inset-0 bg-black/40 z-50 flex justify-start"
      onClick={closeCart}
    >
      {/* ── Drawer panel (slides from right in RTL = left edge) ── */}
      <div
        className="w-[420px] max-w-full bg-white h-full flex flex-col shadow-lg animate-slide-in"
        onClick={e => e.stopPropagation()}
      >

        {/* Head */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="font-cairo font-extrabold text-lg text-text">
            سلة المشتريات
            <span className="font-inter font-semibold text-sm text-text-muted mr-2">
              ({items.length})
            </span>
          </h3>
          <button
            onClick={closeCart}
            className="w-9 h-9 rounded flex items-center justify-center text-text-muted hover:bg-bg transition-colors"
          >
            <Icon name="x" size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
          {isEmpty ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
              <div className="w-16 h-16 rounded-2xl bg-bg-soft border border-border flex items-center justify-center">
                <Icon name="cart" size={28} className="text-text-subtle" />
              </div>
              <p className="font-cairo font-bold text-text">السلة فارغة</p>
              <p className="font-cairo text-sm text-text-muted">
                أضف منتجاً للمتابعة
              </p>
            </div>
          ) : (
            items.map((item) => (
              <CartItem
                key={`${item.product._id}-${JSON.stringify(item.selectedOptions)}`}
                item={item}
                onUpdate={updateQuantity}
                onRemove={removeItem}
              />
            ))
          )}
        </div>

        {/* Footer — only when cart has items */}
        {!isEmpty && (
          <div className="px-5 py-4 border-t border-border bg-bg flex flex-col gap-3">
            {/* Total row */}
            <div className="flex items-center justify-between">
              <span className="font-cairo font-extrabold text-base text-text">الإجمالي</span>
              <span className="font-inter font-bold text-base text-text dk-num">
                {total.toLocaleString('en-US')}
                <span className="font-cairo font-normal text-xs text-text-muted mr-1">ر.ي</span>
              </span>
            </div>

            <p className="font-cairo text-xs text-text-muted">
              🚚 رسوم الشحن تُحسب في خطوة الدفع
            </p>

            {/* CTA */}
            <button
              onClick={goCheckout}
              className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent-700 text-white font-cairo font-bold text-[15px] py-3 rounded-lg transition-colors"
            >
              متابعة للدفع
              <Icon name="arrow-left" size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Single cart row ── */
function CartItem({ item, onUpdate, onRemove }) {
  const { product, quantity, selectedOptions } = item
  const opts = Object.values(selectedOptions || {})

  return (
    <div className="grid grid-cols-[64px_1fr_auto] gap-3 items-center pb-3 border-b border-border last:border-0">

      {/* Thumb */}
      <div className="w-16 h-16 rounded-lg bg-bg-soft border border-border overflow-hidden shrink-0">
        {product.images?.[0] ? (
          <img src={resolveAssetUrl(product.images[0])} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Icon name="image" size={20} className="text-border-strong" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="min-w-0">
        <p className="font-cairo font-bold text-sm text-text truncate">{product.name}</p>
        {opts.length > 0 && (
          <p className="font-cairo text-xs text-text-muted mt-0.5">{opts.join(' · ')}</p>
        )}

        {/* Qty controls */}
        <div className="inline-flex items-center border border-border rounded-lg mt-2 overflow-hidden">
          <button
            onClick={() => onUpdate(product._id, quantity - 1, selectedOptions)}
            className="w-7 h-7 flex items-center justify-center text-text hover:bg-bg transition-colors"
          >
            <Icon name="minus" size={13} />
          </button>
          <span className="w-7 text-center font-inter font-bold text-sm text-text">
            {quantity}
          </span>
          <button
            onClick={() => onUpdate(product._id, quantity + 1, selectedOptions)}
            className="w-7 h-7 flex items-center justify-center text-text hover:bg-bg transition-colors"
          >
            <Icon name="plus" size={13} />
          </button>
        </div>
      </div>

      {/* Price + remove */}
      <div className="flex flex-col items-end gap-1">
        <span className="font-inter font-bold text-sm text-text dk-num">
          {(product.price * quantity).toLocaleString('en-US')}
        </span>
        <span className="font-cairo text-[10px] text-text-muted">ر.ي</span>
        <button
          onClick={() => onRemove(product._id, selectedOptions)}
          className="mt-1 text-text-subtle hover:text-danger transition-colors"
          aria-label="حذف"
        >
          <Icon name="trash" size={14} />
        </button>
      </div>
    </div>
  )
}
