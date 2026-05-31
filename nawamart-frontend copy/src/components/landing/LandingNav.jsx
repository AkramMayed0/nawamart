import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '@/components/ui/Button'

const NAV_LINKS = [
  { label: 'المنصة',           href: '#platform' },
  { label: 'المتاجر المادية',  href: '#physical'  },
  { label: 'المتاجر الرقمية', href: '#digital'   },
  { label: 'الأسعار',          href: '#pricing'   },
  { label: 'تواصل معنا',       href: '#contact'   },
]

export default function LandingNav() {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  function scrollTo(href) {
    setMenuOpen(false)
    const id = href.replace('#', '')
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <nav className="bg-white border-b border-border sticky top-0 z-20">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-8 py-4 flex items-center gap-7">
        {/* Logo */}
        <Link to="/" className="flex-none">
          <img src="/logo.png" alt="NawaMart" className="h-8" />
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-7 flex-1">
          {NAV_LINKS.map(link => (
            <a
              key={link.label}
              href={link.href}
              onClick={(e) => { e.preventDefault(); scrollTo(link.href) }}
              className="font-cairo text-[14.5px] font-medium text-text hover:text-primary transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-2.5 ms-auto">
          <Button variant="ghost" size="sm" onClick={() => navigate('/merchant/login')}>
            تسجيل الدخول
          </Button>
          <Button variant="accent" size="sm" onClick={() => navigate('/merchant/register')}>
            ابدأ مجاناً
          </Button>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden ms-auto flex h-9 w-9 items-center justify-center rounded-xl bg-bg-soft text-text-muted hover:bg-border hover:text-text transition-colors"
          aria-label="فتح القائمة"
        >
          {menuOpen ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18"/><path d="M3 6h18"/><path d="M3 18h18"/></svg>
          )}
        </button>
      </div>

      {/* Mobile menu panel */}
      {menuOpen && (
        <div className="md:hidden border-t border-border bg-white px-4 py-4 flex flex-col gap-2 animate-[fadeIn_180ms_ease]">
          {NAV_LINKS.map(link => (
            <a
              key={link.label}
              href={link.href}
              onClick={(e) => { e.preventDefault(); scrollTo(link.href) }}
              className="font-cairo text-[14.5px] font-semibold text-text hover:text-primary transition-colors px-3 py-2.5 rounded-xl hover:bg-bg-soft"
            >
              {link.label}
            </a>
          ))}
          <hr className="border-border my-2" />
          <Button variant="ghost" size="md" className="w-full justify-center" onClick={() => { setMenuOpen(false); navigate('/merchant/login') }}>
            تسجيل الدخول
          </Button>
          <Button variant="accent" size="md" className="w-full justify-center" onClick={() => { setMenuOpen(false); navigate('/merchant/register') }}>
            ابدأ مجاناً
          </Button>
        </div>
      )}
    </nav>
  )
}
