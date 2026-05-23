/**
 * SubscriptionWidget
 * Dashboard card showing current plan, expiry date, and upgrade button.
 *
 * Fetches subscription from API on mount.
 * Self-contained — drop it anywhere in the dashboard.
 */
import { useState, useEffect } from 'react'
import { useNavigate }         from 'react-router-dom'
import { Crown, AlertCircle, Clock, RefreshCw } from 'lucide-react'
import clsx                    from 'clsx'
import PlanBadge               from '@/components/ui/PlanBadge'
import { getMySubscription, PLANS } from '@/api/subscriptions'

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
  const navigate = useNavigate()
  const [sub,     setSub]     = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMySubscription()
      .then(res => setSub(res.data.data ?? null))
      .catch(() => setSub(null))
      .finally(() => setLoading(false))
  }, [])

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

  const plan      = sub?.plan ?? 'free'
  const status    = sub?.status ?? 'active'    // free plan is always "active"
  const planMeta  = PLANS[plan] ?? PLANS.free
  const days      = daysUntil(sub?.expiresAt)
  const expLabel  = formatDate(sub?.expiresAt)
  const isFree    = plan === 'free'
  const isExpired = status === 'expired'
  const isPending = status === 'pending'
  const expiringSoon = days !== null && days <= 7 && days > 0 && !isExpired

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
            isFree ? 'bg-bg-soft text-text-subtle' : 'bg-primary/10 text-primary'
          )}>
            <Crown size={18} />
          </div>
          <span className="font-cairo font-bold text-sm text-text">الاشتراك</span>
        </div>
        <PlanBadge plan={plan} status={status} />
      </div>

      {/* ── Info rows ── */}
      <div className="flex flex-col gap-1.5 text-sm font-cairo">

        {/* Expiry */}
        {expLabel && !isFree && (
          <div className="flex items-center justify-between">
            <span className="text-text-muted">تنتهي في</span>
            <span className={clsx(
              'font-semibold',
              isExpired    ? 'text-danger'  :
              expiringSoon ? 'text-warning' :
                             'text-text'
            )}>
              {expLabel}
            </span>
          </div>
        )}

        {/* Days remaining */}
        {days !== null && !isFree && !isExpired && (
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

      {/* ── CTA button ── */}
      {(isFree || isExpired || expiringSoon) && (
        <button
          onClick={() => navigate(`/subscribe?plan=${isFree ? 'pro' : plan}`)}
          className="w-full flex items-center justify-center gap-2 font-cairo font-bold text-sm py-2.5 rounded-xl bg-primary text-white hover:bg-primary-700 active:scale-95 transition-all"
        >
          <Crown size={14} />
          {isFree ? 'ترقية الخطة' : isExpired ? 'تجديد الاشتراك' : 'جدّد الآن'}
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
