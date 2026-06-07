import Icon from '@/components/ui/Icon'
import { Zap, Truck } from 'lucide-react'

const TYPES = [
  {
    key: 'physical',
    icon: 'truck',
    badgeIcon: 'truck',
    badge: 'توصيل',
    title: 'منتجات مادية',
    sub: 'ملابس، أغذية، إكسسوارات، ومنتجات تُشحن للعميل. عنوان توصيل، تأكيد وصل الدفع، ثم شحن وتتبع.',
    tags: ['ملابس', 'أغذية', 'إكسسوارات', 'منتجات يدوية'],
    features: [
      'صفحة سلة + إدخال عنوان توصيل',
      'رفع صورة الوصل وتأكيد التاجر',
      'تتبع حالة الطلب · بانتظار ← مؤكد ← شُحن ← تم التسليم',
    ],
    dark: false,
  },
  {
    key: 'digital',
    icon: 'bolt',
    badgeIcon: 'bolt',
    badge: 'تسليم فوري',
    title: 'منتجات رقمية',
    sub: 'اشتراكات، أكواد ألعاب، حسابات، تطبيقات. لا عنوان توصيل — بل قناة محادثة خاصة تفتح فور تأكيد الدفع.',
    tags: ['اشتراكات', 'أكواد ألعاب', 'حسابات', 'برامج'],
    features: [
      'سلة دون عنوان شحن · رفع الوصل فقط',
      'محادثة خاصة تفتح بعد تأكيد الدفع',
      'إرسال المنتج: رابط، كود، حساب، ملف',
    ],
    dark: true,
  },
]

export default function LandingStoreTypes() {
  return (
    <section id="platform" className="relative py-24 overflow-hidden">
      {/* Subtle background */}
      <div className="absolute inset-0 bg-gradient-to-b from-bg to-white pointer-events-none" />

      <div className="relative nm-container">
        {/* Section head */}
        <div className="text-center max-w-[680px] mx-auto mb-14">
          <div className="flex justify-center mb-4">
            <span className="nm-kicker-center">
              نوعان في منصة واحدة
            </span>
          </div>
          <h2 className="font-cairo font-extrabold text-[40px] leading-[1.15] text-text mb-4">
            متجر يناسب{' '}
            <span className="relative inline-block">
              <span className="shimmer-text">ما تبيعه</span>
            </span>
          </h2>
          <p className="font-cairo text-[17px] leading-[1.7] text-text-muted">
            سواء كنت تبيع منتجات مادية تُشحن للعميل، أو منتجات رقمية تُسلَّم فوراً عبر المحادثة — اختر نوع متجرك وستحصل على التدفق المناسب تماماً.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {TYPES.map((t, cardIdx) => (
            <div
              key={t.key}
              id={t.key === 'digital' ? 'digital' : undefined}
              className={`group relative rounded-3xl p-8 flex flex-col gap-5 overflow-hidden border transition-all duration-300 hover:-translate-y-1 ${
                t.dark
                  ? 'nm-dark-card text-white'
                  : 'bg-white border-border hover:border-border-strong hover:shadow-lg'
              }`}
            >
              {/* Decorative blobs inside dark card */}
              {t.dark && (
                <>
                  <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-accent/10 blur-[60px] pointer-events-none" />
                  <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-violet/10 blur-[50px] pointer-events-none" />
                </>
              )}

              {/* Icon + badge row */}
              <div className="relative flex items-center justify-between">
                <div className={`w-[60px] h-[60px] rounded-2xl flex items-center justify-center flex-none transition-transform duration-300 group-hover:scale-110 ${
                  t.dark ? 'bg-accent/20 text-accent' : 'bg-gradient-to-br from-primary-50 to-primary-100 text-primary'
                }`}>
                  <Icon name={t.icon} size={26} />
                </div>
                <span className={`inline-flex items-center gap-1.5 font-cairo text-xs font-bold px-3.5 py-1.5 rounded-pill ${
                  t.dark ? 'bg-accent/15 text-accent border border-accent/20' : 'bg-primary-50 text-primary border border-primary-100'
                }`}>
                  <Icon name={t.badgeIcon} size={11} />
                  {t.badge}
                </span>
              </div>

              {/* Title */}
              <h3 className={`relative font-cairo font-extrabold text-[32px] leading-[1.15] ${
                t.dark ? 'text-white' : 'text-text'
              }`}>
                {t.title}
              </h3>

              {/* Sub */}
              <p className={`relative font-cairo text-[15px] leading-[1.7] ${
                t.dark ? 'text-white/65' : 'text-text-muted'
              }`}>
                {t.sub}
              </p>

              {/* Tags */}
              <div className="relative flex gap-2 flex-wrap">
                {t.tags.map((tag) => (
                  <span key={tag} className={`font-cairo text-xs font-semibold px-3 py-1.5 rounded-pill ${
                    t.dark ? 'bg-white/10 text-white/80 border border-white/10' : 'bg-bg text-text border border-border'
                  }`}>
                    {tag}
                  </span>
                ))}
              </div>

              {/* Divider */}
              <div className={`border-t ${t.dark ? 'border-white/10' : 'border-border'}`} />

              {/* Features */}
              <div className="relative flex flex-col gap-3">
                {t.features.map((f, i) => (
                  <div key={i} className="flex items-start gap-3 font-cairo text-[14px] leading-[1.6]">
                    <span className={`w-[22px] h-[22px] rounded-full flex-none flex items-center justify-center mt-0.5 shrink-0 ${
                      t.dark ? 'bg-accent/20 text-accent' : 'bg-success-100 text-success'
                    }`}>
                      <Icon name="check" size={11} strokeWidth={3} />
                    </span>
                    <span className={t.dark ? 'text-white/85' : 'text-text-muted'}>{f}</span>
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
