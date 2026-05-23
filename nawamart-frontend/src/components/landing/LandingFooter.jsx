import { useNavigate } from 'react-router-dom'
import Icon from '@/components/ui/Icon'
import Button from '@/components/ui/Button'

export function LandingFinalCta() {
  const navigate = useNavigate()
  return (
    <section className="px-8 py-20 bg-primary-800 text-white text-center">
      <div className="max-w-[720px] mx-auto">
        <div className="h-1.5 w-[100px] bg-accent rounded-full mx-auto mb-7" />
        <h2 className="font-cairo font-extrabold text-[44px] leading-[1.15] text-white mb-4">
          متجرك جاهز<br />على بُعد ١٥ دقيقة
        </h2>
        <p className="font-cairo text-[17px] leading-[1.6] text-white/70 mb-8">
          سجّل حساباً مجانياً، اختر نوع متجرك، وأضف أول منتج اليوم. لا حاجة لبطاقة ائتمانية.
        </p>
        <div className="flex items-center gap-3 justify-center">
          <Button variant="accent" size="lg" onClick={() => navigate('/merchant/register')}>
            ابدأ مجاناً
            <Icon name="arrow-left" size={18} />
          </Button>
          <button className="inline-flex items-center gap-2 font-cairo font-semibold text-base px-7 py-3.5 rounded border border-white/20 bg-white/8 text-white hover:bg-white/15 transition-colors">
            <Icon name="phone" size={16} />
            تكلم مع فريقنا
          </button>
        </div>
      </div>
    </section>
  )
}

export default function LandingFooter() {
  const links = ['الخصوصية', 'الشروط', 'المساعدة', 'nawadev.ye']
  return (
    <footer className="bg-primary-800 border-t border-white/[0.06] px-8 py-7">
      <div className="max-w-[1240px] mx-auto flex items-center justify-between gap-5 font-cairo text-[13px] text-white/50">
        <div>© 2026 NawaMart · صُنع في اليمن بفخر</div>
        <div className="flex gap-5">
          {links.map(l => (
            <a key={l} href="#" className="text-white/55 hover:text-white transition-colors cursor-pointer">{l}</a>
          ))}
        </div>
      </div>
    </footer>
  )
}
