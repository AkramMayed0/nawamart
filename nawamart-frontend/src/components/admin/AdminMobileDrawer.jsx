import { useEffect } from 'react'
import { X } from 'lucide-react'
import AdminSidebar from './AdminSidebar'

export default function AdminMobileDrawer({ open, onClose }) {
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 md:hidden" dir="rtl">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute right-0 top-0 flex h-full w-72 max-w-[85vw] flex-col bg-white shadow-lg">
        <div className="flex justify-end border-b border-border p-2">
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-bg-soft hover:text-text"
            aria-label="إغلاق القائمة"
          >
            <X size={20} />
          </button>
        </div>
        <div className="min-h-0 flex-1">
          <AdminSidebar onNavClick={onClose} />
        </div>
      </div>
    </div>
  )
}
