import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import usePageTitle from '@/hooks/usePageTitle'
import { getMerchantOrders } from '@/api/orders'
import { Users, Search, ShoppingBag, Banknote, CalendarDays } from 'lucide-react'

function formatPrice(value) {
  return (value ?? 0).toLocaleString('en-US')
}

export default function CustomersPage() {
  usePageTitle('العملاء')
  const [search, setSearch] = useState('')

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['merchant-orders'],
    queryFn: () => getMerchantOrders().then(r => r.data.data ?? []),
    staleTime: 30_000,
  })

  const customers = useMemo(() => {
    const map = new Map()
    for (const order of orders) {
      const name = order.deliveryAddress?.name?.trim()
      const phone = order.deliveryAddress?.phone?.trim()
      const key = name?.toLowerCase() || order.customer?._id || order._id
      if (!key) continue

      const existing = map.get(key)
      if (existing) {
        existing.orderCount++
        existing.totalSpent += order.totalAmount ?? 0
        existing.orders.push(order._id)
        if (new Date(order.createdAt) > new Date(existing.lastOrder)) {
          existing.lastOrder = order.createdAt
        }
      } else {
        map.set(key, {
          id: key,
          name: name || order.customer?.name || '—',
          phone: phone || order.customer?.phone || '—',
          orderCount: 1,
          totalSpent: order.totalAmount ?? 0,
          orders: [order._id],
          lastOrder: order.createdAt,
          city: order.deliveryAddress?.city || '—',
        })
      }
    }
    return Array.from(map.values()).sort((a, b) => b.totalSpent - a.totalSpent)
  }, [orders])

  const filtered = useMemo(() => {
    if (!search.trim()) return customers
    const q = search.trim().toLowerCase()
    return customers.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      c.city.toLowerCase().includes(q)
    )
  }, [customers, search])

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8" dir="rtl">
        <div className="mb-6">
          <div className="h-8 w-32 bg-bg-soft rounded mb-2 animate-pulse" />
          <div className="h-4 w-56 bg-bg-soft rounded animate-pulse" />
        </div>
        <div className="bg-white border border-border rounded-xl overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="grid grid-cols-[2fr_1.5fr_1fr_1fr] gap-3 px-5 py-3.5 items-center animate-pulse border-b border-border">
              <div className="h-4 bg-bg-soft rounded w-32" />
              <div className="h-4 bg-bg-soft rounded w-24" />
              <div className="h-4 bg-bg-soft rounded w-16" />
              <div className="h-4 bg-bg-soft rounded w-20" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8" dir="rtl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-cairo font-extrabold text-2xl text-text">العملاء</h1>
          <p className="font-cairo text-sm text-text-muted mt-0.5">
            {customers.length} عميل — {orders.length} طلب
          </p>
        </div>

        <div className="relative max-w-xs w-full">
          <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-subtle pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="ابحث باسم العميل أو رقم الهاتف..."
            className="h-10 w-full rounded-lg border border-border bg-white pr-9 pl-3 font-cairo text-sm text-text outline-none transition-colors placeholder:text-text-subtle focus:border-primary"
          />
        </div>
      </div>

      {customers.length === 0 ? (
        <div className="bg-white border border-border rounded-2xl flex flex-col items-center justify-center py-20 text-center px-6">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <Users size={28} className="text-primary" />
          </div>
          <h3 className="font-cairo font-bold text-text text-lg mb-1">لا يوجد عملاء بعد</h3>
          <p className="font-cairo text-sm text-text-muted max-w-xs leading-relaxed">
            سيظهر العملاء هنا بعد أول طلب يقومون به في متجرك.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[550px]">
              <div className="grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr] gap-3 px-5 py-3 bg-bg border-b border-border text-xs font-semibold font-cairo text-text-muted">
                <span>العميل</span>
                <span>الجوال</span>
                <span>المحافظة</span>
                <span>الطلبات</span>
                <span>إجمالي المشتريات</span>
              </div>
              <div className="divide-y divide-border">
                {filtered.map(c => (
                  <div key={c.id} className="grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr] gap-3 px-5 py-3.5 items-center hover:bg-bg/50 transition-colors">
                    <div className="min-w-0">
                      <p className="font-cairo font-semibold text-sm text-text truncate flex items-center gap-2">
                        <ShoppingBag size={14} className="text-text-subtle shrink-0" />
                        {c.name}
                      </p>
                    </div>
                    <span className="font-inter text-sm text-text-muted dk-num" dir="ltr">{c.phone}</span>
                    <span className="font-cairo text-sm text-text-muted">{c.city}</span>
                    <div>
                      <span className="font-inter font-bold text-sm text-text dk-num">{c.orderCount}</span>
                      <span className="font-cairo text-xs text-text-muted mr-1">طلبات</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Banknote size={14} className="text-text-subtle shrink-0" />
                      <span className="font-inter font-bold text-sm text-text dk-num">{formatPrice(c.totalSpent)}</span>
                      <span className="font-cairo text-xs text-text-muted">ر.ي</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
