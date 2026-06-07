import clsx from 'clsx'

const variants = {
  primary:   'bg-primary text-white hover:bg-primary-700 border-transparent shadow-md shadow-primary/15 hover:shadow-lg hover:shadow-primary/20',
  secondary: 'bg-white text-primary border-border hover:border-primary/30 hover:bg-primary-50 shadow-sm',
  accent:    'bg-accent text-white hover:bg-accent-700 border-transparent shadow-md shadow-accent/15 hover:shadow-lg hover:shadow-accent/20',
  ghost:     'bg-transparent text-primary hover:bg-primary-50 border-transparent',
  danger:    'bg-danger text-white hover:opacity-90 border-transparent shadow-md shadow-danger/15 hover:shadow-lg',
  outline:   'bg-transparent text-text border-border hover:bg-white border',
}

const sizes = {
  sm: 'h-9 px-3.5 text-sm gap-1.5',
  md: 'h-11 px-5 text-[15px] gap-2',
  lg: 'h-[52px] px-8 text-base gap-2',
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
        'rounded-2xl border transition-all duration-default',
        'hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none',
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
