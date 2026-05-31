import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  getMerchantOrders,
  confirmOrder,
  rejectOrder,
  shipOrder,
  deliverOrder,
} from '@/api/orders'
import { resolveAssetUrl } from '@/utils/assets'
import usePageTitle from '@/hooks/usePageTitle'
import Icon from '@/components/ui/Icon'
import { Zap, Truck, MapPin, MessageCircle, Send, Instagram, Phone as PhoneIcon, Crown } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

const PAGE_SIZE = 10

const FILTERS = [
  { id: 'all',       label: 'الكل' },
  { id: 'pending',   label: 'بانتظار المراجعة' },
  { id: 'confirmed', label: 'مؤكد' },
  { id: 'shipped',   label: 'تم الشحن' },
  { id: 'rejected',  label: 'مرفوض' },
]

export default function OrdersPage() {
  usePageTitle('الطلبات')
  const [filter,    setFilter]    = useState('all')
  const [page,      setPage]      = useState(1)
  const [waslModal, setWaslModal] = useState(null)   // image URL
  const [rejectModal, setRejectModal] = useState(null) // { orderId }
  const [rejectReason, setRejectReason] = useState('')

  const queryClient = useQueryClient()
  const navigate    = useNavigate()
  const store       = useAuthStore(s => s.store)
  const plan = store?.plan || 'starter'

  // ── Fetch orders ──────────────────────────────────────────────
  const { data, isLoading } = useQuery({
    queryKey: ['merchant-orders'],
    queryFn:  () => getMerchantOrders().then(r => r.data.data),
    staleTime: 30_000,
  })

  const orders = data ?? []

  // placeholder — more state & mutations added in next steps
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

      {/* Table — horizontal scroll on mobile */}
      <div className="bg-white border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[640px]">
            {/* Table header */}
            <div className="grid grid-cols-[1.2fr_1.5fr_1fr_72px_1fr_auto] gap-3 px-4 py-3 bg-bg border-b border-border text-xs font-semibold font-cairo text-text-muted">
              <span>رقم الطلب</span>
              <span>العميل</span>
              <span>المبلغ</span>
              <span>الوصل</span>
              <span>الحالة</span>
              <span>الإجراءات</span>
            </div>

            {/* Skeleton rows */}
            {isLoading && (
              <div className="flex flex-col divide-y divide-border">
                {Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonRow key={i} />
                ))}
              </div>
            )}

            {/* Data rows */}
            {!isLoading && (
              <OrderRows
                orders={orders}
                filter={filter}
                page={page}
                plan={plan}
                onViewWasl={setWaslModal}
                onReject={id => { setRejectModal({ orderId: id }); setRejectReason('') }}
                navigate={navigate}
                queryClient={queryClient}
              />
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {waslModal && <WaslModal url={waslModal} onClose={() => setWaslModal(null)} />}
      {rejectModal && (
        <RejectModal
          orderId={rejectModal.orderId}
          reason={rejectReason}
          setReason={setRejectReason}
          onClose={() => setRejectModal(null)}
          queryClient={queryClient}
        />
      )}

      {/* Pagination */}
      {!isLoading && (() => {
        const filtered = filter === 'all' ? orders
          : filter === 'shipped' ? orders.filter(o => o.status === 'shipped' || o.status === 'chat-open')
          : filter === 'pending' ? orders.filter(o => o.status === 'pending' || o.status === 'payment_under_review')
          : orders.filter(o => o.status === filter)
        const total = filtered.length
        if (total <= PAGE_SIZE) return null
        return (
          <Pagination
            page={page}
            total={total}
            pageSize={PAGE_SIZE}
            onChange={setPage}
          />
        )
      })()}
    </div>
  )
}

/* ── Skeleton row ────────────────────────────────────────────── */
function SkeletonRow() {
  return (
    <div className="grid grid-cols-[1.2fr_1.5fr_1fr_72px_1fr_auto] gap-3 px-4 py-3.5 items-center animate-pulse">
      <div className="h-3.5 bg-bg-soft rounded w-24" />
      <div className="flex flex-col gap-1.5">
        <div className="h-3.5 bg-bg-soft rounded w-28" />
        <div className="h-2.5 bg-bg-soft rounded w-20" />
      </div>
      <div className="h-3.5 bg-bg-soft rounded w-20" />
      <div className="w-11 h-11 bg-bg-soft rounded-lg" />
      <div className="h-6 bg-bg-soft rounded-full w-24" />
      <div className="flex gap-2">
        <div className="h-7 w-16 bg-bg-soft rounded-lg" />
        <div className="h-7 w-16 bg-bg-soft rounded-lg" />
      </div>
    </div>
  )
}

/* ── وصل modal ───────────────────────────────────────────────── */
function WaslModal({ url, onClose }) {
  return (
    <div
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative max-w-lg w-full bg-white rounded-2xl overflow-hidden shadow-lg"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h3 className="font-cairo font-bold text-base text-text">صورة الوصل</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:bg-bg transition-colors"
          >
            <Icon name="x" size={18} />
          </button>
        </div>
        <img src={resolveAssetUrl(url)} alt="وصل الدفع" className="w-full object-contain max-h-[70vh]" />
        <div className="px-4 py-3 border-t border-border flex justify-end">
          <a
            href={resolveAssetUrl(url)}
            target="_blank"
            rel="noopener noreferrer"
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

/* ── Order rows ─────────────────────────────────────────────── */
function OrderRows({ orders, filter, page, plan, onViewWasl, onReject, navigate, queryClient }) {
  const filtered = filter === 'all'
    ? orders
    : filter === 'shipped'
      ? orders.filter(o => o.status === 'shipped' || o.status === 'chat-open')
      : filter === 'pending'
        ? orders.filter(o => o.status === 'pending' || o.status === 'payment_under_review')
        : orders.filter(o => o.status === filter)

  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  if (filtered.length === 0) return <EmptyState filter={filter} />

  return (
      <div className="flex flex-col gap-4">
        {paged.map(order => (
          <OrderRow
            key={order._id}
            order={order}
            plan={plan}
            onViewWasl={onViewWasl}
            onReject={onReject}
            navigate={navigate}
            queryClient={queryClient}
          />
        ))}
      </div>
    )
}

function OrderRow({ order, plan, onViewWasl, onReject, navigate, queryClient }) {
  const total     = order.items?.reduce((s, i) => s + (i.price ?? 0) * i.quantity, 0) ?? 0
  const shortId   = String(order._id).slice(-8).toUpperCase()
  const customer  = order.deliveryAddress?.name ?? order.customer?.name ?? 'عميل'

  return (
    <div className="grid grid-cols-[1.2fr_1.5fr_1fr_72px_1fr_auto] gap-3 px-4 py-3.5 items-center hover:bg-bg/50 transition-colors">

      {/* Order ID */}
      <span className="font-inter font-bold text-sm text-primary dk-num">#{shortId}</span>

      {/* Customer */}
      <div className="min-w-0">
        <p className="font-cairo font-semibold text-sm text-text truncate">{customer}</p>
        <p className="font-cairo text-xs text-text-muted mt-0.5 inline-flex items-center gap-1">
          {order.store?.type === 'digital' ? <Zap size={12} /> : <Truck size={12} />}
          {order.store?.type === 'digital' ? 'رقمي' : `${order.deliveryAddress?.city ?? 'مادي'}`}
          {order.deliveryAddress?.location?.lat && order.deliveryAddress?.location?.lng && (
            <a
              href={`https://www.google.com/maps?q=${order.deliveryAddress.location.lat},${order.deliveryAddress.location.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-0.5 mr-1 text-primary hover:underline"
              title="عرض الموقع على الخريطة"
            >
              <MapPin size={12} />
            </a>
          )}
        </p>
      </div>

      {/* Amount */}
      <span className="font-inter font-bold text-sm text-text dk-num">
        {total.toLocaleString('en-US')}
        <span className="font-cairo font-normal text-xs text-text-muted mr-1">ر.ي</span>
      </span>

      {/* وصل thumbnail */}
      <button
        onClick={() => order.paymentWasl && onViewWasl(order.paymentWasl)}
        className="w-11 h-11 rounded-lg overflow-hidden border border-border bg-bg-soft flex items-center justify-center hover:opacity-80 transition-opacity"
        title="عرض الوصل"
      >
        {order.paymentWasl ? (
          <img src={resolveAssetUrl(order.paymentWasl)} alt="وصل" className="w-full h-full object-cover" />
        ) : (
          <Icon name="image" size={16} className="text-border-strong" />
        )}
      </button>

      {/* Status badge */}
      <OrderStatusBadge status={order.status} />

      {/* Actions */}
      <ActionButtons
        order={order}
        plan={plan}
        onReject={onReject}
        navigate={navigate}
        queryClient={queryClient}
      />
    </div>
  )
}

const CONTACT_META = {
  whatsapp:  { label: 'واتساب',  icon: MessageCircle, cls: 'bg-green-100 text-green-600 hover:bg-green-200',      url: (h, p) => `https://wa.me/${(h || p).replace(/[^0-9]/g, '')}` },
  telegram:  { label: 'تيليجرام', icon: Send,         cls: 'bg-sky-100 text-blue-500 hover:bg-sky-200',          url: (h) => `https://t.me/${(h || '').replace('@', '')}` },
  instagram: { label: 'انستقرام', icon: Instagram,    cls: 'bg-pink-100 text-pink-600 hover:bg-pink-200',        url: (h) => `https://www.instagram.com/direct/t/${(h || '').replace('@', '')}` },
  phone:     { label: 'اتصال',    icon: PhoneIcon,    cls: 'bg-primary-50 text-primary hover:bg-primary-100',     url: (h) => `tel:${h}` },
}

function filterContactMeta(plan) {
  const keys = plan === 'starter' ? ['whatsapp', 'instagram', 'phone'] : ['whatsapp', 'telegram', 'instagram', 'phone']
  return Object.fromEntries(keys.map(k => [k, CONTACT_META[k]]))
}

/* ── Action buttons ──────────────────────────────────────────── */
function ActionButtons({ order, plan = 'starter', onReject, navigate, queryClient }) {
  const { _id: id, status, store } = order
  const isDigital = store?.type === 'digital'
  const canReview = status === 'pending' || status === 'payment_under_review'
  const cmMap = filterContactMeta(plan)
  const cm = cmMap[order.contactMethod] || cmMap.whatsapp
  const handle = order.contactHandle || order.deliveryAddress?.phone || ''

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['merchant-orders'] })

  const confirmMut = useMutation({
    mutationFn: () => confirmOrder(id),
    onSuccess: () => { toast.success('تم تأكيد الطلب ✓'); invalidate() },
    onError:   (e) => toast.error(e?.message ?? 'فشل التأكيد'),
  })

  return (
    <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
      {/* Pending → Confirm */}
      {canReview && (
        <button
          onClick={() => confirmMut.mutate()}
          disabled={confirmMut.isPending}
          className="inline-flex items-center gap-1 font-cairo font-semibold text-xs px-2.5 py-1.5 rounded-lg bg-success-100 text-success hover:bg-green-200 transition-colors disabled:opacity-50"
        >
          {confirmMut.isPending
            ? <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
            : <Icon name="check" size={13} />}
          تأكيد
        </button>
      )}

      {/* Pending → Reject */}
      {canReview && (
        <button
          onClick={() => onReject(id)}
          className="inline-flex items-center gap-1 font-cairo font-semibold text-xs px-2.5 py-1.5 rounded-lg bg-danger-100 text-danger hover:bg-red-200 transition-colors"
        >
          <Icon name="x" size={13} />
          رفض
        </button>
      )}

      {/* Physical confirmed → Ship */}
      {!isDigital && status === 'confirmed' && (
        <ShipButton orderId={id} queryClient={queryClient} />
      )}

      {/* Physical shipped → Deliver */}
      {!isDigital && status === 'shipped' && (
        <DeliverButton orderId={id} queryClient={queryClient} />
      )}

      {/* Digital confirmed → تسليم (chat) + external contact */}
      {isDigital && status === 'confirmed' && (
        plan === 'business' && order.chatId ? (
          <button
            onClick={() => navigate(`/dashboard/chat/${order.chatId}`)}
            className="inline-flex items-center gap-1 font-cairo font-semibold text-xs px-2.5 py-1.5 rounded-lg bg-accent-50 text-accent-700 hover:bg-accent-100 transition-colors"
          >
            <Icon name="msgs" size={13} />
            تسليم
          </button>
        ) : plan === 'pro' ? (
          <span className="inline-flex items-center gap-1 font-cairo text-xs px-2.5 py-1.5 rounded-lg bg-bg border border-border text-text-muted">
            <cm.icon size={13} />
            {handle || '—'}
          </span>
        ) : (
          <a
            href={cm.url(handle, order.deliveryAddress?.phone || '')}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-1 font-cairo font-semibold text-xs px-2.5 py-1.5 rounded-lg transition-colors ${cm.cls}`}
          >
            <cm.icon size={13} />
            {cm.label}
          </a>
        )
      )}
    </div>
  )
}

/* ── Ship / Deliver buttons ──────────────────────────────────── */
function ShipButton({ orderId, queryClient }) {
  const mut = useMutation({
    mutationFn: () => shipOrder(orderId, ''),
    onSuccess: () => { toast.success('تم تحديث الحالة إلى "تم الشحن"'); queryClient.invalidateQueries({ queryKey: ['merchant-orders'] }) },
    onError:   (e) => toast.error(e?.message ?? 'فشل التحديث'),
  })
  return (
    <button
      onClick={() => mut.mutate()}
      disabled={mut.isPending}
      className="inline-flex items-center gap-1 font-cairo font-semibold text-xs px-2.5 py-1.5 rounded-lg bg-info-100 text-info hover:bg-blue-200 transition-colors disabled:opacity-50"
    >
      {mut.isPending ? <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg> : <Icon name="truck" size={13} />}
      شحن
    </button>
  )
}

function DeliverButton({ orderId, queryClient }) {
  const mut = useMutation({
    mutationFn: () => deliverOrder(orderId),
    onSuccess: () => { toast.success('تم تحديث الحالة إلى "تم التسليم"'); queryClient.invalidateQueries({ queryKey: ['merchant-orders'] }) },
    onError:   (e) => toast.error(e?.message ?? 'فشل التحديث'),
  })
  return (
    <button
      onClick={() => mut.mutate()}
      disabled={mut.isPending}
      className="inline-flex items-center gap-1 font-cairo font-semibold text-xs px-2.5 py-1.5 rounded-lg bg-success-100 text-success hover:bg-green-200 transition-colors disabled:opacity-50"
    >
      {mut.isPending ? <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg> : <Icon name="check-circle" size={13} />}
      سُلّم
    </button>
  )
}

/* ── Reject modal ─────────────────────────────────────────────── */
function RejectModal({ orderId, reason, setReason, onClose, queryClient }) {
  const rejectMut = useMutation({
    mutationFn: () => rejectOrder(orderId, reason),
    onSuccess: () => {
      toast.success('تم رفض الطلب')
      queryClient.invalidateQueries({ queryKey: ['merchant-orders'] })
      onClose()
    },
    onError: (e) => toast.error(e?.message ?? 'فشل الرفض'),
  })

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-lg" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="font-cairo font-bold text-base text-text">رفض الطلب</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:bg-bg">
            <Icon name="x" size={18} />
          </button>
        </div>
        <div className="px-5 py-4 flex flex-col gap-3">
          <p className="font-cairo text-sm text-text-muted">اذكر سبب الرفض حتى يتمكن العميل من فهم المشكلة.</p>
          <textarea
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="مثال: الوصل غير واضح، المبلغ غير مطابق..."
            rows={3}
            className="w-full font-cairo text-sm px-3.5 py-2.5 rounded-lg border border-border bg-white text-text placeholder:text-text-subtle outline-none focus:border-danger focus:shadow-[0_0_0_3px_rgba(231,76,60,0.18)] transition-[border-color,box-shadow] resize-none"
          />
        </div>
        <div className="px-5 py-4 border-t border-border flex justify-end gap-2">
          <button onClick={onClose} className="font-cairo font-semibold text-sm px-4 py-2 rounded-lg border border-border text-text-muted hover:bg-bg transition-colors">
            إلغاء
          </button>
          <button
            onClick={() => rejectMut.mutate()}
            disabled={!reason.trim() || rejectMut.isPending}
            className="inline-flex items-center gap-2 font-cairo font-bold text-sm px-4 py-2 rounded-lg bg-danger text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          >
            {rejectMut.isPending && <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>}
            تأكيد الرفض
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Empty state ─────────────────────────────────────────────── */
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

/* ── Status badge ────────────────────────────────────────────── */
const STATUS = {
  pending:             { label: 'بانتظار الوصل',      cls: 'bg-warning-100 text-yellow-700' },
  payment_under_review:{ label: 'الوصل قيد المراجعة',  cls: 'bg-warning-100 text-yellow-700' },
  confirmed:           { label: 'مؤكد',                cls: 'bg-success-100 text-success' },
  shipped:             { label: 'تم الشحن',            cls: 'bg-info-100 text-info' },
  delivered:           { label: 'تم التسليم',          cls: 'bg-green-100 text-success' },
  rejected:            { label: 'مرفوض',               cls: 'bg-danger-100 text-danger' },
  'chat-open':         { label: 'محادثة مفتوحة',       cls: 'bg-info-100 text-info' },
  'digital-delivered': { label: 'تم التسليم',          cls: 'bg-green-100 text-success' },
}

function OrderStatusBadge({ status }) {
  const s = STATUS[status] ?? STATUS.pending
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold font-cairo px-2.5 py-1 rounded-pill ${s.cls}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
      {s.label}
    </span>
  )
}

/* ── Filter bar ─────────────────────────────────────────────── */
function FilterBar({ orders, filter, setFilter }) {
  function count(id) {
    if (id === 'all') return orders.length
    if (id === 'shipped') return orders.filter(o => o.status === 'shipped' || o.status === 'chat-open').length
    if (id === 'pending') return orders.filter(o => o.status === 'pending' || o.status === 'payment_under_review').length
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

/* ── Pagination ──────────────────────────────────────────────── */
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
        <button
          onClick={() => onChange(page - 1)}
          disabled={page === 1}
          className="w-8 h-8 rounded-lg flex items-center justify-center border border-border text-text-muted hover:bg-bg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <Icon name="chevron" size={16} />
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={`w-8 h-8 rounded-lg flex items-center justify-center font-cairo text-sm font-semibold transition-colors ${
              p === page
                ? 'bg-primary text-white'
                : 'border border-border text-text-muted hover:bg-bg'
            }`}
          >
            {p}
          </button>
        ))}

        <button
          onClick={() => onChange(page + 1)}
          disabled={page === totalPages}
          className="w-8 h-8 rounded-lg flex items-center justify-center border border-border text-text-muted hover:bg-bg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <Icon name="chevron" size={16} className="icon-flip" />
        </button>
      </div>
    </div>
  )
}
