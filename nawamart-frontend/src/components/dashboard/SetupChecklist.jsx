import { NavLink } from 'react-router-dom'
import { Check, ChevronLeft, Package, CreditCard, MapPin, Globe, Rocket, Store } from 'lucide-react'

const STEPS = [
  { key: 'store', label: 'بيانات المتجر', icon: Store, path: '/dashboard/settings', hint: 'أضف اسم المتجر وشعاره ووصفه' },
  { key: 'products', label: 'المنتجات', icon: Package, path: '/dashboard/products', hint: 'أضف منتجك الأول' },
  { key: 'payment', label: 'المحافظ المالية', icon: CreditCard, path: '/dashboard/settings', hint: 'أضف أرقام المحافظ' },
  { key: 'shipping', label: 'الشحن', icon: MapPin, path: '/dashboard/settings', hint: 'حدد رسوم الشحن' },
  { key: 'domain', label: 'النطاق', icon: Globe, path: '/dashboard/settings', hint: 'اربط نطاقاً مخصصاً' },
  { key: 'launch', label: 'إطلاق المتجر', icon: Rocket, path: '/dashboard/shop', hint: 'فعّل المتجر للعملاء' },
]

export default function SetupChecklist({ store, onClose }) {
  const completed = {
    store: !!(store?.name && store?.description),
    products: (store?.totalProducts ?? 0) > 0,
    payment: !!(store?.paymentAccounts?.kuraimi || store?.paymentAccounts?.oneCash || store?.paymentAccounts?.jaib),
    shipping: store?.type === 'digital' || (store?.shippingFees?.length ?? 0) > 0,
    domain: !!store?.customDomain,
    launch: store?.isActive !== false,
  }

  const doneCount = Object.values(completed).filter(Boolean).length
  const totalCount = STEPS.length
  const progress = Math.round((doneCount / totalCount) * 100)

  return (
    <div className="rounded-xl border border-border bg-white p-5 shadow-sm" dir="rtl">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-cairo text-sm font-extrabold text-text">قائمة التجهيز</h3>
        <span className="font-cairo text-xs font-bold text-primary">{doneCount}/{totalCount}</span>
      </div>

      <div className="mb-4 h-2 overflow-hidden rounded-full bg-bg-soft">
        <div
          className="h-full rounded-full bg-gradient-to-l from-primary to-accent transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="space-y-1">
        {STEPS.map(({ key, label, icon: Icon, path, hint }) => {
          const done = completed[key]
          return (
            <NavLink
              key={key}
              to={path}
              onClick={onClose}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-bg-soft ${
                done ? 'opacity-60' : ''
              }`}
            >
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                  done
                    ? 'border-success bg-success text-white'
                    : 'border-border text-text-subtle'
                }`}
              >
                {done ? <Check size={12} strokeWidth={3} /> : <Icon size={12} />}
              </div>
              <div className="min-w-0 flex-1">
                <p className={`truncate font-cairo text-xs font-bold ${done ? 'text-text-muted' : 'text-text'}`}>
                  {label}
                </p>
                {!done && <p className="truncate font-cairo text-[10px] text-text-subtle">{hint}</p>}
              </div>
              {!done && <ChevronLeft size={12} className="shrink-0 text-text-subtle" />}
            </NavLink>
          )
        })}
      </div>

      {progress === 100 && (
        <div className="mt-4 rounded-lg bg-success-100 p-3 text-center">
          <Rocket size={18} className="mx-auto text-success-dark" />
          <p className="mt-1 font-cairo text-xs font-bold text-success-dark">متجرك جاهز! يمكنك البدء في استقبال الطلبات.</p>
        </div>
      )}
    </div>
  )
}