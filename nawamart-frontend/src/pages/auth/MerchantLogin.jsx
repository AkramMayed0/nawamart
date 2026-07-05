import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store/authStore'
import { merchantLogin, merchantLoginGoogle } from '@/api/auth'
import usePageTitle from '@/hooks/usePageTitle'
import GoogleSignInButton from '@/components/ui/GoogleSignInButton'
import { ArrowLeft, Eye, EyeOff, Store } from 'lucide-react'

function validate(fields) {
  const errors = {}
  if (!fields.email.trim()) {
    errors.email = 'البريد الإلكتروني مطلوب'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.trim())) {
    errors.email = 'صيغة البريد الإلكتروني غير صحيحة'
  }
  if (!fields.password) {
    errors.password = 'كلمة المرور مطلوبة'
  } else if (fields.password.length < 8) {
    errors.password = 'كلمة المرور يجب أن تكون 8 أحرف على الأقل'
  }
  return errors
}

function FieldInput({ label, type = 'text', placeholder, value, onChange, error, disabled, autoComplete }) {
  const [show, setShow] = useState(false)
  const isPassword = type === 'password'
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-cairo text-sm font-semibold text-text">
        {label}
      </label>
      <div className="relative">
        <input
          type={isPassword ? (show ? 'text' : 'password') : type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          autoComplete={autoComplete}
          className="font-cairo"
          style={{
            width: '100%',
            height: '46px',
            padding: isPassword ? '0 16px 0 42px' : '0 16px',
            borderRadius: '12px',
            border: error ? '1.5px solid var(--danger)' : '1.5px solid var(--color-border)',
            background: disabled ? 'var(--color-bg)' : 'var(--color-surface)',
            color: 'var(--color-text)',
            fontSize: '15px',
            outline: 'none',
            transition: 'border-color 150ms ease, box-shadow 150ms ease',
            boxSizing: 'border-box',
          }}
          onFocus={e => {
            if (!error) {
              e.target.style.borderColor = 'var(--primary)'
              e.target.style.boxShadow = '0 0 0 3px rgba(24,33,47,0.08)'
            }
          }}
          onBlur={e => {
            if (!error) {
              e.target.style.borderColor = 'var(--color-border)'
              e.target.style.boxShadow = 'none'
            }
          }}
        />
        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShow(v => !v)}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--color-text-subtle)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {error && (
        <p className="font-cairo text-xs font-semibold text-danger">{error}</p>
      )}
    </div>
  )
}

export default function MerchantLogin() {
  const navigate = useNavigate()
  const loginFn  = useAuthStore(s => s.login)

  const [fields, setFields] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
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
      const data = res.data.data
      if (data.requiresMfa) {
        navigate('/merchant/mfa-challenge', { state: { mfaToken: data.mfaToken } })
        return
      }
      const { token, user, role, refreshToken } = data
      loginFn(token, { ...user, role }, refreshToken)
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
      const { token, user, role, refreshToken } = res.data.data
      loginFn(token, { ...user, role }, refreshToken)
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
    <div className="min-h-screen flex bg-bg" dir="rtl">

      {/* ── Left dark panel ── */}
      <div
        className="hidden lg:flex flex-col justify-between w-[400px] shrink-0 p-10 relative overflow-hidden"
        style={{
          background: 'linear-gradient(160deg, #0D1117 0%, #18212F 50%, #1A2840 100%)',
        }}
      >
        {/* Decorative elements */}
        <div style={{
          position: 'absolute', top: '-80px', right: '-80px',
          width: '300px', height: '300px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(201,63,43,0.15) 0%, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute', bottom: '-40px', left: '-40px',
          width: '200px', height: '200px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(15,118,110,0.12) 0%, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute', top: '40%', left: '10%',
          width: '1px', height: '200px',
          background: 'linear-gradient(180deg, transparent, rgba(255,255,255,0.06), transparent)',
        }} />

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div style={{
              width: '40px', height: '40px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #C93F2B, #A62F20)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(201,63,43,0.4)',
            }}>
              <Store size={20} className="text-white" />
            </div>
            <span className="font-cairo font-extrabold text-xl text-white">نوامارت</span>
          </div>
        </div>

        {/* Center content */}
        <div className="relative z-10">
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(201,63,43,0.12)', border: '1px solid rgba(201,63,43,0.2)',
            borderRadius: '999px', padding: '5px 14px',
            marginBottom: '20px',
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#C93F2B', display: 'inline-block' }} />
            <span className="font-cairo text-xs font-bold" style={{ color: '#E87961' }}>
              منصة التجارة اليمنية
            </span>
          </div>

          <h2 className="font-cairo font-extrabold text-[32px] text-white leading-tight mb-4">
            مرحباً بعودتك
            <br />
            <span style={{ color: 'rgba(255,255,255,0.45)' }}>إلى متجرك</span>
          </h2>
          <p className="font-cairo text-[15px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
            سجّل دخولك للوصول إلى لوحة التحكم، إدارة طلباتك، ومتابعة أرباحك لحظةً بلحظة.
          </p>

          {/* Feature list */}
          <div className="mt-8 space-y-3">
            {['إدارة الطلبات بسهولة', 'قبول الدفع بالمحافظ', 'تتبع المبيعات'].map(item => (
              <div key={item} className="flex items-center gap-3">
                <div style={{
                  width: '20px', height: '20px', borderRadius: '50%',
                  background: 'rgba(15,118,110,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4L3.5 6.5L9 1.5" stroke="#0F766E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span className="font-cairo text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="font-cairo text-xs relative z-10" style={{ color: 'rgba(255,255,255,0.25)' }}>
          © {new Date().getFullYear()} نوامارت — جميع الحقوق محفوظة
        </p>
      </div>

      {/* ── Form panel ── */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-[400px]">

          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'linear-gradient(135deg, #C93F2B, #A62F20)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Store size={17} className="text-white" />
            </div>
            <span className="font-cairo font-extrabold text-xl text-text">نوامارت</span>
          </div>

          <div className="bg-surface border border-border"
            style={{ borderRadius: '20px', padding: '36px', boxShadow: '0 4px 6px rgba(0,0,0,0.04), 0 20px 40px rgba(0,0,0,0.08)' }}
          >
            {/* Header */}
            <div className="mb-7">
              <h1 className="font-cairo font-extrabold text-2xl mb-1.5 text-text">
                تسجيل الدخول
              </h1>
              <p className="font-cairo text-sm text-text-muted">
                أدخل بيانات حسابك للمتابعة
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <FieldInput
                label="البريد الإلكتروني"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                value={fields.email}
                onChange={e => set('email', e.target.value)}
                error={errors.email}
                disabled={loading}
              />
              <div>
                <FieldInput
                  label="كلمة المرور"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  value={fields.password}
                  onChange={e => set('password', e.target.value)}
                  error={errors.password}
                  disabled={loading}
                />
                <div className="flex justify-end mt-2">
                  <Link
                    to="/merchant/forgot-password"
                    className="font-cairo text-xs font-semibold text-text-muted hover:text-accent transition-colors"
                  >
                    نسيت كلمة المرور؟
                  </Link>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="font-cairo font-bold w-full flex items-center justify-center gap-2"
                style={{
                  height: '48px',
                  borderRadius: '12px',
                  background: loading ? 'var(--color-text-subtle)' : 'linear-gradient(135deg, #18212F 0%, #27364B 100%)',
                  color: '#FFFFFF',
                  fontSize: '15px',
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  marginTop: '8px',
                  transition: 'all 180ms ease',
                  boxShadow: loading ? 'none' : '0 4px 16px rgba(24,33,47,0.3)',
                }}
                onMouseEnter={e => { if (!loading) e.currentTarget.style.transform = 'translateY(-1px)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none' }}
              >
                {loading ? (
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="3" />
                    <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                ) : (
                  <>
                    تسجيل الدخول
                    <ArrowLeft size={16} />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 font-cairo bg-surface text-text-subtle">أو</span>
              </div>
            </div>

            <GoogleSignInButton
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error('فشل تسجيل الدخول بحساب Google')}
              text="signin_with"
              loading={loading}
            />

            <p className="font-cairo text-sm text-center mt-6 text-text-muted">
              ليس لديك حساب؟{' '}
              <Link to="/merchant/register" className="font-semibold text-accent hover:underline">
                سجّل الآن مجاناً
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}
