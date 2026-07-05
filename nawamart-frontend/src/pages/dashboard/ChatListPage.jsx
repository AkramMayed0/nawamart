import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  MessageSquare, Search, ChevronLeft, Image, Paperclip,
  Zap, Truck, MessageCircle, Send, Phone, Package, Sparkles,
  Clock, Instagram as InstagramIcon,
} from 'lucide-react'
import clsx from 'clsx'

import { getMerchantChats, getMerchantOrders } from '@/api/orders'
import usePageTitle from '@/hooks/usePageTitle'
import { useAuthStore } from '@/store/authStore'

const CONTACT_META_FULL = {
  whatsapp:  { label: 'واتساب',   icon: MessageCircle, cls: 'text-[#22c55e]',   url: (h, p) => `https://wa.me/${(h || p).replace(/[^0-9]/g, '')}` },
  telegram:  { label: 'تيليجرام', icon: Send,          cls: 'text-[#2D7BE0]',   url: (h) => `https://t.me/${(h || '').replace('@', '')}` },
  instagram: { label: 'انستقرام', icon: InstagramIcon, cls: 'text-[#E1306C]',   url: (h) => `https://www.instagram.com/direct/t/${(h || '').replace('@', '')}` },
  phone:     { label: 'اتصال',    icon: Phone,         cls: 'text-[#18212F]',   url: (h) => `tel:${h}` },
}

function contactMeta(plan) {
  const keys = plan === 'starter' ? ['whatsapp', 'instagram', 'phone'] : ['whatsapp', 'telegram', 'instagram', 'phone']
  return Object.fromEntries(keys.map(k => [k, CONTACT_META_FULL[k]]))
}

function timeAgo(iso) {
  if (!iso) return ''
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1)  return 'الآن'
  if (mins < 60) return `${mins}د`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)  return `${hrs}س`
  const days = Math.floor(hrs / 24)
  return `${days}ي`
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5 animate-pulse border-b border-[#E1DED8]/60">
      <div className="w-12 h-12 rounded-2xl bg-[#ECE8E1] shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 bg-[#ECE8E1] rounded-full w-28" />
        <div className="h-3 bg-[#ECE8E1] rounded-full w-44" />
      </div>
      <div className="h-3 w-8 bg-[#ECE8E1] rounded-full" />
    </div>
  )
}

function ChatRow({ item, plan = 'starter', onClick }) {
  const hasChat      = item._type === 'chat'
  const order        = item.order || item
  const customerName = item.customer?.name || order.deliveryAddress?.name || 'عميل'
  const isDigital    = item.store?.type === 'digital' || order.store?.type === 'digital'
  const contactMethod = order.contactMethod || 'whatsapp'
  const cmMap        = contactMeta(plan)
  const cm           = cmMap[contactMethod] || cmMap.whatsapp
  const cmIcon       = cm.icon

  let preview, TypeIcon, previewIcon
  if (hasChat) {
    const last = item.lastMessage
    if (last?.type === 'image')       { preview = 'صورة'; previewIcon = Image }
    else if (last?.type === 'file')   { preview = 'ملف';  previewIcon = Paperclip }
    else if (last?.content)           { preview = last.content }
    else                              { preview = 'ابدأ المحادثة' }
  } else {
    preview = plan === 'pro'
      ? `رقم: ${order.contactHandle || order.deliveryAddress?.phone || '—'}`
      : `تواصل عبر ${cm.label}`
    previewIcon = null
  }

  const unread     = item.merchantUnread ?? 0
  const rawOrderId = order._id
  const time       = hasChat ? item.lastMessage?.createdAt : order.confirmedAt
  const initials   = customerName.charAt(0)

  return (
    <button
      onClick={onClick}
      className="chat-list-row"
    >
      {/* Avatar */}
      <div className={clsx(
        'chat-list-avatar shrink-0',
        isDigital ? 'from-[#ECE7F8] to-[#DDD8F0] text-[#6750A4]' : 'from-[#F4F7FA] to-[#E7EDF3] text-[#18212F]'
      )}>
        {hasChat ? (
          <span className="text-base font-bold">{initials}</span>
        ) : (
          <cmIcon size={20} />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 text-right">
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className={clsx(
            'font-bold text-sm truncate',
            unread > 0 ? 'text-[#1D2430]' : 'text-[#1D2430]'
          )}>
            {customerName}
          </span>
          <span className="text-[11px] text-[#9298A3] font-en shrink-0 flex items-center gap-1">
            <Clock size={9} />
            {timeAgo(time)}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <p className={clsx(
            'text-xs truncate',
            unread > 0 ? 'text-[#1D2430] font-semibold' : 'text-[#9298A3]'
          )}>
            {previewIcon && <span className="mr-1">{previewIcon({ size: 12, className: 'inline' })}</span>}
            {preview}
          </p>

          <div className="flex items-center gap-1.5 shrink-0">
            {!hasChat && plan !== 'pro' && (
              <a
                href={cm.url(order.contactHandle || order.deliveryAddress?.phone || '', order.deliveryAddress?.phone || '')}
                target="_blank"
                rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                className={clsx('inline-flex items-center gap-1 text-[10px] font-bold hover:underline', cm.cls)}
              >
                <cmIcon size={10} />
                {cm.label}
              </a>
            )}
            <span className="text-[10px] text-[#9298A3] font-en">
              #{String(rawOrderId).slice(-6).toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Unread badge */}
      {unread > 0 && (
        <span className="min-w-[20px] h-5 rounded-full bg-gradient-to-br from-[#C93F2B] to-[#A62F20] text-white text-[10px] font-bold flex items-center justify-center px-1.5 shrink-0 shadow-sm">
          {unread > 9 ? '9+' : unread}
        </span>
      )}

      <ChevronLeft size={14} className="text-[#9298A3] shrink-0 icon-flip" />
    </button>
  )
}

const PLAN_META = {
  starter:  { label: 'المجانية',    cls: 'bg-[#ECE8E1] text-[#5F6673]' },
  pro:      { label: 'الاحترافية',  cls: 'bg-[#F4F7FA] text-[#18212F]' },
  business: { label: 'الأعمال',     cls: 'bg-gradient-to-r from-[#FFF3D6] to-[#FFE4A0] text-[#B7791F]' },
}

export default function ChatListPage() {
  usePageTitle('التسليم والمحادثات')
  const navigate = useNavigate()
  const store    = useAuthStore(s => s.store)
  const plan     = store?.plan || 'starter'
  const planMeta = PLAN_META[plan] || PLAN_META.starter

  const [items,   setItems]   = useState([])
  const [loading, setLoading] = useState(true)
  const [query,   setQuery]   = useState('')
  const [filter,  setFilter]  = useState('all') // 'all' | 'chat' | 'order'

  useEffect(() => {
    setLoading(true)
    if (plan !== 'business') {
      setItems([])
      setLoading(false)
      return
    }

    Promise.all([
      getMerchantChats().then(r => r.data.data ?? []).catch(() => []),
      getMerchantOrders().then(r => r.data.data ?? []).catch(() => []),
    ]).then(([chats, orders]) => {
      const chatItems = chats.map(c => ({ ...c, _type: 'chat' }))

      const deliveryOrders = orders.filter(o =>
        (o.store?.type === 'digital' && o.status === 'confirmed') ||
        (o.store?.type !== 'digital' && o.status === 'shipped')
      )
      const chatOrderIds = new Set(chats.map(c => String(c.order?._id || c.order)))
      const orderItems = deliveryOrders
        .filter(o => !chatOrderIds.has(String(o._id)))
        .map(o => ({ ...o, _type: 'order' }))

      const merged = [
        ...chatItems.sort((a, b) => new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0)),
        ...orderItems.sort((a, b) => new Date(b.confirmedAt || 0) - new Date(a.confirmedAt || 0)),
      ]
      setItems(merged)
    }).finally(() => setLoading(false))
  }, [plan])

  const base = filter === 'chat'  ? items.filter(i => i._type === 'chat')
             : filter === 'order' ? items.filter(i => i._type === 'order')
             : items

  const filtered = query.trim()
    ? base.filter(item => {
        const name = item.customer?.name || item.deliveryAddress?.name || ''
        const id   = String(item.order?._id || item.order || item._id)
        return name.includes(query) || id.includes(query)
      })
    : base

  const chatCount  = items.filter(i => i._type === 'chat').length
  const orderCount = items.filter(i => i._type === 'order').length
  const unreadTotal = items.reduce((s, i) => s + (i.merchantUnread ?? 0), 0)

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#F6F3EE] font-cairo">
      {/* Header */}
      <header className="bg-white border-b border-[#E1DED8] px-4 pt-4 pb-3 shrink-0">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="relative">
            <MessageSquare size={22} className="text-[#18212F]" />
            {unreadTotal > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 rounded-full bg-[#C93F2B] text-white text-[9px] font-bold flex items-center justify-center px-1">
                {unreadTotal > 9 ? '9+' : unreadTotal}
              </span>
            )}
          </div>
          <h1 className="text-lg font-extrabold text-[#1D2430] flex-1">التسليم</h1>
          <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full ${planMeta.cls}`}>
            <Sparkles size={10} />
            {planMeta.label}
          </span>
        </div>

        {/* Filter tabs */}
        {items.length > 0 && (
          <div className="flex items-center gap-2 mb-3">
            {[
              { key: 'all',   label: `الكل (${items.length})` },
              { key: 'chat',  label: `محادثات (${chatCount})`,    show: chatCount > 0 },
              { key: 'order', label: `للتسليم (${orderCount})`,   show: orderCount > 0 },
            ].filter(t => t.key === 'all' || t.show).map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={clsx(
                  'text-xs font-semibold px-3 py-1.5 rounded-xl transition-all duration-150',
                  filter === tab.key
                    ? 'bg-[#18212F] text-white shadow-sm'
                    : 'bg-[#F6F3EE] text-[#5F6673] hover:bg-[#ECE8E1]'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* Search */}
        <div className="relative">
          <Search size={15} className="absolute top-1/2 -translate-y-1/2 right-3 text-[#9298A3] pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="ابحث باسم العميل أو رقم الطلب…"
            className="w-full bg-[#F6F3EE] border border-[#E1DED8] rounded-xl pr-9 pl-3 py-2.5 text-sm text-[#1D2430] placeholder:text-[#9298A3] focus:outline-none focus:border-[#18212F]/40 focus:ring-2 focus:ring-[#18212F]/8 transition-all"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute top-1/2 -translate-y-1/2 left-3 text-[#9298A3] hover:text-[#5F6673]"
            >
              ✕
            </button>
          )}
        </div>
      </header>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-24 px-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#F6F3EE] flex items-center justify-center border border-[#E1DED8]">
              <MessageSquare size={26} className="text-[#9298A3]" />
            </div>
            <div>
              <p className="font-bold text-[#1D2430]">
                {query ? 'لا توجد نتائج' : plan !== 'business' ? 'محادثة التسليم لباقة الأعمال' : 'لا توجد طلبات للتسليم'}
              </p>
              <p className="text-sm text-[#9298A3] mt-1">
                {query ? 'جرّب كلمة بحث مختلفة' : plan !== 'business' ? 'قم بترقية باقتك للاستمتاع بهذه الميزة' : 'عند تأكيد طلب ستظهر هنا'}
              </p>
            </div>
          </div>
        ) : (
          <div>
            {filtered.map(item => (
              <ChatRow
                key={item._type === 'chat' ? `c-${item._id}` : `o-${item._id}`}
                item={item}
                plan={plan}
                onClick={() => {
                  if (item._type === 'chat') navigate(`/dashboard/chat/${item._id}`)
                  else navigate(`/dashboard/chat/order/${item._id}`)
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
