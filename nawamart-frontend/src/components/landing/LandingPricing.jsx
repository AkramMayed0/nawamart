import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import {
  Bot, Check, MessageSquareText, ShieldCheck, Truck,
  WalletCards, Zap, Sparkles, Crown, ArrowRight,
  TrendingUp, Lock, Globe, Cpu
} from 'lucide-react'

const PRO_FEATURES = [
  { icon: Zap,             text: 'واجهة متجر محسّنة لشبكات 3G/4G' },
  { icon: WalletCards,     text: 'رفع وتحقق إيصالات المحافظ المحلية' },
  { icon: MessageSquareText, text: 'شات مباشر بين التاجر والزبون' },
  { icon: Globe,           text: 'تسليم رقمي تلقائي للملفات والأكواد' },
]

const BUSINESS_EXTRAS = [
  { icon: ShieldCheck, text: 'Anti-Fraud Return Shield للمتاجر المادية',   badge: 'حماية' },
  { icon: Bot,         text: 'بوت واتساب لعرض المنتجات وإدارة الطلبات',   badge: 'AI' },
  { icon: MessageSquareText, text: 'استرجاع السلات المهجورة عبر واتساب', badge: 'تلقائي' },
  { icon: Truck,       text: 'Local Courier Dispatcher للمتاجر المادية',   badge: 'توصيل' },
  { icon: TrendingUp,  text: 'تقارير مبيعات متقدمة وتحليل الأداء',        badge: 'ذكاء' },
]

const COMPARISON = [
  { feature: 'واجهة متجر متكاملة',       pro: true,  biz: true  },
  { feature: 'دفع عبر المحافظ المحلية',  pro: true,  biz: true  },
  { feature: 'شات مباشر مع العملاء',     pro: true,  biz: true  },
  { feature: 'تسليم رقمي تلقائي',        pro: true,  biz: true  },
  { feature: 'بوت واتساب ذكي',           pro: false, biz: true  },
  { feature: 'حماية المرتجعات (Shield)', pro: false, biz: true  },
  { feature: 'نظام توصيل المناديب',      pro: false, biz: true  },
  { feature: 'تقارير متقدمة',            pro: false, biz: true  },
]

export default function LandingPricing() {
  const navigate = useNavigate()
  const token = useAuthStore((state) => state.token)

  function handleCta(plan) {
    navigate(token ? `/subscribe?plan=${plan}` : `/merchant/login?redirect=/subscribe?plan=${plan}`)
  }

  return (
    <section id="pricing" className="relative py-28 overflow-hidden">
      {/* Layered background */}
      <div className="absolute inset-0 bg-gradient-to-b from-bg via-white to-bg pointer-events-none" />
      <div className="absolute inset-0 hero-grid-pattern opacity-30 pointer-events-none" />
      {/* Glow orbs */}
      <div className="absolute top-32 left-1/4 w-96 h-96 rounded-full blur-[120px] pointer-events-none" style={{ background: 'rgba(201,63,43,0.08)' }} />
      <div className="absolute bottom-24 right-1/4 w-80 h-80 rounded-full blur-[100px] pointer-events-none" style={{ background: 'rgba(24,33,47,0.12)' }} />

      <div className="relative nm-container">
        {/* Section heading */}
        <div className="text-center max-w-[700px] mx-auto mb-16">
          <div className="flex justify-center mb-4">
            <span className="nm-kicker-center"><Sparkles size={11} />الباقات</span>
          </div>
          <h2 className="font-cairo font-extrabold text-[42px] leading-[1.15] text-text mb-4">
            ابدأ بـ Pro،{' '}
            <span className="shimmer-text">ارتقِ إلى Business</span>
          </h2>
          <p className="font-cairo text-[17px] leading-[1.75] text-text-muted">
            كلا الباقتين تغطيان متجرك بالكامل. Business يضيف الأتمتة الذكية، الحماية من المرتجعات، وإدارة التوصيل.
          </p>
        </div>

        {/* Cards */}
        <div className="grid gap-6 lg:grid-cols-2 max-w-5xl mx-auto mb-16">

          {/* ── PRO Card ── */}
          <article className="relative flex flex-col rounded-3xl overflow-hidden border border-border bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-border-strong">
            <div className="p-8">
              {/* Plan name + icon */}
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-50">
                  <Zap size={18} className="text-primary" />
                </div>
                <h3 className="font-cairo text-2xl font-extrabold text-text">Pro</h3>
              </div>

              <p className="font-cairo text-sm leading-[1.75] text-text-muted mb-6">
                للمتاجر التي تريد بيعاً منظماً، دفعاً محلياً، وشاتاً مباشراً مع العملاء.
              </p>

              {/* Price */}
              <div className="flex items-end gap-2 mb-1">
                <span className="font-cairo text-[54px] font-extrabold leading-none text-text dk-num">8,000</span>
                <span className="pb-3 font-cairo text-sm font-bold text-text-muted">ر.ي / شهر</span>
              </div>
              <p className="font-cairo text-xs text-text-subtle mb-6">لا حاجة لبطاقة ائتمان · إلغاء في أي وقت</p>

              <div className="border-t border-border mb-6" />

              {/* Features */}
              <div className="space-y-3 mb-8">
                {PRO_FEATURES.map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-primary-50">
                      <Icon size={14} className="text-primary" />
                    </div>
                    <p className="font-cairo text-sm font-semibold leading-[1.6] text-text-muted">{text}</p>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleCta('pro')}
                className="w-full rounded-2xl py-4 font-cairo font-extrabold text-base bg-primary text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/20 active:scale-[0.98]"
              >
                اشترك في Pro
              </button>
            </div>
          </article>

          {/* ── BUSINESS Card — Premium ── */}
          <article
            className="relative flex flex-col rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
            style={{ background: 'linear-gradient(160deg, #1a2537 0%, #0f1825 60%, #1a1020 100%)' }}
          >
            {/* Ambient glow blobs */}
            <div className="absolute top-0 right-0 w-72 h-72 rounded-full blur-[90px] pointer-events-none" style={{ background: 'rgba(201,63,43,0.18)' }} />
            <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full blur-[70px] pointer-events-none" style={{ background: 'rgba(103,80,164,0.2)' }} />

            <div className="relative p-8 flex-1 flex flex-col">
              {/* Badge */}
              <div className="flex justify-start mb-4">
                <span className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 font-cairo text-xs font-extrabold text-white shadow-lg" style={{ background: 'rgba(201,63,43,0.9)', boxShadow: '0 0 20px rgba(201,63,43,0.4)' }}>
                  <Crown size={11} />
                  الأقوى والأكثر مبيعاً
                </span>
              </div>

              {/* Plan name */}
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl" style={{ background: 'rgba(201,63,43,0.2)' }}>
                  <Cpu size={18} style={{ color: '#e87961' }} />
                </div>
                <h3 className="font-cairo text-2xl font-extrabold text-white">Business</h3>
              </div>

              <p className="font-cairo text-sm leading-[1.75] mb-6" style={{ color: 'rgba(255,255,255,0.55)' }}>
                للمتاجر التي تحتاج أتمتة واتساب، حماية مرتجعات ذكية، وإدارة مناديب توصيل.
              </p>

              {/* Price */}
              <div className="flex items-end gap-2 mb-1">
                <span className="font-cairo text-[54px] font-extrabold leading-none text-white dk-num">13,000</span>
                <span className="pb-3 font-cairo text-sm font-bold" style={{ color: 'rgba(255,255,255,0.4)' }}>ر.ي / شهر</span>
              </div>
              <p className="font-cairo text-xs mb-6" style={{ color: 'rgba(255,255,255,0.3)' }}>يشمل كل ميزات Pro + 5 ميزات حصرية</p>

              <div className="mb-6" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }} />

              {/* Pro included */}
              <div className="flex items-center gap-2 rounded-xl px-3 py-2.5 mb-4" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <Check size={14} style={{ color: '#4dd68a' }} />
                <span className="font-cairo text-sm font-bold" style={{ color: 'rgba(255,255,255,0.7)' }}>يشمل كل ميزات Pro</span>
              </div>

              {/* Business-exclusive extras */}
              <div className="space-y-3 flex-1 mb-8">
                {BUSINESS_EXTRAS.map(({ icon: Icon, text, badge }) => (
                  <div key={text} className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl" style={{ background: 'rgba(201,63,43,0.2)' }}>
                      <Icon size={14} style={{ color: '#e87961' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-cairo text-sm font-semibold leading-[1.6]" style={{ color: 'rgba(255,255,255,0.75)' }}>{text}</p>
                    </div>
                    <span className="shrink-0 rounded-full px-2 py-0.5 font-cairo text-[10px] font-extrabold" style={{ background: 'rgba(201,63,43,0.25)', color: '#e87961' }}>
                      {badge}
                    </span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleCta('business')}
                className="relative w-full rounded-2xl py-4 font-cairo font-extrabold text-base text-white transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] overflow-hidden group"
                style={{ background: 'linear-gradient(135deg, #C93F2B 0%, #a62f20 100%)', boxShadow: '0 8px 32px rgba(201,63,43,0.35)' }}
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  اشترك في Business
                  <ArrowRight size={16} className="group-hover:translate-x-[-4px] transition-transform" />
                </span>
                {/* Shimmer */}
                <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              </button>
            </div>
          </article>
        </div>

        {/* Feature comparison table */}
        <div className="max-w-3xl mx-auto">
          <h3 className="font-cairo text-center text-xl font-extrabold text-text mb-6">مقارنة الميزات</h3>
          <div className="rounded-3xl overflow-hidden border border-border bg-white shadow-sm">
            {/* Header */}
            <div className="grid grid-cols-[1fr_auto_auto] gap-6 px-6 py-4 font-cairo text-sm font-extrabold" style={{ borderBottom: '1px solid var(--color-border)' }}>
              <span className="text-text-muted">الميزة</span>
              <span className="w-20 text-center text-text">Pro</span>
              <span className="w-20 text-center text-accent-700">Business</span>
            </div>
            {COMPARISON.map(({ feature, pro, biz }, i) => (
              <div
                key={feature}
                className="grid grid-cols-[1fr_auto_auto] gap-6 px-6 py-3.5 items-center font-cairo text-sm"
                style={{ borderBottom: i < COMPARISON.length - 1 ? '1px solid var(--color-border)' : 'none', background: i % 2 === 1 ? 'rgba(0,0,0,0.015)' : 'transparent' }}
              >
                <span className="font-semibold text-text">{feature}</span>
                <div className="w-20 flex justify-center">
                  {pro
                    ? <span className="flex h-6 w-6 items-center justify-center rounded-full bg-success-100"><Check size={13} className="text-success-dark" /></span>
                    : <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100"><Lock size={11} className="text-gray-400" /></span>
                  }
                </div>
                <div className="w-20 flex justify-center">
                  {biz
                    ? <span className="flex h-6 w-6 items-center justify-center rounded-full" style={{ background: 'rgba(201,63,43,0.12)' }}><Check size={13} style={{ color: '#C93F2B' }} /></span>
                    : <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100"><Lock size={11} className="text-gray-400" /></span>
                  }
                </div>
              </div>
            ))}
          </div>

          <p className="text-center mt-6 font-cairo text-sm text-text-subtle">
            لا حاجة لبطاقة ائتمانية · إلغاء في أي وقت · الدفع عبر المحافظ المحلية اليمنية
          </p>
        </div>
      </div>
    </section>
  )
}
