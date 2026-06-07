import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Clock, Save, ToggleLeft, ToggleRight } from 'lucide-react'
import { getAdminStores, setStorePlan, toggleStoreActive } from '@/api/admin'
import usePageTitle from '@/hooks/usePageTitle'
import {
  ActionButton,
  ActiveBadge,
  DataTable,
  FilterPills,
  formatDate,
  Modal,
  PageHeader,
  SearchInput,
  StatusBadge,
  TableRow,
  Toolbar,
} from '@/components/admin/AdminUI'

const STORE_COLUMNS = 'minmax(220px,1.3fr) minmax(160px,1fr) minmax(120px,.7fr) minmax(120px,.7fr) minmax(120px,.7fr) minmax(190px,1fr)'

const PLAN_META = {
  starter: { label: 'مبتدئ', tone: 'neutral' },
  pro: { label: 'Pro', tone: 'primary' },
  business: { label: 'Business', tone: 'accent' },
}

export default function AdminStores() {
  usePageTitle('المتاجر')
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [planFilter, setPlanFilter] = useState('all')
  const [planModal, setPlanModal] = useState(null)
  const [newPlan, setNewPlan] = useState('starter')
  const [newDays, setNewDays] = useState(30)
  const [suspendModal, setSuspendModal] = useState(null)
  const [suspendDays, setSuspendDays] = useState(7)

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), 350)
    return () => window.clearTimeout(timer)
  }, [search])

  const { data, isLoading } = useQuery({
    queryKey: ['admin-stores', debouncedSearch, planFilter],
    queryFn: () =>
      getAdminStores({
        search: debouncedSearch || undefined,
        plan: planFilter !== 'all' ? planFilter : undefined,
        limit: 50,
      }).then((response) => response.data),
    staleTime: 15_000,
  })

  const stores = data?.data ?? []
  const total = data?.pagination?.total ?? stores.length

  function refreshStores() {
    queryClient.invalidateQueries({ queryKey: ['admin-stores'] })
    queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
  }

  const toggleMut = useMutation({
    mutationFn: ({ id, days }) => toggleStoreActive(id, days),
    onSuccess: (response) => {
      toast.success(response.data.message)
      refreshStores()
      setSuspendModal(null)
    },
    onError: (error) => toast.error(error?.message || 'فشل تحديث حالة المتجر'),
  })

  function handleToggle(store) {
    if (store.isActive) {
      setSuspendModal(store)
    } else {
      toggleMut.mutate({ id: store._id })
    }
  }

  const planMut = useMutation({
    mutationFn: ({ id, plan, days }) => setStorePlan(id, plan, days),
    onSuccess: (response) => {
      toast.success(response.data.message)
      refreshStores()
      setPlanModal(null)
    },
    onError: (error) => toast.error(error?.message || 'فشل تحديث خطة المتجر'),
  })

  function openPlanModal(store) {
    setPlanModal(store)
    setNewPlan(store.plan ?? 'starter')
    setNewDays(30)
  }

  return (
    <>
      <PageHeader
        title="المتاجر"
        subtitle="متابعة المتاجر، خطط الاشتراك، وحالة الظهور في الواجهة العامة."
      />

      <Toolbar>
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <SearchInput value={search} onChange={setSearch} placeholder="بحث باسم المتجر أو الرابط..." />
          <FilterPills
            options={[
              { id: 'all', label: 'كل الخطط' },
              { id: 'starter', label: 'مبتدئ' },
              { id: 'pro', label: 'Pro' },
              { id: 'business', label: 'Business' },
            ]}
            value={planFilter}
            onChange={setPlanFilter}
          />
        </div>
        <p className="font-cairo text-sm font-semibold text-text-muted">
          {total.toLocaleString('en-US')} متجر
        </p>
      </Toolbar>

      <DataTable
        columns={STORE_COLUMNS}
        headers={['المتجر', 'التاجر', 'النوع', 'الخطة', 'الحالة', 'الإجراءات']}
        isLoading={isLoading}
        isEmpty={stores.length === 0}
        emptyTitle="لا توجد متاجر"
        emptyMessage="تظهر المتاجر هنا بعد إكمال التاجر لخطوات الإنشاء."
        minWidth="980px"
      >
        {stores.map((store) => {
          const plan = PLAN_META[store.plan] ?? PLAN_META.starter

          return (
            <TableRow key={store._id} columns={STORE_COLUMNS}>
              <div className="min-w-0">
                <p className="truncate font-cairo text-sm font-bold text-white">{store.name ?? '—'}</p>
                <p className="truncate font-inter text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>/{store.slug ?? 'store'}</p>
              </div>
              <p className="truncate font-cairo text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>{store.merchant?.name ?? '—'}</p>
              <StatusBadge
                label={store.type === 'digital' ? 'رقمي' : 'مادي'}
                tone={store.type === 'digital' ? 'info' : 'neutral'}
              />
              <div>
                <StatusBadge label={plan.label} tone={plan.tone} />
                {store.planExpiresAt && (
                  <p className="mt-1 font-cairo text-[11px]" style={{ color: 'rgba(255,255,255,0.4)' }}>ينتهي {formatDate(store.planExpiresAt)}</p>
                )}
              </div>
              <ActiveBadge isActive={store.isActive} />
              <div className="flex flex-wrap items-center gap-2">
                <ActionButton tone="info" onClick={() => openPlanModal(store)}>
                  تعديل الخطة
                </ActionButton>
                <ActionButton
                  tone={store.isActive ? 'danger' : 'success'}
                  icon={store.isActive ? ToggleLeft : ToggleRight}
                  onClick={() => handleToggle(store)}
                  loading={toggleMut.isPending}
                >
                  {store.isActive ? 'إيقاف' : 'تفعيل'}
                </ActionButton>
              </div>
            </TableRow>
          )
        })}
      </DataTable>

      {suspendModal && (
        <Modal
          title="إيقاف المتجر"
          description={`إيقاف متجر ${suspendModal.name}`}
          onClose={() => setSuspendModal(null)}
          footer={
            <>
              <ActionButton tone="neutral" onClick={() => setSuspendModal(null)}>
                إلغاء
              </ActionButton>
              <ActionButton
                tone="danger"
                icon={Clock}
                onClick={() => toggleMut.mutate({ id: suspendModal._id, days: suspendDays })}
                loading={toggleMut.isPending}
              >
                إيقاف
              </ActionButton>
            </>
          }
        >
          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="suspendType" checked={suspendDays === 0} onChange={() => setSuspendDays(0)} className="w-4 h-4 accent-accent" />
              <span className="font-cairo text-sm text-white">إيقاف دائم</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="suspendType" checked={suspendDays > 0} onChange={() => setSuspendDays(7)} className="w-4 h-4 accent-accent" />
              <span className="font-cairo text-sm text-white">إيقاف لمدة</span>
            </label>
            {suspendDays > 0 && (
              <div className="flex items-center gap-2 mr-6">
                <input
                  type="number" min={1} max={365} value={suspendDays}
                  onChange={(e) => setSuspendDays(Number(e.target.value))}
                  className="h-9 w-20 rounded-lg px-3 font-inter text-sm text-white outline-none"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
                />
                <span className="font-cairo text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>يوم</span>
              </div>
            )}
          </div>
        </Modal>
      )}

      {planModal && (
        <Modal
          title="تعديل خطة المتجر"
          description={planModal.name}
          onClose={() => setPlanModal(null)}
          footer={
            <>
              <ActionButton tone="neutral" onClick={() => setPlanModal(null)}>
                إلغاء
              </ActionButton>
              <ActionButton
                icon={Save}
                onClick={() => planMut.mutate({ id: planModal._id, plan: newPlan, days: newDays })}
                loading={planMut.isPending}
                disabled={!newDays || newDays < 1}
              >
                حفظ
              </ActionButton>
            </>
          }
        >
          <div className="grid gap-4">
            <label className="block">
              <span className="mb-1.5 block font-cairo text-sm font-bold text-white">الخطة</span>
              <select
                value={newPlan}
                onChange={(event) => setNewPlan(event.target.value)}
                className="h-10 w-full rounded-xl px-3 font-cairo text-sm text-white outline-none transition-colors"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <option value="starter" style={{ background: '#1c2333' }}>مبتدئ</option>
                <option value="pro" style={{ background: '#1c2333' }}>Pro</option>
                <option value="business" style={{ background: '#1c2333' }}>Business</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block font-cairo text-sm font-bold text-white">المدة بالأيام</span>
              <input
                type="number" min={1} max={365} value={newDays}
                onChange={(event) => setNewDays(Number(event.target.value))}
                className="h-10 w-full rounded-xl px-3 font-inter text-sm text-white outline-none transition-colors"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
              />
            </label>
          </div>
        </Modal>
      )}
    </>
  )
}
