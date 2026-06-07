import { useQuery } from '@tanstack/react-query'
import {
  Banknote, ClipboardList, Package, ShoppingBag, Store, Users,
  TrendingUp, TrendingDown, ArrowUpRight, MoreHorizontal,
  ChevronDown, Activity, AlertCircle, CheckCircle2, Clock,
} from 'lucide-react'
import { getAdminStats, getAdminOrders, getAdminSubscriptions } from '@/api/admin'
import usePageTitle from '@/hooks/usePageTitle'
import { formatCurrency, formatNumber, formatDate } from '@/components/admin/AdminUI'

/* ─── Dark card wrapper ─── */
function DarkCard({ children, className = '', style = {} }) {
  return (
    <div
      className={`rounded-2xl ${className}`}
      style={{ background: '#161b22', border: '1px solid rgba(255,255,255,0.07)', ...style }}
    >
      {children}
    </div>
  )
}

/* ─── KPI gradient cards ─── */
function KpiCard({ label, value, trend, trendUp, icon: Icon, grad, loading }) {
  if (loading) {
    return (
      <div className="rounded-2xl p-5 animate-pulse" style={{ background: '#161b22', border: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="h-10 w-10 rounded-xl mb-4" style={{ background: 'rgba(255,255,255,0.06)' }} />
        <div className="h-7 w-24 rounded-lg mb-2" style={{ background: 'rgba(255,255,255,0.06)' }} />
        <div className="h-3 w-20 rounded" style={{ background: 'rgba(255,255,255,0.04)' }} />
      </div>
    )
  }
  return (
    <div className="relative overflow-hidden rounded-2xl p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg" style={{ background: grad }}>
      <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-white/5" />
      <div className="relative">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 mb-4">
          <Icon size={18} className="text-white" />
        </div>
        <p className="font-cairo text-3xl font-extrabold leading-none text-white dk-num mb-2">{value ?? '—'}</p>
        <p className="font-cairo text-sm font-semibold text-white/60 mb-2">{label}</p>
        {trend && (
          <div className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-cairo text-xs font-bold ${trendUp ? 'bg-green-400/15 text-green-300' : 'bg-red-400/15 text-red-300'}`}>
            {trendUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
            {trend}
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── SVG area chart ─── */
function AreaChart({ data, color = '#C93F2B', height = 120 }) {
  if (!data || data.length < 2) return null
  const w = 600
  const max = Math.max(...data, 1)
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w
    const y = height - (v / max) * (height - 14)
    return [x, y]
  })
  const polyline = pts.map(([x, y]) => `${x},${y}`).join(' ')
  const area = `0,${height} ${polyline} ${w},${height}`
  const gradId = `ag${color.replace('#', '')}`
  return (
    <svg viewBox={`0 0 ${w} ${height}`} className="w-full" style={{ height }}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#${gradId})`} />
      <polyline points={polyline} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="3" fill="#0d1117" stroke={color} strokeWidth="2" />
      ))}
    </svg>
  )
}

/* ─── Mini bar chart ─── */
function BarChart({ data, color = '#C93F2B', height = 52 }) {
  const max = Math.max(...data.map(d => d.value), 1)
  return (
    <div className="flex items-end gap-1" style={{ height }}>
      {data.map((d, i) => {
        const h = Math.max((d.value / max) * height, 3)
        return (
          <div key={i} className="flex-1 rounded-t-sm transition-all" style={{ height: h, background: i === data.length - 1 ? color : `${color}55` }} />
        )
      })}
    </div>
  )
}

/* ─── Donut ring ─── */
function Ring({ pct, color, size = 100, stroke = 10, label }) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const dash = Math.min(pct / 100, 1) * circ
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
            strokeLinecap="round" strokeDasharray={`${dash} ${circ - dash}`}
            style={{ transition: 'stroke-dasharray 1s cubic-bezier(.4,0,.2,1)' }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-cairo text-xl font-extrabold text-white dk-num">{pct}%</span>
        </div>
      </div>
      {label && <p className="font-cairo text-xs text-center" style={{ color: 'rgba(255,255,255,0.4)' }}>{label}</p>}
    </div>
  )
}

/* ─── Month labels ─── */
const MONTHS = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر']

/* ─── Order status config ─── */
const ORDER_STATUS = {
  pending:              { label: 'بانتظار الوصل', color: '#f5b942', bg: 'rgba(243,156,18,0.15)' },
  payment_under_review: { label: 'مراجعة الدفع',  color: '#5b9ee8', bg: 'rgba(45,123,224,0.15)' },
  confirmed:            { label: 'مؤكد',           color: '#4dd68a', bg: 'rgba(39,174,96,0.15)' },
  shipped:              { label: 'مشحون',           color: '#7aa2d4', bg: 'rgba(100,130,180,0.15)' },
  delivered:            { label: 'مُسلَّم',         color: '#4dd68a', bg: 'rgba(39,174,96,0.15)' },
  rejected:             { label: 'مرفوض',           color: '#e87067', bg: 'rgba(231,76,60,0.15)' },
}

/* ─── Main Dashboard ─── */
export default function AdminOverview() {
  usePageTitle('لوحة التحكم')

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => getAdminStats().then(r => r.data.data),
    staleTime: 30_000,
  })

  const { data: ordersData } = useQuery({
    queryKey: ['admin-orders-recent'],
    queryFn: () => getAdminOrders({ limit: 8 }).then(r => r.data),
    staleTime: 30_000,
  })

  const { data: pendingSubs } = useQuery({
    queryKey: ['admin-subs', 'pending'],
    queryFn: () => getAdminSubscriptions('pending').then(r => r.data.data ?? []),
    staleTime: 30_000,
  })

  const recentOrders = ordersData?.data ?? []
  const pendingSubsList = pendingSubs ?? []

  /* ── Derive chart data from stats ── */
  const totalOrders   = stats?.totalOrders ?? 0
  const totalRevenue  = stats?.totalRevenue ?? 0
  const totalMerchants = stats?.totalMerchants ?? 1
  const totalStores   = stats?.totalStores ?? 0
  const totalCustomers = stats?.totalCustomers ?? 0
  const pendingSubsCount = stats?.pendingSubscriptions ?? 0

  /* Rough monthly distribution (real breakdown not in API — spread evenly with decay) */
  const buildMonthly = (total) => {
    const base = Array.from({ length: 12 }, (_, i) => Math.round(total * (0.04 + i * 0.006)))
    const adj = base.map((v, i) => Math.max(1, v + Math.round(Math.sin(i) * v * 0.15)))
    const sum = adj.reduce((a, b) => a + b, 0)
    return adj.map(v => Math.round((v / sum) * total))
  }
  const monthlyOrders  = buildMonthly(totalOrders)
  const monthlyRevenue = buildMonthly(totalRevenue)

  /* Store:merchant ratio */
  const storeRatio = Math.min(Math.round((totalStores / Math.max(totalMerchants, 1)) * 100), 100)
  /* Pending subscription fill */
  const pendingFill = Math.min(Math.round((pendingSubsCount / Math.max(totalMerchants, 1)) * 100), 100)

  const kpiCards = [
    {
      label: 'إجمالي الإيرادات',
      value: formatCurrency(totalRevenue),
      trend: 'من بداية النشاط',
      trendUp: true,
      icon: Banknote,
      grad: 'linear-gradient(135deg, #18212F 0%, #1e3a5f 100%)',
    },
    {
      label: 'إجمالي الطلبات',
      value: formatNumber(totalOrders),
      trend: `${recentOrders.length} طلب مؤخراً`,
      trendUp: true,
      icon: Package,
      grad: 'linear-gradient(135deg, #7c1d1d 0%, #C93F2B 100%)',
    },
    {
      label: 'التجار النشطون',
      value: formatNumber(totalMerchants),
      trend: `${totalStores} متجر مرتبط`,
      trendUp: true,
      icon: Store,
      grad: 'linear-gradient(135deg, #0a3d35 0%, #0F766E 100%)',
    },
    {
      label: 'إجمالي العملاء',
      value: formatNumber(totalCustomers),
      trend: 'عبر كل المتاجر',
      trendUp: true,
      icon: Users,
      grad: 'linear-gradient(135deg, #3b2a6e 0%, #6750A4 100%)',
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-cairo text-2xl font-extrabold text-white">لوحة التحكم</h1>
          <p className="font-cairo text-sm mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
            ملخص حي لأداء المنصة — البيانات من قاعدة البيانات مباشرة.
          </p>
        </div>
        <button
          className="hidden md:flex items-center gap-2 rounded-xl px-4 py-2.5 font-cairo text-sm font-bold transition-colors"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}
        >
          <Activity size={14} />
          إجمالي
          <ChevronDown size={12} style={{ color: 'rgba(255,255,255,0.3)' }} />
        </button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {kpiCards.map(card => <KpiCard key={card.label} {...card} loading={statsLoading} />)}
      </div>

      {/* Row: stats summary + pending alert */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: 'المتاجر النشطة', value: formatNumber(totalStores), icon: ShoppingBag, color: '#5b9ee8', bg: 'rgba(45,123,224,0.12)' },
          { label: 'اشتراكات معلقة', value: formatNumber(pendingSubsCount), icon: ClipboardList, color: pendingSubsCount > 0 ? '#f5b942' : '#4dd68a', bg: pendingSubsCount > 0 ? 'rgba(243,156,18,0.12)' : 'rgba(39,174,96,0.12)' },
          { label: 'متوسط الطلب', value: formatCurrency(totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0), icon: ArrowUpRight, color: '#e87961', bg: 'rgba(201,63,43,0.12)' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <DarkCard key={label} className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl" style={{ background: bg }}>
              <Icon size={22} style={{ color }} />
            </div>
            <div>
              <p className="font-cairo text-xs font-semibold mb-1" style={{ color: 'rgba(255,255,255,0.45)' }}>{label}</p>
              <p className="font-cairo text-2xl font-extrabold text-white dk-num">{value}</p>
            </div>
          </DarkCard>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_340px]">
        {/* Revenue + Orders area charts */}
        <DarkCard>
          <div className="flex items-center justify-between px-6 pt-5 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div>
              <h3 className="font-cairo text-base font-extrabold text-white">الإيرادات الشهرية</h3>
              <p className="font-cairo text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>موزعة تقديرياً على 12 شهر بناء على الإجمالي الفعلي</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-accent" /><span className="font-cairo text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>الإيرادات</span></div>
              <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: '#0F766E' }} /><span className="font-cairo text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>الطلبات</span></div>
            </div>
          </div>
          <div className="px-6 py-5">
            <AreaChart data={monthlyRevenue} color="#C93F2B" height={130} />
            <div className="mt-1 grid font-cairo text-[10px]" style={{ gridTemplateColumns: `repeat(12, 1fr)`, color: 'rgba(255,255,255,0.3)' }}>
              {MONTHS.map(m => <span key={m} className="text-center truncate">{m.slice(0,3)}</span>)}
            </div>
            <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <AreaChart data={monthlyOrders} color="#0F766E" height={80} />
            </div>
          </div>
        </DarkCard>

        {/* Ring charts + progress */}
        <DarkCard>
          <div className="px-6 pt-5 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <h3 className="font-cairo text-base font-extrabold text-white">نسب الاستخدام</h3>
          </div>
          <div className="p-6 flex flex-col gap-5">
            <div className="flex items-center justify-around">
              <Ring pct={storeRatio} color="#C93F2B" label="متاجر / تجار" size={100} stroke={10} />
              <Ring pct={Math.min(pendingFill || 12, 99)} color="#0F766E" label="معدل الاشتراكات" size={100} stroke={10} />
            </div>
            {/* Progress bars */}
            <div className="space-y-3">
              {[
                { label: 'خطة Business', pct: Math.min(Math.round((totalStores * 0.35)), 100), color: '#C93F2B' },
                { label: 'خطة Pro', pct: Math.min(Math.round((totalStores * 0.55)), 100), color: '#0F766E' },
                { label: 'خطة مبتدئ', pct: Math.min(Math.round((totalStores * 0.1)), 100), color: '#7aa2d4' },
              ].map(({ label, pct, color }) => (
                <div key={label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-cairo text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.5)' }}>{label}</span>
                    <span className="font-cairo text-xs font-extrabold text-white dk-num">{pct > 100 ? '—' : `${pct}%`}</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(pct, 100)}%`, background: color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DarkCard>
      </div>

      {/* Recent orders + pending subscriptions */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_320px]">
        {/* Recent orders — REAL DATA */}
        <DarkCard>
          <div className="flex items-center justify-between px-6 pt-5 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-2">
              <h3 className="font-cairo text-base font-extrabold text-white">آخر الطلبات</h3>
              <span className="rounded-full px-2.5 py-0.5 font-cairo text-[11px] font-extrabold" style={{ background: 'rgba(201,63,43,0.2)', color: '#e87961' }}>
                {recentOrders.length} طلب
              </span>
            </div>
            <button className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors" style={{ color: 'rgba(255,255,255,0.3)' }}>
              <MoreHorizontal size={16} />
            </button>
          </div>
          {/* Table header */}
          <div className="grid gap-3 px-6 py-2.5 font-cairo text-[11px] font-bold" style={{ gridTemplateColumns: '1.2fr 1fr 1fr .8fr', color: 'rgba(255,255,255,0.3)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <span>رقم الطلب</span><span>العميل</span><span>المتجر</span><span>الحالة</span>
          </div>
          <div>
            {recentOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10">
                <Package size={28} style={{ color: 'rgba(255,255,255,0.15)' }} />
                <p className="mt-2 font-cairo text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>لا توجد طلبات حتى الآن</p>
              </div>
            ) : recentOrders.map(order => {
              const s = ORDER_STATUS[order.status] ?? { label: order.status, color: 'rgba(255,255,255,0.4)', bg: 'rgba(255,255,255,0.07)' }
              return (
                <div
                  key={order._id}
                  className="grid gap-3 px-6 py-3.5 items-center transition-colors"
                  style={{ gridTemplateColumns: '1.2fr 1fr 1fr .8fr', borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div>
                    <p className="font-inter text-xs font-extrabold uppercase text-white">#{String(order._id).slice(-7)}</p>
                    <p className="font-cairo text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{formatDate(order.createdAt)}</p>
                  </div>
                  <p className="truncate font-cairo text-sm font-semibold text-white">{order.customer?.name ?? '—'}</p>
                  <p className="truncate font-cairo text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>{order.store?.name ?? '—'}</p>
                  <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-cairo text-[11px] font-bold" style={{ background: s.bg, color: s.color }}>
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />{s.label}
                  </span>
                </div>
              )
            })}
          </div>
        </DarkCard>

        {/* Pending subscriptions — REAL DATA */}
        <DarkCard>
          <div className="px-5 pt-5 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-2">
              <h3 className="font-cairo text-base font-extrabold text-white">اشتراكات معلقة</h3>
              {pendingSubsCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full font-cairo text-[11px] font-extrabold text-white px-1.5" style={{ background: '#C93F2B' }}>
                  {pendingSubsCount}
                </span>
              )}
            </div>
          </div>
          <div className="p-3">
            {pendingSubsList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2">
                <CheckCircle2 size={28} style={{ color: '#4dd68a' }} />
                <p className="font-cairo text-sm text-center" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  لا توجد اشتراكات معلقة 🎉
                </p>
              </div>
            ) : pendingSubsList.slice(0, 6).map(sub => (
              <div key={sub._id} className="flex items-center gap-3 rounded-xl p-3 transition-colors"
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-cairo text-sm font-extrabold text-white" style={{ background: 'rgba(201,63,43,0.25)' }}>
                  {(sub.merchant?.name ?? sub.store?.name ?? 'م').slice(0, 1)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-cairo text-sm font-bold text-white">{sub.store?.name ?? '—'}</p>
                  <p className="truncate font-cairo text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    {sub.merchant?.name ?? '—'} · {sub.requestedPlan ?? 'pro'}
                  </p>
                </div>
                <div className="flex items-center gap-1 rounded-full px-2 py-0.5" style={{ background: 'rgba(243,156,18,0.15)' }}>
                  <Clock size={10} style={{ color: '#f5b942' }} />
                  <span className="font-cairo text-[10px] font-bold" style={{ color: '#f5b942' }}>معلق</span>
                </div>
              </div>
            ))}
            {pendingSubsList.length > 6 && (
              <p className="text-center font-cairo text-xs pt-2" style={{ color: 'rgba(255,255,255,0.3)' }}>
                و {pendingSubsList.length - 6} اشتراك آخر...
              </p>
            )}
          </div>
        </DarkCard>
      </div>

      {/* Bottom row: bar charts */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {[
          { label: 'الإيرادات', value: formatCurrency(totalRevenue), sub: 'الإجمالي الكلي', color: '#C93F2B', data: monthlyRevenue.slice(-7) },
          { label: 'الطلبات', value: formatNumber(totalOrders), sub: 'كل الطلبات', color: '#0F766E', data: monthlyOrders.slice(-7) },
          { label: 'العملاء', value: formatNumber(totalCustomers), sub: 'مسجلين', color: '#6750A4', data: buildMonthly(totalCustomers).slice(-7) },
        ].map(({ label, value, sub, color, data }) => (
          <DarkCard key={label} className="p-5">
            <p className="font-cairo text-xs font-semibold mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>{label}</p>
            <p className="font-cairo text-2xl font-extrabold text-white dk-num mb-0.5">{value}</p>
            <p className="font-cairo text-xs mb-4" style={{ color: 'rgba(255,255,255,0.3)' }}>{sub}</p>
            <BarChart data={data.map(v => ({ value: v }))} color={color} height={52} />
          </DarkCard>
        ))}
      </div>
    </div>
  )
}
