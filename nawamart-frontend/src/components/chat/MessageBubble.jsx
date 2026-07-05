import { Download, Clock, Check, CheckCheck, Reply, File as FileIcon, Play } from 'lucide-react'
import clsx from 'clsx'
import ProductCardBubble from './ProductCardBubble'

const statusIcons = {
  sending:   { icon: Clock,      cls: 'text-white/50' },
  sent:      { icon: Check,      cls: 'text-white/60' },
  delivered: { icon: CheckCheck, cls: 'text-white/60' },
  read:      { icon: CheckCheck, cls: 'text-[#4ade80]' },
}

function getStatus(msg) {
  if (msg._optimistic) return 'sending'
  if (msg.readAt)      return 'read'
  if (msg.delivered)   return 'delivered'
  return 'sent'
}

function formatTime(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleTimeString('ar-YE', { hour: '2-digit', minute: '2-digit', hour12: true })
}

function getFileExtension(name = '') {
  return name.split('.').pop()?.toUpperCase() || 'FILE'
}

export default function MessageBubble({ msg, currentUserId, onReply, onImageClick, index }) {
  const isMine  = msg.sender?.toString() === currentUserId?.toString()
  const isImage = msg.type === 'image'
  const isFile  = msg.type === 'file'
  const isText  = msg.type === 'text'
  const isCard  = msg.type === 'product_card'
  const status  = getStatus(msg)
  const StatusIcon = statusIcons[status].icon
  const hasReply = !!msg.replyTo

  // ── Product card: render as a standalone card bubble ──────────────────────
  if (isCard) {
    return (
      <div
        className={clsx(
          'flex w-full gap-2 px-3 sm:px-4 group',
          isMine ? 'justify-end' : 'justify-start',
          'message-enter'
        )}
        style={{ animationDelay: `${Math.min(index * 30, 300)}ms` }}
      >
        {!isMine && (
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#18212F] to-[#27364B] flex items-center justify-center shrink-0 self-end mb-1">
            <span className="text-[9px] font-bold text-white">م</span>
          </div>
        )}
        <div className="max-w-[75%] sm:max-w-[65%]">
          <ProductCardBubble
            card={msg.productCard}
            isMine={isMine}
            time={formatTime(msg.createdAt)}
          />
        </div>
      </div>
    )
  }

  return (
    <div
      className={clsx(
        'flex w-full gap-2 px-3 sm:px-4 group',
        isMine ? 'justify-end' : 'justify-start',
        'message-enter'
      )}
      style={{ animationDelay: `${Math.min(index * 30, 300)}ms` }}
    >
      {/* Incoming: mini avatar circle */}
      {!isMine && (
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#18212F] to-[#27364B] flex items-center justify-center shrink-0 self-end mb-1">
          <span className="text-[9px] font-bold text-white">م</span>
        </div>
      )}

      <div className={clsx('relative max-w-[75%] sm:max-w-[65%]', isMine ? 'items-end' : 'items-start')}>
        {/* Reply-to preview */}
        {hasReply && (
          <div
            className={clsx(
              'flex items-center gap-1.5 px-3 py-1.5 mb-[-4px] rounded-t-xl text-xs',
              'border-r-2',
              isMine
                ? 'bg-black/20 border-white/30 text-white/70 rounded-r-none mr-1'
                : 'bg-[#F6F3EE] border-[#C93F2B]/40 text-[#5F6673] rounded-l-none ml-1'
            )}
          >
            <Reply size={10} className="shrink-0 opacity-60" />
            <span className="truncate max-w-[180px]">
              {msg.replyType === 'image' ? ' صورة' : msg.replyType === 'file' ? ' ملف' : msg.replyContent || '…'}
            </span>
          </div>
        )}

        {/* Bubble */}
        <div
          className={clsx(
            'relative rounded-2xl shadow-sm overflow-hidden',
            isMine
              ? 'chat-bubble-mine'
              : 'chat-bubble-theirs',
            msg._optimistic && 'opacity-70',
            hasReply && isMine  && 'rounded-tr-sm',
            hasReply && !isMine && 'rounded-tl-sm',
            !isImage && 'px-4 py-2.5'
          )}
        >
          {/* Image message */}
          {isImage && (
            <button
              onClick={() => onImageClick?.()}
              className="block w-full focus:outline-none"
              aria-label="عرض الصورة"
            >
              <img
                src={msg.content}
                alt="صورة مرفقة"
                className="rounded-2xl max-h-64 w-full object-cover cursor-zoom-in hover:brightness-90 transition-all duration-200"
                loading="lazy"
              />
              {/* Timestamp overlay on images */}
              <div className="absolute bottom-1.5 left-2 flex items-center gap-1 bg-black/40 backdrop-blur-sm rounded-full px-2 py-0.5">
                <span className="text-[10px] text-white/90 font-en">{formatTime(msg.createdAt)}</span>
                {isMine && !msg._optimistic && (
                  <StatusIcon size={9} className={statusIcons[status].cls} />
                )}
              </div>
            </button>
          )}

          {/* File message */}
          {isFile && (
            <a
              href={msg.content}
              download={msg.fileName || 'ملف'}
              target="_blank"
              rel="noopener noreferrer"
              className={clsx(
                'flex items-center gap-3 py-0.5',
                isMine ? 'text-white' : 'text-[#1D2430]'
              )}
            >
              <div className={clsx(
                'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-[10px] font-bold font-en',
                isMine ? 'bg-white/20' : 'bg-[#18212F]/10'
              )}>
                {getFileExtension(msg.fileName)}
              </div>
              <div className="flex-1 min-w-0">
                <p className={clsx('text-sm font-semibold truncate', isMine ? 'text-white' : 'text-[#1D2430]')}>
                  {msg.fileName || 'ملف مرفق'}
                </p>
                <p className={clsx('text-[11px] mt-0.5', isMine ? 'text-white/60' : 'text-[#9298A3]')}>
                  اضغط للتحميل
                </p>
              </div>
              <Download size={16} className={isMine ? 'text-white/70 shrink-0' : 'text-[#5F6673] shrink-0'} />
            </a>
          )}

          {/* Text message */}
          {isText && (
            <p className={clsx(
              'text-sm leading-relaxed whitespace-pre-wrap break-words',
              isMine ? 'text-white' : 'text-[#1D2430]'
            )}>
              {msg.content}
            </p>
          )}

          {/* Meta row (not for images - they have overlay) */}
          {!isImage && (
            <div className={clsx(
              'flex items-center gap-1 mt-1',
              isMine ? 'justify-start' : 'justify-end'
            )}>
              <span className={clsx('text-[10px] font-en', isMine ? 'text-white/50' : 'text-[#9298A3]')}>
                {formatTime(msg.createdAt)}
              </span>
              {isMine && !msg._optimistic && (
                <StatusIcon size={11} className={statusIcons[status].cls} />
              )}
              {isMine && msg._optimistic && (
                <Clock size={10} className="text-white/40" />
              )}
            </div>
          )}
        </div>

        {/* Reply action — appears on hover beside bubble */}
        {onReply && !msg._optimistic && (
          <button
            onClick={(e) => { e.stopPropagation(); onReply(msg) }}
            className={clsx(
              'absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-150',
              'w-7 h-7 rounded-full flex items-center justify-center shadow-sm',
              'bg-white border border-[#E1DED8] text-[#5F6673] hover:text-[#C93F2B] hover:border-[#C93F2B]/30',
              isMine ? '-left-9' : '-right-9'
            )}
            title="رد"
          >
            <Reply size={13} />
          </button>
        )}
      </div>
    </div>
  )
}
