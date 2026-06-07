import { useState, useEffect } from 'react'
import { MessageSquare, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import api from '@/api/axios'
import { useAuthStore } from '@/store/authStore'

export default function FloatingChatButton({ storeId }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)

  const handleStartChat = async () => {
    if (!isAuthenticated) {
      navigate('/customer/login', { state: { returnUrl: window.location.pathname } })
      return
    }

    setLoading(true)
    try {
      const res = await api.post('/chats', { storeId })
      navigate(`/dashboard/chat/${res.data.data._id}`)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Tooltip / Prompt */}
      {open && (
        <div className="bg-white rounded-2xl shadow-lg border border-[#E1DED8] p-4 w-64 animate-in fade-in slide-in-from-bottom-2 origin-bottom-right duration-200">
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-bold text-sm text-[#1D2430]">تواصل مع المتجر مباشرة</h4>
            <button onClick={() => setOpen(false)} className="text-[#9298A3] hover:text-[#1D2430]">
              <X size={16} />
            </button>
          </div>
          <p className="text-xs text-[#5F6673] mb-4">
            لديك استفسار حول منتج؟ فريقنا جاهز للرد عليك في أي وقت.
          </p>
          <button
            onClick={handleStartChat}
            disabled={loading}
            className="w-full bg-[#18212F] text-white text-sm font-bold py-2.5 rounded-xl hover:bg-[#27364B] transition-colors flex items-center justify-center gap-2"
          >
            {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'بدء المحادثة'}
          </button>
        </div>
      )}

      {/* Button */}
      <button
        onClick={() => setOpen(!open)}
        className={clsx(
          'w-14 h-14 rounded-full flex items-center justify-center text-white shadow-xl hover:scale-105 active:scale-95 transition-all duration-300',
          open ? 'bg-[#C93F2B] rotate-90' : 'bg-[#18212F]'
        )}
      >
        {open ? <X size={24} className="-rotate-90 transition-transform duration-300" /> : <MessageSquare size={24} />}
      </button>
    </div>
  )
}
