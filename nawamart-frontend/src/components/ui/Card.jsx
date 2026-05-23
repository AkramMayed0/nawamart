import clsx from 'clsx'

export default function Card({ children, className = '', padding = 'md', ...props }) {
  const paddings = { sm: 'p-4', md: 'p-5', lg: 'p-8', none: '' }
  return (
    <div
      className={clsx(
        'bg-white border border-border rounded-lg',
        paddings[padding],
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
