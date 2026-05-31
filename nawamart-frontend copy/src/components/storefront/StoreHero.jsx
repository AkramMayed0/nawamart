import { ArrowLeft, ShoppingBag, Sparkles } from 'lucide-react'
import heroPhone from '@/assets/hero-phone.png'

export default function StoreHero({ store, productCount, isDigital }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary-800 to-[#0c1a28]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(45,123,224,0.12)_0%,transparent_70%)]" />
      <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-info/5 blur-3xl" />
      <div className="absolute -right-40 bottom-0 h-72 w-72 rounded-full bg-accent/5 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 py-12 md:py-20 lg:py-24">
        <div className="flex flex-col items-center gap-10 lg:flex-row lg:gap-16">
          <div className="w-full shrink-0 lg:w-auto lg:order-1">
            <div className="relative flex items-center justify-center">
              <div className="absolute h-[120%] w-[120%] rounded-full bg-[radial-gradient(ellipse_50%_40%_at_center,rgba(45,123,224,0.2)_0%,transparent_60%)]" />
              <div className="hero-float relative">
                <img
                  src={heroPhone}
                  alt={store?.name || 'تطبيق المتجر'}
                  className="mx-auto w-[310px] md:w-[360px] lg:w-[430px] h-auto drop-shadow-2xl"
                  loading="eager"
                />
              </div>
            </div>
          </div>

          <div className="flex-1 text-center lg:text-right">
            <div className="hero-fade-in inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 font-cairo text-[11px] font-bold text-white/90 md:text-xs">
              <Sparkles size={14} />
              {isDigital ? 'متجر رقمي — تسليم فوري' : 'تسوق منتجات مختارة بعناية'}
            </div>

            <h1 className="hero-fade-in hero-fade-in-delay-1 mt-5 font-cairo text-[clamp(1.75rem,5vw,3.25rem)] font-extrabold leading-tight text-white md:mt-6">
              {store.name}
            </h1>

            <p className="hero-fade-in hero-fade-in-delay-2 mx-auto mt-4 max-w-xl font-cairo text-sm leading-7 text-white/75 md:text-base lg:mx-0">
              {store.description || 'تسوق بسهولة وأمان — اختر منتجاتك، ارفع وصل الدفع، واستلم طلبك بخطوات بسيطة وسريعة.'}
            </p>

            <div className="hero-fade-in hero-fade-in-delay-2 mt-7 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
              <a
                href="#products"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-accent px-7 font-cairo text-sm font-extrabold text-white shadow-lg shadow-accent/30 transition-all hover:bg-accent-700 hover:shadow-accent/40 active:scale-95"
              >
                ابدأ التسوق
                <ArrowLeft size={16} />
              </a>
              <a
                href="#products"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-7 font-cairo text-sm font-extrabold text-white backdrop-blur transition-all hover:bg-white/20 active:scale-95"
              >
                استعرض المنتجات
                <ShoppingBag size={16} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
