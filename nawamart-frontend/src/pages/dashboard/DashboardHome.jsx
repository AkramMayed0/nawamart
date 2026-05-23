/**
 * DashboardHome — /dashboard
 * Built in units: 9a (shell), 9b (stats), 9c (subscription), 9d (orders)
 */
import { useState, useEffect } from 'react'
import { useAuthStore }        from '@/store/authStore'
import { getMerchantOrders }   from '@/api/orders'
import { ShoppingBag, Clock, Banknote, MessageSquare } from 'lucide-react'
import SubscriptionWidget      from '@/components/dashboard/SubscriptionWidget'
import { useNavigate }         from 'react-router-dom'

// ── Arabic weekday + date ─────────────────────────────────────────────────
function todayLabel() {
  return new Date().toLocaleDateString('ar-YE', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })
}

// ── Single stat card ──────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, iconBg, loading }) {
  if (loading) {
    return (
      <div className="bg-white border border-border rounded-2xl p-5 flex flex-col gap-3 animate-pulse">
        <div className="w-9 h-9 rounded-xl bg-bg-soft" />
        <div className="h-7 w-16 bg-bg-soft rounded" />
        <div className="h-3 w-24 bg-bg-soft rounded" />
      </div>
    )
  }

  return (
    <div className="bg-white border border-border rounded-2xl p-5 flex flex-col gap-2">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
        <Icon size={18} />
      </div>
      <p className="font-inter font-extrabold text-2xl text-text dk-num leading-none">
        {value ?? '—'}
      </p>
      <div>
        <p className="font-cairo font-semibold text-sm text-text">{label}</p>
        {sub && <p className="font-cairo text-xs text-text-muted mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

// ── Derive stats from orders array ────────────────────────────────────────
function deriveStats(orders = []) {
  const today = new Date().toDateString()

  const ordersToday   = orders.filter(o => new Date(o.createdAt).toDateString() === today).length
  const pendingWasl   = orders.filter(o => o.status === 'pending_wasl' || o.status === 'pending').length
  const totalSales    = orders
    .filter(o => o.status === 'delivered' || o.status === 'confirmed')
    .reduce((sum, o) => sum + (o.totalAmount ?? 0), 0)
  const activeChats   = orders.filter(o => o.chatId && o.status !== 'delivered').length

  return { ordersToday, pendingWasl, totalSales, activeChats }
}

// ── Status badge meta ─────────────────────────────────────────────────────
const STATUS = {
  pending:   { label: 'بانتظار الوصل', cls: 'bg-warning-100 text-yellow-700' },
  confirmed: { label: 'مؤكد',          cls: 'bg-success-100 text-success'    },
  shipped:   { label: 'تم الشحن',      cls: 'bg-info-100 text-info'          },
  delivered: { label: 'تم التسليم',    cls: 'bg-success-100 text-success'    },
  rejected:  { label: 'مرفوض',         cls: 'bg-danger-100 text-danger'      },
}

// ── Recent orders list ────────────────────────────────────────────────────
function RecentOrders({ orders, loading }) {
  const navigate = useNavigate()
  const recent   = [...orders]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)

  return (
    <div className="bg-white border border-border rounded-2xl overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <h2 className="font-cairo font-bold text-base text-text">آخر الطلبات</h2>
        <button
          onClick={() => navigate('/dashboard/orders')}
          className="font-cairo text-xs font-semibold text-primary hover:underline"
        >
          عرض الكل ←
        </button>
      </div>

      {/* Rows */}
      {loading ? (
        <div className="flex flex-col divide-y divide-border animate-pulse">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-5 py-3.5">
              <div className="h-3.5 w-20 bg-bg-soft rounded" />
              <div className="h-3.5 w-24 bg-bg-soft rounded flex-1" />
              <div className="h-5 w-16 bg-bg-soft rounded-lg" />
              <div className="h-3.5 w-14 bg-bg-soft rounded" />
            </div>
          ))}
        </div>
      ) : recent.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-10 text-center px-5">
          <ShoppingBag size={28} className="text-text-subtle" />
          <p className="font-cairo text-sm text-text-muted">لا توجد طلبات بعد</p>
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-border">
          {recent.map(order => {
            const meta  = STATUS[order.status] ?? { label: order.status, cls: 'bg-bg-soft text-text-muted' }
            const total = (order.totalAmount ?? 0).toLocaleString('en-US')
            const date  = new Date(order.createdAt).toLocaleDateString('ar-YE', {
              month: 'short', day: 'numeric',
            })

            return (
              <button
                key={order._id}
                onClick={() => navigate('/dashboard/orders')}
                className="flex items-center gap-3 px-5 py-3.5 hover:bg-bg-soft transition-colors text-right w-full"
              >
                {/* Order ID */}
                <span className="font-en font-bold text-xs text-text-muted shrink-0 dk-num">
                  #{(order.orderNumber ?? order._id?.slice(-5))?.toUpperCase()}
                </span>

                {/* Customer name */}
                <span className="font-cairo text-sm text-text truncate flex-1">
                  {order.deliveryAddress?.name ?? order.customer?.name ?? '—'}
                </span>

                {/* Status badge */}
                <span className={`shrink-0 font-cairo text-[11px] font-semibold px-2 py-0.5 rounded-lg ${meta.cls}`}>
                  {meta.label}
                </span>

                {/* Amount */}
                <span className="font-inter font-bold text-sm text-text dk-num shrink-0">
                  {total} ر.ي
                </span>

                {/* Date */}
                <span className="font-cairo text-xs text-text-subtle shrink-0 hidden sm:block">
                  {date}
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function DashboardHome() {
  const user  = useAuthStore(s => s.user)
  const storeRaw = useAuthStore(s => s.store)
  const store    = Array.isArray(storeRaw) ? storeRaw[0] : storeRaw

  const [orders,  setOrders]  = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMerchantOrders()
      .then(res => setOrders(res.data.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const isDigital = store?.type === 'digital'
  const stats     = deriveStats(orders)

  const CARDS = [
    {
      icon:    ShoppingBag,
      label:   'طلبات اليوم',
      value:   stats.ordersToday.toLocaleString('en-US'),
      sub:     'طلب جديد اليوم',
      iconBg:  'bg-primary/10 text-primary',
    },
    {
      icon:    Clock,
      label:   'بانتظار الوصل',
      value:   stats.pendingWasl.toLocaleString('en-US'),
      sub:     'يحتاج مراجعة',
      iconBg:  'bg-warning-100 text-warning',
    },
    {
      icon:    Banknote,
      label:   'المبيعات',
      value:   stats.totalSales.toLocaleString('en-US'),
      sub:     'ر.ي إجمالي مؤكد',
      iconBg:  'bg-success-100 text-success',
    },
    {
      icon:    MessageSquare,
      label:   'محادثات نشطة',
      value:   stats.activeChats.toLocaleString('en-US'),
      sub:     isDigital ? 'في انتظار الرد' : 'غير متاح للمتاجر المادية',
      iconBg:  'bg-info-100 text-info',
    },
  ]

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 font-cairo" dir="rtl">

      {/* ── Greeting header ── */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-8">
        <div>
          <p className="text-sm text-text-muted mb-1">{todayLabel()}</p>
          <h1 className="font-extrabold text-2xl text-text leading-tight">
            مرحباً، {user?.name ?? 'التاجر'} 👋
          </h1>
          {store?.name && (
            <p className="text-sm text-text-muted mt-0.5">{store.name}</p>
          )}
        </div>
        {store?.type && (
          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border ${
            isDigital
              ? 'bg-accent-50 text-accent-700 border-accent-100'
              : 'bg-primary-50 text-primary border-primary-100'
          }`}>
            {isDigital ? '⚡ متجر رقمي' : '🚚 متجر مادي'}
          </span>
        )}
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {CARDS.map(c => (
          <StatCard key={c.label} {...c} loading={loading} />
        ))}
      </div>

      {/* ── Bottom grid: subscription widget + recent orders ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6 items-start">

        {/* Subscription widget */}
        <SubscriptionWidget />

        {/* Recent orders */}
        <RecentOrders orders={orders} loading={loading} />

      </div>

    </div>
  )
}
