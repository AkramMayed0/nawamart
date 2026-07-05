import { useState } from 'react'
import clsx from 'clsx'

export default function Input({
  label,
  hint,
  error,
  prefix,
  suffix,
  className = '',
  inputClassName = '',
  id,
  type = 'text',
  ...props
}) {
  const inputId = id || label
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'
  const resolvedType = isPassword ? (showPassword ? 'text' : 'password') : type

  return (
    <div className={clsx('flex flex-col gap-1.5', className)}>
      {label && (
        <label htmlFor={inputId} className="text-sm font-bold text-text font-cairo">
          {label}
        </label>
      )}

      <div className="relative flex items-center">
        {prefix && (
          <span className="absolute end-3 text-text-subtle pointer-events-none z-10">
            {prefix}
          </span>
        )}

        <input
          id={inputId}
          type={resolvedType}
          className={clsx(
            'w-full font-cairo text-[15px] h-12 px-4 rounded-xl border bg-surface text-text',
            'placeholder:text-text-subtle outline-none',
            'transition-all duration-default dark:bg-bg-soft',
            'focus:border-primary focus:shadow-[0_0_0_3px_rgba(24,33,47,0.08)]',
            'dark:focus:shadow-[0_0_0_3px_rgba(100,130,180,0.15)]',
            error
              ? 'border-danger focus:border-danger focus:shadow-[0_0_0_3px_rgba(231,76,60,0.12)]'
              : 'border-border hover:border-border-strong',
            prefix && 'pe-10',
            (suffix || isPassword) && 'ps-10',
            inputClassName,
          )}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword((v) => !v)}
            className="absolute start-3 flex items-center justify-center w-7 h-7 text-text-subtle hover:text-text transition-colors rounded-lg hover:bg-bg-soft"
            aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
          >
            {showPassword ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        )}

        {suffix && !isPassword && (
          <span className="absolute start-3 text-text-subtle pointer-events-none">
            {suffix}
          </span>
        )}
      </div>

      {error && (
        <p className="text-xs text-danger font-cairo font-semibold">{error}</p>
      )}
      {hint && !error && (
        <p className="text-xs text-text-subtle font-cairo">{hint}</p>
      )}
    </div>
  )
}

export function Textarea({ label, hint, error, className = '', ...props }) {
  return (
    <div className={clsx('flex flex-col gap-1.5', className)}>
      {label && (
        <label className="text-sm font-bold text-text font-cairo">{label}</label>
      )}
      <textarea
        className={clsx(
          'w-full font-cairo text-[15px] px-4 py-3 rounded-xl border bg-surface text-text',
          'placeholder:text-text-subtle outline-none resize-none',
          'transition-all duration-default dark:bg-bg-soft',
          'focus:border-primary focus:shadow-[0_0_0_3px_rgba(24,33,47,0.08)]',
          'dark:focus:shadow-[0_0_0_3px_rgba(100,130,180,0.15)]',
          error ? 'border-danger' : 'border-border hover:border-border-strong',
        )}
        rows={4}
        {...props}
      />
      {error && <p className="text-xs text-danger font-cairo font-semibold">{error}</p>}
      {hint && !error && <p className="text-xs text-text-subtle font-cairo">{hint}</p>}
    </div>
  )
}
