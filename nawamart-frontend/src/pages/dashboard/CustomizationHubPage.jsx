import { useNavigate } from 'react-router-dom'
import { Palette, File, Image, LayoutDashboard, Settings, Eye, Check, Sparkles, ChevronLeft, ShoppingBag, LayoutGrid, ShoppingCart, CreditCard, Smartphone, Code, PanelTop, PanelBottom, Square, Award, Type, Layout, Save, Globe } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { getThemeSettings } from '@/api/themeSettings'
import { getPresets } from '@/api/themePresets'
import { getSections } from '@/api/homepage'

const CUSTOMIZATION_SECTIONS = [
  { id: 'colors', label: 'الألوان', icon: Palette, desc: 'ألوان المتجر وخلفياته', color: 'from-violet-500 to-violet-600', bgLight: 'bg-violet-50', route: '/dashboard/themes/customize', tab: 'colors' },
  { id: 'typography', label: 'الخطوط', icon: Type, desc: 'الخطوط والأحجام والنصوص', color: 'from-blue-500 to-blue-600', bgLight: 'bg-blue-50', route: '/dashboard/themes/customize', tab: 'typography' },
  { id: 'layout', label: 'التخطيط', icon: Layout, desc: 'هيكل الموقع والشبكة', color: 'from-teal-500 to-teal-600', bgLight: 'bg-teal-50', route: '/dashboard/themes/customize', tab: 'layout' },
  { id: 'header', label: 'الرأس', icon: PanelTop, desc: 'القائمة والشعار', color: 'from-amber-500 to-amber-600', bgLight: 'bg-amber-50', route: '/dashboard/themes/customize', tab: 'header' },
  { id: 'footer', label: 'التذييل', icon: PanelBottom, desc: 'أسفل الموقع', color: 'from-stone-500 to-stone-600', bgLight: 'bg-stone-50', route: '/dashboard/themes/customize', tab: 'footer' },
  { id: 'buttons', label: 'الأزرار', icon: Square, desc: 'تصميم الأزرار', color: 'from-red-500 to-red-600', bgLight: 'bg-red-50', route: '/dashboard/themes/customize', tab: 'buttons' },
  { id: 'badges', label: 'الشارات', icon: Award, desc: 'شارات المنتجات', color: 'from-pink-500 to-pink-600', bgLight: 'bg-pink-50', route: '/dashboard/themes/customize', tab: 'badges' },
  { id: 'images', label: 'الصور', icon: Image, desc: 'صور المتجر والعلامات', color: 'from-emerald-500 to-emerald-600', bgLight: 'bg-emerald-50', route: '/dashboard/themes/customize', tab: 'images' },
  { id: 'productPage', label: 'صفحة المنتج', icon: ShoppingBag, desc: 'تخطيط المنتج والمعرض', color: 'from-orange-500 to-orange-600', bgLight: 'bg-orange-50', route: '/dashboard/themes/customize', tab: 'productPage' },
  { id: 'collectionPage', label: 'صفحة التصنيف', icon: LayoutGrid, desc: 'تخطيط المجموعات', color: 'from-cyan-500 to-cyan-600', bgLight: 'bg-cyan-50', route: '/dashboard/themes/customize', tab: 'collectionPage' },
  { id: 'cart', label: 'السلة', icon: ShoppingCart, desc: 'إعدادات سلة التسوق', color: 'from-sky-500 to-sky-600', bgLight: 'bg-sky-50', route: '/dashboard/themes/customize', tab: 'cart' },
  { id: 'checkout', label: 'الدفع', icon: CreditCard, desc: 'إعدادات الدفع', color: 'from-indigo-500 to-indigo-600', bgLight: 'bg-indigo-50', route: '/dashboard/themes/customize', tab: 'checkout' },
  { id: 'mobile', label: 'الجوال', icon: Smartphone, desc: 'إعدادات الجوال', color: 'from-purple-500 to-purple-600', bgLight: 'bg-purple-50', route: '/dashboard/themes/customize', tab: 'mobile' },
  { id: 'custom', label: 'CSS/HTML', icon: Code, desc: 'أكواد مخصصة', color: 'from-gray-500 to-gray-600', bgLight: 'bg-gray-50', route: '/dashboard/themes/customize', tab: 'custom' },
]

const QUICK_LINKS = [
  { label: 'متجر القوالب', icon: Sparkles, desc: 'تصفح وثبّت القوالب', route: '/dashboard/themes', color: 'from-violet-500 to-violet-700' },
  { label: 'الإعدادات المسبقة', icon: Save, desc: 'احفظ وطبق إعدادات سريعة', route: '/dashboard/themes/presets', color: 'from-emerald-500 to-emerald-700' },
  { label: 'بناء الصفحة الرئيسية', icon: LayoutDashboard, desc: 'أضف ورتب أقسام الصفحة', route: '/dashboard/themes/homepage', color: 'from-amber-500 to-amber-700' },
  { label: 'مدير الملفات', icon: Image, desc: 'رفع وإدارة صور وفيديوهات', route: '/dashboard/themes/assets', color: 'from-sky-500 to-sky-700' },
  { label: 'الصفحات', icon: File, desc: 'إنشاء صفحات مخصصة', route: '/dashboard/pages', color: 'from-rose-500 to-rose-700' },
  { label: 'إعدادات المتجر', icon: Settings, desc: 'معلومات المتجر والدفع', route: '/dashboard/settings', color: 'from-gray-500 to-gray-700' },
]

export default function CustomizationHubPage() {
  const navigate = useNavigate()
  const storeRaw = useAuthStore((s) => s.store)
  const store = Array.isArray(storeRaw) ? storeRaw[0] : storeRaw

  const { data: settingsRes } = useQuery({
    queryKey: ['theme-settings', store?._id],
    queryFn: () => getThemeSettings(store._id),
    enabled: !!store?._id,
  })

  const { data: presetsRes } = useQuery({
    queryKey: ['theme-presets', store?._id],
    queryFn: () => getPresets(store._id),
    enabled: !!store?._id,
  })

  const { data: sectionsRes } = useQuery({
    queryKey: ['homepage-sections', store?._id],
    queryFn: () => getSections(store._id),
    enabled: !!store?._id,
  })

  const settings = settingsRes?.data?.data
  const presets = presetsRes?.data?.data || []
  const sections = sectionsRes?.data?.data || []

  const activeSectionsCount = sections.filter((s) => s.visible !== false).length

  const sectionSummary = (id) => {
    if (!settings) return []
    const summaries = {
      colors: settings.colors?.primary ? [`${settings.colors.primary}`, `${settings.colors.accent}`] : [],
      typography: settings.typography?.heading?.family ? [`خط: ${settings.typography.heading.family}`] : [],
      layout: settings.layout?.headerStyle ? [`${settings.layout.headerStyle}`] : [],
      header: settings.header?.logo?.text ? [`شعار: ${settings.header.logo.text}`] : [],
      footer: settings.footer?.layout?.columns ? [`${settings.footer.layout.columns} أعمدة`] : [],
      buttons: settings.buttons?.primary?.background ? ['مخصص'] : [],
      badges: [],
      images: settings.images?.brand?.logo ? ['شعار مرفوع'] : [],
      productPage: settings.productPage?.layout ? [`${settings.productPage.layout}`] : [],
      collectionPage: settings.collectionPage?.layout?.default ? [`${settings.collectionPage.layout.default}`] : [],
      cart: settings.cart?.type ? [`${settings.cart.type}`] : [],
      checkout: settings.checkout?.layout ? [`${settings.checkout.layout}`] : [],
      mobile: settings.mobile?.settings?.menuStyle ? [`${settings.mobile.settings.menuStyle}`] : [],
      custom: settings.customCss || settings.customHtml?.header ? ['أكواد مخصصة'] : [],
    }
    return summaries[id] || []
  }

  const hasCustomization = (id) => sectionSummary(id).length > 0

  return (
    <div className="space-y-8 p-4 md:p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 via-purple-500 to-violet-600 shadow-lg shadow-violet-200 dark:shadow-violet-900/30">
          <Palette size={24} className="text-white" />
        </div>
        <div>
          <h1 className="font-cairo text-2xl font-bold text-text">مركز التخصيص</h1>
          <p className="font-cairo text-sm text-text-muted">كل ما تحتاجه لتخصيص متجرك في مكان واحد</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl bg-gradient-to-br from-violet-500 to-violet-700 p-5 text-white shadow-lg">
          <p className="font-cairo text-3xl font-bold">{CUSTOMIZATION_SECTIONS.length}</p>
          <p className="font-cairo text-sm opacity-80">قسم تخصيص</p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 p-5 text-white shadow-lg">
          <p className="font-cairo text-3xl font-bold">{presets.length}</p>
          <p className="font-cairo text-sm opacity-80">إعداد مسبق</p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 p-5 text-white shadow-lg">
          <p className="font-cairo text-3xl font-bold">{activeSectionsCount}</p>
          <p className="font-cairo text-sm opacity-80">قسم في الصفحة الرئيسية</p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-rose-500 to-rose-700 p-5 text-white shadow-lg">
          <p className="font-cairo text-3xl font-bold">
            {CUSTOMIZATION_SECTIONS.filter((s) => hasCustomization(s.id)).length}
          </p>
          <p className="font-cairo text-sm opacity-80">أقسام مخصصة</p>
        </div>
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-cairo text-lg font-bold text-text">روابط سريعة</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {QUICK_LINKS.map((link) => (
            <button
              key={link.route}
              onClick={() => navigate(link.route)}
              className="group relative overflow-hidden rounded-2xl p-4 text-white text-right shadow-md transition-all hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98]"
              style={{ background: `linear-gradient(135deg, ${link.color.split(' ')[0].replace('from-', '')}, ${link.color.split(' ')[1].replace('to-', '')})` }}
            >
              <div className="absolute left-2 top-2 opacity-10 group-hover:opacity-20 transition-opacity">
                {(() => { const Icon = link.icon; return <Icon size={48} /> })()}
              </div>
              <div className="relative">
                <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-white/20">
                  {(() => { const Icon = link.icon; return <Icon size={18} className="text-white" /> })()}
                </div>
                <p className="font-cairo text-sm font-bold mb-0.5">{link.label}</p>
                <p className="font-cairo text-[10px] opacity-80">{link.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-cairo text-lg font-bold text-text">أقسام التخصيص</h2>
          <button onClick={() => navigate('/dashboard/themes/customize')} className="flex items-center gap-1 rounded-xl bg-accent/10 px-3 py-1.5 font-cairo text-xs font-bold text-accent transition-all hover:bg-accent hover:text-white">
            فتح التخصيص الكامل
            <ChevronLeft size={14} />
          </button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {CUSTOMIZATION_SECTIONS.map((section) => {
            const Icon = section.icon
            const customized = hasCustomization(section.id)
            const summary = sectionSummary(section.id)
            return (
              <button
                key={section.id}
                onClick={() => navigate(`${section.route}?tab=${section.tab}`)}
                className="group relative rounded-2xl border border-border/60 bg-white p-4 text-right shadow-sm transition-all hover:shadow-md hover:border-accent/30 active:scale-[0.98]"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${section.bgLight} group-hover:scale-110 transition-transform`}>
                    <Icon size={20} className="text-text" />
                  </div>
                  {customized && (
                    <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 font-cairo text-[10px] font-semibold text-emerald-600">
                      <Check size={10} />
                      مخصص
                    </span>
                  )}
                </div>
                <h3 className="font-cairo text-sm font-bold text-text mb-0.5">{section.label}</h3>
                <p className="font-cairo text-[11px] text-text-muted mb-2">{section.desc}</p>
                {summary.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {summary.map((s, i) => (
                      <span key={i} className="rounded-md bg-bg-soft px-2 py-0.5 font-cairo text-[10px] text-text-muted">
                        {s}
                      </span>
                    ))}
                  </div>
                )}
                {!customized && (
                  <p className="font-cairo text-[10px] text-text-subtle">لم يتم التعديل بعد</p>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {presets.length > 0 && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-cairo text-lg font-bold text-text">الإعدادات المسبقة</h2>
            <button onClick={() => navigate('/dashboard/themes/presets')} className="flex items-center gap-1 rounded-xl bg-accent/10 px-3 py-1.5 font-cairo text-xs font-bold text-accent transition-all hover:bg-accent hover:text-white">
              عرض الكل
              <ChevronLeft size={14} />
            </button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {presets.slice(0, 5).map((preset) => (
              <div key={preset._id} className="shrink-0 rounded-2xl border border-border/60 bg-white p-4 w-48">
                <div className="flex items-center gap-2 mb-2">
                  <Globe size={14} className={preset.isPublic ? 'text-emerald-500' : 'text-text-subtle'} />
                  <h3 className="font-cairo text-sm font-bold text-text truncate">{preset.name}</h3>
                </div>
                <p className="font-cairo text-[10px] text-text-subtle">{new Date(preset.createdAt).toLocaleDateString('ar-YE')}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-2xl bg-gradient-to-br from-accent/5 to-accent/10 border border-accent/20 p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10">
            <Eye size={28} className="text-accent" />
          </div>
          <div className="flex-1">
            <h3 className="font-cairo text-lg font-bold text-text">شاهد متجرك</h3>
            <p className="font-cairo text-sm text-text-muted">اعرض متجرك كما يراه العملاء</p>
          </div>
          <button
            onClick={() => window.open(`/store/${store?.slug}`, '_blank')}
            className="flex items-center gap-2 rounded-xl bg-accent px-6 py-3 font-cairo text-sm font-bold text-white shadow-lg shadow-accent/20 transition-all hover:shadow-xl hover:bg-accent/90 active:scale-[0.98]"
          >
            <Eye size={16} />
            عرض المتجر
          </button>
        </div>
      </div>
    </div>
  )
}
