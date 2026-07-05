import { useState } from 'react'
import { Save, Upload, Trash2, Globe, Eye, Plus, Check, FileJson } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { useAuthStore } from '@/store/authStore'
import { getPresets, savePreset, applyPreset, deletePreset, togglePresetPublic } from '@/api/themePresets'
import Skeleton from '@/components/ui/Skeleton'

export default function ThemePresetsPage() {
  const queryClient = useQueryClient()
  const storeRaw = useAuthStore((s) => s.store)
  const store = Array.isArray(storeRaw) ? storeRaw[0] : storeRaw

  const [showSaveModal, setShowSaveModal] = useState(false)
  const [presetName, setPresetName] = useState('')
  const [makePublic, setMakePublic] = useState(false)

  const { data: presetsRes, isLoading } = useQuery({
    queryKey: ['theme-presets', store?._id],
    queryFn: () => getPresets(store._id),
    enabled: !!store?._id,
  })

  const presets = presetsRes?.data?.data || []

  const saveMutation = useMutation({
    mutationFn: (data) => savePreset(store._id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['theme-presets'] })
      toast.success('تم حفظ الإعداد المسبق بنجاح')
      setShowSaveModal(false)
      setPresetName('')
    },
  })

  const applyMutation = useMutation({
    mutationFn: (presetId) => applyPreset(store._id, presetId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['theme-settings'] })
      toast.success('تم تطبيق الإعداد المسبق بنجاح')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (presetId) => deletePreset(store._id, presetId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['theme-presets'] })
      toast.success('تم حذف الإعداد المسبق بنجاح')
    },
  })

  const toggleMutation = useMutation({
    mutationFn: (presetId) => togglePresetPublic(store._id, presetId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['theme-presets'] })
    },
  })

  const handleExport = (preset) => {
    const blob = new Blob([JSON.stringify(preset.settings, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${preset.name}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('تم تصدير الإعدادات بنجاح')
  }

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = e.target.files[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (ev) => {
        try {
          const settings = JSON.parse(ev.target.result)
          const name = file.name.replace('.json', '')
          saveMutation.mutate({ name, settings, screenshot: null, isPublic: false })
        } catch {
          toast.error('الملف غير صالح')
        }
      }
      reader.readAsText(file)
    }
    input.click()
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
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-sm">
            <Save size={20} className="text-white" />
          </div>
          <div>
            <h1 className="font-cairo text-xl font-bold text-text">الإعدادات المسبقة</h1>
            <p className="font-cairo text-sm text-text-muted">احفظ وطبق إعدادات التخصيص بسرعة</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleImport} className="flex items-center gap-2 rounded-xl border border-border/60 bg-white px-4 py-2.5 font-cairo text-sm font-semibold text-text transition-all hover:border-accent/30 hover:text-accent">
            <Upload size={16} />
            استيراد
          </button>
          <button onClick={() => setShowSaveModal(true)} className="flex items-center gap-2 rounded-xl bg-gradient-to-l from-accent to-accent-600 px-4 py-2.5 font-cairo text-sm font-bold text-white shadow-lg shadow-accent/20 transition-all hover:shadow-xl">
            <Plus size={16} />
            حفظ الإعدادات الحالية
          </button>
        </div>
      </div>

      {presets.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border/60 bg-white p-12">
          <Save size={48} className="text-text-subtle mb-4" />
          <h3 className="font-cairo text-lg font-bold text-text mb-2">لا توجد إعدادات مسبقة</h3>
          <p className="font-cairo text-sm text-text-muted mb-4 text-center">احفظ إعدادات التخصيص الحالية كإعداد مسبق لتطبيقها لاحقاً</p>
          <button onClick={() => setShowSaveModal(true)} className="flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 font-cairo text-sm font-bold text-white transition-all hover:bg-accent-600">
            <Plus size={16} />
            إنشاء إعداد مسبق
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {presets.map((preset) => (
            <div key={preset._id} className="group relative rounded-2xl border border-border/60 bg-white p-5 transition-all hover:border-accent/30 hover:shadow-md">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-cairo text-base font-bold text-text">{preset.name}</h3>
                  <p className="font-cairo text-xs text-text-subtle">{new Date(preset.createdAt).toLocaleDateString('ar-YE')}</p>
                </div>
                {preset.isPublic && (
                  <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 font-cairo text-[10px] font-semibold text-emerald-700">
                    <Globe size={10} />
                    عام
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {Object.keys(preset.settings || {}).filter((k) => preset.settings[k] && typeof preset.settings[k] === 'object').slice(0, 5).map((k) => (
                  <span key={k} className="rounded-lg bg-bg-soft/50 px-2 py-0.5 font-cairo text-[10px] text-text-muted">
                    {k}
                  </span>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-2 border-t border-border/40 pt-3">
                <button onClick={() => applyMutation.mutate(preset._id)} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-accent/10 px-3 py-2 font-cairo text-xs font-bold text-accent transition-all hover:bg-accent hover:text-white">
                  <Check size={14} />
                  تطبيق
                </button>
                <button onClick={() => toggleMutation.mutate(preset._id)} className="rounded-xl border border-border/60 p-2 text-text-muted transition-all hover:border-accent/30 hover:text-accent" title={preset.isPublic ? 'إلغاء النشر' : 'نشر عام'}>
                  <Globe size={14} />
                </button>
                <button onClick={() => handleExport(preset)} className="rounded-xl border border-border/60 p-2 text-text-muted transition-all hover:border-accent/30 hover:text-accent" title="تصدير">
                  <FileJson size={14} />
                </button>
                <button onClick={() => { if (confirm('هل أنت متأكد من حذف هذا الإعداد المسبق؟')) deleteMutation.mutate(preset._id) }} className="rounded-xl border border-border/60 p-2 text-text-muted transition-all hover:border-danger/30 hover:text-danger" title="حذف">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="font-cairo text-lg font-bold text-text mb-1">حفظ الإعدادات الحالية</h2>
            <p className="font-cairo text-sm text-text-muted mb-4">سيتم حفظ جميع إعدادات التخصيص الحالية</p>
            <div className="space-y-4">
              <div>
                <label className="block font-cairo text-sm font-bold text-text mb-1">اسم الإعداد المسبق</label>
                <input type="text" value={presetName} onChange={(e) => setPresetName(e.target.value)} placeholder="مثال: متجر شتوي 2026" className="w-full rounded-xl border border-border/60 bg-white px-4 py-2.5 font-cairo text-sm text-text placeholder:text-text-subtle focus:border-accent focus:outline-none" />
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <button onClick={() => setMakePublic(!makePublic)} className={`relative h-6 w-10 rounded-full transition-colors ${makePublic ? 'bg-accent' : 'bg-border'}`}>
                  <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${makePublic ? 'translate-x-[18px]' : 'translate-x-0.5'}`} />
                </button>
                <span className="font-cairo text-sm text-text">نشر عام للإعداد المسبق</span>
              </label>
            </div>
            <div className="mt-6 flex items-center gap-3">
              <button onClick={() => { setShowSaveModal(false); setPresetName('') }} className="flex-1 rounded-xl border border-border/60 px-4 py-3 font-cairo text-sm font-semibold text-text-muted transition-all hover:bg-bg-soft">
                إلغاء
              </button>
              <button onClick={() => { if (presetName.trim()) saveMutation.mutate({ name: presetName.trim(), isPublic: makePublic }) }} disabled={!presetName.trim() || saveMutation.isPending} className="flex-1 rounded-xl bg-accent px-4 py-3 font-cairo text-sm font-bold text-white transition-all hover:bg-accent-600 disabled:opacity-50">
                {saveMutation.isPending ? '...جاري الحفظ' : 'حفظ'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
