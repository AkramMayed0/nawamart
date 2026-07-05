import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store/authStore'
import { getLegalPages, createLegalPage, updateLegalPage, generateFromTemplate, getLegalPageTypes } from '@/api/compliance'
import usePageTitle from '@/hooks/usePageTitle'
import Button from '@/components/ui/Button'
import { FileText, Plus, Eye, Globe, CheckCircle, XCircle, ArrowLeft } from 'lucide-react'

const PAGE_TYPE_ICONS = {
  privacy_policy: 'سياسة الخصوصية',
  terms_of_service: 'شروط الخدمة',
  refund_policy: 'سياسة الاسترجاع',
  shipping_policy: 'سياسة الشحن',
  cookie_policy: 'سياسة ملفات تعريف الارتباط',
  dpa: 'اتفاقية معالجة البيانات',
}

function LegalPageCard({ page, onEdit, onPreview }) {
  return (
    <div className="bg-white border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
            <FileText size={18} className="text-primary" />
          </div>
          <div>
            <h3 className="font-cairo font-bold text-sm text-text">{page.title}</h3>
            <p className="font-cairo text-xs text-text-muted">{PAGE_TYPE_ICONS[page.type] || page.type} · الإصدار {page.version}</p>
          </div>
        </div>
        <span className={`font-cairo text-xs font-bold px-2.5 py-1 rounded-xl inline-flex items-center gap-1.5 ${page.isPublished ? 'bg-success-100 text-success-dark' : 'bg-bg-soft text-text-muted'}`}>
          {page.isPublished ? <CheckCircle size={12} /> : <XCircle size={12} />}
          {page.isPublished ? 'منشور' : 'مسودة'}
        </span>
      </div>
      <p className="font-cairo text-xs text-text-muted line-clamp-2 mb-3 leading-relaxed">
        {page.content?.slice(0, 150)}...
      </p>
      <div className="flex items-center justify-between pt-3 border-t border-border">
        <span className="font-cairo text-[11px] text-text-subtle">
          آخر تحديث: {new Date(page.updatedAt).toLocaleDateString('ar-YE')}
        </span>
        <div className="flex gap-1">
          <button onClick={() => onPreview(page)} className="w-8 h-8 rounded-xl flex items-center justify-center text-text-muted hover:bg-primary-50 hover:text-primary transition-all">
            <Eye size={15} />
          </button>
          <button onClick={() => onEdit(page)} className="w-8 h-8 rounded-xl flex items-center justify-center text-text-muted hover:bg-accent-50 hover:text-accent-700 transition-all">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
        </div>
      </div>
    </div>
  )
}

export default function LegalPagesPage() {
  usePageTitle('الصفحات القانونية')
  const storeRaw = useAuthStore(s => s.store)
  const store = Array.isArray(storeRaw) ? storeRaw[0] : storeRaw
  const queryClient = useQueryClient()

  const { data: pages = [], isLoading } = useQuery({
    queryKey: ['legalPages', store?._id],
    queryFn: () => getLegalPages(store._id).then(r => r.data.data),
    enabled: !!store?._id,
  })

  const { data: pageTypes } = useQuery({
    queryKey: ['legalPageTypes'],
    queryFn: () => getLegalPageTypes().then(r => r.data.data),
  })

  const existingTypes = new Set(pages.map(p => p.type))

  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [previewPage, setPreviewPage] = useState(null)
  const [form, setForm] = useState({ type: '', title: '', content: '', isPublished: false, effectiveDate: '' })

  function resetForm() {
    setForm({ type: '', title: '', content: '', isPublished: false, effectiveDate: '' })
    setEditTarget(null)
    setShowForm(false)
  }

  function openEdit(p) {
    setEditTarget(p)
    setForm({
      type: p.type,
      title: p.title,
      content: p.content,
      isPublished: p.isPublished,
      effectiveDate: p.effectiveDate ? new Date(p.effectiveDate).toISOString().slice(0, 10) : '',
    })
    setShowForm(true)
  }

  const { mutate: doCreate, isPending: creating } = useMutation({
    mutationFn: () => createLegalPage(store._id, form),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['legalPages', store._id] }); toast.success('تم إنشاء الصفحة'); resetForm() },
    onError: (err) => toast.error(err?.message || 'خطأ'),
  })

  const { mutate: doUpdate, isPending: updating } = useMutation({
    mutationFn: () => updateLegalPage(editTarget._id, form),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['legalPages', store._id] }); toast.success('تم التحديث'); resetForm() },
    onError: (err) => toast.error(err?.message || 'خطأ'),
  })

  const { mutate: doGenerate } = useMutation({
    mutationFn: (type) => generateFromTemplate(store._id, { type }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['legalPages', store._id] }); toast.success('تم إنشاء الصفحة من القالب') },
    onError: (err) => toast.error(err?.message || 'خطأ'),
  })

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.title || !form.content) {
      toast.error('العنوان والمحتوى مطلوبان')
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
            <FileText size={20} className="text-primary" />
          </div>
          <div>
            <h1 className="font-cairo font-extrabold text-2xl text-text">الصفحات القانونية</h1>
            <p className="font-cairo text-sm text-text-muted">أنشئ وأدر سياسات الخصوصية وشروط الخدمة والصفحات القانونية.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => {
            const available = (pageTypes || []).filter(t => !existingTypes.has(t.key))
            if (available.length === 0) {
              toast('جميع الصفحات موجودة مسبقاً')
              return
            }
            doGenerate(available[0].key)
          }}>
            <Plus size={16} />
            من قالب
          </Button>
          <Button variant="accent" size="md" onClick={() => { resetForm(); setShowForm(true) }}>
            <Plus size={16} />
            صفحة جديدة
          </Button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-border rounded-2xl p-5 mb-6 shadow-sm">
          <h3 className="font-cairo font-bold text-base text-text mb-4">{editTarget ? 'تعديل الصفحة' : 'صفحة قانونية جديدة'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-cairo text-sm font-semibold text-text">النوع</label>
              <select value={form.type} onChange={e => {
                const t = e.target.value
                setForm(f => ({ ...f, type: t, title: PAGE_TYPE_ICONS[t] || t }))
              }} className="h-10 rounded-lg border border-border bg-white px-3 font-cairo text-sm outline-none focus:border-primary" required={!editTarget}>
                <option value="">اختر النوع</option>
                {(pageTypes || []).map(pt => (
                  <option key={pt.key} value={pt.key} disabled={editTarget?.type !== pt.key && existingTypes.has(pt.key)}>
                    {pt.label} {existingTypes.has(pt.key) ? '(موجود)' : ''}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-cairo text-sm font-semibold text-text">تاريخ السريان (اختياري)</label>
              <input type="date" value={form.effectiveDate} onChange={e => setForm(f => ({ ...f, effectiveDate: e.target.value }))} className="h-10 rounded-lg border border-border bg-white px-3 font-cairo text-sm outline-none focus:border-primary" />
            </div>
          </div>
          <div className="mb-4">
            <label className="font-cairo text-sm font-semibold text-text block mb-1.5">العنوان</label>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="w-full h-10 rounded-lg border border-border bg-white px-3 font-cairo text-sm outline-none focus:border-primary" required />
          </div>
          <div className="mb-4">
            <label className="font-cairo text-sm font-semibold text-text block mb-1.5">المحتوى</label>
            <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} rows={15} className="w-full rounded-lg border border-border bg-white px-3 py-2 font-cairo text-sm outline-none focus:border-primary resize-y" required />
          </div>
          <div className="flex items-center gap-3 mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isPublished} onChange={e => setForm(f => ({ ...f, isPublished: e.target.checked }))} className="w-4 h-4 rounded border-border text-primary focus:ring-primary" />
              <span className="font-cairo text-sm font-semibold text-text">نشر الصفحة</span>
            </label>
          </div>
          <div className="flex gap-3">
            <Button type="submit" variant="primary" loading={creating || updating}>{editTarget ? 'تحديث' : 'إنشاء'}</Button>
            <Button type="button" variant="ghost" onClick={resetForm}>إلغاء</Button>
          </div>
        </form>
      )}

      {isLoading && <div className="text-center font-cairo text-text-muted py-8">جاري التحميل...</div>}

      {!isLoading && pages.length === 0 && (
        <div className="bg-white border border-border rounded-2xl p-12 text-center shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-bg-soft mx-auto mb-4 flex items-center justify-center">
            <FileText size={28} className="text-text-subtle" />
          </div>
          <h3 className="font-cairo font-bold text-text mb-1">لا توجد صفحات قانونية</h3>
          <p className="font-cairo text-sm text-text-muted">أنشئ صفحة جديدة أو استخدم أحد القوالب الجاهزة.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pages.map(p => (
          <LegalPageCard
            key={p._id}
            page={p}
            onEdit={openEdit}
            onPreview={setPreviewPage}
          />
        ))}
      </div>

      {previewPage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setPreviewPage(null)}>
          <div className="bg-white w-full max-w-3xl rounded-3xl max-h-[85vh] overflow-y-auto shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-border px-6 py-4 flex items-center justify-between z-10 rounded-t-3xl">
              <div className="flex items-center gap-3">
                <button onClick={() => setPreviewPage(null)} className="w-8 h-8 rounded-xl flex items-center justify-center text-text-muted hover:bg-bg-soft">
                  <ArrowLeft size={18} />
                </button>
                <h3 className="font-cairo font-bold text-base text-text">{previewPage.title}</h3>
                <span className="font-cairo text-xs text-text-muted">الإصدار {previewPage.version}</span>
              </div>
              <span className={`font-cairo text-xs font-bold px-2.5 py-1 rounded-xl ${previewPage.isPublished ? 'bg-success-100 text-success-dark' : 'bg-bg-soft text-text-muted'}`}>
                {previewPage.isPublished ? 'منشور' : 'مسودة'}
              </span>
            </div>
            <div className="p-6">
              <pre className="font-cairo text-sm text-text leading-relaxed whitespace-pre-wrap">{previewPage.content}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
