/**
 * SubscriptionWidget
 * Dashboard card showing current plan, expiry date, and upgrade button.
 *
 * Fetches subscription from API on mount.
 * Self-contained — drop it anywhere in the dashboard.
 */
import { useEffect, useRef }  from 'react'
import { useNavigate }         from 'react-router-dom'
import { useQuery }            from '@tanstack/react-query'
import { Crown, AlertCircle, Clock, RefreshCw, XCircle } from 'lucide-react'
import clsx                    from 'clsx'
import toast                   from 'react-hot-toast'
import PlanBadge               from '@/components/ui/PlanBadge'
import { useAuthStore }        from '@/store/authStore'
import { getMySubscription, PLANS } from '@/api/subscriptions'
import { getMyStore }          from '@/api/stores'

function daysUntil(isoDate) {
  if (!isoDate) return null
  const diff = new Date(isoDate).getTime() - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

function formatDate(isoDate) {
  if (!isoDate) return null
  return new Date(isoDate).toLocaleDateString('ar-YE', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
}

export default function SubscriptionWidget() {
  const navigate   = useNavigate()
  const storeData  = useAuthStore(s => s.store)
  const currentPlan = storeData?.plan || 'starter'

  const { data: subs, isLoading: subsLoading } = useQuery({
    queryKey: ['my-subscription', storeData?._id],
    queryFn:  () => getMySubscription().then(res => {
      const data = res.data.data
      return Array.isArray(data) ? data : (data ? [data] : [])
    }),
    staleTime: 30_000,
    retry: false,
  })

  const sub = subs?.find(s => ['approved', 'pending'].includes(s.status)) ?? null
  const rejectedSub = subs?.find(s => s.status === 'rejected') ?? null

  const { data: freshStore, isLoading: storeLoading } = useQuery({
    queryKey: ['my-store-fresh', storeData?._id],
    queryFn:  () => getMyStore().then(res => {
      const stores = res.data.data
      return Array.isArray(stores) ? stores[0] ?? null : stores ?? null
    }),
    staleTime: 30_000,
    retry: false,
  })

  const loading = subsLoading || storeLoading

  // ── Toast notification for expiring soon (≤5 days) ──
  const notifiedUrgent = useRef(false)
  useEffect(() => {
    if (notifiedUrgent.current) return
    const expDate = freshStore?.planExpiresAt || sub?.expiresAt || storeData?.planExpiresAt || null
    const d = daysUntil(expDate)
    if (d === null || d > 5 || d <= 0) return
    toast(`اشتراكك ينتهي خلال ${d} أيام — جدّد قبل الانتهاء`, { duration: 5000 })
    notifiedUrgent.current = true
  }, [sub, storeData, freshStore])

  // ── Loading skeleton ──
  if (loading) {
    return (
      <div className="bg-white border border-border rounded-2xl p-5 animate-pulse">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-bg-soft" />
          <div className="h-4 w-24 bg-bg-soft rounded" />
        </div>
        <div className="h-3 w-40 bg-bg-soft rounded mb-2" />
        <div className="h-3 w-28 bg-bg-soft rounded mb-4" />
        <div className="h-9 w-full bg-bg-soft rounded-xl" />
      </div>
    )
  }

  const status     = sub?.status ?? 'active'
  const plan       = status === 'pending' ? (sub?.requestedPlan ?? currentPlan) : currentPlan
  const planMeta   = PLANS[plan] ?? PLANS.starter
  const expiryDate = freshStore?.planExpiresAt || sub?.expiresAt || storeData?.planExpiresAt || null
  const days       = daysUntil(expiryDate)
  const expLabel   = formatDate(expiryDate)
  const isStarter      = plan === 'starter'
  const hasApprovedSub = subs?.some(s => s.status === 'approved') ?? false
  const isTrialExpired  = isStarter && expiryDate && days !== null && days <= 0
  const isOnTrial       = isStarter && !hasApprovedSub && days !== null && days > 0
  const isExpired       = isTrialExpired
  const isPending       = status === 'pending'
  const isRejected      = !!rejectedSub && (!sub || new Date(rejectedSub.createdAt) > new Date(sub.createdAt))
  const expiringSoon    = days !== null && days <= 7 && days > 0 && !isExpired

  return (
    <div className={clsx(
      'bg-white border rounded-2xl p-5 flex flex-col gap-4',
      isExpired      ? 'border-danger/40'   :
      expiringSoon   ? 'border-warning/40'  :
      isPending      ? 'border-warning/40'  :
                       'border-border'
    )}>

      {/* ── Header row ── */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className={clsx(
            'w-9 h-9 rounded-xl flex items-center justify-center shrink-0',
            isOnTrial ? 'bg-success-50 text-success-dark' : isStarter ? 'bg-bg-soft text-text-subtle' : 'bg-primary/10 text-primary'
          )}>
            <Crown size={18} />
          </div>
          <span className="font-cairo font-bold text-sm text-text">{isOnTrial ? 'الفترة التجريبية' : 'الاشتراك'}</span>
        </div>
        <PlanBadge plan={plan} status={status} trial={isOnTrial} />
      </div>

      {/* ── Info rows ── */}
      <div className="flex flex-col gap-1.5 text-sm font-cairo">

        {/* Expiry */}
        {expLabel && !isExpired && (
          <div className="flex items-center justify-between">
            <span className="text-text-muted">تنتهي في</span>
            <span className={clsx(
              'font-semibold',
              expiringSoon ? 'text-warning' : 'text-text'
            )}>
              {expLabel}
            </span>
          </div>
        )}

        {/* Days remaining */}
        {days !== null && !isExpired && (
          <div className="flex items-center justify-between">
            <span className="text-text-muted">المتبقي</span>
            <span className={clsx(
              'font-en font-bold dk-num',
              expiringSoon ? 'text-warning' : 'text-text'
            )}>
              {days} يوم
            </span>
          </div>
        )}
      </div>

      {/* ── Alert banners ── */}
      {isPending && (
        <div className="flex items-start gap-2 bg-warning-100 rounded-xl px-3 py-2.5 text-xs font-cairo text-warning">
          <Clock size={13} className="shrink-0 mt-0.5" />
          <span>طلب الاشتراك قيد المراجعة — سيتم التفعيل خلال 24 ساعة</span>
        </div>
      )}

      {isExpired && (
        <div className="flex items-start gap-2 bg-danger-100 rounded-xl px-3 py-2.5 text-xs font-cairo text-danger">
          <AlertCircle size={13} className="shrink-0 mt-0.5" />
          <span>انتهى اشتراكك — جدّد الآن للاستمرار في استخدام المميزات</span>
        </div>
      )}

      {expiringSoon && (
        <div className="flex items-start gap-2 bg-warning-100 rounded-xl px-3 py-2.5 text-xs font-cairo text-warning">
          <AlertCircle size={13} className="shrink-0 mt-0.5" />
          <span>اشتراكك ينتهي خلال {days} أيام — جدّد قبل الانتهاء</span>
        </div>
      )}

      {isRejected && (
        <div className="flex flex-col gap-2 bg-danger-100 rounded-xl px-3 py-2.5 text-xs font-cairo text-danger">
          <div className="flex items-start gap-2">
            <XCircle size={13} className="shrink-0 mt-0.5" />
            <span>تم رفض طلب الاشتراك السابق</span>
          </div>
          {rejectedSub?.reviewNote && (
            <p className="mr-5 text-danger/80">السبب: {rejectedSub.reviewNote}</p>
          )}
        </div>
      )}

      {/* ── CTA button ── */}
      {(isStarter || isExpired || expiringSoon || isRejected || isOnTrial || plan !== 'business') && (
        <button
          onClick={() => navigate(`/subscribe?plan=${isStarter ? 'pro' : (rejectedSub?.requestedPlan || plan)}`)}
          className="w-full flex items-center justify-center gap-2 font-cairo font-bold text-sm py-2.5 rounded-xl bg-primary text-white hover:bg-primary-700 active:scale-95 transition-all"
        >
          <Crown size={14} />
          {isOnTrial ? 'اشترك الآن' : isTrialExpired ? 'اشترك الآن' : isExpired ? 'تجديد الاشتراك' : isRejected ? 'إعادة المحاولة' : plan !== 'business' ? 'ترقية الخطة' : 'جدّد الآن'}
        </button>
      )}

      {isPending && (
        <button
          onClick={() => window.location.reload()}
          className="w-full flex items-center justify-center gap-2 font-cairo text-sm py-2.5 rounded-xl border border-border text-text-muted hover:bg-bg-soft transition-colors"
        >
          <RefreshCw size={13} />
          تحديث الحالة
        </button>
      )}
    </div>
  )
}
