import { useEffect } from 'react'
import { X } from 'lucide-react'
import AdminSidebar from './AdminSidebar'

export default function AdminMobileDrawer({ open, onClose }) {
  // Prevent body scroll when open
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 md:hidden" dir="rtl">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="absolute top-0 right-0 h-full w-64 bg-white shadow-2xl flex flex-col">
        {/* Close Button Header */}
        <div className="flex justify-end p-2 border-b border-border">
          <button 
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-xl text-text-muted hover:bg-bg-soft hover:text-text transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Sidebar content */}
        <div className="flex-1 overflow-hidden">
          <AdminSidebar onNavClick={onClose} />
        </div>
      </div>
    </div>
  )
}
