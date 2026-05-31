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
import { ArrowRight, Check, ChevronLeft, Clock, CheckCircle, XCircle, Zap, Briefcase, Sparkles } from 'lucide-react'
import { PLANS, uploadSubscriptionWasl, createSubscription, getMySubscription, getSubscriptionProration } from '@/api/subscriptions'
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
    <ol className="flex items-center justify-center gap-0 mb-8 mx-auto">
      {STEPS.map((label, i) => {
        const done   = i < current
        const active = i === current
        return (
          <li key={i} className="flex items-start">
            <div className="flex flex-col items-center gap-1 w-24">
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
            {i < STEPS.length - 1 && (
              <div className={`w-12 h-0.5 mt-4 transition-colors
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
function SuccessScreen({ plan: planKey, expiry: expiryIso, billing, onGoHome }) {
  const planMeta = PLANS[planKey] ?? PLANS.starter
  const expiry   = expiryIso
    ? new Date(expiryIso).toLocaleDateString('ar-YE', { year: 'numeric', month: 'long', day: 'numeric' })
    : null

  const billingLabel = billing === 'yearly' ? 'السنوية' : 'الشهرية'

  return (
    <div className="min-h-screen bg-bg font-cairo flex items-center justify-center px-4" dir="rtl">
      <div className="max-w-md w-full bg-white border border-border rounded-2xl p-8 text-center shadow-sm">

        {/* Icon */}
        <div className="w-16 h-16 rounded-full bg-success-100 flex items-center justify-center mx-auto mb-5">
          <CheckCircle size={30} className="text-success" />
        </div>

        <h2 className="font-extrabold text-xl text-text mb-2">
          {billing ? `أنت في أعلى خطة ${billingLabel}` : 'اشتراكك نشط بالفعل'}
        </h2>
        <p className="text-sm text-text-muted leading-relaxed mb-6">
          {billing
            ? `أنت مشترك في أعلى خطة ${billingLabel} متاحة (${planMeta.name}). لا توجد خطط أعلى للترقية إليها.`
            : <>أنت مشترك في خطة <strong className="text-text">{planMeta.name}</strong> وهي نشطة حالياً.</>
          }
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

// ── Billing toggle ────────────────────────────────────────────────────────
function BillingToggle({ billing, onChange, plan }) {
  return (
    <div className="flex items-center justify-center mb-8">
      <div className="relative bg-bg-soft rounded-2xl p-1 flex gap-1 shadow-inner">
        <button
          type="button"
          onClick={() => onChange('monthly')}
          className={`relative font-cairo font-bold text-sm px-8 py-2.5 rounded-xl transition-all ${
            billing === 'monthly'
              ? 'bg-white text-text shadow-sm'
              : 'text-text-muted hover:text-text'
          }`}
        >
          شهري
        </button>
        <button
          type="button"
          onClick={() => onChange('yearly')}
          className={`relative font-cairo font-bold text-sm px-8 py-2.5 rounded-xl transition-all ${
            billing === 'yearly'
              ? 'bg-white text-accent-700 shadow-sm'
              : 'text-text-muted hover:text-text'
          }`}
        >
          سنوي
          <span className="absolute -top-2.5 -right-2 bg-accent text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 whitespace-nowrap">
            <Sparkles size={8} /> وفر 17%
          </span>
        </button>
      </div>
    </div>
  )
}

// ── Plan picker card ──────────────────────────────────────────────────────
const PLAN_ICONS = { starter: Sparkles, pro: Zap, business: Briefcase }
const PLAN_COLORS = {
  starter:  { bg: 'bg-bg-soft',      iconCls: 'text-text-muted', border: 'border-border' },
  pro:      { bg: 'bg-primary-50',   iconCls: 'text-primary',    border: 'border-primary-200' },
  business: { bg: 'bg-amber-50',    iconCls: 'text-amber-700', border: 'border-amber-200' },
}

function PlanPicker({ plans, selected, onSelect, billing }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Object.values(plans).filter(p => p.price > 0).map(p => {
        const isSel = selected === p.key
        const Icon = PLAN_ICONS[p.key]
        const colors = PLAN_COLORS[p.key] || PLAN_COLORS.pro
        const monthlyAfterDiscount = Math.round((p.yearlyPrice ?? p.price * 12) / 12)
        const displayPrice = billing === 'yearly' ? monthlyAfterDiscount : p.price
        const priceLabel = 'ر.ي / شهر'
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
                {displayPrice.toLocaleString('en-US')}
              </span>
              <span className="font-cairo text-sm text-text-muted mr-1">{priceLabel}</span>
              {billing === 'yearly' && (
                <span className="block text-[11px] text-accent font-semibold mt-0.5">
                  وفر 17% — بدلاً من {p.price.toLocaleString('en-US')} ر.ي / شهر
                </span>
              )}
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
  const store         = useAuthStore(s => s.store)

  const [step,        setStep]        = useState(0)
  const [wallet,      setWallet]      = useState('kuraimi')
  const [waslFile,    setWaslFile]    = useState(null)
  const [waslPreview, setWaslPreview] = useState(null)
  const [submitting,  setSubmitting]  = useState(false)
  const [storeId,     setStoreId]     = useState(null)   // merchant's store _id
  const [storeError,  setStoreError]  = useState(null)   // no store yet
  const [pendingSub,   setPendingSub]   = useState(null)   // pending subscription request
  const [rejectedSub,   setRejectedSub]   = useState(null)   // rejected subscription
  const [approvedSub,   setApprovedSub]   = useState(null)   // last approved subscription
  const [freshStore,    setFreshStore]    = useState(null)   // API-fetched store data
  const [proration,     setProration]     = useState(null)   // { upgradeCost, remainingValue, walletCredit, ... }
  const [prorationLoad, setProrationLoad] = useState(false)

  // Use API-fetched store data (not stale Zustand) for plan checks
  const activeStore     = freshStore || store
  const currentPlan     = activeStore?.plan || 'starter'
  const [billing, setBilling] = useState('monthly')

  // ── Billing cycle lock for upgrades (non-free-trial, billing is fixed) ──
  const hasBillingLock = !!approvedSub
  const lockedBilling  = approvedSub?.billing ?? 'monthly'
  const effectiveBilling = hasBillingLock ? lockedBilling : billing

  // ── Plan hierarchy for upgrade targeting ──
  const PLAN_HIERARCHY = { starter: 1, pro: 2, business: 3 }
  const currentRank    = PLAN_HIERARCHY[currentPlan] ?? 1
  // Free Trial = starter plan with planExpiresAt but no approved subscription yet
  const allowedPlans   = activeStore?.plan === 'starter' && !approvedSub && activeStore?.planExpiresAt
    ? PLANS
    : Object.fromEntries(
        Object.entries(PLANS).filter(([, p]) => PLAN_HIERARCHY[p.key] > currentRank)
      )
  const atHighestPlan  = Object.keys(allowedPlans).length === 0
  const defaultPlan    = params.get('plan') && PLAN_HIERARCHY[params.get('plan')] > currentRank
    ? params.get('plan')
    : Object.keys(allowedPlans)[0] ?? currentPlan

  const [planKey, setPlanKey] = useState(defaultPlan)
  const plan            = PLANS[planKey] ?? PLANS.starter
  const currentPrice    = billing === 'yearly' ? (plan.yearlyPrice ?? plan.price * 12) : plan.price
  const displayPrice    = proration?.upgradeCost ?? currentPrice
  const hasCredit       = proration && proration.remainingValue > 0
  const hasWalletCredit = proration && proration.walletCredit > 0
  const storePlan       = activeStore?.plan || 'starter'
  const storeExpiresAt  = activeStore?.planExpiresAt
  const daysRemaining   = storeExpiresAt ? Math.ceil((new Date(storeExpiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null
  const isPlanExpired   = storeExpiresAt && new Date(storeExpiresAt) <= new Date()
  const isPlanActive    = !!storeExpiresAt ? !isPlanExpired : storePlan !== 'starter'
  const expiringSoon    = daysRemaining !== null && daysRemaining <= 7 && daysRemaining > 0
  // Free trial = starter plan with planExpiresAt but no approved subscription yet
  const onFreeTrial     = storePlan === 'starter' && !approvedSub && storeExpiresAt

  // ── Fetch proration when plan or billing changes ──
  useEffect(() => {
    if (!storeId) return
    setProrationLoad(true)
    getSubscriptionProration(planKey, effectiveBilling)
      .then(res => setProration(res.data.data))
      .catch(() => setProration(null))
      .finally(() => setProrationLoad(false))
  }, [planKey, effectiveBilling, storeId])

  // On mount: fetch merchant's store + check for pending subscription
  useEffect(() => {
    getMyStore()
      .then(res => {
        const stores = res.data.data
        const store = Array.isArray(stores) ? stores[0] : stores
        if (store?._id) {
          setStoreId(store._id)
          setFreshStore(store)
        } else {
          setStoreError('لم يتم العثور على متجر. يرجى إنشاء متجرك أولاً من لوحة التحكم.')
        }
      })
      .catch(() => {
        setStoreError('لم يتم العثور على متجر. يرجى إنشاء متجرك أولاً من لوحة التحكم.')
      })

    getMySubscription()
      .then(res => {
        const subs = res.data.data
        const subsArr = Array.isArray(subs) ? subs : [subs].filter(Boolean)
        const pending = subsArr.find(s => s.status === 'pending')
        if (pending) setPendingSub(pending)
        const rejected = subsArr.find(s => s.status === 'rejected')
        if (rejected) setRejectedSub(rejected)
        const approved = subsArr.find(s => s.status === 'approved')
        if (approved) setApprovedSub(approved)
      })
      .catch(() => {})
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

      // 2. Create subscription — backend expects: { storeId, requestedPlan, waslUrl, billing }
      await createSubscription({ storeId, requestedPlan: planKey, waslUrl, billing: effectiveBilling })

      // 3. Advance to pending-review screen
      setStep(TOTAL)
    } catch (err) {
      toast.error(err?.message ?? 'حدث خطأ، يرجى المحاولة مجدداً')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Highest plan guard ──
  // If the user is on Business (top plan), show the "already active" screen
  // since there are no valid upgrade targets.
  if (freshStore && atHighestPlan && isPlanActive) {
    return <SuccessScreen plan={storePlan} expiry={storeExpiresAt} billing={hasBillingLock ? lockedBilling : null} onGoHome={() => navigate('/dashboard')} />
  }

  // ── Pending subscription guard ──
  if (pendingSub) {
    return <PendingScreen plan={PLANS[pendingSub.requestedPlan] ?? PLANS.pro} onGoHome={() => navigate('/dashboard')} />
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
      <main className="max-w-5xl mx-auto px-4 py-8">

        {storePlan === 'starter' && isPlanExpired && (
          <div className="flex items-start gap-2 bg-danger-100 rounded-xl px-4 py-3 mb-6 text-xs font-cairo text-danger">
            <Clock size={13} className="shrink-0 mt-0.5" />
            <span>انتهت الفترة التجريبية — اختر خطة للاستمرار في استخدام متجرك</span>
          </div>
        )}

        {rejectedSub && !pendingSub && !isPlanActive &&
          (!approvedSub || new Date(rejectedSub.createdAt) > new Date(approvedSub.createdAt)) && (
          <div className="flex flex-col gap-1.5 bg-danger-100 rounded-2xl px-4 py-3 mb-6 text-xs font-cairo text-danger">
            <div className="flex items-start gap-2">
              <XCircle size={14} className="shrink-0 mt-0.5" />
              <span className="font-bold">تم رفض طلب الاشتراك السابق</span>
            </div>
            {rejectedSub.reviewNote && (
              <p className="mr-6 text-danger/80">السبب: {rejectedSub.reviewNote}</p>
            )}
            <p className="mr-6 text-danger/80">يرجى إرسال طلب جديد بعد التأكد من صحة الإيصال</p>
          </div>
        )}

        {/* Steps bar */}
        <StepsBar current={step} />

        {/* Step 0 — plan picker */}
        {step === 0 && (
          <>
            {atHighestPlan ? (
              <div className="bg-white border border-border rounded-2xl p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-success-100 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={28} className="text-success" />
                </div>
                <h3 className="font-cairo font-extrabold text-xl text-text mb-2">
                  {hasBillingLock
                    ? `أنت مشترك في أعلى خطة ${lockedBilling === 'yearly' ? 'سنوية' : 'شهرية'} متاحة`
                    : 'أنت مشترك في أعلى خطة متاحة'}
                </h3>
                <p className="font-cairo text-sm text-text-muted leading-relaxed">
                  {hasBillingLock
                    ? `أنت حالياً في خطة ${PLANS[storePlan]?.name} ${lockedBilling === 'yearly' ? 'السنوية' : 'الشهرية'}. لا توجد خطط أعلى للترقية إليها.`
                    : `أنت حالياً في خطة ${PLANS[storePlan]?.name}. لا توجد خطط أعلى للترقية إليها.`}
                </p>
              </div>
            ) : (
              <>
                {!hasBillingLock && <BillingToggle billing={billing} onChange={setBilling} plan={plan} />}
                {hasBillingLock && (
                  <div className="flex items-center justify-center mb-6">
                    <span className="bg-primary-50 text-primary font-cairo font-bold text-sm px-5 py-2 rounded-xl">
                      الفوترة: {lockedBilling === 'yearly' ? 'سنوي' : 'شهري'}
                    </span>
                  </div>
                )}
                <PlanPicker plans={allowedPlans} selected={planKey} onSelect={setPlanKey} billing={effectiveBilling} />
              </>
            )}
          </>
        )}

        {/* Step 1 — wallet selector */}
        {step === 1 && (
          <>
            {hasCredit && (
              <div className="flex items-start gap-2 bg-success-50 rounded-xl px-4 py-3 mb-4 text-xs font-cairo text-success-dark">
                <CheckCircle size={13} className="shrink-0 mt-0.5" />
                <span>
                  تم خصم{' '}
                  <strong>{proration.remainingValue.toLocaleString('en-US')} ر.ي</strong>{' '}
                  كرصيد متبقي من خطتك الحالية. المبلغ المطلوب:{' '}
                  <strong>{displayPrice.toLocaleString('en-US')} ر.ي</strong>
                </span>
              </div>
            )}
            {proration?.walletCredit > 0 && (
              <div className="flex items-start gap-2 bg-success-50 rounded-xl px-4 py-3 mb-4 text-xs font-cairo text-success-dark">
                <CheckCircle size={13} className="shrink-0 mt-0.5" />
                <span>
                  تم إضافة{' '}
                  <strong>{proration.walletCredit.toLocaleString('en-US')} ر.ي</strong>{' '}
                  كرصيد في محفظتك لاستخدامه لاحقاً.
                </span>
              </div>
            )}
            <WalletSelector
              wallet={wallet}
              setWallet={setWallet}
              amount={displayPrice}
            />
          </>
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
                  {displayPrice.toLocaleString('en-US')} ر.ي
                </span>
              </div>
              {hasCredit && (
                <div className="flex justify-between text-success-dark">
                  <span className="text-text-muted">رصيد الخطة السابقة</span>
                  <span className="font-inter font-bold dk-num">
                    -{proration.remainingValue.toLocaleString('en-US')} ر.ي
                  </span>
                </div>
              )}
              {hasWalletCredit && (
                <div className="flex justify-between text-success-dark">
                  <span className="text-text-muted">رصيد المحفظة</span>
                  <span className="font-inter font-bold dk-num">
                    -{proration.walletCredit.toLocaleString('en-US')} ر.ي
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-text-muted">مدة الفوترة</span>
                <span className="font-semibold text-text">{effectiveBilling === 'yearly' ? 'سنوي' : 'شهري'}</span>
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
