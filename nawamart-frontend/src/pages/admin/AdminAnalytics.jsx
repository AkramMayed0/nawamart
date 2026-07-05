import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Users, Store, ShoppingBag, DollarSign,
  Activity, HardDrive, Cpu,
} from 'lucide-react'
import { getPlatformOverview, getRevenueAnalytics, getUsageMetrics, getFeatureAdoption } from '@/api/analytics'
import usePageTitle from '@/hooks/usePageTitle'
import { PageHeader, FilterPills, AdminCard } from '@/components/admin/AdminUI'
import { formatCurrency, formatNumber } from '@/components/admin/AdminUI'

const PERIOD_FILTERS = [
  { id: 'daily', label: 'يومي' },
  { id: 'weekly', label: 'أسبوعي' },
  { id: 'monthly', label: 'شهري' },
]

function MetricCard({ label, value, icon: Icon, color, sub }) {
  return (
    <div className="rounded-2xl p-5 transition-transform hover:-translate-y-0.5" style={{ background: '#161b22', border: '1px solid rgba(255,255,255,0.07)' }}>
      <div className="flex items-center justify-between mb-3">
        <p className="font-cairo text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.45)' }}>{label}</p>
        <div className="flex h-8 w-8 items-center justify-center rounded-xl" style={{ background: `${color}20` }}>
          <Icon size={15} style={{ color }} />
        </div>
      </div>
      <p className="font-cairo text-2xl font-extrabold text-white dk-num">{value ?? '—'}</p>
      {sub && <p className="font-cairo text-xs mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>{sub}</p>}
    </div>
  )
}

function FeatureBar({ name, rate, active }) {
  return (
    <div className="flex items-center gap-3">
      <span className="font-cairo text-sm font-semibold text-white min-w-[120px]">{name}</span>
      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${Math.min(rate, 100)}%`, background: rate > 50 ? '#4dd68a' : rate > 20 ? '#f5b942' : '#e87067' }}
        />
      </div>
      <span className="font-cairo text-xs font-bold text-white dk-num min-w-[50px] text-left">{rate}%</span>
      <span className="font-cairo text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>({active})</span>
    </div>
  )
}

function SimpleBar({ data, color = '#C93F2B', height = 120 }) {
  if (!data || data.length < 2) return <p className="font-cairo text-sm py-8 text-center" style={{ color: 'rgba(255,255,255,0.3)' }}>بيانات غير كافية</p>
  const w = 600
  const max = Math.max(...data, 1)
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w
    const y = height - (v / max) * (height - 14)
    return [x, y]
  })
  const polyline = pts.map(([x, y]) => `${x},${y}`).join(' ')
  const area = `0,${height} ${polyline} ${w},${height}`
  const gradId = `ag${Math.random().toString(36).slice(2, 8)}`
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
    </svg>
  )
}

export default function AdminAnalytics() {
  usePageTitle('التحليلات')
  const [period, setPeriod] = useState('daily')

  const { data: overview } = useQuery({
    queryKey: ['admin-analytics-overview'],
    queryFn: () => getPlatformOverview().then(r => r.data.data),
    staleTime: 60_000,
  })

  const { data: revenue } = useQuery({
    queryKey: ['admin-analytics-revenue', period],
    queryFn: () => getRevenueAnalytics({ period }).then(r => r.data.data),
    staleTime: 60_000,
  })

  const { data: usage } = useQuery({
    queryKey: ['admin-analytics-usage'],
    queryFn: () => getUsageMetrics().then(r => r.data.data),
    staleTime: 120_000,
  })

  const { data: features } = useQuery({
    queryKey: ['admin-analytics-features'],
    queryFn: () => getFeatureAdoption().then(r => r.data.data),
    staleTime: 120_000,
  })

  const p = overview?.metrics?.platform ?? {}
  const r = overview?.metrics?.revenue ?? {}
  const monthlyRevenue = revenue?.monthlyBreakdown?.map(m => m.revenue) ?? []
  const churnData = revenue?.monthlyBreakdown?.map(m => m.churnRate ?? 0) ?? []

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="التحليلات والتقارير" subtitle="مقاييس شاملة لأداء المنصة ونموها">
        <div className="flex items-center gap-2">
          <FilterPills options={PERIOD_FILTERS} value={period} onChange={setPeriod} />
        </div>
      </PageHeader>

      {/* Platform Metrics */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard label="إجمالي التجار" value={formatNumber(p.totalMerchants)} icon={Users} color="#7aa2d4" sub={`+${p.newMerchants ?? 0} جديد`} />
        <MetricCard label="إجمالي المتاجر" value={formatNumber(p.totalStores)} icon={Store} color="#4dd68a" sub={`${p.activeStores ?? 0} نشط`} />
        <MetricCard label="إجمالي الطلبات" value={formatNumber(p.totalOrders)} icon={ShoppingBag} color="#e87961" sub={`+${p.newOrders ?? 0} جديد`} />
        <MetricCard label="إجمالي الإيرادات" value={formatCurrency(p.totalRevenue)} icon={DollarSign} color="#f5b942" sub={`MRR: ${formatCurrency(r.mrr)}`} />
      </div>

      {/* Revenue Analytics Row */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_320px]">
        <AdminCard padding="none">
          <div className="px-6 pt-5 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-cairo text-base font-extrabold text-white">الإيرادات الشهرية</h3>
                <p className="font-cairo text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>آخر 12 شهر</p>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-accent" />
                <span className="font-cairo text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>الإيرادات</span>
              </div>
            </div>
          </div>
          <div className="px-6 py-5">
            <SimpleBar data={monthlyRevenue.length > 0 ? monthlyRevenue : [0]} color="#C93F2B" />
          </div>
        </AdminCard>

        <AdminCard>
          <div className="mb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', margin: '0 -1.25rem', padding: '0 1.25rem 1rem' }}>
            <h3 className="font-cairo text-base font-extrabold text-white">مؤشرات الإيرادات</h3>
          </div>
          <div className="space-y-4">
            {[
              { label: 'MRR', value: formatCurrency(r.mrr), color: '#4dd68a' },
              { label: 'ARR', value: formatCurrency(r.arr), color: '#7aa2d4' },
              { label: 'معدل التغيير (Churn)', value: `${r.churnRate ?? 0}%`, color: r.churnRate > 5 ? '#e87067' : '#4dd68a' },
              { label: 'متوسط قيمة الطلب', value: formatCurrency(r.averageOrderValue), color: '#f5b942' },
              { label: 'معدل التحويل', value: `${r.conversionRate ?? 0}%`, color: '#5b9ee8' },
              { label: 'القيمة الدائمة (LTV)', value: formatCurrency(r.ltv), color: '#e87961' },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="font-cairo text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>{label}</span>
                <span className="font-cairo text-sm font-extrabold text-white dk-num" style={{ color }}>{value}</span>
              </div>
            ))}
          </div>
        </AdminCard>
      </div>

      {/* Usage + Features Row */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <AdminCard>
          <div className="mb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', margin: '0 -1.25rem', padding: '0 1.25rem 1rem' }}>
            <h3 className="font-cairo text-base font-extrabold text-white">استخدام الموارد</h3>
          </div>
          <div className="space-y-4">
            {[
              { label: 'إجمالي النطاق الترددي', value: `${usage?.totalBandwidthMb ?? 0} MB`, icon: Activity },
              { label: 'إجمالي التخزين', value: `${usage?.totalStorageMb ?? 0} MB`, icon: HardDrive },
              { label: 'متوسط النطاق لكل متجر', value: `${usage?.averageBandwidthPerStore ?? 0} MB`, icon: Cpu },
              { label: 'متوسط التخزين لكل متجر', value: `${usage?.averageStoragePerStore ?? 0} MB`, icon: HardDrive },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <Icon size={15} style={{ color: 'rgba(255,255,255,0.4)' }} />
                </div>
                <div className="flex-1">
                  <p className="font-cairo text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>{label}</p>
                  <p className="font-cairo text-sm font-extrabold text-white dk-num">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </AdminCard>

        <AdminCard>
          <div className="mb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', margin: '0 -1.25rem', padding: '0 1.25rem 1rem' }}>
            <div className="flex items-center justify-between">
              <h3 className="font-cairo text-base font-extrabold text-white">تبني الميزات</h3>
              <span className="font-cairo text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{features?.totalStores ?? 0} متجر</span>
            </div>
          </div>
          <div className="space-y-3">
            {(features?.features ?? []).length === 0 ? (
              <p className="font-cairo text-sm py-4 text-center" style={{ color: 'rgba(255,255,255,0.3)' }}>لا توجد بيانات متاحة</p>
            ) : (features?.features ?? []).map((f) => (
              <FeatureBar key={f.name} name={f.label} rate={f.adoptionRate} active={f.activeStores} />
            ))}
          </div>
        </AdminCard>
      </div>
    </div>
  )
}
