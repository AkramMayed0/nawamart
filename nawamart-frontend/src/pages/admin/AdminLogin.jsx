import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Lock, Mail, ShieldCheck } from 'lucide-react'
import { adminLogin } from '@/api/auth'
import { useAdminStore } from '@/store/adminStore'
import usePageTitle from '@/hooks/usePageTitle'

export default function AdminLogin() {
  const navigate = useNavigate()
  const login = useAdminStore((state) => state.login)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()

    if (!email.trim() || !password) {
      toast.error('يرجى إدخال البريد الإلكتروني وكلمة المرور')
      return
    }

    setLoading(true)

    try {
      const response = await adminLogin({
        email: email.trim().toLowerCase(),
        password,
      })
      const { token, admin } = response.data.data

      login(token, admin)
      toast.success('تم تسجيل الدخول بنجاح')
      navigate('/admin/dashboard', { replace: true })
    } catch (error) {
      toast.error(error?.message || 'بيانات الدخول غير صحيحة')
    } finally {
      setLoading(false)
    }
  }

  usePageTitle('دخول المشرف')

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4 py-10" dir="rtl">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-lg border border-border bg-white shadow-card md:grid-cols-[1fr_420px]">
        <section className="hidden bg-primary p-10 text-white md:flex md:flex-col md:justify-between">
          <div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/10">
              <ShieldCheck size={24} />
            </div>
            <h1 className="mt-8 font-cairo text-3xl font-extrabold leading-tight">
              مركز إدارة نوا مارت
            </h1>
            <p className="mt-3 max-w-md font-cairo text-sm leading-7 text-white/75">
              مساحة مخصصة لمراجعة الاشتراكات، متابعة المتاجر، وحماية تجربة التجار والعملاء.
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
            <h1 className="font-cairo text-2xl font-extrabold text-text">إدارة نوا مارت</h1>
            <p className="mt-1 font-cairo text-sm text-text-muted">دخول مخصص للمشرفين فقط</p>
          </div>

          <div className="hidden md:block">
            <h2 className="font-cairo text-2xl font-extrabold text-text">تسجيل دخول المشرف</h2>
            <p className="mt-1 font-cairo text-sm text-text-muted">استخدم حساب الإدارة للوصول إلى لوحة التحكم.</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
            <label className="block">
              <span className="mb-1.5 block font-cairo text-sm font-bold text-text">البريد الإلكتروني</span>
              <span className="relative block">
                <Mail size={17} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-subtle" />
                <input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="admin@nawamart.com"
                  autoComplete="email"
                  disabled={loading}
                  className="h-11 w-full rounded-lg border border-border bg-white pr-10 pl-3 font-inter text-sm text-text outline-none transition-colors placeholder:text-text-subtle focus:border-primary disabled:bg-bg-soft"
                />
              </span>
            </label>

            <label className="block">
              <span className="mb-1.5 block font-cairo text-sm font-bold text-text">كلمة المرور</span>
              <span className="relative block">
                <Lock size={17} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-subtle" />
                <input
                  id="admin-password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  disabled={loading}
                  className="h-11 w-full rounded-lg border border-border bg-white pr-10 pl-3 font-cairo text-sm text-text outline-none transition-colors placeholder:text-text-subtle focus:border-primary disabled:bg-bg-soft"
                />
              </span>
            </label>

            <button
              id="admin-login-btn"
              type="submit"
              disabled={loading}
              className="mt-2 inline-flex h-11 items-center justify-center rounded-lg bg-primary px-5 font-cairo text-sm font-extrabold text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'جاري الدخول...' : 'دخول لوحة الإدارة'}
            </button>
          </form>
        </section>
      </div>
    </div>
  )
}
