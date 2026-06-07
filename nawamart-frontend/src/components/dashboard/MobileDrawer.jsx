/**
 * MobileDrawer
 * Slide-in sidebar drawer for mobile screens.
 * Rendered via a portal so it overlays everything.
 */
import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import DashboardSidebar from './DashboardSidebar'

export default function MobileDrawer({ open, onClose }) {
  // Lock body scroll while drawer is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  // Close on Escape key
  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex" dir="rtl">

      {/* ── Backdrop ── */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* ── Drawer panel (slides from right / RTL end) ── */}
      <div
        className="relative w-72 max-w-[85vw] h-full bg-white rounded-l-3xl shadow-2xl flex flex-col overflow-hidden"
        style={{ animation: 'slideInRight 220ms cubic-bezier(.4,0,.2,1)' }}
      >
        {/* Thin accent line at top */}
        <div className="h-0.5 w-full bg-gradient-to-l from-accent via-primary to-accent shrink-0" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 w-8 h-8 flex items-center justify-center rounded-xl bg-bg-soft text-text-muted hover:bg-border hover:text-text transition-colors z-10"
          aria-label="إغلاق القائمة"
        >
          <X size={18} />
        </button>

        {/* Sidebar content fills the drawer */}
        <div className="flex-1 min-h-0">
          <DashboardSidebar onNavClick={onClose} />
        </div>
      </div>

    </div>,
    document.body
  )
}
