import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { getAdminCustomers, toggleCustomerActive } from '@/api/admin'
import { SectionHeader, SearchInput, Table, ActiveBadge, ActionBtn } from '@/components/admin/AdminUI'

export default function AdminCustomers() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin-customers', search],
    queryFn:  () => getAdminCustomers({ search, limit: 50 }).then(r => r.data),
    staleTime: 15_000,
  })
  const customers = data?.data ?? []

  const inv = () => queryClient.invalidateQueries({ queryKey: ['admin-customers'] })
  const toggleMut = useMutation({
    mutationFn: (id) => toggleCustomerActive(id),
    onSuccess: (r) => { toast.success(r.data.message); inv() },
    onError: (e) => toast.error(e?.response?.data?.message ?? 'فشل'),
  })

  return (
    <div>
      <SectionHeader title={`العملاء (${customers.length})`}>
        <SearchInput value={search} onChange={setSearch} placeholder="بحث بالاسم أو البريد..." />
      </SectionHeader>

      <Table
        isLoading={isLoading}
        isEmpty={customers.length === 0}
        emptyMsg="لا يوجد عملاء"
        cols="grid-cols-[1fr_1.5fr_1fr_100px_auto]"
        headers={['الاسم', 'البريد', 'الهاتف', 'الحالة', 'إجراء']}
      >
        {customers.map(c => (
          <div key={c._id} className="grid grid-cols-[1fr_1.5fr_1fr_100px_auto] gap-4 px-5 py-4 items-center hover:bg-slate-50 transition-colors">
            <p className="font-cairo font-semibold text-sm text-slate-800 truncate">{c.name}</p>
            <p className="font-en text-sm text-slate-500 truncate">{c.email}</p>
            <p className="font-en text-sm text-slate-500">{c.phone}</p>
            <ActiveBadge isActive={c.isActive} />
            <ActionBtn
              color={c.isActive ? 'red' : 'green'}
              onClick={() => toggleMut.mutate(c._id)}
              loading={toggleMut.isPending}
            >
              {c.isActive ? 'تعليق' : 'تفعيل'}
            </ActionBtn>
          </div>
        ))}
      </Table>
    </div>
  )
}
