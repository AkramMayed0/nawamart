import { useState } from 'react'
import clsx from 'clsx'
import Icon from '@/components/ui/Icon'

export default function ImageGallery({ images = [] }) {
  const [active, setActive] = useState(0)

  if (images.length === 0) {
    return (
      <div className="aspect-square rounded-xl bg-bg-soft border border-border flex items-center justify-center">
        <Icon name="image" size={48} className="text-border-strong" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Main image */}
      <div className="aspect-square rounded-xl overflow-hidden border border-border bg-bg-soft">
        <img
          src={images[active]}
          alt=""
          className="w-full h-full object-cover transition-opacity duration-200"
        />
      </div>

      {/* Thumbnails — only shown if more than 1 image */}
      {images.length > 1 && (
        <div className="flex gap-2">
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={clsx(
                'w-16 h-16 rounded-lg overflow-hidden border-2 transition-all shrink-0',
                active === i
                  ? 'border-primary shadow-focus'
                  : 'border-border hover:border-border-strong'
              )}
            >
              <img src={src} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
