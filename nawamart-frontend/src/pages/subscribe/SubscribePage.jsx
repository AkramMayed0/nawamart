/**
 * SubscribePage — /subscribe?plan=pro|business
 *
 * Steps:
 *   1. Plan details  (auto-filled from query param)
 *   2. Wallet        (Cherry / Kuraimi / OneCash)
 *   3. Upload وصل
 *   4. Submit → pending-review screen
 *
 * This file is the page shell + plan details card.
 * Wallet, Wasl, and Submit sections will be added in following units.
 */
import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { ArrowRight, Check, ChevronLeft, Clock, CheckCircle, Zap, Briefcase } from 'lucide-react'
import { PLANS, uploadSubscriptionWasl, createSubscription, getMySubscription } from '@/api/subscriptions'
import { getMyStore } from '@/api/stores'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'
import usePageTitle from '@/hooks/usePageTitle'
import WalletSelector          from '@/components/subscribe/WalletSelector'
import SubscribeWaslUploader   from '@/components/subscribe/SubscribeWaslUploader'

// ── Step indicator ─────────────────────────────────────────────────────────
const STEPS = ['الخطة', 'طريقة الدفع', 'الوصل', 'التأكيد']

function StepsBar({ current }) {          // current = 0-based index
  return (
    <ol className="flex items-center gap-0 w-full mb-8">
      {STEPS.map((label, i) => {
        const done   = i < current
        const active = i === current
        return (
          <li key={i} className="flex-1 flex items-center">
            {/* Circle */}
            <div className="flex flex-col items-center gap-1 relative z-10">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors
                ${done   ? 'bg-primary border-primary text-white'
                : active ? 'bg-white border-primary text-primary'
                         : 'bg-white border-border text-text-subtle'}`}>
                {done ? <Check size={14} strokeWidth={3} /> : i + 1}
              </div>
              <span className={`text-[11px] font-cairo whitespace-nowrap
                ${active ? 'text-primary font-semibold' : done ? 'text-primary' : 'text-text-subtle'}`}>
                {label}
              </span>
            </div>
            {/* Connector line (not after last) */}
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mb-4 mx-1 transition-colors
                ${done ? 'bg-primary' : 'bg-border'}`} />
            )}
          </li>
        )
      })}
    </ol>
  )
}

// ── Plan details card ─────────────────────────────────────────────────────
function PlanCard({ plan }) {
  if (!plan) return null
  return (
    <div className="bg-white border border-border rounded-2xl p-6">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-cairo font-extrabold text-xl text-text">{plan.name}</h3>
            {plan.badge && (
              <span className="bg-accent text-white font-cairo text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                {plan.badge}
              </span>
            )}
          </div>
          <p className="text-sm text-text-muted font-cairo">{plan.nameAr}</p>
        </div>
        <div className="text-left shrink-0">
          <span className="font-inter font-extrabold text-3xl text-text dk-num">
            {plan.price.toLocaleString('en-US')}
          </span>
          <span className="font-cairo text-sm text-text-muted block">ر.ي / شهر</span>
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-4 border-t border-border">
        {plan.features.map((f, i) => (
          <div key={i} className="flex items-center gap-2 text-sm font-cairo text-text">
            <span className="w-4 h-4 rounded-full bg-success-100 flex items-center justify-center shrink-0">
              <Check size={10} strokeWidth={3} className="text-success-dark" />
            </span>
            {f}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Next / Back nav bar ───────────────────────────────────────────────────
function StepNav({ step, totalSteps, onBack, onNext, nextLabel = 'التالي', nextDisabled = false }) {
  return (
    <div className="flex items-center justify-between gap-3 mt-6">
      {/* Back */}
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 font-cairo text-sm font-semibold text-text-muted hover:text-primary transition-colors px-4 py-2.5 rounded-xl border border-border hover:border-primary/30 bg-white"
      >
        <ChevronLeft size={16} />
        رجوع
      </button>

      {/* Step counter */}
      <span className="font-cairo text-xs text-text-subtle">
        <span className="font-en font-bold text-text">{step + 1}</span>
        {' / '}
        <span className="font-en">{totalSteps}</span>
      </span>

      {/* Next */}
      <button
        type="button"
        onClick={onNext}
        disabled={nextDisabled}
        className="inline-flex items-center gap-2 font-cairo font-bold text-sm px-5 py-2.5 rounded-xl bg-primary text-white hover:bg-primary-700 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
      >
        {nextLabel}
        <ArrowRight size={16} className="icon-flip" />
      </button>
    </div>
  )
}

// ── Already-active success screen ────────────────────────────────────────
function SuccessScreen({ sub, onGoHome }) {
  const planMeta = PLANS[sub?.requestedPlan] ?? PLANS.free
  const expiry   = sub?.expiresAt
    ? new Date(sub.expiresAt).toLocaleDateString('ar-YE', { year: 'numeric', month: 'long', day: 'numeric' })
    : null

  return (
    <div className="min-h-screen bg-bg font-cairo flex items-center justify-center px-4" dir="rtl">
      <div className="max-w-md w-full bg-white border border-border rounded-2xl p-8 text-center shadow-sm">

        {/* Icon */}
        <div className="w-16 h-16 rounded-full bg-success-100 flex items-center justify-center mx-auto mb-5">
          <CheckCircle size={30} className="text-success" />
        </div>

        <h2 className="font-extrabold text-xl text-text mb-2">
          اشتراكك نشط بالفعل
        </h2>
        <p className="text-sm text-text-muted leading-relaxed mb-6">
          أنت مشترك في خطة{' '}
          <strong className="text-text">{planMeta.name}</strong> وهي نشطة حالياً.
        </p>

        <div className="flex flex-col gap-2.5 bg-bg rounded-xl px-4 py-3.5 text-sm mb-6 text-right">
          <div className="flex justify-between">
            <span className="text-text-muted">الخطة</span>
            <span className="font-semibold text-text">{planMeta.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-muted">الحالة</span>
            <span className="inline-flex items-center gap-1 font-semibold text-success">
              <CheckCircle size={12} /> نشط
            </span>
          </div>
          {expiry && (
            <div className="flex justify-between">
              <span className="text-text-muted">تنتهي في</span>
              <span className="font-semibold text-text">{expiry}</span>
            </div>
          )}
        </div>

        <button
          onClick={onGoHome}
          className="w-full font-cairo font-bold text-[15px] py-3 rounded-xl bg-primary text-white hover:bg-primary-700 active:scale-95 transition-all"
        >
          العودة للوحة التحكم
        </button>
      </div>
    </div>
  )
}

// ── Pending review screen ─────────────────────────────────────────────────
function PendingScreen({ plan, onGoHome }) {
  return (
    <div className="min-h-screen bg-bg font-cairo flex items-center justify-center px-4" dir="rtl">
      <div className="max-w-md w-full bg-white border border-border rounded-2xl p-8 text-center shadow-sm">

        {/* Icon */}
        <div className="w-16 h-16 rounded-full bg-warning-100 flex items-center justify-center mx-auto mb-5">
          <Clock size={30} className="text-warning" />
        </div>

        {/* Title */}
        <h2 className="font-extrabold text-xl text-text mb-2">
          طلبك قيد المراجعة
        </h2>
        <p className="text-sm text-text-muted leading-relaxed mb-6">
          استلمنا طلب اشتراكك في خطة{' '}
          <strong className="text-text">{plan.name}</strong>.
          سيراجع فريق نواMart الوصل وسيتم تفعيل اشتراكك خلال{' '}
          <strong className="text-primary">24 ساعة</strong>.
        </p>

        {/* Info rows */}
        <div className="flex flex-col gap-2.5 bg-bg rounded-xl px-4 py-3.5 text-sm mb-6 text-right">
          <div className="flex justify-between">
            <span className="text-text-muted">الخطة</span>
            <span className="font-semibold text-text">{plan.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-muted">الحالة</span>
            <span className="inline-flex items-center gap-1 font-semibold text-warning">
              <Clock size={12} /> بانتظار المراجعة
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-muted">التفعيل المتوقع</span>
            <span className="font-semibold text-text">خلال 24 ساعة</span>
          </div>
        </div>

        {/* Action */}
        <button
          onClick={onGoHome}
          className="w-full font-cairo font-bold text-[15px] py-3 rounded-xl bg-primary text-white hover:bg-primary-700 active:scale-95 transition-all"
        >
          العودة للوحة التحكم
        </button>

        <p className="mt-3 text-xs text-text-subtle">
          ستصلك إشعارات عند تفعيل الاشتراك
        </p>
      </div>
    </div>
  )
}

// ── Plan picker card ──────────────────────────────────────────────────────
const PLAN_ICONS = { pro: Zap, business: Briefcase }
const PLAN_COLORS = {
  pro:      { bg: 'bg-primary-50',   iconCls: 'text-primary',    border: 'border-primary-200' },
  business: { bg: 'bg-accent-50',    iconCls: 'text-accent-700', border: 'border-accent-200' },
}

function PlanPicker({ plans, selected, onSelect }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {Object.values(plans).filter(p => p.price > 0).map(p => {
        const isSel = selected === p.key
        const Icon = PLAN_ICONS[p.key]
        const colors = PLAN_COLORS[p.key] || PLAN_COLORS.pro
        return (
          <button key={p.key} type="button" onClick={() => onSelect(p.key)}
            className={`text-right bg-white border-2 rounded-2xl p-6 transition-all hover:shadow-md
              ${isSel ? 'border-accent shadow-sm' : 'border-border hover:border-accent/40'}`}
          >
            {/* Logo icon */}
            <div className={`w-12 h-12 rounded-2xl ${colors.bg} border ${colors.border} flex items-center justify-center mb-4`}>
              {Icon && <Icon size={24} className={colors.iconCls} />}
            </div>

            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-cairo font-extrabold text-xl text-text">{p.name}</h3>
              {p.badge && (
                <span className="bg-accent text-white font-cairo text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                  {p.badge}
                </span>
              )}
            </div>
            <p className="font-cairo text-sm text-text-muted mb-4">{p.nameAr}</p>
            <div className="mb-4">
              <span className="font-inter font-extrabold text-3xl text-text dk-num">
                {p.price.toLocaleString('en-US')}
              </span>
              <span className="font-cairo text-sm text-text-muted mr-1">ر.ي / شهر</span>
            </div>
            <div className="flex flex-col gap-2 pt-3 border-t border-border">
              {p.features.map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-sm font-cairo text-text">
                  <span className="w-4 h-4 rounded-full bg-success-100 flex items-center justify-center shrink-0">
                    <Check size={10} strokeWidth={3} className="text-success-dark" />
                  </span>
                  {f}
                </div>
              ))}
            </div>
            {isSel && (
              <div className="mt-4 w-full bg-accent text-white font-cairo font-bold text-sm py-2 rounded-xl text-center">
                تم الاختيار ✓
              </div>
            )}
          </button>
        )
      })}
    </div>
  )
}

// ── Page shell ────────────────────────────────────────────────────────────
export default function SubscribePage() {
  usePageTitle('الاشتراك')
  const [params]  = useSearchParams()
  const navigate  = useNavigate()
  const store     = useAuthStore(s => s.store)
  const currentPlan = store?.plan || 'free'
  const defaultPlan = currentPlan !== 'free' ? currentPlan : 'pro'
  const [planKey, setPlanKey] = useState(params.get('plan') || defaultPlan)
  const plan      = PLANS[planKey] ?? PLANS.pro

  const [step,        setStep]        = useState(0)
  const [wallet,      setWallet]      = useState('kuraimi')
  const [waslFile,    setWaslFile]    = useState(null)
  const [waslPreview, setWaslPreview] = useState(null)
  const [submitting,  setSubmitting]  = useState(false)
  const [activeSub,   setActiveSub]   = useState(null)   // existing active subscription
  const [storeId,     setStoreId]     = useState(null)   // merchant's store _id
  const [storeError,  setStoreError]  = useState(null)   // no store yet

  // On mount: fetch merchant's store + check for existing active subscription
  useEffect(() => {
    // 1. Get merchant's store to retrieve storeId (backend returns an ARRAY)
    getMyStore()
      .then(res => {
        const stores = res.data.data
        const store = Array.isArray(stores) ? stores[0] : stores
        if (store?._id) setStoreId(store._id)
        else setStoreError('لم يتم العثور على متجر. يرجى إنشاء متجرك أولاً من لوحة التحكم.')
      })
      .catch(() => {
        setStoreError('لم يتم العثور على متجر. يرجى إنشاء متجرك أولاً من لوحة التحكم.')
      })

    // 2. Check if merchant already has an active subscription
    getMySubscription()
      .then(res => {
        // Backend returns an ARRAY of subscriptions
        const subs = res.data.data
        const activeSub = Array.isArray(subs)
          ? subs.find(s => s.status === 'approved')
          : (subs?.status === 'approved' ? subs : null)
        if (activeSub) setActiveSub(activeSub)
      })
      .catch(() => {})   // 404 = no subscription yet, that's fine
  }, [])
  const TOTAL = STEPS.length  // 4 steps: 0 → plan, 1 → wallet, 2 → wasl, 3 → confirm

  function goNext() { setStep(s => Math.min(s + 1, TOTAL - 1)) }
  function goBack() {
    if (step === 0) { navigate(-1); return }
    setStep(s => s - 1)
  }

  async function handleSubmit() {
    if (!waslFile || submitting) return
    if (!storeId) {
      toast.error('لم يتم العثور على متجر. يرجى إنشاء متجرك أولاً.')
      return
    }
    setSubmitting(true)
    try {
      // 1. Upload وصل image to Cloudinary
      const fd = new FormData()
      fd.append('wasl', waslFile)
      const uploadRes = await uploadSubscriptionWasl(fd)
      const waslUrl   = uploadRes.data.data?.url ?? uploadRes.data.url

      // 2. Create subscription — backend expects: { storeId, requestedPlan, waslUrl }
      await createSubscription({ storeId, requestedPlan: planKey, waslUrl })

      // 3. Advance to pending-review screen
      setStep(TOTAL)
    } catch (err) {
      toast.error(err?.message ?? 'حدث خطأ، يرجى المحاولة مجدداً')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Already active subscription guard ──
  if (activeSub) {
    return <SuccessScreen sub={activeSub} onGoHome={() => navigate('/dashboard')} />
  }

  // ── No store yet guard ──
  if (storeError) {
    return (
      <div className="min-h-screen bg-bg font-cairo flex items-center justify-center px-4" dir="rtl">
        <div className="max-w-md w-full bg-white border border-border rounded-2xl p-8 text-center shadow-sm">
          <div className="w-16 h-16 rounded-full bg-danger-100 flex items-center justify-center mx-auto mb-5">
            <Clock size={30} className="text-danger" />
          </div>
          <h2 className="font-extrabold text-xl text-text mb-3">لا يوجد متجر</h2>
          <p className="text-sm text-text-muted mb-6">{storeError}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full font-cairo font-bold text-[15px] py-3 rounded-xl bg-primary text-white hover:bg-primary-700 active:scale-95 transition-all"
          >
            العودة للوحة التحكم
          </button>
        </div>
      </div>
    )
  }

  // ── After submit: show pending screen ──
  if (step === TOTAL) {
    return <PendingScreen plan={plan} onGoHome={() => navigate('/dashboard')} />
  }

  return (
    <div className="min-h-screen bg-bg font-cairo" dir="rtl">

      {/* ── Top bar ── */}
      <header className="bg-white border-b border-border px-4 sm:px-8 py-4 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 rounded-full hover:bg-bg-soft transition-colors text-text-muted"
          aria-label="رجوع"
        >
          <ArrowRight size={20} />
        </button>
        <div>
          <h1 className="font-extrabold text-lg text-text leading-tight">الاشتراك في نواMart</h1>
          <p className="text-xs text-text-muted">خطة {plan.nameAr}</p>
        </div>
        <span className="mr-auto font-inter font-extrabold text-primary text-lg hidden sm:block">
          Nawa<span className="text-accent">Mart</span>
        </span>
      </header>

      {/* ── Body ── */}
      <main className="max-w-2xl mx-auto px-4 py-8">

        {/* Steps bar */}
        <StepsBar current={step} />

        {/* Step 0 — plan picker */}
        {step === 0 && <PlanPicker plans={PLANS} selected={planKey} onSelect={setPlanKey} />}

        {/* Step 1 — wallet selector */}
        {step === 1 && (
          <WalletSelector
            wallet={wallet}
            setWallet={setWallet}
            amount={plan.price}
          />
        )}

        {/* Step 2 — wasl uploader */}
        {step === 2 && (
          <SubscribeWaslUploader
            waslFile={waslFile}
            waslPreview={waslPreview}
            setWaslFile={setWaslFile}
            setWaslPreview={setWaslPreview}
          />
        )}

        {/* Step 3 — review summary before submit */}
        {step === 3 && (
          <div className="bg-white border border-border rounded-2xl p-6 flex flex-col gap-4">
            <h3 className="font-cairo font-bold text-lg text-text">مراجعة الطلب</h3>
            <div className="flex flex-col gap-2 text-sm font-cairo">
              <div className="flex justify-between">
                <span className="text-text-muted">الخطة</span>
                <span className="font-semibold text-text">{plan.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">المبلغ</span>
                <span className="font-inter font-bold text-primary dk-num">
                  {plan.price.toLocaleString('en-US')} ر.ي / شهر
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">طريقة الدفع</span>
                <span className="font-semibold text-text capitalize">{wallet}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-muted">صورة الوصل</span>
                {waslPreview
                  ? <img src={waslPreview} alt="الوصل" className="w-10 h-10 rounded-lg object-cover border border-border" />
                  : <span className="text-danger text-xs">لم يُرفع</span>
                }
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <StepNav
          step={step}
          totalSteps={TOTAL}
          onBack={goBack}
          onNext={step === TOTAL - 1 ? handleSubmit : goNext}
          nextLabel={step === TOTAL - 1
            ? (submitting ? 'جارٍ الإرسال…' : 'إرسال الطلب')
            : 'التالي'}
          nextDisabled={(step === 2 && !waslFile) || submitting}
        />
      </main>
    </div>
  )
}
