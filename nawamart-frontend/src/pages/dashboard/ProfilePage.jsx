import { useState, useRef } from 'react'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store/authStore'
import { updateProfile } from '@/api/auth'
import usePageTitle from '@/hooks/usePageTitle'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { resolveAssetUrl } from '@/utils/assets'
import { User, Lock, Mail, Camera, Phone, Pencil, Shield, AlertTriangle } from 'lucide-react'

/* ── Section card ── */
function SectionCard({ icon: Icon, iconColor = '#6366F1', title, subtitle, children }) {
  return (
    <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
      <div
        className="flex items-center gap-3 px-5 py-4 border-b border-border"
      >
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: `rgba(${hexToRgb(iconColor)},0.10)` }}
        >
          <Icon size={18} style={{ color: iconColor }} />
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

function hexToRgb(hex) {
  const h = hex.replace('#', '')
  return `${parseInt(h.substring(0,2),16)}, ${parseInt(h.substring(2,4),16)}, ${parseInt(h.substring(4,6),16)}`
}

export default function ProfilePage() {
  usePageTitle('الملف الشخصي')
  const user       = useAuthStore((s) => s.user)
  const updateUser = useAuthStore((s) => s.updateUser)

  const [name, setName]                       = useState(user?.name || '')
  const [phone, setPhone]                     = useState(user?.phone || '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword]         = useState('')
  const [profileFile, setProfileFile]         = useState(null)
  const [profilePreview, setProfilePreview]   = useState(user?.profileImage || null)
  const [saving, setSaving]                   = useState(false)
  const fileInputRef = useRef(null)

  function handleImageChange(e) {
    const file = e.target.files[0]
    if (!file) return
    setProfileFile(file)
    setProfilePreview(URL.createObjectURL(file))
  }

  async function handleSave(e) {
    e.preventDefault()
    if (!name.trim()) { toast.error('الاسم مطلوب'); return }
    if ((currentPassword && !newPassword) || (!currentPassword && newPassword)) {
      toast.error('كلمة المرور الحالية والجديدة مطلوبتان معاً'); return
    }
    if (newPassword && newPassword.length < 6) {
      toast.error('كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل'); return
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

  const avatarSrc = profilePreview
    ? (profilePreview.startsWith('blob:') ? profilePreview : resolveAssetUrl(profilePreview))
    : null

  return (
    <div className="max-w-3xl mx-auto px-4 py-8" dir="rtl">

      {/* ── Page header ── */}
      <div className="page-header mb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-sm" style={{ background: 'rgba(20,184,166,0.10)' }}>
            <User size={20} style={{ color: '#14B8A6' }} />
          </div>
          <div>
            <h1 className="font-cairo font-extrabold text-2xl text-text">الملف الشخصي</h1>
            <p className="font-cairo text-sm text-text-muted mt-0.5">عدّل بيانات حسابك الشخصية وكلمة المرور.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="flex flex-col gap-5">

        {/* ── Avatar hero card ── */}
        <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
          {/* Color strip */}
          <div className="h-20 w-full" style={{ background: 'linear-gradient(135deg, #0D0D12 0%, #18212F 100%)' }} />
          <div className="px-6 pb-6">
            {/* Avatar floating above the strip */}
            <div className="flex items-end gap-5 -mt-10 mb-4">
              <div className="relative group shrink-0">
                <div
                  className="w-20 h-20 rounded-2xl overflow-hidden border-4 bg-bg-soft shadow-lg"
                  style={{ borderColor: 'var(--color-surface)' }}
                >
                  {avatarSrc
                    ? <img src={avatarSrc} alt="الصورة الشخصية" className="w-full h-full object-cover" />
                    : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
                        <User size={32} className="text-primary" />
                      </div>
                    )
                  }
                </div>
                {/* Edit overlay */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 rounded-2xl flex items-center justify-center bg-black/0 hover:bg-black/40 transition-all group"
                  aria-label="تغيير الصورة"
                >
                  <Camera size={20} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </div>
              <div className="pb-1">
                <h2 className="font-cairo font-extrabold text-xl text-text">{user?.name || 'حسابي'}</h2>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Mail size={13} className="text-text-subtle shrink-0" />
                  <p className="font-cairo text-sm text-text-muted">{user?.email || ''}</p>
                </div>
              </div>
            </div>
            <p className="font-cairo text-xs text-text-subtle">
              انقر على الصورة لتغييرها · PNG أو JPG · حتى 2 ميجابايت
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={handleImageChange}
          />
        </div>

        {/* ── Personal info ── */}
        <SectionCard
          icon={User}
          iconColor="#14B8A6"
          title="بيانات الحساب"
          subtitle="الاسم ورقم الهاتف"
        >
          <div className="flex flex-col gap-5">
            <Input
              label="الاسم"
              placeholder="محمد أحمد"
              value={name}
              onChange={e => setName(e.target.value)}
              disabled={saving}
              prefix={<Pencil size={16} />}
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold font-cairo text-text">البريد الإلكتروني</label>
              <div className="flex items-center gap-2 rounded-xl border border-border bg-bg-soft px-3.5 py-2.5">
                <Mail size={16} className="text-text-subtle shrink-0" />
                <span className="font-cairo text-[15px] text-text-muted">{user?.email || ''}</span>
              </div>
              <p className="font-cairo text-xs text-text-subtle">البريد الإلكتروني لا يمكن تغييره.</p>
            </div>
            <Input
              label="رقم الهاتف"
              placeholder="7XXXXXXXX"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              disabled={saving}
              prefix={<Phone size={16} />}
              inputClassName="font-en"
            />
          </div>
        </SectionCard>

        {/* ── Password ── */}
        <SectionCard
          icon={Lock}
          iconColor="#F59E0B"
          title="كلمة المرور"
          subtitle="اترك الحقول فارغة إذا كنت لا تريد تغيير كلمة المرور."
        >
          <div className="flex flex-col gap-4">
            <Input
              label="كلمة المرور الحالية"
              type="password"
              placeholder="********"
              autoComplete="current-password"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              disabled={saving}
              prefix={<Lock size={16} />}
            />
            <Input
              label="كلمة المرور الجديدة"
              type="password"
              placeholder="********"
              autoComplete="new-password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              disabled={saving}
              prefix={<Lock size={16} />}
            />
          </div>
        </SectionCard>

        {/* ── Security options ── */}
        <SectionCard
          icon={Shield}
          iconColor="#22C55E"
          title="خيارات الأمان"
          subtitle="إعدادات إضافية لحماية حسابك"
        >
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-cairo font-semibold text-sm text-text">المصادقة الثنائية</p>
              <p className="font-cairo text-xs text-text-muted mt-0.5">أضف طبقة حماية إضافية لحسابك</p>
            </div>
            <a
              href="/dashboard/security/mfa"
              className="font-cairo text-sm font-semibold transition-colors"
              style={{ color: '#22C55E' }}
            >
              الإعداد &larr;
            </a>
          </div>
        </SectionCard>

        {/* ── Save ── */}
        <div className="flex justify-start">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl px-6 py-2.5 font-cairo font-bold text-sm text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg,#C93F2B,#A62F20)', boxShadow: '0 4px 12px rgba(201,63,43,0.30)' }}
          >
            {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
          </button>
        </div>

        {/* ── Danger zone ── */}
        <div className="bg-surface border rounded-2xl overflow-hidden" style={{ borderColor: 'rgba(231,76,60,0.25)' }}>
          <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: 'rgba(231,76,60,0.15)' }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(231,76,60,0.08)' }}>
              <AlertTriangle size={18} style={{ color: '#E74C3C' }} />
            </div>
            <div>
              <h2 className="font-cairo font-bold text-base" style={{ color: '#E74C3C' }}>منطقة الخطر</h2>
              <p className="font-cairo text-xs text-text-muted mt-0.5">هذه الإجراءات لا يمكن التراجع عنها</p>
            </div>
          </div>
          <div className="p-5 flex items-center justify-between">
            <div>
              <p className="font-cairo font-semibold text-sm text-text">حذف الحساب</p>
              <p className="font-cairo text-xs text-text-muted mt-0.5">سيتم حذف جميع بياناتك ومتاجرك نهائياً</p>
            </div>
            <button
              type="button"
              className="font-cairo text-sm font-bold px-4 py-2 rounded-xl border transition-all hover:text-white"
              style={{ borderColor: 'rgba(231,76,60,0.4)', color: '#E74C3C' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#E74C3C'; e.currentTarget.style.color = '#fff' }}
              onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.color = '#E74C3C' }}
              onClick={() => toast.error('تواصل مع الدعم لحذف حسابك')}
            >
              حذف الحساب
            </button>
          </div>
        </div>

      </form>
    </div>
  )
}
