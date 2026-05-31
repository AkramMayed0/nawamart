import clsx from 'clsx'

const variants = {
  warning:   'bg-warning-100 text-yellow-700',
  success:   'bg-success-100 text-success',
  danger:    'bg-danger-100 text-danger',
  info:      'bg-info-100 text-info',
  delivered: 'bg-green-100 text-success-dark',
  neutral:   'bg-bg-soft text-text-muted',
  primary:   'bg-primary-50 text-primary',
  accent:    'bg-accent-50 text-accent-700',
}

const STATUS_CONFIG = {
  pending:             { label: 'بانتظار الوصل',  variant: 'warning'   },
  confirmed:           { label: 'مؤكد',            variant: 'success'   },
  shipped:             { label: 'تم الشحن',        variant: 'info'      },
  delivered:           { label: 'تم التسليم',      variant: 'delivered' },
  rejected:            { label: 'مرفوض',            variant: 'danger'    },
  'chat-open':         { label: 'محادثة مفتوحة',   variant: 'info'      },
  'digital-delivered': { label: 'تم التسليم',      variant: 'delivered' },
}

export default function Badge({ children, variant = 'neutral', dot = false, className = '' }) {
  return (
    <span className={clsx(
      'inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-pill font-cairo',
      variants[variant],
      className,
    )}>
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current flex-none" />}
      {children}
    </span>
  )
}

export function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending
  return (
    <Badge variant={cfg.variant} dot>
      {cfg.label}
    </Badge>
  )
}
