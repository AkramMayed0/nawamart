import { useState, useRef } from 'react'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store/authStore'
import { updateProfile } from '@/api/auth'
import usePageTitle from '@/hooks/usePageTitle'
import Input from '@/components/ui/Input'
import Icon from '@/components/ui/Icon'
import Button from '@/components/ui/Button'
import { resolveAssetUrl } from '@/utils/assets'
import { User, Lock, Mail, Camera } from 'lucide-react'

export default function ProfilePage() {
  usePageTitle('الملف الشخصي')
  const user = useAuthStore((s) => s.user)
  const updateUser = useAuthStore((s) => s.updateUser)

  const [name, setName] = useState(user?.name || '')
  const [phone, setPhone] = useState(user?.phone || '')

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')

  const [profileFile, setProfileFile] = useState(null)
  const [profilePreview, setProfilePreview] = useState(user?.profileImage || null)
  const [saving, setSaving] = useState(false)
  const fileInputRef = useRef(null)

  function handleImageChange(e) {
    const file = e.target.files[0]
    if (!file) return
    setProfileFile(file)
    setProfilePreview(URL.createObjectURL(file))
  }

  async function handleSave(e) {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('الاسم مطلوب')
      return
    }

    if ((currentPassword && !newPassword) || (!currentPassword && newPassword)) {
      toast.error('كلمة المرور الحالية والجديدة مطلوبتان معاً')
      return
    }

    if (newPassword && newPassword.length < 6) {
      toast.error('كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل')
      return
    }

    setSaving(true)
    try {
      const formData = new FormData()
      formData.append('name', name.trim())
      formData.append('phone', phone.trim())

      if (currentPassword && newPassword) {
        formData.append('currentPassword', currentPassword)
        formData.append('newPassword', newPassword)
      }

      if (profileFile) formData.append('profileImage', profileFile)

      const res = await updateProfile(formData)
      updateUser(res.data.data.user)

      setCurrentPassword('')
      setNewPassword('')

      toast.success('تم تحديث الملف الشخصي')
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'حدث خطأ أثناء الحفظ')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8" dir="rtl">
      <h1 className="mb-1 font-cairo text-2xl font-extrabold text-text">الملف الشخصي</h1>
      <p className="mb-8 font-cairo text-sm text-text-muted">
        عدّل بيانات حسابك الشخصية وكلمة المرور.
      </p>

      <form onSubmit={handleSave}>
        <div className="flex flex-col gap-5 rounded-xl border border-border bg-white p-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold font-cairo text-text">الصورة الشخصية</label>
            <div className="flex items-center gap-4">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-bg-soft">
                {profilePreview ? (
                  <img
                    src={resolveAssetUrl(profilePreview) || profilePreview}
                    alt="الصورة الشخصية"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User size={32} className="text-text-subtle" />
                )}
              </div>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 rounded border border-border bg-white px-4 py-2 font-cairo text-sm font-semibold transition-colors hover:bg-bg"
                >
                  <Camera size={15} />
                  {profilePreview ? 'تغيير الصورة' : 'إضافة صورة'}
                </button>
                <p className="font-cairo text-xs text-text-subtle">PNG أو JPG · حتى 2 ميجابايت</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={handleImageChange}
              />
            </div>
          </div>

          <div className="border-t border-border" />

          <Input
            label="الاسم"
            placeholder="محمد أحمد"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={saving}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold font-cairo text-text">البريد الإلكتروني</label>
            <div className="flex items-center gap-2 rounded border border-border bg-bg-soft px-3.5 py-2.5">
              <Mail size={16} className="text-text-subtle shrink-0" />
              <span className="font-cairo text-[15px] text-text-muted">{user?.email || ''}</span>
            </div>
            <p className="font-cairo text-xs text-text-subtle">البريد الإلكتروني لا يمكن تغييره.</p>
          </div>

          <Input
            label="رقم الهاتف"
            placeholder="7XXXXXXXX"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={saving}
          />

          <div className="border-t border-border pt-2">
            <h3 className="mb-1 font-cairo text-base font-extrabold text-text flex items-center gap-2">
              <Lock size={18} />
              تغيير كلمة المرور
            </h3>
            <p className="mb-4 font-cairo text-sm text-text-muted">
              اترك الحقول فارغة إذا كنت لا تريد تغيير كلمة المرور.
            </p>

            <div className="flex flex-col gap-4">
              <Input
                label="كلمة المرور الحالية"
                type="password"
                placeholder="********"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                disabled={saving}
              />
              <Input
                label="كلمة المرور الجديدة"
                type="password"
                placeholder="********"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={saving}
              />
            </div>
          </div>

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
