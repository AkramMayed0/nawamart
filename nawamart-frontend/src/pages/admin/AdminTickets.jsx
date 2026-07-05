import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  Ticket, MessageSquare, CheckCircle, Clock, AlertTriangle,
  ArrowUp, Send, Plus, Search, X,
} from 'lucide-react'
import { getTickets, getTicketById, addTicketMessage, changeTicketStatus, assignTicket, addInternalNote, getTicketStats } from '@/api/ticket'
import usePageTitle from '@/hooks/usePageTitle'
import {
  AdminCard, PageHeader, StatCard, DataTable, TableRow, StatusBadge,
  ActionButton, Modal, SearchInput, FilterPills,
} from '@/components/admin/AdminUI'
import { formatCurrency, formatNumber, formatDate } from '@/components/admin/AdminUI'

const STATUS_OPTS = [
  { id: '', label: 'الكل' },
  { id: 'open', label: 'مفتوحة' },
  { id: 'in_progress', label: 'قيد التنفيذ' },
  { id: 'waiting_on_merchant', label: 'بانتظار التاجر' },
  { id: 'resolved', label: 'تم الحل' },
  { id: 'closed', label: 'مغلقة' },
]

const PRIORITY_OPTS = [
  { id: '', label: 'الكل' },
  { id: 'low', label: 'منخفضة' },
  { id: 'medium', label: 'متوسطة' },
  { id: 'high', label: 'عالية' },
  { id: 'urgent', label: 'عاجلة' },
]

const STATUS_STYLES = {
  open: { label: 'مفتوحة', color: '#5b9ee8', bg: 'rgba(45,123,224,0.15)' },
  in_progress: { label: 'قيد التنفيذ', color: '#f5b942', bg: 'rgba(243,156,18,0.15)' },
  waiting_on_merchant: { label: 'بانتظار التاجر', color: '#e87067', bg: 'rgba(231,76,60,0.15)' },
  waiting_on_customer: { label: 'بانتظار العميل', color: '#e87067', bg: 'rgba(231,76,60,0.15)' },
  resolved: { label: 'تم الحل', color: '#4dd68a', bg: 'rgba(39,174,96,0.15)' },
  closed: { label: 'مغلقة', color: 'rgba(255,255,255,0.4)', bg: 'rgba(255,255,255,0.07)' },
}

const PRIORITY_STYLES = {
  low: { label: 'منخفضة', color: '#4dd68a' },
  medium: { label: 'متوسطة', color: '#f5b942' },
  high: { label: 'عالية', color: '#e87067' },
  urgent: { label: 'عاجلة', color: '#ff4444' },
}

export default function AdminTickets() {
  usePageTitle('الدعم الفني')
  const queryClient = useQueryClient()
  const [status, setStatus] = useState('')
  const [priority, setPriority] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [replyText, setReplyText] = useState('')

  const { data: stats } = useQuery({
    queryKey: ['admin-ticket-stats'],
    queryFn: () => getTicketStats().then(r => r.data.data),
    staleTime: 30_000,
  })

  const { data, isLoading } = useQuery({
    queryKey: ['admin-tickets', status, priority, search, page],
    queryFn: () => getTickets({ status: status || undefined, priority: priority || undefined, search: search || undefined, page, limit: 20 }).then(r => r.data),
    keepPreviousData: true,
    staleTime: 15_000,
  })

  const { data: ticketDetail } = useQuery({
    queryKey: ['admin-ticket-detail', selectedTicket],
    queryFn: () => getTicketById(selectedTicket).then(r => r.data.data),
    enabled: !!selectedTicket,
    staleTime: 10_000,
  })

  const replyMutation = useMutation({
    mutationFn: () => addTicketMessage(selectedTicket, { content: replyText }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-ticket-detail', selectedTicket] })
      queryClient.invalidateQueries({ queryKey: ['admin-tickets'] })
      setReplyText('')
      toast.success('تم إرسال الرد')
    },
    onError: (err) => toast.error(err.response?.data?.message || 'فشل الإرسال'),
  })

  const statusMutation = useMutation({
    mutationFn: (newStatus) => changeTicketStatus(selectedTicket, newStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-ticket-detail', selectedTicket] })
      queryClient.invalidateQueries({ queryKey: ['admin-tickets'] })
      toast.success('تم تحديث الحالة')
    },
  })

  const tickets = data?.data ?? []
  const pagination = data?.pagination ?? {}

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="الدعم الفني" subtitle="إدارة تذاكر الدعم الواردة من التجار والعملاء" />

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard icon={Ticket} label="الكل" value={stats?.total} tone="primary" loading={!stats} />
        <StatCard icon={AlertTriangle} label="مفتوحة" value={stats?.byStatus?.open} tone="info" loading={!stats} />
        <StatCard icon={Clock} label="قيد التنفيذ" value={stats?.byStatus?.inProgress} tone="warning" loading={!stats} />
        <StatCard icon={CheckCircle} label="عاجلة" value={stats?.urgent} tone="danger" loading={!stats} />
        <StatCard icon={MessageSquare} label="معدل الاستجابة" value={stats?.averageResponseTimeHours ? `${stats.averageResponseTimeHours} س` : '—'} tone="neutral" loading={!stats} />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <FilterPills options={STATUS_OPTS} value={status} onChange={(v) => { setStatus(v); setPage(1) }} />
        <FilterPills options={PRIORITY_OPTS} value={priority} onChange={(v) => { setPriority(v); setPage(1) }} />
        <div className="mr-auto">
          <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1) }} placeholder="بحث في التذاكر..." />
        </div>
      </div>

      {/* Tickets table */}
      <DataTable
        columns="80px 1.5fr 1fr 1fr 100px 80px"
        headers={['#', 'الموضوع', 'التاجر', 'الحالة', 'الأولوية', '']}
        isLoading={isLoading}
        isEmpty={tickets.length === 0}
        emptyTitle="لا توجد تذاكر"
        emptyMessage="لم يتم العثور على تذاكر مطابقة"
      >
        {tickets.map((t) => {
          const st = STATUS_STYLES[t.status] || STATUS_STYLES.open
          const pr = PRIORITY_STYLES[t.priority] || PRIORITY_STYLES.medium
          return (
            <TableRow key={t._id} columns="80px 1.5fr 1fr 1fr 100px 80px">
              <span className="font-inter text-xs font-bold text-white/40">#{String(t._id).slice(-6)}</span>
              <div>
                <p className="font-cairo text-sm font-bold text-white truncate">{t.subject}</p>
                <p className="font-cairo text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{formatDate(t.createdAt)}</p>
              </div>
              <p className="font-cairo text-sm truncate" style={{ color: 'rgba(255,255,255,0.55)' }}>{t.merchant?.name || '—'}</p>
              <StatusBadge label={st.label} tone={
                t.status === 'open' ? 'info' :
                t.status === 'in_progress' ? 'warning' :
                t.status === 'resolved' ? 'success' :
                t.status === 'closed' ? 'neutral' : 'danger'
              } />
              <span className="font-cairo text-xs font-bold" style={{ color: pr.color }}>{pr.label}</span>
              <ActionButton icon={MessageSquare} tone="primary" onClick={() => setSelectedTicket(t._id)} />
            </TableRow>
          )
        })}
      </DataTable>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
            className="rounded-xl px-4 py-2 font-cairo text-sm font-bold transition-colors disabled:opacity-30"
            style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)' }}>
            السابق
          </button>
          <span className="font-cairo text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>{page} / {pagination.pages}</span>
          <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page >= pagination.pages}
            className="rounded-xl px-4 py-2 font-cairo text-sm font-bold transition-colors disabled:opacity-30"
            style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)' }}>
            التالي
          </button>
        </div>
      )}

      {/* Ticket detail modal */}
      {selectedTicket && ticketDetail && (
        <Modal
          title={ticketDetail.ticket?.subject || 'تفاصيل التذكرة'}
          description={`#${String(selectedTicket).slice(-6)}`}
          onClose={() => setSelectedTicket(null)}
          footer={
            <div className="flex gap-2 w-full">
              <select
                value={ticketDetail.ticket?.status}
                onChange={(e) => statusMutation.mutate(e.target.value)}
                className="rounded-xl px-3 py-2 font-cairo text-xs font-bold outline-none"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)' }}
              >
                <option value="open">مفتوحة</option>
                <option value="in_progress">قيد التنفيذ</option>
                <option value="waiting_on_merchant">بانتظار التاجر</option>
                <option value="resolved">تم الحل</option>
                <option value="closed">مغلقة</option>
              </select>
              <button onClick={() => setSelectedTicket(null)}
                className="rounded-xl px-4 py-2 font-cairo text-sm font-bold"
                style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)' }}>
                إغلاق
              </button>
            </div>
          }
        >
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {ticketDetail.messages?.map((msg) => (
              <div key={msg._id} className={`rounded-xl p-3 ${msg.senderRole === 'admin' ? 'mr-6' : ''}`}
                style={{ background: msg.isInternal ? 'rgba(231,76,60,0.08)' : 'rgba(255,255,255,0.04)', border: msg.isInternal ? '1px dashed rgba(231,76,60,0.3)' : '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-cairo text-xs font-bold" style={{ color: msg.senderRole === 'admin' ? '#e87961' : '#7aa2d4' }}>
                      {msg.senderName || (msg.senderRole === 'admin' ? 'المشرف' : msg.senderRole === 'merchant' ? 'التاجر' : 'العميل')}
                    </span>
                    {msg.isInternal && <span className="font-cairo text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(231,76,60,0.2)', color: '#e87067' }}>داخلي</span>}
                  </div>
                  <span className="font-cairo text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>{formatDate(msg.createdAt)}</span>
                </div>
                <p className="font-cairo text-sm whitespace-pre-wrap" style={{ color: 'rgba(255,255,255,0.75)' }}>{msg.content}</p>
              </div>
            ))}
          </div>

          {/* Reply box */}
          <div className="mt-4 flex gap-2">
            <input
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="اكتب ردك هنا..."
              className="flex-1 rounded-xl px-4 py-2.5 font-cairo text-sm outline-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.8)' }}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); replyMutation.mutate() } }}
            />
            <ActionButton icon={Send} tone="primary" onClick={() => replyMutation.mutate()} disabled={!replyText.trim()} />
          </div>
        </Modal>
      )}
    </div>
  )
}
