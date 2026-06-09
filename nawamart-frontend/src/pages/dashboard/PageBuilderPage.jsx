import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Layers, Plus, GripVertical, Trash2, Copy, Save, Eye, Smartphone, Tablet, Monitor,
  ArrowLeft, Image, Type, Layout as LayoutIcon, Grid3X3, Star, Quote, Mail,
  ShoppingBag, Youtube, ChevronDown, ChevronUp, Settings, X, Palette, Code
} from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { useAuthStore } from '@/store/authStore'
import { getPage, updatePage, addSection, updateSection, removeSection, reorderSections } from '@/api/pages'
import Skeleton from '@/components/ui/Skeleton'

const SECTION_TYPES = [
  { id: 'hero', label: 'شريط رئيسي', icon: Eye, description: 'شريط عرض مع نص وصورة' },
  { id: 'banner', label: 'بانر', icon: Image, description: 'صورة إعلانية كاملة' },
  { id: 'products', label: 'منتجات', icon: ShoppingBag, description: 'شبكة منتجات' },
  { id: 'categories', label: 'تصنيفات', icon: Grid3X3, description: 'شبكة تصنيفات' },
  { id: 'text', label: 'نص', icon: Type, description: 'محتوى نصي' },
  { id: 'featured', label: 'مميزات', icon: Star, description: 'شريط مميزات' },
  { id: 'testimonials', label: 'آراء العملاء', icon: Quote, description: 'شهادات العملاء' },
  { id: 'newsletter', label: 'نشرة بريدية', icon: Mail, description: 'نموذج اشتراك' },
  { id: 'video', label: 'فيديو', icon: Youtube, description: 'مقطع فيديو' },
  { id: 'custom', label: 'HTML مخصص', icon: Code, description: 'كود HTML مخصص' },
]

const PREVIEW_MODES = [
  { id: 'desktop', icon: Monitor },
  { id: 'tablet', icon: Tablet },
  { id: 'mobile', icon: Smartphone },
]

function SectionBlock({ section, pageId, onUpdate, onRemove, index, total }) {
  const [expanded, setExpanded] = useState(true)
  const sectionType = SECTION_TYPES.find((s) => s.id === section.type) || { label: section.type, icon: Layers }

  return (
    <div className="group relative rounded-2xl border-2 border-dashed border-border bg-white shadow-sm transition-all hover:border-accent/50">
      <div className="flex items-center justify-between border-b border-border bg-bg-soft px-4 py-3">
        <div className="flex items-center gap-3">
          <GripVertical size={16} className="cursor-grab text-text-subtle" />
          <sectionType.icon size={18} className="text-accent" />
          <span className="font-cairo text-sm font-bold text-text">{section.label || sectionType.label}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setExpanded(!expanded)}
            className="rounded-lg p-1.5 text-text-muted hover:bg-border hover:text-text transition-colors"
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          <button
            onClick={() => onRemove(section.id)}
            className="rounded-lg p-1.5 text-text-muted hover:bg-danger-100 hover:text-danger transition-colors opacity-0 group-hover:opacity-100"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="space-y-4 p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-cairo text-xs font-semibold text-text mb-1">تسمية القسم</label>
              <input
                type="text"
                value={section.label || ''}
                onChange={(e) => onUpdate({ ...section, label: e.target.value })}
                className="w-full rounded-lg border border-border px-3 py-2 font-cairo text-xs text-text focus:border-accent focus:outline-none"
                placeholder="اسم القسم"
              />
            </div>
            <div>
              <label className="block font-cairo text-xs font-semibold text-text mb-1">الترتيب</label>
              <input
                type="number"
                value={section.order}
                onChange={(e) => onUpdate({ ...section, order: parseInt(e.target.value) || 0 })}
                className="w-full rounded-lg border border-border px-3 py-2 font-cairo text-xs text-text focus:border-accent focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-3">
            <p className="font-cairo text-xs font-bold text-text">إعدادات القسم</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-cairo text-[11px] text-text-muted mb-1">لون الخلفية</label>
                <input
                  type="color"
                  value={section.settings?.backgroundColor || '#FFFFFF'}
                  onChange={(e) => onUpdate({ ...section, settings: { ...section.settings, backgroundColor: e.target.value } })}
                  className="h-8 w-full cursor-pointer rounded-lg border border-border p-0.5"
                />
              </div>
              <div>
                <label className="block font-cairo text-[11px] text-text-muted mb-1">لون النص</label>
                <input
                  type="color"
                  value={section.settings?.textColor || '#1D2430'}
                  onChange={(e) => onUpdate({ ...section, settings: { ...section.settings, textColor: e.target.value } })}
                  className="h-8 w-full cursor-pointer rounded-lg border border-border p-0.5"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={section.settings?.isFullWidth || false}
                  onChange={(e) => onUpdate({ ...section, settings: { ...section.settings, isFullWidth: e.target.checked } })}
                  className="accent-accent"
                />
                <span className="font-cairo text-xs text-text">عرض كامل</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={section.settings?.showOnMobile !== false}
                  onChange={(e) => onUpdate({ ...section, settings: { ...section.settings, showOnMobile: e.target.checked } })}
                  className="accent-accent"
                />
                <span className="font-cairo text-xs text-text">جوال</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={section.settings?.showOnTablet !== false}
                  onChange={(e) => onUpdate({ ...section, settings: { ...section.settings, showOnTablet: e.target.checked } })}
                  className="accent-accent"
                />
                <span className="font-cairo text-xs text-text">جهاز لوحي</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={section.settings?.showOnDesktop !== false}
                  onChange={(e) => onUpdate({ ...section, settings: { ...section.settings, showOnDesktop: e.target.checked } })}
                  className="accent-accent"
                />
                <span className="font-cairo text-xs text-text">حاسوب</span>
              </label>
            </div>
          </div>

          {section.blocks?.length > 0 && (
            <div className="space-y-2">
              <p className="font-cairo text-xs font-bold text-text">المكونات ({section.blocks.length})</p>
              <div className="space-y-2">
                {section.blocks.map((block, bi) => (
                  <div key={block.id} className="flex items-center gap-3 rounded-xl border border-border bg-bg-soft p-3">
                    <GripVertical size={14} className="text-text-subtle shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-cairo text-xs font-semibold text-text truncate">{block.type}</p>
                      <p className="font-cairo text-[11px] text-text-muted truncate">{JSON.stringify(block.content).slice(0, 50)}</p>
                    </div>
                    <button className="rounded-lg p-1 text-text-muted hover:text-danger transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function SectionPicker({ onSelect, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl max-h-[80vh] overflow-y-auto">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-cairo text-lg font-bold text-text">إضافة قسم جديد</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-text-muted hover:bg-bg-soft transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {SECTION_TYPES.map((type) => {
            const Icon = type.icon
            return (
              <button
                key={type.id}
                onClick={() => onSelect(type.id)}
                className="flex items-start gap-4 rounded-2xl border border-border bg-bg-soft p-4 text-right transition-all hover:border-accent hover:bg-accent/5 hover:shadow-sm"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10">
                  <Icon size={20} className="text-accent" />
                </div>
                <div>
                  <p className="font-cairo text-sm font-bold text-text">{type.label}</p>
                  <p className="font-cairo text-xs text-text-muted mt-0.5">{type.description}</p>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default function PageBuilderPage() {
  const { pageId } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const store = useAuthStore((s) => s.store)

  const [previewMode, setPreviewMode] = useState('desktop')
  const [showSectionPicker, setShowSectionPicker] = useState(false)
  const [pageTitle, setPageTitle] = useState('')
  const [sections, setSections] = useState([])
  const [isDirty, setIsDirty] = useState(false)

  const { data: pageRes, isLoading } = useQuery({
    queryKey: ['page', pageId],
    queryFn: () => getPage(store._id, pageId),
    enabled: !!store?._id && !!pageId,
  })

  useEffect(() => {
    if (pageRes?.data) {
      setPageTitle(pageRes.data.title || '')
      setSections(pageRes.data.sections || [])
    }
  }, [pageRes])

  const saveMutation = useMutation({
    mutationFn: () => updatePage(store._id, pageId, { title: pageTitle }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['page'] })
      queryClient.invalidateQueries({ queryKey: ['pages'] })
      setIsDirty(false)
      toast.success('تم حفظ الصفحة بنجاح')
    },
  })

  const addSectionMutation = useMutation({
    mutationFn: (type) => addSection(store._id, pageId, { type, settings: {}, blocks: [] }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['page'] })
      setSections(res.data.data.sections || [])
      setShowSectionPicker(false)
      toast.success('تم إضافة القسم')
    },
  })

  const removeSectionMutation = useMutation({
    mutationFn: (sectionId) => removeSection(store._id, pageId, sectionId),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['page'] })
      setSections(res.data.data.sections || [])
      toast.success('تم حذف القسم')
    },
  })

  const updateSectionMutation = useMutation({
    mutationFn: ({ sectionId, data }) => updateSection(store._id, pageId, sectionId, data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['page'] })
      setSections(res.data.data.sections || [])
    },
  })

  const handleUpdateSection = useCallback((updatedSection) => {
    setSections((prev) => prev.map((s) => (s.id === updatedSection.id ? updatedSection : s)))
    setIsDirty(true)
    updateSectionMutation.mutate({ sectionId: updatedSection.id, data: updatedSection })
  }, [updateSectionMutation])

  const handleReorder = useCallback((fromIndex, toIndex) => {
    setSections((prev) => {
      const next = [...prev]
      const [moved] = next.splice(fromIndex, 1)
      next.splice(toIndex, 0, moved)
      const reordered = next.map((s, i) => ({ ...s, order: i }))
      reorderSections(store._id, pageId, reordered.map((s) => s.id))
      return reordered
    })
    setIsDirty(true)
  }, [store?._id, pageId])

  const sortedSections = [...sections].sort((a, b) => a.order - b.order)

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border bg-white px-4 py-3 md:px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard/pages')}
            className="rounded-lg p-2 text-text-muted hover:bg-bg-soft transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <input
              type="text"
              value={pageTitle}
              onChange={(e) => {
                setPageTitle(e.target.value)
                setIsDirty(true)
              }}
              className="bg-transparent font-cairo text-lg font-bold text-text focus:outline-none border-b-2 border-transparent focus:border-accent"
              placeholder="عنوان الصفحة"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-xl border border-border bg-bg-soft p-1">
            {PREVIEW_MODES.map((mode) => {
              const Icon = mode.icon
              return (
                <button
                  key={mode.id}
                  onClick={() => setPreviewMode(mode.id)}
                  className={`rounded-lg p-1.5 transition-all ${
                    previewMode === mode.id ? 'bg-white text-text shadow-sm' : 'text-text-muted hover:text-text'
                  }`}
                >
                  <Icon size={16} />
                </button>
              )
            })}
          </div>
          <button
            onClick={() => saveMutation.mutate()}
            disabled={!isDirty || saveMutation.isPending}
            className="flex items-center gap-2 rounded-xl bg-accent px-4 py-2 font-cairo text-sm font-bold text-white transition-colors hover:bg-accent/90 disabled:opacity-50"
          >
            <Save size={16} />
            {saveMutation.isPending ? '...جاري' : 'حفظ'}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-72 shrink-0 overflow-y-auto border-l border-border bg-white p-4">
          <div className="mb-4 flex items-center justify-between">
            <span className="font-cairo text-sm font-bold text-text">الأقسام ({sortedSections.length})</span>
            <button
              onClick={() => setShowSectionPicker(true)}
              className="flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 font-cairo text-xs font-bold text-white transition-colors hover:bg-accent/90"
            >
              <Plus size={14} />
              إضافة
            </button>
          </div>

          {sortedSections.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-text-muted">
              <Layers size={40} className="mb-3 opacity-30" />
              <p className="font-cairo text-sm font-semibold">لا توجد أقسام</p>
              <p className="font-cairo text-xs text-center mt-1">أضف أقساماً لبناء صفحتك</p>
              <button
                onClick={() => setShowSectionPicker(true)}
                className="mt-4 rounded-lg bg-accent/10 px-4 py-2 font-cairo text-xs font-bold text-accent"
              >
                إضافة أول قسم
              </button>
            </div>
          ) : (
            <div className="space-y-3" onDoubleClick={() => {}}>
              {sortedSections.map((section, index) => (
                <SectionBlock
                  key={section.id}
                  section={section}
                  pageId={pageId}
                  index={index}
                  total={sortedSections.length}
                  onUpdate={handleUpdateSection}
                  onRemove={(id) => removeSectionMutation.mutate(id)}
                />
              ))}
            </div>
          )}
        </div>

        <div className={`flex-1 overflow-y-auto bg-bg ${previewMode === 'mobile' ? 'p-6 flex justify-center' : ''} ${previewMode === 'tablet' ? 'p-4 flex justify-center' : ''}`}>
          <div
            className={`bg-white shadow-sm border border-border overflow-y-auto ${
              previewMode === 'mobile' ? 'w-[375px] h-[812px] rounded-3xl' : ''
            } ${previewMode === 'tablet' ? 'w-[768px] h-[1024px] rounded-2xl' : 'min-h-full w-full rounded-none'}`}
          >
            {sortedSections.length === 0 ? (
              <div className="flex h-full items-center justify-center text-text-muted">
                <div className="text-center">
                  <Layers size={48} className="mx-auto mb-3 opacity-20" />
                  <p className="font-cairo text-lg font-semibold">صفحة فارغة</p>
                  <p className="font-cairo text-sm">أضف أقساماً من القائمة الجانبية</p>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {sortedSections.map((section, i) => (
                  <div
                    key={section.id}
                    style={{
                      backgroundColor: section.settings?.backgroundColor || 'transparent',
                      color: section.settings?.textColor || 'inherit',
                    }}
                  >
                    <div className={`py-12 px-6 ${section.settings?.isFullWidth ? '' : 'max-w-6xl mx-auto'}`}>
                      <div className="text-center">
                        <p className="font-cairo text-xs text-text-muted mb-2">{section.type}</p>
                        <p className="font-cairo text-xl font-bold text-text opacity-50">
                          {section.label || SECTION_TYPES.find((s) => s.id === section.type)?.label || 'قسم'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showSectionPicker && (
        <SectionPicker
          onSelect={(type) => addSectionMutation.mutate(type)}
          onClose={() => setShowSectionPicker(false)}
        />
      )}
    </div>
  )
}
