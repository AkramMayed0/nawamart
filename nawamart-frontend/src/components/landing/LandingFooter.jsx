import { useNavigate } from 'react-router-dom'
import Icon from '@/components/ui/Icon'
import { ArrowLeft, Sparkles, Phone } from 'lucide-react'

export function LandingFinalCta() {
  const navigate = useNavigate()
  return (
    <section id="contact" className="relative py-24 overflow-hidden">
      {/* Dark mesh background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-primary-800 to-[#0d1520]" />

      {/* Aurora effects */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-accent/15 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-teal/10 blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-violet/8 blur-[150px] pointer-events-none" />

      {/* Grid overlay */}
      <div className="absolute inset-0 hero-grid-pattern opacity-[0.06] pointer-events-none" />

      <div className="relative nm-container">
        <div className="max-w-[700px] mx-auto text-center">
          {/* Badge */}
          <div className="flex justify-center mb-7">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-4 py-2 font-cairo text-xs font-bold text-white/80 backdrop-blur-sm">
              <Sparkles size={12} className="text-accent" />
              ابدأ مجاناً · لا بطاقة ائتمانية
            </span>
          </div>

          {/* Headline */}
          <h2 className="font-cairo font-extrabold text-[48px] leading-[1.1] text-white mb-5">
            متجرك جاهز
            <br />
            على بُعد{' '}
            <span className="shimmer-text">١٥ دقيقة</span>
          </h2>

          {/* Description */}
          <p className="font-cairo text-[17px] leading-[1.7] text-white/60 mb-10 max-w-xl mx-auto">
            سجّل حساباً، اختر نوع متجرك، وأضف أول منتج اليوم. يمني ١٠٠٪، محسّن للشبكة والواقع المحلي.
          </p>

          {/* CTA Buttons */}
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <button
              onClick={() => navigate('/merchant/register')}
              className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-2xl bg-accent px-8 py-4 font-cairo font-extrabold text-base text-white shadow-xl shadow-accent/30 transition-all duration-200 hover:shadow-accent/50 hover:shadow-2xl hover:-translate-y-0.5"
            >
              <Sparkles size={16} className="relative z-10 opacity-80" />
              <span className="relative z-10">ابدأ مجاناً</span>
              <ArrowLeft size={18} className="relative z-10 transition-transform group-hover:-translate-x-1" />
              <div className="absolute inset-0 bg-gradient-to-l from-accent-700 to-accent-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            </button>

            <button className="inline-flex items-center gap-2.5 rounded-2xl border border-white/20 bg-white/8 px-8 py-4 font-cairo font-semibold text-base text-white backdrop-blur-sm transition-all duration-200 hover:bg-white/15 hover:border-white/30 hover:-translate-y-0.5">
              <Phone size={16} className="opacity-70" />
              تكلم مع فريقنا
            </button>
          </div>

          {/* Trust indicators */}
          <div className="mt-12 flex items-center justify-center gap-8 opacity-50">
            <div className="flex items-center gap-2">
              <Icon name="shield-check" size={14} className="text-white" />
              <span className="font-cairo text-xs text-white">آمن ومضمون</span>
            </div>
            <div className="w-px h-4 bg-white/30" />
            <div className="flex items-center gap-2">
              <Icon name="zap" size={14} className="text-white" />
              <span className="font-cairo text-xs text-white">إعداد فوري</span>
            </div>
            <div className="w-px h-4 bg-white/30" />
            <div className="flex items-center gap-2">
              <Icon name="check" size={14} className="text-white" />
              <span className="font-cairo text-xs text-white">بدون عقد</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function LandingFooter() {
  const links = ['الخصوصية', 'الشروط', 'المساعدة', 'nawadev.ye']
  return (
    <footer className="bg-[#0d1520] border-t border-white/[0.06] px-8 py-8">
      <div className="max-w-[1240px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-5">
        <div className="flex items-center gap-3">
          <img src="/logo.svg" alt="NawaMart" className="h-6 opacity-40" />
          <span className="font-cairo text-[13px] text-white/35">© 2026 NawaMart · صُنع في اليمن بفخر 🇾🇪</span>
        </div>
        <div className="flex gap-6">
          {links.map((l) => (
            <a key={l} href="#" className="font-cairo text-[12px] text-white/35 hover:text-white/70 transition-colors">
              {l}
            </a>
          ))}
        </div>
      </div>
    </footer>
  )
}
