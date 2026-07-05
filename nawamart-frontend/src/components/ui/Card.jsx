import clsx from 'clsx'

const variantStyles = {
  default: 'bg-white border-border shadow-sm',
  glass: 'nm-card',
  ghost: 'bg-transparent border-transparent',
  outline: 'bg-white border-2 border-border-strong',
  gradient: 'gradient-border bg-white border-0',
}

const paddings = { sm: 'p-4', md: 'p-5', lg: 'p-8', none: '' }

export default function Card({
  children,
  className = '',
  padding = 'md',
  variant = 'default',
  hover = false,
  ...props
}) {
  return (
    <div
      className={clsx(
        'rounded-lg border transition-all duration-default dark:border-border',
        variantStyles[variant],
        paddings[padding],
        hover && 'hover:-translate-y-0.5 hover:shadow-md cursor-pointer',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ title, subtitle, action, className = '' }) {
  return (
    <div className={clsx('flex items-center justify-between mb-4', className)}>
      <div>
        <h3 className="text-base font-bold text-text font-cairo">{title}</h3>
        {subtitle && <p className="text-sm text-text-muted font-cairo mt-0.5">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}
