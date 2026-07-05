import { useState, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Cookie, X, Check } from 'lucide-react'
import { recordConsent } from '@/api/compliance'
import Button from '@/components/ui/Button'

const CONSENT_KEY = 'nawamart-cookie-consent'

const COOKIE_TYPES = [
  { id: 'essential', label: 'أساسي', desc: 'ضروري لتشغيل الموقع', required: true },
  { id: 'functional', label: 'وظيفي', desc: 'لتحسين تجربة المستخدم', required: false },
  { id: 'analytics', label: 'تحليلات', desc: 'لفهم كيفية استخدام الموقع', required: false },
  { id: 'marketing', label: 'تسويق', desc: 'لعرض إعلانات مخصصة', required: false },
]

export default function CookieConsentBanner({ storeId }) {
  const [visible, setVisible] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [preferences, setPreferences] = useState({
    essential: true,
    functional: false,
    analytics: false,
    marketing: false,
  })

  useEffect(() => {
    const saved = localStorage.getItem(CONSENT_KEY)
    if (!saved) {
      const timer = setTimeout(() => setVisible(true), 500)
      return () => clearTimeout(timer)
    }
  }, [])

  const { mutate: saveConsent } = useMutation({
    mutationFn: (data) => recordConsent({ ...data, storeId }),
  })

  function acceptAll() {
    const all = { essential: true, functional: true, analytics: true, marketing: true }
    setPreferences(all)
    savePreferences(all)
  }

  function acceptSelected() {
    savePreferences(preferences)
  }

  function rejectAll() {
    const minimal = { essential: true, functional: false, analytics: false, marketing: false }
    setPreferences(minimal)
    savePreferences(minimal)
  }

  function savePreferences(prefs) {
    const payload = {
      granted: true,
      version: '1.0',
      details: prefs,
    }

    localStorage.setItem(CONSENT_KEY, JSON.stringify({ ...prefs, timestamp: Date.now() }))
    setVisible(false)

    for (const [type, granted] of Object.entries(prefs)) {
      saveConsent({ ...payload, type, granted })
    }
  }

  function toggle(type) {
    if (type === 'essential') return
    setPreferences(p => ({ ...p, [type]: !p[type] }))
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 p-4" dir="rtl">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl border border-border overflow-hidden">
        <div className="p-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
              <Cookie size={20} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-cairo font-bold text-base text-text mb-1">نحن نهتم بخصوصيتك</h3>
              <p className="font-cairo text-sm text-text-muted leading-relaxed">
                نستخدم ملفات تعريف الارتباط (Cookies) لتحسين تجربتك. يمكنك اختيار ما تسمح به.
              </p>
            </div>
            <button onClick={rejectAll} className="w-8 h-8 rounded-xl flex items-center justify-center text-text-muted hover:bg-bg-soft shrink-0">
              <X size={18} />
            </button>
          </div>

          {showDetails && (
            <div className="mt-4 space-y-2 border-t border-border pt-4">
              {COOKIE_TYPES.map((ct) => (
                <label
                  key={ct.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${preferences[ct.id] ? 'bg-primary-5 border-primary' : 'border-border'}`}
                >
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${preferences[ct.id] ? 'bg-primary border-primary' : ct.required ? 'bg-bg-soft border-border' : 'border-border'}`}>
                    {preferences[ct.id] && <Check size={12} className="text-white" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-cairo text-sm font-bold text-text">{ct.label}</p>
                    <p className="font-cairo text-xs text-text-muted">{ct.desc}</p>
                  </div>
                  {ct.required && (
                    <span className="font-cairo text-[10px] bg-bg-soft text-text-muted px-2 py-0.5 rounded-full">مطلوب</span>
                  )}
                  {!ct.required && (
                    <input type="checkbox" checked={preferences[ct.id]} onChange={() => toggle(ct.id)} className="sr-only" />
                  )}
                </label>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="font-cairo text-xs font-bold text-text-muted hover:text-text transition-colors"
            >
              {showDetails ? 'إخفاء التفاصيل' : 'تخصيص الإعدادات'}
            </button>
            <div className="flex gap-2">
              {showDetails ? (
                <>
                  <Button variant="ghost" size="sm" onClick={rejectAll}>رفض الكل</Button>
                  <Button variant="primary" size="sm" onClick={acceptSelected}>تأكيد الاختيار</Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" size="sm" onClick={rejectAll}>رفض</Button>
                  <Button variant="accent" size="sm" onClick={acceptAll}>قبول الكل</Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
