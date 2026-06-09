import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Palette, Type, Layout, Rows, Code, Eye, Smartphone, Tablet, Monitor, RotateCcw, Save } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { useAuthStore } from '@/store/authStore'
import { getThemeSettings, updateColors, updateFonts, updateLayout, updateSpacing, updateCustomCss, updateCustomHtml, resetThemeSettings } from '@/api/themeSettings'
import Skeleton from '@/components/ui/Skeleton'

const TABS = [
  { id: 'colors', label: 'الألوان', icon: Palette },
  { id: 'fonts', label: 'الخطوط', icon: Type },
  { id: 'layout', label: 'التخطيط', icon: Layout },
  { id: 'spacing', label: 'المسافات', icon: Rows },
  { id: 'custom', label: 'CSS/HTML مخصص', icon: Code },
]

const PREVIEW_MODES = [
  { id: 'desktop', icon: Monitor, label: 'حاسوب' },
  { id: 'tablet', icon: Tablet, label: 'جهاز لوحي' },
  { id: 'mobile', icon: Smartphone, label: 'جوال' },
]

const COLOR_FIELDS = [
  { key: 'primary', label: 'اللون الأساسي' },
  { key: 'secondary', label: 'اللون الثانوي' },
  { key: 'accent', label: 'لون التمييز' },
  { key: 'background', label: 'الخلفية' },
  { key: 'surface', label: 'سطح البطاقات' },
  { key: 'text', label: 'النص' },
  { key: 'textMuted', label: 'النص الخافت' },
  { key: 'header', label: 'الرأس' },
  { key: 'footer', label: 'التذييل' },
  { key: 'button', label: 'الزر' },
  { key: 'buttonText', label: 'نص الزر' },
  { key: 'success', label: 'النجاح' },
  { key: 'danger', label: 'الخطر' },
  { key: 'warning', label: 'تحذير' },
]

const HEADER_STYLES = [
  { value: 'classic', label: 'كلاسيكي' },
  { value: 'minimal', label: 'بسيط' },
  { value: 'centered', label: 'مركز' },
  { value: 'compact', label: 'مضغوط' },
]

const FOOTER_STYLES = [
  { value: 'classic', label: 'كلاسيكي' },
  { value: 'minimal', label: 'بسيط' },
  { value: 'simple', label: 'بسيط جداً' },
  { value: 'compact', label: 'مضغوط' },
]

const CARD_STYLES = [
  { value: 'grid', label: 'شبكي' },
  { value: 'list', label: 'قائمة' },
  { value: 'compact', label: 'مضغوط' },
]

const SIDEBAR_POSITIONS = [
  { value: 'right', label: 'يمين' },
  { value: 'left', label: 'يسار' },
  { value: 'none', label: 'بدون' },
]

const BORDER_RADIUS = [
  { value: 'none', label: 'بدون' },
  { value: 'sm', label: 'صغير' },
  { value: 'md', label: 'متوسط' },
  { value: 'lg', label: 'كبير' },
  { value: 'xl', label: 'كبير جداً' },
  { value: 'full', label: 'دائري' },
]

function ColorPicker({ label, value, onChange }) {
  const [hex, setHex] = useState(value || '#000000')

  useEffect(() => {
    setHex(value || '#000000')
  }, [value])

  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <input
          type="color"
          value={hex}
          onChange={(e) => {
            setHex(e.target.value)
            onChange(e.target.value)
          }}
          className="h-9 w-9 cursor-pointer rounded-lg border border-border p-0.5"
        />
      </div>
      <div className="flex-1">
        <label className="block font-cairo text-sm font-semibold text-text">{label}</label>
        <input
          type="text"
          value={hex}
          onChange={(e) => {
            setHex(e.target.value)
            if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
              onChange(e.target.value)
            }
          }}
          className="mt-0.5 w-full rounded-lg border border-border bg-bg-soft px-2 py-1 font-cairo text-xs text-text focus:border-accent focus:outline-none"
        />
      </div>
    </div>
  )
}

export default function ThemeCustomizerPage() {
  const { themeId } = useParams()
  const queryClient = useQueryClient()
  const store = useAuthStore((s) => s.store)

  const [activeTab, setActiveTab] = useState('colors')
  const [previewMode, setPreviewMode] = useState('desktop')
  const [colors, setColors] = useState({})
  const [fonts, setFonts] = useState({ heading: 'Cairo', body: 'Cairo' })
  const [layout, setLayout] = useState({})
  const [spacing, setSpacing] = useState({})
  const [customCss, setCustomCss] = useState('')
  const [customHtml, setCustomHtml] = useState({ header: '', footer: '' })

  const { data: settingsRes, isLoading } = useQuery({
    queryKey: ['theme-settings', store?._id],
    queryFn: () => getThemeSettings(store._id),
    enabled: !!store?._id,
  })

  useEffect(() => {
    if (settingsRes?.data) {
      setColors(settingsRes.data.colors || {})
      setFonts(settingsRes.data.fonts || { heading: 'Cairo', body: 'Cairo' })
      setLayout(settingsRes.data.layout || {})
      setSpacing(settingsRes.data.spacing || {})
      setCustomCss(settingsRes.data.customCss || '')
      setCustomHtml(settingsRes.data.customHtml || { header: '', footer: '' })
    }
  }, [settingsRes])

  const saveColors = useMutation({
    mutationFn: () => updateColors(store._id, colors),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['theme-settings'] })
      toast.success('تم حفظ الألوان بنجاح')
    },
  })

  const saveFonts = useMutation({
    mutationFn: () => updateFonts(store._id, fonts),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['theme-settings'] })
      toast.success('تم حفظ الخطوط بنجاح')
    },
  })

  const saveLayout = useMutation({
    mutationFn: () => updateLayout(store._id, layout),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['theme-settings'] })
      toast.success('تم حفظ التخطيط بنجاح')
    },
  })

  const saveSpacing = useMutation({
    mutationFn: () => updateSpacing(store._id, spacing),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['theme-settings'] })
      toast.success('تم حفظ المسافات بنجاح')
    },
  })

  const saveCustomCss = useMutation({
    mutationFn: () => updateCustomCss(store._id, customCss),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['theme-settings'] })
      toast.success('تم حفظ CSS بنجاح')
    },
  })

  const saveCustomHtml = useMutation({
    mutationFn: () => updateCustomHtml(store._id, customHtml),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['theme-settings'] })
      toast.success('تم حفظ HTML بنجاح')
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

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border bg-white px-4 py-3 md:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-violet-700">
            <Palette size={18} className="text-white" />
          </div>
          <div>
            <h1 className="font-cairo text-lg font-bold text-text">تخصيص القالب</h1>
            <p className="font-cairo text-xs text-text-muted">{settingsRes?.data?.theme?.name || 'القالب الافتراضي'}</p>
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
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-cairo text-xs font-semibold transition-all ${
                    previewMode === mode.id ? 'bg-white text-text shadow-sm' : 'text-text-muted hover:text-text'
                  }`}
                >
                  <Icon size={14} />
                  <span className="hidden sm:inline">{mode.label}</span>
                </button>
              )
            })}
          </div>
          <button
            onClick={() => resetMutation.mutate()}
            className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 font-cairo text-sm font-semibold text-text-muted transition-colors hover:bg-danger-100 hover:text-danger"
          >
            <RotateCcw size={16} />
            <span className="hidden sm:inline">إعادة تعيين</span>
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-80 shrink-0 overflow-y-auto border-l border-border bg-white p-4">
          <div className="mb-4 flex flex-col gap-1">
            {TABS.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 font-cairo text-sm font-bold transition-all text-right ${
                    activeTab === tab.id ? 'bg-accent text-white shadow-sm shadow-accent/20' : 'text-text-muted hover:bg-bg-soft hover:text-text'
                  }`}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              )
            })}
          </div>

          {activeTab === 'colors' && (
            <div className="space-y-4">
              <p className="font-cairo text-xs text-text-muted">اختر ألوان متجرك بحرية</p>
              {COLOR_FIELDS.map((field) => (
                <ColorPicker
                  key={field.key}
                  label={field.label}
                  value={colors[field.key]}
                  onChange={(val) => setColors((prev) => ({ ...prev, [field.key]: val }))}
                />
              ))}
              <button
                onClick={() => saveColors.mutate()}
                disabled={saveColors.isPending}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 font-cairo text-sm font-bold text-white transition-colors hover:bg-accent/90 disabled:opacity-50"
              >
                <Save size={16} />
                {saveColors.isPending ? '...جاري الحفظ' : 'حفظ الألوان'}
              </button>
            </div>
          )}

          {activeTab === 'fonts' && (
            <div className="space-y-4">
              <div>
                <label className="block font-cairo text-sm font-semibold text-text mb-1.5">الخط الرئيسي (العناوين)</label>
                <select
                  value={fonts.heading}
                  onChange={(e) => setFonts((prev) => ({ ...prev, heading: e.target.value }))}
                  className="w-full rounded-xl border border-border bg-bg-soft px-4 py-2.5 font-cairo text-sm text-text focus:border-accent focus:outline-none"
                >
                  <option value="Cairo">Cairo</option>
                  <option value="Almarai">Almarai</option>
                  <option value="Tajawal">Tajawal</option>
                  <option value="Noto Kufi Arabic">Noto Kufi Arabic</option>
                  <option value="Readex Pro">Readex Pro</option>
                  <option value="Inter">Inter</option>
                </select>
              </div>
              <div>
                <label className="block font-cairo text-sm font-semibold text-text mb-1.5">الخط الثانوي (النصوص)</label>
                <select
                  value={fonts.body}
                  onChange={(e) => setFonts((prev) => ({ ...prev, body: e.target.value }))}
                  className="w-full rounded-xl border border-border bg-bg-soft px-4 py-2.5 font-cairo text-sm text-text focus:border-accent focus:outline-none"
                >
                  <option value="Cairo">Cairo</option>
                  <option value="Almarai">Almarai</option>
                  <option value="Tajawal">Tajawal</option>
                  <option value="Noto Kufi Arabic">Noto Kufi Arabic</option>
                  <option value="Readex Pro">Readex Pro</option>
                  <option value="Inter">Inter</option>
                </select>
              </div>
              <div className="mt-4 rounded-xl bg-bg-soft p-4">
                <p className="font-cairo text-xs text-text-muted mb-2">معاينة سريعة:</p>
                <p className="font-cairo text-xl font-bold text-text" style={{ fontFamily: fonts.heading }}>
                  مرحباً بكم في متجرنا
                </p>
                <p className="font-cairo text-sm text-text-muted mt-1" style={{ fontFamily: fonts.body }}>
                  هذا نص تجريبي لمعاينة الخط في المتجر
                </p>
              </div>
              <button
                onClick={() => saveFonts.mutate()}
                disabled={saveFonts.isPending}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 font-cairo text-sm font-bold text-white transition-colors hover:bg-accent/90 disabled:opacity-50"
              >
                <Save size={16} />
                {saveFonts.isPending ? '...جاري الحفظ' : 'حفظ الخطوط'}
              </button>
            </div>
          )}

          {activeTab === 'layout' && (
            <div className="space-y-4">
              <div>
                <label className="block font-cairo text-sm font-semibold text-text mb-1.5">نمط الرأس</label>
                <select
                  value={layout.headerStyle}
                  onChange={(e) => setLayout((prev) => ({ ...prev, headerStyle: e.target.value }))}
                  className="w-full rounded-xl border border-border bg-bg-soft px-4 py-2.5 font-cairo text-sm text-text focus:border-accent focus:outline-none"
                >
                  {HEADER_STYLES.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-cairo text-sm font-semibold text-text mb-1.5">نمط التذييل</label>
                <select
                  value={layout.footerStyle}
                  onChange={(e) => setLayout((prev) => ({ ...prev, footerStyle: e.target.value }))}
                  className="w-full rounded-xl border border-border bg-bg-soft px-4 py-2.5 font-cairo text-sm text-text focus:border-accent focus:outline-none"
                >
                  {FOOTER_STYLES.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-cairo text-sm font-semibold text-text mb-1.5">نمط بطاقات المنتجات</label>
                <select
                  value={layout.productCardStyle}
                  onChange={(e) => setLayout((prev) => ({ ...prev, productCardStyle: e.target.value }))}
                  className="w-full rounded-xl border border-border bg-bg-soft px-4 py-2.5 font-cairo text-sm text-text focus:border-accent focus:outline-none"
                >
                  {CARD_STYLES.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-cairo text-sm font-semibold text-text mb-1.5">موضع الشريط الجانبي</label>
                <select
                  value={layout.sidebarPosition}
                  onChange={(e) => setLayout((prev) => ({ ...prev, sidebarPosition: e.target.value }))}
                  className="w-full rounded-xl border border-border bg-bg-soft px-4 py-2.5 font-cairo text-sm text-text focus:border-accent focus:outline-none"
                >
                  {SIDEBAR_POSITIONS.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-cairo text-sm font-semibold text-text mb-1.5">عرض الحاوية</label>
                <input
                  type="text"
                  value={layout.containerWidth || '1280px'}
                  onChange={(e) => setLayout((prev) => ({ ...prev, containerWidth: e.target.value }))}
                  className="w-full rounded-xl border border-border bg-bg-soft px-4 py-2.5 font-cairo text-sm text-text focus:border-accent focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-cairo text-sm font-semibold text-text mb-1.5">انحناء الزوايا</label>
                <select
                  value={layout.borderRadius || 'md'}
                  onChange={(e) => setLayout((prev) => ({ ...prev, borderRadius: e.target.value }))}
                  className="w-full rounded-xl border border-border bg-bg-soft px-4 py-2.5 font-cairo text-sm text-text focus:border-accent focus:outline-none"
                >
                  {BORDER_RADIUS.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
                <label className="font-cairo text-sm font-semibold text-text">الرسوم المتحركة</label>
                <button
                  onClick={() => setLayout((prev) => ({ ...prev, animationEnabled: !prev.animationEnabled }))}
                  className={`relative h-6 w-11 rounded-full transition-colors ${layout.animationEnabled !== false ? 'bg-accent' : 'bg-border'}`}
                >
                  <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${layout.animationEnabled !== false ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
                </button>
              </div>
              <button
                onClick={() => saveLayout.mutate()}
                disabled={saveLayout.isPending}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 font-cairo text-sm font-bold text-white transition-colors hover:bg-accent/90 disabled:opacity-50"
              >
                <Save size={16} />
                {saveLayout.isPending ? '...جاري الحفظ' : 'حفظ التخطيط'}
              </button>
            </div>
          )}

          {activeTab === 'spacing' && (
            <div className="space-y-4">
              <div>
                <label className="block font-cairo text-sm font-semibold text-text mb-1.5">تباعد الأقسام</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="0.5"
                    value={parseFloat(spacing.sectionPadding) || 4}
                    onChange={(e) => setSpacing((prev) => ({ ...prev, sectionPadding: `${e.target.value}rem` }))}
                    className="flex-1 accent-accent"
                  />
                  <span className="w-16 rounded-lg bg-bg-soft px-2 py-1 font-cairo text-xs text-text text-center">{spacing.sectionPadding}</span>
                </div>
              </div>
              <div>
                <label className="block font-cairo text-sm font-semibold text-text mb-1.5">تباعد العناصر</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="5"
                    step="0.25"
                    value={parseFloat(spacing.elementGap) || 1.5}
                    onChange={(e) => setSpacing((prev) => ({ ...prev, elementGap: `${e.target.value}rem` }))}
                    className="flex-1 accent-accent"
                  />
                  <span className="w-16 rounded-lg bg-bg-soft px-2 py-1 font-cairo text-xs text-text text-center">{spacing.elementGap}</span>
                </div>
              </div>
              <div>
                <label className="block font-cairo text-sm font-semibold text-text mb-1.5">حشوة المحتوى</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="4"
                    step="0.25"
                    value={parseFloat(spacing.contentPadding) || 1}
                    onChange={(e) => setSpacing((prev) => ({ ...prev, contentPadding: `${e.target.value}rem` }))}
                    className="flex-1 accent-accent"
                  />
                  <span className="w-16 rounded-lg bg-bg-soft px-2 py-1 font-cairo text-xs text-text text-center">{spacing.contentPadding}</span>
                </div>
              </div>
              <div className="mt-4 rounded-xl bg-bg-soft p-4">
                <p className="font-cairo text-xs text-text-muted mb-2">معاينة المسافات:</p>
                <div style={{ padding: spacing.sectionPadding }} className="rounded-lg bg-white border border-border">
                  <p className="font-cairo text-sm font-bold text-text text-center">قسم</p>
                </div>
                <div style={{ gap: spacing.elementGap }} className="mt-2 flex">
                  <div className="h-8 flex-1 rounded bg-primary/10" />
                  <div className="h-8 flex-1 rounded bg-accent/10" />
                  <div className="h-8 flex-1 rounded bg-teal/10" />
                </div>
              </div>
              <button
                onClick={() => saveSpacing.mutate()}
                disabled={saveSpacing.isPending}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 font-cairo text-sm font-bold text-white transition-colors hover:bg-accent/90 disabled:opacity-50"
              >
                <Save size={16} />
                {saveSpacing.isPending ? '...جاري الحفظ' : 'حفظ المسافات'}
              </button>
            </div>
          )}

          {activeTab === 'custom' && (
            <div className="space-y-4">
              <div>
                <label className="block font-cairo text-sm font-semibold text-text mb-1.5">CSS مخصص</label>
                <p className="font-cairo text-xs text-text-muted mb-2">أضف أكواد CSS لتخصيص متجرك بشكل متقدم</p>
                <textarea
                  value={customCss}
                  onChange={(e) => setCustomCss(e.target.value)}
                  rows={10}
                  className="w-full rounded-xl border border-border bg-bg-soft px-4 py-3 font-mono text-xs text-text placeholder:text-text-subtle focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                  placeholder="/* اكتب CSS المخصص هنا */"
                  dir="ltr"
                />
                <button
                  onClick={() => saveCustomCss.mutate()}
                  disabled={saveCustomCss.isPending}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 font-cairo text-sm font-bold text-white transition-colors hover:bg-accent/90 disabled:opacity-50"
                >
                  <Save size={16} />
                  {saveCustomCss.isPending ? '...جاري الحفظ' : 'حفظ CSS'}
                </button>
              </div>
              <div className="border-t border-border pt-4">
                <label className="block font-cairo text-sm font-semibold text-text mb-1.5">كود HEAD المخصص</label>
                <p className="font-cairo text-xs text-text-muted mb-2">أضف أكواد في وسم HEAD (Google Analytics, Meta, إلخ)</p>
                <textarea
                  value={customHtml.header || ''}
                  onChange={(e) => setCustomHtml((prev) => ({ ...prev, header: e.target.value }))}
                  rows={6}
                  className="w-full rounded-xl border border-border bg-bg-soft px-4 py-3 font-mono text-xs text-text placeholder:text-text-subtle focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                  placeholder="<!-- أكواد HEAD -->"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="block font-cairo text-sm font-semibold text-text mb-1.5">كود FOOTER المخصص</label>
                <p className="font-cairo text-xs text-text-muted mb-2">أضف أكواد قبل إغلاق وسم BODY</p>
                <textarea
                  value={customHtml.footer || ''}
                  onChange={(e) => setCustomHtml((prev) => ({ ...prev, footer: e.target.value }))}
                  rows={6}
                  className="w-full rounded-xl border border-border bg-bg-soft px-4 py-3 font-mono text-xs text-text placeholder:text-text-subtle focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                  placeholder="<!-- أكواد FOOTER -->"
                  dir="ltr"
                />
                <button
                  onClick={() => saveCustomHtml.mutate()}
                  disabled={saveCustomHtml.isPending}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 font-cairo text-sm font-bold text-white transition-colors hover:bg-accent/90 disabled:opacity-50"
                >
                  <Save size={16} />
                  {saveCustomHtml.isPending ? '...جاري الحفظ' : 'حفظ HTML'}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className={`flex-1 overflow-y-auto bg-bg ${previewMode === 'mobile' ? 'p-8 flex justify-center' : ''} ${previewMode === 'tablet' ? 'p-6 flex justify-center' : ''}`}>
          <div
            className={`bg-white shadow-sm border border-border overflow-y-auto ${
              previewMode === 'mobile' ? 'w-[375px] h-[812px] rounded-3xl' : ''
            } ${previewMode === 'tablet' ? 'w-[768px] h-[1024px] rounded-2xl' : 'min-h-full w-full rounded-none'}`}
          >
            <div
              style={{
                '--color-primary': colors.primary,
                '--color-secondary': colors.secondary,
                '--color-accent': colors.accent,
                '--color-background': colors.background,
                '--color-surface': colors.surface,
                '--color-text': colors.text,
                '--color-text-muted': colors.textMuted,
                '--color-header': colors.header,
                '--color-footer': colors.footer,
                '--color-button': colors.button,
                '--color-button-text': colors.buttonText,
                '--color-success': colors.success,
                '--color-danger': colors.danger,
                '--color-warning': colors.warning,
                '--font-heading': fonts.heading,
                '--font-body': fonts.body,
                '--section-padding': spacing.sectionPadding,
                '--element-gap': spacing.elementGap,
              }}
              className="min-h-full"
            >
              <header style={{ backgroundColor: 'var(--color-header)' }} className="flex items-center justify-between px-6 py-4">
                <div style={{ color: '#FFFFFF' }} className="font-cairo text-xl font-bold">متجري</div>
                <nav className="flex gap-6">
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
                  <button
                    style={{ backgroundColor: 'var(--color-button)', color: 'var(--color-button-text)' }}
                    className="rounded-xl px-8 py-3 font-cairo text-base font-bold transition-opacity hover:opacity-90"
                  >
                    تسوق الآن
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="rounded-2xl border p-4" style={{ borderColor: 'var(--color-border, #E1DED8)', backgroundColor: 'var(--color-surface)' }}>
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
                  <p style={{ color: 'rgba(255,255,255,0.7)' }} className="font-cairo text-sm">© 2026 متجري. جميع الحقوق محفوظة</p>
                </div>
              </footer>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
