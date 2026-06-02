import { useState, useRef, useEffect } from 'react'
import { Smile } from 'lucide-react'

const EMOJIS = [
  '😊','😂','❤️','👍','🙏','😍','🤩','😎',
  '🔥','💯','🎉','🥳','😢','😡','👏','🙌',
  '💪','🤝','✅','❌','⭐','👀','💀','🤣',
  '🥺','😅','😁','😤','🤔','🙄','😴','🤗',
  '🫡','🫠','🥹','😇','🤯','🥶','🤬','🫶',
  '👋','✋','🤚','🖐️','✌️','🤞','👌','🤌',
  '💀','☠️','👻','🎃','💩','👑','🐶','🐱',
  '🦋','🌸','🌺','🌻','🍕','🍔','🌮','☕',
]

export default function EmojiPicker({ onEmojiSelect }) {
  const [open, setOpen] = useState(false)
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
        className="shrink-0 w-9 h-9 flex items-center justify-center rounded-full text-text-muted hover:bg-bg-soft transition-colors"
        title="إضافة رمز تعبيري"
        aria-label="إيموجي"
      >
        <Smile size={18} />
      </button>

      {open && (
        <div className="absolute bottom-full right-0 mb-2 bg-white border border-border rounded-2xl shadow-lg p-3 z-50">
          <div className="grid grid-cols-8 gap-1 max-h-[200px] overflow-y-auto">
            {EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => { onEmojiSelect(emoji); setOpen(false) }}
                className="w-8 h-8 flex items-center justify-center text-lg hover:bg-bg-soft rounded-lg transition-colors"
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
