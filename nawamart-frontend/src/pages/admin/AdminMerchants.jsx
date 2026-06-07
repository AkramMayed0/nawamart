import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { ToggleLeft, ToggleRight, Clock } from 'lucide-react'
import { getAdminMerchants, toggleMerchantActive } from '@/api/admin'
import usePageTitle from '@/hooks/usePageTitle'
import {
  ActionButton,
  ActiveBadge,
  DataTable,
  Modal,
  PageHeader,
  SearchInput,
  TableRow,
  Toolbar,
} from '@/components/admin/AdminUI'

const MERCHANT_COLUMNS = 'minmax(180px,1fr) minmax(220px,1.2fr) minmax(150px,.8fr) minmax(120px,.6fr) minmax(120px,.6fr)'

export default function AdminMerchants() {
  usePageTitle('التجار')
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [suspendModal, setSuspendModal] = useState(null)
  const [suspendDays, setSuspendDays] = useState(7)

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), 350)
    return () => window.clearTimeout(timer)
  }, [search])

  const { data, isLoading } = useQuery({
    queryKey: ['admin-merchants', debouncedSearch],
    queryFn: () => getAdminMerchants({ search: debouncedSearch || undefined, limit: 50 }).then((response) => response.data),
    staleTime: 15_000,
  })

  const merchants = data?.data ?? []
  const total = data?.pagination?.total ?? merchants.length

  const toggleMut = useMutation({
    mutationFn: ({ id, days }) => toggleMerchantActive(id, days),
    onSuccess: (response) => {
      toast.success(response.data.message)
      queryClient.invalidateQueries({ queryKey: ['admin-merchants'] })
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
      setSuspendModal(null)
    },
    onError: (error) => toast.error(error?.message || 'فشل تحديث حالة التاجر'),
  })

  function handleToggle(merchant) {
    if (merchant.isActive) {
      setSuspendModal(merchant)
    } else {
      toggleMut.mutate({ id: merchant._id })
    }
  }

  return (
    <>
      <PageHeader
        title="التجار"
        subtitle="إدارة حسابات التجار والتحقق من حالتهم بدون التأثير على جلسات العملاء."
      />

      <Toolbar>
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="بحث بالاسم أو البريد أو الهاتف..."
        />
        <p className="font-cairo text-sm font-semibold text-text-muted">
          {total.toLocaleString('en-US')} تاجر
        </p>
      </Toolbar>

      <DataTable
        columns={MERCHANT_COLUMNS}
        headers={['الاسم', 'البريد الإلكتروني', 'الهاتف', 'الحالة', 'الإجراء']}
        isLoading={isLoading}
        isEmpty={merchants.length === 0}
        emptyTitle="لا يوجد تجار"
        emptyMessage="جرّب تغيير كلمات البحث أو انتظر تسجيل تاجر جديد."
        minWidth="820px"
      >
        {merchants.map((merchant) => (
          <TableRow key={merchant._id} columns={MERCHANT_COLUMNS}>
            <p className="truncate font-cairo text-sm font-bold text-white">{merchant.name ?? '—'}</p>
            <p className="truncate font-inter text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>{merchant.email ?? '—'}</p>
            <p className="font-inter text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>{merchant.phone ?? '—'}</p>
            <ActiveBadge isActive={merchant.isActive} />
            <ActionButton
              tone={merchant.isActive ? 'danger' : 'success'}
              icon={merchant.isActive ? ToggleLeft : ToggleRight}
              onClick={() => handleToggle(merchant)}
              loading={toggleMut.isPending}
            >
              {merchant.isActive ? 'تعليق' : 'تفعيل'}
            </ActionButton>
          </TableRow>
        ))}
      </DataTable>

      {suspendModal && (
        <Modal
          title="تعليق حساب التاجر"
          description={`تعليق حساب ${suspendModal.name}`}
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
                تعليق
              </ActionButton>
            </>
          }
        >
          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="suspendType" checked={suspendDays === 0} onChange={() => setSuspendDays(0)} className="w-4 h-4 accent-accent" />
              <span className="font-cairo text-sm text-white">تعليق دائم</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="suspendType" checked={suspendDays > 0} onChange={() => setSuspendDays(7)} className="w-4 h-4 accent-accent" />
              <span className="font-cairo text-sm text-white">تعليق لمدة</span>
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
    </>
  )
}