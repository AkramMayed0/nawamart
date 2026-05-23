/**
 * ChatListPage — /dashboard/chat
 *
 * Merchant sees all active chats, sorted by latest message.
 * Clicking a row navigates to /dashboard/chat/:chatId
 *
 * Layout:
 * ┌──────────────────────────────┐
 * │  محادثات الطلبات  (header)   │
 * ├──────────────────────────────┤
 * │  🔍 search bar               │
 * ├──────────────────────────────┤
 * │  ChatRow × N                 │  (scrollable)
 * └──────────────────────────────┘
 */
import { useState, useEffect } from 'react'
import { useNavigate }         from 'react-router-dom'
import { MessageSquare, Search, ChevronLeft } from 'lucide-react'
import clsx                    from 'clsx'

import { getMerchantChats } from '@/api/orders'

// ── helpers ──────────────────────────────────────────────────────────────
function timeAgo(iso) {
  if (!iso) return ''
  const diff = Date.now() - new Date(iso).getTime()
  const mins  = Math.floor(diff / 60_000)
  if (mins < 1)   return 'الآن'
  if (mins < 60)  return `${mins}د`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)   return `${hrs}س`
  const days = Math.floor(hrs / 24)
  return `${days}ي`
}

// ── Skeleton row ──────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 px-4 py-3 animate-pulse">
      <div className="w-11 h-11 rounded-full bg-bg-soft shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3.5 bg-bg-soft rounded w-32" />
        <div className="h-3 bg-bg-soft rounded w-48" />
      </div>
      <div className="h-3 w-8 bg-bg-soft rounded" />
    </div>
  )
}

// ── Single chat row ───────────────────────────────────────────────────────
function ChatRow({ chat, onClick }) {
  const unread  = chat.unreadCount ?? 0
  const last    = chat.lastMessage
  const preview = last?.type === 'text'
    ? last.content
    : last?.type === 'image'
    ? '📷 صورة'
    : last?.type === 'file'
    ? '📎 ملف'
    : 'ابدأ المحادثة'

  return (
    <button
      onClick={onClick}
      className={clsx(
        'w-full flex items-center gap-3 px-4 py-3',
        'hover:bg-bg-soft active:bg-primary/5 transition-colors text-right',
        'border-b border-border last:border-0'
      )}
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-base font-bold text-primary">
            {chat.customerName?.charAt(0) ?? '؟'}
          </span>
        </div>
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-accent text-white text-[10px] font-bold flex items-center justify-center px-1">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0 text-right">
        <div className="flex items-baseline justify-between gap-2">
          <span className="font-semibold text-sm text-text truncate">{chat.customerName}</span>
          <span className="text-[11px] text-text-subtle font-en shrink-0">{timeAgo(last?.createdAt)}</span>
        </div>
        <div className="flex items-center justify-between gap-2 mt-0.5">
          <p className={clsx(
            'text-xs truncate',
            unread > 0 ? 'text-text font-medium' : 'text-text-muted'
          )}>
            {preview}
          </p>
          <span className="text-[10px] text-text-subtle font-en shrink-0">#{chat.orderId}</span>
        </div>
      </div>

      {/* Chevron */}
      <ChevronLeft size={14} className="text-text-subtle shrink-0" />
    </button>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────
export default function ChatListPage() {
  const navigate  = useNavigate()
  const [chats,   setChats]   = useState([])
  const [loading, setLoading] = useState(true)
  const [query,   setQuery]   = useState('')

  useEffect(() => {
    getMerchantChats()
      .then(res => setChats(res.data.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = query.trim()
    ? chats.filter(c =>
        c.customerName?.includes(query) ||
        String(c.orderId)?.includes(query)
      )
    : chats

  return (
    <div className="flex flex-col h-[100dvh] overflow-hidden bg-bg font-cairo">

      {/* ── Page header ── */}
      <header className="bg-white border-b border-border px-4 py-4 shrink-0">
        <div className="flex items-center gap-2">
          <MessageSquare size={20} className="text-primary shrink-0" />
          <h1 className="text-lg font-bold text-text">محادثات الطلبات</h1>
          {chats.length > 0 && (
            <span className="mr-auto bg-primary/10 text-primary text-xs font-semibold px-2 py-0.5 rounded-full font-en">
              {chats.length}
            </span>
          )}
        </div>

        {/* Search */}
        <div className="relative mt-3">
          <Search size={15} className="absolute top-1/2 -translate-y-1/2 right-3 text-text-subtle pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="ابحث باسم العميل أو رقم الطلب…"
            className="w-full bg-bg border border-border rounded-xl pr-9 pl-3 py-2 text-sm text-text placeholder:text-text-subtle focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
          />
        </div>
      </header>

      {/* ── List ── */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-24 px-8 text-center">
            <div className="w-14 h-14 rounded-full bg-bg-soft flex items-center justify-center">
              <MessageSquare size={24} className="text-text-subtle" />
            </div>
            <p className="font-semibold text-text">
              {query ? 'لا توجد نتائج' : 'لا توجد محادثات بعد'}
            </p>
            <p className="text-sm text-text-muted">
              {query
                ? 'جرّب كلمة بحث مختلفة'
                : 'ستظهر محادثات الطلبات الرقمية هنا'}
            </p>
          </div>
        ) : (
          filtered.map(chat => (
            <ChatRow
              key={chat._id}
              chat={chat}
              onClick={() => navigate(`/dashboard/chat/${chat._id}`)}
            />
          ))
        )}
      </div>
    </div>
  )
}
