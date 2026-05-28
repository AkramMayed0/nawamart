import { Link } from 'react-router-dom'
import { ArrowRight, Construction } from 'lucide-react'
import usePageTitle from '@/hooks/usePageTitle'

export default function CustomerLogin() {
  usePageTitle('تسجيل دخول العميل')

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-md bg-white border border-border rounded-2xl p-8 text-center shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-accent-50 flex items-center justify-center mx-auto mb-5">
          <Construction size={28} className="text-accent-700" />
        </div>
        <h1 className="font-cairo font-extrabold text-2xl text-text mb-2">تسجيل دخول العميل</h1>
        <p className="font-cairo text-sm text-text-muted mb-6 leading-relaxed">
          هذه الخدمة قيد التطوير حالياً. يمكنك حالياً الطلب من المتاجر مباشرة دون تسجيل دخول.
        </p>
        <Link
          to="/"
          className="inline-flex items-center justify-center gap-2 font-cairo font-bold text-sm px-6 py-2.5 rounded-xl bg-primary text-white hover:bg-primary-700 transition-colors w-full"
        >
          <ArrowRight size={16} />
          العودة للرئيسية
        </Link>
      </div>
    </div>
  )
}
