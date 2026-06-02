import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import clsx from 'clsx'
import { useAuthStore } from '@/store/authStore'
import { createStore } from '@/api/stores'
import usePageTitle from '@/hooks/usePageTitle'
import Button from '@/components/ui/Button'
import Icon from '@/components/ui/Icon'

// ── Type card data ────────────────────────────────────────────────────────
const TYPES = [
  {
    value: 'physical',
    iconName: 'truck',
    title: 'منتجات مادية',
    desc: 'ملابس، أغذية، إكسسوارات، أي منتج يُشحن للعميل. يشمل سلة شراء، عنوان توصيل، وتتبع حالة الطلب.',
    tags: ['سلة + عنوان', 'شحن وتتبع', 'إدارة المخزون'],
    accent: 'bg-primary-50 text-primary border-primary-200',
    selected: 'border-primary bg-primary-50',
  },
  {
    value: 'digital',
    iconName: 'bolt',
    title: 'منتجات رقمية',
    desc: 'اشتراكات، حسابات، أكواد ألعاب، برامج. لا شحن — قناة محادثة خاصة بين متجرك والعميل لتسليم المنتج.',
    tags: ['دون عنوان', 'تسليم فوري', 'شات مدمج'],
    accent: 'bg-accent-50 text-accent-700 border-accent-200',
    selected: 'border-accent bg-accent-50',
  },
]

export default function OnboardingPage() {
  usePageTitle('إعداد المتجر')
  const navigate  = useNavigate()
  const setStore  = useAuthStore(s => s.setStore)
  const user      = useAuthStore(s => s.user)

  const [selected,  setSelected]  = useState(null)
  const [storeName, setStoreName] = useState('')
  const [nameError, setNameError] = useState('')
  const [loading,   setLoading]   = useState(false)

  async function handleContinue() {
    // Validate
    if (!storeName.trim()) { setNameError('اسم المتجر مطلوب'); return }
    if (storeName.trim().length < 2) { setNameError('الاسم يجب أن يكون حرفين على الأقل'); return }
    if (!selected) { toast.error('اختر نوع المتجر أولاً'); return }

    setLoading(true)
    try {
      const res = await createStore({ name: storeName.trim(), type: selected })
      const store = res.data.data
      setStore(store)
      toast.success('تم إنشاء متجرك بنجاح!')
      navigate('/dashboard', { replace: true })
    } catch (err) {
      toast.error(err?.message || 'حدث خطأ أثناء إنشاء المتجر')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-4" dir="rtl">

      {/* Logo */}
      <img src="/logo.svg" alt="نوامارت" className="h-9 mb-10" />

      {/* Header */}
      <div className="text-center mb-8">
        <p className="text-xs font-semibold text-primary bg-primary-50 border border-primary-200 rounded-pill px-3 py-1 inline-block mb-3 font-cairo">
          الخطوة ١ من ١ — إعداد المتجر
        </p>
        <h1 className="font-cairo font-extrabold text-2xl sm:text-3xl text-text mb-2">
          ما نوع المتجر الذي ستفتحه؟
        </h1>
        <p className="font-cairo text-sm text-text-muted max-w-md mx-auto">
          سنُعدّ كل شيء بناءً على نوع منتجاتك. يمكنك تغيير الاختيار لاحقاً من الإعدادات.
        </p>
      </div>

      {/* Store name input */}
      <div className="w-full max-w-2xl mb-6">
        <label className="block font-cairo font-semibold text-sm text-text mb-1.5">
          اسم المتجر
        </label>
        <input
          type="text"
          value={storeName}
          onChange={e => { setStoreName(e.target.value); setNameError('') }}
          placeholder="مثال: متجر المختار، أكواد برو..."
          className={`w-full font-cairo text-sm px-4 py-2.5 rounded-xl border bg-white text-text placeholder:text-text-subtle outline-none transition-all ${
            nameError
              ? 'border-danger focus:border-danger focus:shadow-[0_0_0_3px_rgba(231,76,60,0.15)]'
              : 'border-border focus:border-primary focus:shadow-[0_0_0_3px_rgba(220,38,38,0.12)]'
          }`}
          disabled={loading}
          maxLength={100}
        />
        {nameError && (
          <p className="font-cairo text-xs text-danger mt-1">{nameError}</p>
        )}
      </div>

      {/* Type cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl mb-8">
        {TYPES.map(type => {
          const isSelected = selected === type.value
          return (
            <button
              key={type.value}
              type="button"
              onClick={() => setSelected(type.value)}
              className={clsx(
                'relative text-start rounded-xl border-2 p-6 transition-all duration-default',
                'hover:shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
                isSelected
                  ? type.selected + ' shadow-card'
                  : 'border-border bg-white hover:border-border-strong',
              )}
            >
              {/* Selected check */}
              {isSelected && (
                <span className="absolute top-4 left-4 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                  <Icon name="check" size={13} strokeWidth={3} className="text-white" />
                </span>
              )}

              {/* Icon */}
              <div className={clsx(
                'w-12 h-12 rounded-xl flex items-center justify-center mb-4 border',
                type.accent,
              )}>
                <Icon name={type.iconName} size={22} />
              </div>

              <h3 className="font-cairo font-bold text-lg text-text mb-1">
                {type.title}
              </h3>
              <p className="font-cairo text-sm text-text-muted leading-relaxed mb-4">
                {type.desc}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {type.tags.map(tag => (
                  <span
                    key={tag}
                    className="text-xs font-semibold font-cairo px-2.5 py-1 rounded-pill bg-bg-soft text-text-muted"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </button>
          )
        })}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between w-full max-w-2xl">
        <span className="flex items-center gap-1.5 text-xs text-text-subtle font-cairo">
          <Icon name="lock" size={13} />
          بياناتك مشفّرة وآمنة
        </span>
        <Button
          variant="primary"
          size="lg"
          loading={loading}
          disabled={!selected || loading}
          onClick={handleContinue}
        >
          {loading ? 'جاري الإنشاء…' : 'إنشاء المتجر'}
          {!loading && <Icon name="arrow-left" size={16} />}
        </Button>
      </div>
    </div>
  )
}
