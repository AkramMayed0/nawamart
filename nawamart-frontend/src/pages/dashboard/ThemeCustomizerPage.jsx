import { useState, useEffect, useCallback } from 'react'
import { Palette, Type, Layout, Rows, Code, Smartphone, Tablet, Monitor, RotateCcw, Save, Sparkles, PanelTop, PanelBottom, Square, Award, Image, ShoppingBag, LayoutGrid, ShoppingCart, CreditCard, LayoutDashboard, Smartphone as MobileIcon, Undo2, Redo2 } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { useAuthStore } from '@/store/authStore'
import { getThemeSettings, updateColors, updateTypography, updateLayout, updateHeader, updateFooter, updateButtons, updateBadges, updateIcons, updateImages, updateProductPage, updateCollectionPage, updateCart, updateCheckout, updateMobile, updateSpacing, updateCustomCss, updateCustomHtml, resetThemeSettings } from '@/api/themeSettings'
import Skeleton from '@/components/ui/Skeleton'

const TABS = [
  { id: 'colors', label: 'الألوان', icon: Palette, desc: 'ألوان المتجر كاملة' },
  { id: 'typography', label: 'الخطوط', icon: Type, desc: 'الخطوط والأحجام' },
  { id: 'layout', label: 'التخطيط', icon: Layout, desc: 'هيكل الموقع' },
  { id: 'header', label: 'الرأس', icon: PanelTop, desc: 'القائمة والشعار' },
  { id: 'footer', label: 'التذييل', icon: PanelBottom, desc: 'أسفل الموقع' },
  { id: 'buttons', label: 'الأزرار', icon: Square, desc: 'تصميم الأزرار' },
  { id: 'badges', label: 'الشارات', icon: Award, desc: 'شارات المنتجات' },
  { id: 'images', label: 'الصور', icon: Image, desc: 'الصور والعلامات' },
  { id: 'productPage', label: 'صفحة المنتج', icon: ShoppingBag, desc: 'تخطيط المنتج' },
  { id: 'collectionPage', label: 'صفحة التصنيف', icon: LayoutGrid, desc: 'تخطيط المجموعات' },
  { id: 'cart', label: 'السلة', icon: ShoppingCart, desc: 'إعدادات سلة التسوق' },
  { id: 'checkout', label: 'الدفع', icon: CreditCard, desc: 'إعدادات الدفع' },
  { id: 'mobile', label: 'الجوال', icon: MobileIcon, desc: 'إعدادات الجوال' },
  { id: 'icons', label: 'الأيقونات', icon: LayoutDashboard, desc: 'تخصيص الأيقونات' },
  { id: 'custom', label: 'CSS/HTML', icon: Code, desc: 'أكواد مخصصة' },
]

const PREVIEW_MODES = [
  { id: 'desktop', icon: Monitor, label: 'حاسوب' },
  { id: 'tablet', icon: Tablet, label: 'جهاز لوحي' },
  { id: 'mobile', icon: Smartphone, label: 'جوال' },
]

const COLOR_PRESETS = [
  { name: 'كلاسيكي', colors: { primary: '#18212F', accent: '#C93F2B', secondary: '#2D7BE0', background: '#F6F3EE', surface: '#FFFFFF', header: '#18212F', footer: '#18212F', button: '#C93F2B', buttonText: '#FFFFFF' } },
  { name: 'طبيعي', colors: { primary: '#1B4332', accent: '#2D6A4F', secondary: '#40916C', background: '#F0F7F4', surface: '#FFFFFF', header: '#1B4332', footer: '#1B4332', button: '#2D6A4F', buttonText: '#FFFFFF' } },
  { name: 'ملكي', colors: { primary: '#2D1B69', accent: '#7C3AED', secondary: '#A78BFA', background: '#F5F3FF', surface: '#FFFFFF', header: '#2D1B69', footer: '#2D1B69', button: '#7C3AED', buttonText: '#FFFFFF' } },
  { name: 'دافئ', colors: { primary: '#7B2D0E', accent: '#EA580C', secondary: '#F97316', background: '#FFF7ED', surface: '#FFFFFF', header: '#7B2D0E', footer: '#7B2D0E', button: '#EA580C', buttonText: '#FFFFFF' } },
  { name: 'بحري', colors: { primary: '#0C4A6E', accent: '#0284C7', secondary: '#38BDF8', background: '#F0F9FF', surface: '#FFFFFF', header: '#0C4A6E', footer: '#0C4A6E', button: '#0284C7', buttonText: '#FFFFFF' } },
  { name: 'أرضي', colors: { primary: '#44403C', accent: '#D97706', secondary: '#F59E0B', background: '#FAFAF9', surface: '#FFFFFF', header: '#44403C', footer: '#44403C', button: '#D97706', buttonText: '#FFFFFF' } },
]

function ColorPicker({ label, value, onChange, desc }) {
  const [hex, setHex] = useState(value || '#000000')
  useEffect(() => { setHex(value || '#000000') }, [value])
  return (
    <div className="group flex items-center gap-3 rounded-xl border border-border/60 bg-white p-3 transition-all hover:border-border hover:shadow-sm">
      <div className="relative shrink-0">
        <input type="color" value={hex} onChange={(e) => { setHex(e.target.value); onChange(e.target.value) }} className="h-10 w-10 cursor-pointer rounded-lg border-2 border-border/30 p-0.5 transition-all hover:border-accent/50" />
      </div>
      <div className="flex-1 min-w-0">
        <label className="block font-cairo text-sm font-bold text-text">{label}</label>
        {desc && <p className="font-cairo text-[11px] text-text-subtle">{desc}</p>}
        <div className="mt-1 flex items-center gap-2">
          <div className="h-4 w-4 shrink-0 rounded border border-border/50" style={{ backgroundColor: hex }} />
          <input type="text" value={hex} onChange={(e) => { setHex(e.target.value); if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) onChange(e.target.value) }} className="w-full rounded-lg border border-border/60 bg-bg-soft/50 px-2 py-1 font-mono text-xs text-text focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/20" />
        </div>
      </div>
    </div>
  )
}

function Select({ label, desc, value, onChange, options }) {
  return (
    <div>
      <label className="block font-cairo text-sm font-bold text-text mb-1">{label}</label>
      {desc && <p className="font-cairo text-xs text-text-subtle mb-2">{desc}</p>}
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-xl border border-border/60 bg-white px-4 py-2.5 font-cairo text-sm text-text focus:border-accent focus:outline-none">
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  )
}

function Toggle({ label, desc, value, onChange }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border/60 bg-white px-4 py-3">
      <div>
        <label className="font-cairo text-sm font-bold text-text">{label}</label>
        {desc && <p className="font-cairo text-xs text-text-subtle">{desc}</p>}
      </div>
      <button onClick={() => onChange(!value)} className={`relative h-7 w-12 rounded-full transition-colors ${value ? 'bg-accent' : 'bg-border'}`}>
        <div className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-sm transition-transform ${value ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
      </button>
    </div>
  )
}

function Range({ label, desc, value, min, max, step, onChange, suffix }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="font-cairo text-sm font-bold text-text">{label}</label>
        <span className="rounded-lg bg-white border border-border/40 px-2.5 py-0.5 font-mono text-xs text-text">{value}{suffix || ''}</span>
      </div>
      {desc && <p className="font-cairo text-xs text-text-subtle mb-2">{desc}</p>}
      <input type="range" min={min} max={max} step={step} value={parseFloat(value) || 0} onChange={(e) => onChange(e.target.value)} className="w-full accent-accent" />
      <div className="flex justify-between text-[10px] text-text-subtle mt-1">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  )
}

function Input({ label, desc, value, onChange, type = 'text' }) {
  return (
    <div>
      <label className="block font-cairo text-sm font-bold text-text mb-1">{label}</label>
      {desc && <p className="font-cairo text-xs text-text-subtle mb-2">{desc}</p>}
      <input type={type} value={value || ''} onChange={(e) => onChange(e.target.value)} className="w-full rounded-xl border border-border/60 bg-white px-4 py-2.5 font-cairo text-sm text-text focus:border-accent focus:outline-none" />
    </div>
  )
}

function Section({ title, desc, children, className = '' }) {
  return (
    <div className={`rounded-2xl bg-bg-soft/50 border border-border/40 p-4 space-y-4 ${className}`}>
      {title && (
        <div>
          <h3 className="font-cairo text-sm font-bold text-text">{title}</h3>
          {desc && <p className="font-cairo text-xs text-text-subtle">{desc}</p>}
        </div>
      )}
      {children}
    </div>
  )
}

function SaveButton({ onClick, isPending, label }) {
  return (
    <button onClick={onClick} disabled={isPending} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-accent to-accent-600 px-4 py-3.5 font-cairo text-sm font-bold text-white shadow-lg shadow-accent/20 transition-all hover:shadow-xl hover:shadow-accent/30 disabled:opacity-50 active:scale-[0.98]">
      <Save size={16} />
      {isPending ? '...جاري الحفظ' : (label || 'حفظ')}
    </button>
  )
}

function ExamplePreview({ children, label = 'مثال حي' }) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-accent/30 bg-gradient-to-br from-accent/[0.02] to-accent/[0.05] p-4 space-y-2">
      <div className="flex items-center gap-1.5 mb-2">
        <Sparkles size={12} className="text-accent" />
        <span className="font-cairo text-[10px] font-bold text-accent uppercase tracking-wider">{label}</span>
      </div>
      {children}
    </div>
  )
}

export default function ThemeCustomizerPage() {
  const queryClient = useQueryClient()
  const storeRaw = useAuthStore((s) => s.store)
  const store = Array.isArray(storeRaw) ? storeRaw[0] : storeRaw

  const [activeTab, setActiveTab] = useState('colors')
  const [previewMode, setPreviewMode] = useState('desktop')
  const [history, setHistory] = useState([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const MAX_HISTORY = 50

  const [colors, setColors] = useState({})
  const [typography, setTypography] = useState({})
  const [layout, setLayout] = useState({})
  const [header, setHeader] = useState({})
  const [footer, setFooter] = useState({})
  const [buttons, setButtons] = useState({})
  const [badges, setBadges] = useState({})
  const [icons, setIcons] = useState({})
  const [images, setImages] = useState({})
  const [productPage, setProductPage] = useState({})
  const [collectionPage, setCollectionPage] = useState({})
  const [cart, setCart] = useState({})
  const [checkout, setCheckout] = useState({})
  const [mobile, setMobile] = useState({})
  const [customCss, setCustomCss] = useState('')
  const [customHtml, setCustomHtml] = useState({ header: '', footer: '' })

  const { data: settingsRes, isLoading } = useQuery({
    queryKey: ['theme-settings', store?._id],
    queryFn: () => getThemeSettings(store._id),
    enabled: !!store?._id,
  })

  useEffect(() => {
    if (settingsRes?.data?.data) {
      const d = settingsRes.data.data
      setColors(d.colors || {})
      setTypography(d.typography || {})
      setLayout(d.layout || {})
      setHeader(d.header || {})
      setFooter(d.footer || {})
      setButtons(d.buttons || {})
      setBadges(d.badges || {})
      setIcons(d.icons || {})
      setImages(d.images || {})
      setProductPage(d.productPage || {})
      setCollectionPage(d.collectionPage || {})
      setCart(d.cart || {})
      setCheckout(d.checkout || {})
      setMobile(d.mobile || {})
      setCustomCss(d.customCss || d.customCode?.css?.code || '')
      setCustomHtml(d.customHtml || { header: d.customCode?.js?.head || '', footer: d.customCode?.js?.footer || '' })
    }
  }, [settingsRes])

  const pushHistory = useCallback((snapshot) => {
    setHistory((prev) => {
      const next = prev.slice(0, historyIndex + 1)
      next.push(snapshot)
      if (next.length > MAX_HISTORY) next.shift()
      return next
    })
    setHistoryIndex((prev) => Math.min(prev + 1, MAX_HISTORY - 1))
  }, [historyIndex])

  const getSnapshot = useCallback(() => ({
    colors, typography, layout, header, footer, buttons, badges, icons, images,
    productPage, collectionPage, cart, checkout, mobile, customCss, customHtml,
  }), [colors, typography, layout, header, footer, buttons, badges, icons, images, productPage, collectionPage, cart, checkout, mobile, customCss, customHtml])

  const restoreSnapshot = useCallback((snap) => {
    if (!snap) return
    setColors(snap.colors)
    setTypography(snap.typography)
    setLayout(snap.layout)
    setHeader(snap.header)
    setFooter(snap.footer)
    setButtons(snap.buttons)
    setBadges(snap.badges)
    setIcons(snap.icons)
    setImages(snap.images)
    setProductPage(snap.productPage)
    setCollectionPage(snap.collectionPage)
    setCart(snap.cart)
    setCheckout(snap.checkout)
    setMobile(snap.mobile)
    setCustomCss(snap.customCss)
    setCustomHtml(snap.customHtml)
  }, [])

  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      setHistoryIndex(newIndex)
      restoreSnapshot(history[newIndex])
    }
  }

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1
      setHistoryIndex(newIndex)
      restoreSnapshot(history[newIndex])
    }
  }

  const mutations = {
    colors: useMutation({ mutationFn: () => updateColors(store._id, colors), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['theme-settings'] }); toast.success('تم حفظ الألوان بنجاح') } }),
    typography: useMutation({ mutationFn: () => updateTypography(store._id, typography), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['theme-settings'] }); toast.success('تم حفظ الخطوط بنجاح') } }),
    layout: useMutation({ mutationFn: () => updateLayout(store._id, layout), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['theme-settings'] }); toast.success('تم حفظ التخطيط بنجاح') } }),
    header: useMutation({ mutationFn: () => updateHeader(store._id, header), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['theme-settings'] }); toast.success('تم حفظ الرأس بنجاح') } }),
    footer: useMutation({ mutationFn: () => updateFooter(store._id, footer), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['theme-settings'] }); toast.success('تم حفظ التذييل بنجاح') } }),
    buttons: useMutation({ mutationFn: () => updateButtons(store._id, buttons), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['theme-settings'] }); toast.success('تم حفظ الأزرار بنجاح') } }),
    badges: useMutation({ mutationFn: () => updateBadges(store._id, badges), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['theme-settings'] }); toast.success('تم حفظ الشارات بنجاح') } }),
    icons: useMutation({ mutationFn: () => updateIcons(store._id, icons), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['theme-settings'] }); toast.success('تم حفظ الأيقونات بنجاح') } }),
    images: useMutation({ mutationFn: () => updateImages(store._id, images), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['theme-settings'] }); toast.success('تم حفظ الصور بنجاح') } }),
    productPage: useMutation({ mutationFn: () => updateProductPage(store._id, productPage), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['theme-settings'] }); toast.success('تم حفظ صفحة المنتج بنجاح') } }),
    collectionPage: useMutation({ mutationFn: () => updateCollectionPage(store._id, collectionPage), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['theme-settings'] }); toast.success('تم حفظ صفحة التصنيف بنجاح') } }),
    cart: useMutation({ mutationFn: () => updateCart(store._id, cart), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['theme-settings'] }); toast.success('تم حفظ إعدادات السلة بنجاح') } }),
    checkout: useMutation({ mutationFn: () => updateCheckout(store._id, checkout), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['theme-settings'] }); toast.success('تم حفظ إعدادات الدفع بنجاح') } }),
    mobile: useMutation({ mutationFn: () => updateMobile(store._id, mobile), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['theme-settings'] }); toast.success('تم حفظ إعدادات الجوال بنجاح') } }),
    customCss: useMutation({ mutationFn: () => updateCustomCss(store._id, customCss), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['theme-settings'] }); toast.success('تم حفظ CSS بنجاح') } }),
    customHtml: useMutation({ mutationFn: () => updateCustomHtml(store._id, customHtml), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['theme-settings'] }); toast.success('تم حفظ HTML بنجاح') } }),
  }

  const saveAllMutation = useMutation({
    mutationFn: async () => {
      const { default: api } = await import('@/api/axios')
      return api.put(`/theme-settings/${store._id}/bulk`, {
        colors, typography, layout, header, footer, buttons, badges, icons, images,
        productPage, collectionPage, cart, checkout, mobile,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['theme-settings'] })
      toast.success('تم حفظ جميع الإعدادات بنجاح')
    },
  })

  const resetMutation = useMutation({
    mutationFn: () => resetThemeSettings(store._id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['theme-settings'] })
      toast.success('تم إعادة التعيين إلى الإعدادات الافتراضية')
    },
  })

  if (isLoading) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-[600px] rounded-2xl" />
      </div>
    )
  }

  const handleChange = (setter, field, value) => {
    const snap = getSnapshot()
    pushHistory(snap)
    setter((prev) => ({ ...prev, [field]: value }))
  }

  const handleNestedChange = (setter, parent, field, value) => {
    const snap = getSnapshot()
    pushHistory(snap)
    setter((prev) => ({
      ...prev,
      [parent]: { ...(prev[parent] || {}), [field]: value },
    }))
  }

  const handleDeepChange = (setter, path, value) => {
    const snap = getSnapshot()
    pushHistory(snap)
    setter((prev) => {
      const keys = path.split('.')
      const result = { ...prev }
      let current = result
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...(current[keys[i]] || {}) }
        current = current[keys[i]]
      }
      current[keys[keys.length - 1]] = value
      return result
    })
  }

  const renderColorsPanel = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="font-cairo text-xs font-semibold text-text-muted">باقة الألوان</p>
        <div className="flex gap-1">
          {['primary', 'accent', 'secondary'].filter((k) => colors[k]).map((k) => (
            <div key={k} className="h-4 w-4 rounded-full border border-border/30" style={{ backgroundColor: colors[k] }} />
          ))}
        </div>
      </div>
      <div className="rounded-2xl bg-bg-soft/50 border border-border/40 p-3">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={14} className="text-accent" />
          <span className="font-cairo text-xs font-bold text-text">باقات ألوان سريعة</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {COLOR_PRESETS.map((preset) => (
            <button key={preset.name} onClick={() => { setColors((prev) => ({ ...prev, ...preset.colors })); pushHistory(getSnapshot()); toast.success(`تم تطبيق باقة ${preset.name}`) }} className="flex items-center gap-1.5 rounded-lg border border-border/40 bg-white px-2.5 py-1.5 font-cairo text-[11px] font-semibold text-text-muted transition-all hover:border-accent/30 hover:text-text hover:shadow-sm">
              <div className="flex -space-x-1">
                <div className="h-3 w-3 rounded-full border border-white" style={{ backgroundColor: preset.colors.primary }} />
                <div className="h-3 w-3 rounded-full border border-white" style={{ backgroundColor: preset.colors.accent }} />
                <div className="h-3 w-3 rounded-full border border-white" style={{ backgroundColor: preset.colors.secondary }} />
              </div>
              {preset.name}
            </button>
          ))}
        </div>
      </div>
      <Section title="الألوان الأساسية">
        {['primary', 'secondary', 'accent', 'background', 'surface'].map((k) => (
          <ColorPicker key={k} label={{ primary: 'اللون الأساسي', secondary: 'اللون الثانوي', accent: 'لون التمييز', background: 'خلفية الموقع', surface: 'سطح البطاقات' }[k]} value={colors[k]} onChange={(v) => handleChange(setColors, k, v)} />
        ))}
      </Section>
      <Section title="ألوان النصوص">
        {['text', 'textMuted'].map((k) => (
          <ColorPicker key={k} label={{ text: 'النص الأساسي', textMuted: 'النص الخافت' }[k]} value={colors[k]} onChange={(v) => handleChange(setColors, k, v)} />
        ))}
        {['heading', 'body', 'muted', 'link', 'price', 'onDark'].map((k) => (
          <ColorPicker key={k} label={{ heading: 'نص العنوان', body: 'نص المحتوى', muted: 'نص ثانوي', link: 'الروابط', price: 'السعر', onDark: 'نص على داكن' }[k]} value={colors.textColors?.[k]} onChange={(v) => handleDeepChange(setColors, `textColors.${k}`, v)} />
        ))}
      </Section>
      <Section title="الحدود">
        {['default', 'hover', 'light'].map((k) => (
          <ColorPicker key={k} label={{ default: 'الحدود', hover: 'عند التمرير', light: 'فاتح' }[k]} value={colors.borders?.[k]} onChange={(v) => handleDeepChange(setColors, `borders.${k}`, v)} />
        ))}
      </Section>
      <Section title="حالات المنتج">
        {['sale', 'soldOut', 'new'].map((k) => (
          <ColorPicker key={k} label={{ sale: 'شعار التخفيض', soldOut: 'شعار نفد', new: 'شعار جديد' }[k]} value={colors.badges?.[k]} onChange={(v) => handleDeepChange(setColors, `badges.${k}`, v)} />
        ))}
      </Section>
      <Section title="الرأس والتذييل">
        <ColorPicker label="خلفية الرأس" value={colors.header} onChange={(v) => handleChange(setColors, 'header', v)} />
        <ColorPicker label="خلفية التذييل" value={colors.footer} onChange={(v) => handleChange(setColors, 'footer', v)} />
      </Section>
      <Section title="الأزرار">
        <ColorPicker label="خلفية الزر" value={colors.button} onChange={(v) => handleChange(setColors, 'button', v)} />
        <ColorPicker label="نص الزر" value={colors.buttonText} onChange={(v) => handleChange(setColors, 'buttonText', v)} />
      </Section>
      <Section title="حالات التنبيه">
        <ColorPicker label="نجاح" value={colors.success} onChange={(v) => handleChange(setColors, 'success', v)} />
        <ColorPicker label="خطأ" value={colors.danger} onChange={(v) => handleChange(setColors, 'danger', v)} />
        <ColorPicker label="تحذير" value={colors.warning} onChange={(v) => handleChange(setColors, 'warning', v)} />
      </Section>
      <ExamplePreview>
        <div className="rounded-xl bg-white border border-border/40 p-3 space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg" style={{ backgroundColor: colors.primary || '#18212F' }} />
            <div className="h-8 w-8 rounded-lg" style={{ backgroundColor: colors.accent || '#C93F2B' }} />
            <div className="h-8 w-8 rounded-lg" style={{ backgroundColor: colors.secondary || '#2D7BE0' }} />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg" style={{ backgroundColor: colors.background || '#F6F3EE' }} />
            <div className="h-8 w-8 rounded-lg" style={{ backgroundColor: colors.surface || '#FFFFFF' }} />
            <div className="h-8 w-8 rounded-lg border" style={{ backgroundColor: colors.button || '#C93F2B' }} />
          </div>
          <div className="flex gap-2 text-[11px]">
            <span className="font-bold" style={{ color: colors.text || '#1D2430' }}>نص داكن</span>
            <span style={{ color: colors.textMuted || '#9298A3' }}>نص فاتح</span>
            <span style={{ color: colors.accent || '#C93F2B' }}>نشط</span>
          </div>
        </div>
      </ExamplePreview>
      <SaveButton onClick={() => mutations.colors.mutate()} isPending={mutations.colors.isPending} label="حفظ الألوان" />
    </div>
  )

  const renderTypographyPanel = () => (
    <div className="space-y-4">
      <Section title="الخط الرئيسي (العناوين)">
        <Select label="الخط" value={typography.heading?.family || 'Cairo'} onChange={(v) => handleDeepChange(setTypography, 'heading.family', v)} options={[
          { value: 'Cairo', label: 'Cairo' },
          { value: 'Almarai', label: 'Almarai' },
          { value: 'Tajawal', label: 'Tajawal' },
          { value: 'Noto Kufi Arabic', label: 'Noto Kufi Arabic' },
          { value: 'Readex Pro', label: 'Readex Pro' },
          { value: 'Inter', label: 'Inter' },
        ]} />
        <Select label="الوزن" value={typography.heading?.weight || '700'} onChange={(v) => handleDeepChange(setTypography, 'heading.weight', v)} options={[
          { value: '300', label: 'رفيع' },
          { value: '400', label: 'عادي' },
          { value: '500', label: 'متوسط' },
          { value: '600', label: 'نصف عريض' },
          { value: '700', label: 'عريض' },
          { value: '800', label: 'عريض جداً' },
          { value: '900', label: 'أقصى عُرض' },
        ]} />
        <Select label="تحويل النص" value={typography.heading?.transform || 'none'} onChange={(v) => handleDeepChange(setTypography, 'heading.transform', v)} options={[
          { value: 'none', label: 'بدون' },
          { value: 'uppercase', label: 'أحرف كبيرة' },
          { value: 'capitalize', label: 'أول حرف كبير' },
        ]} />
        <Range label="تباعد الأحرف" min={-2} max={5} step={0.5} value={typography.heading?.letterSpacing || '0'} onChange={(v) => handleDeepChange(setTypography, 'heading.letterSpacing', v)} />
      </Section>
      <Section title="الخط الثانوي (النصوص)">
        <Select label="الخط" value={typography.body?.family || 'Cairo'} onChange={(v) => handleDeepChange(setTypography, 'body.family', v)} options={[
          { value: 'Cairo', label: 'Cairo' },
          { value: 'Almarai', label: 'Almarai' },
          { value: 'Tajawal', label: 'Tajawal' },
          { value: 'Noto Kufi Arabic', label: 'Noto Kufi Arabic' },
          { value: 'Readex Pro', label: 'Readex Pro' },
          { value: 'Inter', label: 'Inter' },
        ]} />
        <Select label="الوزن" value={typography.body?.weight || '400'} onChange={(v) => handleDeepChange(setTypography, 'body.weight', v)} options={[
          { value: '300', label: 'رفيع' },
          { value: '400', label: 'عادي' },
          { value: '500', label: 'متوسط' },
          { value: '600', label: 'نصف عريض' },
          { value: '700', label: 'عريض' },
        ]} />
      </Section>
      <Section title="أحجام الخطوط">
        {['h1', 'h2', 'h3', 'h4', 'body', 'bodySmall'].map((k) => (
          <Input key={k} label={{ h1: 'العنوان الرئيسي H1', h2: 'العنوان H2', h3: 'العنوان H3', h4: 'العنوان H4', body: 'النص العادي', bodySmall: 'النص الصغير' }[k]} value={typography.sizes?.[k] || { h1: '2.5rem', h2: '2rem', h3: '1.75rem', h4: '1.5rem', body: '1rem', bodySmall: '0.875rem' }[k]} onChange={(v) => handleDeepChange(setTypography, `sizes.${k}`, v)} />
        ))}
      </Section>
      <Section title="معاينة سريعة">
        <div className="rounded-xl bg-white border border-border/40 p-4 space-y-2">
          <p className="font-bold text-text" style={{ fontFamily: typography.heading?.family || 'Cairo', fontSize: typography.sizes?.h1 || '2.5rem' }}>عنوان رئيسي</p>
          <p className="font-bold text-text" style={{ fontFamily: typography.heading?.family || 'Cairo', fontSize: typography.sizes?.h2 || '2rem' }}>عنوان ثانوي</p>
          <p style={{ fontFamily: typography.body?.family || 'Cairo', fontSize: typography.sizes?.body || '1rem' }} className="text-text-muted">هذا نص تجريبي لمعاينة الخط في المتجر</p>
        </div>
      </Section>
      <SaveButton onClick={() => mutations.typography.mutate()} isPending={mutations.typography.isPending} label="حفظ الخطوط" />
    </div>
  )

  const renderLayoutPanel = () => (
    <div className="space-y-4">
      <Section title="تخطيط رئيسي">
        <Select label="نمط الرأس" value={layout.headerStyle} onChange={(v) => handleChange(setLayout, 'headerStyle', v)} options={[
          { value: 'classic', label: 'كلاسيكي' },
          { value: 'minimal', label: 'بسيط' },
          { value: 'centered', label: 'مركز' },
          { value: 'compact', label: 'مضغوط' },
        ]} />
        <Select label="نمط التذييل" value={layout.footerStyle} onChange={(v) => handleChange(setLayout, 'footerStyle', v)} options={[
          { value: 'classic', label: 'كلاسيكي' },
          { value: 'minimal', label: 'بسيط' },
          { value: 'simple', label: 'بسيط جداً' },
          { value: 'compact', label: 'مضغوط' },
        ]} />
        <Select label="موضع الشريط الجانبي" value={layout.sidebarPosition} onChange={(v) => handleChange(setLayout, 'sidebarPosition', v)} options={[
          { value: 'right', label: 'يمين' },
          { value: 'left', label: 'يسار' },
          { value: 'none', label: 'بدون' },
        ]} />
        <Input label="عرض الصفحة" value={layout.pageWidth || layout.containerWidth} onChange={(v) => handleChange(setLayout, 'pageWidth', v)} desc="مثال: 1280px أو 100%" />
        <Input label="حشوة الحاوية" value={layout.containerPadding || '1rem'} onChange={(v) => handleChange(setLayout, 'containerPadding', v)} />
      </Section>
      <Section title="شبكة المنتجات">
        <Select label="عادة سطح المكتب" value={String(layout.grid?.productsPerRow?.desktop || 4)} onChange={(v) => handleDeepChange(setLayout, 'grid.productsPerRow.desktop', Number(v))} options={[2,3,4,5,6].map((n) => ({ value: String(n), label: `${n} منتجات` }))} />
        <Select label="عادة الجهاز اللوحي" value={String(layout.grid?.productsPerRow?.tablet || 3)} onChange={(v) => handleDeepChange(setLayout, 'grid.productsPerRow.tablet', Number(v))} options={[2,3,4].map((n) => ({ value: String(n), label: `${n} منتجات` }))} />
        <Select label="عادة الجوال" value={String(layout.grid?.productsPerRow?.mobile || 2)} onChange={(v) => handleDeepChange(setLayout, 'grid.productsPerRow.mobile', Number(v))} options={[1,2].map((n) => ({ value: String(n), label: `${n} منتجات` }))} />
      </Section>
      <Section title="البطاقات">
        <Select label="نمط البطاقة" value={layout.productCardStyle} onChange={(v) => handleChange(setLayout, 'productCardStyle', v)} options={[
          { value: 'grid', label: 'شبكي' },
          { value: 'list', label: 'قائمة' },
          { value: 'compact', label: 'مضغوط' },
        ]} />
        <Select label="انحناء الزوايا" value={layout.borderRadius} onChange={(v) => handleChange(setLayout, 'borderRadius', v)} options={[
          { value: 'none', label: 'بدون' },
          { value: 'sm', label: 'صغير' },
          { value: 'md', label: 'متوسط' },
          { value: 'lg', label: 'كبير' },
          { value: 'xl', label: 'كبير جداً' },
          { value: 'full', label: 'دائري' },
        ]} />
        <Toggle label="الرسوم المتحركة" value={layout.animationEnabled !== false} onChange={(v) => handleChange(setLayout, 'animationEnabled', v)} />
      </Section>
      <Section title="نسب الصور">
        <Select label="صورة المنتج" value={layout.imageRatios?.product || '1:1'} onChange={(v) => handleDeepChange(setLayout, 'imageRatios.product', v)} options={[
          { value: '1:1', label: 'مربع 1:1' },
          { value: '3:4', label: 'عمودي 3:4' },
          { value: '4:3', label: 'أفقي 4:3' },
          { value: '16:9', label: 'عريض 16:9' },
        ]} />
        <Select label="صورة التصنيف" value={layout.imageRatios?.collection || '3:4'} onChange={(v) => handleDeepChange(setLayout, 'imageRatios.collection', v)} options={[
          { value: '1:1', label: 'مربع 1:1' },
          { value: '3:4', label: 'عمودي 3:4' },
          { value: '4:3', label: 'أفقي 4:3' },
          { value: '16:9', label: 'عريض 16:9' },
        ]} />
      </Section>
      <Toggle label="فتات الخبز" value={layout.breadcrumbs?.enabled !== false} onChange={(v) => handleDeepChange(setLayout, 'breadcrumbs.enabled', v)} />
      <ExamplePreview>
        <div className="rounded-xl border border-border/40 bg-white p-3">
          <div className="flex items-center gap-2 mb-3 text-[10px] text-text-subtle">
            <span>الرئيسية</span>
            <span>/</span>
            <span>التصنيفات</span>
            <span>/</span>
            <span className="text-text font-semibold">المنتج</span>
          </div>
          <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${layout.grid?.productsPerRow?.desktop || 4}, 1fr)` }}>
            {Array.from({ length: layout.grid?.productsPerRow?.desktop || 4 }).map((_, i) => (
              <div key={i} className="rounded-lg bg-bg-soft p-2 text-center">
                <div className="aspect-square rounded-md bg-gradient-to-br from-primary/10 to-accent/10 mb-1" />
                <div className="h-2 w-3/4 mx-auto rounded bg-border" />
              </div>
            ))}
          </div>
        </div>
      </ExamplePreview>
      <SaveButton onClick={() => mutations.layout.mutate()} isPending={mutations.layout.isPending} label="حفظ التخطيط" />
    </div>
  )

  const renderHeaderPanel = () => (
    <div className="space-y-4">
      <Section title="تخطيط الرأس">
        <Select label="النموذج" value={header.layout?.preset || 'classic'} onChange={(v) => handleDeepChange(setHeader, 'layout.preset', v)} options={[
          { value: 'classic', label: 'كلاسيكي' },
          { value: 'minimal', label: 'بسيط' },
          { value: 'centered', label: 'مركز' },
          { value: 'compact', label: 'مضغوط' },
          { value: 'logoCenter', label: 'شعار في الوسط' },
        ]} />
        <Toggle label="رأس ثابت" value={header.layout?.sticky !== false} onChange={(v) => handleDeepChange(setHeader, 'layout.sticky', v)} />
        <Toggle label="رأس شفاف" value={header.layout?.transparent || false} onChange={(v) => handleDeepChange(setHeader, 'layout.transparent', v)} />
        <Input label="ارتفاع الرأس" value={header.layout?.height || '80px'} onChange={(v) => handleDeepChange(setHeader, 'layout.height', v)} />
      </Section>
      <Section title="الشعار">
        <Select label="النوع" value={header.logo?.type || 'text'} onChange={(v) => handleDeepChange(setHeader, 'logo.type', v)} options={[
          { value: 'text', label: 'نص' },
          { value: 'image', label: 'صورة' },
          { value: 'both', label: 'صورة + نص' },
        ]} />
        <Input label="نص الشعار" value={header.logo?.text || 'متجري'} onChange={(v) => handleDeepChange(setHeader, 'logo.text', v)} />
        <Input label="العرض على الحاسوب" value={header.logo?.size?.desktop || '180px'} onChange={(v) => handleDeepChange(setHeader, 'logo.size.desktop', v)} />
        <Input label="العرض على الجوال" value={header.logo?.size?.mobile || '120px'} onChange={(v) => handleDeepChange(setHeader, 'logo.size.mobile', v)} />
      </Section>
      <Section title="القائمة">
        <Select label="محاذاة القائمة" value={header.nav?.alignment || 'center'} onChange={(v) => handleDeepChange(setHeader, 'nav.alignment', v)} options={[
          { value: 'left', label: 'يسار' },
          { value: 'center', label: 'وسط' },
          { value: 'right', label: 'يمين' },
        ]} />
        <Toggle label="قائمة منسدلة كبيرة" value={header.nav?.megaMenu || false} onChange={(v) => handleDeepChange(setHeader, 'nav.megaMenu', v)} />
        <Select label="نمط القائمة في الجوال" value={header.nav?.mobileMenuStyle || 'drawer'} onChange={(v) => handleDeepChange(setHeader, 'nav.mobileMenuStyle', v)} options={[
          { value: 'drawer', label: 'درج جانبي' },
          { value: 'fullscreen', label: 'شاشة كاملة' },
          { value: 'dropdown', label: 'قائمة منسدلة' },
        ]} />
      </Section>
      <Section title="شريط الإعلانات">
        <Toggle label="إظهار شريط الإعلانات" value={!!header.bars?.announcement?.text} onChange={(v) => handleDeepChange(setHeader, 'bars.announcement.text', v ? 'إعلان جديد' : '')} />
        {header.bars?.announcement?.text !== undefined && header.bars.announcement.text !== '' && (
          <>
            <Input label="نص الإعلان" value={header.bars.announcement.text} onChange={(v) => handleDeepChange(setHeader, 'bars.announcement.text', v)} />
            <Input label="الرابط" value={header.bars.announcement.link || ''} onChange={(v) => handleDeepChange(setHeader, 'bars.announcement.link', v)} />
            <ColorPicker label="الخلفية" value={header.bars.announcement.background || '#C93F2B'} onChange={(v) => handleDeepChange(setHeader, 'bars.announcement.background', v)} />
            <ColorPicker label="لون النص" value={header.bars.announcement.textColor || '#FFFFFF'} onChange={(v) => handleDeepChange(setHeader, 'bars.announcement.textColor', v)} />
            <Toggle label="قابل للإغلاق" value={header.bars.announcement.dismissible !== false} onChange={(v) => handleDeepChange(setHeader, 'bars.announcement.dismissible', v)} />
          </>
        )}
      </Section>
      <Section title="أيقونات الرأس">
        <Toggle label="أيقونة السلة" value={header.icons?.cart?.enabled !== false} onChange={(v) => handleDeepChange(setHeader, 'icons.cart.enabled', v)} />
        <Toggle label="أيقونة المفضلة" value={header.icons?.wishlist?.enabled || false} onChange={(v) => handleDeepChange(setHeader, 'icons.wishlist.enabled', v)} />
        <Toggle label="أيقونة الحساب" value={header.icons?.account?.enabled !== false} onChange={(v) => handleDeepChange(setHeader, 'icons.account.enabled', v)} />
        <Input label="حجم الأيقونات" value={header.icons?.size || '24px'} onChange={(v) => handleDeepChange(setHeader, 'icons.size', v)} />
        <ColorPicker label="لون الأيقونات" value={header.icons?.color || '#FFFFFF'} onChange={(v) => handleDeepChange(setHeader, 'icons.color', v)} />
      </Section>
      <ExamplePreview>
        <div className="rounded-xl overflow-hidden border border-border/40 shadow-sm">
          <div className="flex items-center justify-between px-4 py-3" style={{ backgroundColor: colors.header || colors.headerColors?.background || '#18212F', height: header.layout?.height || '80px' }}>
            <span className="font-cairo text-base font-bold text-white">{header.logo?.text || 'متجري'}</span>
            <div className="flex gap-4">
              <span className="font-cairo text-[10px] text-white/70">الرئيسية</span>
              <span className="font-cairo text-[10px] text-white/70">المنتجات</span>
              <span className="font-cairo text-[10px] text-white/70">التصنيفات</span>
            </div>
          </div>
        </div>
      </ExamplePreview>
      <SaveButton onClick={() => mutations.header.mutate()} isPending={mutations.header.isPending} label="حفظ الرأس" />
    </div>
  )

  const renderFooterPanel = () => (
    <div className="space-y-4">
      <Section title="تخطيط التذييل">
        <Select label="عدد الأعمدة" value={String(footer.layout?.columns || 4)} onChange={(v) => handleDeepChange(setFooter, 'layout.columns', Number(v))} options={[
          { value: '1', label: 'عمود واحد' },
          { value: '2', label: 'عمودين' },
          { value: '3', label: 'ثلاثة أعمدة' },
          { value: '4', label: 'أربعة أعمدة' },
        ]} />
      </Section>
      <Section title="الجزء السفلي">
        <Input label="حقوق النشر" value={footer.bottom?.copyright || '© 2026 جميع الحقوق محفوظة'} onChange={(v) => handleDeepChange(setFooter, 'bottom.copyright', v)} />
        <Toggle label="إظهار صنع بواسطة" value={footer.bottom?.poweredBy !== false} onChange={(v) => handleDeepChange(setFooter, 'bottom.poweredBy', v)} />
        <Toggle label="زر العودة للأعلى" value={footer.bottom?.backToTop !== false} onChange={(v) => handleDeepChange(setFooter, 'bottom.backToTop', v)} />
        <Toggle label="مبدل اللغة" value={footer.bottom?.languageSelector || false} onChange={(v) => handleDeepChange(setFooter, 'bottom.languageSelector', v)} />
        <Toggle label="مبدل العملة" value={footer.bottom?.currencySelector || false} onChange={(v) => handleDeepChange(setFooter, 'bottom.currencySelector', v)} />
      </Section>
      <ExamplePreview>
        <div className="rounded-xl overflow-hidden border border-border/40 shadow-sm">
          <div className="px-4 py-4 text-center" style={{ backgroundColor: colors.footer || colors.footerColors?.background || '#18212F' }}>
            <div className="flex justify-center gap-4 mb-2">
              <span className="font-cairo text-[10px] text-white/70">روابط</span>
              <span className="font-cairo text-[10px] text-white/70">تواصل</span>
              <span className="font-cairo text-[10px] text-white/70">سياسة</span>
            </div>
            <p className="font-cairo text-[9px] text-white/50">{footer.bottom?.copyright || '© 2026 جميع الحقوق محفوظة'}</p>
          </div>
        </div>
      </ExamplePreview>
      <SaveButton onClick={() => mutations.footer.mutate()} isPending={mutations.footer.isPending} label="حفظ التذييل" />
    </div>
  )

  const renderButtonsPanel = () => (
    <div className="space-y-4">
      <Section title="الأزرار الأساسية">
        <ColorPicker label="خلفية الزر" value={buttons.primary?.background || colors.button} onChange={(v) => handleDeepChange(setButtons, 'primary.background', v)} />
        <ColorPicker label="لون النص" value={buttons.primary?.text || colors.buttonText} onChange={(v) => handleDeepChange(setButtons, 'primary.text', v)} />
        <ColorPicker label="لون التمرير" value={buttons.primary?.hover || '#B0352A'} onChange={(v) => handleDeepChange(setButtons, 'primary.hover', v)} />
        <ColorPicker label="الحدود" value={buttons.primary?.border || colors.button} onChange={(v) => handleDeepChange(setButtons, 'primary.border', v)} />
        <Select label="انحناء الزوايا" value={buttons.primary?.radius || '0.75rem'} onChange={(v) => handleDeepChange(setButtons, 'primary.radius', v)} options={[
          { value: '0', label: 'بدون' },
          { value: '0.25rem', label: 'صغير جداً' },
          { value: '0.5rem', label: 'صغير' },
          { value: '0.75rem', label: 'متوسط' },
          { value: '1rem', label: 'كبير' },
          { value: '9999px', label: 'دائري' },
        ]} />
        <Toggle label="ظل الزر" value={buttons.primary?.shadow || false} onChange={(v) => handleDeepChange(setButtons, 'primary.shadow', v)} />
      </Section>
      <Section title="الأزرار الثانوية">
        <ColorPicker label="خلفية الزر" value={buttons.secondary?.background || 'transparent'} onChange={(v) => handleDeepChange(setButtons, 'secondary.background', v)} />
        <ColorPicker label="لون النص" value={buttons.secondary?.text || '#1D2430'} onChange={(v) => handleDeepChange(setButtons, 'secondary.text', v)} />
        <ColorPicker label="لون التمرير" value={buttons.secondary?.hover || '#F6F3EE'} onChange={(v) => handleDeepChange(setButtons, 'secondary.hover', v)} />
        <ColorPicker label="الحدود" value={buttons.secondary?.border || '#E2E8F0'} onChange={(v) => handleDeepChange(setButtons, 'secondary.border', v)} />
        <Select label="انحناء الزوايا" value={buttons.secondary?.radius || '0.75rem'} onChange={(v) => handleDeepChange(setButtons, 'secondary.radius', v)} options={[
          { value: '0', label: 'بدون' },
          { value: '0.25rem', label: 'صغير جداً' },
          { value: '0.5rem', label: 'صغير' },
          { value: '0.75rem', label: 'متوسط' },
          { value: '1rem', label: 'كبير' },
          { value: '9999px', label: 'دائري' },
        ]} />
      </Section>
      <ExamplePreview>
        <div className="flex flex-wrap gap-2">
          <button className="px-4 py-2 rounded-xl font-cairo text-sm font-bold text-white shadow-sm transition-all hover:opacity-90" style={{ backgroundColor: buttons.primary?.background || colors.button || '#C93F2B', borderRadius: buttons.primary?.radius || '0.75rem' }}>
            زر رئيسي
          </button>
          <button className="px-4 py-2 rounded-xl font-cairo text-sm font-bold transition-all hover:opacity-90" style={{ backgroundColor: buttons.secondary?.background || 'transparent', color: buttons.secondary?.text || '#1D2430', border: `1px solid ${buttons.secondary?.border || '#E2E8F0'}`, borderRadius: buttons.secondary?.radius || '0.75rem' }}>
            زر ثانوي
          </button>
          <button className="px-3 py-2 rounded-lg font-cairo text-xs font-bold transition-all hover:opacity-90" style={{ backgroundColor: buttons.primary?.background || colors.button || '#C93F2B', color: buttons.primary?.text || '#FFFFFF', borderRadius: buttons.primary?.radius || '0.75rem' }}>
            صغير
          </button>
        </div>
      </ExamplePreview>
      <SaveButton onClick={() => mutations.buttons.mutate()} isPending={mutations.buttons.isPending} label="حفظ الأزرار" />
    </div>
  )

  const renderBadgesPanel = () => {
    const badgeTypes = [
      { key: 'sale', label: 'شعار التخفيض' },
      { key: 'soldOut', label: 'شعار نفد' },
      { key: 'new', label: 'شعار جديد' },
      { key: 'lowStock', label: 'مخزون منخفض' },
      { key: 'bestSeller', label: 'الأكثر مبيعاً' },
      { key: 'preOrder', label: 'طلب مسبق' },
    ]
    const shapes = [
      { value: 'rectangle', label: 'مربع' },
      { value: 'pill', label: 'حبة' },
      { value: 'circle', label: 'دائرة' },
      { value: 'triangle', label: 'مثلث' },
    ]
    return (
      <div className="space-y-4">
        {badgeTypes.map(({ key, label }) => (
          <Section key={key} title={label}>
            <Input label="النص" value={badges[key]?.text || ''} onChange={(v) => handleDeepChange(setBadges, `${key}.text`, v)} />
            <Select label="الموضع" value={badges[key]?.position || 'top-left'} onChange={(v) => handleDeepChange(setBadges, `${key}.position`, v)} options={[
              { value: 'top-left', label: 'أعلى يسار' },
              { value: 'top-right', label: 'أعلى يمين' },
              { value: 'bottom-left', label: 'أسفل يسار' },
              { value: 'bottom-right', label: 'أسفل يمين' },
            ]} />
            <ColorPicker label="الخلفية" value={badges[key]?.background || ''} onChange={(v) => handleDeepChange(setBadges, `${key}.background`, v)} />
            <ColorPicker label="لون النص" value={badges[key]?.textColor || '#FFFFFF'} onChange={(v) => handleDeepChange(setBadges, `${key}.textColor`, v)} />
            <Select label="الشكل" value={badges[key]?.shape || 'rectangle'} onChange={(v) => handleDeepChange(setBadges, `${key}.shape`, v)} options={shapes} />
            {key === 'lowStock' && (
              <Input label="الحد الأدنى" type="number" value={String(badges.lowStock?.threshold || 5)} onChange={(v) => handleDeepChange(setBadges, 'lowStock.threshold', Number(v))} />
            )}
            {key === 'new' && (
              <Toggle label="انتهاء تلقائي" value={badges.new?.autoExpire !== false} onChange={(v) => handleDeepChange(setBadges, 'new.autoExpire', v)} />
            )}
          </Section>
        ))}
        <ExamplePreview>
          <div className="flex flex-wrap gap-3">
            {badges.sale?.text && <span className="rounded-lg px-2.5 py-1 font-cairo text-[11px] font-bold text-white shadow-sm" style={{ backgroundColor: badges.sale?.background || '#C93F2B' }}>{badges.sale.text}</span>}
            {badges.soldOut?.text && <span className="rounded-lg px-2.5 py-1 font-cairo text-[11px] font-bold text-white shadow-sm" style={{ backgroundColor: badges.soldOut?.background || '#6B7280' }}>{badges.soldOut.text}</span>}
            {badges.new?.text && <span className="rounded-lg px-2.5 py-1 font-cairo text-[11px] font-bold text-white shadow-sm" style={{ backgroundColor: badges.new?.background || '#2D7BE0' }}>{badges.new.text}</span>}
            {!badges.sale?.text && !badges.soldOut?.text && !badges.new?.text && (
              <div className="flex gap-2">
                <span className="rounded-lg bg-red-500 px-2.5 py-1 font-cairo text-[11px] font-bold text-white">تخفيض</span>
                <span className="rounded-lg bg-gray-500 px-2.5 py-1 font-cairo text-[11px] font-bold text-white">نفد</span>
                <span className="rounded-lg bg-blue-500 px-2.5 py-1 font-cairo text-[11px] font-bold text-white">جديد</span>
              </div>
            )}
          </div>
        </ExamplePreview>
        <SaveButton onClick={() => mutations.badges.mutate()} isPending={mutations.badges.isPending} label="حفظ الشارات" />
      </div>
    )
  }

  const renderIconsPanel = () => (
    <div className="space-y-4">
      <Section title="إعدادات عامة">
        <Select label="مجموعة الأيقونات" value={icons.iconSet || 'default'} onChange={(v) => handleChange(setIcons, 'iconSet', v)} options={[
          { value: 'default', label: 'افتراضي' },
          { value: 'outline', label: 'مخطط' },
          { value: 'solid', label: 'مصمت' },
          { value: 'minimal', label: 'بسيط' },
        ]} />
        <ColorPicker label="اللون العام" value={icons.globalColor || '#1D2430'} onChange={(v) => handleChange(setIcons, 'globalColor', v)} />
        <Input label="الحجم العام" value={icons.globalSize || '24px'} onChange={(v) => handleChange(setIcons, 'globalSize', v)} />
      </Section>
      <SaveButton onClick={() => mutations.icons.mutate()} isPending={mutations.icons.isPending} label="حفظ الأيقونات" />
    </div>
  )

  const renderImagesPanel = () => (
    <div className="space-y-4">
      <Section title="العلامة التجارية">
        <Input label="رابط الشعار" value={images.brand?.logo || ''} onChange={(v) => handleDeepChange(setImages, 'brand.logo', v)} />
        <Input label="شعار بديل" value={images.brand?.logoAlt || ''} onChange={(v) => handleDeepChange(setImages, 'brand.logoAlt', v)} />
        <Input label="أيقونة الموقع" value={images.brand?.favicon || ''} onChange={(v) => handleDeepChange(setImages, 'brand.favicon', v)} />
        <Input label="صورة المشاركة" value={images.brand?.socialShare || ''} onChange={(v) => handleDeepChange(setImages, 'brand.socialShare', v)} />
      </Section>
      <Section title="إعدادات التحميل">
        <Select label="نوع المحمل" value={images.loading?.spinnerStyle || 'circle'} onChange={(v) => handleDeepChange(setImages, 'loading.spinnerStyle', v)} options={[
          { value: 'circle', label: 'دائرة' },
          { value: 'bars', label: 'أشرطة' },
          { value: 'dots', label: 'نقاط' },
          { value: 'spinner', label: 'دوار' },
        ]} />
        <ColorPicker label="لون المحمل" value={images.loading?.spinnerColor || '#C93F2B'} onChange={(v) => handleDeepChange(setImages, 'loading.spinnerColor', v)} />
        <Toggle label="هيكل عظمي" value={images.loading?.skeleton !== false} onChange={(v) => handleDeepChange(setImages, 'loading.skeleton', v)} />
      </Section>
      <Section title="إعدادات الصور">
        <Toggle label="تحميل بطيء" value={images.settings?.lazyLoading !== false} onChange={(v) => handleDeepChange(setImages, 'settings.lazyLoading', v)} />
        <Toggle label="أحجام متجاوبة" value={images.settings?.responsiveSizes !== false} onChange={(v) => handleDeepChange(setImages, 'settings.responsiveSizes', v)} />
        <Toggle label="صندوق ضوئي" value={images.settings?.lightbox !== false} onChange={(v) => handleDeepChange(setImages, 'settings.lightbox', v)} />
        <Range label="الجودة" min={1} max={100} step={1} value={String(images.settings?.quality || 80)} suffix="%" onChange={(v) => handleDeepChange(setImages, 'settings.quality', Number(v))} />
        <Select label="نوع التكبير" value={images.settings?.zoomType || 'hover'} onChange={(v) => handleDeepChange(setImages, 'settings.zoomType', v)} options={[
          { value: 'none', label: 'بدون' },
          { value: 'hover', label: 'عند التمرير' },
          { value: 'click', label: 'عند النقر' },
          { value: 'lens', label: 'عدسة' },
        ]} />
        <Select label="تأثير التمرير" value={images.settings?.hoverEffect || 'none'} onChange={(v) => handleDeepChange(setImages, 'settings.hoverEffect', v)} options={[
          { value: 'none', label: 'بدون' },
          { value: 'zoom', label: 'تكبير' },
          { value: 'fade', label: 'تلاشي' },
          { value: 'swap', label: 'تبديل' },
        ]} />
      </Section>
      <SaveButton onClick={() => mutations.images.mutate()} isPending={mutations.images.isPending} label="حفظ الصور" />
    </div>
  )

  const renderProductPagePanel = () => (
    <div className="space-y-4">
      <Section title="تخطيط الصفحة">
        <Select label="نموذج الصفحة" value={productPage.layout || 'default'} onChange={(v) => handleChange(setProductPage, 'layout', v)} options={[
          { value: 'default', label: 'افتراضي' },
          { value: 'sticky', label: 'معلومات ثابتة' },
          { value: 'extended', label: 'ممتد' },
          { value: 'fullscreen', label: 'شاشة كاملة' },
          { value: 'minimal', label: 'بسيط' },
          { value: 'split', label: 'مقسم' },
        ]} />
        <Select label="نمط المعرض" value={productPage.gallery || 'grid'} onChange={(v) => handleChange(setProductPage, 'gallery', v)} options={[
          { value: 'grid', label: 'شبكة' },
          { value: 'stacked', label: 'مكدس' },
          { value: 'carousel', label: 'دائري' },
          { value: 'masonry', label: 'متداخل' },
        ]} />
        <Toggle label="تكبير الصورة" value={productPage.zoom !== false} onChange={(v) => handleChange(setProductPage, 'zoom', v)} />
        <Toggle label="فيديو المنتج" value={productPage.video !== false} onChange={(v) => handleChange(setProductPage, 'video', v)} />
      </Section>
      <Section title="معلومات المنتج">
        <Toggle label="إظهار البائع" value={productPage.info?.vendor !== false} onChange={(v) => handleDeepChange(setProductPage, 'info.vendor', v)} />
        <Toggle label="إظهار SKU" value={productPage.info?.sku !== false} onChange={(v) => handleDeepChange(setProductPage, 'info.sku', v)} />
        <Toggle label="إظهار التوفر" value={productPage.info?.availability !== false} onChange={(v) => handleDeepChange(setProductPage, 'info.availability', v)} />
        <Toggle label="إظهار الوسوم" value={productPage.info?.tags !== false} onChange={(v) => handleDeepChange(setProductPage, 'info.tags', v)} />
      </Section>
      <Section title="السعر والعنوان">
        <Input label="حجم العنوان" value={productPage.title?.size || '1.5rem'} onChange={(v) => handleDeepChange(setProductPage, 'title.size', v)} />
        <Select label="وزن العنوان" value={productPage.title?.weight || '700'} onChange={(v) => handleDeepChange(setProductPage, 'title.weight', v)} options={[400,500,600,700,800,900].map((n) => ({ value: String(n), label: String(n) }))} />
        <ColorPicker label="لون السعر" value={productPage.price?.color || '#C93F2B'} onChange={(v) => handleDeepChange(setProductPage, 'price.color', v)} />
      </Section>
      <Section title="إضافة للسلة">
        <Toggle label="عرض كامل" value={productPage.addToCart?.fullWidth || false} onChange={(v) => handleDeepChange(setProductPage, 'addToCart.fullWidth', v)} />
        <Toggle label="ثابت في الجوال" value={productPage.addToCart?.stickyMobile !== false} onChange={(v) => handleDeepChange(setProductPage, 'addToCart.stickyMobile', v)} />
        <Toggle label="شراء الآن" value={productPage.addToCart?.buyNow !== false} onChange={(v) => handleDeepChange(setProductPage, 'addToCart.buyNow', v)} />
      </Section>
      <Section title="المحتوى">
        <Select label="نوع المحتوى" value={productPage.content?.type || 'tabs'} onChange={(v) => handleDeepChange(setProductPage, 'content.type', v)} options={[
          { value: 'tabs', label: 'تبويبات' },
          { value: 'accordion', label: 'سحب' },
          { value: 'full', label: 'كامل' },
        ]} />
        <Toggle label="شارات الثقة" value={productPage.content?.trustBadges !== false} onChange={(v) => handleDeepChange(setProductPage, 'content.trustBadges', v)} />
        <Toggle label="الدليل الاجتماعي" value={productPage.content?.socialProof !== false} onChange={(v) => handleDeepChange(setProductPage, 'content.socialProof', v)} />
      </Section>
      <Section title="الأقسام">
        <Toggle label="منتجات ذات صلة" value={productPage.sections?.relatedProducts !== false} onChange={(v) => handleDeepChange(setProductPage, 'sections.relatedProducts', v)} />
        <Toggle label="مشاهدة مؤخراً" value={productPage.sections?.recentlyViewed !== false} onChange={(v) => handleDeepChange(setProductPage, 'sections.recentlyViewed', v)} />
        <Toggle label="دليل المقاسات" value={productPage.sections?.sizeGuide || false} onChange={(v) => handleDeepChange(setProductPage, 'sections.sizeGuide', v)} />
        <Toggle label="المفضلة" value={productPage.sections?.wishlist !== false} onChange={(v) => handleDeepChange(setProductPage, 'sections.wishlist', v)} />
      </Section>
      <SaveButton onClick={() => mutations.productPage.mutate()} isPending={mutations.productPage.isPending} label="حفظ صفحة المنتج" />
    </div>
  )

  const renderCollectionPagePanel = () => (
    <div className="space-y-4">
      <Section title="تخطيط التصنيف">
        <Select label="العرض الافتراضي" value={collectionPage.layout?.default || 'grid'} onChange={(v) => handleDeepChange(setCollectionPage, 'layout.default', v)} options={[
          { value: 'grid', label: 'شبكة' },
          { value: 'list', label: 'قائمة' },
          { value: 'masonry', label: 'متداخل' },
        ]} />
        <Select label="منتجات لكل صف" value={String(collectionPage.layout?.productsPerRow || 4)} onChange={(v) => handleDeepChange(setCollectionPage, 'layout.productsPerRow', Number(v))} options={[2,3,4,5,6].map((n) => ({ value: String(n), label: String(n) }))} />
        <Toggle label="مبدل العرض" value={collectionPage.layout?.viewToggle !== false} onChange={(v) => handleDeepChange(setCollectionPage, 'layout.viewToggle', v)} />
      </Section>
      <Section title="شريط الأدوات">
        <Toggle label="الترتيب" value={collectionPage.toolbar?.sorting !== false} onChange={(v) => handleDeepChange(setCollectionPage, 'toolbar.sorting', v)} />
        <Toggle label="عدد المنتجات" value={collectionPage.toolbar?.productCount !== false} onChange={(v) => handleDeepChange(setCollectionPage, 'toolbar.productCount', v)} />
        <Select label="موضع الفلتر" value={collectionPage.toolbar?.filters?.position || 'sidebar'} onChange={(v) => handleDeepChange(setCollectionPage, 'toolbar.filters.position', v)} options={[
          { value: 'sidebar', label: 'شريط جانبي' },
          { value: 'top', label: 'أعلى' },
          { value: 'drawer', label: 'درج' },
          { value: 'hidden', label: 'مخفي' },
        ]} />
      </Section>
      <Section title="البطاقات">
        <Select label="نمط البطاقة" value={collectionPage.cards?.style || 'default'} onChange={(v) => handleDeepChange(setCollectionPage, 'cards.style', v)} options={[
          { value: 'default', label: 'افتراضي' },
          { value: 'minimal', label: 'بسيط' },
          { value: 'elegant', label: 'أنيق' },
          { value: 'bold', label: 'جريء' },
          { value: 'rounded', label: 'مدور' },
          { value: 'bordered', label: 'بحدود' },
        ]} />
        <Select label="تأثير التمرير" value={collectionPage.cards?.hoverEffects || 'none'} onChange={(v) => handleDeepChange(setCollectionPage, 'cards.hoverEffects', v)} options={[
          { value: 'none', label: 'بدون' },
          { value: 'lift', label: 'رفع' },
          { value: 'border', label: 'حدود' },
          { value: 'shadow', label: 'ظل' },
          { value: 'scale', label: 'تكبير' },
        ]} />
        <Toggle label="إضافة سريعة" value={collectionPage.cards?.quickAdd || false} onChange={(v) => handleDeepChange(setCollectionPage, 'cards.quickAdd', v)} />
        <Toggle label="عرض سريع" value={collectionPage.cards?.quickView !== false} onChange={(v) => handleDeepChange(setCollectionPage, 'cards.quickView', v)} />
      </Section>
      <Section title="ترقيم الصفحات">
        <Select label="النوع" value={collectionPage.pagination?.type || 'numbered'} onChange={(v) => handleDeepChange(setCollectionPage, 'pagination.type', v)} options={[
          { value: 'numbered', label: 'مرقم' },
          { value: 'loadMore', label: 'تحميل المزيد' },
          { value: 'infinite', label: 'لا نهائي' },
        ]} />
      </Section>
      <SaveButton onClick={() => mutations.collectionPage.mutate()} isPending={mutations.collectionPage.isPending} label="حفظ صفحة التصنيف" />
    </div>
  )

  const renderCartPanel = () => (
    <div className="space-y-4">
      <Section title="نوع السلة">
        <Select label="النوع" value={cart.type || 'page'} onChange={(v) => handleChange(setCart, 'type', v)} options={[
          { value: 'page', label: 'صفحة كاملة' },
          { value: 'drawer', label: 'درج جانبي' },
          { value: 'popup', label: 'نافذة منبثقة' },
        ]} />
        {cart.type === 'drawer' && (
          <Select label="الموضع" value={cart.position || 'right'} onChange={(v) => handleChange(setCart, 'position', v)} options={[
            { value: 'left', label: 'يسار' },
            { value: 'right', label: 'يمين' },
          ]} />
        )}
      </Section>
      <Section title="الميزات">
        <Toggle label="حقل الخصم" value={cart.features?.discount !== false} onChange={(v) => handleDeepChange(setCart, 'features.discount', v)} />
        <Toggle label="الدفع السريع" value={cart.features?.expressCheckout !== false} onChange={(v) => handleDeepChange(setCart, 'features.expressCheckout', v)} />
        <Toggle label="ملاحظات الطلب" value={cart.features?.orderNotes || false} onChange={(v) => handleDeepChange(setCart, 'features.orderNotes', v)} />
        <Toggle label="حاسبة الشحن" value={cart.features?.shippingCalculator !== false} onChange={(v) => handleDeepChange(setCart, 'features.shippingCalculator', v)} />
        <Toggle label="منتجات مقترحة" value={cart.features?.crossSells !== false} onChange={(v) => handleDeepChange(setCart, 'features.crossSells', v)} />
      </Section>
      <Section title="شريط التوصيل المجاني">
        <Toggle label="تفعيل" value={cart.freeShippingBar?.enabled !== false} onChange={(v) => handleDeepChange(setCart, 'freeShippingBar.enabled', v)} />
        {cart.freeShippingBar?.enabled !== false && (
          <>
            <Input label="الحد الأدنى" type="number" value={String(cart.freeShippingBar?.threshold || 200)} onChange={(v) => handleDeepChange(setCart, 'freeShippingBar.threshold', Number(v))} />
            <Input label="نص التقدم" value={cart.freeShippingBar?.progressMessage || 'توصيل مجاني للطلبات فوق $200'} onChange={(v) => handleDeepChange(setCart, 'freeShippingBar.progressMessage', v)} />
            <ColorPicker label="الخلفية" value={cart.freeShippingBar?.background || '#27AE60'} onChange={(v) => handleDeepChange(setCart, 'freeShippingBar.background', v)} />
            <ColorPicker label="لون النص" value={cart.freeShippingBar?.textColor || '#FFFFFF'} onChange={(v) => handleDeepChange(setCart, 'freeShippingBar.textColor', v)} />
          </>
        )}
      </Section>
      <Section title="السلة الفارغة">
        <Input label="النص" value={cart.empty?.text || 'سلة التسوق فارغة'} onChange={(v) => handleDeepChange(setCart, 'empty.text', v)} />
        <Input label="نص الزر" value={cart.empty?.cta || 'تسوق الآن'} onChange={(v) => handleDeepChange(setCart, 'empty.cta', v)} />
        <Toggle label="توصيات" value={cart.empty?.recommendations !== false} onChange={(v) => handleDeepChange(setCart, 'empty.recommendations', v)} />
      </Section>
      <ExamplePreview>
        <div className="rounded-xl border border-border/40 bg-white p-3">
          <div className="space-y-2">
            <div className="flex items-center gap-3 pb-2 border-b border-border/30">
              <div className="h-10 w-10 rounded-lg bg-bg-soft" />
              <div className="flex-1">
                <div className="h-2 w-24 rounded bg-border" />
                <div className="h-2 w-16 rounded bg-border mt-1" />
              </div>
              <span className="font-cairo text-xs font-bold text-text">$49</span>
            </div>
            {cart.freeShippingBar?.enabled !== false && (
              <div className="rounded-lg px-3 py-1.5 text-center" style={{ backgroundColor: cart.freeShippingBar?.background || '#27AE60' }}>
                <span className="font-cairo text-[10px] font-bold text-white">{cart.freeShippingBar?.progressMessage || 'توصيل مجاني للطلبات فوق $200'}</span>
              </div>
            )}
            <div className="flex items-center justify-between pt-1">
              <span className="font-cairo text-xs text-text-muted">المجموع</span>
              <span className="font-cairo text-sm font-bold text-text">$49</span>
            </div>
          </div>
        </div>
      </ExamplePreview>
      <SaveButton onClick={() => mutations.cart.mutate()} isPending={mutations.cart.isPending} label="حفظ السلة" />
    </div>
  )

  const renderCheckoutPanel = () => (
    <div className="space-y-4">
      <Section title="تخطيط الدفع">
        <Select label="النوع" value={checkout.layout || 'one-page'} onChange={(v) => handleChange(setCheckout, 'layout', v)} options={[
          { value: 'one-page', label: 'صفحة واحدة' },
          { value: 'multi-step', label: 'متعدد الخطوات' },
        ]} />
        <Input label="العرض" value={checkout.width || '800px'} onChange={(v) => handleChange(setCheckout, 'width', v)} />
      </Section>
      <Section title="النموذج">
        <Select label="نمط التسمية" value={checkout.form?.labelStyle || 'floating'} onChange={(v) => handleDeepChange(setCheckout, 'form.labelStyle', v)} options={[
          { value: 'floating', label: 'عائم' },
          { value: 'above', label: 'فوق' },
          { value: 'inside', label: 'داخل' },
        ]} />
        <ColorPicker label="خلفية الحقل" value={checkout.form?.inputBackground || '#FFFFFF'} onChange={(v) => handleDeepChange(setCheckout, 'form.inputBackground', v)} />
        <ColorPicker label="حدود الحقل" value={checkout.form?.inputBorder || '#E2E8F0'} onChange={(v) => handleDeepChange(setCheckout, 'form.inputBorder', v)} />
        <Select label="انحناء الحقل" value={checkout.form?.inputRadius || '0.5rem'} onChange={(v) => handleDeepChange(setCheckout, 'form.inputRadius', v)} options={[
          { value: '0', label: 'بدون' },
          { value: '0.25rem', label: 'صغير' },
          { value: '0.5rem', label: 'متوسط' },
          { value: '0.75rem', label: 'كبير' },
        ]} />
      </Section>
      <Section title="الدفع">
        <Toggle label="أيقونات الدفع" value={checkout.payment?.icons !== false} onChange={(v) => handleDeepChange(setCheckout, 'payment.icons', v)} />
        <Select label="نمط العرض" value={checkout.payment?.displayStyle || 'icons'} onChange={(v) => handleDeepChange(setCheckout, 'payment.displayStyle', v)} options={[
          { value: 'icons', label: 'أيقونات' },
          { value: 'list', label: 'قائمة' },
          { value: 'cards', label: 'بطاقات' },
        ]} />
      </Section>
      <Section title="الثقة">
        <Toggle label="SSL" value={checkout.trust?.ssl !== false} onChange={(v) => handleDeepChange(setCheckout, 'trust.ssl', v)} />
        <Toggle label="الضمان" value={checkout.trust?.guarantee !== false} onChange={(v) => handleDeepChange(setCheckout, 'trust.guarantee', v)} />
        <Toggle label="شارات الثقة" value={checkout.trust?.badges !== false} onChange={(v) => handleDeepChange(setCheckout, 'trust.badges', v)} />
      </Section>
      <ExamplePreview>
        <div className="rounded-xl border border-border/40 bg-white p-3">
          {checkout.layout === 'multi-step' ? (
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center gap-1">
                <div className="h-5 w-5 rounded-full bg-accent flex items-center justify-center"><span className="text-[9px] font-bold text-white">1</span></div>
                <span className="font-cairo text-[9px] text-accent font-semibold">المعلومات</span>
              </div>
              <div className="h-px flex-1 bg-border" />
              <div className="flex items-center gap-1 opacity-40">
                <div className="h-5 w-5 rounded-full bg-border" />
                <span className="font-cairo text-[9px] text-text-muted">الدفع</span>
              </div>
              <div className="h-px flex-1 bg-border" />
              <div className="flex items-center gap-1 opacity-40">
                <div className="h-5 w-5 rounded-full bg-border" />
                <span className="font-cairo text-[9px] text-text-muted">تأكيد</span>
              </div>
            </div>
          ) : (
            <div className="font-cairo text-[10px] font-bold text-text mb-2">صفحة دفع واحدة</div>
          )}
          <div className="space-y-1.5">
            <div className="h-6 rounded-lg" style={{ backgroundColor: checkout.form?.inputBackground || '#FFFFFF', border: `1px solid ${checkout.form?.inputBorder || '#E2E8F0'}`, borderRadius: checkout.form?.inputRadius || '0.5rem' }} />
            <div className="h-6 rounded-lg" style={{ backgroundColor: checkout.form?.inputBackground || '#FFFFFF', border: `1px solid ${checkout.form?.inputBorder || '#E2E8F0'}`, borderRadius: checkout.form?.inputRadius || '0.5rem' }} />
          </div>
          {checkout.trust?.badges !== false && (
            <div className="flex gap-1 mt-2">
              <div className="h-4 w-8 rounded bg-gray-200" />
              <div className="h-4 w-8 rounded bg-gray-200" />
              <div className="h-4 w-8 rounded bg-gray-200" />
            </div>
          )}
        </div>
      </ExamplePreview>
      <SaveButton onClick={() => mutations.checkout.mutate()} isPending={mutations.checkout.isPending} label="حفظ الدفع" />
    </div>
  )

  const renderMobilePanel = () => (
    <div className="space-y-4">
      <Section title="الإعدادات">
        <Select label="نمط القائمة" value={mobile.settings?.menuStyle || 'hamburger'} onChange={(v) => handleDeepChange(setMobile, 'settings.menuStyle', v)} options={[
          { value: 'hamburger', label: 'هامبرغر' },
          { value: 'bottom', label: 'شريط سفلي' },
          { value: 'tabs', label: 'تبويبات' },
        ]} />
        <Toggle label="رأس ثابت" value={mobile.settings?.stickyHeader !== false} onChange={(v) => handleDeepChange(setMobile, 'settings.stickyHeader', v)} />
        <Toggle label="زر سلة ثابت" value={mobile.settings?.stickyCart !== false} onChange={(v) => handleDeepChange(setMobile, 'settings.stickyCart', v)} />
      </Section>
      <Section title="الشريط السفلي">
        <Toggle label="تفعيل" value={mobile.bottomNav?.enabled || false} onChange={(v) => handleDeepChange(setMobile, 'bottomNav.enabled', v)} />
      </Section>
      <Section title="اللمس">
        <Toggle label="تمرير المعرض" value={mobile.touch?.swipeGallery !== false} onChange={(v) => handleDeepChange(setMobile, 'touch.swipeGallery', v)} />
        <Toggle label="تمرير الدائري" value={mobile.touch?.swipeCarousel !== false} onChange={(v) => handleDeepChange(setMobile, 'touch.swipeCarousel', v)} />
        <Toggle label="تكبير بالضغط" value={mobile.touch?.tapZoom !== false} onChange={(v) => handleDeepChange(setMobile, 'touch.tapZoom', v)} />
      </Section>
      <Section title="الأداء">
        <Toggle label="تقليل الحركات" value={mobile.performance?.reduceAnimations || false} onChange={(v) => handleDeepChange(setMobile, 'performance.reduceAnimations', v)} />
        <Toggle label="جودة منخفضة" value={mobile.performance?.lowerQuality || false} onChange={(v) => handleDeepChange(setMobile, 'performance.lowerQuality', v)} />
        <Toggle label="إخفاء الفيديو" value={mobile.performance?.hideVideos || false} onChange={(v) => handleDeepChange(setMobile, 'performance.hideVideos', v)} />
      </Section>
      <SaveButton onClick={() => mutations.mobile.mutate()} isPending={mutations.mobile.isPending} label="حفظ الجوال" />
    </div>
  )

  const renderCustomCodePanel = () => (
    <div className="space-y-5">
      <div className="rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 p-4">
        <label className="block font-cairo text-sm font-bold text-white mb-1.5">CSS مخصص</label>
        <p className="font-cairo text-xs text-gray-400 mb-3">أضف أكواد CSS لتخصيص متجرك بشكل متقدم</p>
        <textarea value={customCss} onChange={(e) => { setCustomCss(e.target.value); pushHistory(getSnapshot()) }} rows={8} className="w-full rounded-xl bg-gray-950 border border-gray-700 px-4 py-3 font-mono text-xs text-green-400 placeholder:text-gray-600 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30" placeholder="/* اكتب CSS المخصص هنا */" dir="ltr" />
        <button onClick={() => mutations.customCss.mutate()} disabled={mutations.customCss.isPending} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 font-cairo text-sm font-bold text-white transition-all hover:bg-accent-600 disabled:opacity-50">
          <Save size={16} />
          {mutations.customCss.isPending ? '...جاري الحفظ' : 'حفظ CSS'}
        </button>
      </div>
      <div className="rounded-2xl bg-bg-soft/50 border border-border/40 p-4 space-y-4">
        <div>
          <label className="block font-cairo text-sm font-bold text-text mb-1.5">كود HEAD المخصص</label>
          <p className="font-cairo text-xs text-text-subtle mb-2">أضف أكواد في وسم HEAD (Google Analytics, Meta, إلخ)</p>
          <textarea value={customHtml.header || ''} onChange={(e) => { setCustomHtml((prev) => ({ ...prev, header: e.target.value })); pushHistory(getSnapshot()) }} rows={5} className="w-full rounded-xl border border-border/60 bg-white px-4 py-3 font-mono text-xs text-text placeholder:text-text-subtle focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/20" placeholder="<!-- أكواد HEAD -->" dir="ltr" />
        </div>
        <div>
          <label className="block font-cairo text-sm font-bold text-text mb-1.5">كود FOOTER المخصص</label>
          <p className="font-cairo text-xs text-text-subtle mb-2">أضف أكواد قبل إغلاق وسم BODY</p>
          <textarea value={customHtml.footer || ''} onChange={(e) => { setCustomHtml((prev) => ({ ...prev, footer: e.target.value })); pushHistory(getSnapshot()) }} rows={5} className="w-full rounded-xl border border-border/60 bg-white px-4 py-3 font-mono text-xs text-text placeholder:text-text-subtle focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/20" placeholder="<!-- أكواد FOOTER -->" dir="ltr" />
          <button onClick={() => mutations.customHtml.mutate()} disabled={mutations.customHtml.isPending} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 font-cairo text-sm font-bold text-white transition-all hover:bg-accent-600 disabled:opacity-50">
            <Save size={16} />
            {mutations.customHtml.isPending ? '...جاري الحفظ' : 'حفظ HTML'}
          </button>
        </div>
      </div>
    </div>
  )

  const renderPanel = () => {
    switch (activeTab) {
      case 'colors': return renderColorsPanel()
      case 'typography': return renderTypographyPanel()
      case 'layout': return renderLayoutPanel()
      case 'header': return renderHeaderPanel()
      case 'footer': return renderFooterPanel()
      case 'buttons': return renderButtonsPanel()
      case 'badges': return renderBadgesPanel()
      case 'icons': return renderIconsPanel()
      case 'images': return renderImagesPanel()
      case 'productPage': return renderProductPagePanel()
      case 'collectionPage': return renderCollectionPagePanel()
      case 'cart': return renderCartPanel()
      case 'checkout': return renderCheckoutPanel()
      case 'mobile': return renderMobilePanel()
      case 'custom': return renderCustomCodePanel()
      default: return renderColorsPanel()
    }
  }

  return (
    <div className="flex h-full flex-col bg-bg">
      <div className="flex items-center justify-between border-b border-border bg-surface px-4 py-3 md:px-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 via-violet-600 to-violet-700 shadow-sm shadow-violet-200 dark:shadow-violet-900/30">
            <Palette size={20} className="text-white" />
          </div>
          <div>
            <h1 className="font-cairo text-lg font-bold text-text">تخصيص القالب</h1>
            <div className="flex items-center gap-2">
              <p className="font-cairo text-xs text-text-muted">{settingsRes?.data?.data?.theme?.name || 'القالب الافتراضي'}</p>
              <span className="h-1 w-1 rounded-full bg-border" />
              <p className="font-cairo text-xs text-text-subtle">معاينة حية</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={undo} disabled={historyIndex <= 0} className="rounded-lg border border-border/60 p-2 text-text-muted transition-all hover:border-accent/30 hover:text-text disabled:opacity-30" title="تراجع">
            <Undo2 size={16} />
          </button>
          <button onClick={redo} disabled={historyIndex >= history.length - 1} className="rounded-lg border border-border/60 p-2 text-text-muted transition-all hover:border-accent/30 hover:text-text disabled:opacity-30" title="إعادة">
            <Redo2 size={16} />
          </button>
          <div className="flex rounded-xl border border-border/60 bg-bg-soft p-1">
            {PREVIEW_MODES.map((mode) => {
              const Icon = mode.icon
              return (
                <button key={mode.id} onClick={() => setPreviewMode(mode.id)} className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-cairo text-xs font-semibold transition-all ${previewMode === mode.id ? 'bg-surface text-text shadow-sm' : 'text-text-muted hover:text-text'}`}>
                  <Icon size={14} />
                  <span className="hidden sm:inline">{mode.label}</span>
                </button>
              )
            })}
          </div>
          <button onClick={() => saveAllMutation.mutate()} disabled={saveAllMutation.isPending} className="flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2 font-cairo text-sm font-bold text-white transition-all hover:bg-accent-600 disabled:opacity-50">
            <Save size={16} />
            <span className="hidden sm:inline">حفظ الكل</span>
          </button>
          <button onClick={() => resetMutation.mutate()} className="flex items-center gap-1.5 rounded-xl border border-border/60 px-3 py-2 font-cairo text-sm font-semibold text-text-muted transition-all hover:border-danger/30 hover:bg-danger-100 hover:text-danger">
            <RotateCcw size={16} />
            <span className="hidden sm:inline">إعادة تعيين</span>
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-[22rem] shrink-0 overflow-y-auto border-l border-border/60 bg-surface p-5 shadow-sm">
          <div className="mb-5 flex flex-col gap-1.5">
            {TABS.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`group relative flex items-center gap-3 rounded-2xl px-4 py-3 font-cairo text-sm font-bold transition-all text-right ${isActive ? 'bg-gradient-to-l from-accent to-accent-600 text-white shadow-md shadow-accent/20' : 'text-text-muted hover:bg-bg-soft/80 hover:text-text'}`}>
                  <div className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all ${isActive ? 'bg-white/20' : 'bg-bg-soft group-hover:bg-surface'}`}>
                    <Icon size={18} className={isActive ? 'text-white' : 'text-text-subtle'} />
                  </div>
                  <div className="text-right">
                    <p className="leading-tight">{tab.label}</p>
                    <p className={`font-normal text-[10px] leading-tight mt-0.5 ${isActive ? 'text-white/70' : 'text-text-subtle'}`}>{tab.desc}</p>
                  </div>
                  {isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-full bg-white/60" />}
                </button>
              )
            })}
          </div>
          <div className="border-t border-border/40 pt-4">
            {renderPanel()}
          </div>
        </div>

        <div className={`flex-1 overflow-y-auto bg-gradient-to-br from-bg-soft to-bg ${previewMode === 'mobile' ? 'p-8 flex justify-center' : ''} ${previewMode === 'tablet' ? 'p-6 flex justify-center' : ''}`}>
          <div className={`bg-surface shadow-lg border border-border/40 overflow-y-auto ${previewMode === 'mobile' ? 'w-[375px] h-[812px] rounded-[2.5rem] shadow-xl shadow-black/5' : ''} ${previewMode === 'tablet' ? 'w-[768px] h-[1024px] rounded-2xl shadow-xl shadow-black/5' : 'min-h-full w-full rounded-none'}`}>
            <div style={{
              '--color-primary': colors.primary,
              '--color-secondary': colors.secondary,
              '--color-accent': colors.accent,
              '--color-background': colors.background,
              '--color-surface': colors.surface,
              '--color-text': colors.text,
              '--color-text-muted': colors.textMuted,
              '--color-header': colors.header || colors.headerColors?.background,
              '--color-footer': colors.footer || colors.footerColors?.background,
              '--color-button': colors.button || buttons.primary?.background,
              '--color-button-text': colors.buttonText || buttons.primary?.text,
              '--font-heading': typography.heading?.family || 'Cairo',
              '--font-body': typography.body?.family || 'Cairo',
              '--section-padding': layout.sectionSpacing || '4rem',
              '--border-radius': layout.borderRadius || '0.75rem',
            }} className="min-h-full">
              <header style={{ backgroundColor: 'var(--color-header)', height: header.layout?.height || '80px' }} className={`flex items-center justify-between px-6 ${header.layout?.sticky !== false ? 'sticky top-0 z-50' : ''}`}>
                <div style={{ color: '#FFFFFF' }} className="font-cairo text-xl font-bold">{header.logo?.text || 'متجري'}</div>
                <nav className="hidden md:flex gap-6">
                  {['الرئيسية', 'المنتجات', 'التصنيفات', 'اتصل بنا'].map((item) => (
                    <span key={item} style={{ color: 'rgba(255,255,255,0.8)' }} className="font-cairo text-sm cursor-pointer hover:text-white">{item}</span>
                  ))}
                </nav>
              </header>

              <main style={{ padding: 'var(--section-padding)' }} className="space-y-8">
                <div className="rounded-2xl bg-gradient-to-br from-primary/5 to-accent/5 p-12 text-center">
                  <h1 className="font-cairo text-4xl font-bold mb-4" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}>
                    مرحباً بكم في متجرنا
                  </h1>
                  <p className="font-cairo text-lg mb-6" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}>
                    اكتشف أحدث المنتجات والعروض الحصرية
                  </p>
                  <button style={{ backgroundColor: 'var(--color-button)', color: 'var(--color-button-text)', borderRadius: 'var(--border-radius)' }} className="px-8 py-3 font-cairo text-base font-bold transition-opacity hover:opacity-90">
                    تسوق الآن
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="rounded-2xl border p-4" style={{ borderColor: colors.borders?.default || '#E1DED8', backgroundColor: 'var(--color-surface)' }}>
                      <div className="mb-3 aspect-square rounded-xl bg-gradient-to-br from-primary/10 to-accent/10" />
                      <h3 className="font-cairo text-base font-bold" style={{ color: 'var(--color-text)' }}>منتج {i}</h3>
                      <p className="font-cairo text-sm" style={{ color: 'var(--color-text-muted)' }}>وصف المنتج</p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="font-cairo text-lg font-bold" style={{ color: 'var(--color-accent)' }}>$49.99</span>
                        <button className="rounded-lg px-4 py-2 font-cairo text-sm font-bold" style={{ backgroundColor: 'var(--color-button)', color: 'var(--color-button-text)' }}>
                          أضف للسلة
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </main>

              <footer style={{ backgroundColor: 'var(--color-footer)' }} className="px-6 py-8">
                <div className="text-center">
                  <p style={{ color: 'rgba(255,255,255,0.7)' }} className="font-cairo text-sm">{footer.bottom?.copyright || '© 2026 جميع الحقوق محفوظة'}</p>
                </div>
              </footer>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
