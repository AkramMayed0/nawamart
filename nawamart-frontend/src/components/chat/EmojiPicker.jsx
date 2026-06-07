import { useState, useRef, useEffect } from 'react'
import { Smile } from 'lucide-react'

const EMOJI_CATEGORIES = {
  '😊': ['😊','😂','❤️','👍','🙏','😍','🤩','😎','🔥','💯','🎉','🥳','😢','😡','👏','🙌','💪','🤝','✅','❌','⭐','👀','🤣','🥺'],
  '👋': ['👋','✋','🤚','🖐️','✌️','🤞','👌','🤌','👊','🤛','🤜','🤙','💅','🖖','🤟'],
  '🐶': ['🐶','🐱','🦋','🌸','🌺','🌻','🍕','🍔','🌮','☕','🍩','🍰','🎂','🍫','🎁'],
  '😴': ['😴','🤔','🙄','😤','🤯','🥶','🤬','🫶','🫡','🫠','🥹','😇','😅','😁','😆'],
}

const CATEGORY_ICONS = { '😊': '😊', '👋': '👋', '🐶': '🐶', '😴': '😴' }

export default function EmojiPicker({ onEmojiSelect }) {
  const [open, setOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState('😊')
  const ref = useRef(null)

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="shrink-0 w-9 h-9 flex items-center justify-center rounded-full text-[#9298A3] hover:text-[#C93F2B] hover:bg-[#FFF4F1] transition-all duration-150"
        title="رمز تعبيري"
        aria-label="إيموجي"
      >
        <Smile size={18} />
      </button>

      {open && (
        <div className="emoji-picker-popup">
          {/* Category tabs */}
          <div className="flex border-b border-[#E1DED8] px-1 pt-1">
            {Object.keys(EMOJI_CATEGORIES).map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex-1 py-1.5 text-lg rounded-t-lg transition-all duration-150 ${
                  activeCategory === cat
                    ? 'bg-[#FFF4F1]'
                    : 'hover:bg-[#F6F3EE]'
                }`}
              >
                {CATEGORY_ICONS[cat]}
              </button>
            ))}
          </div>
          {/* Emoji grid */}
          <div className="grid grid-cols-8 gap-0.5 p-2 max-h-[180px] overflow-y-auto">
            {EMOJI_CATEGORIES[activeCategory].map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => { onEmojiSelect(emoji); setOpen(false) }}
                className="w-8 h-8 flex items-center justify-center text-lg hover:bg-[#F6F3EE] rounded-lg transition-colors duration-100 active:scale-90"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
