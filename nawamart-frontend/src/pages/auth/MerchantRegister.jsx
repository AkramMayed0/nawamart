import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store/authStore'
import { merchantRegister, merchantLoginGoogle } from '@/api/auth'
import usePageTitle from '@/hooks/usePageTitle'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import GoogleSignInButton from '@/components/ui/GoogleSignInButton'

// ── Validation helpers ──────────────────────────────────────────────────
function validate(fields) {
  const errors = {}

  if (!fields.name.trim()) {
    errors.name = 'الاسم مطلوب'
  } else if (fields.name.trim().length < 2) {
    errors.name = 'الاسم يجب أن يكون حرفين على الأقل'
  }

  if (!fields.email.trim()) {
    errors.email = 'البريد الإلكتروني مطلوب'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.trim())) {
    errors.email = 'صيغة البريد الإلكتروني غير صحيحة'
  }

  if (!fields.phone.trim()) {
    errors.phone = 'رقم الهاتف مطلوب'
  } else if (!/^[0-9+\s\-]{7,15}$/.test(fields.phone.trim())) {
    errors.phone = 'رقم الهاتف غير صحيح'
  }

  if (!fields.password) {
    errors.password = 'كلمة المرور مطلوبة'
  } else if (fields.password.length < 6) {
    errors.password = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'
  }
  return errors
}

// ── Component ───────────────────────────────────────────────────────────
export default function MerchantRegister() {
  const navigate = useNavigate()
  const login    = useAuthStore(s => s.login)

  const [fields, setFields] = useState({
    name:     '',
    email:    '',
    phone:    '',
    password: '',
  })
  const [errors,  setErrors]  = useState({})
  const [loading, setLoading] = useState(false)

  function set(key, value) {
    setFields(prev => ({ ...prev, [key]: value }))
    // Clear the error for this field as user types
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: '' }))
  }

  async function handleSubmit(e) {
    e.preventDefault()

    const errs = validate(fields)
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }

    setLoading(true)
    try {
      const res = await merchantRegister({
        name:     fields.name.trim(),
        email:    fields.email.trim().toLowerCase(),
        phone:    fields.phone.trim(),
        password: fields.password,
      })

      const { token, user, role } = res.data.data
      login(token, { ...user, role })
      toast.success('تم إنشاء الحساب بنجاح!')
      navigate('/onboarding', { replace: true })
    } catch (err) {
      const msg = err?.message || 'حدث خطأ، يرجى المحاولة مجدداً'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogleSuccess(credentialResponse) {
    setLoading(true)
    try {
      const res = await merchantLoginGoogle({ credential: credentialResponse.credential })
      const { token, user, role } = res.data.data
      login(token, { ...user, role })
      toast.success('تم إنشاء الحساب بنجاح!')
      navigate('/onboarding', { replace: true })
    } catch (err) {
      toast.error(err?.response?.data?.message || 'فشل التسجيل بحساب Google')
    } finally {
      setLoading(false)
    }
  }

  usePageTitle('إنشاء حساب تاجر')

  return (
    <div className="min-h-screen bg-bg flex" dir="rtl">

      {/* ── Brand panel (hidden on mobile) ── */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] shrink-0 bg-primary p-10">
        <img src="/logo.svg" alt="نوامارت" className="h-9 brightness-0 invert" />

        <div>
          <h2 className="font-cairo font-extrabold text-3xl text-white leading-snug mb-4">
            ابدأ البيع اليوم
            <br />
            <span className="text-accent">مجاناً تماماً</span>
          </h2>
          <ul className="space-y-3">
            {[
              'متجرك جاهز في أقل من دقيقتين',
              'استقبل طلباتك وتتبّعها لحظةً بلحظة',
              'دفع آمن عبر محافظك الإلكترونية',
              'لا عمولات على الخطة المجانية',
            ].map(item => (
              <li key={item} className="flex items-center gap-3 text-white/85 font-cairo text-[15px]">
                <span className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
                  <svg className="w-3 h-3 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="font-cairo text-xs text-white/40">
          © {new Date().getFullYear()} نوامارت — منصة التجارة الإلكترونية اليمنية
        </p>
      </div>

      {/* ── Form panel ── */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md">

          {/* Logo — mobile only */}
          <img src="/logo.svg" alt="نوامارت" className="h-8 mb-8 lg:hidden" />

          <h1 className="font-cairo font-extrabold text-2xl text-text mb-1">
            إنشاء حساب تاجر
          </h1>
          <p className="font-cairo text-sm text-text-muted mb-7">
            أنشئ حسابك وابدأ البيع اليوم — مجاناً
          </p>

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            <Input
              label="الاسم الكامل"
              placeholder="محمد أحمد"
              autoComplete="name"
              value={fields.name}
              onChange={e => set('name', e.target.value)}
              error={errors.name}
              disabled={loading}
            />

            <Input
              label="البريد الإلكتروني"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              inputClassName="font-en"
              value={fields.email}
              onChange={e => set('email', e.target.value)}
              error={errors.email}
              disabled={loading}
            />

            <Input
              label="رقم الهاتف"
              type="tel"
              placeholder="7xxxxxxxx"
              autoComplete="tel"
              inputClassName="font-en"
              dir="ltr"
              value={fields.phone}
              onChange={e => set('phone', e.target.value)}
              error={errors.phone}
              disabled={loading}
            />

            <Input
              label="كلمة المرور"
              type="password"
              placeholder="٦ أحرف على الأقل"
              autoComplete="new-password"
              value={fields.password}
              onChange={e => set('password', e.target.value)}
              error={errors.password}
              disabled={loading}
            />


            <Button
              type="submit"
              variant="accent"
              size="lg"
              className="w-full justify-center mt-1"
              loading={loading}
              disabled={loading}
            >
              {loading ? 'جاري إنشاء الحساب…' : 'ابدأ مجاناً'}
            </Button>
          </form>

          <>
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-3 font-cairo text-text-muted">أو</span>
              </div>
            </div>

            <GoogleSignInButton
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error('فشل التسجيل بحساب Google')}
              text="signup_with"
              loading={loading}
            />
          </>

          <p className="font-cairo text-sm text-center text-text-muted mt-6">
            لديك حساب؟{' '}
            <Link to="/merchant/login" className="text-primary font-semibold hover:underline">
              سجّل دخولك
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
