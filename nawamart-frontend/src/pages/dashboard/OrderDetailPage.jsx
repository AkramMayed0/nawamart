import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { getOrderById, confirmOrder, rejectOrder, shipOrder, deliverOrder } from '@/api/orders'
import { resolveAssetUrl } from '@/utils/assets'
import { useAuthStore } from '@/store/authStore'
import usePageTitle from '@/hooks/usePageTitle'
import Icon, { StatusBadge } from '@/components/ui/Icon'
import {
  ArrowRight, Phone, Copy, Printer, Check, X, Truck, CheckCircle,
  Clock, User, MapPin, Package, CreditCard, MessageCircle, Send,
  Instagram, Phone as PhoneIcon, Crown
} from 'lucide-react'
import { useState } from 'react'

const STATUS_LABELS = {
  pending:             'بانتظار التحقق',
  payment_under_review:'قيد المراجعة',
  confirmed:           'مؤكد',
  shipped:             'تم الشحن',
  delivered:           'تم التسليم',
  rejected:            'مرفوض',
}

const CONTACT_META = {
  whatsapp:  { label: 'واتساب',  icon: MessageCircle, cls: 'bg-green-100 text-green-600 hover:bg-green-200',      url: (h, p) => `https://wa.me/${(h || p).replace(/[^0-9]/g, '')}` },
  telegram:  { label: 'تيليجرام', icon: Send,         cls: 'bg-sky-100 text-blue-500 hover:bg-sky-200',          url: (h) => `https://t.me/${(h || '').replace('@', '')}` },
  instagram: { label: 'انستقرام', icon: Instagram,    cls: 'bg-pink-100 text-pink-600 hover:bg-pink-200',        url: (h) => `https://www.instagram.com/direct/t/${(h || '').replace('@', '')}` },
  phone:     { label: 'اتصال',    icon: PhoneIcon,    cls: 'bg-primary-50 text-primary hover:bg-primary-100',     url: (h) => `tel:${h}` },
}

export default function OrderDetailPage() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const store = useAuthStore(s => s.store)
  const plan = store?.plan || 'starter'
  const [rejectOpen, setRejectOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState('')

  usePageTitle('تفاصيل الطلب')

  const { data: order, isLoading, isError } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => getOrderById(orderId).then(r => r.data.data),
    retry: false,
  })

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ['order', orderId] })
    queryClient.invalidateQueries({ queryKey: ['merchant-orders'] })
  }

  const confirmMut = useMutation({
    mutationFn: () => confirmOrder(orderId),
    onSuccess: () => { toast.success('تم تأكيد الطلب ✓'); invalidate() },
    onError:   (e) => toast.error(e?.message ?? 'فشل التأكيد'),
  })

  const rejectMut = useMutation({
    mutationFn: () => rejectOrder(orderId, rejectReason),
    onSuccess: () => { toast.success('تم رفض الطلب'); setRejectOpen(false); setRejectReason(''); invalidate() },
    onError:   (e) => toast.error(e?.message ?? 'فشل الرفض'),
  })

  const shipMut = useMutation({
    mutationFn: () => shipOrder(orderId, ''),
    onSuccess: () => { toast.success('تم تحديث الحالة إلى "تم الشحن"'); invalidate() },
    onError:   (e) => toast.error(e?.message ?? 'فشل التحديث'),
  })

  const deliverMut = useMutation({
    mutationFn: () => deliverOrder(orderId),
    onSuccess: () => { toast.success('تم تحديث الحالة إلى "تم التسليم"'); invalidate() },
    onError:   (e) => toast.error(e?.message ?? 'فشل التحديث'),
  })

  if (isLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto" dir="rtl">
        <div className="animate-pulse flex flex-col gap-5">
          <div className="h-6 bg-bg-soft rounded w-48" />
          <div className="h-32 bg-bg-soft rounded-xl" />
          <div className="h-48 bg-bg-soft rounded-xl" />
          <div className="h-32 bg-bg-soft rounded-xl" />
        </div>
      </div>
    )
  }

  if (isError || !order) {
    return (
      <div className="p-6 max-w-4xl mx-auto text-center" dir="rtl">
        <div className="w-14 h-14 rounded-2xl bg-danger-100 flex items-center justify-center mx-auto mb-4">
          <X size={24} className="text-danger" />
        </div>
        <h2 className="font-cairo font-bold text-xl text-text mb-2">تعذّر تحميل بيانات الطلب</h2>
        <p className="font-cairo text-sm text-text-muted mb-6">تحقق من رابط الطلب أو حاول مجدداً.</p>
        <button onClick={() => navigate('/dashboard/orders')}
          className="inline-flex items-center gap-2 bg-primary text-white font-cairo font-semibold px-5 py-2.5 rounded-lg hover:bg-primary-700 transition-colors"
        >
          <ArrowRight size={16} />
          العودة للطلبات
        </button>
      </div>
    )
  }

  const isDigital = order.store?.type === 'digital'
  const shortId   = String(order._id).slice(-8).toUpperCase()
  const total     = order.items?.reduce((s, i) => s + (i.price ?? 0) * i.quantity, 0) ?? 0
  const shipping  = isDigital ? 0 : (order.shippingFee ?? 0)
  const customerPhone = order.deliveryAddress?.phone ?? order.customer?.phone ?? ''
  const customerName  = order.deliveryAddress?.name ?? order.customer?.name ?? 'عميل'
  const customerEmail = order.customer?.email ?? ''
  const createdAt     = order.createdAt ? new Date(order.createdAt).toLocaleString('ar-YE') : ''
  const updatedAt     = order.updatedAt ? new Date(order.updatedAt).toLocaleString('ar-YE') : ''

  const canReview   = order.status === 'pending' || order.status === 'payment_under_review'
  const canShip     = !isDigital && order.status === 'confirmed'
  const canDeliver  = !isDigital && order.status === 'shipped'

  async function copyPhone() {
    try {
      await navigator.clipboard.writeText(customerPhone)
      toast.success('تم نسخ رقم الهاتف')
    } catch {
      toast.error('فشل النسخ')
    }
  }

  function printOrder() {
    window.print()
  }

  const cmKeys = plan === 'starter' ? ['whatsapp', 'instagram', 'phone'] : ['whatsapp', 'telegram', 'instagram', 'phone']
  const cmMap  = Object.fromEntries(cmKeys.map(k => [k, CONTACT_META[k]]))
  const cm     = cmMap[order.contactMethod] || cmMap.whatsapp
  const handle = order.contactHandle || order.deliveryAddress?.phone || ''

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto print:p-0" dir="rtl">
      {/* ── Back ── */}
      <button onClick={() => navigate('/dashboard/orders')}
        className="hidden print:hidden inline-flex items-center gap-1.5 text-sm text-text-muted font-cairo hover:text-primary transition-colors mb-4"
      >
        <ArrowRight size={16} />
        العودة للطلبات
      </button>

      {/* ── Order Header ── */}
      <div className="bg-white border border-border rounded-xl p-4 sm:p-5 mb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h1 className="font-cairo font-extrabold text-xl sm:text-2xl text-text">
              طلب <span className="font-inter text-primary dk-num">#{shortId}</span>
            </h1>
            <StatusBadge status={order.status} />
          </div>
          <div className="flex items-center gap-2 print:hidden">
            <button onClick={copyPhone} title="نسخ رقم الهاتف"
              className="w-9 h-9 rounded-lg border border-border flex items-center justify-center text-text-muted hover:bg-bg hover:text-text transition-colors"
            >
              <Copy size={16} />
            </button>
            <a href={`tel:${customerPhone}`} title="اتصال بالعميل"
              className="w-9 h-9 rounded-lg border border-border flex items-center justify-center text-text-muted hover:bg-bg hover:text-text transition-colors"
            >
              <Phone size={16} />
            </a>
            <button onClick={printOrder} title="طباعة"
              className="w-9 h-9 rounded-lg border border-border flex items-center justify-center text-text-muted hover:bg-bg hover:text-text transition-colors"
            >
              <Printer size={16} />
            </button>
          </div>
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-1 mt-3 text-xs font-cairo text-text-muted">
          <span>تاريخ الطلب: <span className="font-semibold text-text">{createdAt}</span></span>
          <span>آخر تحديث: <span className="font-semibold text-text">{updatedAt}</span></span>
        </div>
      </div>

      {/* ── Customer + Delivery ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        {/* Customer */}
        <div className="bg-white border border-border rounded-xl p-4 sm:p-5">
          <h3 className="font-cairo font-bold text-sm text-text mb-3 flex items-center gap-2">
            <User size={16} className="text-text-muted" />
            معلومات العميل
          </h3>
          <div className="flex flex-col gap-2">
            <div>
              <p className="font-cairo text-xs text-text-muted">الاسم</p>
              <p className="font-cairo text-sm font-semibold text-text">{customerName}</p>
            </div>
            <div>
              <p className="font-cairo text-xs text-text-muted">رقم الهاتف</p>
              <p className="font-inter text-sm font-semibold text-text dk-num" dir="ltr">{customerPhone}</p>
            </div>
            {customerEmail && (
              <div>
                <p className="font-cairo text-xs text-text-muted">البريد الإلكتروني</p>
                <p className="font-cairo text-sm font-semibold text-text">{customerEmail}</p>
              </div>
            )}
          </div>
        </div>

        {/* Delivery */}
        <div className="bg-white border border-border rounded-xl p-4 sm:p-5">
          <h3 className="font-cairo font-bold text-sm text-text mb-3 flex items-center gap-2">
            <MapPin size={16} className="text-text-muted" />
            معلومات التوصيل
          </h3>
          <div className="flex flex-col gap-2">
            {!isDigital ? (
              <>
                <div>
                  <p className="font-cairo text-xs text-text-muted">العنوان</p>
                  <p className="font-cairo text-sm font-semibold text-text">
                    {order.deliveryAddress?.details || '—'}
                  </p>
                </div>
                <div>
                  <p className="font-cairo text-xs text-text-muted">المدينة</p>
                  <p className="font-cairo text-sm font-semibold text-text">
                    {order.deliveryAddress?.city || '—'}
                  </p>
                </div>
                {order.deliveryAddress?.district && (
                  <div>
                    <p className="font-cairo text-xs text-text-muted">الحي</p>
                    <p className="font-cairo text-sm font-semibold text-text">{order.deliveryAddress.district}</p>
                  </div>
                )}
              </>
            ) : (
              <p className="font-cairo text-sm text-text-muted">منتج رقمي — لا يتطلب توصيل</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Notes ── */}
      {order.notes && (
        <div className="bg-white border border-border rounded-xl p-4 sm:p-5 mb-4">
          <p className="font-cairo text-xs text-text-muted mb-1">ملاحظات الطلب</p>
          <p className="font-cairo text-sm text-text">{order.notes}</p>
        </div>
      )}

      {/* ── Order Items ── */}
      <div className="bg-white border border-border rounded-xl overflow-hidden mb-4">
        <div className="px-4 sm:px-5 py-3 border-b border-border">
          <h3 className="font-cairo font-bold text-sm text-text flex items-center gap-2">
            <Package size={16} className="text-text-muted" />
            المنتجات
          </h3>
        </div>
        <div className="overflow-x-auto">
          <div className="min-w-[500px]">
            {/* Header */}
            <div className="grid grid-cols-[48px_1fr_60px_80px_80px] gap-2 px-4 sm:px-5 py-2.5 bg-bg text-xs font-semibold font-cairo text-text-muted">
              <span></span>
              <span>المنتج</span>
              <span>الكمية</span>
              <span>السعر</span>
              <span>الإجمالي</span>
            </div>

            {/* Items */}
            <div className="divide-y divide-border">
              {order.items?.map((item, i) => {
                const lineTotal = (item.price ?? 0) * item.quantity
                return (
                  <div key={i} className="grid grid-cols-[48px_1fr_60px_80px_80px] gap-2 px-4 sm:px-5 py-3 items-center">
                    <div className="w-10 h-10 rounded-lg bg-bg-soft border border-border overflow-hidden flex items-center justify-center shrink-0">
                      {item.product?.images?.[0]
                        ? <img src={resolveAssetUrl(item.product.images[0])} alt="" className="w-full h-full object-cover" />
                        : <Package size={16} className="text-text-subtle" />
                      }
                    </div>
                    <span className="font-cairo text-sm font-semibold text-text truncate">
                      {item.product?.name ?? item.name}
                    </span>
                    <span className="font-cairo text-sm text-text-muted text-center">{item.quantity}</span>
                    <span className="font-inter text-sm text-text dk-num">{item.price?.toLocaleString('en-US')}</span>
                    <span className="font-inter text-sm font-bold text-text dk-num">{lineTotal.toLocaleString('en-US')}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="border-t border-border px-4 sm:px-5 py-3 flex flex-col gap-1.5">
          <div className="flex justify-between font-cairo text-sm text-text-muted">
            <span>المجموع الفرعي</span>
            <span className="font-inter font-semibold text-text dk-num">{total.toLocaleString('en-US')} ر.ي</span>
          </div>
          {!isDigital && (
            <div className="flex justify-between font-cairo text-sm text-text-muted">
              <span>رسوم التوصيل</span>
              <span className="font-inter font-semibold text-text dk-num">{shipping.toLocaleString('en-US')} ر.ي</span>
            </div>
          )}
          <div className="flex justify-between font-cairo font-bold text-base text-text pt-2 border-t border-border">
            <span>الإجمالي الكلي</span>
            <span className="font-inter dk-num">{(total + shipping).toLocaleString('en-US')} ر.ي</span>
          </div>
        </div>
      </div>

      {/* ── Payment Info ── */}
      <div className="bg-white border border-border rounded-xl p-4 sm:p-5 mb-4">
        <h3 className="font-cairo font-bold text-sm text-text mb-3 flex items-center gap-2">
          <CreditCard size={16} className="text-text-muted" />
          معلومات الدفع
        </h3>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-cairo">
          <div>
            <span className="text-text-muted">طريقة الدفع: </span>
            <span className="font-semibold text-text">
              {order.paymentMethod === 'kuraimi' ? 'الكريمي' :
               order.paymentMethod === 'oneCash' ? 'OneCash' :
               order.paymentMethod === 'jaib' ? 'جيب' :
               order.paymentMethod === 'cash' ? 'كاش' : order.paymentMethod}
            </span>
          </div>
          {order.contactMethod && (
            <div>
              <span className="text-text-muted">طريقة التواصل: </span>
              <span className="font-semibold text-text">{CONTACT_META[order.contactMethod]?.label || order.contactMethod}</span>
            </div>
          )}
          {order.paymentWasl && (
            <div className="flex items-center gap-2">
              <span className="text-text-muted">الوصل: </span>
              <a href={resolveAssetUrl(order.paymentWasl)} target="_blank" rel="noopener noreferrer"
                className="w-12 h-12 rounded-lg border border-border overflow-hidden block hover:opacity-80 transition-opacity"
              >
                <img src={resolveAssetUrl(order.paymentWasl)} alt="وصل" className="w-full h-full object-cover" />
              </a>
            </div>
          )}
        </div>
      </div>

      {/* ── Status Management ── */}
      <div className="bg-white border border-border rounded-xl p-4 sm:p-5 mb-4 print:hidden">
        <h3 className="font-cairo font-bold text-sm text-text mb-4 flex items-center gap-2">
          <CheckCircle size={16} className="text-text-muted" />
          إدارة حالة الطلب
        </h3>

        <div className="flex flex-wrap items-center gap-2">
          {/* Confirm */}
          {canReview && (
            <button onClick={() => confirmMut.mutate()} disabled={confirmMut.isPending}
              className="inline-flex items-center gap-2 font-cairo font-bold text-sm px-4 py-2.5 rounded-lg bg-success-100 text-success hover:bg-green-200 transition-colors disabled:opacity-50"
            >
              {confirmMut.isPending
                ? <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                : <Check size={16} />}
              تأكيد الدفع
            </button>
          )}

          {/* Reject */}
          {canReview && (
            <button onClick={() => setRejectOpen(true)}
              className="inline-flex items-center gap-2 font-cairo font-bold text-sm px-4 py-2.5 rounded-lg bg-danger-100 text-danger hover:bg-red-200 transition-colors"
            >
              <X size={16} />
              رفض الطلب
            </button>
          )}

          {/* Ship */}
          {canShip && (
            <button onClick={() => shipMut.mutate()} disabled={shipMut.isPending}
              className="inline-flex items-center gap-2 font-cairo font-bold text-sm px-4 py-2.5 rounded-lg bg-info-100 text-info hover:bg-blue-200 transition-colors disabled:opacity-50"
            >
              {shipMut.isPending
                ? <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                : <Truck size={16} />}
              تم الشحن
            </button>
          )}

          {/* Deliver */}
          {canDeliver && (
            <button onClick={() => deliverMut.mutate()} disabled={deliverMut.isPending}
              className="inline-flex items-center gap-2 font-cairo font-bold text-sm px-4 py-2.5 rounded-lg bg-success-100 text-success hover:bg-green-200 transition-colors disabled:opacity-50"
            >
              {deliverMut.isPending
                ? <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                : <CheckCircle size={16} />}
              تم التسليم
            </button>
          )}

          {/* Digital confirmed — chat delivery */}
          {isDigital && order.status === 'confirmed' && (
            plan === 'business' && order.chatId ? (
              <button onClick={() => navigate(`/dashboard/chat/${order.chatId}`)}
                className="inline-flex items-center gap-2 font-cairo font-bold text-sm px-4 py-2.5 rounded-lg bg-accent-50 text-accent-700 hover:bg-accent-100 transition-colors"
              >
                <MessageCircle size={16} />
                تسليم عبر المحادثة
              </button>
            ) : plan === 'pro' ? (
              <span className="inline-flex items-center gap-2 font-cairo text-sm px-4 py-2.5 rounded-lg bg-bg border border-border text-text-muted">
                <cm.icon size={16} />
                {handle || '—'}
              </span>
            ) : (
              <a href={cm.url(handle, customerPhone)} target="_blank" rel="noopener noreferrer"
                className={`inline-flex items-center gap-2 font-cairo font-bold text-sm px-4 py-2.5 rounded-lg transition-colors ${cm.cls}`}
              >
                <cm.icon size={16} />
                {cm.label}
              </a>
            )
          )}
        </div>

        {/* Rejected reason */}
        {order.status === 'rejected' && order.rejectionReason && (
          <div className="mt-3 flex items-start gap-2 bg-danger-100 rounded-lg p-3">
            <X size={16} className="text-danger shrink-0 mt-0.5" />
            <div>
              <p className="font-cairo font-bold text-xs text-danger">سبب الرفض</p>
              <p className="font-cairo text-sm text-text-muted">{order.rejectionReason}</p>
            </div>
          </div>
        )}
      </div>

      {/* ── Timeline ── */}
      <div className="bg-white border border-border rounded-xl p-4 sm:p-5 mb-4 print:hidden">
        <h3 className="font-cairo font-bold text-sm text-text mb-4 flex items-center gap-2">
          <Clock size={16} className="text-text-muted" />
          تسلسل الطلب
        </h3>
        <OrderTimeline order={order} />
      </div>

      {/* ── Reject Modal ── */}
      {rejectOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setRejectOpen(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-lg" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h3 className="font-cairo font-bold text-base text-text">رفض الطلب</h3>
              <button onClick={() => setRejectOpen(false)} className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:bg-bg">
                <X size={18} />
              </button>
            </div>
            <div className="px-5 py-4 flex flex-col gap-3">
              <p className="font-cairo text-sm text-text-muted">اذكر سبب الرفض حتى يتمكن العميل من فهم المشكلة.</p>
              <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)}
                placeholder="مثال: الوصل غير واضح، المبلغ غير مطابق..."
                rows={3}
                className="w-full font-cairo text-sm px-3.5 py-2.5 rounded-lg border border-border bg-white text-text placeholder:text-text-subtle outline-none focus:border-danger focus:shadow-[0_0_0_3px_rgba(231,76,60,0.18)] transition-[border-color,box-shadow] resize-none"
              />
            </div>
            <div className="px-5 py-4 border-t border-border flex justify-end gap-2">
              <button onClick={() => setRejectOpen(false)}
                className="font-cairo font-semibold text-sm px-4 py-2 rounded-lg border border-border text-text-muted hover:bg-bg transition-colors"
              >
                إلغاء
              </button>
              <button onClick={() => rejectMut.mutate()} disabled={!rejectReason.trim() || rejectMut.isPending}
                className="inline-flex items-center gap-2 font-cairo font-bold text-sm px-4 py-2 rounded-lg bg-danger text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
              >
                {rejectMut.isPending && <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>}
                تأكيد الرفض
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Vertical Timeline ─────────────────────────────────────── */
function OrderTimeline({ order }) {
  const events = []

  events.push({
    id: 'created',
    label: 'تم إنشاء الطلب',
    time: order.createdAt ? new Date(order.createdAt).toLocaleString('ar-YE') : '',
    done: true,
    icon: 'check',
    color: 'success',
  })

  if (order.status === 'rejected') {
    events.push({
      id: 'rejected',
      label: 'تم رفض الطلب',
      time: order.rejectedAt ? new Date(order.rejectedAt).toLocaleString('ar-YE') : '',
      done: true,
      icon: 'x',
      color: 'danger',
    })

    return (
      <div className="flex flex-col gap-0 pr-4">
        {events.map((ev, i) => (
          <TimelineEvent key={ev.id} event={ev} isLast={i === events.length - 1} />
        ))}
      </div>
    )
  }

  const isDelivered  = order.status === 'delivered' || order.status === 'digital-delivered'
  const isShipped    = order.status === 'shipped' || order.status === 'chat-open' || isDelivered
  const isConfirmed  = order.status === 'confirmed' || isShipped || isDelivered

  events.push({
    id: 'confirmed',
    label: 'تم تأكيد الدفع',
    time: order.confirmedAt ? new Date(order.confirmedAt).toLocaleString('ar-YE') : '',
    done: isConfirmed,
    icon: isConfirmed ? 'check' : 'clock',
    color: isConfirmed ? 'success' : 'muted',
  })

  const isDigital = order.store?.type === 'digital'

  if (isDigital) {
    events.push({
      id: 'chat-open',
      label: order.chatId ? 'محادثة مفتوحة' : 'بانتظار المحادثة',
      time: '',
      done: isDelivered,
      icon: isDelivered ? 'check' : 'clock',
      color: isDelivered ? 'success' : 'muted',
    })
    events.push({
      id: 'delivered',
      label: 'تم التسليم',
      time: order.deliveredAt ? new Date(order.deliveredAt).toLocaleString('ar-YE') : '',
      done: isDelivered,
      icon: isDelivered ? 'check' : 'clock',
      color: isDelivered ? 'success' : 'muted',
    })
  } else {
    events.push({
      id: 'shipped',
      label: 'تم الشحن',
      time: order.shippedAt ? new Date(order.shippedAt).toLocaleString('ar-YE') : '',
      done: isShipped,
      icon: isShipped ? 'check' : 'clock',
      color: isShipped ? 'success' : 'muted',
    })
    events.push({
      id: 'delivered',
      label: 'تم التسليم',
      time: order.deliveredAt ? new Date(order.deliveredAt).toLocaleString('ar-YE') : '',
      done: isDelivered,
      icon: isDelivered ? 'check' : 'clock',
      color: isDelivered ? 'success' : 'muted',
    })
  }

  return (
    <div className="flex flex-col gap-0 pr-4">
      {events.map((ev, i) => (
        <TimelineEvent key={ev.id} event={ev} isLast={i === events.length - 1} />
      ))}
    </div>
  )
}

function TimelineEvent({ event, isLast }) {
  const dotColor = event.color === 'danger'
    ? 'bg-danger border-danger text-white'
    : event.color === 'success'
      ? 'bg-success border-success text-white'
      : 'bg-white border-border text-text-subtle'

  return (
    <div className="relative flex items-start gap-3 pb-1">
      {/* Connector line */}
      {!isLast && (
        <div className="absolute top-5 right-[-10px] w-0.5 h-full bg-border" />
      )}

      {/* Dot */}
      <div className={`relative z-10 w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 ${dotColor}`}>
        <Icon name={event.icon} size={12} strokeWidth={2.5} />
      </div>

      {/* Content */}
      <div className="pb-4">
        <p className={`font-cairo text-sm font-semibold ${event.done ? 'text-text' : 'text-text-muted'}`}>
          {event.label}
        </p>
        {event.time && (
          <p className="font-cairo text-xs text-text-subtle mt-0.5">{event.time}</p>
        )}
      </div>
    </div>
  )
}
