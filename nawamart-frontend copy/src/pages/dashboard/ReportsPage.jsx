import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import usePageTitle from '@/hooks/usePageTitle'
import { getMerchantOrders } from '@/api/orders'
import { BarChart3, Banknote, ShoppingBag, Package, TrendingUp, ChevronDown, ChevronUp, FileText, FileDown, MapPin } from 'lucide-react'

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

const STATUS_OPTIONS = [
  { value: '', label: 'الكل' },
  { value: 'pending', label: 'بانتظار الوصل' },
  { value: 'payment_under_review', label: 'قيد المراجعة' },
  { value: 'confirmed', label: 'مؤكد' },
  { value: 'shipped', label: 'تم الشحن' },
  { value: 'delivered', label: 'تم التسليم' },
  { value: 'rejected', label: 'مرفوض' },
]

function statusBadge(status) {
  const base = 'inline-flex items-center gap-1.5 text-xs font-semibold font-cairo px-2.5 py-1 rounded-pill w-fit'
  const map = {
    delivered: 'bg-success-100 text-success',
    confirmed: 'bg-success-100 text-success',
    shipped: 'bg-info-100 text-info',
    rejected: 'bg-danger-100 text-danger',
    pending: 'bg-warning-100 text-yellow-700',
    payment_under_review: 'bg-warning-100 text-yellow-700',
  }
  const labels = {
    payment_under_review: 'قيد المراجعة',
    pending: 'بانتظار الوصل',
    confirmed: 'مؤكد',
    shipped: 'تم الشحن',
    delivered: 'تم التسليم',
    rejected: 'مرفوض',
  }
  return (
    <span className={`${base} ${map[status] || 'bg-bg-soft text-text-muted'}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
      {labels[status] || status}
    </span>
  )
}

export default function ReportsPage() {
  usePageTitle('التقارير')

  const today = new Date().toISOString().split('T')[0]
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  const [dateFrom, setDateFrom] = useState(thirtyDaysAgo)
  const [dateTo, setDateTo] = useState(today)
  const [statusFilter, setStatusFilter] = useState('')
  const [expandedOrder, setExpandedOrder] = useState(null)

  const queryParams = useMemo(() => {
    const params = {}
    if (dateFrom) params.date_from = dateFrom
    if (dateTo) params.date_to = dateTo
    if (statusFilter) params.status = statusFilter
    return params
  }, [dateFrom, dateTo, statusFilter])

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['merchant-orders-report', queryParams],
    queryFn: () => getMerchantOrders(queryParams).then(r => r.data.data ?? []),
    staleTime: 30_000,
  })

  const stats = useMemo(() => {
    const completed = orders.filter(o => o.status === 'delivered' || o.status === 'confirmed')
    const totalRevenue = completed.reduce((s, o) => s + (o.totalAmount ?? 0), 0)
    const totalOrders = orders.length
    const completedOrders = completed.length
    const totalItems = orders.reduce((s, o) => s + (o.items || []).reduce((si, item) => si + (item.quantity || 0), 0), 0)
    const avgOrder = completedOrders > 0 ? totalRevenue / completedOrders : 0
    return { totalRevenue, totalOrders, completedOrders, totalItems, avgOrder }
  }, [orders])

  function exportOrderPDF(order) {
    const shortId = String(order._id).slice(-8).toUpperCase()
    const customer = order.deliveryAddress?.name ?? order.customer?.name ?? '—'
    const date = new Date(order.createdAt).toLocaleDateString('ar-YE', {
      year: 'numeric', month: 'long', day: 'numeric',
    })
    const paymentLabel = order.paymentMethod === 'kuraimi' ? 'كريمي'
      : order.paymentMethod === 'oneCash' ? 'ون كاش'
      : order.paymentMethod === 'jaib' ? 'جيب'
      : order.paymentMethod === 'cash' ? 'كاش'
      : order.paymentMethod
    const contactLabel = order.contactMethod === 'whatsapp' ? 'واتساب'
      : order.contactMethod === 'telegram' ? 'تيليجرام'
      : order.contactMethod === 'instagram' ? 'انستقرام'
      : order.contactMethod === 'phone' ? 'اتصال'
      : order.contactMethod || '—'

    const itemsHTML = (order.items || []).map(item => `
      <tr>
        <td>${item.name}</td>
        <td>${item.quantity}</td>
        <td><span class="dk-num">${formatPrice(item.price)} ر.ي</span></td>
        <td><span class="dk-num">${formatPrice(item.price * item.quantity)} ر.ي</span></td>
      </tr>
    `).join('')

    const statusLabel = order.status === 'payment_under_review' ? 'قيد المراجعة'
      : order.status === 'pending' ? 'بانتظار الوصل'
      : order.status === 'confirmed' ? 'مؤكد'
      : order.status === 'shipped' ? 'تم الشحن'
      : order.status === 'delivered' ? 'تم التسليم'
      : order.status === 'rejected' ? 'مرفوض'
      : order.status

    const win = window.open('', '_blank')
    win.document.write(`
      <!DOCTYPE html>
      <html dir="rtl">
      <head>
        <meta charset="UTF-8" />
        <title>طلب #${shortId}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet">
        <style>
          @page { margin: 12mm 15mm; }
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Cairo', 'Segoe UI', Tahoma, sans-serif;
            color: #1f2937; background: #f8fafc; padding: 0;
            position: relative; min-height: 100vh;
          }
          .watermark {
            position: fixed; top: 50%; left: 50%;
            transform: translate(-50%, -50%);
            opacity: 0.04; pointer-events: none; z-index: 0;
          }
          .watermark svg { width: 500px; height: 500px; }
          .page { position: relative; z-index: 1; max-width: 800px; margin: 0 auto; background: #fff; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); padding: 40px 45px; }

          /* ── Top brand bar ── */
          .brand-bar {
            display: flex; align-items: center; justify-content: space-between;
            padding-bottom: 20px; border-bottom: 3px solid #dc2626; margin-bottom: 28px;
          }
          .brand-left { display: flex; align-items: center; gap: 12px; }
          .brand-icon {
            width: 42px; height: 42px; background: #0d1b2a; border-radius: 10px;
            display: flex; align-items: center; justify-content: center;
          }
          .brand-icon svg { width: 28px; height: 28px; }
          .brand-name { font-size: 18px; font-weight: 900; color: #0d1b2a; letter-spacing: -0.3px; }
          .brand-tag { font-size: 11px; color: #9ca3af; font-weight: 600; }
          .badge-status {
            display: inline-block; background: #dcfce7; color: #16a34a;
            padding: 4px 14px; border-radius: 999px; font-size: 12px; font-weight: 700;
          }
          .badge-status.rejected { background: #fef2f2; color: #dc2626; }
          .badge-status.pending,
          .badge-status.payment_under_review { background: #fef9c3; color: #ca8a04; }

          /* ── Title row ── */
          .title-row {
            display: flex; align-items: center; justify-content: space-between;
            margin-bottom: 28px;
          }
          .title-row h1 { font-size: 22px; font-weight: 800; color: #0d1b2a; }
          .title-row .meta { text-align: left; direction: ltr; }
          .title-row .meta .num { font-family: 'Inter', monospace; font-size: 13px; font-weight: 700; color: #6b7280; }
          .title-row .meta .date { font-family: 'Cairo', sans-serif; font-size: 12px; color: #9ca3af; }

          /* ── Info cards ── */
          .info-grid { display: flex; gap: 24px; margin-bottom: 30px; }
          .info-card {
            flex: 1; background: #f8fafc; border-radius: 10px;
            padding: 18px 20px; border: 1px solid #f1f5f9;
          }
          .info-card h3 {
            font-size: 11px; font-weight: 700; color: #94a3b8;
            text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 10px;
          }
          .info-card .name { font-size: 15px; font-weight: 700; color: #0f172a; margin-bottom: 2px; }
          .info-card .detail { font-size: 13px; color: #64748b; line-height: 1.6; }
          .info-card .ltr { direction: ltr; text-align: left; font-family: 'Inter', monospace; font-size: 13px; color: #64748b; }

          /* ── Items table ── */
          .section-title {
            font-size: 13px; font-weight: 800; color: #0d1b2a;
            margin-bottom: 10px; display: flex; align-items: center; gap: 8px;
          }
          .section-title::after {
            content: ''; flex: 1; height: 1px; background: #e2e8f0;
          }
          table { width: 100%; border-collapse: collapse; margin-bottom: 24px; border-radius: 8px; overflow: hidden; }
          th {
            background: #0d1b2a; color: #fff; font-size: 11px; font-weight: 700;
            padding: 10px 14px; text-align: center; letter-spacing: 0.3px;
          }
          th:first-child { text-align: right; }
          td {
            font-size: 13px; padding: 10px 14px; text-align: center;
            border-bottom: 1px solid #f1f5f9;
          }
          td:first-child { text-align: right; font-weight: 600; color: #0f172a; }
          tr:nth-child(even) td { background: #fafbfc; }
          .total-row td {
            background: #f1f5f9 !important; font-weight: 800; font-size: 14px;
            border-top: 2px solid #0d1b2a; padding: 12px 14px;
          }
          .total-row td:last-child { color: #dc2626; font-size: 16px; }
          .dk-num { font-family: 'Inter', 'Courier New', monospace; direction: ltr; display: inline-block; }

          /* ── Timeline ── */
          .timeline {
            display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 28px;
            padding: 16px 20px; background: #f8fafc; border-radius: 10px;
            border: 1px solid #f1f5f9;
          }
          .timeline-item { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #64748b; }
          .timeline-dot { width: 6px; height: 6px; border-radius: 50%; background: #cbd5e1; }
          .timeline-dot.active { background: #16a34a; }
          .timeline-dot.rejected { background: #dc2626; }

          /* ── Footer ── */
          .footer {
            border-top: 1px solid #e2e8f0; padding-top: 18px;
            display: flex; align-items: center; justify-content: space-between;
            font-size: 11px; color: #94a3b8;
          }
          .footer strong { color: #0d1b2a; }
        </style>
      </head>
      <body>
        <div class="watermark">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
            <rect x="0" y="0" width="64" height="64" rx="12" fill="#0D1B2A"/>
            <path d="M14 16 L24 16 L40 38 L40 16 L50 16 L50 48 L40 48 L24 26 L24 48 L14 48 Z" fill="#FFFFFF"/>
            <circle cx="50" cy="20" r="4" fill="#DC2626"/>
          </svg>
        </div>

        <div class="page">
          <!-- Brand bar -->
          <div class="brand-bar">
            <div class="brand-left">
              <div class="brand-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
                  <rect x="0" y="0" width="64" height="64" rx="12" fill="#0D1B2A"/>
                  <path d="M14 16 L24 16 L40 38 L40 16 L50 16 L50 48 L40 48 L24 26 L24 48 L14 48 Z" fill="#FFFFFF"/>
                  <circle cx="50" cy="20" r="4" fill="#DC2626"/>
                </svg>
              </div>
              <div>
                <div class="brand-name">NawaMart</div>
                <div class="brand-tag">منصة التجارة الإلكترونية</div>
              </div>
            </div>
            <span class="badge-status ${order.status}">${statusLabel}</span>
          </div>

          <!-- Title -->
          <div class="title-row">
            <h1>تقرير الطلب</h1>
            <div class="meta">
              <div class="num">#${shortId}</div>
              <div class="date">${date}</div>
            </div>
          </div>

          <!-- Info cards -->
          <div class="info-grid">
            <div class="info-card">
              <h3>معلومات العميل</h3>
              <div class="name">${customer}</div>
              <div class="detail">${order.deliveryAddress?.city || ''}${order.deliveryAddress?.district ? ' - ' + order.deliveryAddress.district : ''}</div>
              ${order.deliveryAddress?.details ? `<div class="detail">${order.deliveryAddress.details}</div>` : ''}
              <div class="ltr">${order.deliveryAddress?.phone || ''}</div>
            </div>
            <div class="info-card">
              <h3>معلومات الدفع</h3>
              <div class="name">${paymentLabel}</div>
              <div class="detail">المجموع: <span class="dk-num" style="font-weight:700">${formatPrice(order.totalAmount ?? 0)} ر.ي</span></div>
              ${order.shippingFee > 0 ? `<div class="detail">رسوم التوصيل: <span class="dk-num">${formatPrice(order.shippingFee)} ر.ي</span></div>` : ''}
              ${order.contactHandle ? `<div class="detail">${contactLabel}: ${order.contactHandle}</div>` : ''}
            </div>
          </div>

          <!-- Items -->
          <div class="section-title">المنتجات</div>
          <table>
            <thead>
              <tr>
                <th style="text-align:right">المنتج</th>
                <th style="width:80px">الكمية</th>
                <th style="width:100px">سعر الوحدة</th>
                <th style="width:110px">المجموع</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHTML}
              <tr class="total-row">
                <td colspan="3" style="text-align:left">الإجمالي الكلي</td>
                <td style="text-align:center"><span class="dk-num">${formatPrice(order.totalAmount ?? 0)} ر.ي</span></td>
              </tr>
            </tbody>
          </table>

          <!-- Timeline -->
          <div class="timeline">
            <span class="timeline-item">
              <span class="timeline-dot active"></span> تم الطلب: ${new Date(order.createdAt).toLocaleDateString('ar-YE', { month: 'short', day: 'numeric' })}
            </span>
            ${order.confirmedAt ? `<span class="timeline-item"><span class="timeline-dot active"></span> تأكيد: ${new Date(order.confirmedAt).toLocaleDateString('ar-YE', { month: 'short', day: 'numeric' })}</span>` : ''}
            ${order.shippedAt ? `<span class="timeline-item"><span class="timeline-dot active"></span> شحن: ${new Date(order.shippedAt).toLocaleDateString('ar-YE', { month: 'short', day: 'numeric' })}</span>` : ''}
            ${order.deliveredAt ? `<span class="timeline-item"><span class="timeline-dot active"></span> تسليم: ${new Date(order.deliveredAt).toLocaleDateString('ar-YE', { month: 'short', day: 'numeric' })}</span>` : ''}
            ${order.rejectedAt ? `<span class="timeline-item"><span class="timeline-dot rejected"></span> رفض: ${new Date(order.rejectedAt).toLocaleDateString('ar-YE', { month: 'short', day: 'numeric' })}</span>` : ''}
          </div>

          ${order.notes ? `<div style="margin-bottom:20px;padding:12px 16px;background:#fffbeb;border:1px solid #fef3c7;border-radius:8px;font-size:13px;color:#92400e"><strong>ملاحظات:</strong> ${order.notes}</div>` : ''}

          <!-- Footer -->
          <div class="footer">
            <span>تقرير تم إنشاؤه من <strong>NawaMart</strong></span>
            <span>جميع الحقوق محفوظة &copy; ${new Date().getFullYear()}</span>
          </div>
        </div>
        <script>
          window.onload = function() { window.print(); window.onafterprint = function() { window.close(); }; };
        <\/script>
      </body>
      </html>
    `)
    win.document.close()
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8" dir="rtl">

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-cairo font-extrabold text-2xl text-text">التقارير</h1>
          <p className="font-cairo text-sm text-text-muted mt-0.5">تفاصيل المشتريات وتقارير المبيعات.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-border rounded-2xl p-4 mb-6">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="font-cairo text-xs font-semibold text-text-muted">من تاريخ</label>
            <input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              className="h-10 rounded-lg border border-border bg-white px-3 font-cairo text-sm text-text outline-none focus:border-primary transition-colors"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-cairo text-xs font-semibold text-text-muted">إلى تاريخ</label>
            <input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              className="h-10 rounded-lg border border-border bg-white px-3 font-cairo text-sm text-text outline-none focus:border-primary transition-colors"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-cairo text-xs font-semibold text-text-muted">الحالة</label>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="h-10 rounded-lg border border-border bg-white px-3 font-cairo text-sm text-text outline-none focus:border-primary transition-colors"
            >
              {STATUS_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          {(dateFrom !== thirtyDaysAgo || dateTo !== today || statusFilter !== '') && (
            <button
              type="button"
              onClick={() => {
                setDateFrom(thirtyDaysAgo)
                setDateTo(today)
                setStatusFilter('')
              }}
              className="h-10 rounded-lg border border-border bg-bg px-4 font-cairo text-sm font-semibold text-text-muted hover:bg-bg-soft transition-colors"
            >
              إعادة تعيين
            </button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white border border-border rounded-2xl p-5 flex flex-col gap-3 animate-pulse">
              <div className="w-9 h-9 rounded-xl bg-bg-soft" />
              <div className="h-7 w-16 bg-bg-soft rounded" />
              <div className="h-3 w-24 bg-bg-soft rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard icon={ShoppingBag} label="إجمالي الطلبات" value={formatPrice(stats.totalOrders)} sub={`${stats.completedOrders} مكتمل`} iconBg="bg-primary/10 text-primary" />
          <StatCard icon={Banknote} label="إجمالي الإيرادات" value={`${formatPrice(stats.totalRevenue)} ر.ي`} sub="من الطلبات المكتملة" iconBg="bg-success-100 text-success" />
          <StatCard icon={Package} label="إجمالي القطع المباعة" value={formatPrice(stats.totalItems)} sub="من جميع الطلبات" iconBg="bg-info-100 text-info" />
          <StatCard icon={TrendingUp} label="متوسط قيمة الطلب" value={`${formatPrice(stats.avgOrder)} ر.ي`} sub="للطلبات المكتملة" iconBg="bg-accent-50 text-accent-700" />
        </div>
      )}

      {/* Detailed Report Table */}
      <div className="bg-white border border-border rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <FileText size={18} />
            </div>
            <h2 className="font-cairo font-bold text-base text-text">تفاصيل المشتريات</h2>
          </div>
          <span className="font-cairo text-xs text-text-muted">{orders.length} طلب</span>
        </div>

        {isLoading ? (
          <div className="divide-y divide-border">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4 animate-pulse">
                <div className="h-4 w-16 bg-bg-soft rounded" />
                <div className="h-4 w-24 bg-bg-soft rounded" />
                <div className="h-4 w-32 bg-bg-soft rounded" />
                <div className="h-4 w-16 bg-bg-soft rounded mr-auto" />
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-bg-soft border border-border flex items-center justify-center">
              <BarChart3 size={24} className="text-text-subtle" />
            </div>
            <p className="font-cairo font-bold text-text">لا توجد طلبات في هذه الفترة</p>
            <p className="font-cairo text-sm text-text-muted">جرّب تغيير نطاق التاريخ أو تصفية الحالة.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {orders.map(order => {
              const shortId = String(order._id).slice(-8).toUpperCase()
              const customer = order.deliveryAddress?.name ?? order.customer?.name ?? '—'
              const date = new Date(order.createdAt).toLocaleDateString('ar-YE', {
                year: 'numeric', month: 'short', day: 'numeric',
              })
              const itemCount = (order.items || []).reduce((s, i) => s + (i.quantity || 0), 0)
              const isExpanded = expandedOrder === order._id

              return (
                <div key={order._id}>
                  <button
                    type="button"
                    onClick={() => setExpandedOrder(isExpanded ? null : order._id)}
                    className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-bg/50 transition-colors text-right"
                  >
                    <div className="min-w-0 flex-1 grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 items-center">
                      <span className="font-inter font-bold text-xs text-primary dk-num">#{shortId}</span>
                      <div className="min-w-0">
                        <p className="font-cairo text-sm text-text truncate">{customer}</p>
                        <p className="font-cairo text-xs text-text-muted">{date}</p>
                      </div>
                      <span className="font-cairo text-xs text-text-muted whitespace-nowrap">{itemCount} قطعة</span>
                      <span className="font-inter font-bold text-sm text-text dk-num whitespace-nowrap">{formatPrice(order.totalAmount ?? 0)} ر.ي</span>
                      {statusBadge(order.status)}
                    </div>
                    <div className="shrink-0 text-text-subtle">
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="bg-bg/50 border-t border-border px-5 py-4">
                      <div className="flex items-start justify-between mb-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
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
                              <p className="font-cairo text-sm text-text">
                                {order.paymentMethod === 'kuraimi' ? 'كريمي'
                                  : order.paymentMethod === 'oneCash' ? 'ون كاش'
                                  : order.paymentMethod === 'jaib' ? 'جيب'
                                  : order.paymentMethod === 'cash' ? 'كاش'
                                  : order.paymentMethod}
                              </p>
                              <p className="font-cairo text-xs text-text-muted">
                                الإجمالي: <span className="font-inter font-bold dk-num">{formatPrice(order.totalAmount ?? 0)} ر.ي</span>
                                {order.shippingFee > 0 && ` (توصيل: ${formatPrice(order.shippingFee)} ر.ي)`}
                              </p>
                              {order.contactMethod && order.contactHandle && (
                                <p className="font-cairo text-xs text-text-muted">
                                  {order.contactMethod === 'whatsapp' ? 'واتساب'
                                    : order.contactMethod === 'telegram' ? 'تيليجرام'
                                    : order.contactMethod === 'instagram' ? 'انستقرام'
                                    : order.contactMethod}: {order.contactHandle}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => exportOrderPDF(order)}
                          className="shrink-0 flex items-center gap-1.5 h-8 rounded-lg bg-primary text-white px-3 font-cairo text-xs font-bold hover:bg-primary-700 transition-colors"
                        >
                          <FileDown size={14} />
                          PDF
                        </button>
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

                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-4">
                          <span className="font-cairo text-xs text-text-muted">
                            طريقة التواصل: {order.contactMethod === 'whatsapp' ? 'واتساب'
                              : order.contactMethod === 'telegram' ? 'تيليجرام'
                              : order.contactMethod === 'instagram' ? 'انستقرام'
                              : order.contactMethod === 'phone' ? 'اتصال'
                              : '—'}
                          </span>
                          {order.notes && (
                            <span className="font-cairo text-xs text-text-muted">ملاحظات: {order.notes}</span>
                          )}
                        </div>
                        <span className="font-cairo text-xs text-text-muted">
                          {order.status === 'confirmed' && order.confirmedAt ? `تأكيد: ${new Date(order.confirmedAt).toLocaleDateString('ar-YE', { month: 'short', day: 'numeric' })}` : ''}
                          {order.status === 'delivered' && order.deliveredAt ? `تسليم: ${new Date(order.deliveredAt).toLocaleDateString('ar-YE', { month: 'short', day: 'numeric' })}` : ''}
                          {order.status === 'rejected' && order.rejectedAt ? `رفض: ${new Date(order.rejectedAt).toLocaleDateString('ar-YE', { month: 'short', day: 'numeric' })}` : ''}
                        </span>
                      </div>
                    </div>
                  )}
                  </div>
                )
              })}
          </div>
        )}
      </div>
    </div>
  )
}
