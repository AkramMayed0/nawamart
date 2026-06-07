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
  ...props
}) {
  const inputId = id || label

  return (
    <div className={clsx('flex flex-col gap-1.5', className)}>
      {label && (
        <label htmlFor={inputId} className="text-sm font-bold text-text font-cairo">
          {label}
        </label>
      )}

      <div className="relative flex items-center">
        {prefix && (
          <span className="absolute end-3 text-text-subtle pointer-events-none">
            {prefix}
          </span>
        )}

        <input
          id={inputId}
          className={clsx(
            'w-full font-cairo text-[15px] h-12 px-4 rounded-xl border bg-white text-text',
            'placeholder:text-text-subtle outline-none',
            'transition-all duration-default',
            'focus:border-primary focus:shadow-[0_0_0_3px_rgba(24,33,47,0.08)]',
            error
              ? 'border-danger focus:border-danger focus:shadow-[0_0_0_3px_rgba(231,76,60,0.12)]'
              : 'border-border hover:border-border-strong',
            prefix && 'pe-10',
            suffix && 'ps-10',
            inputClassName,
          )}
          {...props}
        />

        {suffix && (
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
          'w-full font-cairo text-[15px] px-4 py-3 rounded-xl border bg-white text-text',
          'placeholder:text-text-subtle outline-none resize-none',
          'transition-all duration-default',
          'focus:border-primary focus:shadow-[0_0_0_3px_rgba(24,33,47,0.08)]',
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
