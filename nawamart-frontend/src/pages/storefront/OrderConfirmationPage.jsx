import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getOrderById } from '@/api/orders'
import { getStoreBySlug } from '@/api/stores'
import Icon from '@/components/ui/Icon'

export default function OrderConfirmationPage() {
  const { slug, orderId } = useParams()

  const { data: order, isLoading, isError } = useQuery({
    queryKey: ['order', orderId],
    queryFn:  () => getOrderById(orderId).then(r => r.data.data),
    enabled:  !!orderId,
    retry: false,
  })

  const { data: store } = useQuery({
    queryKey: ['store', slug],
    queryFn:  () => getStoreBySlug(slug).then(r => r.data.data),
    staleTime: 1000 * 60 * 5,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32" dir="rtl">
        <svg className="animate-spin w-8 h-8 text-primary" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      </div>
    )
  }

  if (isError || !order) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center" dir="rtl">
        <p className="font-cairo text-text-muted">تعذّر تحميل بيانات الطلب.</p>
        <Link
          to={`/store/${slug}`}
          className="mt-4 inline-flex items-center gap-2 text-sm font-cairo text-primary hover:underline"
        >
          العودة للمتجر
        </Link>
      </div>
    )
  }

  const total    = order.items?.reduce((s, i) => s + (i.price ?? 0) * i.quantity, 0) ?? 0
  const isDigital = store?.type === 'digital'

  return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center" dir="rtl">

      {/* Success icon */}
      <div className="w-20 h-20 rounded-full bg-success-100 text-success flex items-center justify-center mx-auto mb-6">
        <Icon name="check" size={36} strokeWidth={2.5} />
      </div>

      {/* Heading */}
      <h1 className="font-cairo font-extrabold text-2xl text-text mb-2">
        تم استلام طلبك ✓
      </h1>
      <p className="font-cairo text-sm text-text-muted leading-relaxed mb-6">
        {isDigital
          ? 'سيراجع التاجر صورة الوصل ويفتح معك محادثة خاصة لتسليم المنتج. عادةً خلال 5–15 دقيقة.'
          : 'سيتواصل التاجر معك خلال 24 ساعة لتأكيد الطلب ومراجعة الوصل. شكراً لثقتك.'}
      </p>

      {/* Info card */}
      <div className="bg-white border border-border rounded-xl p-5 text-start mb-6 flex flex-col gap-3">

        {/* Order ID */}
        <div className="flex justify-between items-center">
          <span className="font-cairo text-sm text-text-muted">رقم الطلب</span>
          <span className="font-inter font-bold text-sm text-primary dk-num tracking-wide">
            #{String(order._id).slice(-8).toUpperCase()}
          </span>
        </div>

        {/* Store name */}
        <div className="flex justify-between items-center">
          <span className="font-cairo text-sm text-text-muted">المتجر</span>
          <span className="font-cairo font-semibold text-sm text-text">
            {store?.name ?? slug}
          </span>
        </div>

        {/* Total */}
        <div className="flex justify-between items-center">
          <span className="font-cairo text-sm text-text-muted">الإجمالي</span>
          <span className="font-inter font-bold text-sm text-text dk-num">
            {total.toLocaleString('en-US')} ر.ي
          </span>
        </div>

        {/* Status badge */}
        <div className="flex justify-between items-center">
          <span className="font-cairo text-sm text-text-muted">الحالة</span>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold font-cairo px-2.5 py-1 rounded-pill bg-warning-100 text-yellow-700">
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            بانتظار التحقق
          </span>
        </div>

        {/* Wasl thumbnail */}
        {order.waslUrl && (
          <div className="flex justify-between items-center pt-1 border-t border-border">
            <span className="font-cairo text-sm text-text-muted">الوصل</span>
            <a href={order.waslUrl} target="_blank" rel="noopener noreferrer">
              <img
                src={order.waslUrl}
                alt="الوصل"
                className="w-14 h-14 rounded-lg object-cover border border-border hover:opacity-80 transition-opacity"
              />
            </a>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-center">
        <Link
          to={`/store/${slug}`}
          className="inline-flex items-center gap-2 font-cairo font-semibold text-sm px-5 py-2.5 rounded-lg border border-border bg-white text-text hover:bg-bg transition-colors"
        >
          تابع التسوق
        </Link>
        <Link
          to={`/store/${slug}/order/${orderId}/track`}
          className="inline-flex items-center gap-2 font-cairo font-bold text-sm px-5 py-2.5 rounded-lg bg-primary text-white hover:bg-primary-700 transition-colors"
        >
          <Icon name="clock" size={15} />
          تتبع الطلب
        </Link>
      </div>
    </div>
  )
}
