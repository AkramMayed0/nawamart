import { useEffect, useRef, useState } from 'react'
import { X, ChevronLeft, ChevronRight, Download, ZoomIn, ZoomOut } from 'lucide-react'

export default function ImageLightbox({ images, currentIndex, onClose }) {
  const [index, setIndex] = useState(currentIndex || 0)
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const imgRef = useRef(null)
  const touchStartRef = useRef(null)

  useEffect(() => {
    setIndex(currentIndex || 0)
    setScale(1)
    setPosition({ x: 0, y: 0 })
  }, [currentIndex])

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [index])

  const current = images[index]
  if (!current) return null

  const prev = () => {
    const i = (index - 1 + images.length) % images.length
    setIndex(i); setScale(1); setPosition({ x: 0, y: 0 })
  }
  const next = () => {
    const i = (index + 1) % images.length
    setIndex(i); setScale(1); setPosition({ x: 0, y: 0 })
  }

  const handleWheel = (e) => {
    e.preventDefault()
    setScale(s => Math.max(0.5, Math.min(5, s - e.deltaY * 0.005)))
  }

  const handleMouseDown = (e) => {
    if (scale > 1) {
      setDragging(true)
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
    }
  }

  const handleMouseMove = (e) => {
    if (dragging && scale > 1) {
      setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y })
    }
  }

  const handleMouseUp = () => setDragging(false)

  const handleTouchStart = (e) => {
    touchStartRef.current = { x: e.touches[0].clientX, t: Date.now() }
  }

  const handleTouchEnd = (e) => {
    const start = touchStartRef.current
    if (!start) return
    const dx = e.changedTouches[0].clientX - start.x
    const dt = Date.now() - start.t
    if (Math.abs(dx) > 50 && dt < 300) {
      dx > 0 ? prev() : next()
    }
    touchStartRef.current = null
  }

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center select-none"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-4 left-4 z-10 w-10 h-10 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors"
      >
        <X size={20} />
      </button>

      {/* Counter */}
      {images.length > 1 && (
        <div className="absolute top-4 right-4 z-10 bg-black/40 text-white text-sm font-cairo px-3 py-1.5 rounded-full">
          {index + 1} / {images.length}
        </div>
      )}

      {/* Download */}
      <a
        href={current}
        target="_blank"
        rel="noopener noreferrer"
        download
        className="absolute top-4 right-16 z-10 w-10 h-10 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors"
      >
        <Download size={18} />
      </a>

      {/* Zoom controls */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 bg-black/40 rounded-full px-3 py-1.5">
        <button onClick={() => setScale(s => Math.max(0.5, s - 0.5))}>
          <ZoomOut size={18} className="text-white" />
        </button>
        <span className="text-white text-xs font-en min-w-[36px] text-center">{Math.round(scale * 100)}%</span>
        <button onClick={() => setScale(s => Math.min(5, s + 0.5))}>
          <ZoomIn size={18} className="text-white" />
        </button>
      </div>

      {/* Nav arrows */}
      {images.length > 1 && (
        <>
          <button onClick={prev} className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors">
            <ChevronRight size={24} />
          </button>
          <button onClick={next} className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors">
            <ChevronLeft size={24} />
          </button>
        </>
      )}

      {/* Image */}
      <img
        ref={imgRef}
        src={current}
        alt=""
        className="max-w-[90vw] max-h-[90vh] object-contain transition-transform duration-100"
        style={{
          transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
          cursor: dragging ? 'grabbing' : scale > 1 ? 'grab' : 'default',
        }}
        draggable={false}
      />
    </div>
  )
}
