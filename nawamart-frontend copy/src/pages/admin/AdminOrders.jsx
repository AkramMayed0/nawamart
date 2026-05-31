import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getAdminOrders } from '@/api/admin'
import usePageTitle from '@/hooks/usePageTitle'
import {
  DataTable,
  FilterPills,
  formatCurrency,
  formatDate,
  PageHeader,
  StatusBadge,
  TableRow,
  Toolbar,
} from '@/components/admin/AdminUI'

const ORDER_COLUMNS = 'minmax(130px,.8fr) minmax(170px,1fr) minmax(170px,1fr) minmax(180px,1fr) minmax(130px,.8fr) minmax(150px,.8fr)'

const ORDER_STATUS = {
  pending: { label: 'بانتظار الوصل', tone: 'warning' },
  payment_under_review: { label: 'مراجعة الدفع', tone: 'info' },
  confirmed: { label: 'مؤكد', tone: 'success' },
  shipped: { label: 'تم الشحن', tone: 'primary' },
  delivered: { label: 'تم التسليم', tone: 'success' },
  rejected: { label: 'مرفوض', tone: 'danger' },
}

export default function AdminOrders() {
  usePageTitle('الطلبات')
  const [statusFilter, setStatusFilter] = useState('all')

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', statusFilter],
    queryFn: () =>
      getAdminOrders({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        limit: 100,
      }).then((response) => response.data),
    staleTime: 15_000,
  })

  const orders = data?.data ?? []
  const total = data?.pagination?.total ?? orders.length

  return (
    <>
      <PageHeader
        title="الطلبات"
        subtitle="عرض شامل لحركة الطلبات عبر كل المتاجر والعملاء."
      />

      <Toolbar>
        <FilterPills
          options={[
            { id: 'all', label: 'الكل' },
            { id: 'pending', label: 'بانتظار الوصل' },
            { id: 'payment_under_review', label: 'مراجعة الدفع' },
            { id: 'confirmed', label: 'مؤكد' },
            { id: 'shipped', label: 'مشحون' },
            { id: 'delivered', label: 'مسلم' },
            { id: 'rejected', label: 'مرفوض' },
          ]}
          value={statusFilter}
          onChange={setStatusFilter}
        />
        <p className="font-cairo text-sm font-semibold text-text-muted">
          {total.toLocaleString('en-US')} طلب
        </p>
      </Toolbar>

      <DataTable
        columns={ORDER_COLUMNS}
        headers={['رقم الطلب', 'العميل', 'التاجر', 'المتجر', 'المبلغ', 'الحالة']}
        isLoading={isLoading}
        isEmpty={orders.length === 0}
        emptyTitle="لا توجد طلبات"
        emptyMessage="ستظهر الطلبات الجديدة هنا عند بدء العملاء بالشراء."
        minWidth="960px"
      >
        {orders.map((order) => {
          const status = ORDER_STATUS[order.status] ?? { label: order.status, tone: 'neutral' }

          return (
            <TableRow key={order._id} columns={ORDER_COLUMNS}>
              <div>
                <p className="font-inter text-xs font-extrabold uppercase text-text">#{String(order._id).slice(-8)}</p>
                <p className="mt-1 font-cairo text-[11px] text-text-subtle">{formatDate(order.createdAt)}</p>
              </div>
              <div className="min-w-0">
                <p className="truncate font-cairo text-sm font-semibold text-text">{order.customer?.name ?? '—'}</p>
                <p className="truncate font-inter text-xs text-text-subtle">{order.customer?.phone ?? order.customer?.email ?? '—'}</p>
              </div>
              <p className="truncate font-cairo text-sm text-text-muted">{order.merchant?.name ?? '—'}</p>
              <div className="min-w-0">
                <p className="truncate font-cairo text-sm text-text-muted">{order.store?.name ?? '—'}</p>
                <p className="truncate font-inter text-xs text-text-subtle">/{order.store?.slug ?? 'store'}</p>
              </div>
              <p className="font-inter text-sm font-extrabold text-text">{formatCurrency(order.totalAmount)}</p>
              <StatusBadge label={status.label} tone={status.tone} />
            </TableRow>
          )
        })}
      </DataTable>
    </>
  )
}
