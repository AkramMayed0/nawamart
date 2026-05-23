import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { getAdminSubscriptions, approveSubscription, rejectSubscription } from '@/api/admin'
import { SectionHeader, FilterPills, Table, Badge, ActionBtn, Modal } from '@/components/admin/AdminUI'

const SUB_STATUS = {
  pending:  { label: 'بانتظار المراجعة', cls: 'bg-yellow-100 text-yellow-700' },
  approved: { label: 'مفعّل',            cls: 'bg-green-100 text-green-700'   },
  rejected: { label: 'مرفوض',           cls: 'bg-red-100 text-red-700'      },
}

const PLAN = { pro: 'Pro ⭐', business: 'Business 💎' }

export default function AdminSubscriptions() {
  const queryClient = useQueryClient()
  const [filter, setFilter] = useState('all')
  const [rejectModal, setRejectModal] = useState(null)
  const [rejectReason, setRejectReason] = useState('')

  const { data: subs = [], isLoading } = useQuery({
    queryKey: ['admin-subs', filter],
    queryFn:  () => getAdminSubscriptions(filter).then(r => r.data.data),
    staleTime: 15_000,
  })

  const inv = () => queryClient.invalidateQueries({ queryKey: ['admin-subs'] })

  const approveMut = useMutation({
    mutationFn: (id) => approveSubscription(id),
    onSuccess: () => { toast.success('تم تفعيل الاشتراك ✓'); inv() },
    onError: (e) => toast.error(e?.response?.data?.message ?? 'فشل التفعيل'),
  })

  const rejectMut = useMutation({
    mutationFn: ({ id, reason }) => rejectSubscription(id, reason),
    onSuccess: () => { toast.success('تم رفض الاشتراك'); inv(); setRejectModal(null); setRejectReason('') },
    onError: (e) => toast.error(e?.response?.data?.message ?? 'فشل الرفض'),
  })

  return (
    <div>
      <SectionHeader title="طلبات الاشتراك">
        <FilterPills
          options={[
            { id: 'all', label: 'الكل' },
            { id: 'pending', label: '⏳ معلق' },
            { id: 'approved', label: '✅ مفعّل' },
            { id: 'rejected', label: '❌ مرفوض' },
          ]}
          value={filter}
          onChange={setFilter}
        />
      </SectionHeader>

      <Table
        isLoading={isLoading}
        isEmpty={subs.length === 0}
        emptyMsg="لا توجد طلبات اشتراك"
        cols="grid-cols-[1fr_1.5fr_80px_100px_130px_auto]"
        headers={['التاجر', 'المتجر', 'الخطة', 'الوصل', 'الحالة', 'الإجراءات']}
      >
        {subs.map(sub => (
          <div key={sub._id} className="grid grid-cols-[1fr_1.5fr_80px_100px_130px_auto] gap-4 px-5 py-4 items-center hover:bg-slate-50 transition-colors">
            <div>
              <p className="font-cairo font-semibold text-sm text-slate-800 truncate">{sub.merchant?.name ?? '—'}</p>
              <p className="font-en text-xs text-slate-400 truncate">{sub.merchant?.email}</p>
            </div>
            <div>
              <p className="font-cairo text-sm text-slate-700 truncate">{sub.store?.name ?? '—'}</p>
              <p className="font-en text-xs text-slate-400">/{sub.store?.slug}</p>
            </div>
            <span className="font-cairo font-bold text-xs px-2 py-1 rounded-lg bg-slate-900 text-white text-center">
              {PLAN[sub.requestedPlan] ?? sub.requestedPlan}
            </span>
            {sub.waslUrl
              ? <a href={sub.waslUrl} target="_blank" rel="noopener noreferrer" className="w-14 h-14 rounded-lg overflow-hidden border border-slate-200 block hover:opacity-75 transition-opacity shrink-0"><img src={sub.waslUrl} alt="وصل" className="w-full h-full object-cover" /></a>
              : <span className="text-slate-300 text-xs font-cairo">لا يوجد</span>
            }
            <Badge map={SUB_STATUS} status={sub.status} />
            <div className="flex items-center gap-2">
              {sub.status === 'pending' && <>
                <ActionBtn color="green" onClick={() => approveMut.mutate(sub._id)} loading={approveMut.isPending}>تفعيل</ActionBtn>
                <ActionBtn color="red"   onClick={() => { setRejectModal(sub._id); setRejectReason('') }}>رفض</ActionBtn>
              </>}
              {sub.status !== 'pending' && <span className="text-slate-300 text-sm">—</span>}
            </div>
          </div>
        ))}
      </Table>

      {rejectModal && (
        <Modal title="رفض طلب الاشتراك" onClose={() => setRejectModal(null)}>
          <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="سبب الرفض..." rows={3}
            className="w-full font-cairo text-sm px-3.5 py-2.5 rounded-lg border border-slate-200 outline-none focus:border-red-400 resize-none transition-colors" />
          <div className="flex justify-end gap-2 mt-4">
            <button onClick={() => setRejectModal(null)} className="font-cairo text-sm px-4 py-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50">إلغاء</button>
            <button
              onClick={() => rejectMut.mutate({ id: rejectModal, reason: rejectReason })}
              disabled={!rejectReason.trim() || rejectMut.isPending}
              className="font-cairo font-bold text-sm px-4 py-2 rounded-lg bg-red-600 text-white hover:opacity-90 disabled:opacity-50"
            >
              {rejectMut.isPending ? 'جاري…' : 'تأكيد الرفض'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
