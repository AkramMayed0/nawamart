import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Heart, AlertTriangle, Activity, Users,
} from 'lucide-react'
import { getHealthScores, getHealthOverview } from '@/api/analytics'
import usePageTitle from '@/hooks/usePageTitle'
import {
  PageHeader, StatCard, SearchInput, DataTable, TableRow, StatusBadge, AdminCard,
} from '@/components/admin/AdminUI'

const TIER_CONFIG = {
  healthy: { label: 'سليم', color: '#4dd68a', bg: 'rgba(39,174,96,0.15)' },
  moderate: { label: 'متوسط', color: '#f5b942', bg: 'rgba(243,156,18,0.15)' },
  at_risk: { label: 'معرض للخطر', color: '#e87067', bg: 'rgba(231,76,60,0.15)' },
  critical: { label: 'حرج', color: '#ff4444', bg: 'rgba(255,68,68,0.15)' },
}

function HealthScoreRing({ score, size = 80 }) {
  const r = (size - 12) / 2
  const circ = 2 * Math.PI * r
  const dash = Math.min(score / 100, 1) * circ
  const color = score >= 80 ? '#4dd68a' : score >= 60 ? '#f5b942' : score >= 40 ? '#e87067' : '#ff4444'
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="8"
          strokeLinecap="round" strokeDasharray={`${dash} ${circ - dash}`}
          style={{ transition: 'stroke-dasharray 1s cubic-bezier(.4,0,.2,1)' }} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-cairo text-base font-extrabold text-white dk-num">{score}</span>
      </div>
    </div>
  )
}

function FlagBadge({ flag }) {
  const labels = {
    low_activity: 'نشاط منخفض',
    no_orders: 'لا توجد طلبات',
    no_live_store: 'لا يوجد متجر نشط',
    high_rejection_rate: 'نسبة رفض عالية',
    suspended: 'موقوف',
    no_products: 'لا توجد منتجات',
    no_customers: 'لا يوجد عملاء',
  }
  return (
    <span className="inline-flex items-center rounded-full px-2 py-0.5 font-cairo text-[10px] font-bold" style={{ background: 'rgba(231,76,60,0.15)', color: '#e87067' }}>
      {labels[flag] || flag}
    </span>
  )
}

export default function AdminHealthScores() {
  usePageTitle('درجات صحة التجار')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const { data: overview } = useQuery({
    queryKey: ['admin-health-overview'],
    queryFn: () => getHealthOverview().then(r => r.data.data),
    staleTime: 60_000,
  })

  const { data, isLoading } = useQuery({
    queryKey: ['admin-health-scores', page, search],
    queryFn: () => getHealthScores({ page, limit: 20, search }).then(r => r.data),
    keepPreviousData: true,
    staleTime: 30_000,
  })

  const scores = data?.data ?? []
  const pagination = data?.pagination ?? {}
  const ov = overview?.overview ?? {}

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="درجات صحة التجار"
        subtitle="تقييم صحة ونشاط التجار على المنصة — يتم حسابه بناءً على الطلبات، الإيرادات، النشاط، والمخزون"
      />

      {/* Overview Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={Users}
          label="إجمالي التجار"
          value={ov.totalMerchants}
          tone="primary"
          loading={!overview}
        />
        <StatCard
          icon={Heart}
          label="المتوسط العام"
          value={ov.averageScore}
          tone="success"
          sub="من 100"
          loading={!overview}
        />
        <StatCard
          icon={AlertTriangle}
          label="معرضون للخطر"
          value={ov.atRiskCount}
          tone="danger"
          loading={!overview}
        />
        <StatCard
          icon={Activity}
          label="سليم"
          value={ov.tierDistribution?.healthy ?? 0}
          tone="success"
          loading={!overview}
        />
      </div>

      {/* Tier Distribution Mini */}
      <AdminCard padding="sm">
        <div className="flex items-center justify-around py-2">
          {Object.entries(TIER_CONFIG).map(([key, cfg]) => {
            const count = ov.tierDistribution?.[key] ?? 0
            return (
              <div key={key} className="flex flex-col items-center gap-1">
                <span className="font-cairo text-lg font-extrabold text-white dk-num">{count}</span>
                <span className="font-cairo text-xs font-semibold" style={{ color: cfg.color }}>{cfg.label}</span>
              </div>
            )
          })}
        </div>
      </AdminCard>

      {/* Search */}
      <div className="flex items-center justify-between">
        <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1) }} placeholder="بحث عن تاجر..." />
        <span className="font-cairo text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>إجمالي: {pagination.total ?? 0}</span>
      </div>

      {/* Health Scores Table */}
      <DataTable
        columns="60px 1.5fr 80px 120px 1fr"
        headers={['', 'التاجر', 'الدرجة', 'المستوى', 'المؤشرات']}
        isLoading={isLoading}
        isEmpty={scores.length === 0}
        emptyTitle="لا توجد نتائج"
        emptyMessage="لم يتم العثور على تجار متطابقين"
      >
        {scores.map((item) => {
          const tier = TIER_CONFIG[item.tier] ?? TIER_CONFIG.moderate
          return (
            <TableRow key={item.merchantId} columns="60px 1.5fr 80px 120px 1fr">
              <HealthScoreRing score={item.score} size={48} />
              <div>
                <p className="font-cairo text-sm font-bold text-white truncate">{item.name ?? '—'}</p>
                <p className="font-cairo text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{item.email ?? ''}</p>
              </div>
              <span className="font-cairo text-lg font-extrabold text-white dk-num">{item.score}</span>
              <StatusBadge label={tier.label} tone={item.tier === 'healthy' ? 'success' : item.tier === 'moderate' ? 'warning' : 'danger'} />
              <div className="flex flex-wrap gap-1">
                {(item.flags ?? []).length === 0 ? (
                  <span className="font-cairo text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>—</span>
                ) : (item.flags ?? []).map(flag => <FlagBadge key={flag} flag={flag} />)}
              </div>
            </TableRow>
          )
        })}
      </DataTable>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="rounded-xl px-4 py-2 font-cairo text-sm font-bold transition-colors disabled:opacity-30"
            style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)' }}
          >
            السابق
          </button>
          <span className="font-cairo text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {page} / {pagination.pages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
            disabled={page >= pagination.pages}
            className="rounded-xl px-4 py-2 font-cairo text-sm font-bold transition-colors disabled:opacity-30"
            style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)' }}
          >
            التالي
          </button>
        </div>
      )}
    </div>
  )
}
