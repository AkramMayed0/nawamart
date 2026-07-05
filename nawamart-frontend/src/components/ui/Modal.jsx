import { useEffect } from 'react'
import clsx from 'clsx'
import Icon from './Icon'

export default function Modal({
  open,
  onClose,
  title,
  children,
  size = 'md',
  className = '',
  showClose = true,
}) {
  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }

  useEffect(() => {
    if (!open) return
    const handler = (e) => e.key === 'Escape' && onClose?.()
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm animate-[fadeIn_180ms_ease]"
        onClick={onClose}
      />

      <div className={clsx(
        'relative w-full bg-white dark:bg-surface rounded-2xl shadow-2xl z-10 flex flex-col',
        'scale-fade-in',
        'max-h-[85vh]',
        sizes[size],
        className,
      )}>
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
            <h2 className="text-lg font-bold text-text font-cairo">{title}</h2>
            {showClose && (
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-text-muted hover:bg-bg hover:text-text transition-colors"
                aria-label="إغلاق"
              >
                <Icon name="x" size={18} />
              </button>
            )}
          </div>
        )}

        <div className="px-6 py-5 overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}
