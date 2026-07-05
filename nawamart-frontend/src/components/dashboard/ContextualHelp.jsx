import { useState } from 'react'
import { HelpCircle, X, BookOpen, Video, MessageCircle } from 'lucide-react'

const HELP_CONTENT = {
  'store-setup': {
    title: 'إعداد المتجر',
    icon: BookOpen,
    items: [
      { label: 'كيفية إنشاء متجر', link: 'https://docs.nawamart.dev/setup' },
      { label: 'اختيار نوع المتجر', link: 'https://docs.nawamart.dev/store-type' },
      { label: 'إضافة شعار المتجر', link: 'https://docs.nawamart.dev/logo' },
    ],
  },
  products: {
    title: 'إدارة المنتجات',
    icon: BookOpen,
    items: [
      { label: 'إضافة منتج جديد', link: 'https://docs.nawamart.dev/add-product' },
      { label: 'إدارة المخزون', link: 'https://docs.nawamart.dev/stock' },
      { label: 'المنتجات الرقمية', link: 'https://docs.nawamart.dev/digital' },
    ],
  },
  orders: {
    title: 'إدارة الطلبات',
    icon: BookOpen,
    items: [
      { label: 'تأكيد الطلبات', link: 'https://docs.nawamart.dev/confirm' },
      { label: 'حالات الطلب', link: 'https://docs.nawamart.dev/status' },
      { label: 'الشحن والتوصيل', link: 'https://docs.nawamart.dev/shipping' },
    ],
  },
  payment: {
    title: 'إعدادات الدفع',
    icon: BookOpen,
    items: [
      { label: 'إضافة المحافظ', link: 'https://docs.nawamart.dev/wallets' },
      { label: 'طريقة الدفع بالوصل', link: 'https://docs.nawamart.dev/wasl' },
    ],
  },
}

export default function ContextualHelp({ topic }) {
  const [open, setOpen] = useState(false)
  const help = HELP_CONTENT[topic]

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 left-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
        title="مساعدة"
      >
        <HelpCircle size={20} />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" dir="rtl">
          <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-sm rounded-t-2xl bg-white p-5 shadow-xl sm:rounded-2xl">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute left-3 top-3 text-text-subtle hover:text-text"
            >
              <X size={16} />
            </button>

            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-info-100">
                {help?.icon ? <help.icon size={18} className="text-info" /> : <HelpCircle size={18} className="text-info" />}
              </div>
              <div>
                <h3 className="font-cairo text-sm font-extrabold text-text">{help?.title || 'مساعدة'}</h3>
                <p className="font-cairo text-[10px] text-text-subtle">المستندات والدروس</p>
              </div>
            </div>

            {help?.items?.length > 0 ? (
              <ul className="space-y-2">
                {help.items.map((item, i) => (
                  <li key={i}>
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 font-cairo text-sm font-semibold text-text transition-colors hover:bg-bg-soft"
                    >
                      <BookOpen size={14} className="shrink-0 text-text-subtle" />
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="rounded-lg bg-bg-soft p-4 text-center">
                <BookOpen size={24} className="mx-auto text-text-subtle" />
                <p className="mt-2 font-cairo text-xs text-text-muted">راجع دليل الاستخدام الشامل للمزيد من المعلومات.</p>
                <a
                  href="https://docs.nawamart.dev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block font-cairo text-xs font-bold text-primary"
                >
                  فتح الدليل →
                </a>
              </div>
            )}

            <div className="mt-4 border-t border-border pt-3">
              <a
                href="https://wa.me/967XXXXXXXX"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 font-cairo text-xs font-semibold text-text transition-colors hover:bg-bg-soft"
              >
                <MessageCircle size={14} className="text-success" />
                تواصل مع الدعم الفني عبر واتساب
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  )
}