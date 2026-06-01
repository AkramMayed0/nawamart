/**
 * ChatInput — sticky bottom bar with:
 *   • Attachment button (opens hidden file input)
 *   • Auto-growing textarea
 *   • Send button (disabled when empty / sending)
 *
 * Props:
 *   onSendText  (text: string) => void
 *   onSendFile  (file: File)   => void
 *   sending     boolean
 *   disabled    boolean   (e.g. receipt already confirmed)
 */
import { useRef, useState, useCallback } from 'react'
import { Paperclip, Send } from 'lucide-react'
import clsx from 'clsx'

const MAX_ROWS = 5
const LINE_HEIGHT = 24 // px — matches text-sm leading-6

export default function ChatInput({ onSendText, onSendFile, sending = false, disabled = false }) {
  const [text, setText] = useState('')
  const textareaRef = useRef(null)
  const fileInputRef = useRef(null)

  // Auto-resize textarea
  const handleChange = (e) => {
    setText(e.target.value)
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    const maxH = LINE_HEIGHT * MAX_ROWS
    ta.style.height = Math.min(ta.scrollHeight, maxH) + 'px'
  }

  const handleKeyDown = (e) => {
    // Send on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleSend = useCallback(() => {
    const trimmed = text.trim()
    if (!trimmed || sending || disabled) return
    onSendText(trimmed)
    setText('')
    // Reset height
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }, [text, sending, disabled, onSendText])

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      onSendFile(file)
      // Reset input so the same file can be sent again
      e.target.value = ''
    }
  }

  const canSend = text.trim().length > 0 && !sending && !disabled

  return (
    <div
      className={clsx(
        'flex items-end gap-2 bg-white border-t border-border px-3 py-2 shrink-0',
        // iOS home-bar safe area — env() fallback to 0px on non-iOS
        'pb-[max(0.5rem,env(safe-area-inset-bottom))]'
      )}
    >
      {/* ── Attachment button ── */}
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled}
        className={clsx(
          'shrink-0 w-9 h-9 flex items-center justify-center rounded-full',
          'text-text-muted hover:bg-bg-soft transition-colors',
          disabled && 'opacity-40 cursor-not-allowed'
        )}
        title="إرفاق ملف أو صورة"
        aria-label="إرفاق ملف"
      >
        <Paperclip size={18} />
      </button>

      {/* Hidden file input — accepts images + common docs */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.zip,.txt"
        onChange={handleFileChange}
      />

      {/* ── Textarea ── */}
      <textarea
        ref={textareaRef}
        value={text}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        rows={1}
        placeholder={disabled ? 'تم تأكيد الاستلام' : 'اكتب رسالة…'}
        className={clsx(
          'flex-1 resize-none rounded-xl border border-border bg-bg px-3 py-2',
          'text-sm leading-6 text-text placeholder:text-text-subtle',
          'focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10',
          'transition-all overflow-hidden',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        style={{ minHeight: '40px' }}
      />

      {/* ── Send button ── */}
      <button
        type="button"
        onClick={handleSend}
        disabled={!canSend}
        className={clsx(
          'shrink-0 w-9 h-9 flex items-center justify-center rounded-full transition-all',
          canSend
            ? 'bg-primary text-white hover:bg-primary-700 active:scale-95'
            : 'bg-bg-soft text-text-subtle cursor-not-allowed'
        )}
        title="إرسال"
        aria-label="إرسال الرسالة"
      >
        {/* Flip arrow for RTL so it points left → right visually */}
        <Send size={16} className="icon-flip" />
      </button>
    </div>
  )
}
