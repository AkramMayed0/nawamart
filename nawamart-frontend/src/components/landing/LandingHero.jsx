import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Bot, CheckCircle2, MessageSquareText, ShieldCheck, Truck, WalletCards, Zap, Sparkles, TrendingUp } from 'lucide-react'
import Button from '@/components/ui/Button'
import heroPhone from '@/assets/hero-phone.png'

const CAPABILITIES = [
  { icon: WalletCards, label: 'إيصالات المحافظ', tone: 'bg-amber-100 text-amber-700', glow: 'icon-glow-amber' },
  { icon: MessageSquareText, label: 'شات مباشر', tone: 'bg-teal-100 text-teal-700', glow: 'icon-glow-teal' },
  { icon: Zap, label: 'تسليم رقمي فوري', tone: 'bg-violet-100 text-violet-700', glow: 'icon-glow-violet' },
  { icon: Truck, label: 'مندوب محلي', tone: 'bg-primary-100 text-primary-700', glow: '' },
]

const STATS = [
  { value: '+500', label: 'تاجر نشط' },
  { value: '3G', label: 'محسّن لشبكات' },
  { value: '15', label: 'دقيقة للإعداد' },
]

function FloatingCard({ className, children, delay = 0 }) {
  return (
    <div
      className={`nm-card absolute rounded-2xl ${className}`}
      style={{ animationDelay: `${delay}s` }}
    >
      {children}
    </div>
  )
}

function CommercePreview() {
  return (
    <div className="relative min-h-[480px] md:min-h-[580px] flex items-center justify-center">
      {/* Glow blob behind phone */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[360px] h-[360px] rounded-full bg-accent/8 blur-[80px] animate-pulse" style={{ animationDuration: '4s' }} />
      </div>

      {/* Main phone image */}
      <img
        src={heroPhone}
        alt="واجهة متجر نوا مارت على الهاتف"
        className="hero-media-shadow hero-float relative z-10 w-[240px] md:w-[300px] lg:w-[340px]"
        loading="eager"
      />

      {/* Safe payment card */}
      <FloatingCard className="right-0 top-16 hidden w-[250px] p-4 md:block pop-in" delay={0.3}>
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100 text-teal-700 icon-glow-teal">
            <ShieldCheck size={18} />
          </div>
          <div>
            <p className="font-cairo text-sm font-extrabold text-text">طلب آمن ✓</p>
            <p className="font-cairo text-xs text-text-muted">تم قبول وصل الدفع</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {['وصل', 'دفع', 'تأكيد'].map((item, i) => (
            <div key={item} className={`rounded-lg px-2 py-2 text-center font-cairo text-[11px] font-bold ${i === 1 ? 'bg-teal-100 text-teal-700' : 'bg-bg text-text-muted'}`}>
              {item}
            </div>
          ))}
        </div>
      </FloatingCard>

      {/* Store status card */}
      <FloatingCard className="bottom-14 left-0 hidden w-[270px] p-4 lg:block pop-in" delay={0.5}>
        <div className="mb-3 flex items-center justify-between">
          <p className="font-cairo text-sm font-extrabold text-text">تشغيل المتجر</p>
          <span className="flex items-center gap-1.5 rounded-full bg-success-100 px-2.5 py-1 font-cairo text-[11px] font-extrabold text-success-dark">
            <span className="w-1.5 h-1.5 rounded-full bg-success-dark animate-pulse" />
            جاهز
          </span>
        </div>
        <div className="space-y-2.5">
          {[
            { label: 'منتجات', pct: 76, color: 'bg-teal-700' },
            { label: 'طلبات', pct: 62, color: 'bg-accent' },
            { label: 'واتساب', pct: 48, color: 'bg-amber-700' },
          ].map(({ label, pct, color }) => (
            <div key={label} className="flex items-center gap-2">
              <CheckCircle2 size={13} className="text-teal-700 shrink-0" />
              <span className="font-cairo text-xs font-bold text-text-muted w-12 shrink-0">{label}</span>
              <div className="h-1.5 flex-1 rounded-full bg-bg-soft overflow-hidden">
                <div className={`h-full rounded-full ${color} transition-all duration-1000`} style={{ width: `${pct}%` }} />
              </div>
              <span className="font-cairo text-[10px] font-bold text-text-subtle dk-num">{pct}%</span>
            </div>
          ))}
        </div>
      </FloatingCard>

      {/* WhatsApp bot card */}
      <FloatingCard className="bottom-0 right-4 w-[200px] p-3 md:right-10 pop-in" delay={0.7}>
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-50 text-accent-700 icon-glow-accent shrink-0">
            <Bot size={16} />
          </div>
          <div>
            <p className="font-cairo text-xs font-extrabold text-text">بوت واتساب</p>
            <p className="font-cairo text-[11px] text-text-muted leading-tight">يسترجع السلات بهدوء</p>
          </div>
        </div>
        <div className="mt-2.5 flex items-center gap-1.5">
          <TrendingUp size={11} className="text-success" />
          <span className="font-cairo text-[10px] font-bold text-success">+38% استرجاع</span>
        </div>
      </FloatingCard>

      {/* Sparkle decorations */}
      <div className="absolute top-8 left-8 text-accent/30 hero-float" style={{ animationDelay: '1s', animationDuration: '6s' }}>
        <Sparkles size={18} />
      </div>
      <div className="absolute top-1/3 right-4 text-teal-700/20 hero-float" style={{ animationDelay: '2.5s', animationDuration: '8s' }}>
        <Sparkles size={14} />
      </div>
    </div>
  )
}

export default function LandingHero() {
  const navigate = useNavigate()

  return (
    <section className="relative overflow-hidden border-b border-border">
      {/* Aurora background blobs */}
      <div className="aurora-blob aurora-blob-1" />
      <div className="aurora-blob aurora-blob-2" />
      <div className="aurora-blob aurora-blob-3" />

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 hero-grid-pattern opacity-60 pointer-events-none" />

      {/* Content */}
      <div className="relative nm-container grid min-h-[calc(100vh-72px)] items-center gap-10 py-12 lg:grid-cols-[1fr_1fr] lg:py-16">
        {/* Left: Copy */}
        <div className="max-w-2xl">
          {/* Kicker badge */}
          <div className="hero-fade-in mb-6">
            <span className="nm-kicker-center">
              <Zap size={11} />
              تجارة يمنية أسرع وأوضح
            </span>
          </div>

          {/* Headline */}
          <h1 className="hero-fade-in hero-fade-in-delay-1 font-cairo leading-[1.05]">
            <span className="block text-[52px] font-extrabold text-text sm:text-[64px] lg:text-[72px] tracking-tight">
              Nawa<span className="shimmer-text">Mart</span>
            </span>
            <span className="mt-2 block text-[28px] font-extrabold leading-[1.25] text-text-muted sm:text-[36px] lg:text-[42px]">
              متجر خفيف للدفع المحلي،{' '}
              <span className="relative inline-block text-text">
                الشات
                <svg className="absolute -bottom-1 left-0 right-0 w-full" height="6" viewBox="0 0 100 6" preserveAspectRatio="none">
                  <path d="M0 5 Q50 0 100 5" stroke="url(#acc)" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                  <defs><linearGradient id="acc" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#C93F2B"/><stop offset="100%" stopColor="#E87961"/></linearGradient></defs>
                </svg>
              </span>
              {', '}والتسليم.
            </span>
          </h1>

          {/* Description */}
          <p className="hero-fade-in hero-fade-in-delay-2 mt-6 max-w-xl font-cairo text-base leading-8 text-text-muted sm:text-lg">
            واجهة متجر محسّنة لشبكات اليمن، إدارة طلبات واضحة، رفع إيصالات المحافظ، وتسليم رقمي أو مادي بدون تعقيد.
          </p>

          {/* CTA Buttons */}
          <div className="hero-fade-in hero-fade-in-delay-3 mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => navigate('/merchant/register')}
              className="group relative inline-flex items-center justify-center gap-2.5 overflow-hidden rounded-xl bg-accent px-8 py-4 font-cairo text-base font-extrabold text-white shadow-lg shadow-accent/30 transition-all duration-200 hover:shadow-accent/50 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]"
            >
              <span className="relative z-10">ابدأ متجرك</span>
              <ArrowLeft size={18} className="relative z-10 transition-transform group-hover:-translate-x-1" />
              <div className="absolute inset-0 bg-gradient-to-l from-accent-700 to-accent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            </button>
            <button
              onClick={() => navigate('/merchant/login')}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-white/80 px-8 py-4 font-cairo text-base font-extrabold text-text backdrop-blur-sm transition-all duration-200 hover:bg-white hover:border-border-strong hover:shadow-md hover:-translate-y-0.5"
            >
              دخول التجار
            </button>
          </div>

          {/* Stats row */}
          <div className="hero-fade-in hero-fade-in-delay-4 mt-8 flex items-center gap-6 border-t border-border pt-6">
            {STATS.map(({ value, label }, i) => (
              <div key={label} className={`${i > 0 ? 'border-r border-border pr-6' : ''}`}>
                <p className="font-cairo text-2xl font-extrabold text-text dk-num">{value}</p>
                <p className="font-cairo text-xs text-text-muted mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* Feature chips */}
          <div className="hero-fade-in hero-fade-in-delay-5 mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {CAPABILITIES.map(({ icon: Icon, label, tone, glow }) => (
              <div
                key={label}
                className={`nm-pressable flex flex-col gap-2 rounded-xl border border-border bg-white/70 p-3 backdrop-blur-sm hover:bg-white hover:border-border-strong hover:shadow-sm`}
              >
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${tone} ${glow}`}>
                  <Icon size={15} />
                </div>
                <p className="font-cairo text-xs font-extrabold text-text leading-tight">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Visual preview */}
        <CommercePreview />
      </div>
    </section>
  )
}
