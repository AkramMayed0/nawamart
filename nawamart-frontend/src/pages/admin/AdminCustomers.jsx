import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { ToggleLeft, ToggleRight } from 'lucide-react'
import { getAdminCustomers, toggleCustomerActive } from '@/api/admin'
import {
  ActionButton,
  ActiveBadge,
  DataTable,
  PageHeader,
  SearchInput,
  TableRow,
  Toolbar,
} from '@/components/admin/AdminUI'

const CUSTOMER_COLUMNS = 'minmax(180px,1fr) minmax(220px,1.2fr) minmax(150px,.8fr) minmax(120px,.6fr) minmax(120px,.6fr)'

export default function AdminCustomers() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

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
    mutationFn: toggleCustomerActive,
    onSuccess: (response) => {
      toast.success(response.data.message)
      queryClient.invalidateQueries({ queryKey: ['admin-customers'] })
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
    },
    onError: (error) => toast.error(error?.message || 'فشل تحديث حالة العميل'),
  })

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
            <p className="truncate font-cairo text-sm font-bold text-text">{customer.name ?? '—'}</p>
            <p className="truncate font-inter text-sm text-text-muted">{customer.email ?? '—'}</p>
            <p className="font-inter text-sm text-text-muted">{customer.phone ?? '—'}</p>
            <ActiveBadge isActive={customer.isActive} />
            <ActionButton
              tone={customer.isActive ? 'danger' : 'success'}
              icon={customer.isActive ? ToggleLeft : ToggleRight}
              onClick={() => toggleMut.mutate(customer._id)}
              loading={toggleMut.isPending}
            >
              {customer.isActive ? 'تعليق' : 'تفعيل'}
            </ActionButton>
          </TableRow>
        ))}
      </DataTable>
    </>
  )
}
