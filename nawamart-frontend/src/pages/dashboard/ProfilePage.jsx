import { useState, useRef } from 'react'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store/authStore'
import { updateProfile } from '@/api/auth'
import usePageTitle from '@/hooks/usePageTitle'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { resolveAssetUrl } from '@/utils/assets'
import { User, Lock, Mail, Camera, Phone, Pencil } from 'lucide-react'

function SectionCard({ icon: Icon, title, subtitle, children, accent = 'primary' }) {
  const topBorder = {
    primary: 'bg-primary',
    warning: 'bg-warning',
    accent: 'bg-accent',
  }
  const iconBg = {
    primary: 'bg-primary/10 text-primary',
    warning: 'bg-warning-100 text-warning',
    accent: 'bg-accent-50 text-accent-700',
  }
  return (
    <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-card transition-shadow duration-fast">
      <div className={`h-1 ${topBorder[accent] || topBorder.primary}`} />
      <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${iconBg[accent] || iconBg.primary}`}>
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
    <div className="max-w-3xl mx-auto px-4 py-8" dir="rtl">
      <div className="mb-6">
        <h1 className="font-cairo font-extrabold text-2xl text-text">الملف الشخصي</h1>
        <p className="font-cairo text-sm text-text-muted mt-0.5">عدّل بيانات حسابك الشخصية وكلمة المرور.</p>
      </div>

      <form onSubmit={handleSave} className="flex flex-col gap-6">

        {/* Profile header card */}
        <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="h-1 bg-primary" />
          <div className="p-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
              <div className="relative group">
                <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-border bg-bg-soft shadow-sm transition-shadow group-hover:shadow-md">
                  {profilePreview ? (
                    <img
                      src={resolveAssetUrl(profilePreview) || profilePreview}
                      alt="الصورة الشخصية"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User size={40} className="text-text-subtle" />
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 left-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shadow-lg hover:bg-primary-700 transition-all hover:scale-105"
                >
                  <Camera size={14} />
                </button>
              </div>
              <div className="text-center sm:text-right flex-1 min-w-0">
                <h2 className="font-cairo font-extrabold text-xl text-text">{user?.name || 'حسابي'}</h2>
                <div className="flex items-center justify-center sm:justify-start gap-1.5 mt-1">
                  <Mail size={14} className="text-text-subtle shrink-0" />
                  <p className="font-cairo text-sm text-text-muted">{user?.email || ''}</p>
                </div>
                <p className="font-cairo text-xs text-text-subtle mt-2">PNG أو JPG · حتى 2 ميجابايت</p>
              </div>
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

        {/* Personal Information */}
        <SectionCard icon={User} title="المعلومات الشخصية" subtitle="الاسم ورقم الهاتف" accent="primary">
          <div className="flex flex-col gap-5">
            <Input
              label="الاسم"
              placeholder="محمد أحمد"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={saving}
              prefix={<Pencil size={16} />}
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold font-cairo text-text">البريد الإلكتروني</label>
              <div className="flex items-center gap-2 rounded-lg border border-border bg-bg-soft px-3.5 py-2.5">
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
              prefix={<Phone size={16} />}
              inputClassName="font-en"
            />
          </div>
        </SectionCard>

        {/* Security */}
        <SectionCard icon={Lock} title="تغيير كلمة المرور" subtitle="اترك الحقول فارغة إذا كنت لا تريد تغيير كلمة المرور." accent="warning">
          <div className="flex flex-col gap-4">
            <Input
              label="كلمة المرور الحالية"
              type="password"
              placeholder="********"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              disabled={saving}
              prefix={<Lock size={16} />}
            />
            <Input
              label="كلمة المرور الجديدة"
              type="password"
              placeholder="********"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={saving}
              prefix={<Lock size={16} />}
            />
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
