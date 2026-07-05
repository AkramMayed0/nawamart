import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  Plus, Send, Clock, Trash2, ToggleLeft, ToggleRight,
} from 'lucide-react'
import { getReports, createReport, deleteReport, sendReportNow, toggleReportSchedule } from '@/api/report'
import usePageTitle from '@/hooks/usePageTitle'
import {
  PageHeader, DataTable, TableRow, StatusBadge, ActionButton, Modal,
} from '@/components/admin/AdminUI'
import { formatDate } from '@/components/admin/AdminUI'

const FREQ_LABELS = {
  daily: 'يومي',
  weekly: 'أسبوعي',
  monthly: 'شهري',
  quarterly: 'ربع سنوي',
}

export default function AdminReports() {
  usePageTitle('التقارير المبرمجة')
  const queryClient = useQueryClient()
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({
    name: '',
    description: '',
    scope: 'platform',
    config: { metrics: [], chartType: 'table', dateRange: { preset: 'last30days' } },
    schedule: { enabled: false, frequency: 'weekly', recipients: '', format: 'email_html' },
  })

  const { data, isLoading } = useQuery({
    queryKey: ['admin-reports'],
    queryFn: () => getReports({ scope: 'platform' }).then(r => r.data),
    staleTime: 30_000,
  })

  const createMutation = useMutation({
    mutationFn: () => {
      const payload = {
        ...form,
        schedule: {
          ...form.schedule,
          recipients: form.schedule.recipients.split(',').map(s => s.trim()).filter(Boolean),
        },
      }
      return createReport(payload).then(r => r.data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reports'] })
      setShowCreate(false)
      toast.success('تم إنشاء التقرير بنجاح')
    },
    onError: (err) => toast.error(err.response?.data?.message || 'فشل إنشاء التقرير'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteReport(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reports'] })
      toast.success('تم حذف التقرير')
    },
    onError: (err) => toast.error(err.response?.data?.message || 'فشل حذف التقرير'),
  })

  const sendMutation = useMutation({
    mutationFn: (id) => sendReportNow(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reports'] })
      toast.success('تم إرسال التقرير')
    },
    onError: (err) => toast.error(err.response?.data?.message || 'فشل إرسال التقرير'),
  })

  const toggleMutation = useMutation({
    mutationFn: (id) => toggleReportSchedule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reports'] })
      toast.success('تم تحديث جدولة التقرير')
    },
    onError: (err) => toast.error(err.response?.data?.message || 'فشل تحديث الجدولة'),
  })

  const reports = data?.data ?? []

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="التقارير المبرمجة"
        subtitle="إنشاء وإدارة التقارير الدورية وجدولة إرسالها عبر البريد الإلكتروني"
      >
        <ActionButton icon={Plus} onClick={() => setShowCreate(true)} tone="primary">
          تقرير جديد
        </ActionButton>
      </PageHeader>

      <DataTable
        columns="1.5fr 1fr 1fr 1fr 100px 80px"
        headers={['اسم التقرير', 'النطاق', 'الجداولة', 'آخر إرسال', 'الحالة', 'الإجراءات']}
        isLoading={isLoading}
        isEmpty={reports.length === 0}
        emptyTitle="لا توجد تقارير"
        emptyMessage="قم بإنشاء تقرير جديد للبدء"
      >
        {reports.map((report) => (
          <TableRow key={report._id} columns="1.5fr 1fr 1fr 1fr 100px 80px">
            <div>
              <p className="font-cairo text-sm font-bold text-white truncate">{report.name}</p>
              {report.description && (
                <p className="font-cairo text-xs truncate" style={{ color: 'rgba(255,255,255,0.4)' }}>{report.description}</p>
              )}
            </div>
            <span className="font-cairo text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
              {report.scope === 'platform' ? 'المنصة' : report.scope === 'merchant' ? 'تاجر' : 'متجر'}
            </span>
            <div>
              {report.schedule?.enabled ? (
                <div className="flex items-center gap-1.5">
                  <Clock size={12} style={{ color: '#4dd68a' }} />
                  <span className="font-cairo text-xs" style={{ color: '#4dd68a' }}>
                    {FREQ_LABELS[report.schedule.frequency] || report.schedule.frequency}
                  </span>
                </div>
              ) : (
                <span className="font-cairo text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>غير مفعل</span>
              )}
            </div>
            <span className="font-cairo text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
              {report.lastSentAt ? formatDate(report.lastSentAt) : '—'}
            </span>
            <StatusBadge label={report.isActive ? 'نشط' : 'موقوف'} tone={report.isActive ? 'success' : 'neutral'} />
            <div className="flex items-center gap-1">
              <ActionButton
                icon={Send}
                tone="info"
                onClick={() => sendMutation.mutate(report._id)}
              />
              <ActionButton
                icon={report.schedule?.enabled ? ToggleRight : ToggleLeft}
                tone={report.schedule?.enabled ? 'success' : 'neutral'}
                onClick={() => toggleMutation.mutate(report._id)}
              />
              <ActionButton
                icon={Trash2}
                tone="danger"
                onClick={() => { if (confirm('هل أنت متأكد من حذف هذا التقرير؟')) deleteMutation.mutate(report._id) }}
              />
            </div>
          </TableRow>
        ))}
      </DataTable>

      {/* Create Modal */}
      {showCreate && (
        <Modal
          title="تقرير جديد"
          description="قم بإعداد تقرير دوري وجدولة إرساله"
          onClose={() => setShowCreate(false)}
          footer={
            <div className="flex gap-2">
              <button
                onClick={() => setShowCreate(false)}
                className="rounded-xl px-4 py-2 font-cairo text-sm font-bold transition-colors"
                style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)' }}
              >
                إلغاء
              </button>
              <button
                onClick={() => createMutation.mutate()}
                disabled={createMutation.isLoading || !form.name}
                className="rounded-xl px-4 py-2 font-cairo text-sm font-bold text-white transition-colors disabled:opacity-40"
                style={{ background: '#C93F2B' }}
              >
                {createMutation.isLoading ? 'جاري...' : 'إنشاء التقرير'}
              </button>
            </div>
          }
        >
          <div className="space-y-4">
            <div>
              <label className="block font-cairo text-sm font-bold mb-1" style={{ color: 'rgba(255,255,255,0.6)' }}>اسم التقرير *</label>
              <input
                value={form.name}
                onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="مثال: تقرير الإيرادات الشهري"
                className="w-full rounded-xl px-4 py-2.5 font-cairo text-sm outline-none transition-all"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.8)' }}
              />
            </div>
            <div>
              <label className="block font-cairo text-sm font-bold mb-1" style={{ color: 'rgba(255,255,255,0.6)' }}>الوصف</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="وصف التقرير..."
                rows={2}
                className="w-full rounded-xl px-4 py-2.5 font-cairo text-sm outline-none transition-all resize-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.8)' }}
              />
            </div>
            <div>
              <label className="block font-cairo text-sm font-bold mb-1" style={{ color: 'rgba(255,255,255,0.6)' }}>نطاق التقرير</label>
              <select
                value={form.scope}
                onChange={(e) => setForm(f => ({ ...f, scope: e.target.value }))}
                className="w-full rounded-xl px-4 py-2.5 font-cairo text-sm outline-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.8)' }}
              >
                <option value="platform">المنصة</option>
                <option value="merchant">تاجر</option>
                <option value="store">متجر</option>
              </select>
            </div>
            <div>
              <label className="block font-cairo text-sm font-bold mb-1" style={{ color: 'rgba(255,255,255,0.6)' }}>جدولة الإرسال</label>
              <div className="flex items-center gap-3">
                <select
                  value={form.schedule.frequency}
                  onChange={(e) => setForm(f => ({ ...f, schedule: { ...f.schedule, frequency: e.target.value, enabled: true } }))}
                  className="flex-1 rounded-xl px-4 py-2.5 font-cairo text-sm outline-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.8)' }}
                >
                  <option value="daily">يومي</option>
                  <option value="weekly">أسبوعي</option>
                  <option value="monthly">شهري</option>
                  <option value="quarterly">ربع سنوي</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block font-cairo text-sm font-bold mb-1" style={{ color: 'rgba(255,255,255,0.6)' }}>المستلمون (بريد مفصول بفاصلة)</label>
              <input
                value={form.schedule.recipients}
                onChange={(e) => setForm(f => ({ ...f, schedule: { ...f.schedule, recipients: e.target.value } }))}
                placeholder="admin@example.com, manager@example.com"
                className="w-full rounded-xl px-4 py-2.5 font-cairo text-sm outline-none transition-all"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.8)' }}
              />
            </div>
            <div>
              <label className="block font-cairo text-sm font-bold mb-1" style={{ color: 'rgba(255,255,255,0.6)' }}>صيغة التقرير</label>
              <select
                value={form.schedule.format}
                onChange={(e) => setForm(f => ({ ...f, schedule: { ...f.schedule, format: e.target.value } }))}
                className="w-full rounded-xl px-4 py-2.5 font-cairo text-sm outline-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.8)' }}
              >
                <option value="email_html">بريد إلكتروني (HTML)</option>
                <option value="csv">ملف CSV</option>
                <option value="json">JSON</option>
              </select>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
