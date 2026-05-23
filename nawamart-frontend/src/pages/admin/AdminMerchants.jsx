import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { getAdminMerchants, toggleMerchantActive } from '@/api/admin'
import { SectionHeader, SearchInput, Table, ActiveBadge, ActionBtn } from '@/components/admin/AdminUI'

export default function AdminMerchants() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin-merchants', debouncedSearch],
    queryFn:  () => getAdminMerchants({ search: debouncedSearch, limit: 50 }).then(r => r.data),
    staleTime: 15_000,
  })
  const merchants = data?.data ?? []

  const inv = () => queryClient.invalidateQueries({ queryKey: ['admin-merchants'] })
  const toggleMut = useMutation({
    mutationFn: (id) => toggleMerchantActive(id),
    onSuccess: (r) => { toast.success(r.data.message); inv() },
    onError: (e) => toast.error(e?.response?.data?.message ?? 'فشل'),
  })

  return (
    <div>
      <SectionHeader title={`التجار (${merchants.length})`}>
        <SearchInput 
          value={search} 
          onChange={v => { setSearch(v); setTimeout(() => setDebouncedSearch(v), 400) }} 
          placeholder="بحث بالاسم أو البريد..." 
        />
      </SectionHeader>

      <Table
        isLoading={isLoading}
        isEmpty={merchants.length === 0}
        emptyMsg="لا يوجد تجار"
        cols="grid-cols-[1fr_1.5fr_1fr_100px_auto]"
        headers={['الاسم', 'البريد', 'الهاتف', 'الحالة', 'إجراء']}
      >
        {merchants.map(m => (
          <div key={m._id} className="grid grid-cols-[1fr_1.5fr_1fr_100px_auto] gap-4 px-5 py-4 items-center hover:bg-slate-50 transition-colors">
            <p className="font-cairo font-semibold text-sm text-slate-800 truncate">{m.name}</p>
            <p className="font-en text-sm text-slate-500 truncate">{m.email}</p>
            <p className="font-en text-sm text-slate-500">{m.phone}</p>
            <ActiveBadge isActive={m.isActive} />
            <ActionBtn
              color={m.isActive ? 'red' : 'green'}
              onClick={() => toggleMut.mutate(m._id)}
              loading={toggleMut.isPending}
            >
              {m.isActive ? 'تعليق' : 'تفعيل'}
            </ActionBtn>
          </div>
        ))}
      </Table>
    </div>
  )
}
