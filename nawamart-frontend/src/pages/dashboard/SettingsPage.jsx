import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store/authStore'
import { usePreferencesStore } from '@/store/preferencesStore'
import { updateStore as updateStoreApi } from '@/api/stores'
import usePageTitle from '@/hooks/usePageTitle'
import Input from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Input'
import Icon from '@/components/ui/Icon'
import Button from '@/components/ui/Button'
import WalletBadge from '@/components/storefront/WalletBadge'
import { resolveAssetUrl } from '@/utils/assets'
import {
  Store, CreditCard, MapPin, LayoutDashboard, RefreshCw,
  Zap, Truck, Plus, Trash2, Upload, Phone, ChevronDown,
  Power, Tag,
} from 'lucide-react'

const CITIES = ['صنعاء', 'عدن', 'تعز', 'إب', 'الحديدة', 'المكلا', 'حضرموت', 'مأرب', 'ذمار', 'البيضاء', 'عمران', 'ريمة', 'الضالع', 'لحج', 'أبين', 'شبوة', 'الجوف', 'صعدة']

const CATEGORIES = ['إلكترونيات', 'ملابس', 'أحذية', 'مستحضرات تجميل', 'عطور', 'أثاث', 'مواد غذائية', 'مشروبات', 'هدايا', 'كتب', 'أدوات منزلية', 'ألعاب', 'معدات رياضية', 'أخرى']

const ACCENT_MAP = {
  primary: 'bg-primary/10 text-primary',
  success: 'bg-success-100 text-success',
  info: 'bg-info-100 text-info',
  warning: 'bg-warning-100 text-warning',
  accent: 'bg-accent-50 text-accent-700',
}

function SectionCard({ icon: Icon, title, subtitle, children, accent = 'primary', iconBg }) {
  const topBorder = {
    primary: 'bg-primary',
    success: 'bg-success',
    info: 'bg-info',
    warning: 'bg-warning',
    accent: 'bg-accent',
  }
  return (
    <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-card transition-shadow duration-fast">
      <div className={`h-1 ${topBorder[accent] || topBorder.primary}`} />
      <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${iconBg || ACCENT_MAP[accent] || ACCENT_MAP.primary}`}>
          <Icon size={18} />
        </div>
        <div>
          <h2 className="font-cairo font-bold text-base text-text">{title}</h2>
          {subtitle && <p className="font-cairo text-xs text-text-muted mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <div className="p-5">
        {children}
      </div>
    </div>
  )
}

function Toggle({ checked, onChange, label, description }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        dir="ltr"
        className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${
          checked ? 'bg-primary' : 'bg-border-strong'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition-transform duration-fast ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
      <div>
        <span className="font-cairo text-sm font-semibold text-text group-hover:text-primary transition-colors">{label}</span>
        {description && <p className="font-cairo text-xs text-text-muted">{description}</p>}
      </div>
    </label>
  )
}

const WALLET_COLORS = {
  kuraimi: { bg: 'bg-success-50', border: 'border-success-200', label: 'الكريمي' },
  oneCash: { bg: 'bg-info-50', border: 'border-info-200', label: 'OneCash' },
  jaib: { bg: 'bg-primary-50', border: 'border-primary-200', label: 'جيب' },
}

export default function SettingsPage() {
  usePageTitle('إعدادات المتجر')
  const storeRaw = useAuthStore((s) => s.store)
  const store = Array.isArray(storeRaw) ? storeRaw[0] : storeRaw
  const syncStore = useAuthStore((s) => s.updateStore)
  const navigate = useNavigate()

  const prefs = usePreferencesStore()
  const [showRecent, setShowRecent] = useState(prefs.showRecentOrders)
  const [showSub, setShowSub] = useState(prefs.showSubscriptionSummary)
  const [showFeatured, setShowFeatured] = useState(prefs.showFeaturedProducts)
  const [defaultView, setDefaultView] = useState(prefs.defaultView)

  const [name, setName] = useState(store?.name || '')
  const [description, setDesc] = useState(store?.description || '')
  const [category, setCategory] = useState(store?.category || '')
  const [isActive, setIsActive] = useState(store?.isActive !== false)
  const [contactPhone, setContactPhone] = useState(store?.contactPhone || '')
  const [paymentAccounts, setPaymentAccounts] = useState({
    kuraimi: store?.paymentAccounts?.kuraimi || '',
    oneCash: store?.paymentAccounts?.oneCash || '',
    jaib: store?.paymentAccounts?.jaib || '',
  })
  const [logoFile, setLogoFile] = useState(null)
  const [logoPreview, setLogoPreview] = useState(store?.logo || null)
  const [shippingFees, setShippingFees] = useState(store?.shippingFees || [])
  const [saving, setSaving] = useState(false)
  const logoInputRef = useRef(null)

  if (!store) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center" dir="rtl">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-warning-100">
          <Icon name="store" size={28} className="text-warning" />
        </div>
        <h2 className="mb-2 font-cairo text-xl font-bold text-text">لم يتم إنشاء المتجر بعد</h2>
        <p className="mb-6 font-cairo text-sm text-text-muted">
          أكمل إعداد متجرك أولا لتتمكن من تعديل الإعدادات.
        </p>
        <button
          onClick={() => navigate('/onboarding')}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 font-cairo text-sm font-bold text-white transition-colors hover:bg-primary-700 shadow-sm"
        >
          إنشاء المتجر
        </button>
      </div>
    )
  }

  function handleLogoChange(e) {
    const file = e.target.files[0]
    if (!file) return
    setLogoFile(file)
    setLogoPreview(URL.createObjectURL(file))
  }

  function setWalletField(key, value) {
    setPaymentAccounts((current) => ({ ...current, [key]: value }))
  }

  async function handleSave(e) {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('اسم المتجر مطلوب')
      return
    }
    if (!contactPhone.trim()) {
      toast.error('رقم التواصل مطلوب')
      return
    }
    const hasAnyWallet = Object.values(paymentAccounts).some(v => String(v || '').trim())
    if (!hasAnyWallet) {
      toast.error('أضف رقم محفظة واحدة على الأقل')
      return
    }

    setSaving(true)
    try {
      const formData = new FormData()
      formData.append('name', name.trim())
      formData.append('description', description.trim())
      formData.append('category', category)
      formData.append('contactPhone', contactPhone.trim())
      formData.append('isActive', isActive)
      formData.append('paymentAccounts', JSON.stringify(paymentAccounts))
      if (store.type === 'physical') {
        formData.append('shippingFees', JSON.stringify(shippingFees))
      }
      if (logoFile) formData.append('logo', logoFile)

      const res = await updateStoreApi(store._id, formData)
      syncStore(res.data.data)

      prefs.setShowRecentOrders(showRecent)
      prefs.setShowSubscriptionSummary(showSub)
      prefs.setShowFeaturedProducts(showFeatured)
      prefs.setDefaultView(defaultView)

      toast.success('تم حفظ التغييرات')
    } catch (err) {
      toast.error(err?.message || 'حدث خطأ أثناء الحفظ')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8" dir="rtl">
      <div className="mb-6">
        <h1 className="font-cairo font-extrabold text-2xl text-text">إعدادات المتجر</h1>
        <p className="font-cairo text-sm text-text-muted mt-0.5">عدّل بيانات متجرك. التغييرات تظهر فورا للعملاء.</p>
      </div>

      <form onSubmit={handleSave} className="flex flex-col gap-6">

        {/* Store Information */}
        <SectionCard icon={Store} title="معلومات المتجر" subtitle="البيانات الأساسية لمتجرك" accent="primary"
          iconBg="bg-primary/10 text-primary"
        >
          <div className="flex flex-col gap-5">
            <Input
              label="اسم المتجر"
              placeholder="متجر المختار"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={saving}
              prefix={<Store size={16} />}
            />

            <Textarea
              label="وصف المتجر"
              placeholder="جملة أو اثنتان تظهران في صفحة متجرك للعملاء."
              value={description}
              onChange={(e) => setDesc(e.target.value)}
              disabled={saving}
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold font-cairo text-text flex items-center gap-2">
                <Tag size={14} className="text-text-muted" />
                تصنيف المتجر
              </label>
              <div className="relative max-w-xs">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  disabled={saving}
                  className="h-10 w-full rounded-lg border border-border bg-white px-3 font-cairo text-sm text-text outline-none transition-colors focus:border-primary appearance-none"
                >
                  <option value="">اختر التصنيف</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <ChevronDown size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
              </div>
            </div>

            <Input
              label="رقم التواصل"
              placeholder="7XXXXXXXX"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              disabled={saving}
              prefix={<Phone size={16} />}
              inputClassName="font-en"
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold font-cairo text-text">نوع المتجر</label>
              <div
                className={`inline-flex w-fit items-center gap-2 rounded-lg border-2 px-3.5 py-2.5 font-cairo text-sm font-semibold ${
                  store.type === 'digital'
                    ? 'border-accent-300 bg-accent-50 text-accent-700'
                    : 'border-primary-300 bg-primary-50 text-primary'
                }`}
              >
                {store.type === 'digital' ? <Zap size={14} /> : <Truck size={14} />}
                {store.type === 'digital' ? 'متجر رقمي' : 'متجر مادي'}
              </div>
              <p className="text-xs font-cairo text-text-subtle">
                نوع المتجر لا يمكن تغييره بعد الإنشاء.
              </p>
            </div>

            <div className="border-t border-border pt-2">
              <div className="flex flex-col gap-4">
                {/* Logo */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold font-cairo text-text">شعار المتجر</label>
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 border-border bg-bg-soft shadow-sm">
                      {logoPreview ? (
                        <img
                          src={resolveAssetUrl(logoPreview) || logoPreview}
                          alt="شعار المتجر"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Store size={24} className="text-text-subtle" />
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={() => logoInputRef.current?.click()}
                        className="inline-flex items-center gap-2 rounded-lg border border-border bg-white px-4 py-2 font-cairo text-sm font-semibold transition-all hover:bg-bg hover:border-primary/30 hover:text-primary"
                      >
                        <Upload size={15} />
                        {logoPreview ? 'تغيير الشعار' : 'رفع شعار'}
                      </button>
                      <p className="font-cairo text-xs text-text-subtle">PNG أو JPG · حتى 2 ميجابايت</p>
                    </div>
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="hidden"
                      onChange={handleLogoChange}
                    />
                  </div>
                </div>


              </div>
            </div>
          </div>
        </SectionCard>

        {/* Payment Accounts */}
        <SectionCard icon={CreditCard} title="أرقام المحافظ" subtitle="أدخل رقم كل محفظة لتظهر خيارات الدفع كاملة داخل صفحة الدفع" accent="success"
          iconBg="bg-success-100 text-success"
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {['kuraimi', 'oneCash', 'jaib'].map((walletKey) => {
              const wc = WALLET_COLORS[walletKey]
              return (
                <div key={walletKey} className={`rounded-xl border-2 ${wc.border} ${wc.bg} p-4 transition-shadow hover:shadow-sm`}>
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <WalletBadge wallet={walletKey} compact />
                    <span className={`font-cairo text-xs font-bold px-2.5 py-1 rounded-pill ${
                      walletKey === 'kuraimi' ? 'bg-success-200 text-success-dark'
                        : walletKey === 'oneCash' ? 'bg-info-200 text-info'
                        : 'bg-primary-200 text-primary-800'
                    }`}>
                      {wc.label}
                    </span>
                  </div>
                  <Input
                    label="رقم المحفظة"
                    placeholder="7XXXXXXXX"
                    value={paymentAccounts[walletKey]}
                    onChange={(e) => setWalletField(walletKey, e.target.value)}
                    inputClassName="font-en bg-white"
                    disabled={saving}
                  />
                </div>
              )
            })}
          </div>
        </SectionCard>

        {/* Shipping Fees — physical stores only */}
        {store.type === 'physical' && (
          <SectionCard icon={MapPin} title="رسوم الشحن لكل محافظة" subtitle="حدد رسوم الشحن لكل محافظة. العملاء يختارون محافظتهم عند الشراء ويظهر لهم الرسوم المناسبة." accent="info"
            iconBg="bg-info-100 text-info"
          >
            <div className="flex flex-col gap-3">
              {shippingFees.map((item, index) => (
                <div key={index} className="flex items-center gap-3 rounded-xl border border-border bg-bg p-3 transition-shadow hover:shadow-sm">
                  <div className="flex-1">
                    <select
                      value={item.city}
                      onChange={(e) => {
                        const updated = [...shippingFees]
                        updated[index] = { ...updated[index], city: e.target.value }
                        setShippingFees(updated)
                      }}
                      disabled={saving}
                      className="h-10 w-full rounded-lg border border-border bg-white px-3 font-cairo text-sm text-text outline-none transition-colors focus:border-primary appearance-none"
                    >
                      <option value="">اختر المحافظة</option>
                      {CITIES.filter(c => !shippingFees.some((sf, si) => si !== index && sf.city === c)).map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1">
                    <Input
                      label=""
                      type="number"
                      min="0"
                      placeholder="رسوم الشحن"
                      inputClassName="font-en"
                      value={item.fee}
                      onChange={(e) => {
                        const updated = [...shippingFees]
                        updated[index] = { ...updated[index], fee: Number(e.target.value) }
                        setShippingFees(updated)
                      }}
                      disabled={saving}
                    />
                  </div>
                  <span className="font-cairo text-xs font-bold text-text-muted shrink-0">ر.ي</span>
                  <button
                    type="button"
                    onClick={() => {
                      setShippingFees(shippingFees.filter((_, i) => i !== index))
                    }}
                    disabled={saving}
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-danger hover:bg-danger-100 transition-colors shrink-0"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={() => setShippingFees([...shippingFees, { city: '', fee: 0 }])}
                disabled={saving}
                className="inline-flex items-center gap-2 font-cairo font-bold text-sm text-primary hover:bg-primary-50 px-4 py-3 rounded-xl border-2 border-dashed border-primary-200 transition-colors w-fit hover:border-primary/40"
              >
                <Plus size={16} />
                إضافة محافظة
              </button>

              {shippingFees.length === 0 && (
                <p className="font-cairo text-xs text-text-subtle">
                  لم تُضف رسوم شحن بعد. أضف محافظة وحدّد الرسوم.
                </p>
              )}
            </div>
          </SectionCard>
        )}

        {/* Store Status */}
        <SectionCard icon={Power} title="حالة المتجر" subtitle="التحكم في ظهور المتجر للعملاء." accent="warning"
          iconBg="bg-warning-100 text-warning"
        >
          <Toggle
            checked={isActive}
            onChange={setIsActive}
            label="المتجر نشط ومتاح للعملاء"
            description={isActive
              ? 'متجرك يظهر للعملاء ويمكنهم تقديم الطلبات.'
              : 'متجرك متوقف ولن يتمكن العملاء من رؤيته أو تقديم طلبات جديدة.'
            }
          />
          <p className="font-cairo text-xs text-text-subtle mt-2">
            {isActive
              ? 'يمكنك إيقاف المتجر مؤقتاً في أي وقت.'
              : 'فعّل المتجر لاستقبال الطلبات من العملاء.'
            }
          </p>
        </SectionCard>

        {/* Dashboard Preferences */}
        <SectionCard icon={LayoutDashboard} title="إعدادات لوحة التحكم" subtitle="خيارات عرض وتخصيص للوحة التحكم الخاصة بك." accent="accent"
          iconBg="bg-accent-50 text-accent-700"
        >
          <div className="flex flex-col gap-5">
            <Toggle
              checked={showRecent}
              onChange={setShowRecent}
              label="إظهار الطلبات الأخيرة في الرئيسية"
              description="عرض آخر 5 طلبات في الصفحة الرئيسية للوحة التحكم."
            />

            <Toggle
              checked={showSub}
              onChange={setShowSub}
              label="إظهار ملخص الاشتراك"
              description="عرض حالة الاشتراك الحالية في الصفحة الرئيسية."
            />

            <div className="border-t border-border pt-4">
              <Toggle
                checked={showFeatured}
                onChange={setShowFeatured}
                label="إظهار المنتجات المميزة في المتجر"
                description="عرض قسم المنتجات المميزة في صفحة متجرك العامة."
              />
            </div>

            <div className="border-t border-border pt-4">
              <label className="flex flex-col gap-1.5">
                <span className="font-cairo text-sm font-semibold text-text flex items-center gap-2">
                  <LayoutDashboard size={15} />
                  العرض الافتراضي للوحة التحكم
                </span>
                <div className="relative max-w-xs">
                  <select
                    value={defaultView}
                    onChange={e => setDefaultView(e.target.value)}
                    className="h-10 w-full rounded-lg border border-border bg-white px-3 font-cairo text-sm text-text outline-none transition-colors focus:border-primary appearance-none"
                  >
                    <option value="overview">نظرة عامة</option>
                    <option value="orders">الطلبات</option>
                    <option value="products">المنتجات</option>
                    <option value="finance">المالية</option>
                  </select>
                  <ChevronDown size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                </div>
              </label>
            </div>

            <div className="border-t border-border pt-4">
              <div className="flex flex-col gap-2">
                <span className="font-cairo text-sm font-semibold text-text flex items-center gap-2">
                  <RefreshCw size={15} />
                  إعادة تعيين لوحة التحكم
                </span>
                <p className="font-cairo text-xs text-text-muted">إعادة تعيين جميع إعدادات لوحة التحكم إلى الوضع الافتراضي.</p>
                <button
                  type="button"
                  onClick={() => {
                    setShowRecent(true)
                    setShowSub(true)
                    setShowFeatured(true)
                    setDefaultView('overview')
                    prefs.resetAll()
                    toast.success('تم إعادة تعيين الإعدادات إلى الوضع الافتراضي')
                  }}
                  className="inline-flex items-center gap-2 font-cairo font-bold text-sm px-4 py-2.5 rounded-xl border-2 border-danger/30 text-danger hover:bg-danger-100 hover:border-danger/60 transition-colors w-fit"
                >
                  <RefreshCw size={14} />
                  إعادة تعيين الإعدادات
                </button>
              </div>
            </div>
          </div>
        </SectionCard>

        <div className="flex justify-start">
          <Button type="submit" variant="primary" size="lg" loading={saving} disabled={saving}>
            {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
          </Button>
        </div>
      </form>
    </div>
  )
}
