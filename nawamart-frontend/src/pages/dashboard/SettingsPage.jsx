import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store/authStore'
import { updateStore as updateStoreApi } from '@/api/stores'
import Input from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Input'
import Icon from '@/components/ui/Icon'
import Button from '@/components/ui/Button'

export default function SettingsPage() {
  const storeRaw    = useAuthStore(s => s.store)
  const store       = Array.isArray(storeRaw) ? storeRaw[0] : storeRaw
  const syncStore   = useAuthStore(s => s.updateStore)
  const navigate    = useNavigate()

  const [name,         setName]         = useState(store?.name || '')
  const [description,  setDesc]         = useState(store?.description || '')
  const [logoFile,     setLogoFile]     = useState(null)
  const [logoPreview,  setLogoPreview]  = useState(store?.logo || null)
  const [saving,       setSaving]       = useState(false)
  const fileInputRef = useRef(null)

  // Guard: no store yet → redirect to onboarding
  if (!store) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center" dir="rtl">
        <div className="w-16 h-16 rounded-2xl bg-warning-100 flex items-center justify-center mx-auto mb-4">
          <Icon name="store" size={28} className="text-warning" />
        </div>
        <h2 className="font-cairo font-bold text-xl text-text mb-2">لم يتم إنشاء المتجر بعد</h2>
        <p className="font-cairo text-sm text-text-muted mb-6">أكمل إعداد متجرك أولاً لتتمكن من تعديل الإعدادات.</p>
        <button
          onClick={() => navigate('/onboarding')}
          className="inline-flex items-center gap-2 font-cairo font-bold text-sm px-6 py-2.5 rounded-xl bg-primary text-white hover:bg-primary-700 transition-colors"
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

  async function handleSave(e) {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('اسم المتجر مطلوب')
      return
    }
    setSaving(true)
    try {
      const formData = new FormData()
      formData.append('name', name.trim())
      formData.append('description', description.trim())
      if (logoFile) formData.append('logo', logoFile)

      const res = await updateStoreApi(store._id, formData)
      syncStore(res.data.data)
      toast.success('تم حفظ التغييرات ✅')
    } catch (err) {
      toast.error(err?.message || 'حدث خطأ أثناء الحفظ')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8" dir="rtl">
      <h1 className="font-cairo font-extrabold text-2xl text-text mb-1">إعدادات المتجر</h1>
      <p className="font-cairo text-sm text-text-muted mb-8">
        عدّل بيانات متجرك — التغييرات تظهر فوراً للعملاء.
      </p>

      <form onSubmit={handleSave}>
        <div className="bg-white border border-border rounded-xl p-6 flex flex-col gap-5">

          {/* Store name */}
          <Input
            label="اسم المتجر"
            placeholder="متجر المختار"
            value={name}
            onChange={e => setName(e.target.value)}
            disabled={saving}
          />

          {/* Description */}
          <Textarea
            label="وصف المتجر"
            placeholder="جملة أو اثنتان تظهران في صفحة متجرك للعملاء."
            value={description}
            onChange={e => setDesc(e.target.value)}
            disabled={saving}
          />

          {/* Store type — read only */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-text font-cairo">نوع المتجر</label>
            <div className={`inline-flex items-center gap-2 px-3.5 py-2.5 rounded border text-sm font-cairo font-semibold w-fit ${
              store?.type === 'digital'
                ? 'bg-accent-50 text-accent-700 border-accent-200'
                : 'bg-primary-50 text-primary border-primary-200'
            }`}>
              {store?.type === 'digital' ? '⚡ رقمي' : '🚚 مادي'}
            </div>
            <p className="text-xs text-text-subtle font-cairo">
              نوع المتجر لا يمكن تغييره بعد الإنشاء.
            </p>
          </div>

          {/* Logo upload */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-text font-cairo">شعار المتجر</label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl border border-border bg-bg-soft flex items-center justify-center overflow-hidden shrink-0">
                {logoPreview
                  ? <img src={logoPreview} alt="شعار المتجر" className="w-full h-full object-cover" />
                  : <Icon name="image" size={24} className="text-text-subtle" />
                }
              </div>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 font-cairo font-semibold text-sm px-4 py-2 rounded border border-border bg-white hover:bg-bg transition-colors"
                >
                  <Icon name="upload" size={15} />
                  {logoPreview ? 'تغيير الشعار' : 'رفع شعار'}
                </button>
                <p className="text-xs text-text-subtle font-cairo">PNG أو JPG · حتى 2 ميجابايت</p>
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

          {/* Divider */}
          <div className="border-t border-border" />

          {/* Save button */}
          <div className="flex justify-start">
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={saving}
              disabled={saving}
            >
              {saving ? 'جاري الحفظ…' : 'حفظ التغييرات'}
            </Button>
          </div>

        </div>
      </form>
    </div>
  )
}
