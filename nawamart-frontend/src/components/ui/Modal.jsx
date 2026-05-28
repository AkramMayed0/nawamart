import { useEffect } from 'react'
import clsx from 'clsx'
import Icon from './Icon'

export default function Modal({ open, onClose, title, children, size = 'md', className = '' }) {
  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e) => e.key === 'Escape' && onClose?.()
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Panel */}
      <div className={clsx(
        'relative w-full bg-white rounded-xl shadow-lg z-10 flex flex-col',
        'animate-[fadeIn_180ms_ease]',
        'max-h-[85vh]',
        sizes[size],
        className,
      )}>
        {/* Header (sticky) */}
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
            <h2 className="text-lg font-bold text-text font-cairo">{title}</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:bg-bg transition-colors"
            >
              <Icon name="x" size={18} />
            </button>
          </div>
        )}

        {/* Body (scrollable) */}
        <div className="px-6 py-5 overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}
