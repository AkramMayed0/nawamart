import { Link, useNavigate } from 'react-router-dom'

/**
 * Full-page 404 — shown when no route matches.
 * Arabic text, RTL layout, NawaMart brand colors.
 */
export default function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div
      className="min-h-screen bg-bg flex flex-col items-center justify-center px-4 text-center"
      dir="rtl"
    >
      {/* Big 404 number */}
      <div className="relative mb-6 select-none">
        <span
          className="font-inter font-extrabold text-[120px] leading-none text-primary/10"
          aria-hidden="true"
        >
          404
        </span>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-primary"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
              <line x1="11" y1="8" x2="11" y2="14" />
              <line x1="8" y1="11" x2="14" y2="11" />
            </svg>
          </div>
        </div>
      </div>

      {/* Heading */}
      <h1 className="font-cairo font-extrabold text-2xl text-text mb-2">
        الصفحة غير موجودة
      </h1>

      {/* Sub text */}
      <p className="font-cairo text-sm text-text-muted mb-8 max-w-sm leading-relaxed">
        يبدو أن الرابط الذي أدخلته غير صحيح أو تمت إزالة هذه الصفحة.
      </p>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-2 font-cairo font-bold text-sm px-6 py-2.5 rounded-xl bg-primary text-white hover:bg-primary-700 transition-colors w-full sm:w-auto justify-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          العودة للرئيسية
        </Link>

        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 font-cairo font-semibold text-sm px-6 py-2.5 rounded-xl border border-border text-text-muted hover:bg-bg-soft transition-colors w-full sm:w-auto justify-center"
        >
          الرجوع للخلف
        </button>
      </div>
    </div>
  )
}
