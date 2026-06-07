import { useState } from 'react'
import { useNavigate, useParams, useLocation, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { resetPassword } from '@/api/auth'
import usePageTitle from '@/hooks/usePageTitle'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

export default function ResetPassword() {
  const navigate = useNavigate()
  const { token } = useParams()
  const location = useLocation()
  const userRole = location.pathname.startsWith('/customer') ? 'customer' : 'merchant'

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  usePageTitle('إعادة تعيين كلمة المرور')

  function validate() {
    const errs = {}
    if (!password) {
      errs.password = 'كلمة المرور الجديدة مطلوبة'
    } else if (password.length < 6) {
      errs.password = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'
    }
    if (!confirmPassword) {
      errs.confirmPassword = 'تأكيد كلمة المرور مطلوب'
    } else if (password !== confirmPassword) {
      errs.confirmPassword = 'كلمة المرور غير متطابقة'
    }
    return errs
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    setErrors({})
    setLoading(true)
    try {
      await resetPassword(userRole, token, password)
      setDone(true)
      toast.success('تم إعادة تعيين كلمة المرور بنجاح')
    } catch (err) {
      toast.error(err?.message || 'فشل إعادة تعيين كلمة المرور')
    } finally {
      setLoading(false)
    }
  }

  const loginLink = userRole === 'customer' ? '/customer/login' : '/merchant/login'
  const title = userRole === 'customer' ? 'العميل' : 'التاجر'

  return (
    <div className="min-h-screen bg-bg flex" dir="rtl">
      {/* ── Brand panel ── */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] shrink-0 bg-gradient-to-b from-primary via-primary/90 to-primary/80 p-10 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute bottom-20 -right-8 w-32 h-32 rounded-full bg-accent/20 blur-2xl" />

        <img src="/logo.svg" alt="نوامارت" className="h-9 brightness-0 invert relative z-10" />
        <div className="relative z-10">
          <h2 className="font-cairo font-extrabold text-3xl text-white leading-snug mb-4">
            إعادة تعيين
            <br />
            <span className="text-accent">كلمة المرور</span>
          </h2>
          <p className="font-cairo text-white/70 text-[15px] leading-relaxed">
            أدخل كلمة المرور الجديدة لحسابك.
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
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-l from-primary via-accent to-primary" />

            <img src="/logo.svg" alt="نوامارت" className="h-8 mb-8 lg:hidden" />

            {done ? (
              <>
                <h1 className="font-cairo font-extrabold text-2xl text-text mb-1">تم بنجاح!</h1>
                <p className="font-cairo text-sm text-text-muted mb-7">
                  تم إعادة تعيين كلمة المرور الخاصة بحساب {title}.
                </p>
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full justify-center"
                  onClick={() => navigate(loginLink)}
                >
                  تسجيل الدخول الآن
                </Button>
              </>
            ) : (
              <>
                <h1 className="font-cairo font-extrabold text-2xl text-text mb-1">
                  إعادة تعيين كلمة المرور
                </h1>
                <p className="font-cairo text-sm text-text-muted mb-7">
                  أدخل كلمة المرور الجديدة لحساب {title}
                </p>

                <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
                  <Input
                    label="كلمة المرور الجديدة"
                    type="password"
                    placeholder="••••••••"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setErrors((prev) => ({ ...prev, password: '' })) }}
                    error={errors.password}
                    disabled={loading}
                  />

                  <Input
                    label="تأكيد كلمة المرور"
                    type="password"
                    placeholder="••••••••"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setErrors((prev) => ({ ...prev, confirmPassword: '' })) }}
                    error={errors.confirmPassword}
                    disabled={loading}
                  />

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full justify-center mt-1"
                    loading={loading}
                    disabled={loading}
                  >
                    {loading ? 'جاري الحفظ…' : 'إعادة تعيين كلمة المرور'}
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <Link to={loginLink} className="font-cairo text-sm text-primary font-semibold hover:underline">
                    العودة إلى تسجيل الدخول
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
