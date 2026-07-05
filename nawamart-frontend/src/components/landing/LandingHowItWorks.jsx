import Icon from '@/components/ui/Icon'
import { ShoppingCart, CreditCard, Rocket, Crosshair, Check, Zap } from 'lucide-react'

const FLOWS = [
  {
    icon: 'truck', iconBg: 'bg-primary text-white', type: 'physical',
    color: 'from-primary/5 to-transparent',
    accentColor: 'border-primary/20',
    stepColor: 'bg-primary text-white',
    title: 'تدفق المنتجات المادية', sub: 'للملابس، الأغذية، الإكسسوارات',
    steps: [
      {
        icon: ShoppingCart,
        title: 'العميل يتسوق ويضيف للسلة',
        body: 'يتصفح المنتجات في متجرك، ويضيف ما يريد، ثم يُدخل عنوان التوصيل في المحافظة المناسبة.'
      },
      {
        icon: CreditCard,
        title: 'يدفع ويرفع الوصل',
        body: 'يحوّل المبلغ عبر Cherry / Kuraimi / OneCash، ثم يرفع صورة وصل الدفع لتأكيد العملية.'
      },
      {
        icon: Rocket,
        title: 'تأكّد، اشحن، تابع',
        body: 'تأكّد من الوصل، أرسل الطلب، وحدّث حالته. العميل يتابع كل خطوة حتى التسليم.'
      },
    ],
  },
  {
    icon: 'bolt', iconBg: 'bg-accent text-white', type: 'digital',
    color: 'from-accent/5 to-transparent',
    accentColor: 'border-accent/20',
    stepColor: 'bg-accent text-white',
    title: 'تدفق المنتجات الرقمية', sub: 'للاشتراكات، الحسابات، أكواد التفعيل',
    steps: [
      {
        icon: Crosshair,
        title: 'العميل يختار ويدفع',
        body: 'يتصفح المنتجات الرقمية ويُتم الطلب — بلا عنوان شحن، فقط بياناته الأساسية ووصل الدفع.'
      },
      {
        icon: Check,
        title: 'تأكّد من الوصل',
        body: 'تراجع الوصل من لوحة التحكم، وبضغطة واحدة تفتح قناة محادثة خاصة بين متجرك والعميل.'
      },
      {
        icon: Zap,
        title: 'سلّم المنتج عبر الشات',
        body: 'أرسل الرابط، الحساب، الكود، أو الملف مباشرة. العميل يؤكد الاستلام وتُغلق الجلسة.'
      },
    ],
  },
]

export default function LandingHowItWorks() {
  return (
    <section id="physical" className="relative py-24 overflow-hidden bg-surface">
      {/* Top border gradient */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-gradient-to-br from-accent/3 via-transparent to-teal/3 blur-[120px]" />
      </div>

      <div className="relative nm-container">
        {/* Section head */}
        <div className="text-center max-w-[680px] mx-auto mb-16">
          <div className="flex justify-center mb-4">
            <span className="nm-kicker-center">كيف يعمل</span>
          </div>
          <h2 className="font-cairo font-extrabold text-[28px] sm:text-[40px] leading-[1.15] text-text mb-4">
            ٣ خطوات لكل نوع متجر
          </h2>
          <p className="font-cairo text-[17px] leading-[1.7] text-text-muted">
            متطابقة من ناحية البساطة، مختلفة في طريقة التسليم.
          </p>
        </div>

        {/* Two flow columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {FLOWS.map((flow) => (
            <div
              key={flow.type}
              className={`relative rounded-3xl border ${flow.accentColor} overflow-hidden bg-gradient-to-br ${flow.color} backdrop-blur-sm`}
            >
              {/* Card inner with white bg */}
              <div className="absolute inset-0 bg-white/60 backdrop-blur-sm" />

              <div className="relative p-8">
                {/* Flow header */}
                <div className="flex items-center gap-4 mb-8">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-none ${flow.iconBg} shadow-lg`}>
                    <Icon name={flow.icon} size={22} />
                  </div>
                  <div>
                    <h3 className="font-cairo font-extrabold text-[20px] text-text">{flow.title}</h3>
                    <small className="font-cairo text-[13px] text-text-muted">{flow.sub}</small>
                  </div>
                </div>

                {/* Steps */}
                <div className="flex flex-col gap-0">
                  {flow.steps.map((step, i) => (
                    <div key={i} className="relative flex gap-5">
                      {/* Left: number + connector line */}
                      <div className="flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-2xl ${flow.stepColor} font-cairo font-extrabold text-sm flex items-center justify-center flex-none shadow-md z-10`}>
                          {i + 1}
                        </div>
                        {i < flow.steps.length - 1 && (
                          <div className="w-px flex-1 my-1 bg-gradient-to-b from-border-strong/60 to-border/30" style={{ minHeight: '32px' }} />
                        )}
                      </div>

                      {/* Right: content */}
                      <div className={`pb-${i < flow.steps.length - 1 ? '6' : '0'} pt-1 flex-1 min-w-0`}
                        style={{ paddingBottom: i < flow.steps.length - 1 ? '24px' : '0' }}>
                        <div className="flex items-center gap-2 mb-1.5">
                          {(() => { const StepIcon = step.icon; return <StepIcon size={20} className="text-text-muted" /> })()}
                          <h4 className="font-cairo font-extrabold text-[15px] text-text">{step.title}</h4>
                        </div>
                        <p className="font-cairo text-[13.5px] leading-[1.65] text-text-muted">{step.body}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
