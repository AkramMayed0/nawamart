import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { CheckCircle, MessageSquare, ArrowRight, Loader, Image as ImageIcon } from 'lucide-react'
import clsx from 'clsx'

import { useAuthStore } from '@/store/authStore'
import { useChat }      from '@/hooks/useChat'
import { getOrderById } from '@/api/orders'
import api from '@/api/axios'
import ChatHeader       from '@/components/chat/ChatHeader'
import MessageBubble    from '@/components/chat/MessageBubble'
import ChatInput        from '@/components/chat/ChatInput'
import ImageLightbox from '@/components/chat/ImageLightbox'
import PhotoGallery from '@/components/chat/PhotoGallery'

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

/* ── Order-only view (fallback when no chat can be created) ── */
function OrderDeliveryView({ order, goBack }) {
  const isDigital = order.store?.type === 'digital'
  const customerName = order.deliveryAddress?.name || 'عميل'
  const shortId = String(order._id).slice(-8).toUpperCase()

  return (
    <div className="flex flex-col h-full overflow-hidden bg-bg font-cairo">
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

      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-8">
          <div className="bg-white border border-border rounded-2xl p-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-accent-50 flex items-center justify-center mx-auto mb-4">
              <MessageSquare size={28} className="text-accent-700" />
            </div>
            <h2 className="font-cairo font-bold text-lg text-text mb-1">
              {isDigital ? 'توصيل الطلب الرقمي' : 'توصيل الطلب'}
            </h2>
            <p className="font-cairo text-sm text-text-muted mb-6">
              {isDigital ? 'تواصل مع العميل لتسليم المنتج الرقمي' : 'قم بتسليم الطلب للعميل'}
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
  const hasDeliveryChat = true

  const isOrderMode = !!orderId

  const {
    messages, chatMeta, loading, sending, connected, confirmed,
    typingName, replyTo, setReplyTo,
    sendText, sendFile, confirmReceipt, emitTyping,
  } = useChat(isOrderMode ? null : chatId)

  const [orderData, setOrderData] = useState(null)
  const [orderLoading, setOrderLoading] = useState(false)
  const [initChatLoading, setInitChatLoading] = useState(false)

  // In order mode: load the order, then auto-find/create delivery chat
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
            .then(res => {
              const chat = res.data.data
              navigate(`/dashboard/chat/${chat._id}`, { replace: true })
            })
            .catch(() => setInitChatLoading(false))
        } else {
          setInitChatLoading(false)
        }
      })
      .catch(() => {})
      .finally(() => setOrderLoading(false))
  }, [isOrderMode, orderId, navigate])

  const order = isOrderMode ? orderData : (chatMeta?.order ?? null)
  const storeType = isOrderMode ? order?.store?.type : chatMeta?.store?.type

  const bottomRef = useRef(null)
  const scrollContainerRef = useRef(null)
  const isNearBottomRef = useRef(true)

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

  const goBack = () => navigate(-1)

  // ── Image lightbox ──
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [galleryOpen, setGalleryOpen] = useState(false)

  const allImages = messages.filter(m => m.type === 'image' && !m._optimistic).map(m => m.content)

  const openLightbox = (index) => {
    setLightboxIndex(index)
    setLightboxOpen(true)
  }

  // ── Business plan check ──
  const plan = store?.plan
  const isBusiness = plan === 'business'

  if (!isBusiness && !isOrderMode) {
    return (
      <div className="flex flex-col h-full overflow-hidden bg-bg font-cairo items-center justify-center gap-4 px-8 py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center">
          <MessageSquare size={28} className="text-amber-600" />
        </div>
        <h2 className="font-cairo font-bold text-lg text-text">محادثة التسليم</h2>
        <p className="text-sm text-text-muted leading-relaxed max-w-xs">
          هذه الميزة متاحة فقط لباقة الأعمال. قم بترقية باقتك للتواصل مع العملاء عبر محادثة التسليم.
        </p>
      </div>
    )
  }

  // ── Order-only mode (no chat yet) ──
  if (isOrderMode) {
    if (orderLoading || initChatLoading) {
      return (
        <div className="flex flex-col h-full overflow-hidden bg-bg font-cairo">
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-8 py-16">
            <Loader size={32} className="text-primary animate-spin" />
            <p className="font-semibold text-text">جاري فتح محادثة التسليم...</p>
          </div>
        </div>
      )
    }
    if (!order) {
      return <div className="flex h-full items-center justify-center text-text-muted font-cairo text-sm">لم يتم العثور على الطلب</div>
    }
    return <OrderDeliveryView order={order} goBack={goBack} plan={store?.plan} />
  }

  // ── Chat mode ──

  return (
    <div className="flex flex-col h-full overflow-hidden bg-bg font-cairo">
      <ChatHeader chatMeta={chatMeta} connected={connected} onBack={goBack} typingName={typingName} />

      {order && <OrderInfoBanner order={order} />}

      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto py-4 space-y-1.5 overscroll-contain"
      >
        {loading ? (
          <MessageSkeleton />
        ) : messages.length === 0 ? (
          <EmptyState customerName={chatMeta?.customer?.name} />
        ) : (
          messages.map(msg => (
            <MessageBubble
              key={msg._id}
              msg={msg}
              currentUserId={user?._id}
              onReply={(m) => setReplyTo(replyTo?._id === m._id ? null : m)}
            />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Gallery button */}
      {allImages.length > 0 && (
        <div className="flex items-center justify-end gap-1 px-4 py-1 bg-white border-t border-border">
          <button
            onClick={() => setGalleryOpen(true)}
            className="flex items-center gap-1 text-xs text-text-muted hover:text-primary transition-colors"
          >
            <ImageIcon size={14} />
            <span>{allImages.length} صورة</span>
          </button>
        </div>
      )}

      {isCustomer && (
        <ConfirmBanner onConfirm={confirmReceipt} confirmed={confirmed} />
      )}

      <ChatInput
        onSendText={sendText}
        onSendFile={sendFile}
        sending={sending}
        disabled={confirmed && isCustomer}
        replyTo={replyTo}
        onCancelReply={() => setReplyTo(null)}
        onTyping={emitTyping}
      />

      {/* Image lightbox */}
      {lightboxOpen && (
        <ImageLightbox
          images={allImages}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}

      {/* Photo gallery */}
      {galleryOpen && (
        <PhotoGallery
          images={allImages}
          onSelect={(i) => { setGalleryOpen(false); openLightbox(i) }}
          onClose={() => setGalleryOpen(false)}
        />
      )}
    </div>
  )
}
