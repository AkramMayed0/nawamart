import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { getAdminStores, toggleStoreActive, setStorePlan } from '@/api/admin'
import { SectionHeader, FilterPills, SearchInput, Table, ActiveBadge, ActionBtn, Modal } from '@/components/admin/AdminUI'

const PLAN_BADGE = {
  free:     'bg-slate-100 text-slate-600',
  pro:      'bg-purple-100 text-purple-700',
  business: 'bg-amber-100 text-amber-700',
}

export default function AdminStores() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [planFilter, setPlanFilter] = useState('all')
  const [planModal, setPlanModal] = useState(null)  // { storeId, currentPlan }
  const [newPlan, setNewPlan] = useState('free')
  const [newDays, setNewDays] = useState(30)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-stores', search, planFilter],
    queryFn:  () => getAdminStores({ search, plan: planFilter !== 'all' ? planFilter : undefined, limit: 50 }).then(r => r.data),
    staleTime: 15_000,
  })
  const stores = data?.data ?? []

  const inv = () => queryClient.invalidateQueries({ queryKey: ['admin-stores'] })

  const toggleMut = useMutation({
    mutationFn: (id) => toggleStoreActive(id),
    onSuccess: (r) => { toast.success(r.data.message); inv() },
    onError: (e) => toast.error(e?.response?.data?.message ?? 'فشل'),
  })

  const planMut = useMutation({
    mutationFn: ({ id, plan, days }) => setStorePlan(id, plan, days),
    onSuccess: (r) => { toast.success(r.data.message); inv(); setPlanModal(null) },
    onError: (e) => toast.error(e?.response?.data?.message ?? 'فشل'),
  })

  return (
    <div>
      <SectionHeader title={`المتاجر (${stores.length})`}>
        <div className="flex gap-2 flex-wrap items-center">
          <FilterPills
            options={[
              { id: 'all', label: 'الكل' },
              { id: 'free', label: 'مجاني' },
              { id: 'pro', label: 'Pro' },
              { id: 'business', label: 'Business' },
            ]}
            value={planFilter}
            onChange={setPlanFilter}
          />
          <SearchInput value={search} onChange={setSearch} placeholder="بحث بالاسم..." />
        </div>
      </SectionHeader>

      <Table
        isLoading={isLoading}
        isEmpty={stores.length === 0}
        emptyMsg="لا توجد متاجر"
        cols="grid-cols-[1.5fr_1fr_80px_100px_100px_auto]"
        headers={['المتجر', 'التاجر', 'النوع', 'الخطة', 'الحالة', 'الإجراءات']}
      >
        {stores.map(s => (
          <div key={s._id} className="grid grid-cols-[1.5fr_1fr_80px_100px_100px_auto] gap-4 px-5 py-4 items-center hover:bg-slate-50 transition-colors">
            <div>
              <p className="font-cairo font-semibold text-sm text-slate-800 truncate">{s.name}</p>
              <p className="font-en text-xs text-slate-400">/{s.slug}</p>
            </div>
            <p className="font-cairo text-sm text-slate-600 truncate">{s.merchant?.name ?? '—'}</p>
            <span className="font-cairo text-xs px-2 py-1 rounded-lg bg-slate-100 text-slate-600 text-center">
              {s.type === 'digital' ? '⚡ رقمي' : '🚚 مادي'}
            </span>
            <span className={`font-cairo font-bold text-xs px-2.5 py-1 rounded-lg text-center ${PLAN_BADGE[s.plan] ?? PLAN_BADGE.free}`}>
              {s.plan}
            </span>
            <ActiveBadge isActive={s.isActive} />
            <div className="flex items-center gap-2">
              <ActionBtn color="blue" onClick={() => { setPlanModal({ storeId: s._id, currentPlan: s.plan }); setNewPlan(s.plan); setNewDays(30) }}>خطة</ActionBtn>
              <ActionBtn color={s.isActive ? 'red' : 'green'} onClick={() => toggleMut.mutate(s._id)} loading={toggleMut.isPending}>
                {s.isActive ? 'إيقاف' : 'تفعيل'}
              </ActionBtn>
            </div>
          </div>
        ))}
      </Table>

      {planModal && (
        <Modal title="تغيير خطة المتجر" onClose={() => setPlanModal(null)}>
          <div className="flex flex-col gap-3">
            <div>
              <label className="font-cairo text-sm font-semibold text-slate-700 block mb-1.5">الخطة</label>
              <select value={newPlan} onChange={e => setNewPlan(e.target.value)}
                className="w-full font-cairo text-sm px-3.5 py-2.5 rounded-lg border border-slate-200 outline-none focus:border-slate-500">
                <option value="free">مجاني (Free)</option>
                <option value="pro">Pro ⭐</option>
                <option value="business">Business 💎</option>
              </select>
            </div>
            {newPlan !== 'free' && (
              <div>
                <label className="font-cairo text-sm font-semibold text-slate-700 block mb-1.5">المدة (أيام)</label>
                <input type="number" min={1} max={365} value={newDays} onChange={e => setNewDays(Number(e.target.value))}
                  className="w-full font-en text-sm px-3.5 py-2.5 rounded-lg border border-slate-200 outline-none focus:border-slate-500" />
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button onClick={() => setPlanModal(null)} className="font-cairo text-sm px-4 py-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50">إلغاء</button>
            <button
              onClick={() => planMut.mutate({ id: planModal.storeId, plan: newPlan, days: newDays })}
              disabled={planMut.isPending}
              className="font-cairo font-bold text-sm px-4 py-2 rounded-lg bg-slate-900 text-white hover:opacity-90 disabled:opacity-50"
            >
              {planMut.isPending ? 'جاري…' : 'حفظ'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
