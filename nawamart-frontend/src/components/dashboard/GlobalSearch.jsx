import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Package, ShoppingBag, Users, Tag, X } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { globalSearch as searchApi } from '@/api/search'
import { resolveAssetUrl } from '@/utils/assets'

function ResultGroup({ title, icon: Icon, items, renderItem, emptyMsg }) {
  if (!items || items.length === 0) return null
  return (
    <div>
      <div className="flex items-center gap-2 px-4 py-2 bg-bg-soft/50">
        <Icon size={14} className="text-text-muted" />
        <span className="font-cairo text-xs font-bold text-text-muted">{title}</span>
        <span className="font-inter text-[10px] font-bold text-text-subtle bg-border/50 px-1.5 py-0.5 rounded">{items.length}</span>
      </div>
      <div className="flex flex-col">
        {items.map(renderItem)}
      </div>
    </div>
  )
}

export default function GlobalSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState(null)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef(null)
  const panelRef = useRef(null)
  const debounceRef = useRef(null)
  const navigate = useNavigate()
  const storeId = useAuthStore(s => s.store?._id)

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  useEffect(() => {
    function handleClick(e) {
      if (panelRef.current && !panelRef.current.contains(e.target) && !inputRef.current?.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => {
    function handleKey(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(p => !p)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [])

  const doSearch = useCallback(async (q) => {
    if (q.length < 2) { setResults(null); return }
    setLoading(true)
    try {
      const res = await searchApi(q, storeId)
      setResults(res.data.data)
    } catch { setResults(null) }
    setLoading(false)
  }, [storeId])

  function handleChange(e) {
    const val = e.target.value
    setQuery(val)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => doSearch(val), 300)
  }

  function handleSelect(path) {
    setOpen(false)
    setQuery('')
    setResults(null)
    navigate(path)
  }

  function statusColor(s) {
    const m = { pending: 'bg-warning-100 text-warning', payment_under_review: 'bg-warning-100 text-warning', confirmed: 'bg-info-100 text-info', shipped: 'bg-accent-50 text-accent-700', delivered: 'bg-success-100 text-success-dark', rejected: 'bg-danger-100 text-danger' }
    return m[s] || 'bg-bg-soft text-text-muted'
  }

  return (
    <div className="relative w-full max-w-md">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 w-full h-10 px-4 rounded-xl bg-bg-soft border border-border text-text-muted hover:border-primary/30 hover:text-text transition-all font-cairo text-sm"
        >
          <Search size={16} className="shrink-0" />
          <span className="flex-1 text-right">بحث...</span>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-lg bg-white border border-border text-[10px] font-inter font-bold text-text-subtle">Ctrl+K</kbd>
        </button>
      ) : (
        <div className="relative">
          <div className="flex items-center gap-2 w-full h-10 px-4 rounded-xl bg-white border-2 border-primary shadow-lg">
            <Search size={16} className="shrink-0 text-primary" />
            <input
              ref={inputRef}
              value={query}
              onChange={handleChange}
              placeholder="ابحث عن منتجات، طلبات، عملاء، أكواد خصم..."
              className="flex-1 bg-transparent outline-none font-cairo text-sm text-text placeholder:text-text-muted"
            />
            {loading && <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />}
            <button onClick={() => { setOpen(false); setQuery(''); setResults(null) }} className="text-text-muted hover:text-text">
              <X size={16} />
            </button>
          </div>

          {results && (
            <div ref={panelRef} className="absolute top-full mt-2 left-0 right-0 bg-white border border-border rounded-2xl shadow-xl max-h-96 overflow-y-auto z-50">
              <ResultGroup
                title="المنتجات" icon={Package} items={results.products}
                renderItem={p => (
                  <button key={p._id} onClick={() => handleSelect('/dashboard/products')}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-accent-50/40 transition-all text-right border-b border-border/50 last:border-0"
                  >
                    <div className="w-8 h-8 rounded-lg bg-bg-soft border border-border overflow-hidden shrink-0">
                      {p.images?.[0] ? <img src={resolveAssetUrl(p.images[0])} className="w-full h-full object-cover" /> : <Package size={14} className="m-auto text-text-subtle" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-cairo text-sm font-semibold text-text truncate">{p.name}</p>
                      <p className="font-cairo text-[11px] text-text-muted">{p.price?.toLocaleString('ar-YE')} ر.ي {!p.isActive && '(مؤرشف)'}</p>
                    </div>
                    <span className={`font-cairo text-[10px] font-bold px-2 py-0.5 rounded-lg ${p.stock > 0 || p.unlimitedStock ? 'bg-success-100 text-success-dark' : 'bg-danger-100 text-danger'}`}>
                      {p.unlimitedStock ? 'متوفر' : p.stock}
                    </span>
                  </button>
                )}
              />
              <ResultGroup
                title="الطلبات" icon={ShoppingBag} items={results.orders}
                renderItem={o => (
                  <button key={o._id} onClick={() => handleSelect(`/dashboard/orders/${o._id}`)}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-accent-50/40 transition-all text-right border-b border-border/50 last:border-0"
                  >
                    <div className="w-8 h-8 rounded-lg bg-bg-soft flex items-center justify-center shrink-0">
                      <ShoppingBag size={14} className="text-text-subtle" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-cairo text-sm font-semibold text-text truncate">{o.deliveryAddress?.name || 'عميل'}</p>
                      <p className="font-cairo text-[11px] text-text-muted">{o.totalAmount?.toLocaleString('ar-YE')} ر.ي</p>
                    </div>
                    <span className={`font-cairo text-[10px] font-bold px-2 py-0.5 rounded-lg ${statusColor(o.status)}`}>
                      {o.status === 'pending' || o.status === 'payment_under_review' ? 'قيد المراجعة' : o.status === 'confirmed' ? 'مؤكد' : o.status === 'shipped' ? 'شحن' : o.status === 'delivered' ? 'تم' : o.status === 'rejected' ? 'رفض' : o.status}
                    </span>
                  </button>
                )}
              />
              <ResultGroup
                title="العملاء" icon={Users} items={results.customers}
                renderItem={c => (
                  <button key={c._id} onClick={() => handleSelect('/dashboard/customers')}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-accent-50/40 transition-all text-right border-b border-border/50 last:border-0"
                  >
                    <div className="w-8 h-8 rounded-lg bg-bg-soft flex items-center justify-center shrink-0">
                      <Users size={14} className="text-text-subtle" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-cairo text-sm font-semibold text-text">{c.name}</p>
                      <p className="font-cairo text-[11px] text-text-muted" dir="ltr">{c.phone || c.email}</p>
                    </div>
                  </button>
                )}
              />
              <ResultGroup
                title="أكواد الخصم" icon={Tag} items={results.discounts}
                renderItem={d => (
                  <button key={d._id} onClick={() => handleSelect('/dashboard/discounts')}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-accent-50/40 transition-all text-right"
                  >
                    <div className="w-8 h-8 rounded-lg bg-bg-soft flex items-center justify-center shrink-0">
                      <Tag size={14} className="text-text-subtle" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-inter font-bold text-sm text-accent-700">{d.code}</p>
                      <p className="font-cairo text-[11px] text-text-muted">{d.type === 'percentage' ? `${d.value}%` : `${d.value} ريال`}</p>
                    </div>
                    <span className={`font-cairo text-[10px] font-bold px-2 py-0.5 rounded-lg ${d.isActive && !d.isExpired ? 'bg-success-100 text-success-dark' : 'bg-danger-100 text-danger'}`}>
                      {d.isExpired ? 'منتهي' : d.isExhausted ? 'مستنفذ' : d.isActive ? 'نشط' : 'معطل'}
                    </span>
                  </button>
                )}
              />
              {!results.products?.length && !results.orders?.length && !results.customers?.length && !results.discounts?.length && (
                <div className="p-8 text-center">
                  <p className="font-cairo text-sm text-text-muted">لا توجد نتائج لـ "{query}"</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
