import { ArrowLeft, ShoppingBag, Sparkles } from 'lucide-react'
import heroPhone from '@/assets/hero-phone.png'

export default function StoreHero({ store, productCount, isDigital }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#0c1119] via-primary-800 to-primary text-white">
      {/* Dynamic Glow Backgrounds */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(15,118,110,0.15)_0%,transparent_70%)] animate-pulse-glow" />
      <div className="absolute -left-40 top-20 h-[500px] w-[500px] rounded-full bg-accent/20 blur-[100px] opacity-60 mix-blend-screen animate-float" />
      <div className="absolute -right-40 bottom-0 h-[400px] w-[400px] rounded-full bg-info/20 blur-[100px] opacity-50 mix-blend-screen" />
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay"></div>

      <div className="relative mx-auto max-w-7xl px-4 py-16 md:py-24 lg:py-32">
        <div className="flex flex-col items-center gap-12 lg:flex-row lg:gap-20">
          {/* ── Phone ── */}
          <div className="w-full shrink-0 lg:w-auto lg:order-1 animate-fade-in-up">
            <div className="relative flex items-center justify-center">
              <div className="absolute h-[140%] w-[140%] rounded-full bg-[radial-gradient(ellipse_50%_40%_at_center,rgba(45,123,224,0.15)_0%,transparent_60%)]" />
              <div className="animate-float relative">
                <img
                  src={heroPhone}
                  alt={store?.name || 'تطبيق المتجر'}
                  className="mx-auto w-[320px] md:w-[380px] lg:w-[460px] h-auto drop-shadow-2xl filter contrast-[1.05]"
                  loading="eager"
                />
              </div>
            </div>
          </div>

          {/* ── Content ── */}
          <div className="flex-1 text-center lg:text-right">
            <div className="animate-fade-in-up inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md px-4 py-2 font-cairo text-xs font-bold text-white/90 shadow-[0_0_15px_rgba(255,255,255,0.05)]">
              <Sparkles size={14} className="text-accent-300" />
              {isDigital ? 'متجر رقمي — تسليم فوري' : 'تسوق منتجات مختارة بعناية'}
            </div>

            <h1 className="animate-fade-in-up mt-6 font-cairo text-[clamp(2.5rem,6vw,4rem)] font-extrabold leading-[1.1] tracking-tight text-white drop-shadow-lg" style={{ animationDelay: '100ms' }}>
              {store.name}
            </h1>

            <p className="animate-fade-in-up mx-auto mt-6 max-w-xl font-cairo text-base leading-relaxed text-white/70 lg:mx-0" style={{ animationDelay: '200ms' }}>
              {store.description || 'تسوق بسهولة وأمان — اختر منتجاتك، ارفع وصل الدفع، واستلم طلبك بخطوات بسيطة وسريعة.'}
            </p>

            <div className="animate-fade-in-up mt-10 flex flex-wrap items-center justify-center gap-4 lg:justify-start" style={{ animationDelay: '300ms' }}>
              <a
                href="#products"
                className="hover-lift inline-flex h-14 items-center justify-center gap-3 rounded-2xl bg-accent px-8 font-cairo text-base font-extrabold text-white shadow-glow transition-all hover:bg-accent-600 active:scale-95"
              >
                ابدأ التسوق
                <ArrowLeft size={18} />
              </a>
              <a
                href="#products"
                className="hover-lift inline-flex h-14 items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md px-8 font-cairo text-base font-extrabold text-white transition-all hover:bg-white/10 hover:border-white/20 active:scale-95"
              >
                استعرض المنتجات
                <ShoppingBag size={18} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
