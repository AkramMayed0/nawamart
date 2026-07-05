import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Store, Package, CreditCard, MapPin, Globe, Rocket, Check, ChevronLeft, ChevronRight, X, Plus, Upload, Shirt, Smartphone, Pizza, Monitor, Wrench } from 'lucide-react'

const INDUSTRY_ICONS = { Shirt, Smartphone, Pizza, Monitor, Wrench }
import { useAuthStore } from '@/store/authStore'
import { createStore, updateStore } from '@/api/stores'
import { createProduct } from '@/api/products'
import usePageTitle from '@/hooks/usePageTitle'
import INDUSTRIES from '@/data/industries'

const STEP_LABELS = ['المتجر', 'القالب', 'المنتج', 'الدفع', 'الشحن', 'النطاق', 'الإطلاق']

export default function OnboardingPage() {
  usePageTitle('إعداد المتجر — نوامارت')
  const navigate = useNavigate()
  const setStore = useAuthStore((s) => s.store ? null : s.setStore)

  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)

  // Step 1 — Store info
  const [storeName, setStoreName] = useState('')
  const [industry, setIndustry] = useState('')
  const [storeType, setStoreType] = useState('physical')

  // Step 2 — Template
  const [selectedTemplate, setSelectedTemplate] = useState('')

  // Step 3 — First product
  const [productName, setProductName] = useState('')
  const [productPrice, setProductPrice] = useState('')
  const [skipProduct, setSkipProduct] = useState(false)

  // Step 4 — Payment
  const [kuraimi, setKuraimi] = useState('')
  const [oneCash, setOneCash] = useState('')
  const [jaib, setJaib] = useState('')

  // Step 5 — Shipping
  const [shippingFee, setShippingFee] = useState('2000')

  // Step 6 — Domain
  const [customDomain, setCustomDomain] = useState('')

  // Step 7 — Launch
  const [createdStore, setCreatedStore] = useState(null)

  const currentIndustry = INDUSTRIES.find((i) => i.id === industry)

  async function handleNext() {
    setLoading(true)
    try {
      if (step === 0) {
        if (!storeName.trim()) { toast.error('اسم المتجر مطلوب'); return }
        if (!industry) { toast.error('اختر مجال المتجر'); return }
        setStep(1)
      } else if (step === 1) {
        if (!selectedTemplate) { toast.error('اختر قالباً للمتجر'); return }
        setStep(2)
      } else if (step === 2) {
        setStep(3)
      } else if (step === 3) {
        const hasWallet = kuraimi.trim() || oneCash.trim() || jaib.trim()
        if (!hasWallet) { toast.error('أضف رقم محفظة واحدة على الأقل'); return }
        setStep(4)
      } else if (step === 4) {
        if (storeType === 'physical' && !shippingFee.trim()) { toast.error('حدد رسوم الشحن'); return }
        setStep(5)
      } else if (step === 5) {
        setStep(6)
      } else if (step === 6) {
        await handleCreateStore()
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateStore() {
    setLoading(true)
    try {
      const paymentAccounts = {}
      if (kuraimi.trim()) paymentAccounts.kuraimi = kuraimi.trim()
      if (oneCash.trim()) paymentAccounts.oneCash = oneCash.trim()
      if (jaib.trim()) paymentAccounts.jaib = jaib.trim()

      const shippingFees = storeType === 'physical' ? [{ city: 'صنعاء', fee: Number(shippingFee) || 0 }] : []

      const res = await createStore({
        name: storeName.trim(),
        type: storeType,
        ...(currentIndustry?.suggestedCategories?.[0] ? { category: currentIndustry.suggestedCategories[0] } : {}),
        paymentAccounts,
        shippingFees,
        customDomain: customDomain.trim() || undefined,
      })

      const store = res.data.data
      setCreatedStore(store)
      useAuthStore.getState().setStore(store)

      // Add first product if entered
      if (!skipProduct && productName.trim()) {
        try {
          await createProduct({
            storeId: store._id,
            name: productName.trim(),
            price: Number(productPrice) || 0,
          })
        } catch {}
      }

      toast.success('تم إنشاء متجرك بنجاح!')
      setTimeout(() => {
        navigate('/dashboard', { replace: true })
      }, 1500)
    } catch (err) {
      toast.error(err?.message || 'حدث خطأ أثناء إنشاء المتجر')
    } finally {
      setLoading(false)
    }
  }

  function handleBack() {
    if (step > 0) setStep((s) => s - 1)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-bg to-white" dir="rtl">
      {/* ── Top progress bar ── */}
      <div className="sticky top-0 z-10 bg-surface/80 backdrop-blur-sm border-b border-border">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Store size={18} className="text-primary" />
            <span className="font-cairo text-sm font-bold text-text">نوامارت</span>
          </div>
          <div className="hidden items-center gap-1 sm:flex">
            {STEP_LABELS.map((label, i) => (
              <div key={i} className="flex items-center gap-1">
                <div className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold font-cairo transition-colors ${
                  i < step ? 'bg-success text-white' : i === step ? 'bg-primary text-white' : 'bg-bg-soft text-text-subtle'
                }`}>
                  {i < step ? <Check size={10} strokeWidth={3} /> : i + 1}
                </div>
                <span className={`font-cairo text-[10px] font-semibold ${i <= step ? 'text-text' : 'text-text-subtle'}`}>{label}</span>
                {i < STEP_LABELS.length - 1 && <div className="mx-1 h-px w-3 bg-border" />}
              </div>
            ))}
          </div>
          <span className="font-cairo text-xs text-text-subtle">{step + 1}/{STEP_LABELS.length}</span>
        </div>
        <div className="h-1 bg-bg-soft">
          <div className="h-full bg-gradient-to-l from-primary to-accent transition-all duration-500" style={{ width: `${((step + 1) / STEP_LABELS.length) * 100}%` }} />
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-10">
        {/* ─────────── Step 0: Store Name + Industry ─────────── */}
        {step === 0 && (
          <div>
            <div className="mb-2 text-center">
              <span className="inline-block rounded-full bg-primary-50 px-3 py-1 font-cairo text-xs font-bold text-primary">الخطوة 1</span>
            </div>
            <h1 className="mb-2 text-center font-cairo text-2xl font-extrabold text-text">لنبدأ بإنشاء متجرك</h1>
            <p className="mx-auto mb-8 max-w-md text-center font-cairo text-sm text-text-muted">اختر اسماً لمتجرك ومجال عملك. يمكنك تغيير كل شيء لاحقاً.</p>

            <div className="mb-6">
              <label className="mb-1.5 block font-cairo text-sm font-bold text-text">اسم المتجر</label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="مثال: متجر المختار"
                className="w-full rounded-xl border border-border bg-surface px-4 py-3 font-cairo text-sm text-text outline-none transition-colors placeholder:text-text-subtle focus:border-primary"
              />
            </div>

            <div className="mb-6">
              <label className="mb-1.5 block font-cairo text-sm font-bold text-text">نوع المتجر</label>
              <div className="flex gap-3">
                {[{ id: 'physical', label: 'منتجات مادية', desc: 'ملابس، أغذية، إلكترونيات' }, { id: 'digital', label: 'منتجات رقمية', desc: 'حسابات، أكواد، اشتراكات' }].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setStoreType(t.id)}
                    className={`flex-1 rounded-xl border-2 p-4 text-center transition-all ${
                      storeType === t.id ? 'border-primary bg-primary-50' : 'border-border bg-surface hover:border-primary/30'
                    }`}
                  >
                    <p className="font-cairo text-sm font-bold text-text">{t.label}</p>
                    <p className="font-cairo text-[10px] text-text-subtle">{t.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block font-cairo text-sm font-bold text-text">مجال المتجر</label>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {INDUSTRIES.map((ind) => (
                  <button
                    key={ind.id}
                    type="button"
                    onClick={() => { setIndustry(ind.id); if (!selectedTemplate) setSelectedTemplate(ind.templates?.[0]?.id || '') }}
                    className={`rounded-xl border-2 p-4 text-center transition-all ${
                      industry === ind.id ? 'border-primary bg-primary-50 shadow-sm' : 'border-border bg-surface hover:border-primary/30'
                    }`}
                  >
                    {(() => { const Icon = INDUSTRY_ICONS[ind.icon]; return Icon ? <Icon size={28} className="text-text-muted" /> : <Store size={28} className="text-text-muted" /> })()}
                    <p className="mt-1 font-cairo text-xs font-bold text-text">{ind.label}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─────────── Step 1: Template ─────────── */}
        {step === 1 && currentIndustry && (
          <div>
            <div className="mb-2 text-center">
              <span className="inline-block rounded-full bg-primary-50 px-3 py-1 font-cairo text-xs font-bold text-primary">الخطوة 2</span>
            </div>
            <h1 className="mb-2 text-center font-cairo text-2xl font-extrabold text-text">اختر قالباً لمتجرك</h1>
            <p className="mx-auto mb-8 max-w-md text-center font-cairo text-sm text-text-muted">قوالب مصممة خصيصاً لمجال {currentIndustry.label}</p>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {currentIndustry.templates.map((tmpl) => (
                <button
                  key={tmpl.id}
                  type="button"
                  onClick={() => setSelectedTemplate(tmpl.id)}
                  className={`rounded-xl border-2 p-6 text-center transition-all ${
                    selectedTemplate === tmpl.id ? 'border-primary bg-primary-50 shadow-md' : 'border-border bg-surface hover:border-primary/30'
                  }`}
                >
                  <div className="mx-auto mb-3 flex h-20 w-full items-center justify-center rounded-lg bg-gradient-to-br from-primary-50 to-accent-50">
                    <Store size={32} className="text-primary/60" />
                  </div>
                  <p className="font-cairo text-sm font-bold text-text">{tmpl.label}</p>
                  <p className="font-cairo text-xs text-text-subtle">قالب عصري ومناسب لمتجرك</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ─────────── Step 2: First Product ─────────── */}
        {step === 2 && (
          <div>
            <div className="mb-2 text-center">
              <span className="inline-block rounded-full bg-accent-50 px-3 py-1 font-cairo text-xs font-bold text-accent-700">الخطوة 3</span>
            </div>
            <h1 className="mb-2 text-center font-cairo text-2xl font-extrabold text-text">أضف أول منتج</h1>
            <p className="mx-auto mb-8 max-w-md text-center font-cairo text-sm text-text-muted">أضف منتجاً واحداً على الأقل لتظهر صفحة متجرك للعملاء</p>

            {skipProduct ? (
              <div className="rounded-xl border-2 border-dashed border-border bg-bg-soft p-8 text-center">
                <Package size={32} className="mx-auto text-text-subtle" />
                <p className="mt-2 font-cairo text-sm font-bold text-text-muted">تم تخطي إضافة المنتج</p>
                <p className="font-cairo text-xs text-text-subtle">يمكنك إضافة المنتجات لاحقاً من لوحة التحكم</p>
                <button type="button" onClick={() => setSkipProduct(false)} className="mt-3 font-cairo text-xs font-bold text-primary hover:underline">تراجع</button>
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-surface p-6">
                <div className="mb-4">
                  <label className="mb-1 block font-cairo text-xs font-bold text-text">اسم المنتج</label>
                  <input
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder={currentIndustry?.suggestedCategories?.[0] ? `مثال: ${currentIndustry.suggestedCategories[0]}` : 'اسم المنتج'}
                    className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 font-cairo text-sm text-text outline-none transition-colors focus:border-primary"
                  />
                </div>
                <div className="mb-4">
                  <label className="mb-1 block font-cairo text-xs font-bold text-text">السعر (ريال)</label>
                  <input
                    type="number"
                    value={productPrice}
                    onChange={(e) => setProductPrice(e.target.value)}
                    placeholder="5000"
                    className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 font-cairo text-sm text-text outline-none transition-colors focus:border-primary"
                  />
                </div>
                <div className="flex items-center gap-3 rounded-lg border border-dashed border-border bg-bg-soft p-4">
                  <Upload size={18} className="text-text-subtle" />
                  <div>
                    <p className="font-cairo text-xs font-bold text-text-muted">إضافة صور</p>
                    <p className="font-cairo text-[10px] text-text-subtle">يمكنك إضافة صور للمنتج لاحقاً</p>
                  </div>
                </div>
              </div>
            )}

            {!skipProduct && (
              <button
                type="button"
                onClick={() => setSkipProduct(true)}
                className="mt-4 w-full text-center font-cairo text-xs font-semibold text-text-muted hover:text-text"
              >
                تخطي هذه الخطوة
              </button>
            )}
          </div>
        )}

        {/* ─────────── Step 3: Payment ─────────── */}
        {step === 3 && (
          <div>
            <div className="mb-2 text-center">
              <span className="inline-block rounded-full bg-success-100 px-3 py-1 font-cairo text-xs font-bold text-success">الخطوة 4</span>
            </div>
            <h1 className="mb-2 text-center font-cairo text-2xl font-extrabold text-text">إعداد الدفع</h1>
            <p className="mx-auto mb-8 max-w-md text-center font-cairo text-sm text-text-muted">أضف أرقام محافظك المالية لاستقبال المدفوعات من العملاء</p>
              <div className="space-y-4 rounded-xl border border-border bg-surface p-6">
              <div>
                <label className="mb-1 block font-cairo text-xs font-bold text-text">محفظة الكريمي</label>
                <input type="text" value={kuraimi} onChange={(e) => setKuraimi(e.target.value)} placeholder="77XXXXXXX"                     className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 font-cairo text-sm text-text outline-none transition-colors focus:border-primary" />
              </div>
              <div>
                <label className="mb-1 block font-cairo text-xs font-bold text-text">محفظة OneCash</label>
                <input type="text" value={oneCash} onChange={(e) => setOneCash(e.target.value)} placeholder="77XXXXXXX"                     className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 font-cairo text-sm text-text outline-none transition-colors focus:border-primary" />
              </div>
              <div>
                <label className="mb-1 block font-cairo text-xs font-bold text-text">محفظة جيب</label>
                <input type="text" value={jaib} onChange={(e) => setJaib(e.target.value)} placeholder="77XXXXXXX"                     className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 font-cairo text-sm text-text outline-none transition-colors focus:border-primary" />
              </div>
            </div>
          </div>
        )}

        {/* ─────────── Step 4: Shipping ─────────── */}
        {step === 4 && (
          <div>
            <div className="mb-2 text-center">
              <span className="inline-block rounded-full bg-info-100 px-3 py-1 font-cairo text-xs font-bold text-info">الخطوة 5</span>
            </div>
            <h1 className="mb-2 text-center font-cairo text-2xl font-extrabold text-text">تكوين الشحن</h1>
            {storeType === 'digital' ? (
              <>
                <p className="mx-auto mb-8 max-w-md text-center font-cairo text-sm text-text-muted">المتاجر الرقمية لا تحتاج إلى شحن — سننتقل للخطوة التالية</p>
                <div className="rounded-xl border border-success-100 bg-success-50 p-6 text-center">
                  <Check size={24} className="mx-auto text-success-dark" />
                  <p className="mt-2 font-cairo text-sm font-bold text-success-dark">لا حاجة للشحن للمنتجات الرقمية ✓</p>
                </div>
              </>
            ) : (
              <>
                <p className="mx-auto mb-8 max-w-md text-center font-cairo text-sm text-text-muted">حدد رسوم الشحن الافتراضية. يمكنك تخصيصها لكل محافظة لاحقاً.</p>
                <div className="rounded-xl border border-border bg-surface p-6">
                  <label className="mb-1 block font-cairo text-xs font-bold text-text">رسوم الشحن الافتراضية (ريال)</label>
                  <input type="number" value={shippingFee} onChange={(e) => setShippingFee(e.target.value)} placeholder="2000"                     className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 font-cairo text-sm text-text outline-none transition-colors focus:border-primary" />
                  <p className="mt-2 font-cairo text-[10px] text-text-subtle">يمكنك إضافة رسوم لكل محافظة على حدة من الإعدادات لاحقاً</p>
                </div>
              </>
            )}
          </div>
        )}

        {/* ─────────── Step 5: Domain ─────────── */}
        {step === 5 && (
          <div>
            <div className="mb-2 text-center">
              <span className="inline-block rounded-full bg-warning-100 px-3 py-1 font-cairo text-xs font-bold text-warning">الخطوة 6</span>
            </div>
            <h1 className="mb-2 text-center font-cairo text-2xl font-extrabold text-text">اربط نطاقاً مخصصاً (اختياري)</h1>
            <p className="mx-auto mb-8 max-w-md text-center font-cairo text-sm text-text-muted">استخدم نطاقك الخاص لمتجرك. يمكنك تخطي هذه الخطوة والاستمرار بالنطاق الافتراضي.</p>
            <div className="rounded-xl border border-border bg-surface p-6">
              <label className="mb-1 block font-cairo text-xs font-bold text-text">النطاق المخصص</label>
              <input type="text" value={customDomain} onChange={(e) => setCustomDomain(e.target.value)} placeholder="mystore.com"                     className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 font-cairo text-sm text-text outline-none transition-colors focus:border-primary" />
              <p className="mt-2 font-cairo text-[10px] text-text-subtle">يمكنك ربط نطاقك الخاص أو الشراء من مسجلي النطاقات. اتركه فارغاً للاستمرار بالنطاق الافتراضي.</p>
            </div>
          </div>
        )}

        {/* ─────────── Step 6: Launch ─────────── */}
        {step === 6 && (
          <div className="text-center">
            <div className="mb-2">
              <span className="inline-block rounded-full bg-success-100 px-3 py-1 font-cairo text-xs font-bold text-success">الخطوة 7 — الأخيرة</span>
            </div>
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary-50 to-accent-50">
              <Rocket size={36} className="text-primary" />
            </div>
            <h1 className="mb-2 font-cairo text-2xl font-extrabold text-text">متجرك جاهز للإطلاق!</h1>
            <p className="mx-auto mb-8 max-w-md font-cairo text-sm text-text-muted">راجع ملخص إعدادات متجرك ثم انطلق</p>

            <div className="mx-auto mb-8 max-w-lg space-y-3 text-right">
              {[
                { icon: Store, label: 'اسم المتجر', value: storeName },
                { icon: Package, label: 'المجال', value: currentIndustry?.label },
                { icon: CreditCard, label: 'المحافظ', value: [kuraimi, oneCash, jaib].filter(Boolean).length + ' محفظة' },
                { icon: MapPin, label: 'الشحن', value: storeType === 'digital' ? 'غير مطلوب' : `${shippingFee} ريال` },
                { icon: Globe, label: 'النطاق', value: customDomain || 'افتراضي' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-bg-soft">
                    <item.icon size={16} className="text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-cairo text-xs text-text-muted">{item.label}</p>
                    <p className="font-cairo text-sm font-bold text-text">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {loading && (
              <div className="mx-auto max-w-md rounded-xl bg-primary-50 p-4 text-center">
                <div className="mx-auto mb-2 h-2 w-32 animate-pulse rounded-full bg-primary/30" />
                <p className="font-cairo text-sm font-bold text-primary">جاري إنشاء متجرك...</p>
              </div>
            )}
          </div>
        )}

        {/* ── Navigation ── */}
        {step < 7 && (
          <div className="mt-10 flex items-center justify-between border-t border-border pt-6">
            <button
              type="button"
              onClick={handleBack}
              disabled={step === 0 || loading}
              className="inline-flex items-center gap-1 rounded-lg border border-border px-4 py-2.5 font-cairo text-sm font-bold text-text-muted transition-colors hover:bg-bg-soft disabled:opacity-30"
            >
              <ChevronRight size={16} />
              السابق
            </button>

            <div className="flex items-center gap-2">
              {STEP_LABELS.map((_, i) => (
                <span key={i} className={`h-1.5 rounded-full transition-all ${i <= step ? 'w-5 bg-primary' : 'w-1.5 bg-border-strong'}`} />
              ))}
            </div>

            <button
              type="button"
              onClick={handleNext}
              disabled={loading}
              className="inline-flex items-center gap-1 rounded-lg bg-primary px-6 py-2.5 font-cairo text-sm font-bold text-white transition-colors hover:bg-primary-700 disabled:opacity-50"
            >
              {loading ? 'جاري...' : step === 6 ? 'إطلاق المتجر!' : 'التالي'}
              {!loading && <ChevronLeft size={16} />}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}