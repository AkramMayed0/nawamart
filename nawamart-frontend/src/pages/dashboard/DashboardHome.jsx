/**
 * DashboardHome — /dashboard
 * Built in units: 9a (shell), 9b (stats), 9c (subscription), 9d (orders)
 */
import usePageTitle            from '@/hooks/usePageTitle'
import { useAuthStore }        from '@/store/authStore'
import { usePreferencesStore } from '@/store/preferencesStore'
import { useQuery }            from '@tanstack/react-query'
import { getMerchantOrders }   from '@/api/orders'
import { ShoppingBag, Clock, Banknote, MessageSquare, Zap, Truck, BarChart3 } from 'lucide-react'
import SubscriptionWidget      from '@/components/dashboard/SubscriptionWidget'
import { useEffect }           from 'react'
import { useNavigate }         from 'react-router-dom'

// ── Arabic weekday + date ─────────────────────────────────────────────────
function todayLabel() {
  return new Date().toLocaleDateString('ar-YE', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })
}

// ── Single stat card ──────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, iconBg, accentBorder, loading }) {
  if (loading) {
    return (
      <div className="bg-white border border-border rounded-2xl p-5 flex flex-col gap-3 animate-pulse">
        <div className="w-10 h-10 rounded-xl bg-bg-soft" />
        <div className="h-7 w-16 bg-bg-soft rounded" />
        <div className="h-3 w-24 bg-bg-soft rounded" />
      </div>
    )
  }

  return (
    <div className={`bg-white border border-border rounded-2xl p-5 flex flex-col gap-2 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 border-r-4 ${accentBorder}`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
        <Icon size={19} />
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
    <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm">

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-accent" />
          <h2 className="font-cairo font-bold text-base text-text">آخر الطلبات</h2>
        </div>
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
                className="group relative flex items-center gap-3 px-5 py-3.5 hover:bg-bg-soft transition-colors text-right w-full"
              >
                {/* Hover left border indicator */}
                <span className="absolute right-0 top-1 bottom-1 w-0.5 rounded-full bg-accent opacity-0 group-hover:opacity-100 transition-opacity" />

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
  const navigate = useNavigate()
  const prefs = usePreferencesStore()

  const { data: orders = [], isLoading: loading } = useQuery({
    queryKey: ['merchant-orders'],
    queryFn:  () => getMerchantOrders().then(res => res.data.data ?? []),
    staleTime: 30_000,
  })

  const isDigital = store?.type === 'digital'
  const stats     = deriveStats(orders)

  const CARDS = [
    {
      icon:    ShoppingBag,
      label:   'طلبات اليوم',
      value:   stats.ordersToday.toLocaleString('en-US'),
      sub:     'طلب جديد اليوم',
      iconBg:  'bg-gradient-to-br from-primary-50 to-primary-100 text-primary',
      accentBorder: 'border-r-primary',
    },
    {
      icon:    Clock,
      label:   'بانتظار الوصل',
      value:   stats.pendingWasl.toLocaleString('en-US'),
      sub:     'يحتاج مراجعة',
      iconBg:  'bg-gradient-to-br from-warning-100 to-yellow-100 text-warning',
      accentBorder: 'border-r-warning',
    },
    {
      icon:    Banknote,
      label:   'المبيعات',
      value:   stats.totalSales.toLocaleString('en-US'),
      sub:     'ر.ي إجمالي مؤكد',
      iconBg:  'bg-gradient-to-br from-success-100 to-green-100 text-success',
      accentBorder: 'border-r-success',
    },
    {
      icon:    MessageSquare,
      label:   'محادثات نشطة',
      value:   stats.activeChats.toLocaleString('en-US'),
      sub:     isDigital ? 'في انتظار الرد' : 'غير متاح للمتاجر المادية',
      iconBg:  'bg-gradient-to-br from-info-100 to-blue-100 text-info',
      accentBorder: 'border-r-info',
    },
  ]

  usePageTitle('لوحة التحكم')

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 font-cairo" dir="rtl">

      {/* ── Greeting welcome card ── */}
      <div className="relative bg-gradient-to-l from-primary-50 via-white to-accent-50 rounded-3xl p-6 mb-8 overflow-hidden border border-border/50">
        {/* Decorative shapes */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-accent/5 rounded-full -translate-x-10 -translate-y-10" />
        <div className="absolute bottom-0 right-0 w-24 h-24 bg-primary/5 rounded-full translate-x-8 translate-y-8" />

        <div className="relative flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm text-text-muted mb-1">{todayLabel()}</p>
            <h1 className="font-extrabold text-2xl text-text leading-tight">
              مرحباً، {user?.name ?? 'التاجر'}
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
              {isDigital ? <Zap size={14} /> : <Truck size={14} />}
              {isDigital ? 'متجر رقمي' : 'متجر مادي'}
            </span>
          )}
        </div>
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        {CARDS.map(c => (
          <StatCard key={c.label} {...c} loading={loading} />
        ))}
      </div>

      {/* ── Bottom grid: reports, subscription, orders ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6 items-start">

        {/* Reports card */}
        <button
          type="button"
          onClick={() => navigate('/dashboard/reports')}
          className="bg-gradient-to-br from-accent-50 to-white border border-border rounded-2xl p-5 flex flex-col gap-3 shadow-sm hover:shadow-md transition-all duration-200 text-right w-full"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-50 to-accent-100 text-accent-700 flex items-center justify-center">
            <BarChart3 size={19} />
          </div>
          <p className="font-cairo font-extrabold text-lg text-text">التقارير</p>
          <p className="font-cairo text-xs text-text-muted">تقارير المشتريات والمبيعات مع إمكانية التصدير إلى PDF.</p>
          <span className="font-cairo text-xs font-bold text-primary mt-1">عرض التقارير ←</span>
        </button>

        {/* Subscription widget */}
        {prefs.showSubscriptionSummary && <SubscriptionWidget />}

        {/* Recent orders */}
        {prefs.showRecentOrders && <RecentOrders orders={orders} loading={loading} />}

      </div>

    </div>
  )
}
