import clsx from 'clsx'

const variants = {
  primary:   'bg-primary text-white hover:bg-primary-700 border-transparent',
  secondary: 'bg-white text-primary border-primary hover:bg-primary-50',
  accent:    'bg-accent text-white hover:bg-accent-700 border-transparent',
  ghost:     'bg-transparent text-primary hover:bg-primary-50 border-transparent',
  danger:    'bg-danger text-white hover:opacity-90 border-transparent',
  outline:   'bg-transparent text-text border-border hover:bg-bg border',
}

const sizes = {
  sm: 'px-3.5 py-1.5 text-sm gap-1.5',
  md: 'px-5 py-2.5 text-[15px] gap-2',
  lg: 'px-7 py-3.5 text-base gap-2',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  type = 'button',
  onClick,
  ...props
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={clsx(
        'inline-flex items-center justify-center font-cairo font-semibold',
        'rounded border transition-colors duration-default',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {loading && (
        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      )}
      {children}
    </button>
  )
}
