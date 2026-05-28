import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import Icon from '@/components/ui/Icon'
import Button from '@/components/ui/Button'

const TIERS = [
  {
    key: 'free',
    name: 'Free', num: '0', unit: 'ر.ي / شهر',
    sub: 'ابدأ بدون تكلفة، جرّب متجرك مجاناً.',
    features: [
      ['المنتجات',   'حتى 10 منتجات'],
      ['النطاق',     'نطاق فرعي nawa.shop'],
      ['الدفع',      'وصل يدوي (تحقق يدوي)'],
      ['التقارير',   'تقارير مبيعات أساسية'],
      ['التوصيل',    'يدوي — واتساب / انستقرام'],
      ['التحليلات',  '—'],
      ['المحادثة',   '—'],
      ['الفريق',     '—'],
      ['الدعم',      'دعم أساسي'],
    ],
    cta: 'ابدأ مجاناً', ctaVariant: 'secondary', featured: false, paid: false,
  },
  {
    key: 'pro',
    name: 'Pro', num: '10,000', unit: 'ر.ي / شهر',
    sub: 'للتجار النشطين — تحليلات متوسطة وتوصيل عبر منصات متعددة.',
    features: [
      ['المنتجات',   'غير محدود'],
      ['النطاق',     'نطاق مخصص .com'],
      ['الدفع',      'وصل يدوي (تحقق يدوي)'],
      ['التقارير',   'تقارير مبيعات + رسوم بيانية'],
      ['التوصيل',    'يدوي — واتساب / انستقرام / تيليجرام'],
      ['التحليلات',  'تحليلات متوسطة (رسوم بيانية شهرية)'],
      ['المحادثة',   '—'],
      ['الفريق',     '—'],
      ['الدعم',      'دعم عبر البريد الإلكتروني'],
    ],
    cta: 'اشترك الآن', ctaVariant: 'accent', featured: true, paid: true,
  },
  {
    key: 'business',
    name: 'Business', num: '20,000', unit: 'ر.ي / شهر',
    sub: 'للمتاجر المتوسعة — محادثة مدمجة وتحليلات متقدمة.',
    features: [
      ['المنتجات',   'غير محدود + SKU / brand / barcode'],
      ['النطاق',     'نطاق مخصص .com'],
      ['الدفع',      'وصل يدوي (تحقق يدوي)'],
      ['التقارير',   'تقارير متقدمة + تقارير ضريبية'],
      ['التوصيل',    'مدمج (داخل التطبيق) + خارجي (واتساب/انستقرام/تيليجرام)'],
      ['التحليلات',  'تحليلات متقدمة (رسوم بيانية + تقارير دورية)'],
      ['المحادثة',   'محادثة مدمجة داخل التطبيق'],
      ['الفريق',     'حتى 5 مستخدمين فريق'],
      ['الدعم',      'دعم أولوية 24/7'],
    ],
    cta: 'اشترك الآن', ctaVariant: 'secondary', featured: false, paid: true,
  },
]

export default function LandingPricing() {
  const navigate = useNavigate()
  const token    = useAuthStore(s => s.token)

  function handleCta(tier) {
    if (!tier.paid) {
      // Free plan → go to register (or dashboard if logged in)
      navigate(token ? '/dashboard' : '/merchant/register')
      return
    }
    // Paid plan → go to subscribe page (must be logged in)
    if (!token) {
      navigate(`/merchant/login?redirect=/subscribe?plan=${tier.key}`)
      return
    }
    navigate(`/subscribe?plan=${tier.key}`)
  }

  return (
    <section id="pricing" className="px-8 py-20 bg-surface border-t border-b border-border">
      <div className="max-w-[1240px] mx-auto">

        {/* Head */}
        <div className="text-center max-w-[720px] mx-auto mb-10">
          <span className="font-inter text-xs font-bold tracking-[0.18em] text-accent uppercase mb-3 block">
            Pricing · plans for every stage
          </span>
          <h2 className="font-cairo font-extrabold text-[44px] leading-[1.15] text-text mb-3.5">
            خطط بسيطة، بلا مفاجآت
          </h2>
          <p className="font-cairo text-[17px] leading-[1.6] text-text-muted">
            ادفع شهرياً، ألغِ متى شئت. كل الخطط تشمل دعم نوعَي المتجر.
          </p>
        </div>

        {/* Cards — responsive: stack on mobile, 3-col on lg */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-10">
          {TIERS.map(t => (
            <div
              key={t.name}
              className={`bg-white rounded-[18px] p-7 flex flex-col gap-3.5 relative transition-shadow hover:shadow-md
                ${t.featured ? 'border-2 border-primary' : 'border border-border'}`}
            >
              {/* "Most popular" label */}
              {t.featured && (
                <span className="absolute -top-3 end-6 bg-accent text-white font-cairo text-[11.5px] font-bold px-3 py-1 rounded-full">
                  الأكثر شعبية
                </span>
              )}

              <h3 className="font-cairo font-bold text-lg text-text">{t.name}</h3>

              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="font-inter font-extrabold text-[44px] text-text leading-none dk-num">{t.num}</span>
                <span className="font-cairo text-sm text-text-muted">{t.unit}</span>
              </div>

              <p className="font-cairo text-[13.5px] text-text-muted mb-3">{t.sub}</p>

              {/* Feature comparison table */}
              <div className="flex flex-col py-4 border-t border-border mb-4 flex-1 gap-0">
                {t.features.filter(([, v]) => v !== '—').map(([label, value], i) => (
                  <div key={i} className="flex items-center justify-between gap-2 py-2 border-b border-border/40 last:border-0">
                    <span className="font-cairo text-[12px] text-text-muted">{label}</span>
                    <span className="font-cairo text-sm font-semibold text-left text-text">{value}</span>
                  </div>
                ))}
              </div>

              <Button
                variant={t.ctaVariant}
                size="lg"
                className="w-full justify-center mt-auto"
                onClick={() => handleCta(t)}
              >
                {t.cta}
              </Button>

              {t.paid && (
                <p className="font-cairo text-[11px] text-text-subtle text-center -mt-2">
                  الدفع عبر محفظة Cherry · الكريمي · OneCash
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
