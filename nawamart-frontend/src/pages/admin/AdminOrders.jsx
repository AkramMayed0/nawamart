import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getAdminOrders } from '@/api/admin'
import { SectionHeader, FilterPills, Table, Badge } from '@/components/admin/AdminUI'

const ORDER_STATUS = {
  pending:              { label: 'انتظار الوصل',       cls: 'bg-yellow-100 text-yellow-700' },
  payment_under_review: { label: 'مراجعة الدفع',       cls: 'bg-blue-100 text-blue-700'    },
  confirmed:            { label: 'مؤكد',               cls: 'bg-green-100 text-green-700'  },
  shipped:              { label: 'تم الشحن',           cls: 'bg-indigo-100 text-indigo-700'},
  delivered:            { label: 'تم التسليم',         cls: 'bg-emerald-100 text-emerald-700'},
  rejected:             { label: 'مرفوض',              cls: 'bg-red-100 text-red-700'      },
}

export default function AdminOrders() {
  const [statusFilter, setStatusFilter] = useState('all')

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', statusFilter],
    queryFn:  () => getAdminOrders({ status: statusFilter !== 'all' ? statusFilter : undefined, limit: 100 }).then(r => r.data),
    staleTime: 15_000,
  })
  const orders = data?.data ?? []

  return (
    <div>
      <SectionHeader title={`الطلبات (${orders.length})`}>
        <FilterPills
          options={[
            { id: 'all',                  label: 'الكل' },
            { id: 'pending',              label: 'انتظار وصل' },
            { id: 'payment_under_review', label: 'مراجعة دفع' },
            { id: 'confirmed',            label: 'مؤكد' },
            { id: 'shipped',              label: 'مشحون' },
            { id: 'delivered',            label: 'مُسلَّم' },
            { id: 'rejected',             label: 'مرفوض' },
          ]}
          value={statusFilter}
          onChange={setStatusFilter}
        />
      </SectionHeader>

      <Table
        isLoading={isLoading}
        isEmpty={orders.length === 0}
        emptyMsg="لا توجد طلبات"
        cols="grid-cols-[120px_1fr_1fr_1fr_120px_120px]"
        headers={['رقم الطلب', 'العميل', 'التاجر', 'المتجر', 'المبلغ', 'الحالة']}
      >
        {orders.map(o => (
          <div key={o._id} className="grid grid-cols-[120px_1fr_1fr_1fr_120px_120px] gap-4 px-5 py-4 items-center hover:bg-slate-50 transition-colors">
            <span className="font-inter font-bold text-xs text-slate-800"># {String(o._id).slice(-8).toUpperCase()}</span>
            <p className="font-cairo text-sm text-slate-700 truncate">{o.customer?.name ?? '—'}</p>
            <p className="font-cairo text-sm text-slate-600 truncate">{o.merchant?.name ?? '—'}</p>
            <p className="font-cairo text-sm text-slate-600 truncate">{o.store?.name ?? '—'}</p>
            <span className="font-inter font-bold text-sm text-slate-800">{(o.totalAmount ?? 0).toLocaleString('en-US')} <span className="font-cairo font-normal text-xs text-slate-400">ر.ي</span></span>
            <Badge map={ORDER_STATUS} status={o.status} />
          </div>
        ))}
      </Table>
    </div>
  )
}
