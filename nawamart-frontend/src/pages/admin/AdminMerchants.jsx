import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { ToggleLeft, ToggleRight } from 'lucide-react'
import { getAdminMerchants, toggleMerchantActive } from '@/api/admin'
import {
  ActionButton,
  ActiveBadge,
  DataTable,
  PageHeader,
  SearchInput,
  TableRow,
  Toolbar,
} from '@/components/admin/AdminUI'

const MERCHANT_COLUMNS = 'minmax(180px,1fr) minmax(220px,1.2fr) minmax(150px,.8fr) minmax(120px,.6fr) minmax(120px,.6fr)'

export default function AdminMerchants() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

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
    mutationFn: toggleMerchantActive,
    onSuccess: (response) => {
      toast.success(response.data.message)
      queryClient.invalidateQueries({ queryKey: ['admin-merchants'] })
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
    },
    onError: (error) => toast.error(error?.message || 'فشل تحديث حالة التاجر'),
  })

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
            <p className="truncate font-cairo text-sm font-bold text-text">{merchant.name ?? '—'}</p>
            <p className="truncate font-inter text-sm text-text-muted">{merchant.email ?? '—'}</p>
            <p className="font-inter text-sm text-text-muted">{merchant.phone ?? '—'}</p>
            <ActiveBadge isActive={merchant.isActive} />
            <ActionButton
              tone={merchant.isActive ? 'danger' : 'success'}
              icon={merchant.isActive ? ToggleLeft : ToggleRight}
              onClick={() => toggleMut.mutate(merchant._id)}
              loading={toggleMut.isPending}
            >
              {merchant.isActive ? 'تعليق' : 'تفعيل'}
            </ActionButton>
          </TableRow>
        ))}
      </DataTable>
    </>
  )
}
