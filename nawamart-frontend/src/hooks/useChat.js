import { useState, useEffect, useRef, useCallback } from 'react'
import toast from 'react-hot-toast'
import { getSocket } from '@/lib/socket'
import { useAuthStore } from '@/store/authStore'
import { getChatMessages, sendMessage } from '@/api/orders'

async function uploadAttachment(chatId, file) {
  const { default: api } = await import('@/api/axios')
  const form = new FormData()
  form.append('file', file)
  const res = await api.post(`/chats/${chatId}/attachment`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data.data
}

async function confirmReceiptApi(chatId) {
  const { default: api } = await import('@/api/axios')
  const res = await api.post(`/chats/${chatId}/confirm-receipt`)
  return res.data
}

async function markMessagesReadApi(chatId) {
  const { default: api } = await import('@/api/axios')
  return api.post(`/chats/${chatId}/read`)
}

const NEW_MSG_SOUND = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACAf39/f4B/f3+AgH9/f3+Af39/gIB/f39/gH9/f4CAf39/f4B/f3+AgH9/f3+Af39/gIB/f39/gH9/f4CAf39/f4B/f3+AgH9/f3+Af39/gIB/f39/gH9/f4CAf39/f4B/f3+AgH9/f3+Af39/gIB/f39/gH9/f4CAf39/f4B/f3+AgH9/f3+Af39/gIB/f39/gH9/f4CAf39/f4B/f3+AgH9/f3+Af39/gIB/f39/gH9/f4CAf39/f4B/f3+AgH9/f3+Af39/gIB/f39/gH9/f4CAf39/f4B/f3+AgH9/f3+Af39/gIB/f39/gH9/f4CAf39/f4B/f3+AgH9/f3+Af39/gIB/f39/gH9/f4CAf39/f4B/f3+AgH9/f3+Af39/gIB/f39/gH9/f4CAf39/f4B/f3+AgH9/f3+Af39/gIB/f39/gH9/f4CAf39/f4B/f3+AgH9/f3+Af39/gIB/f39/gH9/f4CAf39/f4B/f3+AgH9/f3+Af39/gIB/f39/gH9/f4CAf39/f4B/f3+AgH9/f3+Af39/gIB/f39/gH9/f4CAf39/f4B/f3+AgH9/f3+Af39/gIB/f39/gH9/f4CAf39/f4B/f3+AgH9/f3+Af39/gIB/f39/gH9/f4CAf39/f4B/f3+AgH9/f3+Af39/gIB/f39/gH9/f4CAf39/f4B/f3+AgH9/f3+Af39/gIB/f39/gH9/f4CAf39/f4B/f3+AgH9/f3+Af39/gIB/f39/gH9/f4CAf39/f4B/f3+AgH9/f3+Af39/gIB/f39/gH9/f4CAf39/f4B/f3+AgH9/f3+Af39/gIB/f39/gH9/f4CAf39/f4B/f3+AgH9/f3+Af39/gIB/f39/gH9/f4CAf39/f4B/f3+AgH9/f3+Af39/gIB/f39/gH9/f4CAf39/f4B/f3+AgH9/f3+Af39/gIB/f39/gH9/f4CAf39/f4B/f3+AgH9/f3+Af39/gIB/f39/gH9/f4CAf39/f4B/f3+AgH9/f3+Af39/gIB/f39/gH9/f4CAf39/f4B/f3+AgH9/f3+Af39/gIB/f39/gH9/f4CAf39/f4B/f3+AgH9/f3+Af39/gIB/f39/gH9/f4CAf39/f4B/f3+AgH9/f3+Af39/gIB/f39/gH9/f4CAf39/f4B/f3+AgH9/f3+Af39/gIB/f39/gH9/f4CAf39/f4B/f3+AgH9/f3+Af39/gIB/f39/gH9/f4CAf39/f4B/f3+AgH9/f3+Af39/gIB/f39/gH9/f4CAf39/f4B/f3+AgH9/f3+Af39/gIB/f39/gH9/f4CAf39/f4B/f3+AgH9/f3+Af39/gIB/f39/gH9/f4CAf39/f4B/f3+AgH9/f3+Af39/gIB/f39/gH9/f4CAf39/f4B/f3+AgH9/f3+Af39/gIB/f39/gH9/f4CAf39/f4B/f3+AgH9/f3+Af39/gIB/f39/gH9/f4CAf39/f4B/f3+AgH9/f3+Af39/gIB/f39/gH9/f4CAf39/f4B/f3+AgH9/f3+Af39/gIB/f39/gH9/f4CAf39/f4B/f3+AgH9/f3+Af39/gIB/f39/gH9/f4CAf39/f4B/f3+AgH9/f3+Af39/gIB/f39/gH9/f4CAf39/f4B/f3+AgH9/f3+Af39/gIB/f39/gH9/f4CAf39/f4B/f3+AgH9/f3+Af39/gIB/f39/gH9/f4CAf39/f4B/f3+AgH9/f3+Af39/gIB/f39/gH9/f4CAf39/f4B/f3+AgH9/f3+Af39/gIB/f39/gH9/f4CAf39/f4B/f3+AgH9/f3+Af39/gIB/f39/gH9/f4CAf39/f4B/f3+AgH9/f3+Af39/gIB/f39/gH9/f4CAf39/f4B/f3+AgH9/f3+Af39/gIB/f39/gH9/f4CAf39/f4B/f3+AgH9/f3+Af39/gIB/f39/gH9/f4CAf39/f4B/f3+AgH9/f3+Af39/gIB/f39/gH9/f4CAf39/f4B/f3+AgH9/f3+Af39/gIB/f39/gH9/f4CAf39/f4B/f3+AgH9/f3+Af39/gIB/f39/gH9/f4CAf39/f4B/f3+AgH9/f3+Af39/gIB/f39/gH9/f4CAf39/f4B/f3+AgH9/f3+Af39/gIB/f39/gH9/f4CgA=='

let audioCtx = null

function playNewMsgSound() {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)()
    const ctx = audioCtx
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

export function useChat(chatId) {
  const token = useAuthStore(s => s.token)
  const user  = useAuthStore(s => s.user)

  const [messages,   setMessages]   = useState([])
  const [chatMeta,   setChatMeta]   = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [sending,    setSending]    = useState(false)
  const [connected,  setConnected]  = useState(false)
  const [confirmed,  setConfirmed]  = useState(false)
  const [typingName, setTypingName] = useState(null)
  const [replyTo,    setReplyTo]    = useState(null)

  const socketRef = useRef(null)
  const typingTimerRef = useRef(null)
  const isTypingRef = useRef(false)
  const prevMsgCountRef = useRef(0)

  // ═══════════════════════════════════════════════════════════════
  // 1. Load history
  // ═══════════════════════════════════════════════════════════════
  useEffect(() => {
    if (!chatId) return
    setLoading(true)
    getChatMessages(chatId)
      .then(res => {
        const chat = res.data.data
        setMessages(chat?.messages ?? [])
        setChatMeta(chat ?? null)
        setConfirmed(chat?.receiptConfirmed ?? false)
        prevMsgCountRef.current = chat?.messages?.length ?? 0

        // Mark incoming messages as read
        markMessagesReadApi(chatId).catch(() => {})
      })
      .catch(err => {
        if (err.status !== 404) toast.error('تعذّر تحميل الرسائل')
      })
      .finally(() => setLoading(false))
  }, [chatId])

  // ═══════════════════════════════════════════════════════════════
  // 2. Socket.io setup
  // ═══════════════════════════════════════════════════════════════
  useEffect(() => {
    if (!chatId || !token) return

    const socket = getSocket(token)
    socketRef.current = socket

    const onConnect = () => {
      setConnected(true)
      socket.emit('joinRoom', chatId)
      // Request missing messages on reconnect
      socket.emit('requestMissing', { chatId })
    }

    const onDisconnect = () => setConnected(false)

    const onReceiveMessage = (msg) => {
      setMessages(prev => {
        if (prev.some(m => m._id === msg._id)) return prev
        const wasEmpty = prev.length === 0
        // Play sound only for incoming (not mine) messages when not first load
        const isIncoming = msg.sender !== user?._id
        if (isIncoming && prevMsgCountRef.current > 0 && !wasEmpty) {
          playNewMsgSound()
        }
        prevMsgCountRef.current = prev.length + 1
        return [...prev, msg]
      })
      // Emit delivery ack
      socket.emit('messageDelivered', { chatId, messageId: msg._id })
      // Mark as read
      markMessagesReadApi(chatId).catch(() => {})
    }

    const onReceiptConfirmed = () => {
      setConfirmed(true)
      toast.success('تم تأكيد الاستلام')
    }

    const onUserTyping = ({ name }) => setTypingName(name)
    const onUserStopTyping = () => setTypingName(null)

    const onMessagesRead = ({ userId }) => {
      setMessages(prev => prev.map(m => {
        if (m.sender === user?._id && m.sender.toString() !== userId && !m.readAt) {
          return { ...m, readAt: new Date().toISOString(), delivered: true, isRead: true }
        }
        if (m.sender === user?._id && !m.delivered) {
          return { ...m, delivered: true }
        }
        return m
      }))
    }

    const onMessageStatusUpdate = ({ messageId, status }) => {
      setMessages(prev => prev.map(m => {
        if (m._id === messageId) {
          if (status === 'delivered') return { ...m, delivered: true }
          if (status === 'read') return { ...m, readAt: new Date().toISOString(), isRead: true, delivered: true }
        }
        return m
      }))
    }

    if (socket.connected) onConnect()
    socket.on('connect',              onConnect)
    socket.on('disconnect',           onDisconnect)
    socket.on('receiveMessage',       onReceiveMessage)
    socket.on('receiptConfirmed',     onReceiptConfirmed)
    socket.on('userTyping',           onUserTyping)
    socket.on('userStopTyping',       onUserStopTyping)
    socket.on('messagesRead',         onMessagesRead)
    socket.on('messageStatusUpdate',  onMessageStatusUpdate)

    return () => {
      socket.off('connect',              onConnect)
      socket.off('disconnect',           onDisconnect)
      socket.off('receiveMessage',       onReceiveMessage)
      socket.off('receiptConfirmed',     onReceiptConfirmed)
      socket.off('userTyping',           onUserTyping)
      socket.off('userStopTyping',       onUserStopTyping)
      socket.off('messagesRead',         onMessagesRead)
      socket.off('messageStatusUpdate',  onMessageStatusUpdate)
      socket.emit('leaveRoom', chatId)
    }
  }, [chatId, token, user?._id])

  // ═══════════════════════════════════════════════════════════════
  // 3. Typing indicator
  // ═══════════════════════════════════════════════════════════════
  const emitTyping = useCallback(() => {
    const socket = socketRef.current
    if (!socket || !chatId) return
    const name = user?.name || (user?.role === 'merchant' ? 'التاجر' : 'العميل')

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

  // ═══════════════════════════════════════════════════════════════
  // 4. Send text
  // ═══════════════════════════════════════════════════════════════
  const sendText = useCallback(async (text, replyToData = null) => {
    if (!text?.trim() || sending) return
    setSending(true)

    // Stop typing
    const socket = socketRef.current
    if (socket && chatId) {
      if (isTypingRef.current) {
        isTypingRef.current = false
        socket.emit('stopTyping', { chatId })
      }
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current)
    }

    const optimistic = {
      _id:       `opt-${Date.now()}`,
      sender:    user?._id,
      senderRole: user?.role,
      type:      'text',
      content:   text.trim(),
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
      await sendMessage(chatId, payload)
    } catch {
      toast.error('فشل إرسال الرسالة')
      setMessages(prev => prev.filter(m => m._id !== optimistic._id))
    } finally {
      setSending(false)
    }
  }, [chatId, user, sending])

  // ═══════════════════════════════════════════════════════════════
  // 5. Send file
  // ═══════════════════════════════════════════════════════════════
  const sendFile = useCallback(async (file) => {
    if (!file || sending) return
    setSending(true)

    const isImage = file.type.startsWith('image/')
    const objectUrl = URL.createObjectURL(file)

    const optimistic = {
      _id:        `opt-file-${Date.now()}`,
      sender:     user?._id,
      senderRole: user?.role,
      type:       isImage ? 'image' : 'file',
      content:    objectUrl,
      fileName:   file.name,
      createdAt:  new Date().toISOString(),
      _optimistic: true,
      delivered: false,
    }
    setMessages(prev => [...prev, optimistic])

    try {
      await uploadAttachment(chatId, file)
    } catch {
      toast.error('فشل رفع الملف')
      setMessages(prev => prev.filter(m => m._id !== optimistic._id))
      URL.revokeObjectURL(objectUrl)
    } finally {
      setSending(false)
    }
  }, [chatId, user, sending])

  // ═══════════════════════════════════════════════════════════════
  // 6. Confirm receipt
  // ═══════════════════════════════════════════════════════════════
  const confirmReceipt = useCallback(async () => {
    try {
      await confirmReceiptApi(chatId)
      setConfirmed(true)
      toast.success('تم تأكيد استلام طلبك')
    } catch {
      toast.error('حدث خطأ أثناء تأكيد الاستلام')
    }
  }, [chatId])

  return {
    messages,
    chatMeta,
    loading,
    sending,
    connected,
    confirmed,
    typingName,
    replyTo,
    setReplyTo,
    sendText,
    sendFile,
    confirmReceipt,
    emitTyping,
    socketRef,
  }
}
