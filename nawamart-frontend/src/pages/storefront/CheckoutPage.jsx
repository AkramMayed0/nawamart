import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { ArrowLeft, CheckCircle2, CreditCard, ImageIcon, MapPin, MessageSquare, ShieldCheck, Upload, X, MessageCircle, Send, Instagram, Phone, Navigation } from 'lucide-react'
import { getStoreBySlug } from '@/api/stores'
import { createOrder, uploadWaslFile } from '@/api/orders'
import { getProductPrice, useCartStore } from '@/store/cartStore'
import { useAuthStore } from '@/store/authStore'
import usePageTitle from '@/hooks/usePageTitle'
import { resolveAssetUrl } from '@/utils/assets'
import WalletBadge from '@/components/storefront/WalletBadge'

const WALLETS = [
  { id: 'kuraimi', label: 'الكريمي',  sub: 'تحويل بنكي أو محفظة' },
  { id: 'oneCash', label: 'OneCash',  sub: 'محفظة إلكترونية' },
  { id: 'jaib',    label: 'جيب',      sub: 'محفظة جيب' },
]

const CITIES = ['صنعاء', 'عدن', 'تعز', 'إب', 'الحديدة', 'المكلا', 'حضرموت', 'مأرب', 'ذمار', 'البيضاء', 'عمران', 'ريمة', 'الضالع', 'لحج', 'أبين', 'شبوة', 'الجوف', 'صعدة']

const CONTACT_METHODS = [
  { id: 'whatsapp', label: 'واتساب', icon: MessageCircle },
  { id: 'telegram', label: 'تيليجرام', icon: Send },
  { id: 'instagram', label: 'انستقرام', icon: Instagram },
  { id: 'phone', label: 'اتصال هاتفي', icon: Phone },
]

function formatPrice(value) {
  return (value ?? 0).toLocaleString('en-US')
}

export default function CheckoutPage() {
  usePageTitle('إتمام الطلب')
  const { slug } = useParams()
  const navigate = useNavigate()
  const token = useAuthStore((state) => state.token)
  const user = useAuthStore((state) => state.user)
  const items = useCartStore((state) => state.items)
  const clearCart = useCartStore((state) => state.clearCart)

  // Require customer authentication to checkout
  if (!token || user?.role !== 'customer') {
    return (
      <section className="mx-auto max-w-3xl px-4 py-20 text-center" dir="rtl">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-xl border border-border bg-white text-primary shadow-sm">
          <CreditCard size={34} />
        </div>
        <h1 className="mt-5 font-cairo text-2xl font-extrabold text-text">تسجيل الدخول مطلوب</h1>
        <p className="mx-auto mt-2 max-w-md font-cairo text-sm leading-7 text-text-muted">
          يجب تسجيل الدخول كعميل أولاً لتتمكن من إتمام الطلب.
        </p>
        <Link
          to={`/customer/login?redirect=${encodeURIComponent(`/store/${slug}/checkout`)}`}
          className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 font-cairo text-sm font-extrabold text-white transition-colors hover:bg-primary-700"
        >
          تسجيل الدخول
        </Link>
        <Link
          to={`/store/${slug}`}
          className="mt-3 inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-border bg-white px-5 font-cairo text-sm font-extrabold text-text-muted transition-colors hover:border-primary hover:text-primary mr-3"
        >
          العودة للتسوق
        </Link>
      </section>
    )
  }

  const [wallet, setWallet] = useState('kuraimi')
  const [waslFile, setWaslFile] = useState(null)
  const [waslPreview, setWaslPreview] = useState(null)
  const [form, setForm] = useState({ name: '', phone: '', city: 'صنعاء', address: '' })
  const [contactMethod, setContactMethod] = useState('whatsapp')
  const [contactHandle, setContactHandle] = useState('')
  const [loading, setLoading] = useState(false)
  const [location, setLocation] = useState(null)
  const [locationLoading, setLocationLoading] = useState(false)

  function getLocation() {
    if (!navigator.geolocation) {
      toast.error('ميزة تحديد الموقع غير مدعومة في متصفحك')
      return
    }
    setLocationLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setLocationLoading(false)
        toast.success('تم تحديد موقعك بنجاح')
      },
      () => {
        setLocationLoading(false)
        toast.error('تعذر تحديد الموقع. تأكد من تفعيل خدمة الموقع في جهازك.')
      },
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }

  const { data: store } = useQuery({
    queryKey: ['store', slug],
    queryFn: () => getStoreBySlug(slug).then((response) => response.data.data),
    staleTime: 1000 * 60 * 5,
  })

  const isDigital = store?.type === 'digital'
  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + getProductPrice(item.product) * item.quantity, 0),
    [items]
  )
  // Calculate shipping based on store's per-city fees
  const shipping = useMemo(() => {
    if (isDigital || subtotal === 0) return 0
    const cityFee = store?.shippingFees?.find((sf) => sf.city === form.city)
    return cityFee?.fee ?? 0
  }, [isDigital, subtotal, store?.shippingFees, form.city])
  const total = subtotal + shipping

  const isBusiness = store?.plan === 'business'

  const canSubmit = Boolean(
    store?._id &&
    items.length > 0 &&
    waslFile &&
    form.name.trim() &&
    form.phone.trim() &&
    form.city.trim() &&
    (isDigital || form.address.trim())
  )

  function setField(key, value) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  async function handleSubmit() {
    if (!canSubmit || loading) return

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('wasl', waslFile)
      const uploadRes = await uploadWaslFile(formData)
      const waslUrl = uploadRes.data.data?.url ?? uploadRes.data.url

      const payload = {
        storeId: store._id,
        items: items.map((item) => ({
          product: item.product._id,
          quantity: item.quantity,
          selectedOptions: item.selectedOptions,
          price: getProductPrice(item.product),
        })),
        paymentMethod: wallet,
        paymentWasl: waslUrl,
        deliveryAddress: {
          name: form.name.trim(),
          phone: form.phone.trim(),
          city: form.city,
          details: isDigital ? 'تسليم رقمي عبر ' + CONTACT_METHODS.find(m => m.id === contactMethod)?.label : form.address.trim(),
          location: isDigital ? undefined : location,
        },
        contactMethod: isDigital ? contactMethod : undefined,
        contactHandle: isDigital && contactHandle.trim() ? contactHandle.trim() : undefined,
        notes: isDigital ? 'طلب رقمي' : null,
      }

      const res = await createOrder(payload)
      const orderId = res.data.data?._id ?? res.data.data?.id

      clearCart()
      toast.success('تم إنشاء الطلب بنجاح')
      navigate(`/store/${slug}/order/${orderId}`)
    } catch (error) {
      const message = error?.response?.data?.message || error?.message || 'حدث خطأ، يرجى المحاولة مرة أخرى'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-20 text-center" dir="rtl">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-xl border border-border bg-white text-primary shadow-sm">
          <CreditCard size={34} />
        </div>
        <h1 className="mt-5 font-cairo text-2xl font-extrabold text-text">لا يوجد طلب للدفع</h1>
        <p className="mx-auto mt-2 max-w-md font-cairo text-sm leading-7 text-text-muted">
          أضف منتجات إلى السلة أولا، ثم انتقل للدفع من صفحة السلة.
        </p>
        <Link
          to={`/store/${slug}`}
          className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 font-cairo text-sm font-extrabold text-white transition-colors hover:bg-primary-700"
        >
          العودة للتسوق
          <ArrowLeft size={16} />
        </Link>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-8" dir="rtl">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-cairo text-sm font-bold text-primary">الدفع الآمن</p>
          <h1 className="mt-1 font-cairo text-3xl font-extrabold text-text">إتمام الطلب</h1>
          <p className="mt-2 font-cairo text-sm text-text-muted">
            ارفع وصل الدفع وأكمل بيانات التواصل ليصل الطلب للتاجر مباشرة.
          </p>
        </div>
        <Link
          to={`/store/${slug}/cart`}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-white px-4 font-cairo text-sm font-extrabold text-text-muted transition-colors hover:border-primary hover:text-primary"
        >
          العودة للسلة
          <ArrowLeft size={15} />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          <WalletSelector wallet={wallet} setWallet={setWallet} store={store} total={total} />
          <WaslUploader
            waslFile={waslFile}
            waslPreview={waslPreview}
            setWaslFile={setWaslFile}
            setWaslPreview={setWaslPreview}
          />
          <ContactForm form={form} setField={setField} isDigital={isDigital} isBusiness={isBusiness} location={location} locationLoading={locationLoading} getLocation={getLocation} contactMethod={contactMethod} setContactMethod={setContactMethod} contactHandle={contactHandle} setContactHandle={setContactHandle} />
          {isDigital && <DigitalNote />}
        </div>

        <OrderSummary
          items={items}
          isDigital={isDigital}
          subtotal={subtotal}
          shipping={shipping}
          total={total}
          canSubmit={canSubmit}
          loading={loading}
          onSubmit={handleSubmit}
          hasWasl={Boolean(waslFile)}
        />
      </div>
    </section>
  )
}

function WalletSelector({ wallet, setWallet, store, total }) {
  const activeWallet = WALLETS.find((item) => item.id === wallet)
  const accountNumber = store?.paymentAccounts?.[wallet]

  return (
    <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary">
          <CreditCard size={20} />
        </div>
        <div>
          <h2 className="font-cairo text-lg font-extrabold text-text">طريقة الدفع</h2>
          <p className="font-cairo text-sm text-text-muted">حوّل المبلغ ثم ارفع صورة الوصل.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {WALLETS.map((item) => {
          const active = wallet === item.id
          return (
            <button
              type="button"
              key={item.id}
              onClick={() => setWallet(item.id)}
              className={`rounded-lg border p-4 text-start transition-colors ${
                active ? 'border-primary bg-primary-50 shadow-focus' : 'border-border bg-white hover:border-primary'
              }`}
            >
              <WalletBadge wallet={item.id} active={active} compact />
              <p className={`mt-3 font-cairo text-sm font-extrabold ${active ? 'text-primary' : 'text-text'}`}>{item.label}</p>
              <p className="mt-1 font-cairo text-xs text-text-muted">{item.sub}</p>
            </button>
          )
        })}
      </div>

      <div className="mt-4 rounded-lg bg-bg p-4">
        <div className="flex flex-col gap-2 font-cairo text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-text-muted">المحفظة</span>
            <span className="font-extrabold text-text">{activeWallet?.label}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-text-muted">المبلغ المطلوب</span>
            <span className="font-inter font-extrabold text-primary">{formatPrice(total)} ر.ي</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-text-muted">رقم الحساب</span>
            <span className="font-inter font-extrabold text-text">{accountNumber || 'لم يضف التاجر رقما بعد'}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-text-muted">رقم التواصل</span>
            <span className="font-inter font-extrabold text-text">{store?.contactPhone || 'غير مضاف'}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function WaslUploader({ waslFile, waslPreview, setWaslFile, setWaslPreview }) {
  function handleFile(file) {
    if (!file) return
    setWaslFile(file)
    setWaslPreview(URL.createObjectURL(file))
  }

  function handleRemove() {
    if (waslPreview) URL.revokeObjectURL(waslPreview)
    setWaslFile(null)
    setWaslPreview(null)
  }

  return (
    <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-50 text-accent-700">
          <Upload size={20} />
        </div>
        <div>
          <h2 className="font-cairo text-lg font-extrabold text-text">صورة الوصل</h2>
          <p className="font-cairo text-sm text-text-muted">PNG أو JPG أو WEBP، حتى 10 ميجابايت.</p>
        </div>
      </div>

      {!waslFile ? (
        <label
          onDrop={(event) => {
            event.preventDefault()
            handleFile(event.dataTransfer.files?.[0])
          }}
          onDragOver={(event) => event.preventDefault()}
          className="flex cursor-pointer items-center gap-4 rounded-xl border border-dashed border-border-strong bg-bg p-5 transition-colors hover:border-primary hover:bg-primary-50"
        >
          <input type="file" accept="image/*" className="hidden" onChange={(event) => handleFile(event.target.files?.[0])} />
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white text-primary shadow-sm">
            <ImageIcon size={22} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-cairo text-sm font-extrabold text-text">اختر صورة أو اسحبها هنا</p>
            <p className="mt-1 font-cairo text-xs text-text-muted">سيتم إرسال الوصل للتاجر للمراجعة.</p>
          </div>
          <span className="rounded-lg bg-primary px-4 py-2 font-cairo text-xs font-extrabold text-white">اختيار ملف</span>
        </label>
      ) : (
        <div className="flex items-center gap-3 rounded-xl border border-success-100 bg-success-100 p-3">
          <div className="h-16 w-16 overflow-hidden rounded-lg border border-border bg-white">
            <img src={waslPreview} alt="وصل الدفع" className="h-full w-full object-cover" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-cairo text-sm font-extrabold text-text">{waslFile.name}</p>
            <p className="mt-1 font-cairo text-xs font-bold text-success-dark">تم اختيار الصورة</p>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-text-muted transition-colors hover:text-danger"
            aria-label="إزالة الوصل"
          >
            <X size={17} />
          </button>
        </div>
      )}
    </div>
  )
}

function ContactForm({ form, setField, isDigital, isBusiness, location, locationLoading, getLocation, contactMethod, setContactMethod, contactHandle, setContactHandle }) {
  return (
    <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
      <h2 className="font-cairo text-lg font-extrabold text-text">بيانات العميل</h2>
      <p className="mt-1 font-cairo text-sm text-text-muted">
        {isDigital ? 'اختر طريقة التواصل المفضلة ليتم تسليم المنتج الرقمي.' : 'هذه البيانات مطلوبة لتأكيد الطلب والتوصيل.'}
      </p>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="الاسم الكامل" value={form.name} onChange={(value) => setField('name', value)} placeholder="مثال: عبدالرحمن" />
        <Field label="رقم الجوال" value={form.phone} onChange={(value) => setField('phone', value)} placeholder="7XXXXXXXX" dir="ltr" type="tel" />
        <label className="flex flex-col gap-1.5">
          <span className="font-cairo text-sm font-extrabold text-text">المحافظة</span>
          <select
            value={form.city}
            onChange={(event) => setField('city', event.target.value)}
            className="h-11 rounded-lg border border-border bg-white px-3 font-cairo text-sm text-text outline-none transition-colors focus:border-primary"
          >
            {CITIES.map((city) => <option key={city}>{city}</option>)}
          </select>
        </label>
        <Field
          label={isDigital ? 'ملاحظة اختيارية' : 'العنوان التفصيلي'}
          value={form.address}
          onChange={(value) => setField('address', value)}
          placeholder={isDigital ? 'مثال: أرسلوا الكود على واتساب' : 'الحي، الشارع، علامة مميزة'}
          required={!isDigital}
        />
      </div>

      {!isDigital && isBusiness && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-cairo text-sm font-extrabold text-text">الموقع على الخريطة</span>
            {location && (
              <span className="font-cairo text-xs text-success flex items-center gap-1">
                <MapPin size={12} /> تم التحديد
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={getLocation}
            disabled={locationLoading}
            className={`w-full flex items-center justify-center gap-2 h-11 rounded-lg border-2 font-cairo text-sm font-bold transition-colors ${
              location
                ? 'border-success bg-success-50 text-success'
                : 'border-dashed border-border-strong bg-bg text-text-muted hover:border-primary hover:text-primary'
            } disabled:opacity-50`}
          >
            {locationLoading ? (
              <>جاري تحديد الموقع...</>
            ) : location ? (
              <>
                <MapPin size={16} />
                {location.lat.toFixed(4)}, {location.lng.toFixed(4)} — تغيير الموقع
              </>
            ) : (
              <>
                <Navigation size={16} />
                تحديد موقعي الحالي
              </>
            )}
          </button>
          {location && (
            <a
              href={`https://www.google.com/maps?q=${location.lat},${location.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1 font-cairo text-xs text-primary hover:underline"
            >
              <MapPin size={12} /> عرض على خرائط Google
            </a>
          )}
        </div>
      )}

      {isDigital && (
        <div className="mt-5 border-t border-border pt-5">
          <h3 className="font-cairo text-base font-extrabold text-text mb-1">طريقة التسليم المفضلة</h3>
          <p className="font-cairo text-sm text-text-muted mb-4">سيتم تسليم المنتج الرقمي عبر:</p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {CONTACT_METHODS.map(m => {
              const active = contactMethod === m.id
              const Icon = m.icon
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setContactMethod(m.id)}
                  className={`flex flex-col items-center gap-1.5 rounded-lg border p-3 transition-colors ${
                    active
                      ? 'border-primary bg-primary-50 text-primary'
                      : 'border-border bg-white text-text-muted hover:border-primary hover:text-primary'
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-cairo text-xs font-semibold">{m.label}</span>
                </button>
              )
            })}
          </div>

          {contactMethod === 'instagram' && (
            <div className="mt-3">
              <Field
                label="اسم المستخدم في انستقرام"
                value={contactHandle}
                onChange={(value) => setContactHandle(value)}
                placeholder="مثال: @user_name"
                dir="ltr"
              />
            </div>
          )}
          {contactMethod === 'telegram' && (
            <div className="mt-3">
              <Field
                label="اسم المستخدم في تيليجرام"
                value={contactHandle}
                onChange={(value) => setContactHandle(value)}
                placeholder="مثال: @username"
                dir="ltr"
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function Field({ label, value, onChange, placeholder, type = 'text', dir = 'rtl' }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="font-cairo text-sm font-extrabold text-text">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        type={type}
        dir={dir}
        className="h-11 rounded-lg border border-border bg-white px-3 font-cairo text-sm text-text outline-none transition-colors placeholder:text-text-subtle focus:border-primary"
      />
    </label>
  )
}

function DigitalNote() {
  return (
    <div className="flex gap-4 rounded-xl border border-info-100 bg-info-100 p-5">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-info text-white">
        <MessageSquare size={20} />
      </div>
      <div>
        <p className="font-cairo text-sm font-extrabold text-text">بعد تأكيد الدفع</p>
        <p className="mt-1 font-cairo text-sm leading-7 text-text-muted">
          سيراجع التاجر الوصل، ثم يتابع مع العميل عبر المحادثة لتسليم الكود أو الملف أو بيانات المنتج الرقمي.
        </p>
      </div>
    </div>
  )
}

function OrderSummary({ items, isDigital, subtotal, shipping, total, canSubmit, loading, onSubmit, hasWasl }) {
  return (
    <aside className="h-fit rounded-xl border border-border bg-white p-5 shadow-sm lg:sticky lg:top-28">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary">
          <ShieldCheck size={20} />
        </div>
        <div>
          <h2 className="font-cairo text-lg font-extrabold text-text">ملخص الطلب</h2>
          <p className="font-cairo text-xs font-semibold text-text-muted">سيظهر للتاجر بعد الإرسال مباشرة.</p>
        </div>
      </div>

      <div className="mb-4 max-h-80 space-y-3 overflow-auto border-b border-border pb-4">
        {items.map((item) => (
          <div key={`${item.product._id}-${JSON.stringify(item.selectedOptions || {})}`} className="flex gap-3">
            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-border bg-bg-soft">
              {item.product.images?.[0] ? (
                <img src={resolveAssetUrl(item.product.images[0])} alt={item.product.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-primary">
                  <CreditCard size={17} />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-cairo text-sm font-extrabold text-text">{item.product.name}</p>
              <p className="mt-1 font-cairo text-xs text-text-muted">الكمية: {item.quantity.toLocaleString('en-US')}</p>
            </div>
            <span className="font-inter text-sm font-extrabold text-text">
              {formatPrice(getProductPrice(item.product) * item.quantity)}
            </span>
          </div>
        ))}
      </div>

      <div className="space-y-3 border-b border-border pb-4">
        <div className="flex justify-between font-cairo text-sm text-text-muted">
          <span>المجموع الفرعي</span>
          <span className="font-inter font-bold text-text">{formatPrice(subtotal)} ر.ي</span>
        </div>
        <div className="flex justify-between font-cairo text-sm text-text-muted">
          <span>{isDigital ? 'التسليم' : 'الشحن'}</span>
          <span className={isDigital ? 'font-bold text-success-dark' : 'font-inter font-bold text-text'}>
            {isDigital ? 'مجانا' : shipping > 0 ? `${formatPrice(shipping)} ر.ي` : 'مجاني'}
          </span>
        </div>
        <div className="flex justify-between pt-2 font-cairo text-base font-extrabold text-text">
          <span>الإجمالي</span>
          <span className="font-inter">{formatPrice(total)} ر.ي</span>
        </div>
      </div>

      <button
        type="button"
        onClick={onSubmit}
        disabled={!canSubmit || loading}
        className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-accent font-cairo text-sm font-extrabold text-white transition-colors hover:bg-accent-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? 'جاري إرسال الطلب...' : 'تأكيد الطلب'}
        {!loading && <CheckCircle2 size={17} />}
      </button>

      {!canSubmit && (
        <p className="mt-3 text-center font-cairo text-xs leading-6 text-text-muted">
          {!hasWasl ? 'ارفع صورة الوصل لتفعيل زر التأكيد.' : 'أكمل بيانات العميل المطلوبة لتأكيد الطلب.'}
        </p>
      )}
    </aside>
  )
}
