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
    year: 'numeric', month: 'short', day: 'numeric',
  })
}

const D = { card: '#161b22', cardBorder: 'rgba(255,255,255,0.07)', cardHover: 'rgba(255,255,255,0.03)', rowBorder: 'rgba(255,255,255,0.04)', muted: 'rgba(255,255,255,0.45)', subtle: 'rgba(255,255,255,0.3)', faint: 'rgba(255,255,255,0.08)', modal: '#1c2333' }

/* ─── Dark card wrapper ─── */
export function AdminCard({ children, className = '', padding = 'md' }) {
  const paddings = { none: '', sm: 'p-4', md: 'p-5', lg: 'p-6' }
  return (
    <div className={clsx('rounded-2xl', paddings[padding], className)} style={{ background: D.card, border: `1px solid ${D.cardBorder}` }}>
      {children}
    </div>
  )
}

/* ─── Page header ─── */
export function PageHeader({ title, subtitle, children }) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div className="min-w-0">
        <h1 className="font-cairo text-2xl font-extrabold leading-tight text-white">{title}</h1>
        {subtitle && <p className="mt-1 max-w-2xl font-cairo text-sm" style={{ color: D.muted }}>{subtitle}</p>}
      </div>
      {children && <div className="flex shrink-0 flex-wrap items-center gap-2">{children}</div>}
    </div>
  )
}

/* ─── Stat card ─── */
export function StatCard({ icon: Icon, label, value, sub, tone = 'primary', loading = false }) {
  const tones = {
    primary: { iconBg: 'rgba(100,130,180,0.15)', iconColor: '#7aa2d4' },
    accent:  { iconBg: 'rgba(201,63,43,0.18)',   iconColor: '#e87961' },
    success: { iconBg: 'rgba(39,174,96,0.15)',   iconColor: '#4dd68a' },
    warning: { iconBg: 'rgba(243,156,18,0.15)',  iconColor: '#f5b942' },
    danger:  { iconBg: 'rgba(231,76,60,0.15)',   iconColor: '#e87067' },
    info:    { iconBg: 'rgba(45,123,224,0.15)',  iconColor: '#5b9ee8' },
    neutral: { iconBg: 'rgba(255,255,255,0.06)', iconColor: 'rgba(255,255,255,0.4)' },
  }
  const t = tones[tone] || tones.neutral

  if (loading) {
    return (
      <div className="rounded-2xl p-5 animate-pulse" style={{ background: D.card, border: `1px solid ${D.cardBorder}` }}>
        <div className="h-10 w-10 rounded-xl" style={{ background: D.faint }} />
        <div className="mt-4 h-7 w-20 rounded-lg" style={{ background: D.faint }} />
        <div className="mt-2 h-3 w-28 rounded" style={{ background: 'rgba(255,255,255,0.04)' }} />
      </div>
    )
  }

  return (
    <div className="rounded-2xl p-5 transition-transform hover:-translate-y-0.5" style={{ background: D.card, border: `1px solid ${D.cardBorder}` }}>
      <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: t.iconBg }}>
        <Icon size={18} style={{ color: t.iconColor }} />
      </div>
      <p className="mt-4 font-cairo text-[26px] font-extrabold leading-none text-white dk-num">{value ?? '—'}</p>
      <p className="mt-2 font-cairo text-sm font-semibold" style={{ color: D.muted }}>{label}</p>
      {sub && <p className="mt-0.5 font-cairo text-xs" style={{ color: D.subtle }}>{sub}</p>}
    </div>
  )
}

/* ─── Toolbar ─── */
export function Toolbar({ children }) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl p-4 md:flex-row md:items-center md:justify-between" style={{ background: D.card, border: `1px solid ${D.cardBorder}` }}>
      {children}
    </div>
  )
}

/* ─── FilterPills ─── */
export function FilterPills({ options, value, onChange, label = 'التصفية' }) {
  return (
    <div className="flex flex-wrap items-center gap-1 rounded-xl p-1" style={{ background: 'rgba(255,255,255,0.05)' }} aria-label={label}>
      {options.map((option) => {
        const active = value === option.id
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className="inline-flex min-h-8 items-center justify-center rounded-lg px-3.5 font-cairo text-xs font-bold transition-all duration-150"
            style={active ? { background: '#C93F2B', color: '#fff' } : { color: D.muted }}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

/* ─── SearchInput ─── */
export function SearchInput({ value, onChange, placeholder = 'بحث...', className = '' }) {
  return (
    <div className={clsx('relative w-full md:w-72', className)}>
      <Search size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" style={{ color: D.subtle }} />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-xl pr-9 pl-9 font-cairo text-sm outline-none transition-all"
        style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${D.cardBorder}`, color: 'rgba(255,255,255,0.8)' }}
      />
      {value && (
        <button type="button" onClick={() => onChange('')} className="absolute left-2.5 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full" style={{ color: D.subtle }} aria-label="مسح البحث">
          <X size={12} />
        </button>
      )}
    </div>
  )
}

/* ─── StatusBadge ─── */
export function StatusBadge({ label, tone = 'neutral' }) {
  const tones = {
    neutral: { bg: 'rgba(255,255,255,0.07)', color: D.muted },
    primary: { bg: 'rgba(100,130,180,0.15)', color: '#7aa2d4' },
    accent:  { bg: 'rgba(201,63,43,0.18)',   color: '#e87961' },
    success: { bg: 'rgba(39,174,96,0.15)',   color: '#4dd68a' },
    warning: { bg: 'rgba(243,156,18,0.15)',  color: '#f5b942' },
    danger:  { bg: 'rgba(231,76,60,0.15)',   color: '#e87067' },
    info:    { bg: 'rgba(45,123,224,0.15)',  color: '#5b9ee8' },
  }
  const t = tones[tone] || tones.neutral
  return (
    <span className="inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 font-cairo text-xs font-bold" style={{ background: t.bg, color: t.color }}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </span>
  )
}

export function ActiveBadge({ isActive }) {
  return <StatusBadge label={isActive ? 'نشط' : 'موقوف'} tone={isActive ? 'success' : 'danger'} />
}

/* ─── DataTable ─── */
export function DataTable({ columns, headers, isLoading, isEmpty, emptyTitle = 'لا توجد بيانات', emptyMessage, minWidth = '760px', children }) {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: D.card, border: `1px solid ${D.cardBorder}` }}>
      <div className="overflow-x-auto">
        <div style={{ minWidth }}>
          <div className="grid gap-4 px-5 py-3 font-cairo text-xs font-bold" style={{ gridTemplateColumns: columns, borderBottom: `1px solid ${D.rowBorder}`, background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.35)' }}>
            {headers.map((h) => <span key={h}>{h}</span>)}
          </div>
          {isLoading ? (
            <div>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="grid animate-pulse gap-4 px-5 py-4" style={{ gridTemplateColumns: columns, borderBottom: `1px solid ${D.rowBorder}` }}>
                  {headers.map((h) => <div key={h} className="h-4 rounded-lg" style={{ background: D.faint }} />)}
                </div>
              ))}
            </div>
          ) : isEmpty ? (
            <EmptyState title={emptyTitle} message={emptyMessage} />
          ) : (
            <div>{children}</div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ─── TableRow ─── */
export function TableRow({ columns, children, className = '' }) {
  return (
    <div
      className={clsx('grid items-center gap-4 px-5 py-4 transition-colors', className)}
      style={{ gridTemplateColumns: columns, borderBottom: `1px solid ${D.rowBorder}` }}
      onMouseEnter={(e) => e.currentTarget.style.background = D.cardHover}
      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
    >
      {children}
    </div>
  )
}

/* ─── EmptyState ─── */
export function EmptyState({ title, message, icon: Icon = Inbox }) {
  return (
    <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: D.faint, border: `1px solid ${D.cardBorder}` }}>
        <Icon size={26} style={{ color: 'rgba(255,255,255,0.2)' }} />
      </div>
      <p className="font-cairo text-sm font-bold" style={{ color: 'rgba(255,255,255,0.6)' }}>{title}</p>
      {message && <p className="mt-1 max-w-sm font-cairo text-xs leading-relaxed" style={{ color: D.subtle }}>{message}</p>}
    </div>
  )
}

/* ─── ActionButton ─── */
export function ActionButton({ tone = 'primary', icon: Icon, onClick, loading, disabled, children }) {
  const tones = {
    primary: { bg: 'rgba(100,130,180,0.15)', color: '#7aa2d4', hbg: 'rgba(100,130,180,0.28)' },
    neutral: { bg: 'rgba(255,255,255,0.07)', color: D.muted,   hbg: 'rgba(255,255,255,0.12)' },
    success: { bg: 'rgba(39,174,96,0.15)',   color: '#4dd68a', hbg: 'rgba(39,174,96,0.28)' },
    danger:  { bg: 'rgba(231,76,60,0.15)',   color: '#e87067', hbg: 'rgba(231,76,60,0.28)' },
    info:    { bg: 'rgba(45,123,224,0.15)',  color: '#5b9ee8', hbg: 'rgba(45,123,224,0.28)' },
  }
  const t = tones[tone] || tones.neutral
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className="inline-flex h-8 items-center justify-center gap-1.5 rounded-xl px-3.5 font-cairo text-xs font-bold transition-all disabled:cursor-not-allowed disabled:opacity-40"
      style={{ background: t.bg, color: t.color }}
      onMouseEnter={(e) => { if (!disabled && !loading) e.currentTarget.style.background = t.hbg }}
      onMouseLeave={(e) => { e.currentTarget.style.background = t.bg }}
    >
      {Icon && <Icon size={14} />}
      {loading ? 'جاري...' : children}
    </button>
  )
}

/* ─── Modal — dark ─── */
export function Modal({ title, description, onClose, children, footer }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }} onClick={onClose} dir="rtl">
      <div className="w-full max-w-lg rounded-2xl shadow-2xl" style={{ background: D.modal, border: '1px solid rgba(255,255,255,0.1)' }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-4 px-6 py-5" style={{ borderBottom: `1px solid ${D.rowBorder}` }}>
          <div>
            <h3 className="font-cairo text-base font-extrabold text-white">{title}</h3>
            {description && <p className="mt-1 font-cairo text-sm" style={{ color: D.muted }}>{description}</p>}
          </div>
          <button type="button" onClick={onClose} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all" style={{ color: D.subtle }} aria-label="إغلاق"
            onMouseEnter={(e) => { e.currentTarget.style.background = D.faint; e.currentTarget.style.color = 'rgba(255,255,255,0.7)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = D.subtle }}>
            <X size={17} />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
        {footer && <div className="flex justify-end gap-2 px-6 py-4" style={{ borderTop: `1px solid ${D.rowBorder}` }}>{footer}</div>}
      </div>
    </div>
  )
}
