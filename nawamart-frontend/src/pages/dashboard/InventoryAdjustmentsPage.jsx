import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { getAdjustments } from '@/api/inventory'
import usePageTitle from '@/hooks/usePageTitle'
import Button from '@/components/ui/Button'
import { ClipboardList, Search, X, Filter, ArrowLeft, Package } from 'lucide-react'

const PAGE_SIZE = 30

const ADJUSTMENT_TYPES = {
  manual:           { label: 'تعديل يدوي',       color: 'bg-primary-100 text-primary' },
  order:            { label: 'طلب',              color: 'bg-info-100 text-info' },
  purchase_order:   { label: 'أمر شراء',         color: 'bg-success-100 text-success-dark' },
  transfer_in:      { label: 'تحويل وارد',       color: 'bg-green-100 text-success-dark' },
  transfer_out:     { label: 'تحويل صادر',       color: 'bg-warning-100 text-yellow-700' },
  return:           { label: 'إرجاع',            color: 'bg-purple-100 text-purple-700' },
  bundle_deduction: { label: 'خصم حزمة',          color: 'bg-pink-100 text-pink-700' },
  correction:       { label: 'تصحيح',             color: 'bg-orange-100 text-orange-700' },
}

function AdjustRow({ adj }) {
  const type = ADJUSTMENT_TYPES[adj.type] || ADJUSTMENT_TYPES.manual
  const isPositive = adj.quantity > 0

  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-border last:border-0 hover:bg-accent-50/30 transition-all">
      <div className="w-10 h-10 rounded-xl bg-bg-soft border border-border overflow-hidden shrink-0">
        {adj.product?.images?.[0]
          ? <img src={adj.product.images[0]} alt={adj.product?.name} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center"><Package size={16} className="text-border-strong" /></div>}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-cairo font-semibold text-sm text-text truncate">{adj.product?.name || 'غير معروف'}</p>
          <span className={`font-cairo text-[10px] font-bold px-2 py-0.5 rounded-lg ${type.color}`}>{type.label}</span>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          {adj.reason && <span className="font-cairo text-xs text-text-muted truncate">{adj.reason}</span>}
          {adj.location?.name && <span className="font-cairo text-[11px] text-text-muted">{adj.location.name}</span>}
        </div>
      </div>
      <div className="text-center shrink-0">
        <p className={`dk-num font-bold text-lg ${isPositive ? 'text-success-dark' : 'text-danger'}`}>
          {isPositive ? '+' : ''}{adj.quantity}
        </p>
        <p className="font-cairo text-[10px] text-text-muted">{adj.previousQuantity} ← {adj.newQuantity}</p>
      </div>
      <div className="text-left shrink-0 min-w-[100px]">
        <p className="font-cairo text-xs text-text-muted">
          {new Date(adj.createdAt).toLocaleDateString('ar-YE')}
        </p>
        <p className="font-cairo text-[11px] text-text-muted">
          {adj.performedBy?.name || 'النظام'}
        </p>
      </div>
    </div>
  )
}

export default function InventoryAdjustmentsPage() {
  usePageTitle('سجل تعديلات المخزون')
  const storeRaw = useAuthStore(s => s.store)
  const store = Array.isArray(storeRaw) ? storeRaw[0] : storeRaw
  const navigate = useNavigate()

  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const filters = { page, limit: PAGE_SIZE, storeId: store?._id }
  if (typeFilter) filters.type = typeFilter

  const { data, isLoading } = useQuery({
    queryKey: ['inventory-adjustments', store?._id, page, typeFilter],
    queryFn: () => getAdjustments(filters).then(r => r.data),
    enabled: !!store?._id,
  })

  const adjustments = data?.data ?? []
  const pagination = data?.pagination ?? null

  if (!store) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center">
        <p className="font-cairo text-sm text-text-muted">الرجاء إنشاء متجر أولاً</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8" dir="rtl">
      <div className="flex items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center shadow-sm">
            <ClipboardList size={20} className="text-purple-700" />
          </div>
          <div>
            <h1 className="font-cairo font-extrabold text-2xl text-text mb-0.5">سجل التعديلات</h1>
            <p className="font-cairo text-sm text-text-muted">{pagination ? `${pagination.total} عملية` : ''}</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => navigate('/dashboard/inventory')}>
          <Package size={15} /> المخزون
        </Button>
      </div>

      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="بحث..."
            className="w-full h-10 pr-9 pl-3 rounded-xl border border-border bg-white font-cairo text-sm text-text outline-none focus:border-primary transition-colors"
          />
          {search && <button onClick={() => setSearch('')} className="absolute left-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-text"><X size={14} /></button>}
        </div>
        <button
          onClick={() => setShowFilters(f => !f)}
          className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border font-cairo text-sm font-semibold transition-all ${showFilters ? 'bg-primary text-white border-primary' : 'border-border text-text-muted hover:bg-bg'}`}
        >
          <Filter size={15} /> فلتر
        </button>
      </div>

      {showFilters && (
        <div className="flex items-center gap-3 mb-4 px-4 py-3 bg-white border border-border rounded-2xl">
          <select
            value={typeFilter}
            onChange={e => { setTypeFilter(e.target.value); setPage(1) }}
            className="h-9 rounded-lg border border-border bg-white px-3 font-cairo text-sm outline-none focus:border-primary"
          >
            <option value="">كل الأنواع</option>
            {Object.entries(ADJUSTMENT_TYPES).map(([key, { label }]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
          <button
            onClick={() => { setTypeFilter(''); setPage(1) }}
            className="font-cairo text-xs font-bold text-text-muted hover:text-text"
          >
            مسح الفلتر
          </button>
        </div>
      )}

      <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm">
        {isLoading && Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="animate-pulse flex items-center gap-4 px-4 py-3 border-b border-border">
            <div className="w-10 h-10 rounded-xl bg-border" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-1/3 bg-border rounded" />
              <div className="h-3 w-1/4 bg-border rounded" />
            </div>
            <div className="h-5 w-12 bg-border rounded" />
          </div>
        ))}
        {!isLoading && adjustments.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-50 to-accent-50 border border-primary-100 flex items-center justify-center mb-5 shadow-sm">
              <ClipboardList size={32} className="text-primary" />
            </div>
            <h3 className="font-cairo font-bold text-xl text-text mb-2">لا توجد تعديلات بعد</h3>
            <p className="font-cairo text-sm text-text-muted mb-6">سجل تعديلات المخزون سيكون فارغاً حتى تقوم بأول عملية تعديل.</p>
            <button onClick={() => navigate('/dashboard/inventory')} className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-cairo text-sm font-bold text-white shadow-sm transition-all hover:bg-primary-700">
              <Package size={16} /> إدارة المخزون
            </button>
          </div>
        )}
        {!isLoading && adjustments.map(adj => (
          <AdjustRow key={adj._id} adj={adj} />
        ))}
        {pagination && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <p className="font-cairo text-sm text-text-muted">
              عرض <span className="font-semibold text-text">{(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, pagination.total)}</span> من <span className="font-semibold text-text">{pagination.total}</span>
            </p>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="w-9 h-9 rounded-xl flex items-center justify-center border border-border text-text-muted hover:bg-bg disabled:opacity-40 transition-all"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="icon-flip"><polyline points="9 18 15 12 9 6" /></svg>
              </button>
              {Array.from({ length: Math.min(Math.ceil(pagination.total / PAGE_SIZE), 7) }, (_, i) => {
                const totalPages = Math.ceil(pagination.total / PAGE_SIZE)
                let p
                if (totalPages <= 7) p = i + 1
                else if (page <= 4) p = i + 1
                else if (page >= totalPages - 3) p = totalPages - 6 + i
                else p = page - 3 + i
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-cairo text-sm font-semibold transition-all ${p === page ? 'bg-accent text-white shadow-sm' : 'border border-border text-text-muted hover:bg-bg'}`}
                  >
                    {p}
                  </button>
                )
              })}
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === Math.ceil(pagination.total / PAGE_SIZE)}
                className="w-9 h-9 rounded-xl flex items-center justify-center border border-border text-text-muted hover:bg-bg disabled:opacity-40 transition-all"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="icon-flip"><polyline points="9 18 15 12 9 6" /></svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
