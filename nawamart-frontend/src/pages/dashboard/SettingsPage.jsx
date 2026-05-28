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
import { Zap, Truck, RefreshCw, LayoutDashboard, Eye, MapPin, Plus, Trash2 } from 'lucide-react'

const CITIES = ['صنعاء', 'عدن', 'تعز', 'إب', 'الحديدة', 'المكلا', 'حضرموت', 'مأرب', 'ذمار', 'البيضاء', 'عمران', 'ريمة', 'الضالع', 'لحج', 'أبين', 'شبوة', 'الجوف', 'صعدة']

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
  const fileInputRef = useRef(null)

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
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 font-cairo text-sm font-bold text-white transition-colors hover:bg-primary-700"
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
      formData.append('contactPhone', contactPhone.trim())
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
    <div className="mx-auto max-w-3xl px-4 py-8" dir="rtl">
      <h1 className="mb-1 font-cairo text-2xl font-extrabold text-text">إعدادات المتجر</h1>
      <p className="mb-8 font-cairo text-sm text-text-muted">
        عدّل بيانات متجرك. التغييرات تظهر فورا للعملاء.
      </p>

      <form onSubmit={handleSave}>
        <div className="flex flex-col gap-5 rounded-xl border border-border bg-white p-6">
          <Input
            label="اسم المتجر"
            placeholder="متجر المختار"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={saving}
          />

          <Textarea
            label="وصف المتجر"
            placeholder="جملة أو اثنتان تظهران في صفحة متجرك للعملاء."
            value={description}
            onChange={(e) => setDesc(e.target.value)}
            disabled={saving}
          />

          <Input
            label="رقم التواصل"
            placeholder="7XXXXXXXX"
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
            disabled={saving}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold font-cairo text-text">نوع المتجر</label>
            <div
              className={`inline-flex w-fit items-center gap-2 rounded border px-3.5 py-2.5 font-cairo text-sm font-semibold ${
                store.type === 'digital'
                  ? 'border-accent-200 bg-accent-50 text-accent-700'
                  : 'border-primary-200 bg-primary-50 text-primary'
              }`}
            >
              {store.type === 'digital' ? <Zap size={14} /> : <Truck size={14} />}
              {store.type === 'digital' ? 'رقمي' : 'مادي'}
            </div>
            <p className="text-xs font-cairo text-text-subtle">
              نوع المتجر لا يمكن تغييره بعد الإنشاء.
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold font-cairo text-text">شعار المتجر</label>
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-bg-soft">
                {logoPreview ? (
                  <img
                    src={resolveAssetUrl(logoPreview) || logoPreview}
                    alt="شعار المتجر"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Icon name="image" size={24} className="text-text-subtle" />
                )}
              </div>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 rounded border border-border bg-white px-4 py-2 font-cairo text-sm font-semibold transition-colors hover:bg-bg"
                >
                  <Icon name="upload" size={15} />
                  {logoPreview ? 'تغيير الشعار' : 'رفع شعار'}
                </button>
                <p className="font-cairo text-xs text-text-subtle">PNG أو JPG · حتى 2 ميجابايت</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={handleLogoChange}
              />
            </div>
          </div>

          <div className="border-t border-border pt-5">
            <div className="mb-4">
              <h3 className="font-cairo text-base font-extrabold text-text">أرقام المحافظ</h3>
              <p className="mt-1 font-cairo text-sm text-text-muted">
                أدخل رقم كل محفظة لتظهر خيارات الدفع كاملة داخل صفحة الدفع.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {['kuraimi', 'oneCash', 'jaib'].map((walletKey) => (
                <div key={walletKey} className="rounded-xl border border-border bg-bg p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <WalletBadge wallet={walletKey} compact />
                    <span className="font-cairo text-xs font-bold text-text-muted">
                      {walletKey === 'kuraimi' ? 'الكريمي' : walletKey === 'oneCash' ? 'OneCash' : 'جيب'}
                    </span>
                  </div>
                  <Input
                    label="رقم المحفظة"
                    placeholder="7XXXXXXXX"
                    value={paymentAccounts[walletKey]}
                    onChange={(e) => setWalletField(walletKey, e.target.value)}
                    inputClassName="font-en"
                    disabled={saving}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-border" />

          {store.type === 'physical' && (
            <>
              <div className="pt-2">
                <h3 className="font-cairo text-base font-extrabold text-text flex items-center gap-2">
                  <MapPin size={18} />
                  رسوم الشحن لكل محافظة
                </h3>
                <p className="mt-1 font-cairo text-sm text-text-muted">
                  حدد رسوم الشحن لكل محافظة. العملاء يختارون محافظتهم عند الشراء ويظهر لهم الرسوم المناسبة.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                {shippingFees.map((item, index) => (
                  <div key={index} className="flex items-center gap-3 rounded-lg border border-border bg-bg p-3">
                    <div className="flex-1">
                      <select
                        value={item.city}
                        onChange={(e) => {
                          const updated = [...shippingFees]
                          updated[index] = { ...updated[index], city: e.target.value }
                          setShippingFees(updated)
                        }}
                        disabled={saving}
                        className="h-10 w-full rounded-lg border border-border bg-white px-3 font-cairo text-sm text-text outline-none transition-colors focus:border-primary"
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
                    <span className="font-cairo text-xs text-text-muted shrink-0">ر.ي</span>
                    <button
                      type="button"
                      onClick={() => {
                        setShippingFees(shippingFees.filter((_, i) => i !== index))
                      }}
                      disabled={saving}
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-danger hover:bg-danger-100 transition-colors shrink-0"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => setShippingFees([...shippingFees, { city: '', fee: 0 }])}
                  disabled={saving}
                  className="inline-flex items-center gap-2 font-cairo font-bold text-sm text-primary hover:bg-primary-50 px-4 py-2.5 rounded-lg border border-dashed border-primary-200 transition-colors w-fit"
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
            </>
          )}

          <div className="border-t border-border" />

          {store && (
            <>
              <div className="pt-2">
                <h3 className="font-cairo text-base font-extrabold text-text flex items-center gap-2">
                  <LayoutDashboard size={18} />
                  إعدادات لوحة التحكم
                </h3>
                <p className="mt-1 font-cairo text-sm text-text-muted">
                  خيارات عرض وتخصيص للوحة التحكم الخاصة بك.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showRecent}
                    onChange={e => setShowRecent(e.target.checked)}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-accent/30"
                  />
                  <div>
                    <span className="font-cairo text-sm font-semibold text-text">إظهار الطلبات الأخيرة في الرئيسية</span>
                    <p className="font-cairo text-xs text-text-muted">عرض آخر 5 طلبات في الصفحة الرئيسية للوحة التحكم.</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showSub}
                    onChange={e => setShowSub(e.target.checked)}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-accent/30"
                  />
                  <div>
                    <span className="font-cairo text-sm font-semibold text-text">إظهار ملخص الاشتراك</span>
                    <p className="font-cairo text-xs text-text-muted">عرض حالة الاشتراك الحالية في الصفحة الرئيسية.</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer border-t border-border pt-3">
                  <input
                    type="checkbox"
                    checked={showFeatured}
                    onChange={e => setShowFeatured(e.target.checked)}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-accent/30"
                  />
                  <div>
                    <span className="font-cairo text-sm font-semibold text-text">إظهار المنتجات المميزة في المتجر</span>
                    <p className="font-cairo text-xs text-text-muted">عرض قسم المنتجات المميزة في صفحة متجرك العامة.</p>
                  </div>
                </label>
              </div>

              <div className="border-t border-border pt-4">
                <label className="flex flex-col gap-1.5">
                  <span className="font-cairo text-sm font-semibold text-text flex items-center gap-2">
                    <Eye size={15} />
                    العرض الافتراضي للوحة التحكم
                  </span>
                  <select
                    value={defaultView}
                    onChange={e => setDefaultView(e.target.value)}
                    className="h-10 w-full max-w-xs rounded-lg border border-border bg-white px-3 font-cairo text-sm text-text outline-none transition-colors focus:border-primary"
                  >
                    <option value="overview">نظرة عامة</option>
                    <option value="orders">الطلبات</option>
                    <option value="products">المنتجات</option>
                    <option value="finance">المالية</option>
                  </select>
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
                    className="inline-flex items-center gap-2 font-cairo font-bold text-sm px-4 py-2 rounded-lg border border-danger/30 text-danger hover:bg-danger-100 transition-colors w-fit"
                  >
                    <RefreshCw size={14} />
                    إعادة تعيين الإعدادات
                  </button>
                </div>
              </div>
            </>
          )}

          <div className="flex justify-start">
            <Button type="submit" variant="primary" size="md" loading={saving} disabled={saving}>
              {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
