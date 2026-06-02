import * as XLSX from 'xlsx'

function formatPrice(v) {
  return (v ?? 0).toLocaleString('en-US')
}

function planAr(plan) {
  return plan === 'business' ? 'الأعمال' : plan === 'pro' ? 'الاحترافي' : 'المبتدئ'
}

function billingAr(b) {
  return b === 'yearly' ? 'سنوي' : 'شهري'
}

function invoiceStatusAr(s) {
  return s === 'verified' ? 'مدفوع' : s === 'paid' ? 'بانتظار التحقق' : s === 'cancelled' ? 'ملغي' : 'معلق'
}

function walletTypeAr(t) {
  const map = {
    subscription_payment: 'دفع اشتراك',
    subscription_refund: 'استرداد اشتراك',
    upgrade_credit: 'رصيد ترقية',
    admin_adjustment: 'تعديل إداري',
    wallet_use: 'استخدام رصيد',
  }
  return map[t] || t
}

function subscriptionStatusAr(s) {
  return s === 'approved' ? 'مقبول' : s === 'rejected' ? 'مرفوض' : 'معلق'
}

function contactMethodAr(m) {
  const map = { whatsapp: 'واتساب', telegram: 'تيليجرام', instagram: 'انستقرام', phone: 'اتصال' }
  return map[m] || m || '—'
}

function paymentMethodAr(m) {
  const map = { kuraimi: 'كريمي', oneCash: 'ون كاش', jaib: 'جيب', cash: 'كاش' }
  return map[m] || m || '—'
}

function orderStatusAr(s) {
  const map = {
    pending: 'بانتظار الوصل',
    payment_under_review: 'قيد المراجعة',
    confirmed: 'مؤكد',
    shipped: 'تم الشحن',
    delivered: 'تم التسليم',
    rejected: 'مرفوض',
  }
  return map[s] || s
}

export function exportOperationsToExcel(orders, invoices, walletLedger, subscriptions, filename = 'financial-operations.xlsx') {
  const wb = XLSX.utils.book_new()

  // ── Sheet 1: Transactions (customer orders) ──
  if (orders && orders.length > 0) {
    const txRows = orders.map((o, i) => ({
      '#': i + 1,
      'رقم الطلب': `#${String(o._id).slice(-8).toUpperCase()}`,
      'اسم العميل': o.deliveryAddress?.name ?? o.customer?.name ?? '—',
      'رقم الهاتف': o.deliveryAddress?.phone ?? '—',
      'المدينة': o.deliveryAddress?.city ?? '—',
      'طريقة التواصل': contactMethodAr(o.contactMethod),
      'حساب التواصل': o.contactHandle ?? '—',
      'طريقة الدفع': paymentMethodAr(o.paymentMethod),
      'المبلغ المدفوع': o.totalAmount ?? 0,
      'رسوم التوصيل': o.shippingFee ?? 0,
      'الحالة': orderStatusAr(o.status),
      'تاريخ العملية': new Date(o.createdAt).toLocaleDateString('ar-YE'),
      'ملاحظات': o.notes ?? '—',
    }))
    const ws1 = XLSX.utils.json_to_sheet(txRows)
    ws1['!cols'] = [
      { wch: 4 }, { wch: 14 }, { wch: 18 }, { wch: 14 }, { wch: 12 },
      { wch: 14 }, { wch: 14 }, { wch: 12 }, { wch: 12 }, { wch: 10 },
      { wch: 14 }, { wch: 14 }, { wch: 20 },
    ]
    XLSX.utils.book_append_sheet(wb, ws1, 'المعاملات')
  }

  // ── Sheet 2: Invoices ──
  if (invoices && invoices.length > 0) {
    const invRows = invoices.map((inv, i) => ({
      '#': i + 1,
      'رقم الفاتورة': inv.invoiceNumber,
      'الخطة': planAr(inv.plan),
      'الدورة': billingAr(inv.billing),
      'سعر الخطة': inv.planPrice ?? 0,
      'الخصم': inv.creditApplied ?? 0,
      'المبلغ المستحق': inv.amountDue ?? 0,
      'الحالة': invoiceStatusAr(inv.status),
      'تاريخ الإنشاء': new Date(inv.createdAt).toLocaleDateString('ar-YE'),
    }))
    const ws2 = XLSX.utils.json_to_sheet(invRows)
    ws2['!cols'] = [{ wch: 4 }, { wch: 18 }, { wch: 12 }, { wch: 8 }, { wch: 12 }, { wch: 10 }, { wch: 14 }, { wch: 16 }, { wch: 14 }]
    XLSX.utils.book_append_sheet(wb, ws2, 'الفواتير')
  }

  // ── Sheet 3: Wallet Ledger ──
  if (walletLedger && walletLedger.length > 0) {
    const wlRows = walletLedger.map((e, i) => ({
      '#': i + 1,
      'النوع': walletTypeAr(e.type),
      'المبلغ': e.amount ?? 0,
      'الرصيد قبل': e.balanceBefore ?? 0,
      'الرصيد بعد': e.balanceAfter ?? 0,
      'البيان': e.description ?? '—',
      'التاريخ': new Date(e.createdAt).toLocaleDateString('ar-YE'),
    }))
    const ws3 = XLSX.utils.json_to_sheet(wlRows)
    ws3['!cols'] = [{ wch: 4 }, { wch: 16 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 30 }, { wch: 14 }]
    XLSX.utils.book_append_sheet(wb, ws3, 'سجل المحفظة')
  }

  // ── Sheet 4: Subscriptions ──
  if (subscriptions && subscriptions.length > 0) {
    const subRows = subscriptions.map((s, i) => ({
      '#': i + 1,
      'الخطة المطلوبة': planAr(s.requestedPlan),
      'الخطة السابقة': s.previousPlan ? planAr(s.previousPlan) : '—',
      'الدورة': billingAr(s.billing),
      'المبلغ المستحق': s.amountDue ?? 0,
      'الرصيد المستخدم': s.walletCreditUsed ?? 0,
      'رصيد الترقية': s.walletCreditGenerated ?? 0,
      'الحالة': subscriptionStatusAr(s.status),
      'تاريخ الطلب': new Date(s.createdAt).toLocaleDateString('ar-YE'),
    }))
    const ws4 = XLSX.utils.json_to_sheet(subRows)
    ws4['!cols'] = [{ wch: 4 }, { wch: 14 }, { wch: 14 }, { wch: 8 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 14 }, { wch: 14 }]
    XLSX.utils.book_append_sheet(wb, ws4, 'طلبات الاشتراك')
  }

  XLSX.writeFile(wb, filename)
}

export function exportInvoicesToExcel(invoices, filename = 'invoices.xlsx') {
  const rows = invoices.map((inv, i) => ({
    '#': i + 1,
    'رقم الفاتورة': inv.invoiceNumber,
    'الخطة': planAr(inv.plan),
    'الدورة': billingAr(inv.billing),
    'سعر الخطة': inv.planPrice ?? 0,
    'الخصم': inv.creditApplied ?? 0,
    'المبلغ المستحق': inv.amountDue ?? 0,
    'الحالة': invoiceStatusAr(inv.status),
    'تاريخ الإنشاء': new Date(inv.createdAt).toLocaleDateString('ar-YE'),
  }))
  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.json_to_sheet(rows)
  ws['!cols'] = [{ wch: 4 }, { wch: 18 }, { wch: 12 }, { wch: 8 }, { wch: 12 }, { wch: 10 }, { wch: 14 }, { wch: 16 }, { wch: 14 }]
  XLSX.utils.book_append_sheet(wb, ws, 'الفواتير')
  XLSX.writeFile(wb, filename)
}
