import Icon from '@/components/ui/Icon'

const TYPES = [
  {
    key: 'physical',
    icon: 'truck',
    badge: '🚚 توصيل',
    title: 'منتجات مادية',
    sub: 'ملابس، أغذية، إكسسوارات، ومنتجات تُشحن للعميل. عنوان توصيل، تأكيد وصل الدفع، ثم شحن وتتبع.',
    tags: ['ملابس', 'أغذية', 'إكسسوارات', 'منتجات يدوية'],
    features: [
      'صفحة سلة + إدخال عنوان توصيل',
      'رفع صورة الوصل وتأكيد التاجر',
      'تتبع حالة الطلب · بانتظار ← مؤكد ← شُحن ← تم التسليم',
    ],
    digital: false,
  },
  {
    key: 'digital',
    icon: 'bolt',
    badge: '⚡ تسليم فوري',
    title: 'منتجات رقمية',
    sub: 'اشتراكات، أكواد ألعاب، حسابات، تطبيقات. لا عنوان توصيل — بل قناة محادثة خاصة تفتح فور تأكيد الدفع.',
    tags: ['اشتراكات', 'أكواد ألعاب', 'حسابات', 'برامج'],
    features: [
      'سلة دون عنوان شحن · رفع الوصل فقط',
      'محادثة خاصة تفتح بعد تأكيد الدفع',
      'إرسال المنتج: رابط، كود، حساب، ملف',
    ],
    digital: true,
  },
]

export default function LandingStoreTypes() {
  return (
    <section id="platform" className="px-8 py-20">
      <div className="max-w-[1240px] mx-auto">

        {/* Section head */}
        <div className="text-center max-w-[720px] mx-auto mb-12">
          <span className="font-inter text-xs font-bold tracking-[0.18em] text-accent uppercase mb-3 block">
            Two store types · in one platform
          </span>
          <h2 className="font-cairo font-extrabold text-[44px] leading-[1.15] text-text mb-3.5">
            متجر يناسب ما تبيعه
          </h2>
          <p className="font-cairo text-[17px] leading-[1.6] text-text-muted">
            سواء كنت تبيع منتجات مادية تُشحن للعميل، أو منتجات رقمية تُسلَّم فوراً عبر المحادثة — اختر نوع متجرك وستحصل على التدفق المناسب تماماً.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-2 gap-6">
          {TYPES.map(t => (
            <div
              key={t.key}
              className={`rounded-[20px] p-8 flex flex-col gap-5 relative overflow-hidden border
                ${t.digital
                  ? 'bg-primary-800 text-white border-primary-800'
                  : 'bg-white border-border'}`}
            >
              {/* Icon + badge row */}
              <div className="flex items-center justify-between">
                <div className={`w-[60px] h-[60px] rounded-[14px] flex items-center justify-center flex-none
                  ${t.digital ? 'bg-accent/20 text-accent' : 'bg-primary-50 text-primary'}`}>
                  <Icon name={t.icon} size={28} />
                </div>
                <span className={`inline-flex items-center gap-1.5 font-cairo text-xs font-bold px-3 py-1.5 rounded-pill
                  ${t.digital ? 'bg-accent/15 text-accent' : 'bg-primary-50 text-primary'}`}>
                  {t.badge}
                </span>
              </div>

              {/* Title */}
              <h3 className={`font-cairo font-extrabold text-[28px] leading-[1.2]
                ${t.digital ? 'text-white' : 'text-text'}`}>
                {t.title}
              </h3>

              {/* Sub */}
              <p className={`font-cairo text-[15.5px] leading-[1.6]
                ${t.digital ? 'text-white/70' : 'text-text-muted'}`}>
                {t.sub}
              </p>

              {/* Tags */}
              <div className="flex gap-1.5 flex-wrap">
                {t.tags.map(tag => (
                  <span key={tag} className={`font-cairo text-[12.5px] font-medium px-2.5 py-1 rounded-pill
                    ${t.digital ? 'bg-white/10 text-white/90' : 'bg-bg text-text'}`}>
                    {tag}
                  </span>
                ))}
              </div>

              {/* Features */}
              <div className="flex flex-col gap-3 mt-1">
                {t.features.map((f, i) => (
                  <div key={i} className="flex items-start gap-3 font-cairo text-[14.5px] leading-[1.5]">
                    <span className={`w-[22px] h-[22px] rounded-full flex-none flex items-center justify-center mt-0.5
                      ${t.digital ? 'bg-success/20 text-[#5BD89B]' : 'bg-success-100 text-success'}`}>
                      <Icon name="check" size={12} strokeWidth={3} />
                    </span>
                    <span className={t.digital ? 'text-white/90' : ''}>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
