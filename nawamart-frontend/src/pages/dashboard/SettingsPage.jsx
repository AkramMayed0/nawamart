import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store/authStore'
import { updateStore as updateStoreApi } from '@/api/stores'
import Input from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Input'
import Icon from '@/components/ui/Icon'
import Button from '@/components/ui/Button'
import WalletBadge from '@/components/storefront/WalletBadge'
import { resolveAssetUrl } from '@/utils/assets'

export default function SettingsPage() {
  const storeRaw = useAuthStore((s) => s.store)
  const store = Array.isArray(storeRaw) ? storeRaw[0] : storeRaw
  const syncStore = useAuthStore((s) => s.updateStore)
  const navigate = useNavigate()

  const [name, setName] = useState(store?.name || '')
  const [description, setDesc] = useState(store?.description || '')
  const [contactPhone, setContactPhone] = useState(store?.contactPhone || '')
  const [paymentAccounts, setPaymentAccounts] = useState({
    cherry: store?.paymentAccounts?.cherry || '',
    kuraimi: store?.paymentAccounts?.kuraimi || '',
    oneCash: store?.paymentAccounts?.oneCash || '',
  })
  const [logoFile, setLogoFile] = useState(null)
  const [logoPreview, setLogoPreview] = useState(store?.logo || null)
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
    const missingWallets = Object.entries(paymentAccounts).filter(([, value]) => !String(value || '').trim())
    if (missingWallets.length > 0) {
      toast.error('أضف أرقام المحافظ الثلاثة قبل الحفظ')
      return
    }

    setSaving(true)
    try {
      const formData = new FormData()
      formData.append('name', name.trim())
      formData.append('description', description.trim())
      formData.append('contactPhone', contactPhone.trim())
      formData.append('paymentAccounts', JSON.stringify(paymentAccounts))
      if (logoFile) formData.append('logo', logoFile)

      const res = await updateStoreApi(store._id, formData)
      syncStore(res.data.data)
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
              {store.type === 'digital' ? '⚡ رقمي' : '🚚 مادي'}
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
              {['cherry', 'kuraimi', 'oneCash'].map((walletKey) => (
                <div key={walletKey} className="rounded-xl border border-border bg-bg p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <WalletBadge wallet={walletKey} compact />
                    <span className="font-cairo text-xs font-bold text-text-muted">
                      {walletKey === 'cherry' ? 'Cherry' : walletKey === 'kuraimi' ? 'الكريمي' : 'OneCash'}
                    </span>
                  </div>
                  <label className="flex flex-col gap-1.5">
                    <span className="font-cairo text-sm font-semibold text-text">رقم المحفظة</span>
                    <input
                      value={paymentAccounts[walletKey]}
                      onChange={(e) => setWalletField(walletKey, e.target.value)}
                      placeholder="7XXXXXXXX"
                      className="w-full rounded border border-border bg-white px-3.5 py-2.5 font-cairo text-[15px] text-text outline-none transition-[border-color,box-shadow] duration-default placeholder:text-text-subtle focus:border-primary focus:shadow-focus"
                    />
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-border" />

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
