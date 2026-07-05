import { useState } from 'react'
import { Image, Upload, Trash2, Search, FolderOpen, Tag, File, Film, Type as FontIcon } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { useAuthStore } from '@/store/authStore'
import { getAssets, getFolders, uploadAsset, updateAsset, deleteAsset } from '@/api/themeAssets'
import Skeleton from '@/components/ui/Skeleton'

const TYPE_ICONS = {
  image: Image,
  video: Film,
  font: FontIcon,
  icon: File,
  document: File,
}

const TYPE_LABELS = {
  image: 'صور',
  video: 'فيديو',
  font: 'خطوط',
  icon: 'أيقونات',
  document: 'مستندات',
}

export default function ThemeAssetsPage() {
  const queryClient = useQueryClient()
  const storeRaw = useAuthStore((s) => s.store)
  const store = Array.isArray(storeRaw) ? storeRaw[0] : storeRaw

  const [typeFilter, setTypeFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [uploading, setUploading] = useState(false)
  const [editingAsset, setEditingAsset] = useState(null)
  const [editAlt, setEditAlt] = useState('')
  const [editTags, setEditTags] = useState('')

  const { data: assetsRes, isLoading } = useQuery({
    queryKey: ['theme-assets', store?._id, typeFilter, searchQuery],
    queryFn: () => getAssets(store._id, { type: typeFilter !== 'all' ? typeFilter : undefined, search: searchQuery || undefined }),
    enabled: !!store?._id,
  })

  const { data: foldersRes } = useQuery({
    queryKey: ['theme-folders', store?._id],
    queryFn: () => getFolders(store._id),
    enabled: !!store?._id,
  })

  const assets = assetsRes?.data?.data || []
  const folders = foldersRes?.data?.data || []

  const updateMutation = useMutation({
    mutationFn: ({ assetId, data }) => updateAsset(store._id, assetId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['theme-assets'] })
      toast.success('تم تحديث الملف بنجاح')
      setEditingAsset(null)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (assetId) => deleteAsset(store._id, assetId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['theme-assets'] })
      toast.success('تم حذف الملف بنجاح')
    },
  })

  const handleUpload = async (e) => {
    const files = e.target.files
    if (!files?.length) return

    setUploading(true)
    try {
      for (const file of files) {
        const formData = new FormData()
        formData.append('file', file)
        await uploadAsset(store._id, formData)
      }
      queryClient.invalidateQueries({ queryKey: ['theme-assets'] })
      toast.success(`تم رفع ${files.length} ملف بنجاح`)
    } catch {
      toast.error('فشل رفع الملفات')
    }
    setUploading(false)
    e.target.value = ''
  }

  if (isLoading) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-sm">
            <Image size={20} className="text-white" />
          </div>
          <div>
            <h1 className="font-cairo text-xl font-bold text-text">مدير الملفات</h1>
            <p className="font-cairo text-sm text-text-muted">رفع وإدارة صور وفيديوهات وخطوط المتجر</p>
          </div>
        </div>
        <label className="flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-l from-accent to-accent-600 px-4 py-2.5 font-cairo text-sm font-bold text-white shadow-lg shadow-accent/20 transition-all hover:shadow-xl">
          <Upload size={16} />
          {uploading ? '...جاري الرفع' : 'رفع ملفات'}
          <input type="file" multiple accept="image/*,video/*,font/*,.ttf,.woff,.woff2,.eot,.svg" onChange={handleUpload} className="hidden" disabled={uploading} />
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input type="text" placeholder="بحث..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-border bg-white py-2.5 pr-10 pl-4 font-cairo text-sm text-text placeholder:text-text-subtle focus:border-accent focus:outline-none" />
        </div>
        <div className="flex rounded-xl border border-border/60 bg-bg-soft p-1">
          {[
            { value: 'all', label: 'الكل' },
            ...Object.entries(TYPE_LABELS).map(([k, v]) => ({ value: k, label: v })),
          ].map((t) => (
            <button key={t.value} onClick={() => setTypeFilter(t.value)}
              className={`rounded-lg px-3 py-1.5 font-cairo text-xs font-semibold transition-all ${
                typeFilter === t.value ? 'bg-white text-text shadow-sm' : 'text-text-muted hover:text-text'
              }`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {assets.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border/60 bg-white p-12">
          <Upload size={48} className="text-text-subtle mb-4" />
          <h3 className="font-cairo text-lg font-bold text-text mb-2">لا توجد ملفات</h3>
          <p className="font-cairo text-sm text-text-muted mb-4 text-center">ارفع صور وفيديوهات وخطوط لاستخدامها في متجرك</p>
          <label className="flex cursor-pointer items-center gap-2 rounded-xl bg-accent px-4 py-2.5 font-cairo text-sm font-bold text-white transition-all hover:bg-accent-600">
            <Upload size={16} />
            رفع ملفات
            <input type="file" multiple onChange={handleUpload} className="hidden" />
          </label>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {assets.map((asset) => {
            const Icon = TYPE_ICONS[asset.type] || File
            return (
              <div key={asset._id} className="group relative rounded-2xl border border-border/60 bg-white overflow-hidden transition-all hover:border-accent/30 hover:shadow-md">
                {asset.type === 'image' ? (
                  <div className="aspect-square overflow-hidden bg-bg-soft">
                    <img src={asset.url} alt={asset.alt || asset.originalName} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                  </div>
                ) : (
                  <div className="flex aspect-square items-center justify-center bg-bg-soft">
                    <Icon size={32} className="text-text-subtle" />
                  </div>
                )}
                <div className="p-2">
                  <p className="truncate font-cairo text-[11px] font-semibold text-text" title={asset.originalName}>
                    {asset.originalName}
                  </p>
                  <p className="font-cairo text-[10px] text-text-subtle">
                    {(asset.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                  {asset.type === 'image' && (
                    <a href={asset.url} target="_blank" rel="noopener noreferrer" className="rounded-lg bg-white px-2.5 py-1 font-cairo text-[11px] font-bold text-text transition-all hover:bg-accent hover:text-white">
                      عرض
                    </a>
                  )}
                  <button onClick={() => { setEditingAsset(asset); setEditAlt(asset.alt || ''); setEditTags((asset.tags || []).join(', ')) }}
                    className="rounded-lg bg-white px-2.5 py-1 font-cairo text-[11px] font-bold text-text transition-all hover:bg-accent hover:text-white">
                    تعديل
                  </button>
                  <button onClick={() => { if (confirm('هل أنت متأكد من حذف هذا الملف؟')) deleteMutation.mutate(asset._id) }}
                    className="rounded-lg bg-white p-1.5 text-text transition-all hover:bg-danger hover:text-white">
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {editingAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="font-cairo text-lg font-bold text-text mb-1">تعديل الملف</h2>
            <p className="font-cairo text-sm text-text-muted mb-4">{editingAsset.originalName}</p>
            {editingAsset.type === 'image' && (
              <img src={editingAsset.url} alt={editingAsset.originalName} className="mb-4 h-32 w-full rounded-xl object-cover" />
            )}
            <div className="space-y-4">
              <div>
                <label className="block font-cairo text-sm font-bold text-text mb-1">النص البديل</label>
                <input type="text" value={editAlt} onChange={(e) => setEditAlt(e.target.value)}
                  placeholder="وصف الصورة" className="w-full rounded-xl border border-border/60 px-4 py-2.5 font-cairo text-sm text-text placeholder:text-text-subtle focus:border-accent focus:outline-none" />
              </div>
              <div>
                <label className="block font-cairo text-sm font-bold text-text mb-1">الوسوم</label>
                <input type="text" value={editTags} onChange={(e) => setEditTags(e.target.value)}
                  placeholder="وسم1, وسم2, وسم3" className="w-full rounded-xl border border-border/60 px-4 py-2.5 font-cairo text-sm text-text placeholder:text-text-subtle focus:border-accent focus:outline-none" />
                <p className="font-cairo text-[10px] text-text-subtle mt-1">افصل بين الوسوم بفاصلة</p>
              </div>
            </div>
            <div className="mt-6 flex items-center gap-3">
              <button onClick={() => setEditingAsset(null)} className="flex-1 rounded-xl border border-border/60 px-4 py-3 font-cairo text-sm font-semibold text-text-muted transition-all hover:bg-bg-soft">
                إلغاء
              </button>
              <button onClick={() => updateMutation.mutate({
                assetId: editingAsset._id,
                data: { alt: editAlt, tags: editTags.split(',').map((t) => t.trim()).filter(Boolean) },
              })} disabled={updateMutation.isPending} className="flex-1 rounded-xl bg-accent px-4 py-3 font-cairo text-sm font-bold text-white transition-all hover:bg-accent-600 disabled:opacity-50">
                {updateMutation.isPending ? '...جاري الحفظ' : 'حفظ'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
