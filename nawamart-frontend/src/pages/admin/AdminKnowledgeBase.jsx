import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  Plus, BookOpen, Eye, Trash2, Search, ExternalLink,
} from 'lucide-react'
import { getArticles, createArticle, updateArticle, deleteArticle, getCategories } from '@/api/knowledge'
import usePageTitle from '@/hooks/usePageTitle'
import {
  AdminCard, PageHeader, DataTable, TableRow, StatusBadge, ActionButton,
  Modal, SearchInput,
} from '@/components/admin/AdminUI'
import { formatDate } from '@/components/admin/AdminUI'

const CATEGORY_LABELS = {
  getting_started: 'بداية الاستخدام',
  account: 'الحساب',
  store_setup: 'إعداد المتجر',
  products: 'المنتجات',
  orders: 'الطلبات',
  payments: 'المدفوعات',
  shipping: 'الشحن',
  digital_delivery: 'التسليم الرقمي',
  subscription: 'الاشتراكات',
  billing: 'الفواتير',
  troubleshooting: 'حل المشكلات',
  integrations: 'التكاملات',
  api: 'API',
  security: 'الأمان',
  general: 'عام',
}

export default function AdminKnowledgeBase() {
  usePageTitle('قاعدة المعرفة')
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState({
    title: '', content: '', excerpt: '', category: 'general', tags: '', isPublished: false, isFeatured: false,
  })

  const { data: articles } = useQuery({
    queryKey: ['admin-kb-articles', search],
    queryFn: () => getArticles({ query: search || undefined, includeUnpublished: 'true' }).then(r => r.data.data),
    staleTime: 30_000,
  })

  const createMutation = useMutation({
    mutationFn: () => {
      const payload = { ...form, tags: form.tags.split(',').map(s => s.trim()).filter(Boolean) }
      return editId ? updateArticle(editId, payload) : createArticle(payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-kb-articles'] })
      setShowCreate(false)
      setEditId(null)
      setForm({ title: '', content: '', excerpt: '', category: 'general', tags: '', isPublished: false, isFeatured: false })
      toast.success(editId ? 'تم تحديث المقال' : 'تم إنشاء المقال')
    },
    onError: (err) => toast.error(err.response?.data?.message || 'فشل الحفظ'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteArticle(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-kb-articles'] })
      toast.success('تم حذف المقال')
    },
  })

  const openEdit = (article) => {
    setForm({
      title: article.title,
      content: article.content,
      excerpt: article.excerpt || '',
      category: article.category,
      tags: (article.tags || []).join(', '),
      isPublished: article.isPublished,
      isFeatured: article.isFeatured,
    })
    setEditId(article._id)
    setShowCreate(true)
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="قاعدة المعرفة" subtitle="إدارة مقالات المساعدة والدعم الفني">
        <ActionButton icon={Plus} tone="primary" onClick={() => { setEditId(null); setForm({ title: '', content: '', excerpt: '', category: 'general', tags: '', isPublished: false, isFeatured: false }); setShowCreate(true) }}>
          مقال جديد
        </ActionButton>
      </PageHeader>

      <SearchInput value={search} onChange={setSearch} placeholder="بحث في المقالات..." />

      <DataTable
        columns="2fr 1fr 80px 100px 100px 80px"
        headers={['العنوان', 'التصنيف', 'المشاهدات', 'التقييم', 'الحالة', '']}
        isLoading={!articles}
        isEmpty={!articles?.length}
        emptyTitle="لا توجد مقالات"
        emptyMessage="قم بإنشاء أول مقال الآن"
      >
        {(articles ?? []).map((a) => (
          <TableRow key={a._id} columns="2fr 1fr 80px 100px 100px 80px">
            <div>
              <p className="font-cairo text-sm font-bold text-white truncate">{a.title}</p>
              <p className="font-cairo text-xs mt-0.5 text-white/35 truncate">{a.excerpt || ''}</p>
            </div>
            <span className="font-cairo text-sm text-white/55">{CATEGORY_LABELS[a.category] || a.category}</span>
            <span className="font-cairo text-sm font-bold text-white dk-num">{a.viewCount ?? 0}</span>
            <span className="font-cairo text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
              {a.helpfulnessRate !== null ? `${a.helpfulnessRate}%` : '—'}
            </span>
            <StatusBadge label={a.isPublished ? 'منشور' : 'مسودة'} tone={a.isPublished ? 'success' : 'neutral'} />
            <div className="flex items-center gap-1">
              <ActionButton icon={Eye} tone="primary" onClick={() => openEdit(a)} />
              <ActionButton icon={Trash2} tone="danger" onClick={() => { if (confirm('حذف المقال؟')) deleteMutation.mutate(a._id) }} />
            </div>
          </TableRow>
        ))}
      </DataTable>

      {showCreate && (
        <Modal
          title={editId ? 'تعديل المقال' : 'مقال جديد'}
          description="أضف محتوى تعليمي للتجار والعملاء"
          onClose={() => setShowCreate(false)}
          footer={
            <div className="flex gap-2">
              <button onClick={() => setShowCreate(false)}
                className="rounded-xl px-4 py-2 font-cairo text-sm font-bold"
                style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)' }}>
                إلغاء
              </button>
              <button onClick={() => createMutation.mutate()} disabled={createMutation.isLoading || !form.title || !form.content}
                className="rounded-xl px-4 py-2 font-cairo text-sm font-bold text-white disabled:opacity-40"
                style={{ background: '#C93F2B' }}>
                {createMutation.isLoading ? 'جاري...' : editId ? 'حفظ' : 'نشر'}
              </button>
            </div>
          }
        >
          <div className="space-y-3 max-h-96 overflow-y-auto">
            <div>
              <label className="block font-cairo text-xs font-bold mb-1 text-white/60">العنوان *</label>
              <input value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
                className="w-full rounded-xl px-3 py-2 font-cairo text-sm outline-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.8)' }} />
            </div>
            <div>
              <label className="block font-cairo text-xs font-bold mb-1 text-white/60">الملخص</label>
              <textarea value={form.excerpt} onChange={(e) => setForm(f => ({ ...f, excerpt: e.target.value }))} rows={2}
                className="w-full rounded-xl px-3 py-2 font-cairo text-sm outline-none resize-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.8)' }} />
            </div>
            <div>
              <label className="block font-cairo text-xs font-bold mb-1 text-white/60">المحتوى *</label>
              <textarea value={form.content} onChange={(e) => setForm(f => ({ ...f, content: e.target.value }))} rows={6}
                className="w-full rounded-xl px-3 py-2 font-cairo text-sm outline-none resize-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.8)' }} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-cairo text-xs font-bold mb-1 text-white/60">التصنيف</label>
                <select value={form.category} onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))}
                  className="w-full rounded-xl px-3 py-2 font-cairo text-sm outline-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.8)' }}>
                  {Object.entries(CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="block font-cairo text-xs font-bold mb-1 text-white/60">الوسوم (مفصولة بفاصلة)</label>
                <input value={form.tags} onChange={(e) => setForm(f => ({ ...f, tags: e.target.value }))}
                  className="w-full rounded-xl px-3 py-2 font-cairo text-sm outline-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.8)' }} />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.isPublished} onChange={(e) => setForm(f => ({ ...f, isPublished: e.target.checked }))} />
                <span className="font-cairo text-xs text-white/60">منشور</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm(f => ({ ...f, isFeatured: e.target.checked }))} />
                <span className="font-cairo text-xs text-white/60">مميز</span>
              </label>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
