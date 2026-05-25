import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Save, ToggleLeft, ToggleRight } from 'lucide-react'
import { getAdminStores, setStorePlan, toggleStoreActive } from '@/api/admin'
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
  free: { label: 'مجاني', tone: 'neutral' },
  pro: { label: 'Pro', tone: 'primary' },
  business: { label: 'Business', tone: 'accent' },
}

export default function AdminStores() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [planFilter, setPlanFilter] = useState('all')
  const [planModal, setPlanModal] = useState(null)
  const [newPlan, setNewPlan] = useState('free')
  const [newDays, setNewDays] = useState(30)

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
    mutationFn: toggleStoreActive,
    onSuccess: (response) => {
      toast.success(response.data.message)
      refreshStores()
    },
    onError: (error) => toast.error(error?.message || 'فشل تحديث حالة المتجر'),
  })

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
    setNewPlan(store.plan ?? 'free')
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
              { id: 'free', label: 'مجاني' },
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
          const plan = PLAN_META[store.plan] ?? PLAN_META.free

          return (
            <TableRow key={store._id} columns={STORE_COLUMNS}>
              <div className="min-w-0">
                <p className="truncate font-cairo text-sm font-bold text-text">{store.name ?? '—'}</p>
                <p className="truncate font-inter text-xs text-text-subtle">/{store.slug ?? 'store'}</p>
              </div>
              <p className="truncate font-cairo text-sm text-text-muted">{store.merchant?.name ?? '—'}</p>
              <StatusBadge
                label={store.type === 'digital' ? 'رقمي' : 'مادي'}
                tone={store.type === 'digital' ? 'info' : 'neutral'}
              />
              <div>
                <StatusBadge label={plan.label} tone={plan.tone} />
                {store.planExpiresAt && (
                  <p className="mt-1 font-cairo text-[11px] text-text-subtle">ينتهي {formatDate(store.planExpiresAt)}</p>
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
                  onClick={() => toggleMut.mutate(store._id)}
                  loading={toggleMut.isPending}
                >
                  {store.isActive ? 'إيقاف' : 'تفعيل'}
                </ActionButton>
              </div>
            </TableRow>
          )
        })}
      </DataTable>

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
                disabled={newPlan !== 'free' && (!newDays || newDays < 1)}
              >
                حفظ
              </ActionButton>
            </>
          }
        >
          <div className="grid gap-4">
            <label className="block">
              <span className="mb-1.5 block font-cairo text-sm font-bold text-text">الخطة</span>
              <select
                value={newPlan}
                onChange={(event) => setNewPlan(event.target.value)}
                className="h-10 w-full rounded-lg border border-border bg-white px-3 font-cairo text-sm text-text outline-none transition-colors focus:border-primary"
              >
                <option value="free">مجاني</option>
                <option value="pro">Pro</option>
                <option value="business">Business</option>
              </select>
            </label>

            {newPlan !== 'free' && (
              <label className="block">
                <span className="mb-1.5 block font-cairo text-sm font-bold text-text">المدة بالأيام</span>
                <input
                  type="number"
                  min={1}
                  max={365}
                  value={newDays}
                  onChange={(event) => setNewDays(Number(event.target.value))}
                  className="h-10 w-full rounded-lg border border-border bg-white px-3 font-inter text-sm text-text outline-none transition-colors focus:border-primary"
                />
              </label>
            )}
          </div>
        </Modal>
      )}
    </>
  )
}
