import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowRight, MessageSquare, CheckCircle, Loader, Image as ImageIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import { io } from 'socket.io-client'
import customerApi from '@/api/customerAxios'
import { useCustomerAuthStore } from '@/store/customerAuthStore'
import MessageBubble from '@/components/chat/MessageBubble'
import ChatInput from '@/components/chat/ChatInput'
import ImageLightbox from '@/components/chat/ImageLightbox'
import PhotoGallery from '@/components/chat/PhotoGallery'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'

function playNewMsgSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.value = 800
    osc.type = 'sine'
    gain.gain.setValueAtTime(0.15, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.15)
  } catch {}
}

export default function CustomerChatPage() {
  const { slug, chatId } = useParams()
  const user = useCustomerAuthStore(s => s.user)
  const token = useCustomerAuthStore(s => s.token)

  const [messages, setMessages] = useState([])
  const [chatMeta, setChatMeta] = useState(null)
  const [loading, setLoading] = useState(true)
  const [planUpgradeNeeded, setPlanUpgradeNeeded] = useState(false)
  const [sending, setSending] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [connected, setConnected] = useState(false)
  const [typingName, setTypingName] = useState(null)
  const [replyTo, setReplyTo] = useState(null)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [galleryOpen, setGalleryOpen] = useState(false)

  const socketRef = useRef(null)
  const bottomRef = useRef(null)
  const scrollContainerRef = useRef(null)
  const isNearBottomRef = useRef(true)
  const typingTimerRef = useRef(null)
  const isTypingRef = useRef(false)
  const prevMsgCountRef = useRef(0)

  // ── Scroll auto-scroll control ──
  const isNearBottom = useCallback(() => {
    const el = scrollContainerRef.current
    if (!el) return true
    return el.scrollHeight - el.scrollTop - el.clientHeight < 120
  }, [])

  const scrollToBottom = useCallback((smooth = true) => {
    bottomRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'instant' })
  }, [])

  const handleScroll = useCallback(() => {
    isNearBottomRef.current = isNearBottom()
  }, [isNearBottom])

  // ── Load chat history ──
  useEffect(() => {
    if (!chatId) return
    setLoading(true)
    customerApi.get(`/chats/${chatId}`)
      .then(res => {
        const chat = res.data.data
        if (chat.store?.plan && chat.store.plan !== 'business') {
          setPlanUpgradeNeeded(true)
          setLoading(false)
          return
        }
        setMessages(chat?.messages ?? [])
        setChatMeta(chat ?? null)
        setConfirmed(chat?.receiptConfirmed ?? false)
        prevMsgCountRef.current = chat?.messages?.length ?? 0
        customerApi.post(`/chats/${chatId}/read`).catch(() => {})
      })
      .catch(() => toast.error('تعذّر تحميل المحادثة'))
      .finally(() => setLoading(false))
  }, [chatId])

  // ── Socket.io setup ──
  useEffect(() => {
    if (!chatId || !token) return

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1500,
    })
    socketRef.current = socket

    socket.on('connect', () => {
      setConnected(true)
      socket.emit('joinRoom', chatId)
      socket.emit('requestMissing', { chatId })
    })

    socket.on('disconnect', () => setConnected(false))

    socket.on('receiveMessage', (msg) => {
      setMessages(prev => {
        if (prev.some(m => m._id === msg._id)) return prev
        const isIncoming = msg.sender !== user?._id
        if (isIncoming && prevMsgCountRef.current > 0) {
          playNewMsgSound()
        }
        prevMsgCountRef.current = prev.length + 1
        return [...prev, msg]
      })
      socket.emit('messageDelivered', { chatId, messageId: msg._id })
      customerApi.post(`/chats/${chatId}/read`).catch(() => {})
    })

    socket.on('receiptConfirmed', () => {
      setConfirmed(true)
      toast.success('تم تأكيد الاستلام')
    })

    socket.on('userTyping', ({ name }) => setTypingName(name))
    socket.on('userStopTyping', () => setTypingName(null))

    socket.on('messagesRead', ({ userId }) => {
      setMessages(prev => prev.map(m => {
        if (m.sender === user?._id && m.sender.toString() !== userId && !m.readAt) {
          return { ...m, readAt: new Date().toISOString(), delivered: true, isRead: true }
        }
        if (m.sender === user?._id && !m.delivered) {
          return { ...m, delivered: true }
        }
        return m
      }))
    })

    socket.on('messageStatusUpdate', ({ messageId, status }) => {
      setMessages(prev => prev.map(m => {
        if (m._id === messageId) {
          if (status === 'delivered') return { ...m, delivered: true }
          if (status === 'read') return { ...m, readAt: new Date().toISOString(), isRead: true, delivered: true }
        }
        return m
      }))
    })

    return () => {
      socket.emit('leaveRoom', chatId)
      socket.disconnect()
      socketRef.current = null
    }
  }, [chatId, token, user?._id])

  // ── Scroll on new messages ──
  useEffect(() => {
    if (isNearBottomRef.current) {
      scrollToBottom(true)
    }
  }, [messages, scrollToBottom])

  // ── Typing ──
  const emitTyping = useCallback(() => {
    const socket = socketRef.current
    if (!socket || !chatId) return
    const name = user?.name || 'عميل'

    if (!isTypingRef.current) {
      isTypingRef.current = true
      socket.emit('typing', { chatId, name })
    }
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current)
    typingTimerRef.current = setTimeout(() => {
      isTypingRef.current = false
      socket.emit('stopTyping', { chatId })
    }, 2000)
  }, [chatId, user])

  // ── Send text ──
  const sendText = useCallback(async (text, replyToData = null) => {
    if (!text?.trim() || sending) return
    setSending(true)

    const socket = socketRef.current
    if (socket && chatId) {
      if (isTypingRef.current) {
        isTypingRef.current = false
        socket.emit('stopTyping', { chatId })
      }
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current)
    }

    const optimistic = {
      _id: `opt-${Date.now()}`,
      sender: user?._id,
      senderRole: 'customer',
      type: 'text',
      content: text.trim(),
      createdAt: new Date().toISOString(),
      _optimistic: true,
      delivered: false,
    }
    if (replyToData) {
      optimistic.replyTo = replyToData._id
      optimistic.replyContent = replyToData.type === 'text' ? replyToData.content : null
      optimistic.replyType = replyToData.type
    }
    setMessages(prev => [...prev, optimistic])

    try {
      const payload = { type: 'text', content: text.trim() }
      if (replyToData) {
        payload.replyTo = replyToData._id
        payload.replyContent = replyToData.type === 'text' ? replyToData.content : null
        payload.replyType = replyToData.type
      }
      await customerApi.post(`/chats/${chatId}/message`, payload)
    } catch {
      toast.error('فشل إرسال الرسالة')
      setMessages(prev => prev.filter(m => m._id !== optimistic._id))
    } finally {
      setSending(false)
    }
  }, [chatId, user, sending])

  // ── Send file ──
  const sendFile = useCallback(async (file) => {
    if (!file || sending) return
    setSending(true)

    const isImage = file.type.startsWith('image/')
    const objectUrl = URL.createObjectURL(file)
    const optimistic = {
      _id: `opt-file-${Date.now()}`,
      sender: user?._id,
      senderRole: 'customer',
      type: isImage ? 'image' : 'file',
      content: objectUrl,
      fileName: file.name,
      createdAt: new Date().toISOString(),
      _optimistic: true,
      delivered: false,
    }
    setMessages(prev => [...prev, optimistic])

    try {
      const form = new FormData()
      form.append('file', file)
      await customerApi.post(`/chats/${chatId}/attachment`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    } catch {
      toast.error('فشل رفع الملف')
      setMessages(prev => prev.filter(m => m._id !== optimistic._id))
      URL.revokeObjectURL(objectUrl)
    } finally {
      setSending(false)
    }
  }, [chatId, user, sending])

  // ── Confirm receipt ──
  const confirmReceipt = useCallback(async () => {
    try {
      await customerApi.post(`/chats/${chatId}/confirm-receipt`)
      setConfirmed(true)
      toast.success('تم تأكيد استلام طلبك')
    } catch {
      toast.error('حدث خطأ أثناء تأكيد الاستلام')
    }
  }, [chatId])

  // ── Image lightbox ──
  const allImages = messages.filter(m => m.type === 'image' && !m._optimistic).map(m => m.content)

  const openLightbox = (index) => {
    setLightboxIndex(index)
    setLightboxOpen(true)
  }

  const customerName = chatMeta?.customer?.name || user?.name || 'عميل'
  const storeName = chatMeta?.store?.name || ''

  if (planUpgradeNeeded) {
    return (
      <div className="flex flex-col h-[calc(100vh-73px)] overflow-hidden bg-bg font-cairo items-center justify-center gap-4 px-8 py-16 text-center">
        <Link to={`/store/${slug}/orders`} className="self-start p-1.5 rounded-full hover:bg-bg-soft transition-colors text-text-muted">
          <ArrowRight size={20} />
        </Link>
        <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center">
          <MessageSquare size={28} className="text-amber-600" />
        </div>
        <h2 className="font-cairo font-bold text-lg text-text">محادثة التسليم</h2>
        <p className="text-sm text-text-muted leading-relaxed max-w-xs">
          هذه الميزة غير متاحة لهذا المتجر حالياً.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-73px)] overflow-hidden bg-bg font-cairo">
      {/* Header */}
      <header className="flex items-center gap-3 bg-white border-b border-border px-4 py-3 shrink-0">
        <Link to={`/store/${slug}/orders`} className="p-1.5 rounded-full hover:bg-bg-soft transition-colors text-text-muted">
          <ArrowRight size={20} />
        </Link>
        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <MessageSquare size={18} className="text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <span className="font-semibold text-sm text-text truncate block">{storeName || 'المتجر'}</span>
          <span className="text-xs text-text-muted flex items-center gap-1">
            <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-success' : 'bg-text-subtle'}`} />
            {typingName ? `${typingName} يكتب...` : connected ? 'متصل' : 'غير متصل'}
          </span>
        </div>
        {allImages.length > 0 && (
          <button
            onClick={() => setGalleryOpen(true)}
            className="p-1.5 rounded-full hover:bg-bg-soft transition-colors text-text-muted"
            title="الصور المرفقة"
          >
            <ImageIcon size={18} />
          </button>
        )}
      </header>

      {/* Messages */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto py-4 space-y-1.5 overscroll-contain"
      >
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader size={24} className="text-primary animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 text-center px-8 py-16">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <MessageSquare size={28} className="text-primary" />
            </div>
            <p className="font-semibold text-text">محادثة التسليم</p>
            <p className="text-sm text-text-muted leading-relaxed">
              يمكنك التواصل مع التاجر بخصوص طلبك
            </p>
          </div>
        ) : (
          messages.map((msg, idx) => (
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

      {/* Confirm banner */}
      {confirmed ? (
        <div className="flex items-center justify-center gap-2 bg-success-100 text-success-dark px-4 py-2.5 text-sm font-medium shrink-0">
          <CheckCircle size={16} />
          <span>تم تأكيد استلام الطلب</span>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-3 bg-accent-50 border-t border-accent/30 px-4 py-2.5 shrink-0">
          <p className="text-sm text-text-muted">هل استلمت طلبك؟</p>
          <button onClick={confirmReceipt} className="shrink-0 bg-primary text-white text-sm font-semibold px-4 py-1.5 rounded-lg hover:bg-primary-700 active:scale-95 transition-all">
            تأكيد الاستلام
          </button>
        </div>
      )}

      <ChatInput
        onSendText={sendText}
        onSendFile={sendFile}
        sending={sending}
        disabled={confirmed}
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
