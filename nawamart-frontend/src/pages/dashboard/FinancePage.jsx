import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import usePageTitle from '@/hooks/usePageTitle'
import { getMerchantOrders } from '@/api/orders'
import { Banknote, ShoppingBag, TrendingUp, Wallet, Clock, Crown, BarChart3, Package, XCircle, Smartphone, MapPin, RefreshCw, FileDown, ChevronDown, ChevronUp } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

function formatPrice(value) {
  return (value ?? 0).toLocaleString('en-US')
}

function StatCard({ icon: Icon, label, value, sub, iconBg }) {
  return (
    <div className="bg-white border border-border rounded-2xl p-5 flex flex-col gap-2">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
        <Icon size={18} />
      </div>
      <p className="font-inter font-extrabold text-2xl text-text dk-num leading-none">
        {value ?? '—'}
      </p>
      <div>
        <p className="font-cairo font-semibold text-sm text-text">{label}</p>
        {sub && <p className="font-cairo text-xs text-text-muted mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

function groupByMonth(orders) {
  const map = {}
  for (const o of orders) {
    const d = new Date(o.createdAt)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    map[key] = (map[key] || 0) + (o.totalAmount ?? 0)
  }
  return Object.entries(map).sort(([a], [b]) => a.localeCompare(b))
}

const MONTH_NAMES = {
  '01': 'يناير', '02': 'فبراير', '03': 'مارس', '04': 'إبريل',
  '05': 'مايو', '06': 'يونيو', '07': 'يوليو', '08': 'أغسطس',
  '09': 'سبتمبر', '10': 'أكتوبر', '11': 'نوفمبر', '12': 'ديسمبر',
}

const PAYMENT_METHODS = {
  kuraimi: { label: 'كريمي', color: 'text-purple-700', bg: 'bg-purple-100' },
  oneCash: { label: 'ون كاش', color: 'text-emerald-700', bg: 'bg-emerald-100' },
  jaib: { label: 'جيب', color: 'text-blue-700', bg: 'bg-blue-100' },
  cash: { label: 'كاش', color: 'text-amber-700', bg: 'bg-amber-100' },
}

const STATUS_LABELS = {
  payment_under_review: 'قيد المراجعة',
  pending: 'بانتظار الوصل',
  confirmed: 'مؤكد',
  shipped: 'تم الشحن',
  delivered: 'تم التسليم',
  rejected: 'مرفوض',
}

export default function FinancePage() {
  usePageTitle('المالية')

  const store = useAuthStore(s => s.store)
  const plan = store?.plan || 'free'

  const today = new Date().toISOString().split('T')[0]
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const [dateFrom, setDateFrom] = useState(thirtyDaysAgo)
  const [dateTo, setDateTo] = useState(today)
  const [expandedOrder, setExpandedOrder] = useState(null)

  const queryParams = useMemo(() => {
    const params = {}
    if (dateFrom) params.date_from = dateFrom
    if (dateTo) params.date_to = dateTo
    return params
  }, [dateFrom, dateTo])

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['merchant-orders-finance', queryParams],
    queryFn: () => getMerchantOrders(queryParams).then(r => r.data.data ?? []),
    staleTime: 30_000,
  })

  const stats = useMemo(() => {
    const completed = orders.filter(o => o.status === 'delivered' || o.status === 'confirmed')
    const totalRevenue = completed.reduce((s, o) => s + (o.totalAmount ?? 0), 0)
    const totalOrders = orders.length
    const completedOrders = completed.length
    const avgOrder = completedOrders > 0 ? totalRevenue / completedOrders : 0
    const pendingAmount = orders
      .filter(o => o.status === 'pending' || o.status === 'payment_under_review')
      .reduce((s, o) => s + (o.totalAmount ?? 0), 0)
    const rejectedAmount = orders
      .filter(o => o.status === 'rejected')
      .reduce((s, o) => s + (o.totalAmount ?? 0), 0)
    const totalItems = orders.reduce((s, o) => s + (o.items || []).reduce((si, item) => si + (item.quantity || 0), 0), 0)
    return { totalRevenue, totalOrders, completedOrders, avgOrder, pendingAmount, rejectedAmount, totalItems }
  }, [orders])

  const statusBreakdown = useMemo(() => {
    const map = {}
    for (const o of orders) {
      const status = o.status || 'unknown'
      if (!map[status]) map[status] = { count: 0, total: 0 }
      map[status].count++
      map[status].total += o.totalAmount ?? 0
    }
    return Object.entries(map).sort(([, a], [, b]) => b.total - a.total)
  }, [orders])

  const paymentBreakdown = useMemo(() => {
    const map = {}
    for (const o of orders) {
      const method = o.paymentMethod || 'unknown'
      if (!map[method]) map[method] = { count: 0, total: 0 }
      map[method].count++
      map[method].total += o.totalAmount ?? 0
    }
    return Object.entries(map).sort(([, a], [, b]) => b.total - a.total)
  }, [orders])

  const monthlyData = useMemo(() => {
    const completed = orders.filter(o => o.status === 'delivered' || o.status === 'confirmed')
    return groupByMonth(completed)
  }, [orders])

  const maxRevenue = Math.max(...monthlyData.map(([, v]) => v), 1)
  const maxStatusTotal = Math.max(...statusBreakdown.map(([, v]) => v.total), 1)
  const maxPaymentTotal = Math.max(...paymentBreakdown.map(([, v]) => v.total), 1)

  function exportCSV() {
    const headers = ['رقم الطلب', 'التاريخ', 'العميل', 'الهاتف', 'المدينة', 'المبلغ', 'رسوم التوصيل', 'طريقة الدفع', 'الحالة', 'طريقة التواصل', 'وسيلة التواصل', 'المنتجات', 'ملاحظات']
    const rows = orders.map(o => {
      const shortId = String(o._id).slice(-8).toUpperCase()
      const customer = o.deliveryAddress?.name ?? o.customer?.name ?? ''
      const phone = o.deliveryAddress?.phone ?? ''
      const city = o.deliveryAddress?.city ?? ''
      const items = (o.items || []).map(i => `${i.name} x${i.quantity} (${formatPrice(i.price)} ر.ي)`).join(' | ')
      const contactMethod = o.contactMethod === 'whatsapp' ? 'واتساب' : o.contactMethod === 'telegram' ? 'تيليجرام' : o.contactMethod === 'instagram' ? 'انستقرام' : o.contactMethod === 'phone' ? 'اتصال' : ''
      return [
        shortId,
        new Date(o.createdAt).toLocaleDateString('ar-YE'),
        customer,
        phone,
        city,
        o.totalAmount ?? 0,
        o.shippingFee ?? 0,
        o.paymentMethod,
        STATUS_LABELS[o.status] || o.status,
        contactMethod,
        o.contactHandle || '',
        items,
        o.notes || '',
      ]
    })
    const csvContent = [headers.join(','), ...rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))].join('\n')
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `تقارير_المالية_${dateFrom}_${dateTo}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8" dir="rtl">
        <div className="mb-6">
          <div className="h-8 w-32 bg-bg-soft rounded mb-2 animate-pulse" />
          <div className="h-4 w-56 bg-bg-soft rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white border border-border rounded-2xl p-5 flex flex-col gap-3 animate-pulse">
              <div className="w-9 h-9 rounded-xl bg-bg-soft" />
              <div className="h-7 w-16 bg-bg-soft rounded" />
              <div className="h-3 w-24 bg-bg-soft rounded" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8" dir="rtl">
      <div className="mb-6">
        <h1 className="font-cairo font-extrabold text-2xl text-text">المالية</h1>
        <p className="font-cairo text-sm text-text-muted mt-0.5">تقارير المبيعات والإيرادات.</p>
      </div>

      {/* Date filter */}
      <div className="bg-white border border-border rounded-2xl p-4 mb-6 flex flex-wrap items-end gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="font-cairo text-xs font-semibold text-text-muted">من تاريخ</label>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="h-10 rounded-lg border border-border bg-white px-3 font-cairo text-sm text-text outline-none focus:border-primary transition-colors" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="font-cairo text-xs font-semibold text-text-muted">إلى تاريخ</label>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="h-10 rounded-lg border border-border bg-white px-3 font-cairo text-sm text-text outline-none focus:border-primary transition-colors" />
        </div>
        {(dateFrom !== thirtyDaysAgo || dateTo !== today) && (
          <button type="button" onClick={() => { setDateFrom(thirtyDaysAgo); setDateTo(today) }} className="h-10 rounded-lg border border-border bg-bg px-4 font-cairo text-sm font-semibold text-text-muted hover:bg-bg-soft transition-colors flex items-center gap-2">
            <RefreshCw size={14} /> إعادة تعيين
          </button>
        )}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Banknote} label="إجمالي الإيرادات" value={`${formatPrice(stats.totalRevenue)} ر.ي`} sub="من الطلبات المؤكدة والمسلمة" iconBg="bg-success-100 text-success" />
        <StatCard icon={ShoppingBag} label="إجمالي الطلبات" value={formatPrice(stats.totalOrders)} sub={`${stats.completedOrders} مكتمل`} iconBg="bg-primary/10 text-primary" />
        <StatCard icon={Package} label="القطع المباعة" value={formatPrice(stats.totalItems)} sub="إجمالي عدد القطع" iconBg="bg-info-100 text-info" />
        <StatCard icon={TrendingUp} label="متوسط قيمة الطلب" value={`${formatPrice(stats.avgOrder)} ر.ي`} sub="للطلبات المكتملة" iconBg="bg-accent-50 text-accent-700" />
        <StatCard icon={Clock} label="المبلغ المعلق" value={`${formatPrice(stats.pendingAmount)} ر.ي`} sub="بانتظار المراجعة" iconBg="bg-warning-100 text-warning" />
        <StatCard icon={XCircle} label="المبلغ المرفوض" value={`${formatPrice(stats.rejectedAmount)} ر.ي`} sub="من الطلبات المرفوضة" iconBg="bg-danger-100 text-danger" />
      </div>

      {/* Monthly chart + Status breakdown side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Monthly revenue chart */}
        {monthlyData.length > 0 && plan !== 'free' ? (
          <div className="bg-white border border-border rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-xl bg-accent-50 text-accent-700 flex items-center justify-center">
                <TrendingUp size={18} />
              </div>
              <div>
                <h2 className="font-cairo font-bold text-base text-text">الإيرادات الشهرية</h2>
                <p className="font-cairo text-xs text-text-muted">إجمالي المبيعات لكل شهر</p>
              </div>
            </div>
            <div className="flex items-end gap-2 h-40 overflow-x-auto pb-2">
              {monthlyData.map(([key, amount]) => {
                const [, month] = key.split('-')
                const pct = (amount / maxRevenue) * 100
                return (
                  <div key={key} className="flex flex-col items-center gap-1.5 min-w-[48px]">
                    <span className="font-inter text-[11px] font-bold text-text-muted dk-num">{formatPrice(amount)}</span>
                    <div className="w-10 rounded-lg bg-accent transition-all duration-300 hover:bg-accent-700" style={{ height: `${Math.max(pct, 4)}%` }} />
                    <span className="font-cairo text-[11px] text-text-subtle whitespace-nowrap">{MONTH_NAMES[month] || month}</span>
                  </div>
                )
              })}
            </div>
          </div>
        ) : plan === 'free' ? (
          <div className="bg-white border border-border rounded-2xl p-6 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-bg-soft flex items-center justify-center shrink-0 text-text-subtle">
              <BarChart3 size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-cairo font-bold text-sm text-text">الرسوم البيانية متاحة في الباقات المدفوعة</p>
              <p className="font-cairo text-xs text-text-muted mt-0.5">اشترك في Pro أو Business للاطلاع على الإيرادات الشهرية.</p>
              <a href="/subscribe?plan=pro" className="inline-flex items-center gap-1 mt-3 font-cairo font-bold text-xs px-3.5 py-1.5 rounded-lg bg-primary text-white hover:bg-primary-700 transition-colors">
                <Crown size={13} /> ترقية الباقة
              </a>
            </div>
          </div>
        ) : null}

        {/* Status breakdown */}
        <div className="bg-white border border-border rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <BarChart3 size={18} />
            </div>
            <div>
              <h2 className="font-cairo font-bold text-base text-text">توزيع الإيرادات حسب الحالة</h2>
              <p className="font-cairo text-xs text-text-muted">إجمالي المبالغ لكل حالة</p>
            </div>
          </div>
          <div className="space-y-4">
            {statusBreakdown.map(([status, data]) => {
              const pct = (data.total / maxStatusTotal) * 100
              const barColor = status === 'delivered' || status === 'confirmed' ? 'bg-success'
                : status === 'shipped' ? 'bg-info'
                : status === 'rejected' ? 'bg-danger'
                : 'bg-warning'
              return (
                <div key={status}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-cairo text-sm font-semibold text-text">{STATUS_LABELS[status] || status}</span>
                    <span className="font-inter text-xs font-bold text-text-muted dk-num">{data.count} طلب · {formatPrice(data.total)} ر.ي</span>
                  </div>
                  <div className="w-full h-2.5 bg-bg-soft rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${barColor} transition-all duration-300`} style={{ width: `${Math.max(pct, 2)}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Payment method breakdown */}
      {paymentBreakdown.length > 0 && (
        <div className="bg-white border border-border rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <Smartphone size={18} />
            </div>
            <div>
              <h2 className="font-cairo font-bold text-base text-text">طرق الدفع</h2>
              <p className="font-cairo text-xs text-text-muted">توزيع المبيعات حسب وسيلة الدفع</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {paymentBreakdown.map(([method, data]) => {
              const meta = PAYMENT_METHODS[method] || { label: method, color: 'text-text', bg: 'bg-bg-soft' }
              const pct = orders.length > 0 ? Math.round((data.count / orders.length) * 100) : 0
              return (
                <div key={method} className="border border-border rounded-xl p-4 text-center">
                  <div className={`w-10 h-10 rounded-xl ${meta.bg} flex items-center justify-center mx-auto mb-3`}>
                    <Smartphone size={18} className={meta.color} />
                  </div>
                  <p className={`font-cairo font-bold text-sm ${meta.color}`}>{meta.label}</p>
                  <p className="font-inter font-extrabold text-lg text-text dk-num mt-1">{formatPrice(data.total)} ر.ي</p>
                  <p className="font-cairo text-xs text-text-muted mt-0.5">{data.count} طلب · {pct}%</p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Transactions table */}
      <div className="bg-white border border-border rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Wallet size={18} />
            </div>
            <h2 className="font-cairo font-bold text-base text-text">المعاملات</h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={exportCSV}
              disabled={orders.length === 0}
              className="flex items-center gap-1.5 h-8 rounded-lg bg-primary text-white px-3 font-cairo text-xs font-bold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileDown size={14} />
              تصدير CSV
            </button>
            <span className="font-cairo text-xs text-text-muted">{orders.length} عملية</span>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-bg-soft border border-border flex items-center justify-center">
              <Banknote size={24} className="text-text-subtle" />
            </div>
            <p className="font-cairo font-bold text-text">لا توجد معاملات في هذه الفترة</p>
            <p className="font-cairo text-sm text-text-muted">جرّب تغيير نطاق التاريخ.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              <div className="grid grid-cols-[auto_1.5fr_1fr_1fr_1fr_1fr_auto] gap-3 px-5 py-3 bg-bg border-b border-border text-xs font-semibold font-cairo text-text-muted">
                <span>رقم الطلب</span>
                <span>العميل</span>
                <span>المبلغ</span>
                <span>طريقة الدفع</span>
                <span>المدينة</span>
                <span>الحالة</span>
                <span></span>
              </div>
              <div className="divide-y divide-border">
                {orders.slice(0, 50).map(order => {
                  const shortId = String(order._id).slice(-8).toUpperCase()
                  const customer = order.deliveryAddress?.name ?? order.customer?.name ?? '—'
                  const date = new Date(order.createdAt).toLocaleDateString('ar-YE', { month: 'short', day: 'numeric' })
                  const paymentMeta = PAYMENT_METHODS[order.paymentMethod] || { label: order.paymentMethod, color: 'text-text-muted' }
                  const isExpanded = expandedOrder === order._id
                  return (
                    <div key={order._id}>
                      <button
                        type="button"
                        onClick={() => setExpandedOrder(isExpanded ? null : order._id)}
                        className="w-full grid grid-cols-[auto_1.5fr_1fr_1fr_1fr_1fr_auto] gap-3 px-5 py-3.5 items-center hover:bg-bg/50 transition-colors text-right"
                      >
                        <span className="font-inter font-bold text-xs text-primary dk-num">#{shortId}</span>
                        <div className="text-right">
                          <p className="font-cairo text-sm text-text truncate">{customer}</p>
                          <p className="font-cairo text-xs text-text-muted">{date}</p>
                        </div>
                        <span className="font-inter font-bold text-sm text-text dk-num">{formatPrice(order.totalAmount ?? 0)} ر.ي</span>
                        <span className={`font-cairo text-xs font-semibold ${paymentMeta.color}`}>{paymentMeta.label}</span>
                        <span className="font-cairo text-xs text-text-muted flex items-center gap-1">
                          <MapPin size={12} className="shrink-0" />
                          {order.deliveryAddress?.city || '—'}
                        </span>
                        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold font-cairo px-2.5 py-1 rounded-pill w-fit ${
                          order.status === 'delivered' || order.status === 'confirmed'
                            ? 'bg-success-100 text-success'
                            : order.status === 'shipped'
                              ? 'bg-info-100 text-info'
                              : order.status === 'rejected'
                                ? 'bg-danger-100 text-danger'
                                : 'bg-warning-100 text-yellow-700'
                        }`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
                          {STATUS_LABELS[order.status] || order.status}
                        </span>
                        <span className="text-text-subtle">
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </span>
                      </button>

                      {isExpanded && (
                        <div className="bg-bg/50 border-t border-border px-5 py-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                              <h4 className="font-cairo text-xs font-bold text-text-muted mb-2">معلومات العميل</h4>
                              <div className="space-y-1">
                                <p className="font-cairo text-sm text-text">{order.deliveryAddress?.name}</p>
                                <p className="font-cairo text-xs text-text-muted">{order.deliveryAddress?.city}{order.deliveryAddress?.district ? ` - ${order.deliveryAddress.district}` : ''}</p>
                                {order.deliveryAddress?.details && <p className="font-cairo text-xs text-text-muted">{order.deliveryAddress.details}</p>}
                                <p className="font-cairo text-xs text-text-muted dir-ltr text-left">{order.deliveryAddress?.phone}</p>
                                {order.deliveryAddress?.location?.lat && order.deliveryAddress?.location?.lng && (
                                  <a
                                    href={`https://www.google.com/maps?q=${order.deliveryAddress.location.lat},${order.deliveryAddress.location.lng}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 font-cairo text-xs text-primary hover:underline"
                                  >
                                    <MapPin size={12} /> عرض الموقع على الخريطة
                                  </a>
                                )}
                              </div>
                            </div>
                            <div>
                              <h4 className="font-cairo text-xs font-bold text-text-muted mb-2">معلومات الدفع</h4>
                              <div className="space-y-1">
                                <p className="font-cairo text-sm text-text">{paymentMeta.label}</p>
                                <p className="font-cairo text-xs text-text-muted">
                                  الإجمالي: <span className="font-inter font-bold dk-num">{formatPrice(order.totalAmount ?? 0)} ر.ي</span>
                                  {order.shippingFee > 0 && ` (توصيل: ${formatPrice(order.shippingFee)} ر.ي)`}
                                </p>
                                {order.contactHandle && (
                                  <p className="font-cairo text-xs text-text-muted">
                                    {order.contactMethod === 'whatsapp' ? 'واتساب'
                                      : order.contactMethod === 'telegram' ? 'تيليجرام'
                                      : order.contactMethod === 'instagram' ? 'انستقرام'
                                      : order.contactMethod}: {order.contactHandle}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div>
                              <h4 className="font-cairo text-xs font-bold text-text-muted mb-2">الإجراءات</h4>
                              <div className="space-y-1">
                                {order.confirmedAt && <p className="font-cairo text-xs text-text-muted">تأكيد: {new Date(order.confirmedAt).toLocaleDateString('ar-YE', { month: 'short', day: 'numeric' })}</p>}
                                {order.shippedAt && <p className="font-cairo text-xs text-text-muted">شحن: {new Date(order.shippedAt).toLocaleDateString('ar-YE', { month: 'short', day: 'numeric' })}</p>}
                                {order.deliveredAt && <p className="font-cairo text-xs text-text-muted">تسليم: {new Date(order.deliveredAt).toLocaleDateString('ar-YE', { month: 'short', day: 'numeric' })}</p>}
                                {order.rejectedAt && <p className="font-cairo text-xs text-text-muted">رفض: {new Date(order.rejectedAt).toLocaleDateString('ar-YE', { month: 'short', day: 'numeric' })}</p>}
                              </div>
                            </div>
                          </div>

                          <h4 className="font-cairo text-xs font-bold text-text-muted mb-2">المنتجات</h4>
                          <div className="border border-border rounded-xl overflow-hidden">
                            <div className="grid grid-cols-[1fr_auto_auto_auto] gap-3 px-4 py-2.5 bg-bg border-b border-border text-xs font-semibold font-cairo text-text-muted">
                              <span>المنتج</span>
                              <span>السعر</span>
                              <span>الكمية</span>
                              <span>المجموع</span>
                            </div>
                            {(order.items || []).map((item, idx) => (
                              <div key={idx} className="grid grid-cols-[1fr_auto_auto_auto] gap-3 px-4 py-2.5 border-b border-border last:border-b-0 items-center">
                                <span className="font-cairo text-sm text-text truncate">{item.name}</span>
                                <span className="font-inter text-xs text-text-muted dk-num">{formatPrice(item.price)} ر.ي</span>
                                <span className="font-inter text-xs text-text dk-num">{item.quantity}</span>
                                <span className="font-inter text-sm font-bold text-text dk-num">{formatPrice(item.price * item.quantity)} ر.ي</span>
                              </div>
                            ))}
                          </div>

                          {order.notes && (
                            <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                              <p className="font-cairo text-xs font-bold text-amber-800 mb-0.5">ملاحظات</p>
                              <p className="font-cairo text-xs text-amber-700">{order.notes}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
