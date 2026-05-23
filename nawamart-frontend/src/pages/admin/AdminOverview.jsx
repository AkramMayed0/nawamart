import { useQuery } from '@tanstack/react-query'
import { getAdminStats } from '@/api/admin'
import { SectionHeader } from '@/components/admin/AdminUI'

export default function AdminOverview() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn:  () => getAdminStats().then(r => r.data.data),
    staleTime: 30_000,
  })

  const cards = [
    { label: 'التجار',              value: data?.totalMerchants,         icon: '🏪' },
    { label: 'العملاء',             value: data?.totalCustomers,         icon: '👥' },
    { label: 'المتاجر',             value: data?.totalStores,            icon: '🛍️' },
    { label: 'الطلبات',             value: data?.totalOrders,            icon: '📦' },
    { label: 'اشتراكات معلقة',     value: data?.pendingSubscriptions,   icon: '⏳', highlight: true },
    { label: 'إجمالي الإيرادات',   value: data?.totalRevenue != null ? `${data.totalRevenue.toLocaleString('en-US')} ر.ي` : '—', icon: '💰' },
  ]

  return (
    <div>
      <SectionHeader title="نظرة عامة" />
      
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array.from({length: 6}).map((_,i) => (
            <div key={i} className="h-28 bg-white border border-slate-200 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {cards.map(c => (
            <div key={c.label} className={`rounded-2xl px-4 py-5 text-center flex flex-col items-center justify-center border shadow-sm ${
              c.highlight && (data?.pendingSubscriptions ?? 0) > 0 
                ? 'bg-amber-50 border-amber-200' 
                : 'bg-white border-slate-200'
            }`}>
              <span className="text-2xl mb-2">{c.icon}</span>
              <p className="font-inter font-extrabold text-slate-800 text-xl leading-none">
                {c.value ?? '—'}
              </p>
              <p className="font-cairo text-xs text-slate-500 mt-1">{c.label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
