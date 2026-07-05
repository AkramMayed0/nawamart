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
  Power, Tag, Globe, Languages, Coins, Server,
  Building2, Mail, MapPinned, GlobeLock, Clock, CalendarDays,
  ShieldCheck, Eye, EyeOff, ToggleLeft, Plug, Link,
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
    <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-card transition-shadow duration-fast">
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
  const [name, setName] = useState(store?.name || '')
  const [description, setDesc] = useState(store?.description || '')
  const [category, setCategory] = useState(store?.category || '')
  const [contactPhone, setContactPhone] = useState(store?.contactPhone || '')
  const [legalBusinessName, setLegalBusinessName] = useState(store?.legalBusinessName || '')
  const [contactEmail, setContactEmail] = useState(store?.contactEmail || '')
  const [address, setAddress] = useState({
    street: store?.physicalAddress?.street || '',
    city: store?.physicalAddress?.city || '',
    state: store?.physicalAddress?.state || '',
    zip: store?.physicalAddress?.zip || '',
    country: store?.physicalAddress?.country || 'YE',
  })
  const [paymentAccounts, setPaymentAccounts] = useState({
    kuraimi: store?.paymentAccounts?.kuraimi || '',
    oneCash: store?.paymentAccounts?.oneCash || '',
    jaib: store?.paymentAccounts?.jaib || '',
  })
  const [logoFile, setLogoFile] = useState(null)
  const [logoPreview, setLogoPreview] = useState(store?.logo || null)
  const [shippingFees, setShippingFees] = useState(store?.shippingFees || [])

  // Domain
  const [subdomain, setSubdomain] = useState(store?.subdomain || '')
  const [customDomain, setCustomDomain] = useState(store?.customDomain || '')
  const domainVerified = store?.domainVerified

  // Localization
  const [locale, setLocale] = useState(store?.locale || 'ar-YE')
  const [currency, setCurrency] = useState(store?.currency || 'YER')
  const [language, setLanguage] = useState(store?.language || 'ar')
  const [timezone, setTimezone] = useState(store?.timezone || 'Asia/Aden')
  const [dateFormat, setDateFormat] = useState(store?.dateFormat || 'DD/MM/YYYY')
  const [numberFormat, setNumberFormat] = useState(store?.numberFormat || '1,234.56')

  // Store status
  const [storeStatus, setStoreStatus] = useState(store?.storeStatus || 'under_construction')
  const [constructionPassword, setConstructionPassword] = useState(store?.constructionPassword || '')
  const [showConstructionPw, setShowConstructionPw] = useState(false)

  // Hosting
  const [tenantType, setTenantType] = useState(store?.tenantType || 'shared')

  // Security
  const [pwPolicy, setPwPolicy] = useState({
    minLength: store?.staffPasswordPolicy?.minLength || 8,
    requireUppercase: store?.staffPasswordPolicy?.requireUppercase !== false,
    requireLowercase: store?.staffPasswordPolicy?.requireLowercase !== false,
    requireNumber: store?.staffPasswordPolicy?.requireNumber !== false,
    requireSpecial: store?.staffPasswordPolicy?.requireSpecial !== false,
  })
  const [ipAllowlist, setIpAllowlist] = useState(
    Array.isArray(store?.ipAllowlist) ? store.ipAllowlist.join('\n') : ''
  )

  // Feature toggles
  const [featureToggles, setFeatureToggles] = useState({
    blog: store?.featureToggles?.blog || false,
    reviews: store?.featureToggles?.reviews || false,
    wishlists: store?.featureToggles?.wishlists || false,
    multiLanguage: store?.featureToggles?.multiLanguage || false,
    dropshipping: store?.featureToggles?.dropshipping || false,
  })

  // Integrations
  const [integrations, setIntegrations] = useState({
    paymentGateways: Array.isArray(store?.integrations?.paymentGateways) ? store.integrations.paymentGateways.join(', ') : '',
    shippingCarriers: Array.isArray(store?.integrations?.shippingCarriers) ? store.integrations.shippingCarriers.join(', ') : '',
    marketingTools: Array.isArray(store?.integrations?.marketingTools) ? store.integrations.marketingTools.join(', ') : '',
    accounting: Array.isArray(store?.integrations?.accounting) ? store.integrations.accounting.join(', ') : '',
  })

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
      if (legalBusinessName) formData.append('legalBusinessName', legalBusinessName.trim())
      if (contactEmail) formData.append('contactEmail', contactEmail.trim())
      formData.append('physicalAddress', JSON.stringify(address))
      formData.append('paymentAccounts', JSON.stringify(paymentAccounts))
      formData.append('storeStatus', storeStatus)
      if (constructionPassword) formData.append('constructionPassword', constructionPassword.trim())
      if (store.type === 'physical') {
        formData.append('shippingFees', JSON.stringify(shippingFees))
      }
      if (subdomain) formData.append('subdomain', subdomain.trim())
      if (customDomain) formData.append('customDomain', customDomain.trim())
      formData.append('locale', locale)
      formData.append('currency', currency)
      formData.append('language', language)
      formData.append('timezone', timezone)
      formData.append('dateFormat', dateFormat)
      formData.append('numberFormat', numberFormat)
      formData.append('tenantType', tenantType)
      formData.append('staffPasswordPolicy', JSON.stringify(pwPolicy))
      formData.append('ipAllowlist', JSON.stringify(
        ipAllowlist.split('\n').map(s => s.trim()).filter(Boolean)
      ))
      formData.append('featureToggles', JSON.stringify(featureToggles))
      formData.append('integrations', JSON.stringify({
        paymentGateways: integrations.paymentGateways.split(',').map(s => s.trim()).filter(Boolean),
        shippingCarriers: integrations.shippingCarriers.split(',').map(s => s.trim()).filter(Boolean),
        marketingTools: integrations.marketingTools.split(',').map(s => s.trim()).filter(Boolean),
        accounting: integrations.accounting.split(',').map(s => s.trim()).filter(Boolean),
      }))
      if (logoFile) formData.append('logo', logoFile)

      const res = await updateStoreApi(store._id, formData)
      syncStore(res.data.data)

      prefs.setShowRecentOrders(showRecent)
      prefs.setShowSubscriptionSummary(showSub)
      prefs.setShowFeaturedProducts(showFeatured)

      toast.success('تم حفظ التغييرات')
    } catch (err) {
      toast.error(err?.message || 'حدث خطأ أثناء الحفظ')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8" dir="rtl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-accent-50 to-accent-100 flex items-center justify-center shadow-sm">
          <Store size={20} className="text-accent-700" />
        </div>
        <div>
          <h1 className="font-cairo font-extrabold text-2xl text-text">إعدادات المتجر</h1>
          <p className="font-cairo text-sm text-text-muted mt-0.5">عدّل بيانات متجرك. التغييرات تظهر فورا للعملاء.</p>
        </div>
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
                  className="h-10 w-full rounded-lg border border-border bg-surface px-3 font-cairo text-sm text-text outline-none transition-colors focus:border-primary appearance-none"
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

            <Input
              label="البريد الإلكتروني للمتجر"
              placeholder="store@example.com"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              disabled={saving}
              prefix={<Mail size={16} />}
              inputClassName="font-en"
            />

            <Input
              label="الاسم التجاري القانوني"
              placeholder="مؤسسة المختار للتجارة"
              value={legalBusinessName}
              onChange={(e) => setLegalBusinessName(e.target.value)}
              disabled={saving}
              prefix={<Building2 size={16} />}
            />

            <div className="border-t border-border pt-4">
              <div className="flex items-center gap-2 mb-3">
                <MapPinned size={14} className="text-text-muted" />
                <span className="font-cairo text-sm font-semibold text-text">العنوان الفعلي</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="md:col-span-2">
                  <Input
                    label="الشارع"
                    placeholder="شارع المختار، حي الروضة"
                    value={address.street}
                    onChange={(e) => setAddress(a => ({ ...a, street: e.target.value }))}
                    disabled={saving}
                  />
                </div>
                <Input
                  label="المدينة"
                  placeholder="صنعاء"
                  value={address.city}
                  onChange={(e) => setAddress(a => ({ ...a, city: e.target.value }))}
                  disabled={saving}
                />
                <Input
                  label="المحافظة"
                  placeholder="أمانة العاصمة"
                  value={address.state}
                  onChange={(e) => setAddress(a => ({ ...a, state: e.target.value }))}
                  disabled={saving}
                />
                <Input
                  label="الرمز البريدي"
                  placeholder="00000"
                  value={address.zip}
                  onChange={(e) => setAddress(a => ({ ...a, zip: e.target.value }))}
                  disabled={saving}
                />
                <Input
                  label="الدولة"
                  placeholder="YE"
                  value={address.country}
                  onChange={(e) => setAddress(a => ({ ...a, country: e.target.value }))}
                  disabled={saving}
                />
              </div>
            </div>

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
                        className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 font-cairo text-sm font-semibold transition-all hover:bg-bg hover:border-primary/30 hover:text-primary"
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
                    inputClassName="font-en bg-surface"
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
                      className="h-10 w-full rounded-lg border border-border bg-surface px-3 font-cairo text-sm text-text outline-none transition-colors focus:border-primary appearance-none"
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

        {/* Domain Settings */}
        <SectionCard icon={GlobeLock} title="النطاق (Domain)" subtitle="إعدادات النطاق الفرعي والنطاق المخصص للمتجر" accent="info"
          iconBg="bg-info-100 text-info"
        >
          <div className="flex flex-col gap-5">
            <Input
              label="النطاق الفرعي (Subdomain)"
              placeholder="متجري"
              value={subdomain}
              onChange={(e) => setSubdomain(e.target.value)}
              prefix={<Link size={16} />}
              suffix={<span className="font-cairo text-xs text-text-muted">.nawamart.com</span>}
            />
            {subdomain && (
              <p className="font-cairo text-xs text-primary -mt-3">
                رابط متجرك سيكون: https://{subdomain}.nawamart.com
              </p>
            )}
            <div className="border-t border-border pt-4">
              <Input
                label="النطاق المخصص (Custom Domain)"
                placeholder="mystore.com"
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value)}
                prefix={<Globe size={16} />}
              />
              <div className="flex items-center gap-2 mt-2">
                <div className={`w-2 h-2 rounded-full ${domainVerified ? 'bg-success' : 'bg-warning'}`} />
                <span className="font-cairo text-xs text-text-muted">
                  {domainVerified ? 'النطاق موثق ✓' : 'لم يتم توثيق النطاق بعد — أضف سجل CNAME إلى نطاقك'}
                </span>
              </div>
              <p className="font-cairo text-xs text-text-subtle mt-1">
                يمكنك شراء نطاق جديد أو نقل نطاقك الحالي من خلال مزود النطاقات الخاص بنا (قريباً).
              </p>
            </div>
          </div>
        </SectionCard>

        {/* Localization */}
        <SectionCard icon={Clock} title="الإعدادات المحلية (Localization)" subtitle="المنطقة الزمنية، تنسيق التواريخ والأرقام" accent="primary"
          iconBg="bg-primary/10 text-primary"
        >
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label className="font-cairo text-sm font-semibold text-text flex items-center gap-2">
                  <Languages size={14} className="text-text-muted" />
                  اللغة
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  disabled={saving}
                  className="h-10 w-full rounded-lg border border-border bg-surface px-3 font-cairo text-sm text-text outline-none transition-colors focus:border-primary appearance-none"
                >
                  <option value="ar">العربية</option>
                  <option value="en">English</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-cairo text-sm font-semibold text-text flex items-center gap-2">
                  <Coins size={14} className="text-text-muted" />
                  العملة
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  disabled={saving}
                  className="h-10 w-full rounded-lg border border-border bg-surface px-3 font-cairo text-sm text-text outline-none transition-colors focus:border-primary appearance-none"
                >
                  <option value="YER">ريال يمني (YER)</option>
                  <option value="SAR">ريال سعودي (SAR)</option>
                  <option value="USD">دولار أمريكي (USD)</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-cairo text-sm font-semibold text-text flex items-center gap-2">
                  <Globe size={14} className="text-text-muted" />
                  الإعدادات المحلية
                </label>
                <select
                  value={locale}
                  onChange={(e) => setLocale(e.target.value)}
                  disabled={saving}
                  className="h-10 w-full rounded-lg border border-border bg-surface px-3 font-cairo text-sm text-text outline-none transition-colors focus:border-primary appearance-none"
                >
                  <option value="ar-YE">اليمن (ar-YE)</option>
                  <option value="ar-SA">السعودية (ar-SA)</option>
                  <option value="en-US">الولايات المتحدة (en-US)</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-cairo text-sm font-semibold text-text flex items-center gap-2">
                  <Clock size={14} className="text-text-muted" />
                  المنطقة الزمنية
                </label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  disabled={saving}
                  className="h-10 w-full rounded-lg border border-border bg-surface px-3 font-cairo text-sm text-text outline-none transition-colors focus:border-primary appearance-none"
                >
                  <option value="Asia/Aden">آسيا/عدن (+03:00)</option>
                  <option value="Asia/Riyadh">آسيا/الرياض (+03:00)</option>
                  <option value="Asia/Dubai">آسيا/دبي (+04:00)</option>
                  <option value="Asia/Kuwait">آسيا/الكويت (+03:00)</option>
                  <option value="UTC">التوقيت العالمي (UTC)</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label className="font-cairo text-sm font-semibold text-text flex items-center gap-2">
                  <CalendarDays size={14} className="text-text-muted" />
                  تنسيق التاريخ
                </label>
                <select
                  value={dateFormat}
                  onChange={(e) => setDateFormat(e.target.value)}
                  disabled={saving}
                  className="h-10 w-full rounded-lg border border-border bg-surface px-3 font-cairo text-sm text-text outline-none transition-colors focus:border-primary appearance-none"
                >
                  <option value="DD/MM/YYYY">يوم/شهر/سنة (31/12/2025)</option>
                  <option value="MM/DD/YYYY">شهر/يوم/سنة (12/31/2025)</option>
                  <option value="YYYY-MM-DD">سنة-شهر-يوم (2025-12-31)</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-cairo text-sm font-semibold text-text flex items-center gap-2">
                  <CalendarDays size={14} className="text-text-muted" />
                  تنسيق الأرقام
                </label>
                <select
                  value={numberFormat}
                  onChange={(e) => setNumberFormat(e.target.value)}
                  disabled={saving}
                  className="h-10 w-full rounded-lg border border-border bg-surface px-3 font-cairo text-sm text-text outline-none transition-colors focus:border-primary appearance-none"
                >
                  <option value="1,234.56">1,234.56</option>
                  <option value="1.234,56">1.234,56</option>
                  <option value="1 234,56">1 234,56</option>
                </select>
              </div>
            </div>
          </div>
        </SectionCard>

        {/* Store Status */}
        <SectionCard icon={Power} title="حالة المتجر" subtitle="التحكم في ظهور المتجر للعملاء." accent="warning"
          iconBg="bg-warning-100 text-warning"
        >
          <div className="flex flex-col gap-4">
            {[
              { value: 'live', label: 'نشط (Live)', desc: 'متجرك يظهر للعملاء ويمكنهم تقديم الطلبات.' },
              { value: 'under_construction', label: 'قيد الإنشاء', desc: 'المتجر تحت التطوير — محمي بكلمة مرور.' },
              { value: 'paused', label: 'متوقف مؤقتاً', desc: 'المتجر متوقف ولن يتمكن العملاء من تقديم طلبات جديدة.' },
              { value: 'closed', label: 'مغلق', desc: 'المتجر مغلق نهائياً ولا يظهر للعملاء.' },
            ].map((opt) => (
              <label
                key={opt.value}
                className={`flex items-start gap-3 cursor-pointer rounded-xl border-2 p-4 transition-all ${
                  storeStatus === opt.value
                    ? 'border-primary bg-primary-50'
                    : 'border-border hover:border-primary/30'
                }`}
              >
                <input
                  type="radio"
                  name="storeStatus"
                  value={opt.value}
                  checked={storeStatus === opt.value}
                  onChange={() => setStoreStatus(opt.value)}
                  className="mt-0.5 accent-primary"
                />
                <div className="flex-1">
                  <span className="font-cairo text-sm font-bold text-text block">{opt.label}</span>
                  <span className="font-cairo text-xs text-text-muted">{opt.desc}</span>
                </div>
              </label>
            ))}
            {storeStatus === 'under_construction' && (
              <div className="mr-7">
                <Input
                  label="كلمة مرور الحماية"
                  placeholder="أدخل كلمة مرور للزوار"
                  value={constructionPassword}
                  onChange={(e) => setConstructionPassword(e.target.value)}
                  disabled={saving}
                  type={showConstructionPw ? 'text' : 'password'}
                  prefix={<Eye size={16} className="cursor-pointer" onClick={() => setShowConstructionPw(p => !p)} />}
                />
                <p className="font-cairo text-xs text-text-subtle mt-1">
                  الزوار سيحتاجون إدخال كلمة المرور هذه لعرض المتجر.
                </p>
              </div>
            )}
          </div>
        </SectionCard>

        {/* Hosting */}
        <SectionCard icon={Server} title="الاستضافة" subtitle="نوع الاستضافة والبنية التحتية للمتجر" accent="info"
          iconBg="bg-info-100 text-info"
        >
          <div className="flex flex-col gap-4">
            <div className="flex gap-3">
              <label className={`flex-1 cursor-pointer rounded-xl border-2 p-3 text-center transition-all ${tenantType === 'shared' ? 'border-primary bg-primary-50' : 'border-border hover:border-primary/30'}`}>
                <input
                  type="radio"
                  name="tenantType"
                  value="shared"
                  checked={tenantType === 'shared'}
                  onChange={() => setTenantType('shared')}
                  className="sr-only"
                />
                <p className="font-cairo text-sm font-bold text-text">مشترك</p>
                <p className="font-cairo text-[10px] text-text-subtle">استضافة مشتركة مع المتاجر الأخرى</p>
              </label>
              <label className={`flex-1 cursor-pointer rounded-xl border-2 p-3 text-center transition-all ${tenantType === 'dedicated' ? 'border-accent bg-accent-50' : 'border-border hover:border-accent/30'}`}>
                <input
                  type="radio"
                  name="tenantType"
                  value="dedicated"
                  checked={tenantType === 'dedicated'}
                  onChange={() => setTenantType('dedicated')}
                  className="sr-only"
                />
                <p className="font-cairo text-sm font-bold text-text">مخصص</p>
                <p className="font-cairo text-[10px] text-text-subtle">استضافة مخصصة (للمتاجر ذات الحجم الكبير)</p>
              </label>
            </div>
            {tenantType === 'dedicated' && (
              <p className="font-cairo text-xs text-text-subtle">
                يتطلب البنية التحتية المخصصة ترقية إلى خطة الأعمال (Business). سيتم توفير نطاق فرعي وخادم مخصص.
              </p>
            )}
          </div>
        </SectionCard>

        {/* Security */}
        <SectionCard icon={ShieldCheck} title="الأمان (Security)" subtitle="سياسات كلمة المرور للموظفين وقائمة عناوين IP المسموح بها" accent="accent"
          iconBg="bg-accent-50 text-accent-700"
        >
          <div className="flex flex-col gap-6">
            <div>
              <h3 className="font-cairo text-sm font-bold text-text mb-3">سياسة كلمة مرور الموظفين</h3>
              <div className="flex flex-col gap-4">
                <div>
                  <label className="font-cairo text-xs font-semibold text-text-muted mb-1 block">
                    الحد الأدنى لطول كلمة المرور: {pwPolicy.minLength}
                  </label>
                  <input
                    type="range"
                    min="4"
                    max="128"
                    value={pwPolicy.minLength}
                    onChange={(e) => setPwPolicy(p => ({ ...p, minLength: Number(e.target.value) }))}
                    disabled={saving}
                    className="w-full accent-primary"
                  />
                  <div className="flex justify-between text-[10px] font-cairo text-text-subtle">
                    <span>4</span>
                    <span>128</span>
                  </div>
                </div>
                <Toggle
                  checked={pwPolicy.requireUppercase}
                  onChange={(v) => setPwPolicy(p => ({ ...p, requireUppercase: v }))}
                  label="يتطلب حرف كبير (A-Z)"
                />
                <Toggle
                  checked={pwPolicy.requireLowercase}
                  onChange={(v) => setPwPolicy(p => ({ ...p, requireLowercase: v }))}
                  label="يتطلب حرف صغير (a-z)"
                />
                <Toggle
                  checked={pwPolicy.requireNumber}
                  onChange={(v) => setPwPolicy(p => ({ ...p, requireNumber: v }))}
                  label="يتطلب رقم (0-9)"
                />
                <Toggle
                  checked={pwPolicy.requireSpecial}
                  onChange={(v) => setPwPolicy(p => ({ ...p, requireSpecial: v }))}
                  label="يتطلب رمز خاص (!@#$%)"
                />
              </div>
            </div>
            <div className="border-t border-border pt-4">
              <h3 className="font-cairo text-sm font-bold text-text mb-3">قائمة عناوين IP المسموح بها</h3>
              <p className="font-cairo text-xs text-text-muted mb-2">
                اكتب كل عنوان IP في سطر منفصل. إذا كانت القائمة فارغة، يُسمح بالوصول من أي عنوان IP.
              </p>
              <textarea
                value={ipAllowlist}
                onChange={(e) => setIpAllowlist(e.target.value)}
                dir="ltr"
                disabled={saving}
                rows={4}
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2 font-mono text-sm text-text outline-none transition-colors focus:border-primary"
                placeholder="192.168.1.1
10.0.0.1
203.0.113.5"
              />
            </div>
          </div>
        </SectionCard>

        {/* Feature Toggles */}
        <SectionCard icon={ToggleLeft} title="الميزات (Features)" subtitle="تشغيل أو إيقاف الميزات الإضافية لمتجرك" accent="success"
          iconBg="bg-success-100 text-success"
        >
          <div className="flex flex-col gap-4">
            {[
              { key: 'blog', label: 'المدونة (Blog)', desc: 'إضافة مدونة لمتجرك لنشر المقالات والأخبار.' },
              { key: 'reviews', label: 'التقييمات (Reviews)', desc: 'السماح للعملاء بتقييم المنتجات وكتابة مراجعات.' },
              { key: 'wishlists', label: 'قائمة الرغبات (Wishlists)', desc: 'تمكين العملاء من حفظ المنتجات في قائمة رغبات.' },
              { key: 'multiLanguage', label: 'تعدد اللغات', desc: 'السماح بعرض المتجر بعدة لغات (العربية، الإنجليزية).' },
              { key: 'dropshipping', label: 'الدروب شيبينغ (Dropshipping)', desc: 'تفعيل نظام الدروب شيبينغ للشحن المباشر من الموردين.' },
            ].map((ft) => (
              <Toggle
                key={ft.key}
                checked={featureToggles[ft.key]}
                onChange={(v) => setFeatureToggles(t => ({ ...t, [ft.key]: v }))}
                label={ft.label}
                description={ft.desc}
              />
            ))}
          </div>
        </SectionCard>

        {/* Integrations */}
        <SectionCard icon={Plug} title="التكاملات (Integrations)" subtitle="ربط بوابات الدفع، شركات الشحن، أدوات التسويق، والمحاسبة" accent="accent"
          iconBg="bg-accent-50 text-accent-700"
        >
          <div className="flex flex-col gap-5">
            {[
              { key: 'paymentGateways', label: 'بوابات الدفع', placeholder: 'kuraimi, oneCash, jaib, cherry' },
              { key: 'shippingCarriers', label: 'شركات الشحن', placeholder: 'YemenPost, DHL, Aramex' },
              { key: 'marketingTools', label: 'أدوات التسويق', placeholder: 'Google Ads, Meta Ads, Mailchimp' },
              { key: 'accounting', label: 'المحاسبة', placeholder: 'Zoho Books, QuickBooks, Wafeq' },
            ].map((intg) => (
              <div key={intg.key}>
                <Input
                  label={intg.label}
                  placeholder={intg.placeholder}
                  value={integrations[intg.key]}
                  onChange={(e) => setIntegrations(t => ({ ...t, [intg.key]: e.target.value }))}
                  disabled={saving}
                />
                <p className="font-cairo text-[10px] text-text-subtle mt-0.5">افصل بين الأدوات بفاصلة (،)</p>
              </div>
            ))}
          </div>
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
