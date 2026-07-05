import { useRef, useState, useCallback } from 'react'
import clsx from 'clsx'

const variants = {
  primary:   'bg-primary text-white hover:bg-primary-700 border-transparent shadow-md shadow-primary/15 hover:shadow-lg hover:shadow-primary/20',
  secondary: 'bg-white dark:bg-surface text-primary border-border hover:border-primary/30 hover:bg-primary-50 shadow-sm dark:hover:bg-primary-900/20',
  accent:    'bg-accent text-white hover:bg-accent-700 border-transparent shadow-md shadow-accent/15 hover:shadow-lg hover:shadow-accent/20',
  ghost:     'bg-transparent text-primary dark:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 border-transparent',
  danger:    'bg-danger text-white hover:opacity-90 border-transparent shadow-md shadow-danger/15 hover:shadow-lg',
  outline:   'bg-transparent text-text border-border hover:bg-white dark:hover:bg-surface border',
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
  ripple = true,
  onClick,
  ...props
}) {
  const btnRef = useRef(null)
  const [ripples, setRipples] = useState([])

  const handleClick = useCallback((e) => {
    if (!ripple || disabled || loading) {
      onClick?.(e)
      return
    }
    const rect = e.currentTarget.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height)
    const x = (e.clientX || e.pageX) - rect.left - size / 2
    const y = (e.clientY || e.pageY) - rect.top - size / 2
    const id = Date.now()
    setRipples((prev) => [...prev, { id, x, y, size }])
    onClick?.(e)
  }, [ripple, disabled, loading, onClick])

  const handleAnimEnd = (id) => {
    setRipples((prev) => prev.filter((r) => r.id !== id))
  }

  return (
    <button
      ref={btnRef}
      type={type}
      onClick={handleClick}
      disabled={disabled || loading}
      className={clsx(
        'inline-flex items-center justify-center font-cairo font-semibold relative overflow-hidden',
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
      <span className={clsx('inline-flex items-center gap-2', loading && 'opacity-70')}>
        {children}
      </span>
      {ripples.map((r) => (
        <span
          key={r.id}
          onAnimationEnd={() => handleAnimEnd(r.id)}
          className="absolute rounded-full bg-white/30 pointer-events-none animate-ripple"
          style={{
            width: r.size,
            height: r.size,
            left: r.x,
            top: r.y,
          }}
        />
      ))}
    </button>
  )
}
