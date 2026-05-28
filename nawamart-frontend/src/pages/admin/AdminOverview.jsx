import { useQuery } from '@tanstack/react-query'
import {
  Banknote,
  ClipboardList,
  Package,
  ShoppingBag,
  Store,
  Users,
} from 'lucide-react'
import { getAdminStats } from '@/api/admin'
import usePageTitle from '@/hooks/usePageTitle'
import { AdminCard, formatCurrency, formatNumber, PageHeader, StatCard } from '@/components/admin/AdminUI'

export default function AdminOverview() {
  usePageTitle('نظرة عامة')
  const { data, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => getAdminStats().then((response) => response.data.data),
    staleTime: 30_000,
  })

  const pendingSubscriptions = data?.pendingSubscriptions ?? 0
  const cards = [
    { label: 'التجار', value: formatNumber(data?.totalMerchants), icon: Store, tone: 'primary' },
    { label: 'العملاء', value: formatNumber(data?.totalCustomers), icon: Users, tone: 'info' },
    { label: 'المتاجر', value: formatNumber(data?.totalStores), icon: ShoppingBag, tone: 'accent' },
    { label: 'الطلبات', value: formatNumber(data?.totalOrders), icon: Package, tone: 'success' },
    {
      label: 'اشتراكات معلقة',
      value: formatNumber(pendingSubscriptions),
      icon: ClipboardList,
      tone: pendingSubscriptions > 0 ? 'warning' : 'neutral',
    },
    {
      label: 'إجمالي الإيرادات',
      value: formatCurrency(data?.totalRevenue),
      icon: Banknote,
      tone: 'success',
    },
  ]

  return (
    <>
      <PageHeader
        title="نظرة عامة"
        subtitle="ملخص سريع لصحة المنصة وحركة التجار والعملاء والاشتراكات."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <StatCard key={card.label} {...card} loading={isLoading} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
        <AdminCard>
          <h2 className="font-cairo text-base font-extrabold text-text">ما يحتاج متابعة</h2>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-border bg-bg p-4">
              <p className="font-cairo text-sm font-bold text-text">طلبات الاشتراك</p>
              <p className="mt-1 font-cairo text-xs leading-6 text-text-muted">
                {pendingSubscriptions > 0
                  ? `يوجد ${formatNumber(pendingSubscriptions)} طلب بانتظار مراجعة الإدارة.`
                  : 'لا توجد اشتراكات معلقة حاليا.'}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-bg p-4">
              <p className="font-cairo text-sm font-bold text-text">نظافة البيانات</p>
              <p className="mt-1 font-cairo text-xs leading-6 text-text-muted">
                صفحات الإدارة تعتمد الآن على خدمات موحدة وجداول قابلة لإعادة الاستخدام.
              </p>
            </div>
          </div>
        </AdminCard>

        <AdminCard>
          <h2 className="font-cairo text-base font-extrabold text-text">إعدادات الأمان</h2>
          <div className="mt-4 space-y-3 font-cairo text-sm text-text-muted">
            <p>جلسة المشرف منفصلة عن جلسات التجار والعملاء.</p>
            <p>طلبات الإدارة تستخدم رمز المشرف من مخزن الإدارة فقط.</p>
          </div>
        </AdminCard>
      </div>
    </>
  )
}
