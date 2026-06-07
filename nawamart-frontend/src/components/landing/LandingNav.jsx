import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, X, Sparkles } from 'lucide-react'
import Button from '@/components/ui/Button'

const NAV_LINKS = [
  { label: 'المنصة', href: '#platform' },
  { label: 'المتاجر المادية', href: '#physical' },
  { label: 'المتاجر الرقمية', href: '#digital' },
  { label: 'الأسعار', href: '#pricing' },
]

export default function LandingNav() {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  function scrollTo(href) {
    setMenuOpen(false)
    const el = document.getElementById(href.replace('#', ''))
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <nav className={`sticky top-0 z-40 transition-all duration-300 ${
      scrolled
        ? 'bg-white/90 backdrop-blur-2xl shadow-sm border-b border-border/60'
        : 'bg-white/70 backdrop-blur-xl border-b border-transparent'
    }`}>
      {/* Top accent line */}
      <div className="h-[2.5px] w-full bg-gradient-to-l from-transparent via-accent to-transparent opacity-70" />

      <div className="nm-container flex h-[68px] items-center gap-6">
        {/* Logo */}
        <Link to="/" className="flex shrink-0 items-center gap-2.5 group">
          <img src="/logo.svg" alt="NawaMart" className="h-8 transition-transform group-hover:scale-105 duration-200" />
        </Link>

        {/* Desktop nav links */}
        <div className="hidden flex-1 items-center gap-0.5 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={(event) => {
                event.preventDefault()
                scrollTo(link.href)
              }}
              className="relative rounded-lg px-4 py-2 font-cairo text-sm font-bold text-text-muted transition-colors hover:text-text group"
            >
              {link.label}
              <span className="absolute bottom-1 right-4 left-4 h-0.5 rounded-full bg-accent scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-center" />
            </a>
          ))}
        </div>

        {/* CTA actions */}
        <div className="hidden items-center gap-2 md:flex">
          <button
            onClick={() => navigate('/merchant/login')}
            className="rounded-lg px-4 py-2 font-cairo text-sm font-bold text-text-muted hover:text-text transition-colors"
          >
            دخول
          </button>
          <button
            onClick={() => navigate('/merchant/register')}
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-accent px-5 py-2.5 font-cairo text-sm font-extrabold text-white shadow-md shadow-accent/25 transition-all duration-200 hover:shadow-accent/40 hover:shadow-lg hover:-translate-y-px"
          >
            <Sparkles size={13} className="opacity-80" />
            <span className="relative z-10">ابدأ الآن</span>
            <div className="absolute inset-0 bg-gradient-to-l from-accent-700 to-accent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          </button>
        </div>

        {/* Mobile burger */}
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          className="ms-auto flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-white text-text transition-colors hover:bg-bg md:hidden"
          aria-label="فتح القائمة"
        >
          {menuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t border-border bg-white/95 backdrop-blur-xl px-4 py-4 md:hidden shadow-lg">
          <div className="flex flex-col gap-0.5">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(event) => {
                  event.preventDefault()
                  scrollTo(link.href)
                }}
                className="rounded-xl px-4 py-3 font-cairo text-sm font-bold text-text hover:bg-bg transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              className="rounded-xl border border-border bg-bg py-3 font-cairo text-sm font-extrabold text-text text-center transition-colors hover:bg-bg-soft"
              onClick={() => { setMenuOpen(false); navigate('/merchant/login') }}
            >
              دخول
            </button>
            <button
              className="rounded-xl bg-accent py-3 font-cairo text-sm font-extrabold text-white text-center shadow-md shadow-accent/30 transition-all hover:bg-accent-700"
              onClick={() => { setMenuOpen(false); navigate('/merchant/register') }}
            >
              ابدأ
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}
