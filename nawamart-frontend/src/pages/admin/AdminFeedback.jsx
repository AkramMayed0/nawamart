import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  ThumbsUp, MessageSquare, Lightbulb, Bug, BarChart3,
  TrendingUp, TrendingDown, Minus,
} from 'lucide-react'
import { getFeedbackStats, getNPSReport, getFeatureRequests, getAllFeedback, updateFeatureRequestStatus } from '@/api/feedback'
import usePageTitle from '@/hooks/usePageTitle'
import {
  AdminCard, PageHeader, StatCard, DataTable, TableRow, StatusBadge,
  ActionButton, FilterPills,
} from '@/components/admin/AdminUI'
import { formatDate } from '@/components/admin/AdminUI'

const FEATURE_STATUS = {
  under_review: { label: 'قيد المراجعة', color: '#f5b942', bg: 'rgba(243,156,18,0.15)' },
  planned: { label: 'مخطط', color: '#5b9ee8', bg: 'rgba(45,123,224,0.15)' },
  in_progress: { label: 'قيد التنفيذ', color: '#e87961', bg: 'rgba(201,63,43,0.18)' },
  completed: { label: 'تم', color: '#4dd68a', bg: 'rgba(39,174,96,0.15)' },
  declined: { label: 'مرفوض', color: 'rgba(255,255,255,0.4)', bg: 'rgba(255,255,255,0.07)' },
}

const NPS_CATEGORIES = {
  promoter: { label: 'مروجون', icon: TrendingUp, color: '#4dd68a' },
  passive: { label: 'محايدون', icon: Minus, color: '#f5b942' },
  detractor: { label: 'منتقدون', icon: TrendingDown, color: '#e87067' },
}

export default function AdminFeedback() {
  usePageTitle('الملاحظات')
  const [tab, setTab] = useState('overview')
  const queryClient = useQueryClient()

  const { data: stats } = useQuery({
    queryKey: ['admin-feedback-stats'],
    queryFn: () => getFeedbackStats().then(r => r.data.data),
    staleTime: 60_000,
  })

  const { data: nps } = useQuery({
    queryKey: ['admin-nps-report'],
    queryFn: () => getNPSReport().then(r => r.data.data),
    staleTime: 60_000,
  })

  const { data: features } = useQuery({
    queryKey: ['admin-feature-requests'],
    queryFn: () => getFeatureRequests().then(r => r.data.data),
    staleTime: 30_000,
  })

  const { data: allFeedback } = useQuery({
    queryKey: ['admin-all-feedback'],
    queryFn: () => getAllFeedback({ limit: 50 }).then(r => r.data),
    staleTime: 30_000,
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status, response }) => updateFeatureRequestStatus(id, status, response),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-feature-requests'] })
      toast.success('تم تحديث الحالة')
    },
    onError: (err) => toast.error(err.response?.data?.message || 'فشل التحديث'),
  })

  const renderOverview = () => (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={MessageSquare} label="إجمالي الملاحظات" value={stats?.total} tone="primary" loading={!stats} />
        <StatCard icon={ThumbsUp} label="NPS" value={nps?.npsScore ?? '—'} tone={nps?.npsScore >= 0 ? 'success' : 'danger'} loading={!nps} sub={nps?.totalResponses ? `من ${nps.totalResponses} رد` : ''} />
        <StatCard icon={Lightbulb} label="طلبات الميزات" value={stats?.byType?.featureRequest} tone="info" loading={!stats} />
        <StatCard icon={Bug} label="بلاغات أخطاء" value={stats?.byType?.bugReport} tone="danger" loading={!stats} />
      </div>

      {/* NPS Breakdown */}
      <AdminCard>
        <div className="mb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', margin: '0 -1.25rem', padding: '0 1.25rem 1rem' }}>
          <h3 className="font-cairo text-base font-extrabold text-white">توزيع NPS</h3>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {Object.entries(NPS_CATEGORIES).map(([key, cfg]) => {
            const count = nps?.distribution?.[key] ?? 0
            const pct = nps?.totalResponses ? Math.round((count / nps.totalResponses) * 100) : 0
            return (
              <div key={key} className="text-center">
                <cfg.icon size={24} style={{ color: cfg.color }} className="mx-auto mb-2" />
                <p className="font-cairo text-2xl font-extrabold text-white dk-num">{count}</p>
                <p className="font-cairo text-sm" style={{ color: cfg.color }}>{cfg.label}</p>
                <p className="font-cairo text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>{pct}%</p>
              </div>
            )
          })}
        </div>
        <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center justify-between text-sm">
            <span className="font-cairo" style={{ color: 'rgba(255,255,255,0.5)' }}>آخر 30 يوم: {nps?.npsLast30Days ?? '—'}</span>
            <span className="font-cairo" style={{ color: 'rgba(255,255,255,0.5)' }}>آخر 90 يوم: {nps?.npsLast90Days ?? '—'}</span>
          </div>
        </div>
      </AdminCard>
    </div>
  )

  const renderFeatures = () => (
    <DataTable
      columns="1.5fr 1fr 100px 120px"
      headers={['الميزة', 'التصنيف', 'الأصوات', 'الحالة']}
      isLoading={!features}
      isEmpty={!features?.length}
      emptyTitle="لا توجد طلبات ميزات"
      emptyMessage="لم يتم تقديم أي طلبات ميزات بعد"
    >
      {(features ?? []).map((f) => {
        const st = FEATURE_STATUS[f.status] || FEATURE_STATUS.under_review
        return (
          <TableRow key={f._id} columns="1.5fr 1fr 100px 120px">
            <div>
              <p className="font-cairo text-sm font-bold text-white">{f.featureTitle}</p>
              {f.featureDescription && <p className="font-cairo text-xs mt-0.5 text-white/40 truncate">{f.featureDescription}</p>}
            </div>
            <span className="font-cairo text-sm text-white/55">{f.featureCategory || '—'}</span>
            <span className="font-cairo text-lg font-extrabold text-white dk-num">{f.votes ?? 0}</span>
            <div className="flex items-center gap-2">
              <StatusBadge label={st.label} tone={f.status === 'completed' ? 'success' : f.status === 'planned' ? 'info' : f.status === 'declined' ? 'neutral' : 'warning'} />
              <select
                value={f.status}
                onChange={(e) => statusMutation.mutate({ id: f._id, status: e.target.value })}
                className="rounded-lg px-2 py-1 font-cairo text-[10px] outline-none"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }}
              >
                <option value="under_review">قيد المراجعة</option>
                <option value="planned">مخطط</option>
                <option value="in_progress">قيد التنفيذ</option>
                <option value="completed">تم</option>
                <option value="declined">مرفوض</option>
              </select>
            </div>
          </TableRow>
        )
      })}
    </DataTable>
  )

  const renderRecent = () => (
    <DataTable
      columns="1.5fr 1fr 100px 1fr"
      headers={['من', 'النوع', 'التقييم', 'الرسالة']}
      isLoading={!allFeedback}
      isEmpty={!allFeedback?.data?.length}
      emptyTitle="لا توجد ملاحظات"
    >
      {(allFeedback?.data ?? []).slice(0, 30).map((f) => (
        <TableRow key={f._id} columns="1.5fr 1fr 100px 1fr">
          <span className="font-cairo text-sm text-white truncate">{f.merchant?.name || f.customer?.name || f.email || '—'}</span>
          <StatusBadge label={f.feedbackType === 'general' ? 'عام' : f.feedbackType === 'bug_report' ? 'بلاغ خطأ' : f.feedbackType} />
          <span className="font-cairo text-lg font-extrabold text-white dk-num">{f.rating || f.npsScore || '—'}</span>
          <p className="font-cairo text-sm text-white/55 truncate">{f.message || '—'}</p>
        </TableRow>
      ))}
    </DataTable>
  )

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="الملاحظات والتقييمات" subtitle="جمع وتحليل ملاحظات التجار والعملاء">
        <FilterPills options={[
          { id: 'overview', label: 'نظرة عامة' },
          { id: 'features', label: 'طلبات الميزات' },
          { id: 'recent', label: 'أحدث الملاحظات' },
        ]} value={tab} onChange={setTab} />
      </PageHeader>

      {tab === 'overview' && renderOverview()}
      {tab === 'features' && renderFeatures()}
      {tab === 'recent' && renderRecent()}
    </div>
  )
}
