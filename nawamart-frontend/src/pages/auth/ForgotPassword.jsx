import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { forgotPassword } from '@/api/auth'
import usePageTitle from '@/hooks/usePageTitle'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const location = useLocation()
  const userRole = location.pathname.startsWith('/customer') ? 'customer' : 'merchant'

  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [devLink, setDevLink] = useState('')

  usePageTitle('نسيت كلمة المرور')

  async function handleSubmit(e) {
    e.preventDefault()

    if (!email.trim()) {
      setError('البريد الإلكتروني مطلوب')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('صيغة البريد الإلكتروني غير صحيحة')
      return
    }

    setError('')
    setLoading(true)
    try {
      const res = await forgotPassword(userRole, email.trim().toLowerCase())
      const link = res?.data?.data?.resetLink
      if (link) setDevLink(link)
      setSent(true)
    } catch (err) {
      toast.error(err?.message || 'فشل إرسال رابط إعادة التعيين')
    } finally {
      setLoading(false)
    }
  }

  const loginLink = userRole === 'customer' ? '/customer/login' : '/merchant/login'
  const registerLink = userRole === 'customer' ? '/customer/register' : '/merchant/register'
  const title = userRole === 'customer' ? 'العميل' : 'التاجر'

  return (
    <div className="min-h-screen bg-bg flex" dir="rtl">
      <div className="hidden lg:flex flex-col justify-between w-[420px] shrink-0 bg-primary p-10">
        <img src="/logo.svg" alt="نوامارت" className="h-9 brightness-0 invert" />
        <div>
          <h2 className="font-cairo font-extrabold text-3xl text-white leading-snug mb-4">
            نسيت كلمة المرور؟
            <br />
            <span className="text-accent">لا تقلق</span>
          </h2>
          <p className="font-cairo text-white/70 text-[15px] leading-relaxed">
            أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور.
          </p>
        </div>
        <p className="font-cairo text-xs text-white/40">
          © {new Date().getFullYear()} نوامارت — منصة التجارة الإلكترونية اليمنية
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md">
          <img src="/logo.svg" alt="نوامارت" className="h-8 mb-8 lg:hidden" />

          {sent ? (
            <>
              <h1 className="font-cairo font-extrabold text-2xl text-text mb-1">تم الإرسال!</h1>
              <p className="font-cairo text-sm text-text-muted mb-7">
                إذا كان البريد الإلكتروني مسجلاً، ستتلقى رابط إعادة تعيين كلمة المرور خلال دقائق.
              </p>
              <p className="font-cairo text-sm text-text-muted mb-7">
                تحقق من صندوق الوارد والبريد المزعج (Spam).
              </p>
              {devLink && (
                <div className="mb-7 rounded-xl bg-accent-50 border border-accent/30 p-4">
                  <p className="font-cairo text-xs font-bold text-accent-700 mb-2">⚠️ وضع التطوير — رابط إعادة التعيين</p>
                  <a href={devLink} className="font-cairo text-sm text-primary underline break-all">{devLink}</a>
                </div>
              )}
              <Button
                variant="primary"
                size="lg"
                className="w-full justify-center"
                onClick={() => navigate(loginLink)}
              >
                العودة إلى تسجيل الدخول
              </Button>
            </>
          ) : (
            <>
              <h1 className="font-cairo font-extrabold text-2xl text-text mb-1">
                نسيت كلمة المرور
              </h1>
              <p className="font-cairo text-sm text-text-muted mb-7">
                أدخل بريدك الإلكتروني المسجل لحساب {title}
              </p>

              <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
                <Input
                  label="البريد الإلكتروني"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  inputClassName="font-en"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); if (error) setError('') }}
                  error={error}
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
                  {loading ? 'جاري الإرسال…' : 'إرسال رابط إعادة التعيين'}
                </Button>
              </form>

              <div className="mt-6 flex flex-col items-center gap-3">
                <Link to={loginLink} className="font-cairo text-sm text-primary font-semibold hover:underline">
                  تذكرت كلمة المرور؟ سجّل دخول
                </Link>
                <Link to={registerLink} className="font-cairo text-sm text-text-muted hover:underline">
                  ليس لديك حساب؟ سجّل الآن
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
