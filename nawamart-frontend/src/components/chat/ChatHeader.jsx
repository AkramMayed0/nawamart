import { ArrowRight, Phone, MoreVertical, Image as ImageIcon } from 'lucide-react'
import clsx from 'clsx'

export default function ChatHeader({ chatMeta, connected, onBack, typingName, imageCount = 0, onGallery }) {
  const rawOrderId  = chatMeta?.order?._id || chatMeta?.order
  const orderId     = rawOrderId ? String(rawOrderId).slice(-8).toUpperCase() : '—'
  const merchantName = chatMeta?.merchant?.name ?? 'التاجر'
  const customerName = chatMeta?.customer?.name ?? 'العميل'
  const initials = customerName.charAt(0)

  return (
    <header className="chat-header shrink-0">
      <div className="flex items-center gap-3">
        {/* Back button */}
        <button
          onClick={onBack}
          className="chat-header-btn"
          aria-label="رجوع"
        >
          <ArrowRight size={20} className="icon-flip" />
        </button>

        {/* Avatar with online indicator */}
        <div className="relative shrink-0">
          <div className="chat-avatar">
            <span>{initials}</span>
          </div>
          <span
            className={clsx(
              'absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white transition-colors duration-300',
              connected ? 'bg-[#22c55e]' : 'bg-gray-300'
            )}
          />
        </div>

        {/* Name / status */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-sm text-[#1D2430] truncate">{customerName}</span>
            <span className="text-[#9298A3] text-xs">·</span>
            <span className="text-xs text-[#5F6673] truncate">{merchantName}</span>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5 h-4">
            {typingName ? (
              <span className="typing-indicator-text">
                <span className="typing-dots"><span /><span /><span /></span>
                {typingName} يكتب…
              </span>
            ) : (
              <>
                <span className="text-[11px] font-en text-[#9298A3]">#{orderId}</span>
                <span className={clsx(
                  'text-[10px] font-medium',
                  connected ? 'text-[#22c55e]' : 'text-[#9298A3]'
                )}>
                  {connected ? '● متصل' : '○ غير متصل'}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-1 shrink-0">
          {imageCount > 0 && (
            <button
              onClick={onGallery}
              className="chat-header-btn relative"
              title="معرض الصور"
            >
              <ImageIcon size={18} />
              <span className="absolute -top-1 -left-1 min-w-[16px] h-4 rounded-full bg-[#C93F2B] text-white text-[9px] font-bold flex items-center justify-center px-1">
                {imageCount}
              </span>
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
