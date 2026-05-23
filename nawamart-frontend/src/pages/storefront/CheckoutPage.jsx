import { useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { getStoreBySlug } from '@/api/stores'
import { createOrder, uploadWaslFile } from '@/api/orders'
import { useCartStore } from '@/store/cartStore'
import Icon from '@/components/ui/Icon'

const WALLETS = [
  { id: 'cherry',  label: 'Cherry',        sub: 'محفظة إلكترونية' },
  { id: 'kuraimi', label: 'الكريمي',        sub: 'تطبيق بنك التضامن' },
  { id: 'onecash', label: 'OneCash',        sub: 'محفظة إلكترونية' },
]

export default function CheckoutPage() {
  const { slug }   = useParams()
  const navigate   = useNavigate()
  const items      = useCartStore(s => s.items)

  const [wallet,      setWallet]      = useState('cherry')
  const [waslFile,    setWaslFile]    = useState(null)
  const [waslPreview, setWaslPreview] = useState(null)
  const [form,        setForm]        = useState({ name: '', phone: '', city: 'صنعاء', address: '' })
  const [loading,     setLoading]     = useState(false)

  const clearCart = useCartStore(s => s.clearCart)

  function setField(key, val) { setForm(f => ({ ...f, [key]: val })) }

  // Can submit: wasl required always; address fields required for physical stores
  const canSubmit = Boolean(
    waslFile &&
    (!isDigital ? (form.name && form.phone && form.address) : true)
  )

  async function handleSubmit() {
    if (!canSubmit || loading) return
    setLoading(true)
    try {
      // 1. Upload wasl image first
      const fd = new FormData()
      fd.append('wasl', waslFile)
      const uploadRes = await uploadWaslFile(fd)
      const waslUrl   = uploadRes.data.data?.url ?? uploadRes.data.url

      // 2. Build order payload
      const orderPayload = {
        storeId:      store?._id,
        items: items.map(i => ({
          product:         i.product._id,
          quantity:        i.quantity,
          selectedOptions: i.selectedOptions,
          price:           i.product.price,
        })),
        paymentMethod: wallet,
        paymentWasl:   waslUrl,
        ...(isDigital ? {} : {
          deliveryAddress: {
            name:    form.name,
            phone:   form.phone,
            city:    form.city,
            address: form.address,
          },
          contactPhone: form.phone,
        }),
      }

      // 3. Create order
      const res = await createOrder(orderPayload)
      const orderId = res.data.data?._id ?? res.data.data?.id

      // 4. Clear cart and navigate to confirmation
      clearCart()
      navigate(`/store/${slug}/order/${orderId}`)
    } catch (err) {
      toast.error(err?.message ?? 'حدث خطأ، يرجى المحاولة مجدداً')
    } finally {
      setLoading(false)
    }
  }

  const { data: store } = useQuery({
    queryKey: ['store', slug],
    queryFn:  () => getStoreBySlug(slug).then(r => r.data.data),
    staleTime: 1000 * 60 * 5,
  })

  const isDigital = store?.type === 'digital'

  // Redirect to store if cart is empty
  if (items.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center" dir="rtl">
        <div className="w-16 h-16 rounded-2xl bg-bg-soft border border-border flex items-center justify-center mx-auto mb-4">
          <Icon name="cart" size={28} className="text-text-subtle" />
        </div>
        <h2 className="font-cairo font-bold text-xl text-text mb-2">السلة فارغة</h2>
        <p className="font-cairo text-sm text-text-muted mb-6">
          أضف منتجات للمتجر أولاً ثم عد لإتمام الطلب.
        </p>
        <Link
          to={`/store/${slug}`}
          className="inline-flex items-center gap-2 bg-primary text-white font-cairo font-semibold px-5 py-2.5 rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Icon name="arrow-right" size={16} />
          العودة للمتجر
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8" dir="rtl">

      {/* Back button */}
      <button
        onClick={() => navigate(`/store/${slug}`)}
        className="inline-flex items-center gap-2 text-sm text-text-muted font-cairo hover:text-primary transition-colors mb-6"
      >
        <Icon name="arrow-right" size={14} />
        العودة للتسوق
      </button>

      {/* Page title */}
      <div className="flex items-center gap-3 mb-8">
        <h1 className="font-cairo font-extrabold text-2xl text-text">إتمام الطلب</h1>
        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold font-cairo px-2.5 py-1 rounded-pill ${
          isDigital
            ? 'bg-accent-50 text-accent-700 border border-accent-200'
            : 'bg-primary-50 text-primary border border-primary-200'
        }`}>
          {isDigital ? <><Icon name="bolt" size={11} />تسليم فوري</> : <><Icon name="truck" size={11} />توصيل</>}
        </span>
      </div>

      {/* Two-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">

        {/* ── Main column ── */}
        <div className="flex flex-col gap-5">

          {/* Wallet selector */}
          <WalletSelector wallet={wallet} setWallet={setWallet} />

          {/* Wasl uploader */}
          <WaslUploader
            waslFile={waslFile}
            waslPreview={waslPreview}
            setWaslFile={setWaslFile}
            setWaslPreview={setWaslPreview}
          />

          {/* Address form / digital note */}
          {isDigital
            ? <DigitalNote />
            : <AddressForm form={form} setField={setField} />
          }

        </div>

        {/* ── Sidebar — order summary + submit ── */}
        <OrderSummary
          items={items}
          isDigital={isDigital}
          waslFile={waslFile}
          canSubmit={canSubmit}
          loading={loading}
          onSubmit={handleSubmit}
        />

      </div>
    </div>
  )
}

/* ─────────────────────────────────────────
   Order Summary sidebar
───────────────────────────────────────── */
function OrderSummary({ items, isDigital, waslFile, canSubmit, loading, onSubmit }) {
  const subtotal = items.reduce((s, i) => s + i.product.price * i.quantity, 0)
  const shipping = isDigital ? 0 : 1500
  const total    = subtotal + shipping

  return (
    <aside className="bg-white border border-border rounded-xl p-5 lg:sticky lg:top-20">
      <h3 className="font-cairo font-bold text-lg text-text mb-4">ملخص الطلب</h3>

      {/* Items */}
      <div className="flex flex-col gap-3 pb-4 mb-4 border-b border-border">
        {items.map((item) => (
          <div
            key={`${item.product._id}-${JSON.stringify(item.selectedOptions)}`}
            className="flex items-center gap-3"
          >
            {/* Thumb */}
            <div className="w-11 h-11 rounded-lg bg-bg-soft border border-border overflow-hidden shrink-0">
              {item.product.images?.[0] ? (
                <img
                  src={item.product.images[0]}
                  alt={item.product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Icon name="image" size={16} className="text-border-strong" />
                </div>
              )}
            </div>

            {/* Name + qty */}
            <div className="flex-1 min-w-0">
              <p className="font-cairo font-semibold text-[13px] text-text truncate">
                {item.product.name}
              </p>
              <p className="font-cairo text-xs text-text-muted">
                ×{item.quantity}
                {Object.values(item.selectedOptions || {}).length > 0 && (
                  <> · {Object.values(item.selectedOptions).join(', ')}</>
                )}
              </p>
            </div>

            {/* Line total */}
            <span className="font-inter font-bold text-sm text-text dk-num shrink-0">
              {(item.product.price * item.quantity).toLocaleString('en-US')}
            </span>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="flex flex-col gap-2 mb-5">
        <div className="flex justify-between font-cairo text-sm text-text-muted">
          <span>المجموع الفرعي</span>
          <span className="dk-num font-inter font-semibold text-text">
            {subtotal.toLocaleString('en-US')} ر.ي
          </span>
        </div>
        <div className="flex justify-between font-cairo text-sm text-text-muted">
          <span>{isDigital ? 'التسليم' : 'الشحن'}</span>
          <span className={isDigital ? 'text-success font-semibold' : 'dk-num font-inter font-semibold text-text'}>
            {isDigital ? 'مجاناً ⚡' : `${shipping.toLocaleString('en-US')} ر.ي`}
          </span>
        </div>
        <div className="flex justify-between font-cairo font-bold text-base text-text pt-2 border-t border-border">
          <span>الإجمالي</span>
          <span className="dk-num font-inter">
            {total.toLocaleString('en-US')} ر.ي
          </span>
        </div>
      </div>

      {/* Submit button */}
      <button
        onClick={onSubmit}
        disabled={!canSubmit || loading}
        className="w-full flex items-center justify-center gap-2 font-cairo font-bold text-[15px] py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-accent hover:bg-accent-700 text-white"
      >
        {loading ? (
          <>
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            جاري إرسال الطلب…
          </>
        ) : (
          <>
            تأكيد الطلب
            <Icon name="check" size={16} />
          </>
        )}
      </button>

      {/* Hint below button */}
      {!canSubmit && (
        <p className="font-cairo text-xs text-text-muted text-center mt-2">
          {!waslFile
            ? 'ارفع صورة الوصل أولاً لتفعيل الزر'
            : 'أكمل بيانات التوصيل لتفعيل الزر'}
        </p>
      )}

      <p className="font-cairo text-xs text-text-muted text-center mt-3">
        {isDigital
          ? 'سيراجع التاجر الوصل خلال دقائق وتفتح المحادثة فوراً.'
          : 'سيتواصل التاجر معك خلال 24 ساعة لتأكيد الطلب.'}
      </p>
    </aside>
  )
}

const CITIES = ['صنعاء','عدن','تعز','إب','الحديدة','المكلا','حضرموت','مأرب','ذمار','البيضاء','عمران','ريمة','الضالع','لحج','أبين','شبوة','الجوف','صعدة']

/* ─────────────────────────────────────────
   Address form (physical stores)
───────────────────────────────────────── */
function AddressForm({ form, setField }) {
  return (
    <div className="bg-white border border-border rounded-xl p-5">
      <h3 className="font-cairo font-bold text-lg text-text mb-4">معلومات التوصيل</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Full name */}
        <div className="flex flex-col gap-1.5">
          <label className="font-cairo text-sm font-semibold text-text">الاسم الكامل</label>
          <input
            value={form.name}
            onChange={e => setField('name', e.target.value)}
            placeholder="مثال: عبدالرحمن المقطري"
            className="w-full font-cairo text-[15px] px-3.5 py-2.5 rounded border border-border bg-white text-text placeholder:text-text-subtle outline-none focus:border-primary focus:shadow-focus transition-[border-color,box-shadow] duration-default"
          />
        </div>

        {/* Phone */}
        <div className="flex flex-col gap-1.5">
          <label className="font-cairo text-sm font-semibold text-text">رقم الجوال (واتساب)</label>
          <input
            value={form.phone}
            onChange={e => setField('phone', e.target.value)}
            placeholder="7XXXXXXXX"
            type="tel"
            dir="ltr"
            className="w-full font-cairo text-[15px] px-3.5 py-2.5 rounded border border-border bg-white text-text placeholder:text-text-subtle outline-none focus:border-primary focus:shadow-focus transition-[border-color,box-shadow] duration-default text-right"
          />
        </div>

        {/* City */}
        <div className="flex flex-col gap-1.5">
          <label className="font-cairo text-sm font-semibold text-text">المحافظة</label>
          <select
            value={form.city}
            onChange={e => setField('city', e.target.value)}
            className="w-full font-cairo text-[15px] px-3.5 py-2.5 rounded border border-border bg-white text-text outline-none focus:border-primary focus:shadow-focus transition-[border-color,box-shadow] duration-default"
          >
            {CITIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

        {/* Address detail */}
        <div className="flex flex-col gap-1.5">
          <label className="font-cairo text-sm font-semibold text-text">العنوان التفصيلي</label>
          <input
            value={form.address}
            onChange={e => setField('address', e.target.value)}
            placeholder="الحي، الشارع، علامة مميزة"
            className="w-full font-cairo text-[15px] px-3.5 py-2.5 rounded border border-border bg-white text-text placeholder:text-text-subtle outline-none focus:border-primary focus:shadow-focus transition-[border-color,box-shadow] duration-default"
          />
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────
   Digital info note
───────────────────────────────────────── */
function DigitalNote() {
  return (
    <div className="bg-accent-50 border border-accent-200 rounded-xl p-5 flex gap-4">
      <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center text-white shrink-0">
        <Icon name="msgs" size={20} />
      </div>
      <div>
        <p className="font-cairo font-bold text-sm text-text mb-1">ماذا يحدث بعد تأكيد الدفع؟</p>
        <p className="font-cairo text-sm text-text-muted leading-relaxed">
          فور مراجعة التاجر للوصل (عادةً خلال دقائق)، ستفتح{' '}
          <strong className="text-text">محادثة خاصة</strong> بينك وبين المتجر.
          يرسل لك التاجر بيانات المنتج (الحساب، الكود، أو الملف)،
          ثم تؤكد الاستلام داخل المحادثة.
        </p>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────
   وصل uploader
───────────────────────────────────────── */
function WaslUploader({ waslFile, waslPreview, setWaslFile, setWaslPreview }) {
  function handleFile(file) {
    if (!file) return
    setWaslFile(file)
    setWaslPreview(URL.createObjectURL(file))
  }

  function handleInputChange(e) {
    handleFile(e.target.files?.[0])
  }

  function handleDrop(e) {
    e.preventDefault()
    handleFile(e.dataTransfer.files?.[0])
  }

  function handleRemove() {
    if (waslPreview) URL.revokeObjectURL(waslPreview)
    setWaslFile(null)
    setWaslPreview(null)
  }

  return (
    <div className="bg-white border border-border rounded-xl p-5">
      <h3 className="font-cairo font-bold text-lg text-text mb-1">رفع صورة الوصل</h3>
      <p className="font-cairo text-sm text-text-muted mb-4">
        بعد التحويل، ارفع صورة أو لقطة شاشة للوصل.
      </p>

      {!waslFile ? (
        /* Drop zone */
        <label
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
          className="flex items-center gap-4 p-4 border-[1.5px] border-dashed border-border-strong rounded-xl cursor-pointer bg-bg hover:border-primary hover:bg-primary-50 transition-all group"
        >
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleInputChange}
          />
          <div className="w-11 h-11 rounded-lg bg-white border border-border flex items-center justify-center shrink-0 text-primary group-hover:border-primary transition-colors">
            <Icon name="upload" size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-cairo font-bold text-sm text-text">ارفع صورة الوصل</p>
            <p className="font-cairo text-xs text-text-muted">PNG أو JPG · حتى 5 ميجابايت · اسحب أو اضغط</p>
          </div>
          <span className="shrink-0 text-xs font-semibold font-cairo text-primary border border-primary-200 bg-primary-50 px-3 py-1.5 rounded-lg group-hover:bg-primary group-hover:text-white transition-colors">
            اختر ملف
          </span>
        </label>
      ) : (
        /* Preview */
        <div className="flex items-center gap-3 bg-success-100 border border-green-200 rounded-xl p-3">
          {/* Image thumbnail */}
          <div className="w-14 h-14 rounded-lg border border-border overflow-hidden shrink-0 bg-white">
            <img src={waslPreview} alt="الوصل" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-cairo font-semibold text-sm text-text truncate">{waslFile.name}</p>
            <p className="font-cairo text-xs text-success">
              {(waslFile.size / 1024 / 1024).toFixed(1)} ميجابايت · تم الرفع ✓
            </p>
          </div>
          <button
            onClick={handleRemove}
            className="w-7 h-7 rounded-full flex items-center justify-center text-text-muted hover:text-danger hover:bg-white transition-colors"
            aria-label="إزالة"
          >
            <Icon name="x" size={16} />
          </button>
        </div>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────
   Wallet selector
───────────────────────────────────────── */
function WalletSelector({ wallet, setWallet }) {
  const subtotal = useCartStore(s => s.items.reduce((n, i) => n + i.product.price * i.quantity, 0))

  const walletLabel = WALLETS.find(w => w.id === wallet)?.label ?? ''

  return (
    <div className="bg-white border border-border rounded-xl p-5">
      <h3 className="font-cairo font-bold text-lg text-text mb-1">طريقة الدفع</h3>
      <p className="font-cairo text-sm text-text-muted mb-4">
        اختر المحفظة، حوّل المبلغ{' '}
        <strong className="text-primary dk-num font-inter">
          {subtotal.toLocaleString('en-US')} ر.ي
        </strong>
        ، ثم ارفع صورة الوصل.
      </p>

      {/* Wallet cards */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {WALLETS.map(w => {
          const active = wallet === w.id
          return (
            <button
              key={w.id}
              onClick={() => setWallet(w.id)}
              className={`flex flex-col gap-2 p-3 rounded-xl border text-start transition-all ${
                active
                  ? 'bg-primary-50 border-primary shadow-focus'
                  : 'bg-white border-border hover:border-primary-300'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                active ? 'bg-primary text-white' : 'bg-bg-soft text-text-muted'
              }`}>
                <Icon name="credit" size={15} />
              </div>
              <span className={`font-cairo font-bold text-sm ${active ? 'text-primary' : 'text-text'}`}>
                {w.label}
              </span>
              <span className="font-cairo text-[11px] text-text-muted leading-tight">{w.sub}</span>
            </button>
          )
        })}
      </div>

      {/* Account info box */}
      <div className="bg-primary-50 rounded-lg px-4 py-3 flex flex-col gap-1.5 text-sm font-cairo">
        <div>
          <span className="text-text-muted">المحفظة: </span>
          <span className="font-semibold text-text">{walletLabel}</span>
        </div>
        <div>
          <span className="text-text-muted">رقم الحساب: </span>
          <span className="font-inter font-bold text-primary dk-num">771 423 890</span>
        </div>
        <div>
          <span className="text-text-muted">باسم: </span>
          <span className="font-semibold text-text">عبدالملك المختار</span>
        </div>
      </div>
    </div>
  )
}
