import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Bot, CheckCircle2, MessageSquareText,
  ShieldCheck, Truck, WalletCards, Zap, TrendingUp, Star,
} from 'lucide-react'
import heroPhone from '@/assets/hero-phone.png'

const CAPABILITIES = [
  { icon: WalletCards,       label: 'إيصالات المحافظ', bg: '#FFF8E8', color: '#B7791F' },
  { icon: MessageSquareText, label: 'شات مباشر',        bg: '#EFFCF9', color: '#0F766E' },
  { icon: Zap,               label: 'تسليم رقمي فوري',  bg: '#F5F1FF', color: '#6750A4' },
  { icon: Truck,             label: 'مندوب محلي',        bg: '#F0F4FF', color: '#2D7BE0' },
]

const STATS = [
  { value: '+500', label: 'تاجر نشط' },
  { value: '3G',   label: 'محسّن لشبكات' },
  { value: '15',   label: 'دقيقة للإعداد' },
]

function FloatingCard({ style, children, delay = 0, className = '' }) {
  return (
    <div
      className={`pop-in ${className}`}
      style={{
        position: 'absolute',
        background: 'rgba(255,255,255,0.96)',
        backdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,255,255,0.9)',
        borderRadius: '16px',
        boxShadow: '0 4px 24px rgba(24,33,47,0.1), 0 1px 4px rgba(24,33,47,0.06)',
        animationDelay: `${delay}s`,
        ...style,
      }}
    >
      {children}
    </div>
  )
}

function CommercePreview() {
  return (
    <div style={{ position: 'relative', minHeight: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {/* Ambient glow */}
      <div style={{
        position: 'absolute', inset: 0, display: 'flex',
        alignItems: 'center', justifyContent: 'center', pointerEvents: 'none',
      }}>
        <div style={{
          width: '360px', height: '360px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(201,63,43,0.1) 0%, transparent 65%)',
          animation: 'pulse-glow 4s ease-in-out infinite',
        }} />
      </div>

      {/* Phone */}
      <img
        src={heroPhone}
        alt="واجهة متجر نوا مارت"
        className="hero-media-shadow hero-float"
        style={{ position: 'relative', zIndex: 10, width: '260px', maxWidth: '80%' }}
        loading="eager"
      />

      {/* Safe payment card */}
      <FloatingCard
        style={{ top: '60px', insetInlineEnd: 0, width: '230px', padding: '14px' }}
        delay={0.3}
        className="hidden md:block"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#EFFCF9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <ShieldCheck size={16} style={{ color: '#0F766E' }} />
          </div>
          <div>
            <p className="font-cairo text-sm font-extrabold" style={{ color: '#0D0D12' }}>طلب آمن ✓</p>
            <p className="font-cairo text-xs" style={{ color: '#5A5A72' }}>تم قبول وصل الدفع</p>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
          {['وصل', 'دفع', 'تأكيد'].map((item, i) => (
            <div key={item} style={{
              borderRadius: '8px', padding: '6px',
              textAlign: 'center',
              background: i === 1 ? '#EFFCF9' : '#F5F5F7',
              color: i === 1 ? '#0F766E' : '#9494A8',
              fontSize: '11px', fontWeight: 700,
            }} className="font-cairo">
              {item}
            </div>
          ))}
        </div>
      </FloatingCard>

      {/* Store progress card */}
      <FloatingCard
        style={{ bottom: '80px', insetInlineStart: 0, width: '250px', padding: '14px' }}
        delay={0.5}
        className="hidden lg:block"
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <p className="font-cairo text-sm font-extrabold" style={{ color: '#0D0D12' }}>المتجر جاهز</p>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '5px',
            background: '#DFF5E7', borderRadius: '999px',
            padding: '3px 10px', fontSize: '11px', fontWeight: 700, color: '#1E8C4D',
          }} className="font-cairo">
            <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#27AE60', display: 'inline-block' }} />
            نشط
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            { label: 'منتجات', pct: 76, color: '#0F766E' },
            { label: 'طلبات',  pct: 62, color: '#C93F2B' },
            { label: 'واتساب', pct: 48, color: '#B7791F' },
          ].map(({ label, pct, color }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={12} style={{ color: '#0F766E', flexShrink: 0 }} />
              <span className="font-cairo text-xs font-bold" style={{ color: '#9494A8', width: '44px', flexShrink: 0 }}>{label}</span>
              <div style={{ height: '4px', flex: 1, borderRadius: '999px', background: '#F5F5F7', overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: '999px', background: color, width: `${pct}%`, transition: 'width 1s ease' }} />
              </div>
              <span className="font-cairo dk-num" style={{ fontSize: '10px', fontWeight: 700, color: '#9494A8' }}>{pct}%</span>
            </div>
          ))}
        </div>
      </FloatingCard>

      {/* WhatsApp bot card */}
      <FloatingCard
        style={{ bottom: '10px', insetInlineEnd: '16px', width: '190px', padding: '12px' }}
        delay={0.7}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: '#FFF4F1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Bot size={15} style={{ color: '#C93F2B' }} />
          </div>
          <div>
            <p className="font-cairo text-xs font-extrabold" style={{ color: '#0D0D12' }}>بوت واتساب</p>
            <p className="font-cairo" style={{ fontSize: '11px', color: '#5A5A72', lineHeight: '1.3' }}>يسترجع السلات تلقائياً</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '8px' }}>
          <TrendingUp size={11} style={{ color: '#27AE60' }} />
          <span className="font-cairo" style={{ fontSize: '11px', fontWeight: 700, color: '#27AE60' }}>+38% استرجاع</span>
        </div>
      </FloatingCard>
    </div>
  )
}

export default function LandingHero() {
  const navigate = useNavigate()

  return (
    <section
      style={{ position: 'relative', overflow: 'hidden', borderBottom: '1px solid #E2E2E9' }}
    >
      {/* Subtle grid background */}
      <div className="hero-grid-pattern" style={{
        position: 'absolute', inset: 0, opacity: 0.5, pointerEvents: 'none',
      }} />

      {/* Gradient overlays */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 80% 60% at 70% 10%, rgba(201,63,43,0.06) 0%, transparent 55%)',
      }} />
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 60% 50% at 0% 70%, rgba(15,118,110,0.05) 0%, transparent 55%)',
      }} />

      <div
        className="nm-container"
        style={{
          display: 'grid',
          minHeight: 'calc(100vh - 72px)',
          alignItems: 'center',
          gap: '40px',
          padding: '48px 0',
          gridTemplateColumns: '1fr',
          position: 'relative',
        }}
      >
        <style>{`
          @media (min-width: 1024px) {
            .hero-grid { grid-template-columns: 1fr 1fr !important; }
          }
        `}</style>
        <div className="hero-grid" style={{
          display: 'grid', gridTemplateColumns: '1fr', gap: '40px', alignItems: 'center',
        }}>
          {/* Copy */}
          <div style={{ maxWidth: '560px' }}>
            {/* Kicker */}
            <div className="hero-fade-in" style={{ marginBottom: '20px' }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: 'linear-gradient(135deg, #FFF4F1, #FFE4DD)',
                border: '1px solid rgba(201,63,43,0.15)',
                borderRadius: '999px', padding: '5px 14px',
                fontSize: '11px', fontWeight: 800, letterSpacing: '0.1em',
                textTransform: 'uppercase', color: '#C93F2B',
              }} className="font-cairo">
                <Zap size={11} />
                تجارة يمنية أسرع وأوضح
              </span>
            </div>

            {/* Headline */}
            <div className="hero-fade-in hero-fade-in-delay-1">
              <h1 className="font-cairo" style={{ margin: 0 }}>
                <span style={{
                  display: 'block',
                  fontSize: 'clamp(40px, 6vw, 72px)',
                  fontWeight: 800,
                  color: '#0D0D12',
                  lineHeight: 1.05,
                  letterSpacing: '-0.02em',
                }}>
                  Nawa<span className="shimmer-text">Mart</span>
                </span>
                <span style={{
                  display: 'block',
                  fontSize: 'clamp(24px, 3.5vw, 42px)',
                  fontWeight: 800,
                  color: '#5A5A72',
                  lineHeight: 1.25,
                  marginTop: '8px',
                }}>
                  متجر خفيف للدفع المحلي،{' '}
                  <span style={{ color: '#0D0D12', position: 'relative', display: 'inline-block' }}>
                    الشات
                    <svg style={{ position: 'absolute', bottom: '-3px', left: 0, right: 0, width: '100%' }} height="5" viewBox="0 0 100 5" preserveAspectRatio="none">
                      <path d="M0 4 Q50 0 100 4" stroke="url(#acc)" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                      <defs><linearGradient id="acc" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#C93F2B"/><stop offset="100%" stopColor="#E87961"/></linearGradient></defs>
                    </svg>
                  </span>
                  {', والتسليم.'}
                </span>
              </h1>
            </div>

            {/* Description */}
            <p className="hero-fade-in hero-fade-in-delay-2 font-cairo" style={{
              marginTop: '24px', fontSize: '17px', lineHeight: 1.7, color: '#5A5A72', maxWidth: '480px',
            }}>
              واجهة متجر محسّنة لشبكات اليمن، إدارة طلبات واضحة، رفع إيصالات المحافظ، وتسليم رقمي أو مادي بدون تعقيد.
            </p>

            {/* CTAs */}
            <div className="hero-fade-in hero-fade-in-delay-3" style={{ marginTop: '32px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button
                onClick={() => navigate('/merchant/register')}
                className="font-cairo"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '10px',
                  padding: '14px 28px', borderRadius: '12px',
                  background: 'linear-gradient(135deg, #C93F2B 0%, #A62F20 100%)',
                  color: '#FFFFFF', fontWeight: 800, fontSize: '16px',
                  border: 'none', cursor: 'pointer',
                  boxShadow: '0 4px 20px rgba(201,63,43,0.35)',
                  transition: 'all 200ms ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(201,63,43,0.45)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(201,63,43,0.35)' }}
              >
                ابدأ متجرك مجاناً
                <ArrowLeft size={18} />
              </button>
              <button
                onClick={() => navigate('/merchant/login')}
                className="font-cairo"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  padding: '14px 28px', borderRadius: '12px',
                  background: '#FFFFFF', color: '#0D0D12',
                  fontWeight: 800, fontSize: '16px',
                  border: '1.5px solid #E2E2E9', cursor: 'pointer',
                  transition: 'all 200ms ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#C8C8D8'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E2E9'; e.currentTarget.style.boxShadow = 'none' }}
              >
                دخول التجار
              </button>
            </div>

            {/* Stats */}
            <div className="hero-fade-in hero-fade-in-delay-4" style={{
              marginTop: '32px', display: 'flex', alignItems: 'center', gap: '0',
              borderTop: '1px solid #E2E2E9', paddingTop: '24px', flexWrap: 'wrap', gap: '0',
            }}>
              {STATS.map(({ value, label }, i) => (
                <div key={label} style={{
                  padding: i > 0 ? '0 0 0 24px' : '0 24px 0 0',
                  borderLeft: i > 0 ? '1px solid #E2E2E9' : 'none',
                  marginLeft: i > 0 ? '24px' : 0,
                }}>
                  <p className="font-cairo font-extrabold dk-num" style={{ fontSize: '22px', color: '#0D0D12' }}>{value}</p>
                  <p className="font-cairo text-xs" style={{ color: '#9494A8', marginTop: '2px', whiteSpace: 'nowrap' }}>{label}</p>
                </div>
              ))}

              <div style={{ marginRight: 'auto', display: 'flex', alignItems: 'center', gap: '4px' }}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={13} fill="#F39C12" style={{ color: '#F39C12' }} />
                ))}
                <span className="font-cairo text-xs font-semibold" style={{ color: '#5A5A72', marginRight: '4px' }}>4.9/5</span>
              </div>
            </div>

            {/* Feature chips */}
            <div className="hero-fade-in hero-fade-in-delay-5" style={{
              marginTop: '20px', display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px',
            }}>
              {CAPABILITIES.map(({ icon: Icon, label, bg, color }) => (
                <div
                  key={label}
                  className="nm-pressable font-cairo"
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '10px 14px', borderRadius: '12px',
                    background: '#FFFFFF', border: '1px solid #E2E2E9',
                    transition: 'all 180ms ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#C8C8D8'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E2E9'; e.currentTarget.style.boxShadow = 'none' }}
                >
                  <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={14} style={{ color }} />
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#0D0D12' }}>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Visual */}
          <CommercePreview />
        </div>
      </div>
    </section>
  )
}
