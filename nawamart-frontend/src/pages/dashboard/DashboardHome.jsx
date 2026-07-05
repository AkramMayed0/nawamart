import usePageTitle            from '@/hooks/usePageTitle'
import { useAuthStore }        from '@/store/authStore'
import { usePreferencesStore } from '@/store/preferencesStore'
import { useQuery }            from '@tanstack/react-query'
import { getMerchantOrders }   from '@/api/orders'
import {
  ShoppingBag, Clock, Banknote, MessageSquare,
  Zap, Truck, BarChart3, Plus, Package, Eye,
  TrendingUp, ArrowLeft, AlertTriangle, RefreshCw,
} from 'lucide-react'
import { useNavigate }         from 'react-router-dom'
import { useQueryClient }      from '@tanstack/react-query'
import SubscriptionWidget      from '@/components/dashboard/SubscriptionWidget'
import SetupChecklist          from '@/components/dashboard/SetupChecklist'

function todayLabel() {
  const d = new Date()
  const weekday = d.toLocaleDateString('ar-YE', { weekday: 'long' })
  const date    = d.toLocaleDateString('ar-YE', { year: 'numeric', month: 'long', day: 'numeric' })
  return `${weekday}، ${date}`
}

function StatCard({ icon: Icon, label, value, sub, color, iconBg, loading }) {
  if (loading) {
    return (
      <div className="animate-pulse bg-surface border border-border rounded-2xl p-5">
        <div className="w-10 h-10 rounded-xl bg-bg-soft mb-4" />
        <div className="h-7 w-14 bg-bg-soft rounded mb-2" />
        <div className="h-3 w-24 bg-bg-soft rounded" />
      </div>
    )
  }
  return (
    <div
      className="bg-surface border border-border rounded-2xl p-5 cursor-default"
      style={{ transition: 'all 200ms ease' }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'var(--color-border-strong)'
        e.currentTarget.style.transform = 'translateY(-2px)'
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--color-border)'
        e.currentTarget.style.transform = 'none'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${iconBg}`}>
        <Icon size={18} style={{ color }} />
      </div>
      <p className="font-cairo font-extrabold dk-num text-text leading-none mb-1.5" style={{ fontSize: '28px' }}>
        {value ?? '—'}
      </p>
      <p className="font-cairo font-semibold text-sm text-text">{label}</p>
      {sub && <p className="font-cairo text-xs text-text-muted mt-0.5">{sub}</p>}
    </div>
  )
}

const QUICK_ACTIONS = [
  { label: 'إضافة منتج', to: '/dashboard/products', icon: Plus,        cls: 'bg-accent-50 text-accent-700 hover:bg-accent-100' },
  { label: 'المنتجات',   to: '/dashboard/products', icon: Package,     cls: 'bg-info-100 text-info hover:bg-info/20' },
  { label: 'الطلبات',    to: '/dashboard/orders',   icon: ShoppingBag, cls: 'bg-success-100 text-success-dark hover:bg-success/20' },
  { label: 'معاينة',     to: '/dashboard/shop',     icon: Eye,         cls: 'bg-violet-100 text-violet-700 hover:bg-violet-200' },
]

const STATUS_MAP = {
  pending:   { label: 'بانتظار الوصل', cls: 'bg-warning-100 text-amber-700' },
  confirmed: { label: 'مؤكد',          cls: 'bg-success-100 text-success-dark' },
  shipped:   { label: 'تم الشحن',      cls: 'bg-info-100 text-info' },
  delivered: { label: 'تم التسليم',    cls: 'bg-success-100 text-success-dark' },
  rejected:  { label: 'مرفوض',         cls: 'bg-danger-100 text-danger' },
}

function RecentOrders({ orders, loading }) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const recent = [...orders]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 6)

  return (
    <div className="bg-surface border border-border rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div className="flex items-center gap-2.5">
          <ShoppingBag size={15} className="text-accent" />
          <span className="font-cairo font-bold text-sm text-text">آخر الطلبات</span>
        </div>
        <button
          onClick={() => navigate('/dashboard/orders')}
          className="inline-flex items-center gap-1 font-cairo text-xs font-semibold text-text-muted hover:text-accent transition-colors"
        >
          عرض الكل <ArrowLeft size={12} />
        </button>
      </div>

      {loading ? (
        <div className="animate-pulse divide-y divide-border">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-5 py-3.5">
              <div className="h-3 w-16 bg-bg-soft rounded" />
              <div className="h-3 flex-1 bg-bg-soft rounded" />
              <div className="h-5 w-16 bg-bg-soft rounded-lg" />
              <div className="h-3 w-12 bg-bg-soft rounded" />
            </div>
          ))}
        </div>
      ) : recent.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-12 text-center px-5">
          <div className="w-12 h-12 rounded-full bg-bg-soft flex items-center justify-center">
            <ShoppingBag size={22} className="text-text-subtle" />
          </div>
          <p className="font-cairo text-sm font-semibold text-text-muted">لا توجد طلبات بعد</p>
          <p className="font-cairo text-xs text-text-subtle">عند وصول أول طلب، سيظهر هنا</p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {recent.map((order, idx) => {
            const meta  = STATUS_MAP[order.status] ?? { label: order.status, cls: 'bg-bg-soft text-text-muted' }
            const total = (order.totalAmount ?? 0).toLocaleString('en-US')
            const date  = new Date(order.createdAt).toLocaleDateString('ar-YE', { month: 'short', day: 'numeric' })
            return (
              <button
                key={order._id}
                onClick={() => navigate(`/dashboard/orders/${order._id}`)}
                className="group w-full flex items-center gap-3 px-5 py-3.5 hover:bg-bg-soft transition-colors text-right"
              >
                <span className="font-cairo font-bold text-xs text-text-subtle shrink-0 dk-num">
                  #{(order.orderNumber ?? order._id?.slice(-5))?.toUpperCase()}
                </span>
                <span className="font-cairo text-sm text-text truncate flex-1">
                  {order.deliveryAddress?.name ?? order.customer?.name ?? '—'}
                </span>
                <span className={`shrink-0 font-cairo text-[11px] font-semibold px-2.5 py-0.5 rounded-lg ${meta.cls}`}>
                  {meta.label}
                </span>
                <span className="font-cairo font-bold text-sm text-text dk-num shrink-0">
                  {total} ر.ي
                </span>
                <span className="font-cairo text-xs text-text-subtle shrink-0 hidden sm:block">{date}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

function deriveStats(orders = []) {
  const today = new Date().toDateString()
  return {
    ordersToday: orders.filter(o => new Date(o.createdAt).toDateString() === today).length,
    pendingWasl: orders.filter(o => o.status === 'pending_wasl' || o.status === 'pending').length,
    totalSales:  orders
      .filter(o => o.status === 'delivered' || o.status === 'confirmed')
      .reduce((sum, o) => sum + (o.totalAmount ?? 0), 0),
    activeChats: orders.filter(o => o.chatId && o.status !== 'delivered').length,
  }
}

export default function DashboardHome() {
  const user      = useAuthStore(s => s.user)
  const storeRaw  = useAuthStore(s => s.store)
  const store     = Array.isArray(storeRaw) ? storeRaw[0] : storeRaw
  const navigate  = useNavigate()
  const prefs     = usePreferencesStore()
  const queryClient = useQueryClient()

  const { data: orders = [], isLoading: loading, isError } = useQuery({
    queryKey: ['merchant-orders'],
    queryFn:  () => getMerchantOrders().then(res => res.data.data ?? []),
    staleTime: 30_000,
  })

  const isDigital = store?.type === 'digital'
  const stats     = deriveStats(orders)

  const CARDS = [
    {
      icon: ShoppingBag, label: 'طلبات اليوم',
      value: stats.ordersToday.toLocaleString('en-US'), sub: 'منذ منتصف الليل',
      iconBg: 'bg-accent-50', color: '#C93F2B',
    },
    {
      icon: Clock, label: 'بانتظار الوصل',
      value: stats.pendingWasl.toLocaleString('en-US'), sub: 'يحتاج مراجعة',
      iconBg: 'bg-warning-100', color: '#B7791F',
    },
    {
      icon: Banknote, label: 'المبيعات',
      value: stats.totalSales.toLocaleString('en-US'), sub: 'ر.ي إجمالي',
      iconBg: 'bg-success-100', color: '#27AE60',
    },
    {
      icon: MessageSquare, label: 'محادثات نشطة',
      value: stats.activeChats.toLocaleString('en-US'),
      sub: isDigital ? 'في انتظار الرد' : 'غير متاح',
      iconBg: 'bg-info-100', color: '#2D7BE0',
    },
  ]

  usePageTitle('لوحة التحكم')

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center" dir="rtl">
        <AlertTriangle size={40} className="text-danger mb-4" />
        <h2 className="font-cairo font-bold text-xl text-text mb-2">تعذر تحميل البيانات</h2>
        <p className="font-cairo text-sm text-text-muted mb-6">حدث خطأ أثناء جلب البيانات. يرجى المحاولة مجدداً.</p>
        <button
          onClick={() => queryClient.invalidateQueries({ queryKey: ['merchant-orders'] })}
          className="inline-flex items-center gap-2 font-cairo text-sm font-bold text-white bg-accent hover:bg-accent-700 px-5 py-2.5 rounded-xl transition-colors"
        >
          <RefreshCw size={15} /> إعادة المحاولة
        </button>
      </div>
    )
  }

  return (
    <div className="page-enter max-w-6xl mx-auto px-4 sm:px-6 py-6 md:py-8" dir="rtl">

      {/* ── Welcome banner ── */}
      <div className="relative rounded-2xl p-6 md:p-8 mb-7 overflow-hidden nm-dark-card">
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(201,63,43,0.15) 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
        <div className="absolute bottom-0 left-0 w-36 h-36 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(15,118,110,0.12) 0%, transparent 70%)', transform: 'translate(-20%, 30%)' }} />
        <div className="relative flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-cairo text-sm mb-1" style={{ color: 'rgba(255,255,255,0.45)' }}>{todayLabel()}</p>
            <h1 className="font-cairo font-extrabold text-2xl md:text-3xl text-white leading-tight">
              مرحباً، {user?.name ?? 'التاجر'} 👋
            </h1>
            {store?.name && (
              <p className="font-cairo text-sm mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>{store.name}</p>
            )}
          </div>
          {store?.type && (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold font-cairo px-3 py-1.5 rounded-full"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.7)' }}>
              {isDigital ? <Zap size={13} /> : <Truck size={13} />}
              {isDigital ? 'متجر رقمي' : 'متجر مادي'}
            </span>
          )}
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto hide-scrollbar">
        {QUICK_ACTIONS.map(({ label, to, icon: Icon, cls }, idx) => (
          <button
            key={label}
            onClick={() => navigate(to)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-cairo text-sm font-bold transition-all shrink-0 ${cls} list-item-enter`}
            style={{ animationDelay: `${idx * 0.05}s` }}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {/* ── Stats grid ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-7">
        {CARDS.map((c, idx) => (
          <div key={c.label} className="list-item-enter" style={{ animationDelay: `${idx * 0.06}s` }}>
            <StatCard {...c} loading={loading} />
          </div>
        ))}
      </div>

      {/* ── Bottom grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-5 items-start">
        {store && <SetupChecklist store={store} />}
        <div className="flex flex-col gap-5">
          {/* Reports shortcut */}
          <button
            type="button"
            onClick={() => navigate('/dashboard/reports')}
            className="group bg-surface border border-border rounded-2xl p-5 flex items-center gap-4 text-right w-full transition-all hover:border-border-strong hover:-translate-y-0.5 hover:shadow-lg"
          >
            <div className="w-11 h-11 rounded-xl bg-accent-50 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <BarChart3 size={19} className="text-accent" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-cairo font-extrabold text-base text-text">التقارير</p>
              <p className="font-cairo text-xs text-text-muted mt-0.5">تقارير المشتريات والمبيعات مع إمكانية التصدير</p>
            </div>
            <ArrowLeft size={15} className="text-text-subtle group-hover:text-accent group-hover:-translate-x-1 transition-all" />
          </button>

          {prefs.showSubscriptionSummary && <SubscriptionWidget />}
          {prefs.showRecentOrders && <RecentOrders orders={orders} loading={loading} />}
        </div>
      </div>

    </div>
  )
}
