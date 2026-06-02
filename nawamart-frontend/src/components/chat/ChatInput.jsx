import { useRef, useState, useCallback } from 'react'
import { Paperclip, Send, X } from 'lucide-react'
import clsx from 'clsx'
import EmojiPicker from './EmojiPicker'

const MAX_ROWS = 5
const LINE_HEIGHT = 24

export default function ChatInput({ onSendText, onSendFile, sending = false, disabled = false, replyTo, onCancelReply, onTyping }) {
  const [text, setText] = useState('')
  const textareaRef = useRef(null)
  const fileInputRef = useRef(null)

  const handleChange = (e) => {
    setText(e.target.value)
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    const maxH = LINE_HEIGHT * MAX_ROWS
    ta.style.height = Math.min(ta.scrollHeight, maxH) + 'px'
    onTyping?.()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleSend = useCallback(() => {
    const trimmed = text.trim()
    if (!trimmed || sending || disabled) return
    onSendText(trimmed, replyTo || null)
    setText('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
    onCancelReply?.()
  }, [text, sending, disabled, onSendText, replyTo, onCancelReply])

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      onSendFile(file)
      e.target.value = ''
    }
  }

  const handleEmojiSelect = (emoji) => {
    setText(prev => prev + emoji)
    textareaRef.current?.focus()
  }

  const canSend = text.trim().length > 0 && !sending && !disabled

  return (
    <div
      className={clsx(
        'bg-white border-t border-border shrink-0',
        'pb-[max(0.5rem,env(safe-area-inset-bottom))]'
      )}
    >
      {/* Reply preview bar */}
      {replyTo && (
        <div className="flex items-center gap-2 px-3 py-2 bg-accent-50 border-b border-accent/20">
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-cairo font-semibold text-accent-700">
              الرد على {replyTo.senderRole === 'merchant' ? 'التاجر' : 'العميل'}
            </p>
            <p className="text-xs text-text-muted truncate">
              {replyTo.type === 'image' ? '[صورة]' : replyTo.type === 'file' ? '[ملف]' : replyTo.content}
            </p>
          </div>
          <button
            onClick={onCancelReply}
            className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center hover:bg-accent/10 text-text-muted"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <div className="flex items-end gap-2 px-3 pt-2">
        {/* Attachment button */}
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

        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.zip,.txt"
          onChange={handleFileChange}
        />

        {/* Emoji picker */}
        {!disabled && <EmojiPicker onEmojiSelect={handleEmojiSelect} />}

        {/* Textarea */}
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

        {/* Send button */}
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
          <Send size={16} className="icon-flip" />
        </button>
      </div>
    </div>
  )
}
