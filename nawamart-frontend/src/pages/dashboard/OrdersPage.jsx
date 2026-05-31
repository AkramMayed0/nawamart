import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getMerchantOrders } from '@/api/orders'
import { resolveAssetUrl } from '@/utils/assets'
import usePageTitle from '@/hooks/usePageTitle'
import Icon, { StatusBadge } from '@/components/ui/Icon'
import { Zap, Truck, Phone } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const PAGE_SIZE = 10

const FILTERS = [
  { id: 'all',       label: 'الكل' },
  { id: 'pending',   label: 'بانتظار المراجعة' },
  { id: 'confirmed', label: 'مؤكد' },
  { id: 'shipped',   label: 'تم الشحن' },
  { id: 'delivered', label: 'تم التسليم' },
  { id: 'rejected',  label: 'مرفوض' },
]

export default function OrdersPage() {
  usePageTitle('الطلبات')
  const [filter, setFilter] = useState('all')
  const [page,   setPage]   = useState(1)
  const [waslModal, setWaslModal] = useState(null)

  const navigate = useNavigate()

  const { data, isLoading } = useQuery({
    queryKey: ['merchant-orders'],
    queryFn:  () => getMerchantOrders().then(r => r.data.data),
    staleTime: 30_000,
  })

  const orders = data ?? []

  return (
    <div className="p-6 max-w-6xl mx-auto" dir="rtl">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-cairo font-extrabold text-2xl text-text">الطلبات</h1>
          <p className="font-cairo text-sm text-text-muted mt-0.5">
            {isLoading ? '…' : `${orders.length} طلب إجمالاً`}
          </p>
        </div>
      </div>

      {/* Filter bar */}
      <FilterBar orders={orders} filter={filter} setFilter={f => { setFilter(f); setPage(1) }} />

      {/* Table */}
      <div className="bg-white border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[700px]">
            {/* Table header */}
            <div className="grid grid-cols-[1fr_1.2fr_1fr_1fr_56px_1fr] gap-3 px-4 py-3 bg-bg border-b border-border text-xs font-semibold font-cairo text-text-muted">
              <span>رقم الطلب</span>
              <span>العميل</span>
              <span>المبلغ</span>
              <span>تاريخ الطلب</span>
              <span>الوصل</span>
              <span>الحالة</span>
            </div>

            {/* Skeleton */}
            {isLoading && (
              <div className="flex flex-col divide-y divide-border">
                {Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonRow key={i} />
                ))}
              </div>
            )}

            {/* Data */}
            {!isLoading && (
              <OrderRows
                orders={orders}
                filter={filter}
                page={page}
                onViewWasl={setWaslModal}
                navigate={navigate}
              />
            )}
          </div>
        </div>
      </div>

      {/* Wasl modal */}
      {waslModal && <WaslModal url={waslModal} onClose={() => setWaslModal(null)} />}

      {/* Pagination */}
      {!isLoading && (() => {
        const filtered = filter === 'all' ? orders
          : filter === 'shipped' ? orders.filter(o => o.status === 'shipped' || o.status === 'chat-open')
          : filter === 'pending' ? orders.filter(o => o.status === 'pending' || o.status === 'payment_under_review')
          : filter === 'delivered' ? orders.filter(o => o.status === 'delivered' || o.status === 'digital-delivered')
          : orders.filter(o => o.status === filter)
        const total = filtered.length
        if (total <= PAGE_SIZE) return null
        return (
          <Pagination page={page} total={total} pageSize={PAGE_SIZE} onChange={setPage} />
        )
      })()}
    </div>
  )
}

/* ── Skeleton ──────────────────────────────────────────────── */
function SkeletonRow() {
  return (
    <div className="grid grid-cols-[1fr_1.2fr_1fr_1fr_56px_1fr_80px] gap-3 px-4 py-3.5 items-center animate-pulse">
      <div className="h-3.5 bg-bg-soft rounded w-20" />
      <div className="flex flex-col gap-1.5">
        <div className="h-3.5 bg-bg-soft rounded w-28" />
        <div className="h-2.5 bg-bg-soft rounded w-16" />
      </div>
      <div className="h-3.5 bg-bg-soft rounded w-20" />
      <div className="h-3.5 bg-bg-soft rounded w-24" />
      <div className="w-11 h-11 bg-bg-soft rounded-lg" />
      <div className="h-6 bg-bg-soft rounded-full w-20" />
      <div className="h-8 w-16 bg-bg-soft rounded-lg" />
    </div>
  )
}

/* ── Order rows ───────────────────────────────────────────── */
function OrderRows({ orders, filter, page, onViewWasl, navigate }) {
  const filtered = filter === 'all'
    ? orders
    : filter === 'shipped'
      ? orders.filter(o => o.status === 'shipped' || o.status === 'chat-open')
      : filter === 'pending'
        ? orders.filter(o => o.status === 'pending' || o.status === 'payment_under_review')
        : filter === 'delivered'
          ? orders.filter(o => o.status === 'delivered' || o.status === 'digital-delivered')
          : orders.filter(o => o.status === filter)

  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  if (filtered.length === 0) return <EmptyState filter={filter} />

  return (
    <div className="flex flex-col divide-y divide-border">
      {paged.map(order => (
        <OrderRow key={order._id} order={order} onViewWasl={onViewWasl} navigate={navigate} />
      ))}
    </div>
  )
}

function OrderRow({ order, onViewWasl, navigate }) {
  const total    = order.items?.reduce((s, i) => s + (i.price ?? 0) * i.quantity, 0) ?? 0
  const shortId  = String(order._id).slice(-8).toUpperCase()
  const customer = order.deliveryAddress?.name ?? order.customer?.name ?? 'عميل'
  const phone    = order.deliveryAddress?.phone ?? order.customer?.phone ?? ''
  const date     = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString('ar-YE', { day: 'numeric', month: 'short' })
    : ''

  return (
    <div
      onClick={() => navigate(`/dashboard/orders/${order._id}`)}
      className="grid grid-cols-[1fr_1.2fr_1fr_1fr_56px_1fr] gap-3 px-4 py-3 items-center hover:bg-bg/50 transition-colors cursor-pointer"
    >

      {/* Order ID */}
      <span className="font-inter font-bold text-sm text-primary dk-num">#{shortId}</span>

      {/* Customer */}
      <div className="min-w-0">
        <p className="font-cairo font-semibold text-sm text-text truncate">{customer}</p>
        {phone && (
          <p className="font-cairo text-xs text-text-muted mt-0.5 inline-flex items-center gap-1" dir="ltr">
            <Phone size={11} />
            {phone}
          </p>
        )}
      </div>

      {/* Amount */}
      <span className="font-inter font-bold text-sm text-text dk-num">
        {total.toLocaleString('en-US')}
        <span className="font-cairo font-normal text-xs text-text-muted mr-1">ر.ي</span>
      </span>

      {/* Date */}
      <span className="font-cairo text-xs text-text-muted">{date}</span>

      {/* Wasl thumbnail */}
      <button
        onClick={(e) => { e.stopPropagation(); order.paymentWasl && onViewWasl(order.paymentWasl) }}
        className="w-11 h-11 rounded-lg overflow-hidden border border-border bg-bg-soft flex items-center justify-center hover:opacity-80 transition-opacity"
        title="عرض الوصل"
      >
        {order.paymentWasl ? (
          <img src={resolveAssetUrl(order.paymentWasl)} alt="وصل" className="w-full h-full object-cover" />
        ) : (
          <Icon name="image" size={16} className="text-border-strong" />
        )}
      </button>

      {/* Status */}
      <StatusBadge status={order.status} />
    </div>
  )
}

/* ── Wasl modal ────────────────────────────────────────────── */
function WaslModal({ url, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="relative max-w-lg w-full bg-white rounded-2xl overflow-hidden shadow-lg" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h3 className="font-cairo font-bold text-base text-text">صورة الوصل</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:bg-bg">
            <Icon name="x" size={18} />
          </button>
        </div>
        <img src={resolveAssetUrl(url)} alt="وصل الدفع" className="w-full object-contain max-h-[70vh]" />
        <div className="px-4 py-3 border-t border-border flex justify-end">
          <a href={resolveAssetUrl(url)} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 font-cairo text-sm font-semibold text-primary hover:underline"
          >
            <Icon name="eye" size={15} />
            فتح في تبويب جديد
          </a>
        </div>
      </div>
    </div>
  )
}

/* ── Empty state ──────────────────────────────────────────── */
const EMPTY_LABELS = {
  all:       'لا توجد طلبات بعد',
  pending:   'لا توجد طلبات بانتظار المراجعة',
  confirmed: 'لا توجد طلبات مؤكدة',
  shipped:   'لا توجد طلبات مشحونة',
  rejected:  'لا توجد طلبات مرفوضة',
}

function EmptyState({ filter }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
      <div className="w-14 h-14 rounded-2xl bg-bg-soft border border-border flex items-center justify-center">
        <Icon name="package" size={24} className="text-text-subtle" />
      </div>
      <p className="font-cairo font-bold text-text">{EMPTY_LABELS[filter] ?? 'لا توجد طلبات'}</p>
      <p className="font-cairo text-sm text-text-muted">ستظهر الطلبات هنا فور وصولها.</p>
    </div>
  )
}

/* ── Filter bar ───────────────────────────────────────────── */
function FilterBar({ orders, filter, setFilter }) {
  function count(id) {
    if (id === 'all') return orders.length
    if (id === 'shipped') return orders.filter(o => o.status === 'shipped' || o.status === 'chat-open').length
    if (id === 'pending') return orders.filter(o => o.status === 'pending' || o.status === 'payment_under_review').length
    if (id === 'delivered') return orders.filter(o => o.status === 'delivered' || o.status === 'digital-delivered').length
    return orders.filter(o => o.status === id).length
  }

  return (
    <div className="flex items-center gap-2 flex-wrap mb-5 border-b border-border pb-4">
      {FILTERS.map(f => {
        const n = count(f.id)
        const active = filter === f.id
        return (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`inline-flex items-center gap-1.5 font-cairo text-sm font-semibold px-3.5 py-1.5 rounded-lg transition-colors ${
              active
                ? 'bg-primary text-white'
                : 'bg-white border border-border text-text-muted hover:border-primary hover:text-primary'
            }`}
          >
            {f.label}
            {n > 0 && (
              <span className={`text-[11px] font-inter font-bold px-1.5 py-0.5 rounded-pill ${
                active ? 'bg-white/20 text-white' : 'bg-bg-soft text-text-muted'
              }`}>
                {n}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

/* ── Pagination ───────────────────────────────────────────── */
function Pagination({ page, total, pageSize, onChange }) {
  const totalPages = Math.ceil(total / pageSize)
  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-between mt-4 px-1">
      <p className="font-cairo text-sm text-text-muted">
        عرض{' '}
        <span className="font-semibold text-text">{(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)}</span>
        {' '}من{' '}
        <span className="font-semibold text-text">{total}</span>
      </p>

      <div className="flex items-center gap-1">
        <button onClick={() => onChange(page - 1)} disabled={page === 1}
          className="w-8 h-8 rounded-lg flex items-center justify-center border border-border text-text-muted hover:bg-bg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <Icon name="chevron" size={16} />
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
          <button key={p} onClick={() => onChange(p)}
            className={`w-8 h-8 rounded-lg flex items-center justify-center font-cairo text-sm font-semibold transition-colors ${
              p === page ? 'bg-primary text-white' : 'border border-border text-text-muted hover:bg-bg'
            }`}
          >
            {p}
          </button>
        ))}

        <button onClick={() => onChange(page + 1)} disabled={page === totalPages}
          className="w-8 h-8 rounded-lg flex items-center justify-center border border-border text-text-muted hover:bg-bg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <Icon name="chevron" size={16} className="icon-flip" />
        </button>
      </div>
    </div>
  )
}
