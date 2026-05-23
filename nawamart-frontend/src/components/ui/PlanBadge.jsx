/**
 * PlanBadge — reusable chip showing plan name + optional status dot.
 *
 * Props:
 *   plan      'free' | 'pro' | 'business'
 *   status    'active' | 'pending' | 'expired' | undefined
 *   size      'sm' | 'md' (default 'md')
 */
import clsx from 'clsx'

const PLAN_STYLES = {
  free:     { label: 'Free',     bg: 'bg-bg-soft',    text: 'text-text-muted',  border: 'border-border' },
  pro:      { label: 'Pro',      bg: 'bg-primary-50', text: 'text-primary',     border: 'border-primary-100' },
  business: { label: 'Business', bg: 'bg-accent-50',  text: 'text-accent-700',  border: 'border-accent-100' },
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

export default function PlanBadge({ plan = 'free', status, size = 'md' }) {
  const style = PLAN_STYLES[plan] ?? PLAN_STYLES.free

  return (
    <span className={clsx(
      'inline-flex items-center gap-1.5 font-cairo font-semibold rounded-full border',
      style.bg, style.text, style.border,
      size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1',
    )}>
      {/* Status dot */}
      {status && (
        <span className={clsx(
          'rounded-full shrink-0',
          size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2',
          STATUS_DOT[status] ?? 'bg-border-strong'
        )} />
      )}

      {style.label}

      {/* Status label */}
      {status && (
        <span className="opacity-70">· {STATUS_LABEL[status] ?? status}</span>
      )}
    </span>
  )
}
