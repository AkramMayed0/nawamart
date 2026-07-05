import { useState } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

const DEFAULT_STEPS = [
  {
    title: 'مرحباً بك في نوامارت!',
    content: 'هذه لوحة التحكم الخاصة بك. من هنا يمكنك إدارة متجرك بالكامل — المنتجات، الطلبات، العملاء، والمزيد.',
    position: 'center',
  },
  {
    title: 'إدارة المنتجات',
    content: 'هذا هو محرر المنتجات. يمكنك إضافة صور، تحديد السعر، وإدارة المخزون بسهولة.',
    selector: '[data-tour="products"]',
    position: 'bottom',
  },
  {
    title: 'الطلبات',
    content: 'الطلبات الجديدة تظهر هنا. يمكنك تأكيد الطلب أو رفضه وإدارة حالات الشحن.',
    selector: '[data-tour="orders"]',
    position: 'bottom',
  },
  {
    title: 'فريق المتجر',
    content: 'يمكنك إضافة موظفين وصلاحيات مختلفة — مدير، مصمم، محرر محتوى، ومشاهد.',
    selector: '[data-tour="staff"]',
    position: 'top',
  },
]

export default function TourTooltip({ steps = DEFAULT_STEPS, onComplete }) {
  const [current, setCurrent] = useState(0)
  const [dismissed, setDismissed] = useState(false)

  if (dismissed || steps.length === 0) return null

  const step = steps[current]
  const isLast = current === steps.length - 1

  function handleNext() {
    if (isLast) {
      setDismissed(true)
      localStorage.setItem('nawamart-tour-done', 'true')
      onComplete?.()
    } else {
      setCurrent((c) => c + 1)
    }
  }

  function handleSkip() {
    setDismissed(true)
    localStorage.setItem('nawamart-tour-done', 'true')
    onComplete?.()
  }

  const isCenter = step.position === 'center'

  if (isCenter) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" dir="rtl">
        <div className="mx-4 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50">
            <span className="text-2xl">🚀</span>
          </div>
          <h3 className="mb-2 font-cairo text-lg font-extrabold text-text">{step.title}</h3>
          <p className="mb-6 font-cairo text-sm leading-7 text-text-muted">{step.content}</p>
          <div className="flex items-center justify-between">
            <button type="button" onClick={handleSkip} className="font-cairo text-xs font-semibold text-text-muted hover:text-text">
              تخطي الجولة
            </button>
            <div className="flex items-center gap-2">
              {steps.map((_, i) => (
                <span key={i} className={`h-1.5 w-1.5 rounded-full transition-colors ${i === current ? 'bg-primary' : 'bg-border-strong'}`} />
              ))}
            </div>
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-1 rounded-lg bg-primary px-4 py-2 font-cairo text-sm font-bold text-white transition-colors hover:bg-primary-700"
            >
              {isLast ? 'ابدأ!' : 'التالي'}
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 pointer-events-none" dir="rtl">
      {/* Highlight ring would go around the target element */}
      <div className="pointer-events-auto absolute bottom-6 left-1/2 -translate-x-1/2 mx-auto w-[90vw] max-w-md rounded-2xl bg-white p-5 shadow-xl border border-border">
        <button
          type="button"
          onClick={handleSkip}
          className="absolute left-3 top-3 text-text-subtle hover:text-text"
        >
          <X size={14} />
        </button>

        <div className="mb-3 flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-50 font-cairo text-xs font-bold text-primary">
            {current + 1}
          </span>
          <h4 className="font-cairo text-sm font-extrabold text-text">{step.title}</h4>
        </div>
        <p className="mb-4 font-cairo text-xs leading-6 text-text-muted">{step.content}</p>

        <div className="flex items-center justify-between">
          <span className="font-cairo text-[10px] text-text-subtle">{current + 1} / {steps.length}</span>
          <button
            type="button"
            onClick={handleNext}
            className="inline-flex items-center gap-1 rounded-lg bg-primary px-4 py-2 font-cairo text-xs font-bold text-white transition-colors hover:bg-primary-700"
          >
            {isLast ? 'تم!' : 'التالي'}
            {!isLast && <ChevronLeft size={12} />}
          </button>
        </div>
      </div>
    </div>
  )
}