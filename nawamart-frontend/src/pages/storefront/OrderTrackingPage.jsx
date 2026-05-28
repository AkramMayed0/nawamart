import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { MessageCircle, Send, Instagram, Phone, CheckCircle2 } from 'lucide-react'
import { getOrderById } from '@/api/orders'
import Icon from '@/components/ui/Icon'
import { resolveAssetUrl } from '@/utils/assets'

const METHOD_META = {
  whatsapp:  { label: 'واتساب',  icon: MessageCircle },
  telegram:  { label: 'تيليجرام', icon: Send },
  instagram: { label: 'انستقرام', icon: Instagram },
  phone:     { label: 'اتصال هاتفي', icon: Phone },
}

export default function OrderTrackingPage() {
  const { slug, orderId } = useParams()
  const navigate = useNavigate()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['order', orderId],
    queryFn:  () => getOrderById(orderId).then(r => r.data.data),
    // Auto-refresh every 30 seconds
    refetchInterval: 30_000,
    staleTime: 10_000,
    retry: 1,
  })

  const order = data

  // ── Loading ───────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12" dir="rtl">
        <div className="animate-pulse flex flex-col gap-5">
          <div className="h-6 bg-bg-soft rounded w-40" />
          <div className="h-32 bg-bg-soft rounded-xl" />
          <div className="h-24 bg-bg-soft rounded-xl" />
          <div className="h-48 bg-bg-soft rounded-xl" />
        </div>
      </div>
    )
  }

  // ── Error ─────────────────────────────────────────────────────
  if (isError || !order) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center" dir="rtl">
        <div className="w-14 h-14 rounded-2xl bg-danger-100 flex items-center justify-center mx-auto mb-4">
          <Icon name="x" size={24} className="text-danger" />
        </div>
        <h2 className="font-cairo font-bold text-xl text-text mb-2">تعذّر تحميل بيانات الطلب</h2>
        <p className="font-cairo text-sm text-text-muted mb-6">تحقق من رابط الطلب أو حاول مجدداً.</p>
        <Link
          to={`/store/${slug}`}
          className="inline-flex items-center gap-2 bg-primary text-white font-cairo font-semibold px-5 py-2.5 rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Icon name="arrow-right" size={16} />
          العودة للمتجر
        </Link>
      </div>
    )
  }

  // ── Main render ───────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto px-4 py-8" dir="rtl">

      {/* Back */}
      <button
        onClick={() => navigate(`/store/${slug}`)}
        className="inline-flex items-center gap-2 text-sm text-text-muted font-cairo hover:text-primary transition-colors mb-6"
      >
        <Icon name="arrow-right" size={14} />
        العودة للمتجر
      </button>

      {/* Title */}
      <div className="flex items-center gap-3 mb-6">
        <h1 className="font-cairo font-extrabold text-2xl text-text">تتبع طلبك</h1>
        <span className="font-inter font-bold text-sm text-primary dk-num bg-primary-50 px-2.5 py-1 rounded-lg border border-primary-100">
          #{String(order._id).slice(-8).toUpperCase()}
        </span>
      </div>

      {/* Auto-refresh note */}
      <p className="font-cairo text-xs text-text-subtle mb-6 flex items-center gap-1.5">
        <Icon name="clock" size={13} />
        يتجدد تلقائياً كل 30 ثانية
      </p>

      {/* Order summary */}
      <OrderSummaryCard order={order} />

      {/* Status timeline */}
      <StatusTimeline order={order} />

      {/* Rejection reason (shown separately if rejected) */}
      {order.status === 'rejected' && order.rejectionReason && (
        <div className="bg-danger-100 border border-red-200 rounded-xl p-4 mb-4 flex gap-3">
          <Icon name="x" size={18} className="text-danger shrink-0 mt-0.5" />
          <div>
            <p className="font-cairo font-bold text-sm text-danger mb-0.5">سبب الرفض</p>
            <p className="font-cairo text-sm text-text-muted">{order.rejectionReason}</p>
          </div>
        </div>
      )}

      {/* Delivery contact — digital confirmed */}
      {order.store?.type === 'digital' && order.status === 'confirmed' && (
        <DigitalDeliveryInfo order={order} />
      )}

      {/* Delivery contact — physical shipped */}
      {order.store?.type !== 'digital' && order.status === 'shipped' && (
        <div className="rounded-xl bg-success-100 border border-success p-5 text-center">
          <CheckCircle2 size={32} className="text-success mx-auto mb-2" />
          <p className="font-cairo font-bold text-base text-success-dark">طلبك في الطريق إليك!</p>
          <p className="font-cairo text-sm text-success-dark/70 mt-1">سيتم تحديث الحالة عند التسليم</p>
        </div>
      )}
    </div>
  )
}

/* ── Digital delivery info ───────────────────────────────────── */
function DigitalDeliveryInfo({ order }) {
  const method = order.contactMethod || 'whatsapp'
  const meta = METHOD_META[method] || METHOD_META.whatsapp
  const Icon = meta.icon
  const merchantPhone = order.store?.contactPhone || ''
  const cleanPhone = merchantPhone.replace(/[^0-9]/g, '')
  const handle = order.contactHandle || order.deliveryAddress?.phone || ''

  return (
    <div className="rounded-xl border border-accent-200 bg-accent-50 p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center text-white shrink-0">
          <Icon size={20} />
        </div>
        <div>
          <p className="font-cairo font-bold text-sm text-text">تم تأكيد الدفع</p>
          <p className="font-cairo text-xs text-text-muted mt-0.5">
            سيتواصل معك التاجر عبر <span className="font-bold">{meta.label}</span> لتسليم المنتج.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2 bg-white rounded-xl p-4 border border-accent-100">
        <p className="font-cairo text-xs text-text-muted">تأكد من أن حسابك جاهز لاستقبال الرسائل</p>
        <div className="flex items-center gap-2 text-sm font-cairo">
          <span className="text-text-muted">طريقة التسليم:</span>
          <span className="font-bold text-text flex items-center gap-1">
            <Icon size={14} />
            {meta.label}
          </span>
        </div>
        {handle && (
          <div className="flex items-center gap-2 text-sm font-cairo">
            <span className="text-text-muted">بيانات التواصل:</span>
            <span className="font-bold text-text">{handle}</span>
          </div>
        )}
        {merchantPhone && (
          <div className="flex items-center gap-2 text-sm font-cairo">
            <span className="text-text-muted">رقم التاجر:</span>
            <span className="font-inter font-bold text-text dk-num" dir="ltr">{merchantPhone}</span>
          </div>
        )}
      </div>

      {method === 'whatsapp' && (
        <a
          href={`https://wa.me/${cleanPhone}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 flex items-center justify-center gap-2 w-full rounded-xl bg-green-500 text-white py-3 font-cairo font-bold text-sm hover:bg-green-600 transition-colors"
        >
          <MessageCircle size={18} />
          مراسلة التاجر على واتساب
        </a>
      )}
    </div>
  )
}

/* ── Status timeline ─────────────────────────────────────────── */
const PHYSICAL_STEPS = [
  { id: 'pending',   label: 'بانتظار التحقق',  icon: 'clock' },
  { id: 'confirmed', label: 'تم تأكيد الدفع',  icon: 'check' },
  { id: 'shipped',   label: 'تم الشحن',         icon: 'truck' },
  { id: 'delivered', label: 'تم التسليم',       icon: 'check-circle' },
]
const DIGITAL_STEPS = [
  { id: 'pending',            label: 'بانتظار التحقق',    icon: 'clock' },
  { id: 'confirmed',          label: 'تم تأكيد الدفع',    icon: 'check' },
  { id: 'chat-open',          label: 'محادثة مفتوحة',      icon: 'msgs' },
  { id: 'digital-delivered',  label: 'تم التسليم',         icon: 'check-circle' },
]

function StatusTimeline({ order }) {
  const isDigital = order.store?.type === 'digital'
  const steps     = isDigital ? DIGITAL_STEPS : PHYSICAL_STEPS
  const curIdx    = steps.findIndex(s => s.id === order.status)
  const cur       = curIdx === -1 ? 0 : curIdx

  // Rejected is a special off-track state
  const isRejected = order.status === 'rejected'

  return (
    <div className="bg-white border border-border rounded-xl p-5 mb-4">
      <h3 className="font-cairo font-bold text-base text-text mb-6">مراحل الطلب</h3>

      <div className="flex items-start">
        {steps.map((step, i) => {
          const isDone    = !isRejected && i < cur
          const isCurrent = !isRejected && i === cur
          const isTodo    = isRejected || i > cur

          return (
            <div key={step.id} className="flex-1 flex flex-col items-center relative">

              {/* Connector line — left side */}
              {i > 0 && (
                <div className={`absolute top-4 right-1/2 w-full h-0.5 -translate-y-1/2 ${
                  isDone ? 'bg-success' : 'bg-border'
                }`} />
              )}

              {/* Dot */}
              <div className={`relative z-10 w-8 h-8 rounded-full border-2 flex items-center justify-center mb-2 transition-all ${
                isRejected && i === 0
                  ? 'bg-danger border-danger text-white'
                  : isDone
                    ? 'bg-success border-success text-white'
                    : isCurrent
                      ? isDigital
                        ? 'bg-accent border-accent text-white shadow-[0_0_0_4px_rgba(220,38,38,0.2)]'
                        : 'bg-warning border-warning text-white shadow-[0_0_0_4px_rgba(243,156,18,0.2)]'
                      : 'bg-white border-border text-text-subtle'
              }`}>
                <Icon name={isDone ? 'check' : step.icon} size={14} strokeWidth={2.5} />
              </div>

              {/* Label */}
              <p className={`font-cairo text-center text-xs leading-tight px-1 ${
                isTodo && !isRejected ? 'text-text-subtle' : 'font-semibold text-text'
              }`}>
                {step.label}
              </p>
            </div>
          )
        })}
      </div>

      {/* Rejected banner */}
      {isRejected && (
        <div className="mt-5 flex items-start gap-3 bg-danger-100 rounded-xl p-4">
          <Icon name="x" size={18} className="text-danger shrink-0 mt-0.5" />
          <div>
            <p className="font-cairo font-bold text-sm text-danger">تم رفض الطلب</p>
            {order.rejectionReason && (
              <p className="font-cairo text-sm text-text-muted mt-0.5">{order.rejectionReason}</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Order summary card ──────────────────────────────────────── */
function OrderSummaryCard({ order }) {
  const isDigital = order.store?.type === 'digital'
  const subtotal  = order.items?.reduce((s, i) => s + (i.price ?? 0) * i.quantity, 0) ?? 0
  const shipping  = isDigital ? 0 : (order.shippingFee ?? 0)
  const total     = subtotal + shipping
  const customer  = order.deliveryAddress?.name ?? 'عميل'
  const createdAt = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString('ar-YE', { day: 'numeric', month: 'long', year: 'numeric' })
    : '—'

  return (
    <div className="bg-white border border-border rounded-xl p-5 mb-4">
      <h3 className="font-cairo font-bold text-base text-text mb-4">تفاصيل الطلب</h3>

      {/* Items list */}
      <div className="flex flex-col gap-3 pb-4 mb-4 border-b border-border">
        {order.items?.map((item, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-bg-soft border border-border overflow-hidden shrink-0 flex items-center justify-center">
              {item.product?.images?.[0]
                ? <img src={resolveAssetUrl(item.product.images[0])} alt="" className="w-full h-full object-cover" />
                : <Icon name={isDigital ? 'bolt' : 'package'} size={16} className="text-text-subtle" />
              }
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-cairo font-semibold text-sm text-text truncate">
                {item.product?.name ?? 'منتج'}
              </p>
              <p className="font-cairo text-xs text-text-muted">×{item.quantity}</p>
            </div>
            <span className="font-inter font-bold text-sm text-text dk-num shrink-0">
              {((item.price ?? 0) * item.quantity).toLocaleString('en-US')}
            </span>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="flex flex-col gap-1.5 mb-4">
        <div className="flex justify-between font-cairo text-sm text-text-muted">
          <span>المجموع الفرعي</span>
          <span className="dk-num font-inter font-semibold text-text">{subtotal.toLocaleString('en-US')} ر.ي</span>
        </div>
        <div className="flex justify-between font-cairo text-sm text-text-muted">
          <span>{isDigital ? 'التسليم' : 'الشحن'}</span>
          <span className={isDigital ? 'text-success font-semibold' : 'dk-num font-inter font-semibold text-text'}>
            {isDigital ? 'مجاناً' : `${shipping.toLocaleString('en-US')} ر.ي`}
          </span>
        </div>
        <div className="flex justify-between font-cairo font-bold text-base text-text pt-2 border-t border-border">
          <span>الإجمالي</span>
          <span className="dk-num font-inter">{total.toLocaleString('en-US')} ر.ي</span>
        </div>
      </div>

      {/* Meta row */}
      <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs font-cairo text-text-muted border-t border-border pt-3">
        <span><span className="text-text-subtle ml-1">العميل:</span>{customer}</span>
        <span><span className="text-text-subtle ml-1">التاريخ:</span>{createdAt}</span>
        <span><span className="text-text-subtle ml-1">طريقة الدفع:</span>
          {order.paymentMethod === 'kuraimi' ? 'الكريمي' : order.paymentMethod === 'oneCash' ? 'OneCash' : order.paymentMethod === 'jaib' ? 'جيب' : order.paymentMethod}
        </span>
      </div>

      {/* وصل thumbnail */}
      {order.paymentWasl && (
        <div className="mt-4 flex items-center gap-3">
          <a href={resolveAssetUrl(order.paymentWasl)} target="_blank" rel="noopener noreferrer"
            className="w-16 h-16 rounded-lg border border-border overflow-hidden block hover:opacity-80 transition-opacity shrink-0"
          >
            <img src={resolveAssetUrl(order.paymentWasl)} alt="وصل" className="w-full h-full object-cover" />
          </a>
          <div>
            <p className="font-cairo font-semibold text-sm text-text">وصل الدفع</p>
            <a href={resolveAssetUrl(order.paymentWasl)} target="_blank" rel="noopener noreferrer"
              className="font-cairo text-xs text-primary hover:underline"
            >
              عرض الصورة كاملة ←
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
