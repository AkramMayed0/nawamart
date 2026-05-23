/**
 * SubscribeWaslUploader
 * Drag-drop / click-to-pick receipt image for subscription payment.
 *
 * Props:
 *   waslFile     File | null
 *   waslPreview  string | null   (object URL)
 *   setWaslFile  fn
 *   setWaslPreview fn
 */
import { useRef } from 'react'
import { UploadCloud, X, CheckCircle } from 'lucide-react'

export default function SubscribeWaslUploader({
  waslFile, waslPreview, setWaslFile, setWaslPreview,
}) {
  const inputRef = useRef(null)

  function pick(file) {
    if (!file) return
    if (waslPreview) URL.revokeObjectURL(waslPreview)
    setWaslFile(file)
    setWaslPreview(URL.createObjectURL(file))
  }

  function remove() {
    if (waslPreview) URL.revokeObjectURL(waslPreview)
    setWaslFile(null)
    setWaslPreview(null)
  }

  function onDrop(e) {
    e.preventDefault()
    pick(e.dataTransfer.files?.[0])
  }

  return (
    <div className="bg-white border border-border rounded-2xl p-6">
      <h3 className="font-cairo font-bold text-lg text-text mb-1">رفع صورة الوصل</h3>
      <p className="font-cairo text-sm text-text-muted mb-4">
        بعد التحويل، ارفع صورة أو لقطة شاشة لإثبات الدفع.
      </p>

      {!waslFile ? (
        /* ── Drop zone ── */
        <label
          onDrop={onDrop}
          onDragOver={e => e.preventDefault()}
          className="flex flex-col items-center gap-3 py-10 px-6 border-2 border-dashed border-border-strong rounded-xl cursor-pointer bg-bg hover:border-primary hover:bg-primary-50 transition-all group"
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => pick(e.target.files?.[0])}
          />
          <div className="w-14 h-14 rounded-2xl bg-white border border-border flex items-center justify-center text-primary group-hover:border-primary group-hover:bg-primary-50 transition-colors shadow-sm">
            <UploadCloud size={26} />
          </div>
          <div className="text-center">
            <p className="font-cairo font-bold text-sm text-text mb-1">
              اسحب الصورة هنا أو اضغط للاختيار
            </p>
            <p className="font-cairo text-xs text-text-muted">
              PNG · JPG · WEBP · حتى 5 ميجابايت
            </p>
          </div>
          <span className="font-cairo text-xs font-semibold text-primary border border-primary-200 bg-primary-50 px-4 py-1.5 rounded-lg group-hover:bg-primary group-hover:text-white transition-colors">
            اختر ملف
          </span>
        </label>
      ) : (
        /* ── Preview ── */
        <div className="flex items-center gap-4 bg-success-100 border border-green-200 rounded-xl p-4">
          {/* Thumbnail */}
          <div className="w-16 h-16 rounded-xl border border-border overflow-hidden shrink-0 bg-white">
            <img src={waslPreview} alt="الوصل" className="w-full h-full object-cover" />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <CheckCircle size={14} className="text-success shrink-0" />
              <p className="font-cairo font-semibold text-sm text-text truncate">
                {waslFile.name}
              </p>
            </div>
            <p className="font-cairo text-xs text-success">
              {(waslFile.size / 1024 / 1024).toFixed(1)} MB · جاهز للرفع
            </p>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="font-cairo text-xs text-text-muted underline underline-offset-2 mt-1 hover:text-primary transition-colors"
            >
              تغيير الصورة
            </button>
          </div>

          {/* Remove */}
          <button
            type="button"
            onClick={remove}
            className="w-8 h-8 rounded-full flex items-center justify-center text-text-muted hover:text-danger hover:bg-white transition-colors shrink-0"
            aria-label="إزالة الوصل"
          >
            <X size={16} />
          </button>

          {/* Hidden re-pick input */}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => pick(e.target.files?.[0])}
          />
        </div>
      )}
    </div>
  )
}
