import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { listActivity } from '@/api/auth'
import usePageTitle from '@/hooks/usePageTitle'
import {
  Clock,
  Package,
  ShoppingBag,
  UserCog,
  Store,
  Filter,
  RefreshCw,
  User,
} from 'lucide-react'

const ACTION_ICONS = {
  'product.create': Package,
  'product.update': Package,
  'product.delete': Package,
  'order.confirm': ShoppingBag,
  'order.reject': ShoppingBag,
  'order.ship': ShoppingBag,
  'order.deliver': ShoppingBag,
  'staff.create': UserCog,
  'staff.update': UserCog,
  'staff.delete': UserCog,
  'store.update': Store,
  'store.settings': Store,
}

const ACTION_COLORS = {
  'product.create': 'text-green-600 bg-green-100',
  'product.update': 'text-blue-600 bg-blue-100',
  'product.delete': 'text-red-600 bg-red-100',
  'order.confirm': 'text-green-600 bg-green-100',
  'order.reject': 'text-red-600 bg-red-100',
  'order.ship': 'text-yellow-600 bg-yellow-100',
  'order.deliver': 'text-blue-600 bg-blue-100',
  'staff.create': 'text-green-600 bg-green-100',
  'staff.update': 'text-blue-600 bg-blue-100',
  'staff.delete': 'text-red-600 bg-red-100',
  'store.update': 'text-purple-600 bg-purple-100',
  'store.settings': 'text-purple-600 bg-purple-100',
}

function timeAgo(date) {
  const now = new Date()
  const diff = Math.floor((now - new Date(date)) / 1000)
  if (diff < 60) return 'منذ لحظات'
  if (diff < 3600) return `منذ ${Math.floor(diff / 60)} دقيقة`
  if (diff < 86400) return `منذ ${Math.floor(diff / 3600)} ساعة`
  if (diff < 2592000) return `منذ ${Math.floor(diff / 86400)} يوم`
  return new Date(date).toLocaleDateString('ar-YE')
}

export default function ActivityLogPage() {
  usePageTitle('سجل النشاطات')
  const storeRaw = useAuthStore((state) => state.store)
  const store = Array.isArray(storeRaw) ? storeRaw[0] : storeRaw
  const [actionFilter, setActionFilter] = useState('')

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['activity-log', store?._id, actionFilter],
    queryFn: () =>
      listActivity(store._id, actionFilter).then((res) => ({
        logs: res.data.data ?? [],
        pagination: res.data.pagination,
      })),
    enabled: !!store?._id,
    staleTime: 30_000,
  })

  const logs = data?.logs ?? []

  return (
    <div className="mx-auto max-w-5xl px-4 py-8" dir="rtl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-info-100">
            <Clock size={20} className="text-info" />
          </div>
          <div>
            <h1 className="font-cairo text-2xl font-extrabold text-text">سجل النشاطات</h1>
            <p className="font-cairo text-sm text-text-muted">تتبع التغييرات والإجراءات في المتجر</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Filter size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-subtle" />
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="h-9 appearance-none rounded-lg border border-border bg-white pr-9 pl-3 font-cairo text-xs font-semibold text-text outline-none transition-colors focus:border-primary"
            >
              <option value="">جميع الإجراءات</option>
              <option value="product.create">إنشاء منتج</option>
              <option value="product.update">تحديث منتج</option>
              <option value="product.delete">حذف منتج</option>
              <option value="order.confirm">تأكيد طلب</option>
              <option value="order.reject">رفض طلب</option>
              <option value="order.ship">شحن طلب</option>
              <option value="order.deliver">تسليم طلب</option>
              <option value="staff.create">إضافة موظف</option>
              <option value="staff.update">تحديث موظف</option>
              <option value="staff.delete">إزالة موظف</option>
              <option value="store.update">تحديث المتجر</option>
            </select>
          </div>

          <button
            type="button"
            onClick={() => refetch()}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-text-muted transition-colors hover:bg-bg-soft"
          >
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-xl border border-border bg-white p-12 text-center">
          <p className="font-cairo text-sm text-text-muted">جاري تحميل سجل النشاطات...</p>
        </div>
      ) : logs.length === 0 ? (
        <div className="rounded-xl border border-border bg-white p-12 text-center">
          <Clock size={40} className="mx-auto text-text-subtle" />
          <p className="mt-3 font-cairo text-sm font-bold text-text">لا توجد نشاطات بعد</p>
          <p className="mt-1 font-cairo text-xs text-text-muted">
            ستظهر هنا جميع الإجراءات التي تتم في المتجر مثل إنشاء المنتجات وتأكيد الطلبات.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {logs.map((log) => {
            const Icon = ACTION_ICONS[log.action] || Clock
            const colorClass = ACTION_COLORS[log.action] || 'text-gray-600 bg-gray-100'

            return (
              <div key={log._id} className="rounded-xl border border-border bg-white p-4 transition-colors hover:bg-bg-soft/50">
                <div className="flex items-start gap-4">
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${colorClass}`}>
                    <Icon size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                      <span className="font-cairo text-sm font-bold text-text">
                        {log.actionLabel}
                      </span>
                      <span className="font-cairo text-xs text-text-subtle">
                        {log.user?.name || 'غير معروف'}
                      </span>
                    </div>
                    {log.details && (
                      <p className="mt-1 font-cairo text-xs leading-6 text-text-muted">{log.details}</p>
                    )}
                    {log.resource?.name && (
                      <p className="mt-0.5 font-cairo text-[11px] text-text-subtle">
                        {log.resource.type === 'product' && 'المنتج: '}
                        {log.resource.type === 'order' && 'الطلب: '}
                        {log.resource.type === 'staff' && 'الموظف: '}
                        {log.resource.name}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="font-cairo text-[10px] text-text-subtle">{timeAgo(log.createdAt)}</span>
                    {log.ip && (
                      <span className="hidden font-mono text-[10px] text-text-subtle md:block" title={log.ip}>
                        <User size={12} className="inline" />
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}