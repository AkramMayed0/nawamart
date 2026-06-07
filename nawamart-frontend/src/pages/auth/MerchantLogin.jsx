import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store/authStore'
import { merchantLogin, merchantLoginGoogle } from '@/api/auth'
import usePageTitle from '@/hooks/usePageTitle'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import GoogleSignInButton from '@/components/ui/GoogleSignInButton'

function validate(fields) {
  const errors = {}
  if (!fields.email.trim()) {
    errors.email = 'البريد الإلكتروني مطلوب'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.trim())) {
    errors.email = 'صيغة البريد الإلكتروني غير صحيحة'
  }
  if (!fields.password) {
    errors.password = 'كلمة المرور مطلوبة'
  } else if (fields.password.length < 6) {
    errors.password = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'
  }
  return errors
}

export default function MerchantLogin() {
  const navigate = useNavigate()
  const login    = useAuthStore(s => s.login)

  const [fields, setFields] = useState({ email: '', password: '' })
  const [errors,  setErrors]  = useState({})
  const [loading, setLoading] = useState(false)

  function set(key, value) {
    setFields(prev => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: '' }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate(fields)
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    setLoading(true)
    try {
      const res = await merchantLogin({
        email: fields.email.trim().toLowerCase(),
        password: fields.password,
      })
      const { token, user, role } = res.data.data
      login(token, { ...user, role })
      toast.success('أهلاً بعودتك!')
      navigate('/dashboard', { replace: true })
    } catch (err) {
      toast.error(err?.message || 'البريد الإلكتروني أو كلمة المرور غير صحيحة')
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
      toast.success('أهلاً بعودتك!')
      navigate('/dashboard', { replace: true })
    } catch (err) {
      toast.error(err?.response?.data?.message || 'فشل تسجيل الدخول بحساب Google')
    } finally {
      setLoading(false)
    }
  }

  usePageTitle('تسجيل دخول')

  return (
    <div className="min-h-screen bg-bg flex" dir="rtl">

      {/* ── Brand panel ── */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] shrink-0 bg-gradient-to-b from-primary via-primary/90 to-primary/80 p-10 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute bottom-20 -right-8 w-32 h-32 rounded-full bg-accent/20 blur-2xl" />
        <div className="absolute top-1/2 left-6 w-20 h-20 rounded-2xl bg-white/5 rotate-12" />

        <img src="/logo.svg" alt="نوامارت" className="h-9 brightness-0 invert relative z-10" />

        <div className="relative z-10">
          <h2 className="font-cairo font-extrabold text-3xl text-white leading-snug mb-4">
            مرحباً بعودتك
            <br />
            <span className="text-accent">إلى متجرك</span>
          </h2>
          <p className="font-cairo text-white/70 text-[15px] leading-relaxed">
            سجّل دخولك للوصول إلى لوحة التحكم، إدارة طلباتك، ومتابعة أرباحك لحظةً بلحظة.
          </p>
        </div>

        <p className="font-cairo text-xs text-white/40 relative z-10">
          © {new Date().getFullYear()} نوامارت — منصة التجارة الإلكترونية اليمنية
        </p>
      </div>

      {/* ── Form panel ── */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 bg-gradient-to-br from-bg via-white to-bg">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-xl p-8 sm:p-10 relative overflow-hidden">
            {/* Accent bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-l from-primary via-accent to-primary" />

            <img src="/logo.svg" alt="نوامارت" className="h-8 mb-8 lg:hidden" />

            <h1 className="font-cairo font-extrabold text-2xl text-text mb-1">
              تسجيل دخول التاجر
            </h1>
            <p className="font-cairo text-sm text-text-muted mb-7">
              أدخل بيانات حسابك للمتابعة
            </p>

            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
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
                label="كلمة المرور"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                value={fields.password}
                onChange={e => set('password', e.target.value)}
                error={errors.password}
                disabled={loading}
              />

              <div className="flex justify-end -mt-2">
                <Link to="/merchant/forgot-password" className="font-cairo text-xs text-primary hover:underline font-semibold">
                  نسيت كلمة المرور؟
                </Link>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full justify-center mt-1"
                loading={loading}
                disabled={loading}
              >
                {loading ? 'جاري تسجيل الدخول…' : 'تسجيل الدخول'}
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
                onError={() => toast.error('فشل تسجيل الدخول بحساب Google')}
                text="signin_with"
                loading={loading}
              />
            </>

            <p className="font-cairo text-sm text-center text-text-muted mt-6">
              ليس لديك حساب؟{' '}
              <Link to="/merchant/register" className="text-primary font-semibold hover:underline">
                سجّل الآن مجاناً
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
