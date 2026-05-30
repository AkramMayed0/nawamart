import clsx from 'clsx'

const PLAN_STYLES = {
  starter:  { label: 'Starter',  bg: 'bg-bg-soft',    text: 'text-text-muted',  border: 'border-border' },
  pro:      { label: 'Pro',      bg: 'bg-primary-50', text: 'text-primary',     border: 'border-primary-100' },
  business: { label: 'Business', bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-200' },
}

const STATUS_DOT = {
  active:  'bg-success',
  pending: 'bg-warning',
  expired: 'bg-danger',
}

const STATUS_LABEL = {
  active:  'نشط',
  pending: 'قيد المراجعة',
  expired: 'منتهي',
}

/**
 * PlanBadge — reusable chip showing plan name + optional status dot.
 *
 * Props:
 *   plan      'starter' | 'pro' | 'business'
 *   status    'active' | 'pending' | 'expired' | undefined
 *   trial     boolean — when true, shows "تجربة مجانية" badge
 *   size      'sm' | 'md' (default 'md')
 */
export default function PlanBadge({ plan = 'starter', status, trial, size = 'md' }) {
  if (trial) {
    return (
      <span className={clsx(
        'inline-flex items-center gap-1.5 font-cairo font-semibold rounded-full border',
        'bg-success-50 text-success-dark border-success-200',
        size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1',
      )}>
        <span className="rounded-full w-2 h-2 bg-success shrink-0" />
        تجربة مجانية
      </span>
    )
  }

  const style = PLAN_STYLES[plan] ?? PLAN_STYLES.starter

  return (
    <span className={clsx(
      'inline-flex items-center gap-1.5 font-cairo font-semibold rounded-full border',
      style.bg, style.text, style.border,
      size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1',
    )}>
      {status && (
        <span className={clsx(
          'rounded-full shrink-0',
          size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2',
          STATUS_DOT[status] ?? 'bg-border-strong'
        )} />
      )}

      {style.label}

      {status && (
        <span className="opacity-70">· {STATUS_LABEL[status] ?? status}</span>
      )}
    </span>
  )
}
