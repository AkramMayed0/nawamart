import { useState, useCallback, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getMerchantOrders, bulkOrders } from '@/api/orders'
import { resolveAssetUrl } from '@/utils/assets'
import usePageTitle from '@/hooks/usePageTitle'
import Icon, { StatusBadge } from '@/components/ui/Icon'
import {
  Phone, ShoppingBag, Search, Download, Filter, X,
  CheckSquare, Square, Truck, AlertTriangle, Clock,
  CheckCircle, Ban, Eye, RefreshCw, ChevronLeft,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'

const PAGE_SIZE = 15

const FILTERS = [
  { id: 'all',            label: 'الكل' },
  { id: 'pending_group',  label: 'بانتظار الوصل' },
  { id: 'confirmed',      label: 'مؤكد' },
  { id: 'processing',     label: 'قيد المعالجة' },
  { id: 'shipped_group',  label: 'تم الشحن' },
  { id: 'delivered_group',label: 'تم التسليم' },
  { id: 'returned',       label: 'مرتجع' },
  { id: 'cancelled',      label: 'ملغي' },
  { id: 'rejected',       label: 'مرفوض' },
]

const PAYMENT_METHODS = [
  { value: '', label: 'كل طرق الدفع' },
  { value: 'cash', label: 'كاش' },
  { value: 'kuraimi', label: 'الكريمي' },
  { value: 'oneCash', label: 'OneCash' },
  { value: 'jaib', label: 'جيب' },
]

/* ── Status dot config ── */
const STATUS_STYLE = {
  pending:               { color: '#F59E0B', bg: 'rgba(245,158,11,0.10)',  label: 'معلق' },
  payment_under_review:  { color: '#F59E0B', bg: 'rgba(245,158,11,0.10)',  label: 'مراجعة' },
  confirmed:             { color: '#3B82F6', bg: 'rgba(59,130,246,0.10)',  label: 'مؤكد' },
  processing:            { color: '#8B5CF6', bg: 'rgba(139,92,246,0.10)',  label: 'معالجة' },
  shipped:               { color: '#14B8A6', bg: 'rgba(20,184,166,0.10)',  label: 'مشحون' },
  delivered:             { color: '#22C55E', bg: 'rgba(34,197,94,0.10)',   label: 'مسلّم' },
  rejected:              { color: '#E74C3C', bg: 'rgba(231,76,60,0.10)',   label: 'مرفوض' },
  cancelled:             { color: '#E74C3C', bg: 'rgba(231,76,60,0.10)',   label: 'ملغي' },
  returned:              { color: '#F97316', bg: 'rgba(249,115,22,0.10)',  label: 'مرتجع' },
}

function OrderStatusBadge({ status }) {
  const s = STATUS_STYLE[status] || { color: '#6B7280', bg: 'rgba(107,114,128,0.10)', label: status || '—' }
  return (
    <span
      className="inline-flex items-center gap-1.5 font-cairo text-[11px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap"
      style={{ background: s.bg, color: s.color }}
    >
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: s.color, flexShrink: 0, display: 'inline-block' }} />
      {s.label}
    </span>
  )
}

export default function OrdersPage() {
  usePageTitle('الطلبات')
  const [filter, setFilter]               = useState('all')
  const [page, setPage]                   = useState(1)
  const [search, setSearch]               = useState('')
  const [paymentMethod, setPaymentMethod] = useState('')
  const [dateFrom, setDateFrom]           = useState('')
  const [dateTo, setDateTo]               = useState('')
  const [sort, setSort]                   = useState('')
  const [showFilters, setShowFilters]     = useState(false)
  const [waslModal, setWaslModal]         = useState(null)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const storeRaw = useAuthStore(s => s.store)
  const store    = Array.isArray(storeRaw) ? storeRaw[0] : storeRaw

  const [selectedIds, setSelectedIds] = useState([])
  const [bulkAction, setBulkAction]   = useState('')

  const bulkMut = useMutation({
    mutationFn: (data) => bulkOrders(data),
    onSuccess: (r) => {
      toast.success(r.data?.message || 'تم تنفيذ الإجراء الجماعي')
      setSelectedIds([])
      setBulkAction('')
      queryClient.invalidateQueries({ queryKey: ['merchant-orders'] })
    },
    onError: (e) => toast.error(e?.response?.data?.message || 'فشل الإجراء الجماعي'),
  })

  const handleBulkAction = useCallback(() => {
    if (!bulkAction || selectedIds.length === 0) return
    bulkMut.mutate({ orderIds: selectedIds, action: bulkAction })
  }, [bulkAction, selectedIds, bulkMut])

  const toggleSelect = useCallback((id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }, [])

  const params = { page, limit: PAGE_SIZE }
  if (filter !== 'all') params.status = filter
  if (search) params.search = search
  if (paymentMethod) params.paymentMethod = paymentMethod
  if (dateFrom) params.date_from = dateFrom
  if (dateTo) params.date_to = dateTo
  if (sort) params.sort = sort

  const { data, isLoading, isError } = useQuery({
    queryKey: ['merchant-orders', page, filter, search, paymentMethod, dateFrom, dateTo, sort],
    queryFn: () => getMerchantOrders(params).then(r => r.data),
    staleTime: 15_000,
  })

  const orders = data?.data ?? []
  const pagination = data?.pagination ?? null

  const toggleSelectAll = useCallback(() => {
    const orderIds = orders.map(o => o._id)
    setSelectedIds(prev => prev.length === orderIds.length ? [] : orderIds)
  }, [orders])

  const statusSummary = useMemo(() => {
    if (!orders.length) return null
    const counts = {}
    orders.forEach(o => { counts[o.status] = (counts[o.status] || 0) + 1 })
    return counts
  }, [orders])

  function handleFilter(f) { setFilter(f); setPage(1) }

  /* today's orders count from pagination (approx) */
  const todayCount = pagination?.todayCount ?? null

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center" dir="rtl">
        <AlertTriangle size={40} className="text-danger mb-4" />
        <h2 className="font-cairo font-bold text-xl text-text mb-2">تعذر تحميل الطلبات</h2>
        <p className="font-cairo text-sm text-text-muted mb-4">حدث خطأ أثناء جلب البيانات. يرجى المحاولة مجدداً.</p>
        <button
          onClick={() => queryClient.invalidateQueries({ queryKey: ['merchant-orders'] })}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 font-cairo text-sm font-bold text-white hover:bg-primary-700 transition-colors"
        >
          <RefreshCw size={15} /> إعادة المحاولة
        </button>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto print:p-0" dir="rtl">

      {/* ── Page header ── */}
      <div className="page-header">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-sm" style={{ background: 'rgba(245,158,11,0.10)' }}>
            <ShoppingBag size={20} style={{ color: '#F59E0B' }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-cairo font-extrabold text-2xl text-text">الطلبات</h1>
              {pagination && (
                <span className="font-cairo text-xs font-bold px-2.5 py-0.5 rounded-full" style={{ background: 'rgba(245,158,11,0.10)', color: '#F59E0B' }}>
                  {pagination.total}
                </span>
              )}
            </div>
            <p className="font-cairo text-sm text-text-muted mt-0.5">
              {todayCount != null ? `${todayCount} طلب اليوم` : 'إدارة طلبات متجرك'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {store && (
            <button
              onClick={() => window.open(
                `/api/export/orders?storeId=${store._id}${filter !== 'all' ? `&status=${filter}` : ''}${dateFrom ? `&date_from=${dateFrom}` : ''}${dateTo ? `&date_to=${dateTo}` : ''}`,
                '_blank'
              )}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-border text-text-muted hover:bg-bg hover:text-text font-cairo text-sm font-semibold transition-all"
            >
              <Download size={15} /> تصدير
            </button>
          )}
        </div>
      </div>

      {/* ── Quick Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'الإجمالي',    count: pagination?.total ?? 0, icon: ShoppingBag, color: '#3B82F6', bg: 'rgba(59,130,246,0.10)' },
          { label: 'قيد المراجعة', count: statusSummary?.pending || statusSummary?.payment_under_review || 0, icon: Clock, color: '#F59E0B', bg: 'rgba(245,158,11,0.10)' },
          { label: 'مؤكد',         count: statusSummary?.confirmed || 0, icon: CheckCircle, color: '#22C55E', bg: 'rgba(34,197,94,0.10)' },
          { label: 'ملغية',        count: (statusSummary?.cancelled || 0) + (statusSummary?.rejected || 0), icon: Ban, color: '#E74C3C', bg: 'rgba(231,76,60,0.10)' },
        ].map((stat, i) => (
          <div key={i} className="bg-surface border border-border rounded-2xl p-3.5 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: stat.bg }}>
                <stat.icon size={14} style={{ color: stat.color }} />
              </div>
              <p className="font-cairo text-xs text-text-muted">{stat.label}</p>
            </div>
            <p className="font-cairo font-bold text-xl text-text">{stat.count}</p>
          </div>
        ))}
      </div>

      {/* ── Search & sort ── */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <div className="relative flex-1 max-w-xs min-w-[200px]">
          <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="بحث باسم العميل أو رقمه..."
            className="w-full h-10 pr-9 pl-3 rounded-xl border border-border bg-surface font-cairo text-sm text-text outline-none focus:border-accent transition-colors"
          />
          {search && (
            <button onClick={() => { setSearch(''); setPage(1) }} className="absolute left-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-text">
              <X size={14} />
            </button>
          )}
        </div>
        <select
          value={sort}
          onChange={e => setSort(e.target.value)}
          className="h-10 rounded-xl border border-border bg-surface px-3 font-cairo text-sm text-text outline-none focus:border-accent"
        >
          <option value="">الأحدث</option>
          <option value="amount_asc">المبلغ: الأقل أولاً</option>
          <option value="amount_desc">المبلغ: الأعلى أولاً</option>
        </select>
        <button
          onClick={() => setShowFilters(f => !f)}
          className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border font-cairo text-sm font-semibold transition-all ${showFilters ? 'bg-accent text-white border-accent' : 'border-border text-text-muted hover:bg-bg'}`}
        ><Filter size={15} /> متقدم</button>
      </div>

      {/* ── Advanced Filters ── */}
      {showFilters && (
        <div className="flex items-center gap-3 mb-4 px-4 py-3 bg-surface border border-border rounded-2xl flex-wrap">
          <select
            value={paymentMethod}
            onChange={e => { setPaymentMethod(e.target.value); setPage(1) }}
            className="h-9 rounded-lg border border-border bg-surface px-3 font-cairo text-sm outline-none focus:border-accent"
          >
            {PAYMENT_METHODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
          <input
            type="date" value={dateFrom}
            onChange={e => { setDateFrom(e.target.value); setPage(1) }}
            className="h-9 rounded-lg border border-border bg-surface px-3 font-cairo text-sm outline-none focus:border-accent"
            title="من تاريخ"
          />
          <input
            type="date" value={dateTo}
            onChange={e => { setDateTo(e.target.value); setPage(1) }}
            className="h-9 rounded-lg border border-border bg-surface px-3 font-cairo text-sm outline-none focus:border-accent"
            title="إلى تاريخ"
          />
          <button onClick={() => { setPaymentMethod(''); setDateFrom(''); setDateTo(''); setPage(1) }}
            className="font-cairo text-xs font-bold text-text-muted hover:text-text"
          >مسح الفلتر</button>
        </div>
      )}

      {/* ── Status tabs (scrollable pills) ── */}
      <div className="overflow-x-auto pb-1 mb-4 hide-scrollbar">
        <div className="filter-pills min-w-max">
          {FILTERS.map(f => {
            const active = filter === f.id
            /* count chip */
            const countMap = {
              all: pagination?.total,
              confirmed: statusSummary?.confirmed,
              cancelled: statusSummary?.cancelled,
              rejected: statusSummary?.rejected,
            }
            const count = countMap[f.id]
            return (
              <button
                key={f.id}
                onClick={() => handleFilter(f.id)}
                className={`filter-pill ${active ? 'active' : ''}`}
              >
                {f.label}
                {count != null && count > 0 && (
                  <span
                    className="font-cairo text-[10px] font-bold px-1.5 py-0.5 rounded-full ms-1"
                    style={{ background: active ? 'rgba(201,63,43,0.15)' : 'var(--color-bg-soft)', color: active ? '#C93F2B' : 'var(--color-text-muted)' }}
                  >{count}</span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Bulk Actions ── */}
      {selectedIds.length > 0 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-3 px-4 py-3 bg-surface border border-border rounded-2xl">
          <span className="font-cairo text-sm font-semibold text-text flex items-center gap-2">
            <CheckSquare size={16} className="text-accent" />
            {selectedIds.length} طلب محدد
          </span>
          <div className="flex items-center gap-2 sm:mr-auto w-full sm:w-auto">
            <select
              value={bulkAction}
              onChange={e => setBulkAction(e.target.value)}
              className="h-9 rounded-lg border border-border bg-surface px-3 font-cairo text-sm outline-none focus:border-accent flex-1 sm:flex-initial"
            >
              <option value="">إجراء جماعي</option>
              <option value="process">معالجة</option>
              <option value="fulfill">تنفيذ (شحن)</option>
              <option value="generate_packing_slip">فاتورة تعبئة</option>
              <option value="cancel">إلغاء</option>
            </select>
            <button
              onClick={handleBulkAction}
              disabled={!bulkAction || bulkMut.isPending}
              className="inline-flex items-center gap-1.5 font-cairo font-bold text-sm px-4 py-2 rounded-lg text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
              style={{ background: 'linear-gradient(135deg,#C93F2B,#A62F20)' }}
            >
              {bulkMut.isPending && (
                <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              )}
              تطبيق
            </button>
            <button onClick={() => setSelectedIds([])} className="font-cairo text-xs font-bold text-text-muted hover:text-text">إلغاء التحديد</button>
          </div>
        </div>
      )}

      {/* ── Orders table (desktop) / Cards (mobile) ── */}
      <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 36 }}>
                  <button onClick={toggleSelectAll} className="flex items-center justify-center w-5 h-5">
                    {selectedIds.length === orders.length && orders.length > 0
                      ? <CheckSquare size={15} style={{ color: '#C93F2B' }} />
                      : <Square size={15} className="text-text-subtle" />}
                  </button>
                </th>
                <th>رقم الطلب</th>
                <th>العميل</th>
                <th>المبلغ</th>
                <th>التاريخ</th>
                <th>الوصل</th>
                <th>الحالة</th>
                <th style={{ width: 40 }}></th>
              </tr>
            </thead>
            <tbody>
              {isLoading && Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)}
              {!isLoading && orders.length === 0 && (
                <tr>
                  <td colSpan={8}>
                    <EmptyState />
                  </td>
                </tr>
              )}
              {!isLoading && orders.map(order => (
                <OrderRowDesktop
                  key={order._id}
                  order={order}
                  selectedIds={selectedIds}
                  onToggleSelect={toggleSelect}
                  onViewWasl={setWaslModal}
                  navigate={navigate}
                />
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden">
          {isLoading && Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
          {!isLoading && orders.length === 0 && <EmptyState />}
          {!isLoading && orders.map(order => (
            <OrderCardMobile
              key={order._id}
              order={order}
              navigate={navigate}
              onViewWasl={setWaslModal}
            />
          ))}
        </div>
      </div>

      {/* ── Wasl Modal ── */}
      {waslModal && <WaslModal url={waslModal} onClose={() => setWaslModal(null)} />}

      {/* ── Pagination ── */}
      {pagination && pagination.total > PAGE_SIZE && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-5 px-1">
          <p className="font-cairo text-sm text-text-muted">
            عرض <span className="font-semibold text-text">{(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, pagination.total)}</span> من <span className="font-semibold text-text">{pagination.total}</span>
          </p>
          <div className="flex items-center gap-1.5">
            <button onClick={() => setPage(p => p - 1)} disabled={page === 1} className="w-9 h-9 rounded-xl flex items-center justify-center border border-border text-text-muted hover:bg-bg disabled:opacity-40 transition-all">
              <Icon name="chevron" size={16} />
            </button>
            {Array.from({ length: Math.min(pagination.pages, 7) }, (_, i) => {
              let p
              if (pagination.pages <= 7) p = i + 1
              else if (page <= 4) p = i + 1
              else if (page >= pagination.pages - 3) p = pagination.pages - 6 + i
              else p = page - 3 + i
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-cairo text-sm font-semibold transition-all ${p === page ? 'bg-accent text-white shadow-sm' : 'border border-border text-text-muted hover:bg-bg'}`}
                >{p}</button>
              )
            })}
            <button onClick={() => setPage(p => p + 1)} disabled={page === pagination.pages} className="w-9 h-9 rounded-xl flex items-center justify-center border border-border text-text-muted hover:bg-bg disabled:opacity-40 transition-all">
              <Icon name="chevron" size={16} className="icon-flip" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Desktop order row ── */
function OrderRowDesktop({ order, selectedIds, onToggleSelect, onViewWasl, navigate }) {
  const total    = order.items?.reduce((s, i) => s + (i.price ?? 0) * i.quantity, 0) ?? 0
  const shortId  = String(order._id).slice(-8).toUpperCase()
  const customer = order.deliveryAddress?.name ?? order.customer?.name ?? 'عميل'
  const phone    = order.deliveryAddress?.phone ?? order.customer?.phone ?? ''
  const date     = order.createdAt ? new Date(order.createdAt).toLocaleDateString('ar-YE', { day: 'numeric', month: 'short' }) : ''
  const isSelected = selectedIds?.includes(order._id)

  return (
    <tr
      onClick={() => navigate(`/dashboard/orders/${order._id}`)}
      className="cursor-pointer transition-colors hover:bg-bg-soft"
    >
      <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border)', verticalAlign: 'middle' }}>
        <button onClick={e => { e.stopPropagation(); onToggleSelect(order._id) }} className="flex items-center justify-center">
          {isSelected
            ? <CheckSquare size={15} style={{ color: '#C93F2B' }} />
            : <Square size={15} className="text-text-subtle" />}
        </button>
      </td>
      <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border)', verticalAlign: 'middle' }}>
        <span className="font-bold text-sm" style={{ color: '#C93F2B' }}>#{shortId}</span>
      </td>
      <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border)', verticalAlign: 'middle' }}>
        <p className="font-cairo font-semibold text-sm text-text truncate max-w-[160px]">{customer}</p>
        {phone && (
          <p className="font-cairo text-xs text-text-muted mt-0.5 flex items-center gap-1" dir="ltr">
            <Phone size={11} /> {phone}
          </p>
        )}
      </td>
      <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border)', verticalAlign: 'middle' }}>
        <span className="font-cairo font-bold text-sm text-text">
          {total.toLocaleString('en-US')}
          <span className="font-normal text-xs text-text-muted mr-1">ر.ي</span>
        </span>
      </td>
      <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border)', verticalAlign: 'middle' }}>
        <span className="font-cairo text-xs text-text-muted">{date}</span>
      </td>
      <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border)', verticalAlign: 'middle' }}>
        <button
          onClick={e => { e.stopPropagation(); order.paymentWasl && onViewWasl(order.paymentWasl) }}
          className="w-10 h-10 rounded-xl overflow-hidden border border-border bg-bg-soft flex items-center justify-center hover:opacity-80 transition-opacity shadow-sm"
          title="عرض الوصل"
        >
          {order.paymentWasl
            ? <img src={resolveAssetUrl(order.paymentWasl)} alt="وصل" className="w-full h-full object-cover" />
            : <Icon name="image" size={14} className="text-border-strong" />}
        </button>
      </td>
      <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border)', verticalAlign: 'middle' }}>
        <OrderStatusBadge status={order.status} />
      </td>
      <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border)', verticalAlign: 'middle' }}>
        <ChevronLeft size={15} className="text-text-subtle" />
      </td>
    </tr>
  )
}

/* ── Mobile order card ── */
function OrderCardMobile({ order, navigate, onViewWasl }) {
  const total    = order.items?.reduce((s, i) => s + (i.price ?? 0) * i.quantity, 0) ?? 0
  const shortId  = String(order._id).slice(-8).toUpperCase()
  const customer = order.deliveryAddress?.name ?? order.customer?.name ?? 'عميل'
  const date     = order.createdAt ? new Date(order.createdAt).toLocaleDateString('ar-YE', { day: 'numeric', month: 'short' }) : ''

  return (
    <div
      onClick={() => navigate(`/dashboard/orders/${order._id}`)}
      className="flex items-center gap-3 px-4 py-3.5 border-b border-border last:border-0 hover:bg-bg-soft transition-colors cursor-pointer"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-bold text-sm" style={{ color: '#C93F2B' }}>#{shortId}</span>
          <OrderStatusBadge status={order.status} />
        </div>
        <p className="font-cairo font-semibold text-sm text-text truncate">{customer}</p>
        <div className="flex items-center gap-3 mt-0.5">
          <span className="font-cairo font-bold text-sm text-text">{total.toLocaleString('en-US')} <span className="font-normal text-xs text-text-muted">ر.ي</span></span>
          <span className="font-cairo text-xs text-text-muted">{date}</span>
        </div>
      </div>
      <ChevronLeft size={15} className="text-text-subtle shrink-0" />
    </div>
  )
}

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: 8 }).map((_, i) => (
        <td key={i} style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border)' }}>
          <div className="h-3.5 bg-bg-soft rounded-lg w-full max-w-[80px]" />
        </td>
      ))}
    </tr>
  )
}

function SkeletonCard() {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border animate-pulse">
      <div className="flex-1 space-y-2">
        <div className="h-3.5 bg-bg-soft rounded-lg w-28" />
        <div className="h-3 bg-bg-soft rounded-lg w-36" />
        <div className="h-3 bg-bg-soft rounded-lg w-20" />
      </div>
    </div>
  )
}

function WaslModal({ url, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="relative max-w-lg w-full bg-surface rounded-3xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="font-cairo font-bold text-base text-text">صورة الوصل</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-text-muted hover:bg-bg-soft transition-colors">
            <X size={18} />
          </button>
        </div>
        <img src={resolveAssetUrl(url)} alt="وصل الدفع" className="w-full object-contain max-h-[70vh]" />
        <div className="px-5 py-4 border-t border-border flex justify-between items-center">
          <button onClick={onClose} className="font-cairo text-sm font-semibold text-text-muted hover:text-text transition-colors">إغلاق</button>
          <a href={resolveAssetUrl(url)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 font-cairo text-sm font-semibold text-accent hover:underline">
            <Eye size={15} /> فتح في تبويب جديد
          </a>
        </div>
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center gap-4 px-4">
      <div className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-sm" style={{ background: 'rgba(245,158,11,0.08)' }}>
        <ShoppingBag size={32} style={{ color: '#F59E0B' }} />
      </div>
      <div>
        <h3 className="font-cairo font-bold text-xl text-text mb-1">لا توجد طلبات</h3>
        <p className="font-cairo text-sm text-text-muted max-w-sm mx-auto leading-7">
          لم يتم تقديم أي طلبات بعد. شارك متجرك مع العملاء لبدء استقبال الطلبات.
        </p>
      </div>
    </div>
  )
}
