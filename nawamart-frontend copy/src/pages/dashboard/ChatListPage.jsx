import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MessageSquare, Search, ChevronLeft, Image, Paperclip, Zap, Truck, MessageCircle, Send, Instagram as InstagramIcon, Phone } from 'lucide-react'
import clsx from 'clsx'

import { getMerchantChats, getMerchantOrders } from '@/api/orders'
import usePageTitle from '@/hooks/usePageTitle'
import { useAuthStore } from '@/store/authStore'

const CONTACT_META_FULL = {
  whatsapp:  { label: 'واتساب',  icon: MessageCircle, cls: 'text-green-600',     url: (h, p) => `https://wa.me/${(h || p).replace(/[^0-9]/g, '')}` },
  telegram:  { label: 'تيليجرام', icon: Send,         cls: 'text-blue-500',      url: (h) => `https://t.me/${(h || '').replace('@', '')}` },
  instagram: { label: 'انستقرام', icon: InstagramIcon, cls: 'text-pink-600',     url: (h) => `https://www.instagram.com/direct/t/${(h || '').replace('@', '')}` },
  phone:     { label: 'اتصال',    icon: Phone,        cls: 'text-primary',       url: (h) => `tel:${h}` },
}

function contactMeta(plan) {
  const keys = plan === 'starter' ? ['whatsapp', 'instagram', 'phone'] : ['whatsapp', 'telegram', 'instagram', 'phone']
  return Object.fromEntries(keys.map(k => [k, CONTACT_META_FULL[k]]))
}

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

function ChatRow({ item, plan = 'starter', onClick }) {
  const hasChat = item._type === 'chat'
  const order = item.order || item
  const customerName = item.customer?.name || order.deliveryAddress?.name || 'عميل'
  const isDigital = item.store?.type === 'digital' || order.store?.type === 'digital'
  const contactMethod = order.contactMethod || 'whatsapp'
  const cmMap = contactMeta(plan)
  const cm = cmMap[contactMethod] || cmMap.whatsapp
  const cmIcon = cm.icon

  let preview, TypeIcon
  if (hasChat) {
    const last = item.lastMessage
    preview = last?.type === 'text' ? last.content
            : last?.type === 'image' ? 'صورة'
            : last?.type === 'file' ? 'ملف'
            : 'ابدأ المحادثة'
    TypeIcon = last?.type === 'image' ? Image : last?.type === 'file' ? Paperclip : null
  } else {
    preview = plan === 'pro' ? `رقم: ${order.contactHandle || order.deliveryAddress?.phone || '—'}` : `تواصل عبر ${cm.label}`
    TypeIcon = cmIcon
  }

  const unread = item.merchantUnread ?? 0
  const rawOrderId = order._id
  const time = hasChat ? item.lastMessage?.createdAt : order.confirmedAt

  return (
    <button onClick={onClick} className={clsx(
      'w-full flex items-center gap-3 px-4 py-3',
      'hover:bg-bg-soft active:bg-primary/5 transition-colors text-right',
      'border-b border-border last:border-0'
    )}>
      <div className={clsx(
        'w-11 h-11 rounded-xl flex items-center justify-center shrink-0',
        isDigital ? 'bg-accent-50 text-accent-700' : 'bg-primary-50 text-primary'
      )}>
        {hasChat ? <MessageSquare size={20} /> : <cmIcon size={20} />}
      </div>

      <div className="flex-1 min-w-0 text-right">
        <div className="flex items-baseline justify-between gap-2">
          <span className="font-semibold text-sm text-text truncate">{customerName}</span>
          <span className="text-[11px] text-text-subtle font-en shrink-0">{timeAgo(time)}</span>
        </div>
        <div className="flex items-center justify-between gap-2 mt-0.5">
          <p className={clsx('text-xs truncate inline-flex items-center gap-1', unread > 0 ? 'text-text font-medium' : 'text-text-muted')}>
            {TypeIcon && <TypeIcon size={12} className="shrink-0" />}
            {preview}
          </p>
          <div className="flex items-center gap-1.5 shrink-0">
            {!hasChat && plan === 'pro' ? (
              <span className={clsx('inline-flex items-center gap-1 text-[10px] font-semibold', cm.cls)}>
                <cmIcon size={10} />
                {order.contactHandle || order.deliveryAddress?.phone || cm.label}
              </span>
            ) : !hasChat ? (
              <a
                href={cm.url(order.contactHandle || order.deliveryAddress?.phone || '', order.deliveryAddress?.phone || '')}
                target="_blank"
                rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                className={clsx('inline-flex items-center gap-1 text-[10px] font-semibold hover:underline', cm.cls)}
              >
                <cmIcon size={10} />
                {cm.label}
              </a>
            ) : null}
            <span className="text-[10px] text-text-subtle font-en">#{String(rawOrderId).slice(-8).toUpperCase()}</span>
          </div>
        </div>
      </div>

      {unread > 0 && (
        <span className="min-w-[18px] h-[18px] rounded-full bg-accent text-white text-[10px] font-bold flex items-center justify-center px-1 shrink-0">
          {unread > 9 ? '9+' : unread}
        </span>
      )}
      <ChevronLeft size={14} className="text-text-subtle shrink-0" />
    </button>
  )
}

const PLAN_META = {
  starter:  { label: 'المجانية', cls: 'bg-bg-soft text-text-muted', },
  pro:      { label: 'الاحترافية', cls: 'bg-primary-50 text-primary', },
  business: { label: 'الأعمال', cls: 'bg-amber-50 text-amber-700', },
}

export default function ChatListPage() {
  usePageTitle('التسليم')
  const navigate  = useNavigate()
  const store     = useAuthStore(s => s.store)
  const plan      = store?.plan || 'starter'
  const planMeta  = PLAN_META[plan] || PLAN_META.starter
  const [items,   setItems]   = useState([])
  const [loading, setLoading] = useState(true)
  const [query,   setQuery]   = useState('')

  useEffect(() => {
    setLoading(true)
    Promise.all([
      getMerchantChats().then(r => r.data.data ?? []).catch(() => []),
      getMerchantOrders().then(r => r.data.data ?? []).catch(() => []),
    ]).then(([chats, orders]) => {
      // Tag each item with its source type
      // For non-Business plans, only show orders (no in-app chats)
      const rawChatItems = chats.map(c => ({ ...c, _type: 'chat' }))
      const chatItems = plan === 'business' ? rawChatItems : []

      // Orders needing delivery: confirmed digital + shipped physical
      const deliveryOrders = orders.filter(o =>
        (o.store?.type === 'digital' && o.status === 'confirmed') ||
        (o.store?.type !== 'digital' && o.status === 'shipped')
      )
      // Exclude orders that already have a chat (Business only — non-Business show all orders)
      const chatOrderIds = plan === 'business' ? new Set(chats.map(c => String(c.order?._id || c.order))) : new Set()
      const orderItems = deliveryOrders
        .filter(o => !chatOrderIds.has(String(o._id)))
        .map(o => ({ ...o, _type: 'order' }))

      // Merge: chats first (with recent activity), then orders sorted by confirmedAt
      const merged = [
        ...chatItems.sort((a, b) => new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0)),
        ...orderItems.sort((a, b) => new Date(b.confirmedAt || 0) - new Date(a.confirmedAt || 0)),
      ]
      setItems(merged)
    }).finally(() => setLoading(false))
  }, [])

  const filtered = query.trim()
    ? items.filter(item => {
        const name = item.customer?.name || item.deliveryAddress?.name || ''
        const id = String(item.order?._id || item.order || item._id)
        return name.includes(query) || id.includes(query)
      })
    : items

  const chatCount = items.filter(i => i._type === 'chat').length
  const orderCount = items.filter(i => i._type === 'order').length

  return (
    <div className="flex flex-col h-full overflow-hidden bg-bg font-cairo">
      <header className="bg-white border-b border-border px-4 py-4 shrink-0">
        <div className="flex items-center gap-2">
          <MessageSquare size={20} className="text-primary shrink-0" />
          <h1 className="text-lg font-bold text-text">التسليم</h1>
          <span className={`mr-auto inline-flex items-center gap-1 font-cairo text-[11px] font-bold px-2 py-0.5 rounded-pill ${planMeta.cls}`}>
            {planMeta.label}
          </span>
          {items.length > 0 && (
            <span className="bg-primary/10 text-primary text-xs font-semibold px-2 py-0.5 rounded-full font-en">
              {items.length}
            </span>
          )}
        </div>

        {items.length > 0 && (
          <div className="flex items-center gap-3 mt-2">
            {chatCount > 0 && (
              <span className="inline-flex items-center gap-1 text-[11px] font-cairo font-semibold text-accent-700 bg-accent-50 px-2 py-0.5 rounded-pill">
                <MessageSquare size={12} />{chatCount} محادثة
              </span>
            )}
            {orderCount > 0 && (
              <span className="inline-flex items-center gap-1 text-[11px] font-cairo font-semibold text-primary bg-primary-50 px-2 py-0.5 rounded-pill">
                <Zap size={12} />{orderCount} للتسليم
              </span>
            )}
          </div>
        )}

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

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-24 px-8 text-center">
            <div className="w-14 h-14 rounded-full bg-bg-soft flex items-center justify-center">
              <MessageSquare size={24} className="text-text-subtle" />
            </div>
            <p className="font-semibold text-text">
              {query ? 'لا توجد نتائج' : 'لا توجد طلبات للتسليم'}
            </p>
            <p className="text-sm text-text-muted">
              {query ? 'جرّب كلمة بحث مختلفة' : 'عند تأكيد طلب رقمي ستظهر هنا'}
            </p>
          </div>
        ) : (
          <>
            {filtered.map(item => (
              <ChatRow
                key={item._type === 'chat' ? `c-${item._id}` : `o-${item._id}`}
                item={item}
                plan={plan}
                onClick={() => {
                  if (item._type === 'chat') {
                    navigate(`/dashboard/chat/${item._id}`)
                  } else {
                    navigate(`/dashboard/chat/order/${item._id}`)
                  }
                }}
              />
            ))}
            {/* Upgrade banner for non-Business */}
            {plan !== 'business' && chatCount === 0 && (
              <div className="px-4 py-4 border-t border-border">
                <div className="bg-accent-50 border border-accent-200 rounded-xl p-4 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center text-white shrink-0">
                    <MessageSquare size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-cairo font-bold text-sm text-accent-800">محادثة مدمجة</p>
                    <p className="font-cairo text-xs text-accent-700/70 mt-0.5">
                      باقة Business تتيح محادثة داخل التطبيق مع العملاء — ترقية الآن
                    </p>
                    <a
                      href="/subscribe?plan=business"
                      className="inline-flex items-center gap-1 mt-2 font-cairo font-bold text-xs text-accent-700 hover:text-accent-900 transition-colors"
                    >
                      ترقية الباقة ←
                    </a>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
