import usePageTitle          from '@/hooks/usePageTitle'
import LandingNav            from '@/components/landing/LandingNav'
import LandingHero           from '@/components/landing/LandingHero'
import LandingStoreTypes     from '@/components/landing/LandingStoreTypes'
import LandingHowItWorks     from '@/components/landing/LandingHowItWorks'
import LandingPricing        from '@/components/landing/LandingPricing'
import LandingTestimonials   from '@/components/landing/LandingTestimonials'
import LandingFooter, { LandingFinalCta } from '@/components/landing/LandingFooter'

export default function LandingPage() {
  usePageTitle()
  return (
    <div className="bg-bg min-h-screen">
      <LandingNav />
      <LandingHero />
      <LandingStoreTypes />
      <LandingHowItWorks />
      <LandingPricing />
      <LandingTestimonials />
      <LandingFinalCta />
      <LandingFooter />
    </div>
  )
}
