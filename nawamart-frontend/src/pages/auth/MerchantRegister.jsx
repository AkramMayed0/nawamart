import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store/authStore'
import { merchantRegister, merchantLoginGoogle } from '@/api/auth'
import usePageTitle from '@/hooks/usePageTitle'
import GoogleSignInButton from '@/components/ui/GoogleSignInButton'
import { Eye, EyeOff } from 'lucide-react'

function getPasswordStrength(password) {
  if (!password) return { score: 0, label: '', color: '', width: '0%' }
  let score = 0
  if (password.length >= 8) score += 20
  if (password.length >= 12) score += 10
  if (/[a-z]/.test(password)) score += 15
  if (/[A-Z]/.test(password)) score += 15
  if (/[0-9]/.test(password)) score += 15
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password)) score += 25
  if (score >= 90) return { score, label: 'ممتازة', color: '#27AE60', width: '100%' }
  if (score >= 70) return { score, label: 'قوية',   color: '#27AE60', width: '80%' }
  if (score >= 50) return { score, label: 'متوسطة', color: '#F39C12', width: '55%' }
  return { score, label: 'ضعيفة', color: '#E74C3C', width: '30%' }
}

function validate(fields) {
  const errors = {}
  if (!fields.name.trim()) errors.name = 'الاسم مطلوب'
  else if (fields.name.trim().length < 2) errors.name = 'الاسم يجب أن يكون حرفين على الأقل'

  if (!fields.email.trim()) errors.email = 'البريد الإلكتروني مطلوب'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.trim())) errors.email = 'صيغة البريد الإلكتروني غير صحيحة'

  if (!fields.phone.trim()) errors.phone = 'رقم الهاتف مطلوب'
  else if (!/^[0-9+\s\-]{7,15}$/.test(fields.phone.trim())) errors.phone = 'رقم الهاتف غير صحيح'

  if (!fields.password) errors.password = 'كلمة المرور مطلوبة'
  else if (fields.password.length < 8) errors.password = 'كلمة المرور يجب أن تكون 8 أحرف على الأقل'
  else {
    const rules = [
      [!/[a-z]/, 'حرف صغير'], [!/[A-Z]/, 'حرف كبير'],
      [!/[0-9]/, 'رقم'],       [!/[!@#$%^&*]/, 'رمز خاص'],
    ]
    const missing = rules.filter(([test]) => test.test(fields.password)).map(([, l]) => l)
    if (missing.length > 0) errors.password = `كلمة المرور يجب أن تحتوي على: ${missing.join('، ')}`
  }
  return errors
}

function PasswordStrengthBar({ password }) {
  const s = getPasswordStrength(password)
  if (!password) return null
  return (
    <div className="mt-1.5">
      <div className="h-1.5 w-full rounded-full overflow-hidden bg-bg-soft">
        <div className="h-full rounded-full transition-all duration-300" style={{ width: s.width, background: s.color }} />
      </div>
      {s.label && <p className="font-cairo text-[11px] text-text-muted mt-0.5">قوة كلمة المرور: {s.label}</p>}
    </div>
  )
}

function FieldInput({ label, type = 'text', placeholder, value, onChange, error, disabled, autoComplete, dir: inputDir }) {
  const [show, setShow] = useState(false)
  const isPassword = type === 'password'
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-cairo text-sm font-semibold text-text">{label}</label>
      <div className="relative">
        <input
          type={isPassword ? (show ? 'text' : 'password') : type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          autoComplete={autoComplete}
          dir={inputDir}
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
              position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
              color: 'var(--color-text-subtle)', background: 'none', border: 'none',
              cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center',
            }}
          >
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {error && <p className="font-cairo text-xs font-semibold text-danger">{error}</p>}
    </div>
  )
}

export default function MerchantRegister() {
  const navigate = useNavigate()
  const login    = useAuthStore(s => s.login)

  const [fields,  setFields]  = useState({ name: '', email: '', phone: '', password: '' })
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
      const res = await merchantRegister({
        name: fields.name.trim(), email: fields.email.trim().toLowerCase(),
        phone: fields.phone.trim(), password: fields.password,
      })
      const { token, user, role, refreshToken } = res.data.data
      login(token, { ...user, role }, refreshToken)
      toast.success('تم إنشاء الحساب بنجاح!')
      navigate('/onboarding', { replace: true })
    } catch (err) {
      toast.error(err?.message || 'حدث خطأ، يرجى المحاولة مجدداً')
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogleSuccess(credentialResponse) {
    setLoading(true)
    try {
      const res = await merchantLoginGoogle({ credential: credentialResponse.credential })
      const { token, user, role, refreshToken } = res.data.data
      login(token, { ...user, role }, refreshToken)
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
    <div className="min-h-screen flex bg-bg" dir="rtl">

      {/* ── Brand panel (hidden on mobile) — stays intentionally dark ── */}
      <div
        className="hidden lg:flex flex-col justify-between w-[400px] shrink-0 p-10 relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #0D1117 0%, #18212F 50%, #1A2840 100%)' }}
      >
        <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,63,43,0.15) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: '-40px', left: '-40px', width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(15,118,110,0.12) 0%, transparent 70%)' }} />

        <div className="relative z-10 flex items-center gap-3">
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #C93F2B, #A62F20)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(201,63,43,0.4)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>
          </div>
          <span className="font-cairo font-extrabold text-xl text-white">نوامارت</span>
        </div>

        <div className="relative z-10">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(201,63,43,0.12)', border: '1px solid rgba(201,63,43,0.2)', borderRadius: '999px', padding: '5px 14px', marginBottom: '20px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#C93F2B', display: 'inline-block' }} />
            <span className="font-cairo text-xs font-bold" style={{ color: '#E87961' }}>التسجيل مجاني تماماً</span>
          </div>
          <h2 className="font-cairo font-extrabold text-[32px] text-white leading-tight mb-4">
            ابدأ رحلتك التجارية
            <br />
            <span style={{ color: 'rgba(255,255,255,0.45)' }}>مع نوامارت</span>
          </h2>
          <div className="space-y-3">
            {['متجرك جاهز في أقل من دقيقتين', 'استقبل طلباتك وتتبّعها لحظةً بلحظة', 'دفع آمن عبر محافظك الإلكترونية', 'لا عمولات على الخطة المجانية'].map(item => (
              <div key={item} className="flex items-center gap-3">
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(15,118,110,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1.5" stroke="#0F766E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
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
      <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
        <div className="w-full max-w-[420px] py-8">

          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-6 lg:hidden">
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #C93F2B, #A62F20)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>
            </div>
            <span className="font-cairo font-extrabold text-xl text-text">نوامارت</span>
          </div>

          {/* Card */}
          <div className="bg-surface border border-border"
            style={{ borderRadius: '20px', padding: '32px', boxShadow: '0 4px 6px rgba(0,0,0,0.04), 0 20px 40px rgba(0,0,0,0.08)' }}
          >
            <div className="mb-6">
              <h1 className="font-cairo font-extrabold text-2xl mb-1.5 text-text">إنشاء حساب تاجر</h1>
              <p className="font-cairo text-sm text-text-muted">أنشئ حسابك وابدأ البيع اليوم — مجاناً</p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
              <FieldInput
                label="الاسم الكامل" placeholder="محمد أحمد" autoComplete="name"
                value={fields.name} onChange={e => set('name', e.target.value)}
                error={errors.name} disabled={loading}
              />
              <FieldInput
                label="البريد الإلكتروني" type="email" placeholder="you@example.com" autoComplete="email"
                value={fields.email} onChange={e => set('email', e.target.value)}
                error={errors.email} disabled={loading}
              />
              <FieldInput
                label="رقم الهاتف" type="tel" placeholder="7xxxxxxxx" autoComplete="tel" dir="ltr"
                value={fields.phone} onChange={e => set('phone', e.target.value)}
                error={errors.phone} disabled={loading}
              />
              <div>
                <FieldInput
                  label="كلمة المرور" type="password" placeholder="٨ أحرف على الأقل" autoComplete="new-password"
                  value={fields.password} onChange={e => set('password', e.target.value)}
                  error={errors.password} disabled={loading}
                />
                <PasswordStrengthBar password={fields.password} />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="font-cairo font-bold w-full flex items-center justify-center gap-2 mt-2"
                style={{
                  height: '48px', borderRadius: '12px', fontSize: '15px', border: 'none',
                  background: loading ? 'var(--color-text-subtle)' : 'linear-gradient(135deg, #C93F2B 0%, #A62F20 100%)',
                  color: '#FFFFFF', cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: loading ? 'none' : '0 4px 16px rgba(201,63,43,0.35)',
                  transition: 'all 180ms ease',
                }}
                onMouseEnter={e => { if (!loading) e.currentTarget.style.transform = 'translateY(-1px)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none' }}
              >
                {loading ? (
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="3" />
                    <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                ) : 'ابدأ مجاناً'}
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
              onError={() => toast.error('فشل التسجيل بحساب Google')}
              text="signup_with"
              loading={loading}
            />

            <p className="font-cairo text-sm text-center mt-6 text-text-muted">
              لديك حساب؟{' '}
              <Link to="/merchant/login" className="font-semibold text-accent hover:underline">
                سجّل دخولك
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
