import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store/authStore'
import { listWebhooks, createWebhook, updateWebhook, deleteWebhook, testWebhook, rotateWebhookSecret, listWebhookDeliveries, getWebhookEvents } from '@/api/webhooks'
import usePageTitle from '@/hooks/usePageTitle'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Webhook, Plus, Trash2, RotateCw, Send, CheckCircle, XCircle, Clock, Eye } from 'lucide-react'

const STATUS_ICONS = {
  success: CheckCircle,
  failed: XCircle,
  pending: Clock,
}

const STATUS_COLORS = {
  success: 'text-success bg-success-100',
  failed: 'text-danger bg-danger-100',
  pending: 'text-warning bg-warning-100',
}

function WebhookRow({ webhook: w, onEdit, onDelete, onTest, onRotate, onViewDeliveries }) {
  const stColor = w.isActive ? 'bg-success-100 text-success-dark' : 'bg-danger-100 text-danger'
  const stLabel = w.isActive ? 'نشط' : 'معطل'
  const hasFailures = w.consecutiveFailures >= 3

  return (
    <div className="flex items-center gap-4 px-4 py-3 border-b border-border last:border-0 hover:bg-accent-50/30 transition-all">
      <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
        <Webhook size={18} className="text-primary" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="font-inter font-bold text-sm text-text">{w.name}</p>
          {hasFailures && <span className="font-cairo text-[10px] bg-danger-100 text-danger px-2 py-0.5 rounded-full font-bold">مشاكل في التسليم</span>}
        </div>
        <p className="font-mono text-xs text-text-muted truncate max-w-md mt-0.5" dir="ltr">{w.url}</p>
        <div className="flex gap-1 mt-1.5 flex-wrap">
          {w.events?.slice(0, 3).map((e) => (
            <span key={e} className="font-cairo text-[10px] bg-bg-soft text-text-muted px-2 py-0.5 rounded-full font-semibold">
              {e}
            </span>
          ))}
          {w.events?.length > 3 && <span className="font-cairo text-[10px] text-text-subtle">+{w.events.length - 3}</span>}
        </div>
      </div>
      <span className={`font-cairo text-xs font-bold px-2.5 py-1 rounded-xl ${stColor}`}>{stLabel}</span>
      <div className="flex items-center gap-1 shrink-0">
        <button onClick={() => onViewDeliveries(w)} className="w-8 h-8 rounded-xl flex items-center justify-center text-text-muted hover:bg-primary-50 hover:text-primary transition-all" title="سجل التسليم">
          <Eye size={15} />
        </button>
        <button onClick={() => onTest(w)} className="w-8 h-8 rounded-xl flex items-center justify-center text-text-muted hover:bg-success-100 hover:text-success-dark transition-all" title="اختبار">
          <Send size={15} />
        </button>
        <button onClick={() => onRotate(w)} className="w-8 h-8 rounded-xl flex items-center justify-center text-text-muted hover:bg-primary-50 hover:text-primary transition-all" title="تحديث السر">
          <RotateCw size={15} />
        </button>
        <button onClick={() => onEdit(w)} className="w-8 h-8 rounded-xl flex items-center justify-center text-text-muted hover:bg-primary-50 hover:text-primary transition-all">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </button>
        <button onClick={() => onDelete(w)} className="w-8 h-8 rounded-xl flex items-center justify-center text-text-muted hover:bg-danger-100 hover:text-danger transition-all" title="حذف">
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  )
}

function DeliveryRow({ delivery: d }) {
  const StatusIcon = STATUS_ICONS[d.status] || Clock
  const stColor = STATUS_COLORS[d.status] || STATUS_COLORS.pending
  return (
    <div className="flex items-center gap-3 px-4 py-2 border-b border-border last:border-0 text-sm">
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${stColor}`}>
        <StatusIcon size={14} />
      </div>
      <span className="font-mono text-xs text-text-muted w-32">{d.event}</span>
      <span className={`font-cairo text-xs font-bold px-2 py-0.5 rounded-lg ${stColor}`}>{d.status === 'success' ? 'نجاح' : d.status === 'failed' ? 'فشل' : 'قيد الانتظار'}</span>
      <span className="font-cairo text-xs text-text-muted flex-1">{d.attempts}/{d.maxAttempts} محاولات</span>
      {d.responseStatusCode && <span className="font-mono text-xs text-text-muted">{d.responseStatusCode}</span>}
      {d.duration && <span className="font-cairo text-xs text-text-muted">{d.duration}ms</span>}
      <span className="font-cairo text-xs text-text-muted">{new Date(d.createdAt).toLocaleString('ar-YE')}</span>
    </div>
  )
}

const EVENT_LABELS = {
  'product.created': 'إنشاء منتج',
  'product.updated': 'تحديث منتج',
  'product.deleted': 'حذف منتج',
  'order.created': 'إنشاء طلب',
  'order.confirmed': 'تأكيد طلب',
  'order.shipped': 'شحن طلب',
  'order.delivered': 'تسليم طلب',
  'order.cancelled': 'إلغاء طلب',
  'order.rejected': 'رفض طلب',
  'store.updated': 'تحديث المتجر',
}

export default function WebhooksPage() {
  usePageTitle('Webhooks')
  const storeRaw = useAuthStore(s => s.store)
  const store = Array.isArray(storeRaw) ? storeRaw[0] : storeRaw
  const queryClient = useQueryClient()

  const { data: webhooks = [], isLoading } = useQuery({
    queryKey: ['webhooks', store?._id],
    queryFn: () => listWebhooks(store._id).then(r => r.data.data),
    enabled: !!store?._id,
  })

  const { data: events } = useQuery({
    queryKey: ['webhookEvents'],
    queryFn: () => getWebhookEvents().then(r => r.data.data),
  })

  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [viewDeliveries, setViewDeliveries] = useState(null)
  const [form, setForm] = useState({ name: '', url: '', events: [], description: '', apiVersion: 'v1' })

  function resetForm() {
    setForm({ name: '', url: '', events: [], description: '', apiVersion: 'v1' })
    setEditTarget(null)
    setShowForm(false)
  }

  function openEdit(w) {
    setEditTarget(w)
    setForm({
      name: w.name,
      url: w.url,
      events: w.events || [],
      description: w.description || '',
      apiVersion: w.apiVersion || 'v1',
    })
    setShowForm(true)
  }

  function toggleEvent(event) {
    setForm(f => ({
      ...f,
      events: f.events.includes(event)
        ? f.events.filter(e => e !== event)
        : [...f.events, event],
    }))
  }

  const { mutate: doCreate, isPending: creating } = useMutation({
    mutationFn: () => createWebhook(store._id, form),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['webhooks', store._id] }); toast.success('تم إنشاء الـ webhook'); resetForm() },
    onError: (err) => toast.error(err?.message || 'خطأ'),
  })

  const { mutate: doUpdate, isPending: updating } = useMutation({
    mutationFn: () => updateWebhook(editTarget._id, form),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['webhooks', store._id] }); toast.success('تم التحديث'); resetForm() },
    onError: (err) => toast.error(err?.message || 'خطأ'),
  })

  const { mutate: doDelete } = useMutation({
    mutationFn: () => deleteWebhook(target._id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['webhooks', store._id] }); toast.success('تم الحذف'); setTarget(null) },
    onError: (err) => toast.error(err?.message || 'خطأ'),
  })

  const { mutate: doTest } = useMutation({
    mutationFn: () => testWebhook(target._id),
    onSuccess: () => { toast.success('تم إرسال اختبار الـ webhook'); setTarget(null) },
    onError: (err) => toast.error(err?.message || 'خطأ'),
  })

  const { mutate: doRotate } = useMutation({
    mutationFn: () => rotateWebhookSecret(target._id),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['webhooks', store._id] })
      const secret = res.data?.data?.secret
      if (secret) {
        navigator.clipboard.writeText(secret)
        toast.success('تم تحديث السر ونسخه للحافظة')
      }
      setTarget(null)
    },
    onError: (err) => toast.error(err?.message || 'خطأ'),
  })

  const { data: deliveries, isLoading: loadingDeliveries } = useQuery({
    queryKey: ['webhookDeliveries', viewDeliveries?._id],
    queryFn: () => listWebhookDeliveries(viewDeliveries._id).then(r => r.data.data),
    enabled: !!viewDeliveries,
  })

  const [target, setTarget] = useState(null)

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.name || !form.url || form.events.length === 0) {
      toast.error('الاسم والرابط والأحداث مطلوبة')
      return
    }
    if (!form.url.startsWith('http://') && !form.url.startsWith('https://')) {
      toast.error('الرابط يجب أن يبدأ بـ http:// أو https://')
      return
    }
    if (editTarget) doUpdate()
    else doCreate()
  }

  if (!store) return null

  return (
    <div className="max-w-5xl mx-auto px-4 py-8" dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center shadow-sm">
            <Webhook size={20} className="text-primary" />
          </div>
          <div>
            <h1 className="font-cairo font-extrabold text-2xl text-text">Webhooks</h1>
            <p className="font-cairo text-sm text-text-muted">استقبل إشعارات فورية عند حدوث أحداث في متجرك.</p>
          </div>
        </div>
        <Button variant="accent" size="md" onClick={() => { resetForm(); setShowForm(true) }}>
          <Plus size={16} />
          إضافة Webhook
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-border rounded-2xl p-5 mb-6 shadow-sm">
          <h3 className="font-cairo font-bold text-base text-text mb-4">{editTarget ? 'تعديل Webhook' : 'Webhook جديد'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Input label="الاسم" placeholder="Webhook المتجر" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
            <Input label="الرابط" placeholder="https://example.com/webhook" value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} required />
            <div className="md:col-span-2">
              <Input label="الوصف (اختياري)" placeholder="وصف الـ webhook" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
          </div>
          <label className="font-cairo text-sm font-semibold text-text block mb-2">الأحداث</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
            {(events || Object.entries(EVENT_LABELS).map(([k, v]) => ({ key: k, label: v }))).map((e) => {
              const evKey = e.key || e
              const evLabel = e.label || EVENT_LABELS[e] || e
              return (
                <label key={evKey} className={`flex items-center gap-2 p-2 rounded-xl border cursor-pointer transition-all ${form.events.includes(evKey) ? 'bg-primary-5 border-primary text-primary' : 'border-border text-text-muted hover:border-primary/30'}`}>
                  <input type="checkbox" checked={form.events.includes(evKey)} onChange={() => toggleEvent(evKey)} className="sr-only" />
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${form.events.includes(evKey) ? 'bg-primary border-primary' : 'border-border'}`}>
                    {form.events.includes(evKey) && (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    )}
                  </div>
                  <span className="font-cairo text-xs font-semibold">{evLabel}</span>
                </label>
              )
            })}
          </div>
          <div className="flex gap-3">
            <Button type="submit" variant="primary" loading={creating || updating}>{editTarget ? 'تحديث' : 'إنشاء'}</Button>
            <Button type="button" variant="ghost" onClick={resetForm}>إلغاء</Button>
          </div>
        </form>
      )}

      <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm">
        {isLoading && <div className="p-8 text-center font-cairo text-text-muted">جاري التحميل...</div>}
        {!isLoading && webhooks.length === 0 && (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-bg-soft mx-auto mb-4 flex items-center justify-center">
              <Webhook size={28} className="text-text-subtle" />
            </div>
            <h3 className="font-cairo font-bold text-text mb-1">لا توجد Webhooks</h3>
            <p className="font-cairo text-sm text-text-muted">أضف أول webhook لاستقبال الإشعارات.</p>
          </div>
        )}
        {webhooks.map(w => (
          <WebhookRow
            key={w._id}
            webhook={w}
            onEdit={openEdit}
            onDelete={(w) => { setTarget(w); if (confirm('حذف الـ webhook؟')) doDelete() }}
            onTest={(w) => { setTarget(w); doTest() }}
            onRotate={(w) => { setTarget(w); if (confirm('تحديث سر الـ webhook؟')) doRotate() }}
            onViewDeliveries={(w) => setViewDeliveries(w)}
          />
        ))}
      </div>

      {viewDeliveries && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={() => setViewDeliveries(null)}>
          <div className="bg-white w-full max-w-3xl rounded-t-3xl max-h-[80vh] overflow-y-auto shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-border px-6 py-4 flex items-center justify-between z-10">
              <h3 className="font-cairo font-bold text-base text-text">سجل التسليم — {viewDeliveries.name}</h3>
              <button onClick={() => setViewDeliveries(null)} className="w-8 h-8 rounded-xl flex items-center justify-center text-text-muted hover:bg-bg-soft">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="p-4">
              {loadingDeliveries && <p className="font-cairo text-sm text-text-muted text-center py-4">جاري التحميل...</p>}
              {!loadingDeliveries && (!deliveries || deliveries.length === 0) && (
                <p className="font-cairo text-sm text-text-muted text-center py-4">لا توجد توصيلات بعد.</p>
              )}
              {deliveries?.map(d => <DeliveryRow key={d._id} delivery={d} />)}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
