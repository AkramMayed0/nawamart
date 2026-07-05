import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store/authStore'
import { merchantMfaVerify } from '@/api/auth'
import usePageTitle from '@/hooks/usePageTitle'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

export default function MfaChallenge() {
  const navigate = useNavigate()
  const location = useLocation()
  const login = useAuthStore((s) => s.login)
  const mfaToken = location.state?.mfaToken

  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  usePageTitle('التحقق الثنائي')

  if (!mfaToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg" dir="rtl">
        <div className="bg-surface rounded-3xl shadow-xl p-8 max-w-md w-full text-center">
          <p className="font-cairo text-text-muted">رمز التحقق غير موجود — يرجى تسجيل الدخول مجدداً</p>
          <Button className="mt-4" onClick={() => navigate('/merchant/login')}>
            تسجيل الدخول
          </Button>
        </div>
      </div>
    )
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!code.trim()) {
      setError('رمز التحقق مطلوب')
      return
    }
    if (code.length < 6) {
      setError('رمز التحقق يجب أن يكون 6 أرقام')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await merchantMfaVerify({ mfaToken, code: code.trim() })
      const { token, user, role, refreshToken } = res.data.data
      login(token, { ...user, role }, refreshToken)
      toast.success('تم تسجيل الدخول بنجاح!')
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err?.message || 'رمز التحقق غير صحيح')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-md">
        <div className="bg-surface rounded-3xl shadow-xl p-8 sm:p-10 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-l from-primary via-accent to-primary" />

          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="font-cairo font-extrabold text-2xl text-text mb-1">
              المصادقة الثنائية
            </h1>
            <p className="font-cairo text-sm text-text-muted">
              أدخل رمز التحقق من تطبيق المصادقة
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            <Input
              label="رمز التحقق"
              placeholder="000000"
              inputClassName="font-en text-center text-2xl tracking-[0.5em]"
              value={code}
              onChange={(e) => {
                setCode(e.target.value.replace(/\D/g, '').slice(0, 6))
                if (error) setError('')
              }}
              error={error}
              disabled={loading}
              maxLength={6}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full justify-center mt-2"
              loading={loading}
              disabled={loading || code.length < 6}
            >
              {loading ? 'جاري التحقق…' : 'تأكيد'}
            </Button>
          </form>

          <p className="font-cairo text-sm text-center text-text-muted mt-6">
            استخدم تطبيق المصادقة مثل Google Authenticator أو Authy
          </p>
        </div>
      </div>
    </div>
  )
}
