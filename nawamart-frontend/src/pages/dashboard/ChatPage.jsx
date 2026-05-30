import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { CheckCircle, MessageSquare, MessageCircle, Send, Instagram, Phone, ChevronDown, ChevronUp, ArrowRight, Truck } from 'lucide-react'
import clsx from 'clsx'

import { useAuthStore } from '@/store/authStore'
import { useChat }      from '@/hooks/useChat'
import { getOrderById } from '@/api/orders'
import ChatHeader       from '@/components/chat/ChatHeader'
import MessageBubble    from '@/components/chat/MessageBubble'
import ChatInput        from '@/components/chat/ChatInput'

const METHOD_META_FULL = {
  whatsapp:  { label: 'واتساب',  icon: MessageCircle, cls: 'bg-green-500 hover:bg-green-600',     url: (h, p) => `https://wa.me/${(h || p).replace(/[^0-9]/g, '')}` },
  telegram:  { label: 'تيليجرام', icon: Send,         cls: 'bg-sky-500 hover:bg-sky-600',         url: (h) => `https://t.me/${(h || '').replace('@', '')}` },
  instagram: { label: 'انستقرام', icon: Instagram,    cls: 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600', url: (h) => `https://www.instagram.com/direct/t/${(h || '').replace('@', '')}` },
  phone:     { label: 'اتصال',    icon: Phone,        cls: 'bg-primary hover:bg-primary-700',      url: (h) => `tel:${h}` },
}

function filterMethodMeta(plan) {
  const keys = plan === 'starter' ? ['whatsapp', 'instagram', 'phone'] : ['whatsapp', 'telegram', 'instagram', 'phone']
  return Object.fromEntries(keys.map(k => [k, METHOD_META_FULL[k]]))
}

function MessageSkeleton() {
  return (
    <div className="flex flex-col gap-3 px-4 py-3 animate-pulse">
      {[true, false, true, false, false].map((mine, i) => (
        <div key={i} className={clsx('flex', mine ? 'justify-end' : 'justify-start')}>
          <div className={clsx('h-9 rounded-2xl', mine ? 'bg-primary/20 w-48' : 'bg-bg-soft w-40')} />
        </div>
      ))}
    </div>
  )
}

function EmptyState({ customerName }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-8 py-16">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
        <MessageSquare size={28} className="text-primary" />
      </div>
      <p className="font-semibold text-text">ابدأ المحادثة</p>
      <p className="text-sm text-text-muted leading-relaxed">
        {customerName ? `راسل ${customerName} بخصوص هذا الطلب` : 'لا توجد رسائل بعد. ابدأ المحادثة الآن.'}
      </p>
    </div>
  )
}

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
      <button onClick={onConfirm} className="shrink-0 bg-primary text-white text-sm font-semibold px-4 py-1.5 rounded-lg hover:bg-primary-700 active:scale-95 transition-all">
        تأكيد الاستلام
      </button>
    </div>
  )
}

function ContactInfoPanel({ order, storeType, plan = 'starter' }) {
  const [open, setOpen] = useState(true)
  if (!order) return null

  const isDigital = storeType === 'digital'
  const method = order.contactMethod || 'whatsapp'
  const mm = filterMethodMeta(plan)
  const meta = mm[method] || mm.whatsapp
  const Icon = meta.icon
  const customerPhone = order.deliveryAddress?.phone || ''
  const handle = order.contactHandle || customerPhone
  const contactUrl = meta.url(handle, customerPhone)

  return (
    <div className="border-b border-border bg-white">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full px-4 py-3 text-sm font-cairo font-bold text-text hover:bg-bg/50 transition-colors"
      >
        <span className="flex items-center gap-2">
          {isDigital ? <Icon size={16} className="text-accent-700" /> : <Phone size={15} className="text-primary" />}
          {isDigital ? `توصيل عبر ${meta.label}` : 'بيانات العميل'}
        </span>
        {open ? <ChevronUp size={16} className="text-text-muted" /> : <ChevronDown size={16} className="text-text-muted" />}
      </button>

      {open && (
        <div className="px-4 pb-4 flex flex-col gap-2.5 text-sm font-cairo">
          <div className="flex justify-between">
            <span className="text-text-muted">العميل</span>
            <span className="font-semibold text-text">{order.deliveryAddress?.name || '—'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-muted">الجوال</span>
            <span className="font-inter font-semibold text-text dk-num" dir="ltr">{customerPhone}</span>
          </div>
          {isDigital && (
            <div className="flex justify-between">
              <span className="text-text-muted">طريقة التسليم</span>
              <span className="font-semibold text-text flex items-center gap-1">
                <Icon size={14} />
                {meta.label}
              </span>
            </div>
          )}
          {!isDigital && (
            <div className="flex justify-between">
              <span className="text-text-muted">المدينة</span>
              <span className="font-semibold text-text">{order.deliveryAddress?.city || '—'}</span>
            </div>
          )}

          {plan === 'pro' ? (
            <div className="mt-1 flex items-center justify-center gap-2 rounded-xl py-3 border border-border bg-bg text-text-muted text-sm font-cairo">
              <Icon size={16} className="text-text-muted" />
              {handle || customerPhone || '—'}
            </div>
          ) : contactUrl && (
            <a
              href={contactUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`mt-1 flex items-center justify-center gap-2 rounded-xl py-3 font-bold text-sm text-white transition-all active:scale-[0.97] ${meta.cls}`}
            >
              <Icon size={18} />
              {isDigital ? `مراسلة عبر ${meta.label}` : 'مراسلة واتساب'}
            </a>
          )}
        </div>
      )}
    </div>
  )
}

function OrderInfoBanner({ order }) {
  if (!order) return null
  const total = (order.totalAmount ?? 0).toLocaleString('en-US')
  const shortId = String(order._id).slice(-8).toUpperCase()

  return (
    <div className="flex items-center justify-between gap-2 bg-white border-b border-border px-4 py-2 shrink-0">
      <div className="flex items-center gap-2 text-xs font-cairo text-text-muted">
        <span className="font-en font-bold text-primary">#{shortId}</span>
        <span>|</span>
        <span>{total} ر.ي</span>
      </div>
      <span className={`inline-flex items-center gap-1 text-[11px] font-semibold font-cairo px-2 py-0.5 rounded-pill ${
        order.status === 'confirmed' ? 'bg-success-100 text-success' :
        order.status === 'shipped' ? 'bg-info-100 text-info' :
        order.status === 'delivered' ? 'bg-green-100 text-success-dark' :
        'bg-warning-100 text-yellow-700'
      }`}>
        <span className="w-1.5 h-1.5 rounded-full bg-current" />
        {order.status === 'confirmed' ? 'مؤكد' :
         order.status === 'shipped' ? 'تم الشحن' :
         order.status === 'delivered' ? 'تم التسليم' :
         order.status}
      </span>
    </div>
  )
}

/* ── Order-only view (no chat, just contact info) ───────────── */
function OrderDeliveryView({ order, goBack, hasMergedChat, plan = 'starter' }) {
  const isDigital = order.store?.type === 'digital'
  const customerName = order.deliveryAddress?.name || 'عميل'
  const shortId = String(order._id).slice(-8).toUpperCase()

  return (
    <div className="flex flex-col h-full overflow-hidden bg-bg font-cairo">
      {/* Header */}
      <header className="flex items-center gap-3 bg-white border-b border-border px-4 py-3 shrink-0">
        <button onClick={goBack} className="p-1.5 rounded-full hover:bg-bg-soft transition-colors text-text-muted" aria-label="رجوع">
          <ArrowRight size={20} className="icon-flip" />
        </button>
        <div className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
          <span className="text-sm font-bold text-accent-700">{customerName.charAt(0)}</span>
        </div>
        <div className="flex-1 min-w-0">
          <span className="font-semibold text-sm text-text truncate block">{customerName}</span>
          <span className="text-xs text-text-muted font-en">#{shortId}</span>
        </div>
      </header>

      <OrderInfoBanner order={order} />

      {/* Contact info — full screen */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-8">
          <div className="bg-white border border-border rounded-2xl p-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-accent-50 flex items-center justify-center mx-auto mb-4">
              {isDigital ? <MessageCircle size={28} className="text-accent-700" /> : <Truck size={28} className="text-primary" />}
            </div>
            <h2 className="font-cairo font-bold text-lg text-text mb-1">
              {isDigital ? 'توصيل الطلب الرقمي' : 'توصيل الطلب'}
            </h2>
            <p className="font-cairo text-sm text-text-muted mb-6">
              {isDigital
                ? 'تواصل مع العميل لتسليم المنتج الرقمي'
                : 'قم بتسليم الطلب للعميل'}
            </p>

            <div className="bg-bg rounded-xl p-4 mb-6 space-y-3 text-right">
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">العميل</span>
                <span className="font-semibold text-text">{customerName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">الجوال</span>
                <span className="font-inter font-semibold text-text dk-num" dir="ltr">{order.deliveryAddress?.phone || '—'}</span>
              </div>
              {!isDigital && (
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">المدينة</span>
                  <span className="font-semibold text-text">{order.deliveryAddress?.city || '—'}</span>
                </div>
              )}
            </div>

            {/* Contact button — Pro users see read-only info */}
            {isDigital && (() => {
              const method = order.contactMethod || 'whatsapp'
              const mm = filterMethodMeta(plan)
              const meta = mm[method] || mm.whatsapp
              const Icon = meta.icon
              const handle = order.contactHandle || order.deliveryAddress?.phone || ''
              const contactUrl = meta.url(handle, order.deliveryAddress?.phone || '')
              if (plan === 'pro') {
                return (
                  <div className="w-full rounded-xl py-3.5 px-4 bg-bg border border-border text-right">
                    <p className="font-cairo text-xs text-text-muted mb-1">بيانات التواصل</p>
                    <div className="flex items-center gap-2">
                      <Icon size={18} className="text-text-muted" />
                      <span className="font-cairo font-bold text-sm text-text" dir="ltr">{handle || '—'}</span>
                    </div>
                    <p className="font-cairo text-xs text-text-muted mt-2">متوفر في باقة Business — تواصل خارجي + محادثة مدمجة</p>
                  </div>
                )
              }
              return (
                <a
                  href={contactUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center justify-center gap-2 w-full rounded-xl py-3.5 font-bold text-sm text-white transition-all active:scale-[0.97] ${meta.cls}`}
                >
                  <Icon size={20} />
                  مراسلة عبر {meta.label}
                </a>
              )
            })()}

            {/* Plan upgrade banner — only for non-Business */}
            {!hasMergedChat && (
              <div className="mt-4 bg-accent-50 border border-accent-200 rounded-xl p-4 text-right">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-white shrink-0 mt-0.5">
                    <MessageSquare size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-cairo font-bold text-sm text-accent-800">المحادثة المدمجة</p>
                    <p className="font-cairo text-xs text-accent-700/70 mt-0.5">
                      خاص بباقة Business — محادثة داخل التطبيق مع العميل
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
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Main ChatPage ──────────────────────────────────────────── */
export default function ChatPage() {
  const { chatId, orderId } = useParams()
  const navigate = useNavigate()
  const user = useAuthStore(s => s.user)
  const store = useAuthStore(s => s.store)
  const isCustomer = user?.role === 'customer'
  const hasMergedChat = store?.plan === 'business'

  const isOrderMode = !!orderId

  const {
    messages, chatMeta, loading, sending, connected, confirmed,
    sendText, sendFile, confirmReceipt,
  } = useChat(isOrderMode ? null : chatId)

  const [orderData, setOrderData] = useState(null)
  const [orderLoading, setOrderLoading] = useState(false)

  // In order mode: load the order directly
  useEffect(() => {
    if (!isOrderMode || !orderId) return
    setOrderLoading(true)
    getOrderById(orderId)
      .then(r => setOrderData(r.data.data))
      .catch(() => {})
      .finally(() => setOrderLoading(false))
  }, [isOrderMode, orderId])

  const order = isOrderMode ? orderData : (chatMeta?.order ?? null)
  const storeType = isOrderMode ? order?.store?.type : chatMeta?.store?.type

  const bottomRef = useRef(null)
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const goBack = () => navigate(-1)

  // ── Order-only mode (no chat) ──
  if (isOrderMode) {
    if (orderLoading) {
      return (
        <div className="flex flex-col h-full overflow-hidden bg-bg font-cairo">
          <div className="animate-pulse flex flex-col gap-3 p-4"><div className="h-10 bg-bg-soft rounded-xl" /><div className="h-48 bg-bg-soft rounded-xl" /><div className="h-32 bg-bg-soft rounded-xl" /></div>
        </div>
      )
    }
    if (!order) {
      return <div className="flex h-full items-center justify-center text-text-muted font-cairo text-sm">لم يتم العثور على الطلب</div>
    }
    return <OrderDeliveryView order={order} goBack={goBack} hasMergedChat={hasMergedChat} plan={store?.plan} />
  }

  // ── Chat mode (Business plan only — non-Business see contact-only view) ──
  if (!hasMergedChat) {
    if (loading) {
      return (
        <div className="flex flex-col h-full overflow-hidden bg-bg font-cairo">
          <div className="animate-pulse flex flex-col gap-3 p-4"><div className="h-10 bg-bg-soft rounded-xl" /><div className="h-48 bg-bg-soft rounded-xl" /><div className="h-32 bg-bg-soft rounded-xl" /></div>
        </div>
      )
    }
    if (!order) {
      return <div className="flex h-full items-center justify-center text-text-muted font-cairo text-sm">لم يتم العثور على الطلب</div>
    }
    return <OrderDeliveryView order={order} goBack={goBack} hasMergedChat={hasMergedChat} plan={store?.plan} />
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-bg font-cairo">
      <ChatHeader chatMeta={chatMeta} connected={connected} onBack={goBack} />

      {order && <OrderInfoBanner order={order} />}

      {order && <ContactInfoPanel order={order} storeType={storeType} plan={store?.plan} />}

      <div className="flex-1 overflow-y-auto py-4 space-y-1.5 overscroll-contain">
        {loading ? (
          <MessageSkeleton />
        ) : messages.length === 0 ? (
          <EmptyState customerName={chatMeta?.customer?.name} />
        ) : (
          messages.map(msg => (
            <MessageBubble key={msg._id} msg={msg} currentUserId={user?._id} />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {isCustomer && (
        <ConfirmBanner onConfirm={confirmReceipt} confirmed={confirmed} />
      )}

      <ChatInput onSendText={sendText} onSendFile={sendFile} sending={sending} disabled={confirmed && isCustomer} />
    </div>
  )
}
