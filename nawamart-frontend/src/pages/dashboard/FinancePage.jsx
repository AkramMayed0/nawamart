import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import usePageTitle from '@/hooks/usePageTitle'
import { getMerchantOrders } from '@/api/orders'
import { getMyInvoices } from '@/api/invoices'
import { getWalletBalance, getWalletLedger } from '@/api/wallet'
import { getMySubscription } from '@/api/subscriptions'
import { Banknote, ShoppingBag, TrendingUp, Wallet, Clock, Crown, BarChart3, FileDown, FileText, CreditCard } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { exportOperationsToExcel, exportInvoicesToExcel } from '@/lib/exportExcel'

function formatPrice(value) {
  return (value ?? 0).toLocaleString('en-US')
}

function StatCard({ icon: Icon, label, value, sub, iconBg }) {
  return (
    <div className="bg-surface border border-border rounded-2xl p-5 flex flex-col gap-2 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
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

export default function FinancePage() {
  usePageTitle('المالية')

  const storeRaw = useAuthStore(s => s.store)
  const store = Array.isArray(storeRaw) ? storeRaw[0] : storeRaw
  const plan = store?.plan || 'starter'
  const isPaid = plan !== 'starter'

  const today = new Date().toISOString().split('T')[0]
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const [dateFrom, setDateFrom] = useState(thirtyDaysAgo)
  const [dateTo, setDateTo] = useState(today)

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['merchant-orders'],
    queryFn: () => getMerchantOrders().then(r => r.data.data ?? []),
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
    return { totalRevenue, totalOrders, completedOrders, avgOrder, pendingAmount }
  }, [orders])

  const monthlyData = useMemo(() => {
    const completed = orders.filter(o => o.status === 'delivered' || o.status === 'confirmed')
    return groupByMonth(completed)
  }, [orders])

  const maxRevenue = Math.max(...monthlyData.map(([, v]) => v), 1)

  const { data: walletData } = useQuery({
    queryKey: ['wallet-balance-finance'],
    queryFn: () => getWalletBalance().then(r => r.data.data),
    staleTime: 30_000,
    retry: false,
    enabled: isPaid,
  })

  const { data: walletLedger = [] } = useQuery({
    queryKey: ['wallet-ledger-finance'],
    queryFn: () => getWalletLedger().then(r => r.data.data ?? []),
    staleTime: 30_000,
    retry: false,
    enabled: isPaid,
  })

  const { data: invoices = [] } = useQuery({
    queryKey: ['my-invoices-finance'],
    queryFn: () => getMyInvoices().then(r => r.data.data ?? []),
    staleTime: 30_000,
    retry: false,
    enabled: isPaid,
  })

  const { data: subscriptions = [] } = useQuery({
    queryKey: ['my-subscriptions-finance'],
    queryFn: () => getMySubscription().then(r => {
      const data = r.data.data
      return Array.isArray(data) ? data : (data ? [data] : [])
    }),
    staleTime: 30_000,
    retry: false,
    enabled: isPaid,
  })

  const walletBalance = walletData?.balance ?? 0
  const verifiedInvoices = invoices.filter(inv => inv.status === 'verified')
  const totalSpent = verifiedInvoices.reduce((s, inv) => s + (inv.amountDue ?? 0), 0)

  const filteredInvoices = useMemo(() => {
    if (!dateFrom && !dateTo) return invoices
    const from = dateFrom ? new Date(dateFrom) : new Date(0)
    const to = dateTo ? new Date(dateTo + 'T23:59:59') : new Date()
    return invoices.filter(inv => {
      const d = new Date(inv.createdAt)
      return d >= from && d <= to
    })
  }, [invoices, dateFrom, dateTo])

  const filteredLedger = useMemo(() => {
    if (!dateFrom && !dateTo) return walletLedger
    const from = dateFrom ? new Date(dateFrom) : new Date(0)
    const to = dateTo ? new Date(dateTo + 'T23:59:59') : new Date()
    return walletLedger.filter(e => {
      const d = new Date(e.createdAt)
      return d >= from && d <= to
    })
  }, [walletLedger, dateFrom, dateTo])

  const filteredSubscriptions = useMemo(() => {
    if (!dateFrom && !dateTo) return subscriptions
    const from = dateFrom ? new Date(dateFrom) : new Date(0)
    const to = dateTo ? new Date(dateTo + 'T23:59:59') : new Date()
    return subscriptions.filter(s => {
      const d = new Date(s.createdAt)
      return d >= from && d <= to
    })
  }, [subscriptions, dateFrom, dateTo])

  const filteredOrders = useMemo(() => {
    if (!dateFrom && !dateTo) return orders
    const from = dateFrom ? new Date(dateFrom) : new Date(0)
    const to = dateTo ? new Date(dateTo + 'T23:59:59') : new Date()
    return orders.filter(o => {
      const d = new Date(o.createdAt)
      return d >= from && d <= to
    })
  }, [orders, dateFrom, dateTo])

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8" dir="rtl">
        <div className="mb-6">
          <div className="h-8 w-32 bg-bg-soft rounded mb-2 animate-pulse" />
          <div className="h-4 w-56 bg-bg-soft rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-surface border border-border rounded-2xl p-5 flex flex-col gap-3 animate-pulse">
              <div className="w-9 h-9 rounded-xl bg-bg-soft" />
              <div className="h-7 w-16 bg-bg-soft rounded" />
              <div className="h-3 w-24 bg-bg-soft rounded" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  function handleExportOperations() {
    exportOperationsToExcel(filteredOrders, filteredInvoices, filteredLedger, filteredSubscriptions, `financial-operations-${dateFrom}-${dateTo}.xlsx`)
  }

  const hasFilters = dateFrom !== thirtyDaysAgo || dateTo !== today

  return (
    <div className="max-w-5xl mx-auto px-4 py-8" dir="rtl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-success-100 to-success-100/60 flex items-center justify-center shadow-sm">
          <Banknote size={20} className="text-success" />
        </div>
        <div>
          <h1 className="font-cairo font-extrabold text-2xl text-text">المالية</h1>
          <p className="font-cairo text-sm text-text-muted mt-0.5">العمليات المالية والفواتير.</p>
        </div>
      </div>

      {/* Date filter bar */}
      {isPaid && (
        <div className="bg-surface border border-border rounded-2xl p-4 mb-6 shadow-sm">
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-cairo text-xs font-semibold text-text-muted">من تاريخ</label>
              <input
                type="date"
                value={dateFrom}
                onChange={e => setDateFrom(e.target.value)}
                className="h-11 rounded-xl border border-border bg-surface px-3 font-cairo text-sm text-text outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(24,33,47,0.08)] transition-all"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-cairo text-xs font-semibold text-text-muted">إلى تاريخ</label>
              <input
                type="date"
                value={dateTo}
                onChange={e => setDateTo(e.target.value)}
                className="h-11 rounded-xl border border-border bg-surface px-3 font-cairo text-sm text-text outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(24,33,47,0.08)] transition-all"
              />
            </div>
            {hasFilters && (
              <button
                type="button"
                onClick={() => { setDateFrom(thirtyDaysAgo); setDateTo(today) }}
                className="h-11 rounded-xl border border-border bg-bg px-4 font-cairo text-sm font-semibold text-text-muted hover:bg-bg-soft transition-all"
              >
                إعادة تعيين
              </button>
            )}
            <button
              onClick={handleExportOperations}
              className="flex items-center gap-1.5 h-11 rounded-xl bg-accent text-white px-4 font-cairo text-xs font-bold hover:bg-accent-700 transition-all shadow-sm shrink-0"
            >
              <FileDown size={14} />
              تصدير ({filteredOrders.length + filteredInvoices.length + filteredLedger.length + filteredSubscriptions.length})
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={Banknote}
          label="إجمالي الإيرادات"
          value={`${formatPrice(stats.totalRevenue)} ر.ي`}
          sub="من الطلبات المؤكدة والمسلمة"
          iconBg="bg-success-100 text-success"
        />
        <StatCard
          icon={ShoppingBag}
          label="إجمالي الطلبات"
          value={formatPrice(stats.totalOrders)}
          sub={`${stats.completedOrders} مكتمل`}
          iconBg="bg-primary/10 text-primary"
        />
        <StatCard
          icon={TrendingUp}
          label="متوسط قيمة الطلب"
          value={`${formatPrice(stats.avgOrder)} ر.ي`}
          sub="للطلبات المكتملة"
          iconBg="bg-info-100 text-info"
        />
        <StatCard
          icon={Clock}
          label="المبلغ المعلق"
          value={`${formatPrice(stats.pendingAmount)} ر.ي`}
          sub="بانتظار المراجعة"
          iconBg="bg-warning-100 text-warning"
        />
      </div>

      {monthlyData.length > 0 && plan !== 'starter' && (
        <div className="bg-surface border border-border rounded-2xl p-6 mb-6">
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
                  <span className="font-inter text-[11px] font-bold text-text-muted dk-num">
                    {formatPrice(amount)}
                  </span>
                  <div
                    className="w-10 rounded-lg bg-accent transition-all duration-300 hover:bg-accent-700"
                    style={{ height: `${Math.max(pct, 4)}%` }}
                  />
                  <span className="font-cairo text-[11px] text-text-subtle whitespace-nowrap">
                    {MONTH_NAMES[month] || month}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Upgrade prompt for Free plan — unlock charts */}
      {plan === 'starter' && (
        <div className="bg-surface border border-border rounded-2xl p-6 mb-6 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-bg-soft flex items-center justify-center shrink-0 text-text-subtle">
            <BarChart3 size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-cairo font-bold text-sm text-text">الرسوم البيانية متاحة في الباقات المدفوعة</p>
            <p className="font-cairo text-xs text-text-muted mt-0.5">
              حسّن متجرك مع تقارير مبيعات شهرية وتحليلات متقدمة — اشترك في Pro أو Business الآن.
            </p>
            <a
              href="/subscribe?plan=pro"
              className="inline-flex items-center gap-1 mt-3 font-cairo font-bold text-xs px-3.5 py-1.5 rounded-lg bg-primary text-white hover:bg-primary-700 transition-colors"
            >
              <Crown size={13} />
              ترقية الباقة
            </a>
          </div>
        </div>
      )}

      <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Wallet size={18} />
            </div>
            <h2 className="font-cairo font-bold text-base text-text">آخر المعاملات</h2>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-bg-soft border border-border flex items-center justify-center">
              <Banknote size={24} className="text-text-subtle" />
            </div>
            <p className="font-cairo font-bold text-text">لا توجد معاملات بعد</p>
            <p className="font-cairo text-sm text-text-muted">ستظهر المعاملات هنا فور وصول الطلبات.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[500px]">
              <div className="grid grid-cols-[1fr_1.5fr_1fr_1fr] gap-3 px-5 py-3 bg-bg/60 border-b border-border text-xs font-bold font-cairo text-text-muted">
                <span>رقم الطلب</span>
                <span>العميل</span>
                <span>المبلغ</span>
                <span>الحالة</span>
              </div>
              <div className="divide-y divide-border">
                {orders.slice(0, 20).map(order => {
                  const shortId = String(order._id).slice(-8).toUpperCase()
                  const customer = order.deliveryAddress?.name ?? order.customer?.name ?? '—'
                  const date = new Date(order.createdAt).toLocaleDateString('ar-YE', { month: 'short', day: 'numeric' })
                  return (
                    <div key={order._id} className="grid grid-cols-[1fr_1.5fr_1fr_1fr] gap-3 px-5 py-3.5 items-center hover:bg-accent-50/30 transition-all border-r-3 border-r-transparent hover:border-r-accent">
                      <span className="font-inter font-bold text-xs text-primary dk-num">#{shortId}</span>
                      <div>
                        <p className="font-cairo text-sm text-text truncate">{customer}</p>
                        <p className="font-cairo text-xs text-text-muted">{date}</p>
                      </div>
                      <span className="font-inter font-bold text-sm text-text dk-num">{formatPrice(order.totalAmount ?? 0)} ر.ي</span>
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
                        {order.status === 'payment_under_review' ? 'قيد المراجعة'
                          : order.status === 'pending' ? 'بانتظار الوصل'
                          : order.status === 'confirmed' ? 'مؤكد'
                          : order.status === 'shipped' ? 'تم الشحن'
                          : order.status === 'delivered' ? 'تم التسليم'
                          : order.status === 'rejected' ? 'مرفوض'
                          : order.status}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Subscription Finance — paid plans only */}
      {isPaid && (
        <div className="bg-surface border border-border rounded-2xl overflow-hidden mt-6">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-accent-50 text-accent-700 flex items-center justify-center">
                <CreditCard size={18} />
              </div>
              <h2 className="font-cairo font-bold text-base text-text">مالية الاشتراك</h2>
            </div>
            {invoices.length > 0 && (
              <button
                onClick={() => exportInvoicesToExcel(invoices)}
                className="flex items-center gap-1.5 h-8 rounded-lg bg-primary text-white px-3 font-cairo text-xs font-bold hover:bg-primary-700 transition-colors"
              >
                <FileDown size={13} />
                تصدير Excel
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5">
            <div className="flex flex-col gap-1">
              <span className="font-cairo text-xs text-text-muted flex items-center gap-1">
                <Wallet size={13} /> رصيد المحفظة
              </span>
              <span className="font-inter font-extrabold text-xl text-success dk-num">
                {formatPrice(walletBalance)} ر.ي
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-cairo text-xs text-text-muted flex items-center gap-1">
                <FileText size={13} /> فواتير مدفوعة
              </span>
              <span className="font-inter font-extrabold text-xl text-text dk-num">
                {verifiedInvoices.length}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-cairo text-xs text-text-muted flex items-center gap-1">
                <Banknote size={13} /> إجمالي المدفوع
              </span>
              <span className="font-inter font-extrabold text-xl text-text dk-num">
                {formatPrice(totalSpent)} ر.ي
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-cairo text-xs text-text-muted flex items-center gap-1">
                <CreditCard size={13} /> آخر دفعة
              </span>
              <span className="font-inter font-extrabold text-xl text-text dk-num">
                {invoices.length > 0 ? `${formatPrice(invoices[0].amountDue ?? 0)} ر.ي` : '—'}
              </span>
            </div>
          </div>

          {/* Invoices table */}
          {invoices.length > 0 && (
            <div className="border-t border-border overflow-x-auto">
              <div className="min-w-[500px]">
                <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-3 px-5 py-3 bg-bg border-b border-border text-xs font-semibold font-cairo text-text-muted">
                  <span>رقم الفاتورة</span>
                  <span>الخطة</span>
                  <span>المبلغ</span>
                  <span>الحالة</span>
                  <span>التاريخ</span>
                </div>
                <div className="divide-y divide-border">
                  {invoices.slice(0, 10).map(inv => (
                    <div key={inv._id} className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-3 px-5 py-3 items-center hover:bg-bg/50 transition-colors">
                      <span className="font-inter font-bold text-xs text-primary dk-num">{inv.invoiceNumber}</span>
                      <span className="font-cairo text-sm text-text">
                        {inv.plan === 'business' ? 'الأعمال' : inv.plan === 'pro' ? 'الاحترافي' : 'المبتدئ'}
                      </span>
                      <span className="font-inter font-bold text-sm text-text dk-num">{formatPrice(inv.amountDue ?? 0)} ر.ي</span>
                      <span className={`font-cairo text-xs font-semibold px-2.5 py-1 rounded-pill w-fit ${
                        inv.status === 'verified' ? 'bg-success-100 text-success'
                        : inv.status === 'paid' ? 'bg-warning-100 text-yellow-700'
                        : inv.status === 'cancelled' ? 'bg-danger-100 text-danger'
                        : 'bg-bg-soft text-text-muted'
                      }`}>
                        {inv.status === 'verified' ? 'مدفوع'
                          : inv.status === 'paid' ? 'بانتظار التحقق'
                          : inv.status === 'cancelled' ? 'ملغي'
                          : 'معلق'}
                      </span>
                      <span className="font-cairo text-xs text-text-muted">
                        {new Date(inv.createdAt).toLocaleDateString('ar-YE', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
