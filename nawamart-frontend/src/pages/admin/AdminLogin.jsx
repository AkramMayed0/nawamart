import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { adminLogin } from '@/api/auth'
import { useAdminStore } from '@/store/adminStore'

export default function AdminLogin() {
  const navigate = useNavigate()
  const login    = useAdminStore(s => s.login)

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email.trim() || !password) {
      toast.error('يرجى إدخال البريد الإلكتروني وكلمة المرور')
      return
    }

    setLoading(true)
    try {
      const res = await adminLogin({ email: email.trim().toLowerCase(), password })
      const { token, admin } = res.data.data
      login(token, admin)
      toast.success('أهلاً بك في لوحة الإدارة 🛡️')
      navigate('/admin/dashboard', { replace: true })
    } catch (err) {
      // axios interceptor normalizes errors to { status, message, ... }
      const msg = err?.message || err?.data?.message || 'بيانات الدخول غير صحيحة'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4" dir="rtl">

      {/* Glow effect */}
      <div className="absolute w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none -top-10 -right-10" />

      <div className="relative w-full max-w-md">

        {/* Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">

          {/* Icon + Title */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center mb-4 shadow-lg shadow-primary/20">
              <span className="text-3xl">🛡️</span>
            </div>
            <h1 className="font-cairo font-extrabold text-2xl text-white">لوحة الإدارة</h1>
            <p className="font-cairo text-sm text-white/50 mt-1">دخول مخصص للمشرفين فقط</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-cairo text-sm font-semibold text-white/70">البريد الإلكتروني</label>
              <input
                id="admin-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@nawamart.com"
                autoComplete="email"
                disabled={loading}
                className="w-full font-en px-4 py-3 rounded-xl bg-white/10 border border-white/15 text-white placeholder:text-white/30 outline-none focus:border-primary/60 focus:bg-white/15 transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-cairo text-sm font-semibold text-white/70">كلمة المرور</label>
              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                disabled={loading}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/15 text-white placeholder:text-white/30 outline-none focus:border-primary/60 focus:bg-white/15 transition-all"
              />
            </div>

            <button
              id="admin-login-btn"
              type="submit"
              disabled={loading}
              className="mt-2 w-full py-3.5 rounded-xl bg-primary font-cairo font-bold text-white text-base hover:opacity-90 active:scale-[.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/30"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  جاري الدخول…
                </span>
              ) : 'دخول'}
            </button>
          </form>

          <p className="font-cairo text-xs text-white/25 text-center mt-6">
            © {new Date().getFullYear()} نوامارت — مخصص للمشرفين
          </p>
        </div>
      </div>
    </div>
  )
}
