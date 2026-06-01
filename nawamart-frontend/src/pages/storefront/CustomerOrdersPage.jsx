import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getCustomerOrders } from '@/api/orders'
import Icon, { StatusBadge } from '@/components/ui/Icon'
import usePageTitle from '@/hooks/usePageTitle'

export default function CustomerOrdersPage() {
  const { slug } = useParams()
  usePageTitle('طلباتي')

  const { data: orders, isLoading } = useQuery({
    queryKey: ['customer-orders', slug],
    queryFn: () => getCustomerOrders().then(r => r.data.data),
    staleTime: 15_000,
  })

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12" dir="rtl">
        <div className="animate-pulse flex flex-col gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-bg-soft rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  const list = orders ?? []

  return (
    <div className="max-w-3xl mx-auto px-4 py-8" dir="rtl">
      {/* Back */}
      <Link
        to={`/store/${slug}`}
        className="inline-flex items-center gap-1.5 text-sm text-text-muted font-cairo hover:text-primary transition-colors mb-4"
      >
        <Icon name="arrow-right" size={14} />
        العودة للمتجر
      </Link>

      {/* Header */}
      <div className="mb-6">
        <h1 className="font-cairo font-extrabold text-2xl text-text">طلباتي</h1>
        <p className="font-cairo text-sm text-text-muted mt-0.5">
          {list.length > 0 ? `${list.length} طلب` : 'لا توجد طلبات بعد'}
        </p>
      </div>

      {list.length === 0 ? (
        <EmptyState slug={slug} />
      ) : (
        <div className="flex flex-col gap-3">
          {list.map(order => <OrderCard key={order._id} order={order} slug={slug} />)}
        </div>
      )}
    </div>
  )
}

function OrderCard({ order, slug }) {
  const shortId = String(order._id).slice(-8).toUpperCase()
  const total = order.items?.reduce((s, i) => s + (i.price ?? 0) * i.quantity, 0) ?? 0
  const date = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString('ar-YE', { day: 'numeric', month: 'short', year: 'numeric' })
    : ''

  return (
    <Link
      to={`/store/${slug}/order/${order._id}/track`}
      className="block bg-white border border-border rounded-xl p-4 hover:border-primary/30 hover:shadow-sm transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <span className="font-inter font-bold text-sm text-primary dk-num">#{shortId}</span>
          <p className="font-cairo text-xs text-text-muted mt-0.5">{date}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="flex flex-col gap-1.5">
        {order.items?.slice(0, 3).map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-bg-soft border border-border overflow-hidden shrink-0 flex items-center justify-center">
              {item.product?.images?.[0]
                ? <img src={item.product.images[0]} alt="" className="w-full h-full object-cover" />
                : <Icon name={order.store?.type === 'digital' ? 'bolt' : 'package'} size={14} className="text-text-subtle" />
              }
            </div>
            <span className="font-cairo text-sm text-text truncate flex-1">{item.product?.name ?? item.name}</span>
            <span className="font-cairo text-xs text-text-muted shrink-0">×{item.quantity}</span>
          </div>
        ))}
        {(order.items?.length ?? 0) > 3 && (
          <p className="font-cairo text-xs text-text-muted pr-10">+{order.items.length - 3} منتجات أخرى</p>
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
        <span className="font-inter font-bold text-sm text-text dk-num">{total.toLocaleString('en-US')} ر.ي</span>
        <span className="inline-flex items-center gap-1 font-cairo text-xs font-semibold text-primary">
          تتبع الطلب
          <Icon name="arrow-left" size={12} />
        </span>
      </div>
    </Link>
  )
}

function EmptyState({ slug }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
      <div className="w-16 h-16 rounded-2xl bg-bg-soft border border-border flex items-center justify-center">
        <Icon name="package" size={28} className="text-text-subtle" />
      </div>
      <div>
        <p className="font-cairo font-bold text-lg text-text">لا توجد طلبات بعد</p>
        <p className="font-cairo text-sm text-text-muted mt-1">عندما تطلب من هذا المتجر، ستظهر طلباتك هنا.</p>
      </div>
      <Link
        to={`/store/${slug}`}
        className="inline-flex items-center gap-2 bg-primary text-white font-cairo font-bold text-sm px-5 py-2.5 rounded-lg hover:bg-primary-700 transition-colors"
      >
        تسوق الآن
      </Link>
    </div>
  )
}
