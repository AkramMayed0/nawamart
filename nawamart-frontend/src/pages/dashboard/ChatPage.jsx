import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { CheckCircle, MessageSquare, ArrowRight, Loader, Image as ImageIcon, Package, Sparkles } from 'lucide-react'
import clsx from 'clsx'

import { useAuthStore } from '@/store/authStore'
import { useChat }      from '@/hooks/useChat'
import { getOrderById } from '@/api/orders'
import api from '@/api/axios'
import ChatHeader       from '@/components/chat/ChatHeader'
import MessageBubble    from '@/components/chat/MessageBubble'
import ChatInput        from '@/components/chat/ChatInput'
import ImageLightbox    from '@/components/chat/ImageLightbox'
import PhotoGallery     from '@/components/chat/PhotoGallery'
import ProductPicker    from '@/components/chat/ProductPicker'

/* ── Loading skeleton ── */
function MessageSkeleton() {
  return (
    <div className="flex flex-col gap-4 px-4 py-4 animate-pulse">
      {[false, true, false, false, true].map((mine, i) => (
        <div key={i} className={clsx('flex items-end gap-2', mine ? 'flex-row-reverse' : 'flex-row')}>
          {!mine && <div className="w-6 h-6 rounded-full bg-[#ECE8E1] shrink-0" />}
          <div className={clsx(
            'h-10 rounded-2xl',
            mine ? 'bg-[#18212F]/15 w-48' : 'bg-[#ECE8E1] w-36',
            i === 1 && 'w-64',
            i === 4 && 'h-16'
          )} />
        </div>
      ))}
    </div>
  )
}

/* ── Empty state ── */
function EmptyState({ customerName }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-8 py-16">
      <div className="relative">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#F4F7FA] to-[#E7EDF3] flex items-center justify-center shadow-inner">
          <MessageSquare size={32} className="text-[#18212F]/40" />
        </div>
        <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-xl bg-gradient-to-br from-[#C93F2B] to-[#A62F20] flex items-center justify-center">
          <Sparkles size={13} className="text-white" />
        </div>
      </div>
      <div>
        <p className="font-bold text-base text-[#1D2430]">ابدأ المحادثة</p>
        <p className="text-sm text-[#5F6673] leading-relaxed mt-1 max-w-[220px]">
          {customerName ? `راسل ${customerName} بخصوص هذا الطلب` : 'لا توجد رسائل بعد. ابدأ الآن!'}
        </p>
      </div>
    </div>
  )
}

/* ── Receipt confirm banner ── */
function ConfirmBanner({ onConfirm, confirmed }) {
  if (confirmed) {
    return (
      <div className="flex items-center justify-center gap-2 bg-[#DFF5E7] text-[#1E8C4D] px-4 py-3 text-sm font-semibold shrink-0 border-t border-[#27AE60]/20">
        <CheckCircle size={16} />
        <span>✓ تم تأكيد استلام الطلب</span>
      </div>
    )
  }
  return (
    <div className="flex items-center justify-between gap-3 bg-gradient-to-r from-[#FFF4F1] to-[#FFE4DD] border-t border-[#C93F2B]/20 px-4 py-3 shrink-0">
      <div className="flex items-center gap-2">
        <Package size={16} className="text-[#C93F2B] shrink-0" />
        <p className="text-sm text-[#5F6673]">هل استلمت طلبك؟</p>
      </div>
      <button
        onClick={onConfirm}
        className="shrink-0 bg-gradient-to-r from-[#C93F2B] to-[#A62F20] text-white text-sm font-bold px-4 py-2 rounded-xl hover:opacity-90 active:scale-95 transition-all shadow-sm"
      >
        تأكيد الاستلام
      </button>
    </div>
  )
}

/* ── Order info ribbon ── */
function OrderInfoBanner({ order }) {
  if (!order) return null
  const total   = (order.totalAmount ?? 0).toLocaleString('en-US')
  const shortId = String(order._id).slice(-8).toUpperCase()

  const statusConfig = {
    confirmed: { label: 'مؤكد',        cls: 'bg-[#DFF5E7] text-[#1E8C4D]' },
    shipped:   { label: 'تم الشحن',    cls: 'bg-[#DCE9FA] text-[#2D7BE0]' },
    delivered: { label: 'تم التسليم',  cls: 'bg-[#DFF5E7] text-[#1E8C4D]' },
  }
  const sc = statusConfig[order.status] || { label: order.status, cls: 'bg-[#ECE8E1] text-[#5F6673]' }

  return (
    <div className="flex items-center justify-between gap-2 bg-white/80 backdrop-blur-sm border-b border-[#E1DED8] px-4 py-2 shrink-0">
      <div className="flex items-center gap-2 text-xs text-[#5F6673]">
        <span className="font-bold text-[#18212F] font-en">#{shortId}</span>
        <span className="text-[#E1DED8]">|</span>
        <span className="font-en font-semibold text-[#1D2430]">{total}</span>
        <span>ر.ي</span>
      </div>
      <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full ${sc.cls}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-current" />
        {sc.label}
      </span>
    </div>
  )
}

/* ── Date separator ── */
function DateSeparator({ date }) {
  const d = new Date(date)
  const now = new Date()
  const isToday = d.toDateString() === now.toDateString()
  const isYesterday = d.toDateString() === new Date(now - 86400000).toDateString()
  const label = isToday ? 'اليوم' : isYesterday ? 'أمس' : d.toLocaleDateString('ar-YE', { day: 'numeric', month: 'long' })
  return (
    <div className="flex items-center gap-3 px-4 py-2">
      <div className="flex-1 h-px bg-[#E1DED8]" />
      <span className="text-[10px] font-semibold text-[#9298A3] bg-[#F6F3EE] px-3 py-1 rounded-full border border-[#E1DED8]">
        {label}
      </span>
      <div className="flex-1 h-px bg-[#E1DED8]" />
    </div>
  )
}

/* ── Group messages by date ── */
function groupMessagesByDate(messages) {
  const groups = []
  let lastDate = null
  for (const msg of messages) {
    const d = msg.createdAt ? new Date(msg.createdAt).toDateString() : null
    if (d && d !== lastDate) {
      groups.push({ type: 'date', date: msg.createdAt, id: `date-${msg.createdAt}` })
      lastDate = d
    }
    groups.push({ type: 'message', msg, id: msg._id })
  }
  return groups
}

/* ── Order-only fallback view ── */
function OrderDeliveryView({ order, goBack }) {
  const isDigital  = order.store?.type === 'digital'
  const customerName = order.deliveryAddress?.name || 'عميل'
  const shortId    = String(order._id).slice(-8).toUpperCase()

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#F6F3EE] font-cairo">
      <header className="flex items-center gap-3 bg-white border-b border-[#E1DED8] px-4 py-3 shrink-0">
        <button onClick={goBack} className="chat-header-btn" aria-label="رجوع">
          <ArrowRight size={20} className="icon-flip" />
        </button>
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#F4F7FA] to-[#E7EDF3] flex items-center justify-center shrink-0">
          <span className="text-sm font-bold text-[#18212F]">{customerName.charAt(0)}</span>
        </div>
        <div className="flex-1 min-w-0">
          <span className="font-bold text-sm text-[#1D2430] block">{customerName}</span>
          <span className="text-xs text-[#9298A3] font-en">#{shortId}</span>
        </div>
      </header>

      <OrderInfoBanner order={order} />

      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-8">
          <div className="bg-white border border-[#E1DED8] rounded-2xl p-6 text-center shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#F4F7FA] to-[#E7EDF3] flex items-center justify-center mx-auto mb-4">
              <MessageSquare size={28} className="text-[#18212F]/50" />
            </div>
            <h2 className="font-bold text-lg text-[#1D2430] mb-1">
              {isDigital ? 'توصيل الطلب الرقمي' : 'توصيل الطلب'}
            </h2>
            <p className="text-sm text-[#5F6673] mb-6">
              {isDigital ? 'تواصل مع العميل لتسليم المنتج الرقمي' : 'قم بتسليم الطلب للعميل'}
            </p>
            <div className="bg-[#F6F3EE] rounded-xl p-4 space-y-3 text-right">
              <div className="flex justify-between text-sm">
                <span className="text-[#5F6673]">العميل</span>
                <span className="font-bold text-[#1D2430]">{customerName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#5F6673]">الجوال</span>
                <span className="font-bold text-[#1D2430] font-en" dir="ltr">{order.deliveryAddress?.phone || '—'}</span>
              </div>
              {!isDigital && (
                <div className="flex justify-between text-sm">
                  <span className="text-[#5F6673]">المدينة</span>
                  <span className="font-bold text-[#1D2430]">{order.deliveryAddress?.city || '—'}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   Main ChatPage
══════════════════════════════════════════════════════════════ */
export default function ChatPage() {
  const { chatId, orderId } = useParams()
  const navigate   = useNavigate()
  const user       = useAuthStore(s => s.user)
  const store      = useAuthStore(s => s.store)
  const isCustomer = user?.role === 'customer'
  const isOrderMode = !!orderId

  const {
    messages, chatMeta, loading, sending, connected, confirmed,
    typingName, replyTo, setReplyTo,
    sendText, sendFile, sendProductCard, confirmReceipt, emitTyping,
  } = useChat(isOrderMode ? null : chatId)

  const [orderData,       setOrderData]       = useState(null)
  const [orderLoading,    setOrderLoading]    = useState(false)
  const [initChatLoading, setInitChatLoading] = useState(false)
  const [pickerOpen,      setPickerOpen]      = useState(false)


  /* Order mode: load → redirect to chat */
  useEffect(() => {
    if (!isOrderMode || !orderId) return
    setOrderLoading(true)
    getOrderById(orderId)
      .then(r => {
        const order = r.data.data
        setOrderData(order)
        if (order.chatId) {
          navigate(`/dashboard/chat/${order.chatId}`, { replace: true })
          return
        }
        if (['confirmed', 'shipped'].includes(order.status)) {
          setInitChatLoading(true)
          api.post('/chats/init-delivery', { orderId })
            .then(res => navigate(`/dashboard/chat/${res.data.data._id}`, { replace: true }))
            .catch(() => setInitChatLoading(false))
        } else {
          setInitChatLoading(false)
        }
      })
      .catch(() => {})
      .finally(() => setOrderLoading(false))
  }, [isOrderMode, orderId, navigate])

  const order     = isOrderMode ? orderData : (chatMeta?.order ?? null)

  /* Scroll management */
  const bottomRef          = useRef(null)
  const scrollContainerRef = useRef(null)
  const isNearBottomRef    = useRef(true)

  const isNearBottom = useCallback(() => {
    const el = scrollContainerRef.current
    if (!el) return true
    return el.scrollHeight - el.scrollTop - el.clientHeight < 120
  }, [])

  const handleScroll = useCallback(() => {
    isNearBottomRef.current = isNearBottom()
  }, [isNearBottom])

  useEffect(() => {
    if (isNearBottomRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  /* Auto-scroll on first load */
  useEffect(() => {
    if (!loading && messages.length > 0) {
      setTimeout(() => bottomRef.current?.scrollIntoView(), 60)
    }
  }, [loading])

  const goBack = () => navigate(-1)

  /* Lightbox / gallery */
  const [lightboxOpen,  setLightboxOpen]  = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [galleryOpen,   setGalleryOpen]   = useState(false)

  const allImages = messages.filter(m => m.type === 'image' && !m._optimistic).map(m => m.content)

  const openLightbox = (index) => { setLightboxIndex(index); setLightboxOpen(true) }

  /* Grouped items for rendering */
  const grouped = groupMessagesByDate(messages)

  /* Image index lookup */
  const imageIndexOf = (msg) => allImages.indexOf(msg.content)

  /* Plan guard */
  const plan       = store?.plan
  const isBusiness = plan === 'business'

  if (!isBusiness && !isOrderMode) {
    return (
      <div className="flex flex-col h-full overflow-hidden bg-[#F6F3EE] font-cairo items-center justify-center gap-4 px-8 py-16 text-center">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#FFF4F1] to-[#FFE4DD] flex items-center justify-center">
          <MessageSquare size={32} className="text-[#C93F2B]/60" />
        </div>
        <div>
          <h2 className="font-bold text-lg text-[#1D2430]">محادثة التسليم</h2>
          <p className="text-sm text-[#5F6673] leading-relaxed mt-1 max-w-xs">
            هذه الميزة متاحة فقط لباقة الأعمال. قم بترقية باقتك للتواصل مع العملاء.
          </p>
        </div>
      </div>
    )
  }

  /* Order loading */
  if (isOrderMode) {
    if (orderLoading || initChatLoading) {
      return (
        <div className="flex flex-col h-full overflow-hidden bg-[#F6F3EE] font-cairo items-center justify-center gap-3">
          <div className="w-12 h-12 border-3 border-[#18212F]/10 border-t-[#18212F] rounded-full animate-spin" />
          <p className="font-semibold text-[#1D2430]">جاري فتح محادثة التسليم…</p>
        </div>
      )
    }
    if (!order) {
      return <div className="flex h-full items-center justify-center text-[#5F6673] font-cairo text-sm">لم يتم العثور على الطلب</div>
    }
    return <OrderDeliveryView order={order} goBack={goBack} />
  }

  /* ── Chat view ── */
  return (
    <div className="flex flex-col h-full overflow-hidden chat-page-bg font-cairo">
      {/* Header */}
      <ChatHeader
        chatMeta={chatMeta}
        connected={connected}
        onBack={goBack}
        typingName={typingName}
        imageCount={allImages.length}
        onGallery={() => setGalleryOpen(true)}
      />

      {/* Order ribbon */}
      {order && <OrderInfoBanner order={order} />}

      {/* Messages area */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto py-2 space-y-1 overscroll-contain chat-messages-bg"
      >
        {loading ? (
          <MessageSkeleton />
        ) : messages.length === 0 ? (
          <EmptyState customerName={chatMeta?.customer?.name} />
        ) : (
          grouped.map((item, idx) => {
            if (item.type === 'date') {
              return <DateSeparator key={item.id} date={item.date} />
            }
            const { msg } = item
            const imgIdx = msg.type === 'image' ? imageIndexOf(msg) : -1
            return (
              <MessageBubble
                key={msg._id}
                msg={msg}
                currentUserId={user?._id}
                index={idx}
                onReply={(m) => setReplyTo(replyTo?._id === m._id ? null : m)}
                onImageClick={imgIdx >= 0 ? () => openLightbox(imgIdx) : undefined}
              />
            )
          })
        )}
        <div ref={bottomRef} className="h-2" />
      </div>

      {/* Receipt confirm banner (customer) */}
      {isCustomer && (
        <ConfirmBanner onConfirm={confirmReceipt} confirmed={confirmed} />
      )}

      {/* Input */}
      <ChatInput
        onSendText={sendText}
        onSendFile={sendFile}
        onSendProductCard={!isCustomer ? () => setPickerOpen(true) : undefined}
        sending={sending}
        disabled={confirmed && isCustomer}
        replyTo={replyTo}
        onCancelReply={() => setReplyTo(null)}
        onTyping={emitTyping}
      />

      {/* Lightbox */}
      {lightboxOpen && (
        <ImageLightbox
          images={allImages}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}

      {/* Gallery */}
      {galleryOpen && (
        <PhotoGallery
          images={allImages}
          onSelect={(i) => { setGalleryOpen(false); openLightbox(i) }}
          onClose={() => setGalleryOpen(false)}
        />
      )}

      {/* Product Picker */}
      {pickerOpen && (
        <ProductPicker
          onClose={() => setPickerOpen(false)}
          onSelect={(productId) => {
            setPickerOpen(false)
            sendProductCard(productId)
          }}
        />
      )}
    </div>
  )
}
