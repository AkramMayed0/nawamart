import Icon from '@/components/ui/Icon'
import { TESTIMONIALS } from '@/data/mockData'

export default function LandingTestimonials() {
  return (
    <section className="px-8 py-20">
      <div className="max-w-[1240px] mx-auto">

        {/* Head */}
        <div className="text-center max-w-[720px] mx-auto mb-10">
          <span className="font-inter text-xs font-bold tracking-[0.18em] text-accent uppercase mb-3 block">
            Trusted by Yemeni merchants
          </span>
          <h2 className="font-cairo font-extrabold text-[44px] leading-[1.15] text-text mb-3.5">
            تجار يثقون بنا
          </h2>
          <p className="font-cairo text-[17px] leading-[1.6] text-text-muted">
            من باعة الأغذية في صنعاء إلى تجار الاشتراكات الرقمية في عدن.
          </p>
        </div>

        {/* Quote cards */}
        <div className="grid grid-cols-3 gap-4 mt-10">
          {TESTIMONIALS.map((q, i) => (
            <div key={i} className="bg-white border border-border rounded-[14px] p-6 flex flex-col gap-3.5">
              <div className="font-inter text-[40px] leading-none text-accent font-extrabold">"</div>
              <p className="font-cairo text-[15px] leading-[1.65] text-text">{q.text}</p>

              <div className="flex items-center gap-2.5 mt-1 pt-3.5 border-t border-border">
                <div className="w-[38px] h-[38px] rounded-full bg-primary text-white font-cairo font-bold text-[15px] flex items-center justify-center flex-none">
                  {q.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-cairo font-bold text-sm text-text">{q.name}</div>
                  <div className="font-cairo text-xs text-text-muted">{q.store}</div>
                </div>
                <span className={`inline-flex items-center gap-1.5 font-cairo text-[11px] font-semibold px-2 py-1 rounded-pill
                  ${q.type === 'physical' ? 'bg-primary-50 text-primary' : 'bg-accent-50 text-accent-700'}`}>
                  <Icon name={q.type === 'physical' ? 'truck' : 'bolt'} size={11} />
                  {q.type === 'physical' ? 'مادي' : 'رقمي'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
