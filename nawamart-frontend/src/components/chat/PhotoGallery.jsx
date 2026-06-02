import { X, Image as ImageIcon } from 'lucide-react'

export default function PhotoGallery({ images, onSelect, onClose }) {
  if (!images || images.length === 0) return null

  return (
    <div className="fixed inset-0 z-[90] bg-black/70 flex flex-col" onClick={onClose}>
      <header className="flex items-center justify-between px-4 py-3 shrink-0">
        <h2 className="text-white font-cairo font-bold text-sm flex items-center gap-2">
          <ImageIcon size={16} />
          الصور المرفقة ({images.length})
        </h2>
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
        >
          <X size={18} />
        </button>
      </header>

      <div
        className="flex-1 overflow-y-auto px-4 pb-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="grid grid-cols-3 gap-2">
          {images.map((url, i) => (
            <button
              key={i}
              onClick={() => onSelect?.(i)}
              className="aspect-square rounded-xl overflow-hidden bg-black/30 hover:ring-2 hover:ring-white/50 transition-all"
            >
              <img
                src={url}
                alt=""
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
