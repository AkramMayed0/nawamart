import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  Plus, MessageSquare, Send, Clock, CheckCircle, AlertCircle,
  HelpCircle, BookOpen,
} from 'lucide-react'
import { createTicket, getTickets, getTicketById, addTicketMessage } from '@/api/ticket'
import usePageTitle from '@/hooks/usePageTitle'

export default function SupportPage() {
  usePageTitle('الدعم الفني')
  const queryClient = useQueryClient()
  const [showNew, setShowNew] = useState(false)
  const [selectedId, setSelectedId] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [form, setForm] = useState({ subject: '', description: '', category: 'technical', priority: 'medium' })

  const { data: tickets } = useQuery({
    queryKey: ['merchant-tickets'],
    queryFn: () => getTickets({ limit: 50 }).then(r => r.data.data),
    staleTime: 15_000,
  })

  const { data: detail } = useQuery({
    queryKey: ['merchant-ticket-detail', selectedId],
    queryFn: () => getTicketById(selectedId).then(r => r.data.data),
    enabled: !!selectedId,
    staleTime: 10_000,
  })

  const createMutation = useMutation({
    mutationFn: () => createTicket(form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchant-tickets'] })
      setShowNew(false)
      setForm({ subject: '', description: '', category: 'technical', priority: 'medium' })
      toast.success('تم إنشاء التذكرة')
    },
    onError: (err) => toast.error(err.response?.data?.message || 'فشل الإنشاء'),
  })

  const replyMutation = useMutation({
    mutationFn: () => addTicketMessage(selectedId, { content: replyText }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchant-ticket-detail', selectedId] })
      queryClient.invalidateQueries({ queryKey: ['merchant-tickets'] })
      setReplyText('')
      toast.success('تم الإرسال')
    },
    onError: (err) => toast.error(err.response?.data?.message || 'فشل الإرسال'),
  })

  const STATUS_MAP = {
    open: { label: 'مفتوحة', color: '#5b9ee8', bg: 'rgba(45,123,224,0.15)' },
    in_progress: { label: 'قيد المعالجة', color: '#f5b942', bg: 'rgba(243,156,18,0.15)' },
    waiting_on_merchant: { label: 'بانتظارك', color: '#e87067', bg: 'rgba(231,76,60,0.15)' },
    resolved: { label: 'تم الحل', color: '#4dd68a', bg: 'rgba(39,174,96,0.15)' },
    closed: { label: 'مغلقة', color: 'rgba(255,255,255,0.4)', bg: 'rgba(255,255,255,0.07)' },
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-cairo text-2xl font-extrabold text-text">الدعم الفني</h1>
          <p className="font-cairo text-sm mt-1 text-text-muted">تواصل مع فريق الدعم الفني لحل المشكلات والاستفسارات</p>
        </div>
        <button onClick={() => setShowNew(true)}
          className="flex items-center gap-2 rounded-2xl bg-accent px-5 py-2.5 font-cairo text-sm font-bold text-white shadow-sm shadow-accent/30 transition-all hover:bg-accent-600">
          <Plus size={16} />
          تذكرة جديدة
        </button>
      </div>

      {/* Tickets list */}
      <div className="space-y-3">
        {(!tickets || tickets.length === 0) ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border py-16">
            <HelpCircle size={48} className="text-text-subtle mb-3" />
            <p className="font-cairo text-base font-bold text-text-muted">لا توجد تذاكر دعم</p>
            <p className="font-cairo text-sm text-text-subtle mt-1">يمكنك فتح تذكرة جديدة وسيقوم فريق الدعم بمساعدتك</p>
          </div>
        ) : tickets.map((t) => {
          const st = STATUS_MAP[t.status] || STATUS_MAP.open
          return (
            <div key={t._id} onClick={() => setSelectedId(t._id)}
              className="cursor-pointer rounded-2xl border border-border bg-white p-4 transition-all hover:shadow-md hover:border-accent/30"
              style={selectedId === t._id ? { borderColor: '#DC2626', boxShadow: '0 0 0 2px rgba(220,38,38,0.15)' } : {}}>
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-cairo text-base font-bold text-text truncate">{t.subject}</h3>
                    <span className="shrink-0 rounded-full px-2 py-0.5 font-cairo text-[10px] font-bold" style={{ background: st.bg, color: st.color }}>
                      {st.label}
                    </span>
                  </div>
                  <p className="font-cairo text-sm text-text-muted line-clamp-1">{t.description}</p>
                </div>
                <span className="shrink-0 font-cairo text-xs text-text-subtle mr-3">
                  {new Date(t.createdAt).toLocaleDateString('ar-YE')}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Ticket detail */}
      {selectedId && detail && (
        <div className="mt-6 rounded-2xl border border-border bg-white">
          <div className="border-b border-border p-4">
            <div className="flex items-center justify-between">
              <h2 className="font-cairo text-lg font-extrabold text-text">{detail.ticket?.subject}</h2>
              <button onClick={() => setSelectedId(null)} className="font-cairo text-sm text-text-subtle hover:text-text">إغلاق</button>
            </div>
          </div>
          <div className="max-h-80 space-y-3 overflow-y-auto p-4">
            {detail.messages?.map((msg) => (
              <div key={msg._id} className={`rounded-xl p-3 ${msg.senderRole === 'merchant' ? 'bg-accent/5 border border-accent/10' : 'bg-bg-soft'}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-cairo text-xs font-bold text-text-muted">
                    {msg.senderRole === 'merchant' ? 'أنت' : 'فريق الدعم'}
                  </span>
                  <span className="font-cairo text-[10px] text-text-subtle">
                    {new Date(msg.createdAt).toLocaleString('ar-YE')}
                  </span>
                </div>
                <p className="font-cairo text-sm text-text whitespace-pre-wrap">{msg.content}</p>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 border-t border-border p-4">
            <input value={replyText} onChange={(e) => setReplyText(e.target.value)}
              placeholder="اكتب ردك..."
              className="flex-1 rounded-xl border border-border bg-bg-soft px-4 py-2.5 font-cairo text-sm outline-none focus:border-accent"
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); replyMutation.mutate() } }} />
            <button onClick={() => replyMutation.mutate()} disabled={!replyText.trim()}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-white disabled:opacity-40">
              <Send size={16} />
            </button>
          </div>
        </div>
      )}

      {/* New ticket modal */}
      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setShowNew(false)}>
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-cairo text-lg font-extrabold text-text mb-1">تذكرة دعم جديدة</h2>
            <p className="font-cairo text-sm text-text-muted mb-4">صف المشكلة التي تواجهها وسنقوم بمساعدتك</p>

            <div className="space-y-3">
              <div>
                <label className="block font-cairo text-xs font-bold text-text-muted mb-1">الموضوع *</label>
                <input value={form.subject} onChange={(e) => setForm(f => ({ ...f, subject: e.target.value }))}
                  className="w-full rounded-xl border border-border bg-bg-soft px-4 py-2.5 font-cairo text-sm outline-none focus:border-accent" />
              </div>
              <div>
                <label className="block font-cairo text-xs font-bold text-text-muted mb-1">التصنيف</label>
                <select value={form.category} onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))}
                  className="w-full rounded-xl border border-border bg-bg-soft px-4 py-2.5 font-cairo text-sm outline-none focus:border-accent">
                  <option value="technical">مشكلة تقنية</option>
                  <option value="billing">فواتير ومدفوعات</option>
                  <option value="account">الحساب</option>
                  <option value="feature_request">طلب ميزة</option>
                  <option value="general">استفسار عام</option>
                </select>
              </div>
              <div>
                <label className="block font-cairo text-xs font-bold text-text-muted mb-1">الوصف *</label>
                <textarea value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} rows={4}
                  className="w-full rounded-xl border border-border bg-bg-soft px-4 py-2.5 font-cairo text-sm outline-none resize-none focus:border-accent" />
              </div>
            </div>

            <div className="flex items-center justify-between mt-5">
              <button onClick={() => setShowNew(false)} className="font-cairo text-sm text-text-muted">إلغاء</button>
              <button onClick={() => createMutation.mutate()} disabled={!form.subject || !form.description || createMutation.isLoading}
                className="rounded-2xl bg-accent px-6 py-2.5 font-cairo text-sm font-bold text-white disabled:opacity-40">
                {createMutation.isLoading ? 'جاري...' : 'إرسال التذكرة'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
