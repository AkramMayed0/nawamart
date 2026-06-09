import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, Plus, Search, MoreHorizontal, Eye, Pencil, Trash2, Copy, Globe, Lock } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { useAuthStore } from '@/store/authStore'
import { getPages, createPage, deletePage, updatePage } from '@/api/pages'
import Skeleton from '@/components/ui/Skeleton'

const PAGE_TYPES = {
  home: 'الصفحة الرئيسية',
  about: 'من نحن',
  contact: 'اتصل بنا',
  policy: 'سياسة',
  custom: 'صفحة مخصصة',
}

const PAGE_TYPE_COLORS = {
  home: 'bg-emerald-100 text-emerald-700',
  about: 'bg-blue-100 text-blue-700',
  contact: 'bg-violet-100 text-violet-700',
  policy: 'bg-amber-100 text-amber-700',
  custom: 'bg-gray-100 text-gray-700',
}

export default function PagesPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const store = useAuthStore((s) => s.store)

  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newPage, setNewPage] = useState({ title: '', type: 'custom' })

  const { data: pagesRes, isLoading } = useQuery({
    queryKey: ['pages', store?._id, searchQuery],
    queryFn: () => getPages(store._id, { search: searchQuery || undefined }),
    enabled: !!store?._id,
  })

  const createMutation = useMutation({
    mutationFn: () => createPage(store._id, newPage),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['pages'] })
      toast.success('تم إنشاء الصفحة بنجاح')
      setShowCreateModal(false)
      setNewPage({ title: '', type: 'custom' })
      navigate(`/dashboard/pages/${res.data.data._id}/builder`)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => deletePage(store._id, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pages'] })
      toast.success('تم حذف الصفحة بنجاح')
    },
  })

  const togglePublishMutation = useMutation({
    mutationFn: ({ id, isPublished }) => updatePage(store._id, id, { isPublished: !isPublished }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pages'] })
      toast.success('تم تحديث حالة النشر')
    },
  })

  const pages = pagesRes?.data?.data || []

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 shadow-sm">
            <FileText size={20} className="text-white" />
          </div>
          <div>
            <h1 className="font-cairo text-xl font-bold text-text">الصفحات</h1>
            <p className="font-cairo text-sm text-text-muted">إدارة صفحات متجرك وتخصيص المحتوى</p>
          </div>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 font-cairo text-sm font-bold text-white shadow-sm shadow-accent/20 transition-colors hover:bg-accent/90"
        >
          <Plus size={18} />
          إضافة صفحة
        </button>
      </div>

      <div className="relative max-w-xs">
        <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          placeholder="بحث عن صفحة..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-xl border border-border bg-white py-2.5 pr-10 pl-4 font-cairo text-sm text-text placeholder:text-text-subtle focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
        />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 rounded-2xl" />
          ))}
        </div>
      ) : pages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-text-muted">
          <FileText size={56} className="mb-4 opacity-20" />
          <p className="font-cairo text-lg font-semibold">لا توجد صفحات</p>
          <p className="font-cairo text-sm mb-6">ابدأ بإنشاء أول صفحة لمتجرك</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 font-cairo text-sm font-bold text-white"
          >
            <Plus size={18} />
            إنشاء صفحة
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {pages.map((page) => (
            <div
              key={page._id}
              className="flex items-center gap-4 rounded-2xl border border-border bg-white p-4 shadow-sm transition-all hover:shadow-md"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-bg-soft">
                {page.isHomePage ? (
                  <Eye size={22} className="text-accent" />
                ) : (
                  <FileText size={22} className="text-text-muted" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-cairo text-base font-bold text-text truncate">{page.title}</h3>
                  <span className={`rounded-md px-2 py-0.5 font-cairo text-[11px] font-semibold ${PAGE_TYPE_COLORS[page.type] || 'bg-gray-100 text-gray-700'}`}>
                    {PAGE_TYPES[page.type] || page.type}
                  </span>
                  {page.isHomePage && (
                    <span className="rounded-md bg-accent-100 px-2 py-0.5 font-cairo text-[11px] font-semibold text-accent">
                      الرئيسية
                    </span>
                  )}
                </div>
                <p className="font-cairo text-xs text-text-muted mt-0.5">
                  /store/{store?.slug}/page/{page.slug}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => togglePublishMutation.mutate({ id: page._id, isPublished: page.isPublished })}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-cairo text-xs font-bold transition-colors ${
                    page.isPublished
                      ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {page.isPublished ? <Globe size={14} /> : <Lock size={14} />}
                  {page.isPublished ? 'منشور' : 'مسودة'}
                </button>
                <button
                  onClick={() => navigate(`/dashboard/pages/${page._id}/builder`)}
                  className="rounded-lg bg-primary/10 px-3 py-1.5 font-cairo text-xs font-bold text-primary transition-colors hover:bg-primary/20"
                >
                  <Pencil size={14} className="inline ml-1" />
                  تحرير
                </button>
                <button
                  onClick={() => {
                    if (confirm('هل أنت متأكد من حذف هذه الصفحة؟')) {
                      deleteMutation.mutate(page._id)
                    }
                  }}
                  className="rounded-lg bg-danger-100 px-3 py-1.5 font-cairo text-xs font-bold text-danger transition-colors hover:bg-danger-200"
                >
                  <Trash2 size={14} className="inline ml-1" />
                  حذف
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="mb-4 font-cairo text-lg font-bold text-text">إنشاء صفحة جديدة</h2>
            <div className="space-y-4">
              <div>
                <label className="block font-cairo text-sm font-semibold text-text mb-1">عنوان الصفحة</label>
                <input
                  type="text"
                  value={newPage.title}
                  onChange={(e) => setNewPage((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="مثال: من نحن"
                  className="w-full rounded-xl border border-border px-4 py-2.5 font-cairo text-sm text-text placeholder:text-text-subtle focus:border-accent focus:outline-none"
                  onKeyDown={(e) => e.key === 'Enter' && createMutation.mutate()}
                  autoFocus
                />
              </div>
              <div>
                <label className="block font-cairo text-sm font-semibold text-text mb-1">نوع الصفحة</label>
                <select
                  value={newPage.type}
                  onChange={(e) => setNewPage((prev) => ({ ...prev, type: e.target.value }))}
                  className="w-full rounded-xl border border-border px-4 py-2.5 font-cairo text-sm text-text focus:border-accent focus:outline-none"
                >
                  {Object.entries(PAGE_TYPES).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="rounded-xl border border-border px-5 py-2.5 font-cairo text-sm font-bold text-text-muted transition-colors hover:bg-bg-soft"
              >
                إلغاء
              </button>
              <button
                onClick={() => createMutation.mutate()}
                disabled={!newPage.title.trim() || createMutation.isPending}
                className="rounded-xl bg-accent px-5 py-2.5 font-cairo text-sm font-bold text-white transition-colors hover:bg-accent/90 disabled:opacity-50"
              >
                {createMutation.isPending ? '...جاري' : 'إنشاء'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
