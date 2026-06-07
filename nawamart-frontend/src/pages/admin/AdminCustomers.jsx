import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Clock, ToggleLeft, ToggleRight } from 'lucide-react'
import { getAdminCustomers, toggleCustomerActive } from '@/api/admin'
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

const CUSTOMER_COLUMNS = 'minmax(180px,1fr) minmax(220px,1.2fr) minmax(150px,.8fr) minmax(120px,.6fr) minmax(120px,.6fr)'

export default function AdminCustomers() {
  usePageTitle('العملاء')
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
    queryKey: ['admin-customers', debouncedSearch],
    queryFn: () => getAdminCustomers({ search: debouncedSearch || undefined, limit: 50 }).then((response) => response.data),
    staleTime: 15_000,
  })

  const customers = data?.data ?? []
  const total = data?.pagination?.total ?? customers.length

  const toggleMut = useMutation({
    mutationFn: ({ id, days }) => toggleCustomerActive(id, days),
    onSuccess: (response) => {
      toast.success(response.data.message)
      queryClient.invalidateQueries({ queryKey: ['admin-customers'] })
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
      setSuspendModal(null)
    },
    onError: (error) => toast.error(error?.message || 'فشل تحديث حالة العميل'),
  })

  function handleToggle(customer) {
    if (customer.isActive) {
      setSuspendModal(customer)
    } else {
      toggleMut.mutate({ id: customer._id })
    }
  }

  return (
    <>
      <PageHeader
        title="العملاء"
        subtitle="مراجعة حسابات العملاء وحالة الوصول إلى واجهة الشراء."
      />

      <Toolbar>
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="بحث بالاسم أو البريد أو الهاتف..."
        />
        <p className="font-cairo text-sm font-semibold text-text-muted">
          {total.toLocaleString('en-US')} عميل
        </p>
      </Toolbar>

      <DataTable
        columns={CUSTOMER_COLUMNS}
        headers={['الاسم', 'البريد الإلكتروني', 'الهاتف', 'الحالة', 'الإجراء']}
        isLoading={isLoading}
        isEmpty={customers.length === 0}
        emptyTitle="لا يوجد عملاء"
        emptyMessage="جرّب تغيير كلمات البحث أو انتظر تسجيل عميل جديد."
        minWidth="820px"
      >
        {customers.map((customer) => (
          <TableRow key={customer._id} columns={CUSTOMER_COLUMNS}>
            <p className="truncate font-cairo text-sm font-bold text-white">{customer.name ?? '—'}</p>
            <p className="truncate font-inter text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>{customer.email ?? '—'}</p>
            <p className="font-inter text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>{customer.phone ?? '—'}</p>
            <ActiveBadge isActive={customer.isActive} />
            <ActionButton
              tone={customer.isActive ? 'danger' : 'success'}
              icon={customer.isActive ? ToggleLeft : ToggleRight}
              onClick={() => handleToggle(customer)}
              loading={toggleMut.isPending}
            >
              {customer.isActive ? 'تعليق' : 'تفعيل'}
            </ActionButton>
          </TableRow>
        ))}
      </DataTable>

      {suspendModal && (
        <Modal
          title="تعليق حساب العميل"
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
