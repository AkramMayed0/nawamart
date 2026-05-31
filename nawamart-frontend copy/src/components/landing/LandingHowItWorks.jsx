import Icon from '@/components/ui/Icon'

const FLOWS = [
  {
    icon: 'truck', iconBg: 'bg-primary-100 text-primary', type: 'physical',
    title: 'تدفق المنتجات المادية', sub: 'للملابس، الأغذية، الإكسسوارات',
    steps: [
      { title: 'العميل يتسوق ويضيف للسلة', body: 'يتصفح المنتجات في متجرك، ويضيف ما يريد، ثم يُدخل عنوان التوصيل في المحافظة المناسبة.' },
      { title: 'يدفع ويرفع الوصل',         body: 'يحوّل المبلغ عبر Cherry / Kuraimi / OneCash، ثم يرفع صورة وصل الدفع لتأكيد العملية.' },
      { title: 'تأكّد، اشحن، تابع',         body: 'تأكّد من الوصل، أرسل الطلب، وحدّث حالته. العميل يتابع كل خطوة حتى التسليم.' },
    ],
  },
  {
    icon: 'bolt', iconBg: 'bg-accent-100 text-accent-700', type: 'digital',
    title: 'تدفق المنتجات الرقمية', sub: 'للاشتراكات، الحسابات، أكواد التفعيل',
    steps: [
      { title: 'العميل يختار ويدفع',  body: 'يتصفح المنتجات الرقمية ويُتم الطلب — بلا عنوان شحن، فقط بياناته الأساسية ووصل الدفع.' },
      { title: 'تأكّد من الوصل',      body: 'تراجع الوصل من لوحة التحكم، وبضغطة واحدة تفتح قناة محادثة خاصة بين متجرك والعميل.' },
      { title: 'سلّم المنتج عبر الشات', body: 'أرسل الرابط، الحساب، الكود، أو الملف مباشرة. العميل يؤكد الاستلام وتُغلق الجلسة.' },
    ],
  },
]

export default function LandingHowItWorks() {
  return (
    <section id="physical" className="px-8 pb-20">
      <div className="max-w-[1240px] mx-auto">

        {/* Section head */}
        <div className="text-center max-w-[720px] mx-auto mb-10">
          <span className="font-inter text-xs font-bold tracking-[0.18em] text-accent uppercase mb-3 block">
            How it works
          </span>
          <h2 className="font-cairo font-extrabold text-[44px] leading-[1.15] text-text mb-3.5">
            كيف يعمل المتجر؟
          </h2>
          <p className="font-cairo text-[17px] leading-[1.6] text-text-muted">
            ٣ خطوات لكل نوع متجر — متطابقة من ناحية البساطة، مختلفة في طريقة التسليم.
          </p>
        </div>

        {/* Two columns */}
        <div className="grid grid-cols-2 gap-12 mt-10">
          {FLOWS.map(flow => (
            <div key={flow.type} className="bg-white border border-border rounded-[18px] p-8">

              {/* Flow header */}
              <div className="flex items-center gap-3.5 pb-6 border-b border-border mb-6">
                <div className={`w-11 h-11 rounded-[10px] flex items-center justify-center flex-none ${flow.iconBg}`}>
                  <Icon name={flow.icon} size={22} />
                </div>
                <div>
                  <h3 className="font-cairo font-bold text-[20px] text-text">{flow.title}</h3>
                  <small className="font-cairo text-[13px] text-text-muted">{flow.sub}</small>
                </div>
              </div>

              {/* Steps */}
              <div className="flex flex-col">
                {flow.steps.map((step, i) => (
                  <div key={i} className={`flex gap-4 py-4 ${i > 0 ? 'border-t border-dashed border-border' : ''}`}>
                    <span className="w-8 h-8 rounded-full bg-bg border border-border text-primary font-inter font-bold text-sm flex items-center justify-center flex-none">
                      {i + 1}
                    </span>
                    <div>
                      <h4 className="font-cairo font-bold text-[15.5px] text-text mb-1">{step.title}</h4>
                      <p className="font-cairo text-[13.5px] leading-[1.55] text-text-muted">{step.body}</p>
                    </div>
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
