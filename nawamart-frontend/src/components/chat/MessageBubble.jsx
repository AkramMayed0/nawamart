import { Download, Clock, Check, CheckCheck, Reply, ImageIcon } from 'lucide-react'
import clsx from 'clsx'

const statusIcons = {
  sending:  { icon: Clock,  cls: 'text-text-subtle' },
  sent:     { icon: Check,  cls: 'text-text-subtle' },
  delivered:{ icon: CheckCheck, cls: 'text-text-subtle' },
  read:     { icon: CheckCheck, cls: 'text-primary' },
}

function getStatus(msg) {
  if (msg._optimistic) return 'sending'
  if (msg.readAt) return 'read'
  if (msg.delivered) return 'delivered'
  return 'sent'
}

function formatTime(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleTimeString('ar-YE', { hour: '2-digit', minute: '2-digit', hour12: true })
}

export default function MessageBubble({ msg, currentUserId, onReply }) {
  const isMine = msg.sender === currentUserId
  const isImage = msg.type === 'image'
  const isFile  = msg.type === 'file'
  const isText  = msg.type === 'text'
  const status = getStatus(msg)
  const StatusIcon = statusIcons[status].icon
  const hasReply = !!msg.replyTo

  return (
    <div className={clsx('flex w-full gap-2 px-4 group', isMine ? 'justify-end' : 'justify-start')}>
      <div className={clsx('relative max-w-[72%] sm:max-w-[60%]', isMine ? 'items-end' : 'items-start')}>
        {/* Reply-to quote */}
        {hasReply && (
          <div
            className={clsx(
              'flex items-center gap-1.5 px-3 py-1.5 mb-0.5 rounded-t-xl text-xs cursor-pointer',
              'border-r-2',
              isMine ? 'bg-white/10 border-white/30 mr-2' : 'bg-bg-soft border-primary/40 ml-2',
              isMine ? 'rounded-tr-xl' : 'rounded-tl-xl'
            )}
            title={msg.replyContent || ''}
          >
            <Reply size={10} className={isMine ? 'text-white/60' : 'text-primary/60'} />
            <span className={clsx('truncate max-w-[160px]', isMine ? 'text-white/70' : 'text-text-muted')}>
              {msg.replyType === 'image' ? 'صورة' : msg.replyType === 'file' ? 'ملف' : msg.replyContent || ''}
            </span>
          </div>
        )}

        {/* Bubble */}
        <div
          className={clsx(
            'relative rounded-2xl px-4 py-2.5 shadow-sm',
            isMine
              ? 'rounded-tl-2xl rounded-br-sm bg-primary text-white'
              : 'rounded-tr-2xl rounded-bl-sm bg-white border border-border text-text',
            msg._optimistic && 'opacity-60',
            hasReply && isMine && 'rounded-tr-sm',
            hasReply && !isMine && 'rounded-tl-sm'
          )}
        >
          {/* Speech bubble tail */}
          <span
            className={clsx(
              'absolute bottom-[6px] w-0 h-0 border-[7px] border-transparent',
              isMine
                ? '-right-[10px] border-l-primary'
                : '-left-[10px] border-r-white'
            )}
            style={isMine ? {} : { filter: 'drop-shadow(1px 1px 0px #e5e7eb)' }}
          />

          {/* Text */}
          {isText && (
            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
              {msg.content}
            </p>
          )}

          {/* Image */}
          {isImage && (
            <button onClick={() => onReply?.(msg)} className="block w-full text-right">
              <img
                src={msg.content}
                alt="صورة مرفقة"
                className="rounded-xl max-h-56 object-cover w-full cursor-zoom-in hover:opacity-95 transition-opacity"
                loading="lazy"
              />
            </button>
          )}

          {/* File */}
          {isFile && (
            <a
              href={msg.content}
              download={msg.fileName || 'ملف'}
              target="_blank"
              rel="noopener noreferrer"
              className={clsx(
                'flex items-center gap-2 text-sm underline underline-offset-2',
                isMine ? 'text-white/90' : 'text-primary'
              )}
            >
              <Download size={15} className="shrink-0" />
              <span className="truncate max-w-[200px]">{msg.fileName || 'تحميل الملف'}</span>
            </a>
          )}

          {/* Meta row: time + status + reply button */}
          <div className={clsx(
            'flex items-center gap-1.5 mt-1 min-h-[18px]',
            isMine ? 'justify-start' : 'justify-end'
          )}>
            {msg._optimistic && <Clock size={10} className={isMine ? 'text-white/60' : 'text-text-subtle'} />}
            <span className={clsx('text-[10px] font-en', isMine ? 'text-white/60' : 'text-text-subtle')}>
              {formatTime(msg.createdAt)}
            </span>
            {/* Reply button */}
            {onReply && !msg._optimistic && (
              <button
                onClick={(e) => { e.stopPropagation(); onReply(msg) }}
                className={clsx(
                  'opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded',
                  isMine ? 'hover:bg-white/10' : 'hover:bg-bg-soft'
                )}
                title="رد"
              >
                <Reply size={11} className={isMine ? 'text-white/60' : 'text-text-subtle'} />
              </button>
            )}
            {/* Delivery status */}
            {isMine && !msg._optimistic && (
              <StatusIcon size={11} className={statusIcons[status].cls} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
