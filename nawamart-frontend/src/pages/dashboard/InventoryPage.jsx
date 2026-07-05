import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store/authStore'
import {
  getInventoryItems, getLowStockReport, updateInventoryItem,
  createAdjustment,
} from '@/api/inventory'
import { getMerchantProducts } from '@/api/products'
import usePageTitle from '@/hooks/usePageTitle'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import { ProductRowSkeleton } from '@/components/ui/Skeleton'
import {
  Package, AlertTriangle, Search, X, MapPin, TrendingDown,
  Filter, Warehouse, ClipboardList,
} from 'lucide-react'

const PAGE_SIZE = 20

const INVENTORY_STATES = {
  in_stock:     { label: 'متوفر',     color: 'bg-success-100 text-success-dark' },
  out_of_stock: { label: 'نفد',       color: 'bg-danger-100 text-danger' },
  backorder:    { label: 'طلب مؤجل',  color: 'bg-warning-100 text-yellow-700' },
  coming_soon:  { label: 'قريباً',    color: 'bg-info-100 text-info' },
}

function InventoryRow({ item, onAdjust }) {
  const state = INVENTORY_STATES[item.inventoryState] || INVENTORY_STATES.out_of_stock
  const hasSale = item.product?.salePrice && item.product?.salePrice < item.product?.price
  const effectivePrice = hasSale ? item.product?.salePrice : item.product?.price

  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-border last:border-0 hover:bg-accent-50/30 transition-all group border-r-3 border-r-transparent hover:border-r-accent">
      <div className="w-11 h-11 rounded-xl bg-bg-soft border border-border overflow-hidden shrink-0 shadow-sm">
        {item.product?.images?.[0]
          ? <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center"><Package size={18} className="text-border-strong" /></div>}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-cairo font-semibold text-sm text-text truncate">{item.product?.name || 'غير معروف'}</p>
        <div className="flex items-center gap-2 mt-0.5">
          {item.sku && <span className="font-cairo text-[11px] text-text-muted">رمز: {item.sku}</span>}
          {item.location?.name && (
            <span className="inline-flex items-center gap-1 font-cairo text-[11px] text-text-muted bg-bg-soft px-2 py-0.5 rounded-xl">
              <MapPin size={10} /> {item.location.name}
            </span>
          )}
          {item.isBundle && (
            <span className="font-cairo text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-lg">حزمة</span>
          )}
        </div>
      </div>
      <div className="text-left shrink-0">
        <p className="dk-num font-bold text-sm text-text whitespace-nowrap">{effectivePrice?.toLocaleString('ar-YE')} <span className="font-cairo font-normal text-xs text-text-muted">ر.ي</span></p>
      </div>
      <div className="text-center shrink-0 min-w-[80px]">
        {item.trackQuantity ? (
          <>
            <p className={`dk-num font-bold text-lg ${item.quantity <= 0 ? 'text-danger' : item.isLowStock ? 'text-warning' : 'text-text'}`}>
              {item.quantity}
            </p>
            {item.isLowStock && <p className="font-cairo text-[10px] text-warning font-bold">مخزون منخفض</p>}
          </>
        ) : (
          <p className="font-cairo text-sm text-text-muted">غير محدود</p>
        )}
      </div>
      <span className={`font-cairo text-xs font-semibold px-2.5 py-1 rounded-xl whitespace-nowrap ${state.color}`}>
        {state.label}
      </span>
      <button
        onClick={() => onAdjust(item)}
        disabled={!item.trackQuantity}
        className="shrink-0 px-3 py-1.5 rounded-xl bg-primary-50 text-primary font-cairo text-xs font-bold hover:bg-primary transition-colors hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
      >
        تعديل
      </button>
    </div>
  )
}

function AdjustModal({ open, onClose, item, onSubmit, loading }) {
  const [quantity, setQuantity] = useState(0)
  const [reason, setReason] = useState('')
  const [notes, setNotes] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (quantity === 0) {
      toast.error('يجب إدخال كمية التعديل')
      return
    }
    onSubmit({
      storeId: item.store,
      productId: item.product?._id,
      quantity: Number(quantity),
      reason: reason || null,
      notes: notes || null,
    })
  }

  return (
    <Modal open={open} onClose={onClose} title={`تعديل مخزون: ${item?.product?.name || ''}`} size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-bg-soft rounded-xl p-4">
          <p className="font-cairo text-sm text-text-muted mb-1">المخزون الحالي</p>
          <p className="dk-num font-bold text-2xl text-text">{item?.quantity}</p>
        </div>
        <div>
          <label className="block font-cairo text-sm font-bold text-text mb-1.5">كمية التعديل</label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            placeholder="موجب للإضافة، سالب للخصم"
            className="w-full h-11 px-4 rounded-xl border border-border bg-white font-cairo text-sm text-text outline-none focus:border-primary transition-colors"
            required
          />
          <p className="font-cairo text-xs text-text-muted mt-1">استخدم قيمة موجبة لإضافة مخزون، وسالبة لخصمه</p>
        </div>
        <div>
          <label className="block font-cairo text-sm font-bold text-text mb-1.5">السبب</label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={'مثل: إضافة مخزون جديد، تالف، إرجاع'}
            className="w-full h-11 px-4 rounded-xl border border-border bg-white font-cairo text-sm text-text outline-none focus:border-primary transition-colors"
          />
        </div>
        <div>
          <label className="block font-cairo text-sm font-bold text-text mb-1.5">ملاحظات</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="ملاحظات إضافية..."
            rows={2}
            className="w-full px-4 py-3 rounded-xl border border-border bg-white font-cairo text-sm text-text outline-none focus:border-primary transition-colors resize-none"
          />
        </div>
        <div className="flex gap-3 pt-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>إلغاء</Button>
          <Button variant="accent" className="flex-1" type="submit" loading={loading}>
            تطبيق التعديل
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default function InventoryPage() {
  usePageTitle('المخزون')
  const storeRaw = useAuthStore(s => s.store)
  const store = Array.isArray(storeRaw) ? storeRaw[0] : storeRaw
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [stateFilter, setStateFilter] = useState('')
  const [sort, setSort] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [adjustTarget, setAdjustTarget] = useState(null)

  const filters = { page, limit: PAGE_SIZE, sort, storeId: store?._id }
  if (search) filters.search = search
  if (stateFilter) filters.state = stateFilter

  const { data, isLoading } = useQuery({
    queryKey: ['inventory-items', store?._id, page, search, stateFilter, sort],
    queryFn: () => getInventoryItems(filters).then(r => r.data),
    enabled: !!store?._id,
  })

  const { data: lowStockData } = useQuery({
    queryKey: ['inventory-low-stock', store?._id],
    queryFn: () => getLowStockReport({ storeId: store?._id }).then(r => r.data),
    enabled: !!store?._id,
  })

  const items = data?.data ?? []
  const pagination = data?.pagination ?? null
  const lowStockItems = lowStockData?.data ?? []

  const { mutate: doAdjust, isPending: adjusting } = useMutation({
    mutationFn: (formData) => createAdjustment(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] })
      queryClient.invalidateQueries({ queryKey: ['inventory-low-stock'] })
      toast.success('تم تعديل المخزون')
      setAdjustTarget(null)
    },
    onError: (err) => toast.error(err?.message || 'حدث خطأ'),
  })

  if (!store) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-warning-100 flex items-center justify-center mx-auto mb-4">
          <Warehouse size={28} className="text-warning" />
        </div>
        <h2 className="font-cairo font-bold text-xl text-text mb-2">لم يتم إنشاء المتجر بعد</h2>
        <p className="font-cairo text-sm text-text-muted mb-6">أنشئ متجرك أولاً لإدارة المخزون.</p>
        <button onClick={() => navigate('/onboarding')} className="inline-flex items-center gap-2 font-cairo font-bold text-sm px-6 py-2.5 rounded-xl bg-primary text-white hover:bg-primary-700 transition-colors">إنشاء المتجر</button>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center shadow-sm">
            <Warehouse size={20} className="text-primary" />
          </div>
          <div>
            <h1 className="font-cairo font-extrabold text-2xl text-text mb-0.5">المخزون</h1>
            <p className="font-cairo text-sm text-text-muted">{pagination ? `${pagination.total} منتج` : ''}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate('/dashboard/inventory/adjustments')}>
            <ClipboardList size={15} /> السجل
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate('/dashboard/inventory/locations')}>
            <MapPin size={15} /> المواقع
          </Button>
        </div>
      </div>

      {/* Low Stock Alert Banner */}
      {lowStockItems.length > 0 && (
        <div className="mb-5 p-4 bg-warning-50 border border-warning/20 rounded-2xl flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-warning-100 flex items-center justify-center shrink-0">
            <AlertTriangle size={18} className="text-warning" />
          </div>
          <div className="flex-1">
            <p className="font-cairo font-bold text-sm text-yellow-800">
              {lowStockItems.length === 1
                ? 'منتج واحد على وشك النفاد'
                : `${lowStockItems.length} منتجات على وشك النفاد`}
            </p>
            <p className="font-cairo text-xs text-yellow-700 mt-0.5">
              {lowStockItems.slice(0, 3).map(i => i.product?.name).filter(Boolean).join('، ')}
              {lowStockItems.length > 3 && ` +${lowStockItems.length - 3} أخرى`}
            </p>
          </div>
          <button
            onClick={() => navigate('/dashboard/inventory/reports')}
            className="shrink-0 font-cairo text-xs font-bold text-warning bg-warning-100 px-3 py-1.5 rounded-xl hover:bg-warning transition-colors hover:text-white"
          >
            عرض التقرير
          </button>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        <div className="bg-white border border-border rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Package size={16} className="text-primary" />
            <p className="font-cairo text-xs text-text-muted">إجمالي المنتجات</p>
          </div>
          <p className="dk-num font-bold text-2xl text-text">{pagination?.total || 0}</p>
        </div>
        <div className="bg-white border border-border rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle size={16} className="text-warning" />
            <p className="font-cairo text-xs text-text-muted">مخزون منخفض</p>
          </div>
          <p className="dk-num font-bold text-2xl text-warning">{lowStockItems.length}</p>
        </div>
        <div className="bg-white border border-border rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown size={16} className="text-danger" />
            <p className="font-cairo text-xs text-text-muted">نفد من المخزون</p>
          </div>
          <p className="dk-num font-bold text-2xl text-danger">
            {items.filter(i => i.inventoryState === 'out_of_stock' && i.trackQuantity).length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="بحث عن منتج..."
            className="w-full h-10 pr-9 pl-3 rounded-xl border border-border bg-white font-cairo text-sm text-text outline-none focus:border-primary transition-colors"
          />
          {search && <button onClick={() => { setSearch(''); setPage(1) }} className="absolute left-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-text"><X size={14} /></button>}
        </div>
        <button
          onClick={() => setShowFilters(f => !f)}
          className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border font-cairo text-sm font-semibold transition-all ${showFilters ? 'bg-primary text-white border-primary' : 'border-border text-text-muted hover:bg-bg'}`}
        >
          <Filter size={15} /> فلتر
        </button>
        <select
          value={sort}
          onChange={e => setSort(e.target.value)}
          className="h-10 rounded-xl border border-border bg-white px-3 font-cairo text-sm text-text outline-none focus:border-primary"
        >
          <option value="">آخر تحديث</option>
          <option value="quantity_asc">الكمية: الأقل أولاً</option>
          <option value="quantity_desc">الكمية: الأعلى أولاً</option>
        </select>
      </div>

      {showFilters && (
        <div className="flex items-center gap-3 mb-4 px-4 py-3 bg-white border border-border rounded-2xl">
          <select
            value={stateFilter}
            onChange={e => { setStateFilter(e.target.value); setPage(1) }}
            className="h-9 rounded-lg border border-border bg-white px-3 font-cairo text-sm outline-none focus:border-primary"
          >
            <option value="">كل الحالات</option>
            <option value="in_stock">متوفر</option>
            <option value="out_of_stock">نفد</option>
            <option value="backorder">طلب مؤجل</option>
            <option value="coming_soon">قريباً</option>
          </select>
          <button
            onClick={() => { setStateFilter(''); setPage(1) }}
            className="font-cairo text-xs font-bold text-text-muted hover:text-text"
          >
            مسح الفلتر
          </button>
        </div>
      )}

      {/* Inventory List */}
      <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm">
        {isLoading && Array.from({ length: 5 }).map((_, i) => <ProductRowSkeleton key={i} />)}
        {!isLoading && items.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-50 to-accent-50 border border-primary-100 flex items-center justify-center mb-5 shadow-sm">
              <Package size={32} className="text-primary" />
            </div>
            <h3 className="font-cairo font-bold text-xl text-text mb-2">لا توجد منتجات في المخزون</h3>
            <p className="font-cairo text-sm text-text-muted mb-6 max-w-sm mx-auto leading-7">أضف منتجات لبدء تتبع المخزون.</p>
            <button onClick={() => navigate('/dashboard/products')} className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-cairo text-sm font-bold text-white shadow-sm transition-all hover:bg-primary-700">
              <Package size={16} /> إدارة المنتجات
            </button>
          </div>
        )}
        {!isLoading && items.map(item => (
          <InventoryRow key={item._id} item={item} onAdjust={setAdjustTarget} />
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

      {adjustTarget && (
        <AdjustModal
          open={!!adjustTarget}
          onClose={() => setAdjustTarget(null)}
          item={adjustTarget}
          onSubmit={doAdjust}
          loading={adjusting}
        />
      )}
    </div>
  )
}
