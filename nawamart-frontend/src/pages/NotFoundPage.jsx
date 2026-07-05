import { Link, useNavigate } from 'react-router-dom'
import usePageTitle from '@/hooks/usePageTitle'
import { ArrowLeft, Home } from 'lucide-react'

export default function NotFoundPage() {
  usePageTitle('الصفحة غير موجودة')
  const navigate = useNavigate()

  return (
    <div
      className="min-h-screen bg-bg flex flex-col items-center justify-center px-4 text-center"
      dir="rtl"
    >
      <div className="relative mb-8 select-none">
        <span
          className="font-inter font-extrabold text-[150px] md:text-[200px] leading-none text-primary/[0.07]"
          aria-hidden="true"
        >
          404
        </span>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary-50 to-accent-50 flex items-center justify-center shadow-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-accent"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
              <line x1="11" y1="8" x2="11" y2="14" />
              <line x1="8" y1="11" x2="14" y2="11" />
            </svg>
          </div>
        </div>
      </div>

      <h1 className="font-cairo font-extrabold text-3xl text-text mb-3">
        الصفحة غير موجودة
      </h1>

      <p className="font-cairo text-sm text-text-muted mb-10 max-w-sm leading-relaxed">
        يبدو أن الرابط الذي أدخلته غير صحيح أو تمت إزالة هذه الصفحة.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-2.5 font-cairo font-bold text-sm px-6 py-3 rounded-xl bg-primary text-white hover:bg-primary-700 hover:-translate-y-0.5 transition-all shadow-md shadow-primary/15 w-full sm:w-auto justify-center"
        >
          <Home size={16} />
          العودة للرئيسية
        </Link>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2.5 font-cairo font-semibold text-sm px-6 py-3 rounded-xl border border-border text-text-muted hover:bg-surface hover:text-text hover:shadow-sm transition-all w-full sm:w-auto justify-center"
        >
          <ArrowLeft size={16} />
          الرجوع للخلف
        </button>
      </div>
    </div>
  )
}
