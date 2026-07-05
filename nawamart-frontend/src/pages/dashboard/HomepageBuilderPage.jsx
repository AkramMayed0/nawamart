import { useState, useEffect } from 'react'
import { LayoutDashboard, Plus, GripVertical, Eye, EyeOff, Trash2, Settings, ChevronUp, ChevronDown, Save, Image, Tag, MessageSquare, Mail, Film, Timer, FileText, Camera, Minus, Crosshair, Building2, BarChart3, Code } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { useAuthStore } from '@/store/authStore'
import { getSections, createSection, updateSection, deleteSection, reorderSections, toggleSection } from '@/api/homepage'
import Skeleton from '@/components/ui/Skeleton'

const SECTION_TYPES = [
  { value: 'hero', label: 'القسم الرئيسي', icon: Image, desc: 'صورة أو فيديو مع نص وزر' },
  { value: 'featuredProducts', label: 'منتجات مميزة', icon: Tag, desc: 'عرض منتجات مختارة' },
  { value: 'imageText', label: 'صورة + نص', icon: Image, desc: 'نص وصورة جنباً إلى جنب' },
  { value: 'testimonials', label: 'آراء العملاء', icon: MessageSquare, desc: 'شهادات العملاء' },
  { value: 'newsletter', label: 'النشرة البريدية', icon: Mail, desc: 'نموذج اشتراك' },
  { value: 'gallery', label: 'معرض صور', icon: Image, desc: 'شبكة صور' },
  { value: 'video', label: 'فيديو', icon: Film, desc: 'مقطع فيديو' },
  { value: 'countdown', label: 'عد تنازلي', icon: Timer, desc: 'مؤقت للعروض' },
  { value: 'blogPosts', label: 'المدونة', icon: FileText, desc: 'أحدث المقالات' },
  { value: 'instagram', label: 'إنستغرام', icon: Camera, desc: 'صور من إنستغرام' },
  { value: 'divider', label: 'فاصل', icon: Minus, desc: 'خط فاصل' },
  { value: 'iconCards', label: 'بطاقات أيقونات', icon: Crosshair, desc: 'مميزات مع أيقونات' },
  { value: 'brands', label: 'العلامات التجارية', icon: Building2, desc: 'شعارات الشركاء' },
  { value: 'stats', label: 'إحصائيات', icon: BarChart3, desc: 'أرقام وإحصائيات' },
  { value: 'customHtml', label: 'HTML مخصص', icon: Code, desc: 'كود HTML مخصص' },
]

function SectionEditor({ section, onUpdate, onDelete, onToggle }) {
  const [showEditor, setShowEditor] = useState(false)

  const renderFields = () => {
    switch (section.type) {
      case 'hero':
        return (
          <div className="space-y-3">
            <input type="text" value={section.settings?.title || ''} onChange={(e) => onUpdate({ settings: { ...section.settings, title: e.target.value } })}
              placeholder="العنوان الرئيسي" className="w-full rounded-lg border border-border/60 px-3 py-2 font-cairo text-sm" />
            <textarea value={section.settings?.subtitle || ''} onChange={(e) => onUpdate({ settings: { ...section.settings, subtitle: e.target.value } })}
              placeholder="النص الفرعي" className="w-full rounded-lg border border-border/60 px-3 py-2 font-cairo text-sm" rows={2} />
            <input type="text" value={section.settings?.ctaText || ''} onChange={(e) => onUpdate({ settings: { ...section.settings, ctaText: e.target.value } })}
              placeholder="نص الزر" className="w-full rounded-lg border border-border/60 px-3 py-2 font-cairo text-sm" />
            <input type="url" value={section.settings?.ctaLink || ''} onChange={(e) => onUpdate({ settings: { ...section.settings, ctaLink: e.target.value } })}
              placeholder="رابط الزر" className="w-full rounded-lg border border-border/60 px-3 py-2 font-cairo text-sm" />
            <input type="url" value={section.settings?.backgroundImage || ''} onChange={(e) => onUpdate({ settings: { ...section.settings, backgroundImage: e.target.value } })}
              placeholder="رابط صورة الخلفية" className="w-full rounded-lg border border-border/60 px-3 py-2 font-cairo text-sm" />
            <select value={section.settings?.height || 'large'} onChange={(e) => onUpdate({ settings: { ...section.settings, height: e.target.value } })}
              className="w-full rounded-lg border border-border/60 px-3 py-2 font-cairo text-sm">
              <option value="small">صغير</option>
              <option value="medium">متوسط</option>
              <option value="large">كبير</option>
              <option value="fullscreen">شاشة كاملة</option>
            </select>
            <label className="flex items-center gap-2 cursor-pointer">
              <button onClick={() => onUpdate({ settings: { ...section.settings, parallax: !section.settings?.parallax } })}
                className={`relative h-5 w-9 rounded-full transition-colors ${section.settings?.parallax ? 'bg-accent' : 'bg-border'}`}>
                <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${section.settings?.parallax ? 'translate-x-[16px]' : 'translate-x-0.5'}`} />
              </button>
              <span className="font-cairo text-xs text-text">تأثير اختلاف المنظر</span>
            </label>
          </div>
        )
      case 'featuredProducts':
        return (
          <div className="space-y-3">
            <input type="text" value={section.settings?.title || ''} onChange={(e) => onUpdate({ settings: { ...section.settings, title: e.target.value } })}
              placeholder="العنوان" className="w-full rounded-lg border border-border/60 px-3 py-2 font-cairo text-sm" />
            <select value={section.settings?.source || 'all'} onChange={(e) => onUpdate({ settings: { ...section.settings, source: e.target.value } })}
              className="w-full rounded-lg border border-border/60 px-3 py-2 font-cairo text-sm">
              <option value="all">جميع المنتجات</option>
              <option value="featured">المميزة</option>
              <option value="bestsellers">الأكثر مبيعاً</option>
              <option value="newest">الأحدث</option>
            </select>
            <select value={section.settings?.layout || 'grid'} onChange={(e) => onUpdate({ settings: { ...section.settings, layout: e.target.value } })}
              className="w-full rounded-lg border border-border/60 px-3 py-2 font-cairo text-sm">
              <option value="grid">شبكة</option>
              <option value="carousel">دائري</option>
            </select>
            <input type="number" value={section.settings?.limit || 8} onChange={(e) => onUpdate({ settings: { ...section.settings, limit: parseInt(e.target.value) || 8 } })}
              placeholder="عدد المنتجات" className="w-full rounded-lg border border-border/60 px-3 py-2 font-cairo text-sm" />
          </div>
        )
      case 'imageText':
        return (
          <div className="space-y-3">
            <input type="text" value={section.settings?.title || ''} onChange={(e) => onUpdate({ settings: { ...section.settings, title: e.target.value } })}
              placeholder="العنوان" className="w-full rounded-lg border border-border/60 px-3 py-2 font-cairo text-sm" />
            <textarea value={section.settings?.content || ''} onChange={(e) => onUpdate({ settings: { ...section.settings, content: e.target.value } })}
              placeholder="المحتوى" className="w-full rounded-lg border border-border/60 px-3 py-2 font-cairo text-sm" rows={3} />
            <input type="url" value={section.settings?.image || ''} onChange={(e) => onUpdate({ settings: { ...section.settings, image: e.target.value } })}
              placeholder="رابط الصورة" className="w-full rounded-lg border border-border/60 px-3 py-2 font-cairo text-sm" />
            <select value={section.settings?.imagePosition || 'left'} onChange={(e) => onUpdate({ settings: { ...section.settings, imagePosition: e.target.value } })}
              className="w-full rounded-lg border border-border/60 px-3 py-2 font-cairo text-sm">
              <option value="left">صورة يسار</option>
              <option value="right">صورة يمين</option>
            </select>
            <input type="text" value={section.settings?.ctaText || ''} onChange={(e) => onUpdate({ settings: { ...section.settings, ctaText: e.target.value } })}
              placeholder="نص الزر" className="w-full rounded-lg border border-border/60 px-3 py-2 font-cairo text-sm" />
            <input type="url" value={section.settings?.ctaLink || ''} onChange={(e) => onUpdate({ settings: { ...section.settings, ctaLink: e.target.value } })}
              placeholder="رابط الزر" className="w-full rounded-lg border border-border/60 px-3 py-2 font-cairo text-sm" />
          </div>
        )
      case 'testimonials':
        return (
          <div className="space-y-3">
            <input type="text" value={section.settings?.title || ''} onChange={(e) => onUpdate({ settings: { ...section.settings, title: e.target.value } })}
              placeholder="العنوان" className="w-full rounded-lg border border-border/60 px-3 py-2 font-cairo text-sm" />
            <select value={section.settings?.layout || 'grid'} onChange={(e) => onUpdate({ settings: { ...section.settings, layout: e.target.value } })}
              className="w-full rounded-lg border border-border/60 px-3 py-2 font-cairo text-sm">
              <option value="grid">شبكة</option>
              <option value="carousel">دائري</option>
              <option value="single">واحد</option>
            </select>
            <label className="flex items-center gap-2 cursor-pointer">
              <button onClick={() => onUpdate({ settings: { ...section.settings, autoplay: !section.settings?.autoplay } })}
                className={`relative h-5 w-9 rounded-full transition-colors ${section.settings?.autoplay ? 'bg-accent' : 'bg-border'}`}>
                <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${section.settings?.autoplay ? 'translate-x-[16px]' : 'translate-x-0.5'}`} />
              </button>
              <span className="font-cairo text-xs text-text">تشغيل تلقائي</span>
            </label>
          </div>
        )
      case 'newsletter':
        return (
          <div className="space-y-3">
            <input type="text" value={section.settings?.title || ''} onChange={(e) => onUpdate({ settings: { ...section.settings, title: e.target.value } })}
              placeholder="العنوان" className="w-full rounded-lg border border-border/60 px-3 py-2 font-cairo text-sm" />
            <textarea value={section.settings?.description || ''} onChange={(e) => onUpdate({ settings: { ...section.settings, description: e.target.value } })}
              placeholder="الوصف" className="w-full rounded-lg border border-border/60 px-3 py-2 font-cairo text-sm" rows={2} />
            <input type="text" value={section.settings?.buttonText || 'اشتراك'} onChange={(e) => onUpdate({ settings: { ...section.settings, buttonText: e.target.value } })}
              placeholder="نص الزر" className="w-full rounded-lg border border-border/60 px-3 py-2 font-cairo text-sm" />
            <textarea value={section.settings?.disclaimer || ''} onChange={(e) => onUpdate({ settings: { ...section.settings, disclaimer: e.target.value } })}
              placeholder="إخلاء مسؤولية" className="w-full rounded-lg border border-border/60 px-3 py-2 font-cairo text-sm" rows={2} />
          </div>
        )
      case 'gallery':
        return (
          <div className="space-y-3">
            <select value={section.settings?.layout || 'grid'} onChange={(e) => onUpdate({ settings: { ...section.settings, layout: e.target.value } })}
              className="w-full rounded-lg border border-border/60 px-3 py-2 font-cairo text-sm">
              <option value="grid">شبكة</option>
              <option value="masonry">متداخل</option>
              <option value="carousel">دائري</option>
            </select>
            <select value={String(section.settings?.columns || 3)} onChange={(e) => onUpdate({ settings: { ...section.settings, columns: parseInt(e.target.value) } })}
              className="w-full rounded-lg border border-border/60 px-3 py-2 font-cairo text-sm">
              {[2, 3, 4, 5, 6].map((n) => (<option key={n} value={String(n)}>{n} أعمدة</option>))}
            </select>
            <label className="flex items-center gap-2 cursor-pointer">
              <button onClick={() => onUpdate({ settings: { ...section.settings, lightbox: !section.settings?.lightbox } })}
                className={`relative h-5 w-9 rounded-full transition-colors ${section.settings?.lightbox ? 'bg-accent' : 'bg-border'}`}>
                <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${section.settings?.lightbox ? 'translate-x-[16px]' : 'translate-x-0.5'}`} />
              </button>
              <span className="font-cairo text-xs text-text">صندوق ضوئي</span>
            </label>
          </div>
        )
      case 'video':
        return (
          <div className="space-y-3">
            <input type="url" value={section.settings?.url || ''} onChange={(e) => onUpdate({ settings: { ...section.settings, url: e.target.value } })}
              placeholder="رابط الفيديو (YouTube/Vimeo)" className="w-full rounded-lg border border-border/60 px-3 py-2 font-cairo text-sm" />
            <select value={section.settings?.aspectRatio || '16:9'} onChange={(e) => onUpdate({ settings: { ...section.settings, aspectRatio: e.target.value } })}
              className="w-full rounded-lg border border-border/60 px-3 py-2 font-cairo text-sm">
              <option value="16:9">16:9</option>
              <option value="4:3">4:3</option>
              <option value="1:1">1:1</option>
            </select>
            <label className="flex items-center gap-2 cursor-pointer">
              <button onClick={() => onUpdate({ settings: { ...section.settings, autoplay: !section.settings?.autoplay } })}
                className={`relative h-5 w-9 rounded-full transition-colors ${section.settings?.autoplay ? 'bg-accent' : 'bg-border'}`}>
                <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${section.settings?.autoplay ? 'translate-x-[16px]' : 'translate-x-0.5'}`} />
              </button>
              <span className="font-cairo text-xs text-text">تشغيل تلقائي</span>
            </label>
          </div>
        )
      case 'countdown':
        return (
          <div className="space-y-3">
            <input type="text" value={section.settings?.title || ''} onChange={(e) => onUpdate({ settings: { ...section.settings, title: e.target.value } })}
              placeholder="العنوان" className="w-full rounded-lg border border-border/60 px-3 py-2 font-cairo text-sm" />
            <input type="datetime-local" value={section.settings?.endDate || ''} onChange={(e) => onUpdate({ settings: { ...section.settings, endDate: e.target.value } })}
              className="w-full rounded-lg border border-border/60 px-3 py-2 font-cairo text-sm" />
            <select value={section.settings?.expireAction || 'hide'} onChange={(e) => onUpdate({ settings: { ...section.settings, expireAction: e.target.value } })}
              className="w-full rounded-lg border border-border/60 px-3 py-2 font-cairo text-sm">
              <option value="hide">إخفاء القسم</option>
              <option value="showMessage">عرض رسالة</option>
            </select>
            <input type="text" value={section.settings?.ctaText || ''} onChange={(e) => onUpdate({ settings: { ...section.settings, ctaText: e.target.value } })}
              placeholder="نص الزر" className="w-full rounded-lg border border-border/60 px-3 py-2 font-cairo text-sm" />
            <input type="url" value={section.settings?.ctaLink || ''} onChange={(e) => onUpdate({ settings: { ...section.settings, ctaLink: e.target.value } })}
              placeholder="رابط الزر" className="w-full rounded-lg border border-border/60 px-3 py-2 font-cairo text-sm" />
          </div>
        )
      case 'blogPosts':
        return (
          <div className="space-y-3">
            <input type="text" value={section.settings?.title || ''} onChange={(e) => onUpdate({ settings: { ...section.settings, title: e.target.value } })}
              placeholder="العنوان" className="w-full rounded-lg border border-border/60 px-3 py-2 font-cairo text-sm" />
            <select value={section.settings?.layout || 'grid'} onChange={(e) => onUpdate({ settings: { ...section.settings, layout: e.target.value } })}
              className="w-full rounded-lg border border-border/60 px-3 py-2 font-cairo text-sm">
              <option value="grid">شبكة</option>
              <option value="list">قائمة</option>
              <option value="carousel">دائري</option>
            </select>
            <input type="number" value={section.settings?.limit || 3} onChange={(e) => onUpdate({ settings: { ...section.settings, limit: parseInt(e.target.value) || 3 } })}
              placeholder="عدد المقالات" className="w-full rounded-lg border border-border/60 px-3 py-2 font-cairo text-sm" />
          </div>
        )
      case 'instagram':
        return (
          <div className="space-y-3">
            <input type="text" value={section.settings?.title || ''} onChange={(e) => onUpdate({ settings: { ...section.settings, title: e.target.value } })}
              placeholder="العنوان" className="w-full rounded-lg border border-border/60 px-3 py-2 font-cairo text-sm" />
            <input type="text" value={section.settings?.token || ''} onChange={(e) => onUpdate({ settings: { ...section.settings, token: e.target.value } })}
              placeholder="Instagram Token" className="w-full rounded-lg border border-border/60 px-3 py-2 font-cairo text-sm" />
            <input type="number" value={section.settings?.count || 8} onChange={(e) => onUpdate({ settings: { ...section.settings, count: parseInt(e.target.value) || 8 } })}
              placeholder="عدد الصور" className="w-full rounded-lg border border-border/60 px-3 py-2 font-cairo text-sm" />
          </div>
        )
      case 'iconCards':
        return (
          <div className="space-y-3">
            <input type="text" value={section.settings?.title || ''} onChange={(e) => onUpdate({ settings: { ...section.settings, title: e.target.value } })}
              placeholder="العنوان" className="w-full rounded-lg border border-border/60 px-3 py-2 font-cairo text-sm" />
            <select value={String(section.settings?.columns || 3)} onChange={(e) => onUpdate({ settings: { ...section.settings, columns: parseInt(e.target.value) } })}
              className="w-full rounded-lg border border-border/60 px-3 py-2 font-cairo text-sm">
              {[2, 3, 4].map((n) => (<option key={n} value={String(n)}>{n} أعمدة</option>))}
            </select>
          </div>
        )
      case 'stats':
        return (
          <div className="space-y-3">
            <input type="text" value={section.settings?.title || ''} onChange={(e) => onUpdate({ settings: { ...section.settings, title: e.target.value } })}
              placeholder="العنوان" className="w-full rounded-lg border border-border/60 px-3 py-2 font-cairo text-sm" />
            <select value={String(section.settings?.columns || 4)} onChange={(e) => onUpdate({ settings: { ...section.settings, columns: parseInt(e.target.value) } })}
              className="w-full rounded-lg border border-border/60 px-3 py-2 font-cairo text-sm">
              {[2, 3, 4].map((n) => (<option key={n} value={String(n)}>{n} أعمدة</option>))}
            </select>
          </div>
        )
      case 'brands':
        return (
          <div className="space-y-3">
            <input type="text" value={section.settings?.title || ''} onChange={(e) => onUpdate({ settings: { ...section.settings, title: e.target.value } })}
              placeholder="العنوان" className="w-full rounded-lg border border-border/60 px-3 py-2 font-cairo text-sm" />
          </div>
        )
      case 'divider':
        return (
          <div className="space-y-3">
            <select value={section.settings?.style || 'line'} onChange={(e) => onUpdate({ settings: { ...section.settings, style: e.target.value } })}
              className="w-full rounded-lg border border-border/60 px-3 py-2 font-cairo text-sm">
              <option value="line">خط</option>
              <option value="dots">نقاط</option>
              <option value="spacing">فراغ</option>
            </select>
            <input type="text" value={section.settings?.height || '2rem'} onChange={(e) => onUpdate({ settings: { ...section.settings, height: e.target.value } })}
              placeholder="المسافة" className="w-full rounded-lg border border-border/60 px-3 py-2 font-cairo text-sm" />
          </div>
        )
      case 'customHtml':
        return (
          <div className="space-y-3">
            <textarea value={section.settings?.html || ''} onChange={(e) => onUpdate({ settings: { ...section.settings, html: e.target.value } })}
              placeholder="<div>محتوى HTML مخصص</div>" className="w-full rounded-lg border border-border/60 px-3 py-2 font-mono text-xs" rows={5} dir="ltr" />
          </div>
        )
      default:
        return <p className="font-cairo text-xs text-text-muted">اختر نوع القسم لتظهر الإعدادات</p>
    }
  }

  return (
    <div className="rounded-2xl border border-border/60 bg-white p-4 transition-all hover:border-accent/30">
      <div className="flex items-center gap-3">
        <div className="cursor-grab text-text-subtle">
          <GripVertical size={16} />
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-bg-soft">
          {(() => { const Icon = SECTION_TYPES.find((t) => t.value === section.type)?.icon || Image; return <Icon size={18} className="text-text-muted" /> })()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-cairo text-sm font-bold text-text truncate">
            {section.settings?.title || SECTION_TYPES.find((t) => t.value === section.type)?.label || section.type}
          </p>
          <p className="font-cairo text-[11px] text-text-subtle">{SECTION_TYPES.find((t) => t.value === section.type)?.label || section.type}</p>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setShowEditor(!showEditor)} className={`rounded-lg p-1.5 transition-all ${showEditor ? 'bg-accent/10 text-accent' : 'text-text-muted hover:text-text'}`}>
            <Settings size={14} />
          </button>
          <button onClick={() => onToggle()} className={`rounded-lg p-1.5 transition-all ${section.visible ? 'text-text-muted hover:text-text' : 'text-danger'}`}>
            {section.visible ? <Eye size={14} /> : <EyeOff size={14} />}
          </button>
          <button onClick={() => onDelete()} className="rounded-lg p-1.5 text-text-muted transition-all hover:text-danger">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      {showEditor && (
        <div className="mt-3 border-t border-border/40 pt-3">
          {renderFields()}
        </div>
      )}
    </div>
  )
}

export default function HomepageBuilderPage() {
  const queryClient = useQueryClient()
  const storeRaw = useAuthStore((s) => s.store)
  const store = Array.isArray(storeRaw) ? storeRaw[0] : storeRaw

  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedType, setSelectedType] = useState('hero')

  const { data: sectionsRes, isLoading } = useQuery({
    queryKey: ['homepage-sections', store?._id],
    queryFn: () => getSections(store._id),
    enabled: !!store?._id,
  })

  const sections = sectionsRes?.data?.data || []

  const createMutation = useMutation({
    mutationFn: (data) => createSection(store._id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homepage-sections'] })
      toast.success('تم إضافة القسم بنجاح')
      setShowAddModal(false)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ sectionId, data }) => updateSection(store._id, sectionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homepage-sections'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (sectionId) => deleteSection(store._id, sectionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homepage-sections'] })
      toast.success('تم حذف القسم بنجاح')
    },
  })

  const toggleMutation = useMutation({
    mutationFn: (sectionId) => toggleSection(store._id, sectionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homepage-sections'] })
    },
  })

  const handleMove = (index, direction) => {
    const items = [...sections]
    const targetIndex = index + direction
    if (targetIndex < 0 || targetIndex >= items.length) return
    const orders = items.map((item, i) => {
      let order = i
      if (i === index) order = targetIndex
      else if (i === targetIndex) order = index
      return { id: item._id, order }
    })
    reorderSections(store._id, orders).then(() => {
      queryClient.invalidateQueries({ queryKey: ['homepage-sections'] })
    })
  }

  const handleUpdateSection = (sectionId, data) => {
    updateMutation.mutate({ sectionId, data })
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
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 shadow-sm">
            <LayoutDashboard size={20} className="text-white" />
          </div>
          <div>
            <h1 className="font-cairo text-xl font-bold text-text">بناء الصفحة الرئيسية</h1>
            <p className="font-cairo text-sm text-text-muted">أضف ورتب أقسام صفحة متجرك الرئيسية</p>
          </div>
        </div>
        <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 rounded-xl bg-gradient-to-l from-accent to-accent-600 px-4 py-2.5 font-cairo text-sm font-bold text-white shadow-lg shadow-accent/20 transition-all hover:shadow-xl">
          <Plus size={16} />
          إضافة قسم
        </button>
      </div>

      {sections.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border/60 bg-white p-12">
          <LayoutDashboard size={48} className="text-text-subtle mb-4" />
          <h3 className="font-cairo text-lg font-bold text-text mb-2">الصفحة الرئيسية فارغة</h3>
          <p className="font-cairo text-sm text-text-muted mb-4 text-center">أضف أقساماً لبناء صفحة متجرك الرئيسية</p>
          <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 font-cairo text-sm font-bold text-white transition-all hover:bg-accent-600">
            <Plus size={16} />
            إضافة أول قسم
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {sections.map((section, index) => (
            <div key={section._id} className="relative">
              <div className="absolute right-0 top-0 -translate-y-1/2 z-10">
                <div className="flex items-center gap-1">
                  {index > 0 && (
                    <button onClick={() => handleMove(index, -1)} className="rounded-lg bg-white border border-border/60 p-1 text-text-muted hover:text-text shadow-sm">
                      <ChevronUp size={14} />
                    </button>
                  )}
                  {index < sections.length - 1 && (
                    <button onClick={() => handleMove(index, 1)} className="rounded-lg bg-white border border-border/60 p-1 text-text-muted hover:text-text shadow-sm">
                      <ChevronDown size={14} />
                    </button>
                  )}
                </div>
              </div>
              <SectionEditor
                section={section}
                onUpdate={(data) => handleUpdateSection(section._id, data)}
                onDelete={() => { if (confirm('هل أنت متأكد من حذف هذا القسم؟')) deleteMutation.mutate(section._id) }}
                onToggle={() => toggleMutation.mutate(section._id)}
              />
            </div>
          ))}
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl max-h-[80vh] overflow-y-auto">
            <h2 className="font-cairo text-lg font-bold text-text mb-4">إضافة قسم جديد</h2>
            <div className="grid grid-cols-2 gap-2">
              {SECTION_TYPES.map((type) => (
                <button key={type.value} onClick={() => setSelectedType(type.value)}
                  className={`flex items-center gap-3 rounded-xl border-2 p-3 text-right transition-all ${
                    selectedType === type.value ? 'border-accent bg-accent/5' : 'border-transparent bg-bg-soft/50 hover:border-border'
                  }`}>
                  {(() => { const Icon = type.icon; return <Icon size={20} className="text-text-muted shrink-0" /> })()}
                  <div>
                    <p className="font-cairo text-sm font-bold text-text">{type.label}</p>
                    <p className="font-cairo text-[10px] text-text-subtle">{type.desc}</p>
                  </div>
                </button>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-3">
              <button onClick={() => setShowAddModal(false)} className="flex-1 rounded-xl border border-border/60 px-4 py-3 font-cairo text-sm font-semibold text-text-muted transition-all hover:bg-bg-soft">
                إلغاء
              </button>
              <button onClick={() => createMutation.mutate({ type: selectedType, settings: {} })} disabled={createMutation.isPending} className="flex-1 rounded-xl bg-accent px-4 py-3 font-cairo text-sm font-bold text-white transition-all hover:bg-accent-600 disabled:opacity-50">
                {createMutation.isPending ? '...جاري الإضافة' : 'إضافة'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
