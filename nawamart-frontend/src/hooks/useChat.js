/**
 * useChat — manages chat state, Socket.io connection, and API calls.
 *
 * Usage:
 *   const { messages, loading, sendText, sendFile, confirmReceipt } = useChat(chatId)
 */
import { useState, useEffect, useRef, useCallback } from 'react'
import toast from 'react-hot-toast'
import { getSocket } from '@/lib/socket'
import { useAuthStore } from '@/store/authStore'
import { getChatMessages, sendMessage } from '@/api/orders'

/**
 * Upload a file attachment and return its URL + type.
 * Calls POST /api/chats/:chatId/attachment
 */
async function uploadAttachment(chatId, file) {
  const { default: api } = await import('@/api/axios')
  const form = new FormData()
  form.append('file', file)
  const res = await api.post(`/chats/${chatId}/attachment`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  // Expected: { url, type: 'image'|'file', name }
  return res.data.data
}

/**
 * Confirm order receipt (customer only).
 * Calls POST /api/chats/:chatId/confirm-receipt
 */
async function confirmReceiptApi(chatId) {
  const { default: api } = await import('@/api/axios')
  const res = await api.post(`/chats/${chatId}/confirm-receipt`)
  return res.data
}

export function useChat(chatId) {
  const token = useAuthStore(s => s.token)
  const user  = useAuthStore(s => s.user)

  const [messages,   setMessages]   = useState([])
  const [chatMeta,   setChatMeta]   = useState(null)   // { orderId, merchantName, customerName, ... }
  const [loading,    setLoading]    = useState(true)
  const [sending,    setSending]    = useState(false)
  const [connected,  setConnected]  = useState(false)
  const [confirmed,  setConfirmed]  = useState(false)  // receipt confirmed

  const socketRef = useRef(null)

  // ── 1. Load history from API ─────────────────────────────────────────────
  useEffect(() => {
    if (!chatId) return
    setLoading(true)

    getChatMessages(chatId)
      .then(res => {
        const chat = res.data.data
        setMessages(chat?.messages ?? [])
        setChatMeta(chat ?? null)
        setConfirmed(chat?.receiptConfirmed ?? false)
      })
      .catch(err => {
        if (err.status !== 404) {
          toast.error('تعذّر تحميل الرسائل')
        }
      })
      .finally(() => setLoading(false))
  }, [chatId])

  // ── 2. Socket.io setup ───────────────────────────────────────────────────
  useEffect(() => {
    if (!chatId || !token) return

    const socket = getSocket(token)
    socketRef.current = socket

    const onConnect = () => {
      setConnected(true)
      socket.emit('joinRoom', chatId)
    }

    const onDisconnect = () => setConnected(false)

    const onReceiveMessage = (msg) => {
      setMessages(prev => {
        // Deduplicate by _id (server may echo our own optimistic msg)
        if (prev.some(m => m._id === msg._id)) return prev
        return [...prev, msg]
      })
    }

    const onReceiptConfirmed = () => {
      setConfirmed(true)
      toast.success('تم تأكيد الاستلام')
    }

    // Attach listeners
    if (socket.connected) onConnect()
    socket.on('connect',          onConnect)
    socket.on('disconnect',       onDisconnect)
    socket.on('receiveMessage',   onReceiveMessage)
    socket.on('receiptConfirmed', onReceiptConfirmed)

    return () => {
      socket.off('connect',          onConnect)
      socket.off('disconnect',       onDisconnect)
      socket.off('receiveMessage',   onReceiveMessage)
      socket.off('receiptConfirmed', onReceiptConfirmed)
      socket.emit('leaveRoom', chatId)
    }
  }, [chatId, token])

  // ── 3. Send text message ─────────────────────────────────────────────────
  const sendText = useCallback(async (text) => {
    if (!text?.trim() || sending) return
    setSending(true)

    // Optimistic bubble
    const optimistic = {
      _id:       `opt-${Date.now()}`,
      sender:    user?._id,
      senderRole: user?.role,
      type:      'text',
      content:   text.trim(),
      createdAt: new Date().toISOString(),
      _optimistic: true,
    }
    setMessages(prev => [...prev, optimistic])

    try {
      await sendMessage(chatId, { type: 'text', content: text.trim() })
      // Socket.io will broadcast the real message → dedup above removes optimistic
    } catch {
      toast.error('فشل إرسال الرسالة')
      // Remove optimistic on failure
      setMessages(prev => prev.filter(m => m._id !== optimistic._id))
    } finally {
      setSending(false)
    }
  }, [chatId, user, sending])

  // ── 4. Send file/image attachment ────────────────────────────────────────
  const sendFile = useCallback(async (file) => {
    if (!file || sending) return
    setSending(true)

    const isImage = file.type.startsWith('image/')
    const objectUrl = URL.createObjectURL(file)

    // Optimistic bubble
    const optimistic = {
      _id:        `opt-file-${Date.now()}`,
      sender:     user?._id,
      senderRole: user?.role,
      type:       isImage ? 'image' : 'file',
      content:    objectUrl,
      fileName:   file.name,
      createdAt:  new Date().toISOString(),
      _optimistic: true,
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

  // ── 5. Confirm receipt (customer only) ───────────────────────────────────
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
    sendText,
    sendFile,
    confirmReceipt,
  }
}
