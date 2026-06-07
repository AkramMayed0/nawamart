import { useRef, useState, useCallback } from 'react'
import { Paperclip, Send, X, ShoppingBag } from 'lucide-react'
import clsx from 'clsx'
import EmojiPicker from './EmojiPicker'

const MAX_ROWS = 5
const LINE_HEIGHT = 24

export default function ChatInput({ onSendText, onSendFile, onSendProductCard, sending = false, disabled = false, replyTo, onCancelReply, onTyping }) {
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
    <div className="chat-input-wrapper shrink-0">
      {/* Reply preview */}
      {replyTo && (
        <div className="chat-reply-bar">
          <div className="chat-reply-bar-accent" />
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-bold text-[#C93F2B] mb-0.5">
              رداً على {replyTo.senderRole === 'merchant' ? 'التاجر' : 'العميل'}
            </p>
            <p className="text-xs text-[#5F6673] truncate">
              {replyTo.type === 'image' ? '📷 صورة' : replyTo.type === 'file' ? '📎 ملف' : replyTo.content}
            </p>
          </div>
          <button
            onClick={onCancelReply}
            className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center hover:bg-[#E1DED8] text-[#9298A3] transition-colors"
          >
            <X size={13} />
          </button>
        </div>
      )}

      <div className="flex items-end gap-2 px-3 py-2.5">
        {/* Attachment */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className={clsx(
            'shrink-0 w-9 h-9 flex items-center justify-center rounded-full transition-all duration-150',
            'text-[#9298A3] hover:text-[#C93F2B] hover:bg-[#FFF4F1]',
            disabled && 'opacity-30 cursor-not-allowed'
          )}
          title="إرفاق ملف أو صورة"
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

        {/* Emoji */}
        {!disabled && <EmojiPicker onEmojiSelect={handleEmojiSelect} />}

        {/* Product card picker (merchant only) */}
        {onSendProductCard && !disabled && (
          <button
            type="button"
            onClick={onSendProductCard}
            className="shrink-0 w-9 h-9 flex items-center justify-center rounded-full transition-all duration-150 text-[#9298A3] hover:text-[#6750A4] hover:bg-[#ECE7F8]"
            title="إرسال بطاقة منتج"
          >
            <ShoppingBag size={18} />
          </button>
        )}

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          rows={1}
          placeholder={disabled ? 'تم تأكيد الاستلام ✓' : 'اكتب رسالة…'}
          className={clsx(
            'chat-textarea',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          style={{ minHeight: '40px' }}
        />

        {/* Send / mic button */}
        <button
          type="button"
          onClick={handleSend}
          disabled={!canSend && !sending}
          className={clsx(
            'shrink-0 w-10 h-10 flex items-center justify-center rounded-full transition-all duration-200',
            canSend
              ? 'chat-send-btn-active'
              : 'bg-[#ECE8E1] text-[#9298A3] cursor-not-allowed'
          )}
          title="إرسال"
        >
          {sending ? (
            <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          ) : (
            <Send size={16} className={clsx('icon-flip', canSend ? 'text-white' : '')} />
          )}
        </button>
      </div>
    </div>
  )
}
