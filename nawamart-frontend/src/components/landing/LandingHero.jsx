import { useNavigate } from 'react-router-dom'
import Icon from '@/components/ui/Icon'
import Button from '@/components/ui/Button'

function HeroMockCards() {
  return (
    <div className="relative h-[480px]">
      {/* Storefront preview card */}
      <div className="absolute top-[30px] start-0 w-[360px] bg-white border border-border rounded-[18px] shadow-lg overflow-hidden">
        <div className="flex items-center gap-2 px-3.5 py-3 border-b border-border bg-white">
          <span className="w-2 h-2 rounded-full bg-bg-soft" />
          <span className="w-2 h-2 rounded-full bg-bg-soft" />
          <span className="w-2 h-2 rounded-full bg-bg-soft" />
          <span className="ms-auto font-inter text-[11px] text-text-subtle">almukhtar.nawa.shop</span>
        </div>
        <div className="p-4">
          <div className="mb-3">
            <strong className="font-cairo font-bold text-base text-text block mb-0.5">متجر المختار</strong>
            <span className="font-cairo text-[13px] text-text-subtle">منتجات يمنية · توصيل لكل المحافظات</span>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-square rounded-lg bg-gradient-to-br from-[#EAEDF1] to-[#DFE3EA] relative">
                <span className="absolute top-1.5 start-1.5 w-4 h-4 bg-primary rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Order tracking card */}
      <div className="absolute bottom-5 end-0 w-[290px] bg-white border border-border rounded-[18px] shadow-lg overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-border">
          <strong className="font-cairo font-bold text-sm">تتبع الطلب</strong>
          <span className="font-inter text-[11px] text-primary font-bold">NM-2840-19</span>
        </div>
        <div className="px-4 py-3.5 flex flex-col gap-2.5">
          {[
            { label: 'تم استلام الوصل', state: 'done' },
            { label: 'تأكيد الدفع',     state: 'done' },
            { label: 'قيد الشحن',       state: 'active' },
            { label: 'تم التسليم',      state: 'todo' },
          ].map((step, i) => (
            <div key={i} className="flex items-center gap-2.5 font-cairo text-[13px]">
              <span className={`w-5 h-5 rounded-full flex-none flex items-center justify-center text-white text-[10px] font-bold font-inter
                ${step.state === 'done'   ? 'bg-success' :
                  step.state === 'active' ? 'bg-warning' :
                  'bg-bg-soft text-text-subtle'}`}>
                {step.state === 'done' ? <Icon name="check" size={11} strokeWidth={3} /> : i + 1}
              </span>
              <span className={step.state === 'todo' ? 'text-text-subtle' : 'text-text'}>{step.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Accent stripe */}
      <div className="absolute end-[-20px] top-1/2 w-[90px] h-2 bg-accent rounded-full" />
    </div>
  )
}

function HeroStats() {
  const stats = [
    { num: '1,200+', label: 'تاجر يستخدم المنصة' },
    { num: '٤٫٨',   label: 'تقييم التجار' },
    { num: '15د',   label: 'متوسط فتح المتجر' },
  ]
  return (
    <div className="flex gap-10 pt-7 border-t border-border">
      {stats.map(s => (
        <div key={s.num} className="flex flex-col gap-0.5">
          <span className="font-inter font-extrabold text-[26px] text-primary dk-num">{s.num}</span>
          <small className="font-cairo text-[12.5px] text-text-muted">{s.label}</small>
        </div>
      ))}
    </div>
  )
}

export default function LandingHero() {
  const navigate = useNavigate()
  return (
    <section className="relative px-8 pt-[72px] pb-20 overflow-hidden lp-hero-gradient">
      <div className="max-w-[1240px] mx-auto grid grid-cols-[1.05fr_1fr] gap-12 items-center">

        {/* ── Left: Copy ── */}
        <div>
          {/* Eyebrow pill */}
          <span className="inline-flex items-center gap-2 bg-primary-50 text-primary font-cairo text-[13px] font-semibold px-3.5 py-1.5 rounded-pill mb-[18px]">
            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
            منصة يمنية · للتجار اليمنيين
          </span>

          {/* Headline */}
          <h1 className="font-cairo font-extrabold text-[64px] leading-[1.1] tracking-[-0.015em] text-text mb-5">
            أنشئ متجرك<br />
            في <span className="text-accent">دقائق</span>،<br />
            بِع لأي مكان.
          </h1>

          {/* Sub */}
          <p className="font-cairo text-lg leading-[1.65] text-text-muted max-w-[520px] mb-8">
            منصة متكاملة لإنشاء متجرك الإلكتروني — منتجات مادية أو رقمية — مع نظام دفع محلي، تأكيد الوصل، وقناة محادثة مباشرة بين التاجر والعميل.
          </p>

          {/* CTA buttons */}
          <div className="flex items-center gap-3 mb-9">
            <Button variant="accent" size="lg" onClick={() => navigate('/merchant/register')}>
              ابدأ مجاناً
              <Icon name="arrow-left" size={18} />
            </Button>
            <Button variant="secondary" size="lg" onClick={() => navigate('/store/demo')}>
              <Icon name="eye" size={16} />
              شاهد متجراً تجريبياً
            </Button>
          </div>

          <HeroStats />
        </div>

        {/* ── Right: Mock UI ── */}
        <HeroMockCards />
      </div>
    </section>
  )
}
