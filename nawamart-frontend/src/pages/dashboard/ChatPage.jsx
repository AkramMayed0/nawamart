/**
 * ChatPage — /dashboard/chat/:chatId
 *
 * Layout (full viewport, no outer scroll):
 * ┌─────────────────────────────┐
 * │        ChatHeader           │  ← fixed top
 * ├─────────────────────────────┤
 * │                             │
 * │     Messages list           │  ← scrollable flex-1
 * │   (auto-scrolls to bottom)  │
 * │                             │
 * ├─────────────────────────────┤
 * │  تأكيد الاستلام banner      │  ← customer only, disappears after confirm
 * ├─────────────────────────────┤
 * │        ChatInput            │  ← fixed bottom (sticky on mobile)
 * └─────────────────────────────┘
 */
import { useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { CheckCircle, MessageSquare } from 'lucide-react'
import clsx from 'clsx'

import { useAuthStore }  from '@/store/authStore'
import { useChat }       from '@/hooks/useChat'
import ChatHeader        from '@/components/chat/ChatHeader'
import MessageBubble     from '@/components/chat/MessageBubble'
import ChatInput         from '@/components/chat/ChatInput'

// ── Skeleton loader for initial messages ──────────────────────────────────
function MessageSkeleton() {
  return (
    <div className="flex flex-col gap-3 px-4 py-3 animate-pulse">
      {[true, false, true, false, false].map((mine, i) => (
        <div key={i} className={clsx('flex', mine ? 'justify-end' : 'justify-start')}>
          <div
            className={clsx(
              'h-9 rounded-2xl',
              mine ? 'bg-primary/20 w-48' : 'bg-bg-soft w-40'
            )}
          />
        </div>
      ))}
    </div>
  )
}

// ── Empty state (no messages yet) ─────────────────────────────────────────
function EmptyState({ customerName }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-8 py-16">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
        <MessageSquare size={28} className="text-primary" />
      </div>
      <p className="font-semibold text-text">ابدأ المحادثة</p>
      <p className="text-sm text-text-muted leading-relaxed">
        {customerName
          ? `راسل ${customerName} بخصوص هذا الطلب`
          : 'لا توجد رسائل بعد. ابدأ المحادثة الآن.'}
      </p>
    </div>
  )
}

// ── Confirm-receipt banner (customer only) ────────────────────────────────
function ConfirmBanner({ onConfirm, confirmed }) {
  if (confirmed) {
    return (
      <div className="flex items-center justify-center gap-2 bg-success-100 text-success-dark px-4 py-2.5 text-sm font-medium shrink-0">
        <CheckCircle size={16} />
        <span>تم تأكيد استلام الطلب</span>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between gap-3 bg-accent-50 border-t border-accent/30 px-4 py-2.5 shrink-0">
      <p className="text-sm text-text-muted">هل استلمت طلبك؟</p>
      <button
        onClick={onConfirm}
        className="shrink-0 bg-primary text-white text-sm font-semibold px-4 py-1.5 rounded-lg hover:bg-primary-700 active:scale-95 transition-all"
      >
        تأكيد الاستلام
      </button>
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function ChatPage() {
  const { chatId }  = useParams()
  const navigate    = useNavigate()
  const user        = useAuthStore(s => s.user)
  const isCustomer  = user?.role === 'customer'

  const {
    messages,
    chatMeta,
    loading,
    sending,
    connected,
    confirmed,
    sendText,
    sendFile,
    confirmReceipt,
  } = useChat(chatId)

  // ── Scroll to bottom whenever messages change ──────────────────────────
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const goBack = () => navigate(-1)

  return (
    /*
     * Full-screen column.
     * h-[100dvh] uses dynamic viewport height (handles mobile browsers with
     * address bar / keyboard pop-up). Falls back to 100vh on older browsers.
     */
    <div className="flex flex-col h-full overflow-hidden bg-bg font-cairo">

      {/* ── Header ── */}
      <ChatHeader
        chatMeta={chatMeta}
        connected={connected}
        onBack={goBack}
      />

      {/* ── Messages scroll area ── */}
      <div className="flex-1 overflow-y-auto py-4 space-y-1.5 overscroll-contain">
        {loading ? (
          <MessageSkeleton />
        ) : messages.length === 0 ? (
          <EmptyState customerName={chatMeta?.customerName} />
        ) : (
          <>
            {messages.map(msg => (
              <MessageBubble
                key={msg._id}
                msg={msg}
                currentUserId={user?._id}
              />
            ))}
          </>
        )}
        {/* Scroll anchor */}
        <div ref={bottomRef} />
      </div>

      {/* ── Confirm receipt banner (customer only) ── */}
      {isCustomer && (
        <ConfirmBanner onConfirm={confirmReceipt} confirmed={confirmed} />
      )}

      {/* ── Input bar ── */}
      <ChatInput
        onSendText={sendText}
        onSendFile={sendFile}
        sending={sending}
        disabled={confirmed && isCustomer}
      />
    </div>
  )
}
