import Icon from '@/components/ui/Icon'
import { TESTIMONIALS } from '@/data/mockData'
import { Star, Quote } from 'lucide-react'

export default function LandingTestimonials() {
  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-bg/50 via-white to-bg/50 pointer-events-none" />

      {/* Decorative elements */}
      <div className="absolute top-20 right-20 w-72 h-72 rounded-full bg-accent/5 blur-[80px] pointer-events-none" />
      <div className="absolute bottom-20 left-20 w-56 h-56 rounded-full bg-teal/5 blur-[70px] pointer-events-none" />

      <div className="relative nm-container">
        {/* Head */}
        <div className="text-center max-w-[680px] mx-auto mb-14">
          <div className="flex justify-center mb-4">
            <span className="nm-kicker-center">آراء التجار</span>
          </div>
          <h2 className="font-cairo font-extrabold text-[28px] sm:text-[40px] leading-[1.15] text-text mb-4">
            تجار يثقون بنا
          </h2>
          <p className="font-cairo text-[17px] leading-[1.7] text-text-muted">
            من باعة الأغذية في صنعاء إلى تجار الاشتراكات الرقمية في عدن.
          </p>
        </div>

        {/* Quote cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {TESTIMONIALS.map((q, i) => (
            <div
              key={i}
              className="group relative bg-surface border border-border rounded-3xl p-7 flex flex-col gap-4 transition-all duration-300 hover:-translate-y-1 hover:border-border-strong hover:shadow-lg overflow-hidden"
            >
              {/* Subtle bg on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-accent/2 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl pointer-events-none" />

              {/* Quote icon */}
              <div className="relative flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-accent-50 flex items-center justify-center">
                  <Quote size={16} className="text-accent rotate-180" />
                </div>
                {/* Star rating */}
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, si) => (
                    <Star key={si} size={12} className="text-amber-500 fill-amber-500" />
                  ))}
                </div>
              </div>

              {/* Quote text */}
              <p className="relative font-cairo text-[15px] leading-[1.75] text-text flex-1">
                {q.text}
              </p>

              {/* Divider */}
              <div className="border-t border-border" />

              {/* Author */}
              <div className="relative flex items-center gap-3">
                {/* Avatar with gradient */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-700 to-primary flex items-center justify-center text-white font-cairo font-extrabold text-[15px] flex-none shadow-md">
                  {q.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-cairo font-extrabold text-sm text-text truncate">{q.name}</div>
                  <div className="font-cairo text-xs text-text-muted truncate">{q.store}</div>
                </div>
                <span className={`inline-flex items-center gap-1.5 font-cairo text-[11px] font-bold px-2.5 py-1 rounded-pill shrink-0 ${
                  q.type === 'physical'
                    ? 'bg-primary-50 text-primary border border-primary-100'
                    : 'bg-accent-50 text-accent-700 border border-accent-100'
                }`}>
                  <Icon name={q.type === 'physical' ? 'truck' : 'bolt'} size={10} />
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
