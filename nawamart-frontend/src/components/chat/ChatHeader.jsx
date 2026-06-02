import { ArrowRight } from 'lucide-react'
import clsx from 'clsx'

export default function ChatHeader({ chatMeta, connected, onBack, typingName }) {
  const rawOrderId  = chatMeta?.order?._id || chatMeta?.order
  const orderId      = rawOrderId ? String(rawOrderId).slice(-8).toUpperCase() : '—'
  const merchantName = chatMeta?.merchant?.name ?? 'التاجر'
  const customerName = chatMeta?.customer?.name ?? 'العميل'

  return (
    <header className="flex items-center gap-3 bg-white border-b border-border px-4 py-3 shrink-0">
      <button
        onClick={onBack}
        className="p-1.5 rounded-full hover:bg-bg-soft transition-colors text-text-muted"
        aria-label="رجوع"
      >
        <ArrowRight size={20} className="icon-flip" />
      </button>

      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
        <span className="text-sm font-bold text-primary">
          {customerName.charAt(0)}
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-semibold text-sm text-text truncate">{customerName}</span>
          <span className="text-text-subtle text-xs">←</span>
          <span className="text-xs text-text-muted truncate">{merchantName}</span>
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          {typingName ? (
            <span className="text-xs text-primary font-medium animate-pulse">{typingName} يكتب...</span>
          ) : (
            <>
              <span className="text-xs text-text-subtle font-en">#{orderId}</span>
              <span
                className={clsx(
                  'inline-block w-1.5 h-1.5 rounded-full',
                  connected ? 'bg-success' : 'bg-border-strong'
                )}
                title={connected ? 'متصل' : 'غير متصل'}
              />
              <span className={clsx('text-[10px]', connected ? 'text-success' : 'text-text-subtle')}>
                {connected ? 'متصل' : 'غير متصل'}
              </span>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
