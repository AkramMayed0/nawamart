import clsx from 'clsx'
import { Inbox, Search, X } from 'lucide-react'

export function formatNumber(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '—'
  return Number(value).toLocaleString('en-US')
}

export function formatCurrency(value) {
  return `${formatNumber(value ?? 0)} ر.ي`
}

export function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('ar-YE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function PageHeader({ title, subtitle, children }) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div className="min-w-0">
        <h1 className="font-cairo text-2xl font-extrabold leading-tight text-text">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 max-w-2xl font-cairo text-sm text-text-muted">
            {subtitle}
          </p>
        )}
      </div>
      {children && <div className="flex shrink-0 flex-wrap items-center gap-2">{children}</div>}
    </div>
  )
}

export function AdminCard({ children, className = '', padding = 'md' }) {
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-5',
    lg: 'p-6',
  }

  return (
    <div className={clsx('rounded-lg border border-border bg-white shadow-sm', paddings[padding], className)}>
      {children}
    </div>
  )
}

export function StatCard({ icon: Icon, label, value, sub, tone = 'primary', loading = false }) {
  const tones = {
    primary: 'bg-primary-50 text-primary border-primary-100',
    accent: 'bg-accent-50 text-accent-700 border-accent-100',
    success: 'bg-success-100 text-success-dark border-success-100',
    warning: 'bg-warning-100 text-warning border-warning-100',
    danger: 'bg-danger-100 text-danger border-danger-100',
    info: 'bg-info-100 text-info border-info-100',
    neutral: 'bg-bg-soft text-text-muted border-border',
  }

  if (loading) {
    return (
      <AdminCard className="min-h-[136px] animate-pulse">
        <div className="h-10 w-10 rounded-lg bg-bg-soft" />
        <div className="mt-5 h-7 w-20 rounded bg-bg-soft" />
        <div className="mt-3 h-3 w-28 rounded bg-bg-soft" />
      </AdminCard>
    )
  }

  return (
    <AdminCard className="min-h-[136px]">
      <div className={clsx('flex h-10 w-10 items-center justify-center rounded-lg border', tones[tone])}>
        <Icon size={19} />
      </div>
      <p className="mt-5 font-inter text-2xl font-extrabold leading-none text-text dk-num">
        {value ?? '—'}
      </p>
      <p className="mt-2 font-cairo text-sm font-semibold text-text">{label}</p>
      {sub && <p className="mt-0.5 font-cairo text-xs text-text-muted">{sub}</p>}
    </AdminCard>
  )
}

export function Toolbar({ children }) {
  return (
    <AdminCard padding="sm" className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      {children}
    </AdminCard>
  )
}

export function FilterPills({ options, value, onChange, label = 'التصفية' }) {
  return (
    <div className="flex flex-wrap items-center gap-1 rounded-lg border border-border bg-bg p-1" aria-label={label}>
      {options.map((option) => {
        const active = value === option.id

        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={clsx(
              'inline-flex min-h-8 items-center justify-center rounded px-3 text-xs font-bold transition-colors',
              active
                ? 'bg-primary text-white shadow-sm'
                : 'text-text-muted hover:bg-white hover:text-text',
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

export function SearchInput({ value, onChange, placeholder = 'بحث...', className = '' }) {
  return (
    <div className={clsx('relative w-full md:w-72', className)}>
      <Search size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-subtle" />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-lg border border-border bg-white pr-9 pl-9 font-cairo text-sm text-text outline-none transition-colors placeholder:text-text-subtle focus:border-primary"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute left-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded text-text-subtle hover:bg-bg-soft hover:text-text"
          aria-label="مسح البحث"
        >
          <X size={14} />
        </button>
      )}
    </div>
  )
}

export function StatusBadge({ label, tone = 'neutral' }) {
  const tones = {
    neutral: 'bg-bg-soft text-text-muted',
    primary: 'bg-primary-50 text-primary',
    accent: 'bg-accent-50 text-accent-700',
    success: 'bg-success-100 text-success-dark',
    warning: 'bg-warning-100 text-warning',
    danger: 'bg-danger-100 text-danger',
    info: 'bg-info-100 text-info',
  }

  return (
    <span className={clsx('inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 font-cairo text-xs font-bold', tones[tone])}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </span>
  )
}

export function ActiveBadge({ isActive }) {
  return (
    <StatusBadge
      label={isActive ? 'نشط' : 'موقوف'}
      tone={isActive ? 'success' : 'danger'}
    />
  )
}

export function DataTable({
  columns,
  headers,
  isLoading,
  isEmpty,
  emptyTitle = 'لا توجد بيانات',
  emptyMessage,
  minWidth = '760px',
  children,
}) {
  return (
    <AdminCard padding="none" className="overflow-hidden">
      <div className="overflow-x-auto">
        <div style={{ minWidth }}>
          <div
            className="grid gap-4 border-b border-border bg-bg px-5 py-3 font-cairo text-xs font-bold text-text-muted"
            style={{ gridTemplateColumns: columns }}
          >
            {headers.map((header) => (
              <span key={header}>{header}</span>
            ))}
          </div>

          {isLoading ? (
            <div className="divide-y divide-border">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="grid animate-pulse gap-4 px-5 py-4"
                  style={{ gridTemplateColumns: columns }}
                >
                  {headers.map((header) => (
                    <div key={header} className="h-4 rounded bg-bg-soft" />
                  ))}
                </div>
              ))}
            </div>
          ) : isEmpty ? (
            <EmptyState title={emptyTitle} message={emptyMessage} />
          ) : (
            <div className="divide-y divide-border">{children}</div>
          )}
        </div>
      </div>
    </AdminCard>
  )
}

export function TableRow({ columns, children, className = '' }) {
  return (
    <div
      className={clsx('grid items-center gap-4 px-5 py-4 transition-colors hover:bg-bg', className)}
      style={{ gridTemplateColumns: columns }}
    >
      {children}
    </div>
  )
}

export function EmptyState({ title, message, icon: Icon = Inbox }) {
  return (
    <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg border border-border bg-bg-soft text-text-subtle">
        <Icon size={24} />
      </div>
      <p className="font-cairo text-sm font-bold text-text">{title}</p>
      {message && <p className="mt-1 max-w-sm font-cairo text-xs text-text-muted">{message}</p>}
    </div>
  )
}

export function ActionButton({ tone = 'primary', icon: Icon, onClick, loading, disabled, children }) {
  const tones = {
    primary: 'bg-primary text-white hover:bg-primary-700',
    neutral: 'bg-bg-soft text-text-muted hover:bg-border hover:text-text',
    success: 'bg-success-100 text-success-dark hover:bg-green-200',
    danger: 'bg-danger-100 text-danger hover:bg-red-200',
    info: 'bg-info-100 text-info hover:bg-blue-200',
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className={clsx(
        'inline-flex h-8 items-center justify-center gap-1.5 rounded px-3 font-cairo text-xs font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50',
        tones[tone],
      )}
    >
      {Icon && <Icon size={14} />}
      {loading ? 'جاري...' : children}
    </button>
  )
}

export function Modal({ title, description, onClose, children, footer }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose} dir="rtl">
      <div
        className="w-full max-w-lg rounded-lg border border-border bg-white shadow-lg"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
          <div>
            <h3 className="font-cairo text-base font-extrabold text-text">{title}</h3>
            {description && <p className="mt-1 font-cairo text-sm text-text-muted">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded text-text-subtle transition-colors hover:bg-bg-soft hover:text-text"
            aria-label="إغلاق"
          >
            <X size={18} />
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-border px-5 py-4">{footer}</div>}
      </div>
    </div>
  )
}
