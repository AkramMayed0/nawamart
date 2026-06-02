import { useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Lock, ShieldCheck, ArrowRight } from 'lucide-react'
import { adminResetPassword } from '@/api/auth'
import usePageTitle from '@/hooks/usePageTitle'

export default function AdminResetPassword() {
  const navigate = useNavigate()
  const { token } = useParams()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  usePageTitle('إعادة تعيين كلمة المرور — المشرف')

  async function handleSubmit(event) {
    event.preventDefault()

    if (!password) {
      toast.error('كلمة المرور الجديدة مطلوبة')
      return
    }
    if (password.length < 8) {
      toast.error('كلمة المرور يجب أن تكون 8 أحرف على الأقل')
      return
    }
    if (password !== confirmPassword) {
      toast.error('كلمة المرور غير متطابقة')
      return
    }

    setLoading(true)
    try {
      await adminResetPassword(token, password)
      setDone(true)
      toast.success('تم إعادة تعيين كلمة المرور بنجاح')
    } catch (err) {
      toast.error(err?.message || 'فشل إعادة تعيين كلمة المرور')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4 py-10" dir="rtl">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-lg border border-border bg-white shadow-card md:grid-cols-[1fr_420px]">
        <section className="hidden bg-primary p-10 text-white md:flex md:flex-col md:justify-between">
          <div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/10">
              <ShieldCheck size={24} />
            </div>
            <h1 className="mt-8 font-cairo text-3xl font-extrabold leading-tight">
              إعادة تعيين
              <br />
              كلمة المرور
            </h1>
            <p className="mt-3 max-w-md font-cairo text-sm leading-7 text-white/75">
              أدخل كلمة المرور الجديدة لحساب المشرف.
            </p>
          </div>
          <p className="font-cairo text-xs text-white/55">
            صلاحيات المشرفين فقط
          </p>
        </section>

        <section className="p-6 sm:p-8">
          <div className="mb-8 md:hidden">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-primary-50 text-primary">
              <ShieldCheck size={22} />
            </div>
            <h1 className="font-cairo text-2xl font-extrabold text-text">إعادة تعيين كلمة المرور</h1>
          </div>

          {done ? (
            <>
              <div className="hidden md:block">
                <h2 className="font-cairo text-2xl font-extrabold text-text">تم بنجاح!</h2>
                <p className="mt-1 font-cairo text-sm text-text-muted">
                  تم إعادة تعيين كلمة المرور الخاصة بحساب المشرف.
                </p>
              </div>
              <p className="mt-6 font-cairo text-sm text-text-muted md:hidden">
                تم إعادة تعيين كلمة المرور بنجاح.
              </p>
              <button
                type="button"
                onClick={() => navigate('/admin/login')}
                className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 font-cairo text-sm font-extrabold text-white transition-colors hover:bg-primary-700"
              >
                <ArrowRight size={18} />
                تسجيل الدخول الآن
              </button>
            </>
          ) : (
            <>
              <div className="hidden md:block">
                <h2 className="font-cairo text-2xl font-extrabold text-text">إعادة تعيين كلمة المرور</h2>
                <p className="mt-1 font-cairo text-sm text-text-muted">
                  أدخل كلمة المرور الجديدة لحسابك.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
                <label className="block">
                  <span className="mb-1.5 block font-cairo text-sm font-bold text-text">كلمة المرور الجديدة</span>
                  <span className="relative block">
                    <Lock size={17} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-subtle" />
                    <input
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      disabled={loading}
                      className="h-11 w-full rounded-lg border border-border bg-white pr-10 pl-3 font-cairo text-sm text-text outline-none transition-colors placeholder:text-text-subtle focus:border-primary disabled:bg-bg-soft"
                    />
                  </span>
                </label>

                <label className="block">
                  <span className="mb-1.5 block font-cairo text-sm font-bold text-text">تأكيد كلمة المرور</span>
                  <span className="relative block">
                    <Lock size={17} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-subtle" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      disabled={loading}
                      className="h-11 w-full rounded-lg border border-border bg-white pr-10 pl-3 font-cairo text-sm text-text outline-none transition-colors placeholder:text-text-subtle focus:border-primary disabled:bg-bg-soft"
                    />
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 inline-flex h-11 items-center justify-center rounded-lg bg-primary px-5 font-cairo text-sm font-extrabold text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? 'جاري الحفظ...' : 'إعادة تعيين كلمة المرور'}
                </button>
              </form>

              <p className="mt-6 text-center">
                <Link to="/admin/login" className="font-cairo text-sm text-primary font-semibold hover:underline">
                  العودة إلى تسجيل الدخول
                </Link>
              </p>
            </>
          )}
        </section>
      </div>
    </div>
  )
}
