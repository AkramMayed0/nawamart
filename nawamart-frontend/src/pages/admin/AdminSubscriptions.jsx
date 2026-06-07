import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Ban, Check, Eye, Receipt } from 'lucide-react'
import {
  approveSubscription,
  getAdminSubscriptions,
  rejectSubscription,
} from '@/api/admin'
import usePageTitle from '@/hooks/usePageTitle'
import {
  ActionButton,
  DataTable,
  FilterPills,
  formatDate,
  Modal,
  PageHeader,
  StatusBadge,
  TableRow,
  Toolbar,
} from '@/components/admin/AdminUI'

const SUBSCRIPTION_COLUMNS = 'minmax(180px,1.1fr) minmax(220px,1.3fr) minmax(110px,.7fr) minmax(130px,.8fr) minmax(130px,.8fr) minmax(170px,1fr)'

const STATUS = {
  pending: { label: 'بانتظار المراجعة', tone: 'warning' },
  approved: { label: 'مفعل', tone: 'success' },
  rejected: { label: 'مرفوض', tone: 'danger' },
}

const PLAN_LABEL = {
  starter: 'مبتدئ',
  pro: 'Pro',
  business: 'Business',
}

export default function AdminSubscriptions() {
  usePageTitle('طلبات الاشتراك')
  const queryClient = useQueryClient()
  const [filter, setFilter] = useState('all')
  const [rejectTarget, setRejectTarget] = useState(null)
  const [rejectReason, setRejectReason] = useState('')

  const { data: subscriptions = [], isLoading } = useQuery({
    queryKey: ['admin-subs', filter],
    queryFn: () => getAdminSubscriptions(filter).then((response) => response.data.data ?? []),
    staleTime: 15_000,
  })

  function refreshSubscriptions() {
    queryClient.invalidateQueries({ queryKey: ['admin-subs'] })
    queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
  }

  const approveMut = useMutation({
    mutationFn: approveSubscription,
    onSuccess: () => {
      toast.success('تم تفعيل الاشتراك')
      refreshSubscriptions()
    },
    onError: (error) => toast.error(error?.message || 'فشل تفعيل الاشتراك'),
  })

  const rejectMut = useMutation({
    mutationFn: ({ id, reason }) => rejectSubscription(id, reason),
    onSuccess: () => {
      toast.success('تم رفض الاشتراك')
      refreshSubscriptions()
      setRejectTarget(null)
      setRejectReason('')
    },
    onError: (error) => toast.error(error?.message || 'فشل رفض الاشتراك'),
  })

  return (
    <>
      <PageHeader
        title="طلبات الاشتراك"
        subtitle="مراجعة إيصالات الدفع وتفعيل خطط المتاجر بطريقة واضحة وقابلة للتتبع."
      />

      <Toolbar>
        <FilterPills
          options={[
            { id: 'all', label: 'الكل' },
            { id: 'pending', label: 'معلق' },
            { id: 'approved', label: 'مفعل' },
            { id: 'rejected', label: 'مرفوض' },
          ]}
          value={filter}
          onChange={setFilter}
        />
      </Toolbar>

      <DataTable
        columns={SUBSCRIPTION_COLUMNS}
        headers={['التاجر', 'المتجر', 'الخطة', 'الإيصال', 'الحالة', 'الإجراءات']}
        isLoading={isLoading}
        isEmpty={subscriptions.length === 0}
        emptyTitle="لا توجد طلبات اشتراك"
        emptyMessage="ستظهر طلبات الترقية الجديدة هنا بعد رفع إيصال الدفع من لوحة التاجر."
        minWidth="960px"
      >
        {subscriptions.map((subscription) => {
          const status = STATUS[subscription.status] ?? { label: subscription.status, tone: 'neutral' }

          return (
            <TableRow key={subscription._id} columns={SUBSCRIPTION_COLUMNS}>
              <div className="min-w-0">
                <p className="truncate font-cairo text-sm font-bold text-white">{subscription.merchant?.name ?? '—'}</p>
                <p className="truncate font-inter text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{subscription.merchant?.email ?? '—'}</p>
              </div>

              <div className="min-w-0">
                <p className="truncate font-cairo text-sm font-semibold text-white">{subscription.store?.name ?? '—'}</p>
                <p className="truncate font-inter text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>/{subscription.store?.slug ?? 'store'}</p>
              </div>

              <div className="flex flex-col gap-1">
                <StatusBadge label={PLAN_LABEL[subscription.requestedPlan] ?? subscription.requestedPlan} tone="primary" />
                {subscription.type === 'UPGRADE' && subscription.previousPlan && (
                  <span className="font-cairo text-[10px] text-text-subtle">
                    ترقية من {PLAN_LABEL[subscription.previousPlan] ?? subscription.previousPlan}
                  </span>
                )}
                {subscription.type === 'NEW_SUBSCRIPTION' && (
                  <span className="font-cairo text-[10px] text-primary font-semibold">
                    اشتراك جديد
                  </span>
                )}
                {subscription.billing && (
                  <span className="font-cairo text-[10px] font-bold" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    {subscription.billing === 'yearly' ? 'سنوي' : 'شهري'}
                  </span>
                )}
                {subscription.creditApplied > 0 && (
                  <span className="font-cairo text-[10px]" style={{ color: '#4dd68a' }}>
                    خصم {subscription.creditApplied.toLocaleString('en-US')} ر.ي
                  </span>
                )}
                {subscription.walletCreditGenerated > 0 && (
                  <span className="font-cairo text-[10px]" style={{ color: '#4dd68a' }}>
                    +{subscription.walletCreditGenerated.toLocaleString('en-US')} ر.ي للمحفظة
                  </span>
                )}
                {subscription.amountDue > 0 && (
                  <span className="font-cairo text-[10px] font-bold" style={{ color: '#7aa2d4' }}>
                    المطلوب: {subscription.amountDue.toLocaleString('en-US')} ر.ي
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {subscription.waslUrl ? (
                  <a
                    href={subscription.waslUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-8 items-center justify-center gap-1.5 rounded bg-bg-soft px-3 font-cairo text-xs font-bold text-text-muted transition-colors hover:bg-primary-50 hover:text-primary"
                  >
                    <Eye size={14} />
                    عرض
                  </a>
                ) : (
                  <span className="inline-flex items-center gap-1.5 font-cairo text-xs text-text-subtle">
                    <Receipt size={14} />
                    غير متوفر
                  </span>
                )}
              </div>

              <div>
                <StatusBadge label={status.label} tone={status.tone} />
                {subscription.status === 'approved' && subscription.expiresAt ? (
                  <>
                    <p className="mt-1 font-cairo text-[11px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      ينتهي {formatDate(subscription.expiresAt)}
                    </p>
                    <p className="font-cairo text-[11px] font-bold text-white">
                      {Math.ceil((new Date(subscription.expiresAt).getTime() - Date.now()) / (1000*60*60*24))} يوم متبقي
                    </p>
                  </>
                ) : subscription.status === 'pending' ? (
                  <p className="mt-1 font-cairo text-[11px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    منذ {formatDate(subscription.createdAt)}
                  </p>
                ) : (
                  <p className="mt-1 font-cairo text-[11px]" style={{ color: 'rgba(255,255,255,0.4)' }}>{formatDate(subscription.createdAt)}</p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {subscription.status === 'pending' ? (
                  <>
                    <ActionButton
                      tone="success"
                      icon={Check}
                      onClick={() => approveMut.mutate(subscription._id)}
                      loading={approveMut.isPending}
                    >
                      تفعيل
                    </ActionButton>
                    <ActionButton
                      tone="danger"
                      icon={Ban}
                      onClick={() => {
                        setRejectTarget(subscription)
                        setRejectReason('')
                      }}
                    >
                      رفض
                    </ActionButton>
                  </>
                ) : (
                  <span className="font-cairo text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>تمت المراجعة</span>
                )}
              </div>
            </TableRow>
          )
        })}
      </DataTable>

      {rejectTarget && (
        <Modal
          title="رفض طلب الاشتراك"
          description={`سيتم حفظ سبب الرفض لطلب متجر ${rejectTarget.store?.name ?? ''}.`}
          onClose={() => setRejectTarget(null)}
          footer={
            <>
              <ActionButton tone="neutral" onClick={() => setRejectTarget(null)}>
                إلغاء
              </ActionButton>
              <ActionButton
                tone="danger"
                onClick={() => rejectMut.mutate({ id: rejectTarget._id, reason: rejectReason.trim() })}
                loading={rejectMut.isPending}
                disabled={!rejectReason.trim()}
              >
                تأكيد الرفض
              </ActionButton>
            </>
          }
        >
          <textarea
            value={rejectReason}
            onChange={(event) => setRejectReason(event.target.value)}
            placeholder="اكتب سبب الرفض..."
            rows={4}
            className="w-full resize-none rounded-xl px-4 py-3 font-cairo text-sm text-white outline-none transition-colors"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
          />
        </Modal>
      )}
    </>
  )
}
