import { useEffect } from 'react'
import { X } from 'lucide-react'
import AdminSidebar from './AdminSidebar'

export default function AdminMobileDrawer({ open, onClose }) {
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 md:hidden" dir="rtl">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer panel */}
      <div className="absolute right-0 top-0 flex h-full w-72 max-w-[85vw] flex-col shadow-2xl">
        {/* Close button overlay */}
        <div className="absolute top-3 left-3 z-10">
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white/60 hover:text-white transition-colors"
            aria-label="إغلاق القائمة"
          >
            <X size={17} />
          </button>
        </div>

        {/* Sidebar fills entire drawer */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          <AdminSidebar onNavClick={onClose} />
        </div>
      </div>
    </div>
  )
}
