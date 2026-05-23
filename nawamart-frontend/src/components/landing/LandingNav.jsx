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

  return (
    <nav className="bg-white border-b border-border sticky top-0 z-20">
      <div className="max-w-[1240px] mx-auto px-8 py-4 flex items-center gap-7">
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
              className="font-cairo text-[14.5px] font-medium text-text hover:text-primary transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2.5 ms-auto">
          <Button variant="ghost" size="sm" onClick={() => navigate('/merchant/login')}>
            تسجيل الدخول
          </Button>
          <Button variant="accent" size="sm" onClick={() => navigate('/merchant/register')}>
            ابدأ مجاناً
          </Button>
        </div>
      </div>
    </nav>
  )
}
