import { useState, useEffect, useRef } from 'react'
import { X, Search, Package, Zap, ShoppingBag, Loader } from 'lucide-react'
import { getProductsByStore } from '@/api/products'
import { useAuthStore } from '@/store/authStore'
import clsx from 'clsx'

function formatPrice(n) {
  return Number(n || 0).toLocaleString('en-US')
}

export default function ProductPicker({ onSelect, onClose }) {
  const store = useAuthStore(s => s.store)
  const storeId = store?._id

  const [products, setProducts] = useState([])
  const [loading, setLoading]   = useState(true)
  const [query, setQuery]       = useState('')
  const searchRef = useRef(null)

  useEffect(() => {
    if (!storeId) return
    setLoading(true)
    getProductsByStore(storeId)
      .then(res => setProducts(res.data.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [storeId])

  useEffect(() => {
    setTimeout(() => searchRef.current?.focus(), 120)
  }, [])

  const filtered = query.trim()
    ? products.filter(p => p.name.includes(query) || p.category?.includes(query))
    : products

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="product-picker-sheet">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[#E1DED8]">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#F4F7FA] to-[#E7EDF3] flex items-center justify-center shrink-0">
            <ShoppingBag size={16} className="text-[#18212F]" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm text-[#1D2430]">إرسال بطاقة منتج</h3>
            <p className="text-[11px] text-[#9298A3]">اختر منتجاً لإرساله كبطاقة</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#F6F3EE] text-[#9298A3] hover:text-[#1D2430] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 py-3 border-b border-[#E1DED8]">
          <div className="relative">
            <Search size={14} className="absolute top-1/2 -translate-y-1/2 right-3 text-[#9298A3] pointer-events-none" />
            <input
              ref={searchRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="ابحث عن منتج…"
              className="w-full bg-[#F6F3EE] border border-[#E1DED8] rounded-xl pr-9 pl-3 py-2 text-sm text-[#1D2430] placeholder:text-[#9298A3] focus:outline-none focus:border-[#18212F]/40 focus:ring-2 focus:ring-[#18212F]/8"
            />
          </div>
        </div>

        {/* Product list */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader size={24} className="text-[#18212F]/30 animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2 text-center px-6">
              <Package size={28} className="text-[#9298A3]" />
              <p className="text-sm font-semibold text-[#5F6673]">
                {query ? 'لا توجد نتائج' : 'لا توجد منتجات'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#E1DED8]/60">
              {filtered.map(product => {
                const hasDiscount = product.salePrice != null && product.salePrice < product.price
                const displayPrice = hasDiscount ? product.salePrice : product.price
                const isDigital = product.digitalDelivery?.enabled

                return (
                  <button
                    key={product._id}
                    onClick={() => onSelect(product._id)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#F6F3EE] active:bg-[#ECE8E1] transition-colors text-right"
                  >
                    {/* Thumbnail */}
                    <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-[#F6F3EE] border border-[#E1DED8]">
                      {product.images?.[0] ? (
                        <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package size={18} className="text-[#9298A3]" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <p className="text-sm font-bold text-[#1D2430] truncate">{product.name}</p>
                        <span className={clsx(
                          'shrink-0 inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full',
                          isDigital ? 'bg-[#ECE7F8] text-[#6750A4]' : 'bg-[#F4F7FA] text-[#18212F]'
                        )}>
                          {isDigital ? <Zap size={8} /> : <Package size={8} />}
                          {isDigital ? 'رقمي' : 'مادي'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-extrabold text-[#C93F2B] font-en">
                          {formatPrice(displayPrice)}
                          <span className="text-[10px] font-semibold text-[#9298A3] mr-0.5">ر.ي</span>
                        </span>
                        {hasDiscount && (
                          <span className="text-[10px] text-[#9298A3] line-through font-en">
                            {formatPrice(product.price)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Send indicator */}
                    <span className="shrink-0 text-xs font-bold text-[#C93F2B] bg-[#FFF4F1] px-2.5 py-1 rounded-xl">
                      إرسال
                    </span>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
