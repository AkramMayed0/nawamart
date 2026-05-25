import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Ban, Check, Eye, Receipt } from 'lucide-react'
import {
  approveSubscription,
  getAdminSubscriptions,
  rejectSubscription,
} from '@/api/admin'
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
  pro: 'Pro',
  business: 'Business',
}

export default function AdminSubscriptions() {
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
                <p className="truncate font-cairo text-sm font-bold text-text">{subscription.merchant?.name ?? '—'}</p>
                <p className="truncate font-inter text-xs text-text-subtle">{subscription.merchant?.email ?? '—'}</p>
              </div>

              <div className="min-w-0">
                <p className="truncate font-cairo text-sm font-semibold text-text">{subscription.store?.name ?? '—'}</p>
                <p className="truncate font-inter text-xs text-text-subtle">/{subscription.store?.slug ?? 'store'}</p>
              </div>

              <StatusBadge label={PLAN_LABEL[subscription.requestedPlan] ?? subscription.requestedPlan} tone="primary" />

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
                <p className="mt-1 font-cairo text-[11px] text-text-subtle">{formatDate(subscription.createdAt)}</p>
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
                  <span className="font-cairo text-xs text-text-subtle">تمت المراجعة</span>
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
            className="w-full resize-none rounded-lg border border-border px-3.5 py-2.5 font-cairo text-sm text-text outline-none transition-colors placeholder:text-text-subtle focus:border-danger"
          />
        </Modal>
      )}
    </>
  )
}
