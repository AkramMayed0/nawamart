/**
 * MessageBubble
 *
 * Layout (RTL):
 *   merchant → starts on the RIGHT side   (bg-primary / white text)
 *   customer → starts on the LEFT side    (bg-bg-soft / dark text)
 *
 * Wait — but the spec says:
 *   "Merchant: left side, blue background"
 *   "Customer: right side, gray background"
 *
 * In RTL layout "left" visually is where the flex items start when using
 * justify-start, so we keep RTL as-is and use flex direction naturally:
 *   isMine  → justify-end   (pushes bubble to inline-end = right in RTL)
 *   !isMine → justify-start (pushes bubble to inline-start = left in RTL)
 *
 * Spec: merchant blue (left), customer gray (right).
 * The current user viewing the chat determines "mine" / "theirs".
 *
 * Props:
 *   msg        { _id, sender, senderRole, type, content, fileName, createdAt, _optimistic }
 *   currentUserId  string
 */
import { Download, Clock } from 'lucide-react'
import clsx from 'clsx'

function formatTime(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleTimeString('ar-YE', { hour: '2-digit', minute: '2-digit', hour12: true })
}

export default function MessageBubble({ msg, currentUserId }) {
  const isMine = msg.sender === currentUserId
  const isImage = msg.type === 'image'
  const isFile  = msg.type === 'file'
  const isText  = msg.type === 'text'

  return (
    <div
      className={clsx(
        'flex w-full gap-2 px-4',
        isMine ? 'justify-end' : 'justify-start'
      )}
    >
      <div
        className={clsx(
          'relative max-w-[72%] sm:max-w-[60%] rounded-2xl px-4 py-2.5 shadow-sm',
          // Adjust corner to look like a speech bubble
          isMine
            ? 'rounded-tl-2xl rounded-br-sm bg-primary text-white'
            : 'rounded-tr-2xl rounded-bl-sm bg-white border border-border text-text',
          msg._optimistic && 'opacity-60'
        )}
      >
        {/* ── Text ── */}
        {isText && (
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
            {msg.content}
          </p>
        )}

        {/* ── Image ── */}
        {isImage && (
          <a href={msg.content} target="_blank" rel="noopener noreferrer">
            <img
              src={msg.content}
              alt="صورة مرفقة"
              className="rounded-xl max-h-56 object-cover w-full cursor-zoom-in"
              loading="lazy"
            />
          </a>
        )}

        {/* ── File download ── */}
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

        {/* ── Timestamp ── */}
        <div
          className={clsx(
            'flex items-center gap-1 mt-1 text-[10px] select-none',
            isMine ? 'justify-start text-white/60' : 'justify-end text-text-subtle'
          )}
        >
          {msg._optimistic && <Clock size={10} className="shrink-0" />}
          <span className="font-en">{formatTime(msg.createdAt)}</span>
        </div>
      </div>
    </div>
  )
}
