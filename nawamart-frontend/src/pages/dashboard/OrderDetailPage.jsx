import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  getOrderById, confirmOrder, rejectOrder, shipOrder, deliverOrder,
  processOrder, cancelOrder, returnOrder, fulfillOrder, getFulfillments,
  capturePayment, refundOrder, addOrderNote, getOrderNotes,
  editOrder, generatePackingSlip,
} from '@/api/orders'
import { resolveAssetUrl } from '@/utils/assets'
import { useAuthStore } from '@/store/authStore'
import usePageTitle from '@/hooks/usePageTitle'
import Icon, { StatusBadge } from '@/components/ui/Icon'
import {
  ArrowRight, Phone, Copy, Printer, Check, X, Truck, CheckCircle,
  Clock, User, MapPin, Package, CreditCard, MessageCircle, Send,
  Instagram, Phone as PhoneIcon, Crown, Edit, RotateCcw, Ban,
  FileText, ClipboardList, StickyNote, DollarSign,
} from 'lucide-react'
import { useState, useCallback } from 'react'

const CONTACT_META = {
  whatsapp:  { label: 'واتساب',  icon: MessageCircle, cls: 'bg-green-100 text-green-600 hover:bg-green-200',      url: (h, p) => `https://wa.me/${(h || p).replace(/[^0-9]/g, '')}` },
  telegram:  { label: 'تيليجرام', icon: Send,         cls: 'bg-sky-100 text-blue-500 hover:bg-sky-200',          url: (h) => `https://t.me/${(h || '').replace('@', '')}` },
  instagram: { label: 'انستقرام', icon: Instagram,    cls: 'bg-pink-100 text-pink-600 hover:bg-pink-200',        url: (h) => `https://www.instagram.com/direct/t/${(h || '').replace('@', '')}` },
  phone:     { label: 'اتصال',    icon: PhoneIcon,    cls: 'bg-primary-50 text-primary hover:bg-primary-100',     url: (h) => `tel:${h}` },
}

export default function OrderDetailPage() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const storeRaw = useAuthStore(s => s.store)
  const store = Array.isArray(storeRaw) ? storeRaw[0] : storeRaw
  const plan = store?.plan || 'starter'

  usePageTitle('تفاصيل الطلب')

  // Modal states
  const [rejectOpen, setRejectOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [cancelOpen, setCancelOpen] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [returnOpen, setReturnOpen] = useState(false)
  const [returnReason, setReturnReason] = useState('')
  const [fulfillOpen, setFulfillOpen] = useState(false)
  const [noteOpen, setNoteOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [refundOpen, setRefundOpen] = useState(false)

  // Fulfill form
  const [fulfillItems, setFulfillItems] = useState([])
  const [fulfillCarrier, setFulfillCarrier] = useState('')
  const [fulfillTracking, setFulfillTracking] = useState('')
  const [fulfillTrackingUrl, setFulfillTrackingUrl] = useState('')
  const [fulfillNotes, setFulfillNotes] = useState('')

  // Note form
  const [noteContent, setNoteContent] = useState('')
  const [noteInternal, setNoteInternal] = useState(false)

  // Edit form
  const [editNotes, setEditNotes] = useState('')
  const [editShippingFee, setEditShippingFee] = useState(0)

  // Refund form
  const [refundAmount, setRefundAmount] = useState(0)
  const [refundReasonText, setRefundReasonText] = useState('')

  const { data: order, isLoading, isError } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => getOrderById(orderId).then(r => r.data.data),
    retry: false,
  })

  const { data: fulfillmentsData } = useQuery({
    queryKey: ['order-fulfillments', orderId],
    queryFn: () => getFulfillments(orderId).then(r => r.data.data),
    enabled: !!order,
  })

  const { data: notesData } = useQuery({
    queryKey: ['order-notes', orderId],
    queryFn: () => getOrderNotes(orderId, { includeInternal: 'true' }).then(r => r.data.data),
    enabled: !!order,
  })

  const fulfillments = fulfillmentsData ?? []
  const notes = notesData ?? []

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ['order', orderId] })
    queryClient.invalidateQueries({ queryKey: ['merchant-orders'] })
    queryClient.invalidateQueries({ queryKey: ['order-fulfillments', orderId] })
    queryClient.invalidateQueries({ queryKey: ['order-notes', orderId] })
  }

  // Mutations
  const confirmMut = useMutation({
    mutationFn: () => confirmOrder(orderId),
    onSuccess: () => { toast.success('تم تأكيد الطلب ✓'); invalidate() },
    onError:   (e) => toast.error(e?.response?.data?.message ?? 'فشل التأكيد'),
  })

  const rejectMut = useMutation({
    mutationFn: () => rejectOrder(orderId, rejectReason),
    onSuccess: () => { toast.success('تم رفض الطلب'); setRejectOpen(false); setRejectReason(''); invalidate() },
    onError:   (e) => toast.error(e?.response?.data?.message ?? 'فشل الرفض'),
  })

  const shipMut = useMutation({
    mutationFn: () => shipOrder(orderId, ''),
    onSuccess: () => { toast.success('تم تحديث الحالة إلى "تم الشحن"'); invalidate() },
    onError:   (e) => toast.error(e?.response?.data?.message ?? 'فشل التحديث'),
  })

  const deliverMut = useMutation({
    mutationFn: () => deliverOrder(orderId),
    onSuccess: () => { toast.success('تم تحديث الحالة إلى "تم التسليم"'); invalidate() },
    onError:   (e) => toast.error(e?.response?.data?.message ?? 'فشل التحديث'),
  })

  const processMut = useMutation({
    mutationFn: () => processOrder(orderId),
    onSuccess: () => { toast.success('تم تحديث الحالة إلى قيد المعالجة'); invalidate() },
    onError:   (e) => toast.error(e?.response?.data?.message ?? 'فشل التحديث'),
  })

  const cancelMut = useMutation({
    mutationFn: () => cancelOrder(orderId, cancelReason),
    onSuccess: () => { toast.success('تم إلغاء الطلب'); setCancelOpen(false); setCancelReason(''); invalidate() },
    onError:   (e) => toast.error(e?.response?.data?.message ?? 'فشل الإلغاء'),
  })

  const returnMut = useMutation({
    mutationFn: () => returnOrder(orderId, returnReason),
    onSuccess: () => { toast.success('تم إرجاع الطلب'); setReturnOpen(false); setReturnReason(''); invalidate() },
    onError:   (e) => toast.error(e?.response?.data?.message ?? 'فشل الإرجاع'),
  })

  const fulfillMut = useMutation({
    mutationFn: () => fulfillOrder(orderId, {
      items: fulfillItems,
      carrier: fulfillCarrier || undefined,
      trackingNumber: fulfillTracking || undefined,
      trackingUrl: fulfillTrackingUrl || undefined,
      notes: fulfillNotes || undefined,
    }),
    onSuccess: () => {
      toast.success('تم تنفيذ الشحنة'); setFulfillOpen(false); resetFulfillForm(); invalidate()
    },
    onError: (e) => toast.error(e?.response?.data?.message ?? 'فشل التنفيذ'),
  })

  const captureMut = useMutation({
    mutationFn: () => capturePayment(orderId),
    onSuccess: () => { toast.success('تم تأكيد الدفع'); invalidate() },
    onError: (e) => toast.error(e?.response?.data?.message ?? 'فشل تأكيد الدفع'),
  })

  const refundMut = useMutation({
    mutationFn: () => refundOrder(orderId, { amount: refundAmount, reason: refundReasonText }),
    onSuccess: () => { toast.success('تم تسجيل الاسترداد'); setRefundOpen(false); setRefundAmount(0); setRefundReasonText(''); invalidate() },
    onError: (e) => toast.error(e?.response?.data?.message ?? 'فشل الاسترداد'),
  })

  const noteMut = useMutation({
    mutationFn: () => addOrderNote(orderId, { content: noteContent, isInternal: noteInternal }),
    onSuccess: () => { toast.success('تمت إضافة الملاحظة'); setNoteOpen(false); setNoteContent(''); setNoteInternal(false); invalidate() },
    onError: (e) => toast.error(e?.response?.data?.message ?? 'فشل إضافة الملاحظة'),
  })

  const editMut = useMutation({
    mutationFn: () => editOrder(orderId, { notes: editNotes || undefined, shippingFee: editShippingFee }),
    onSuccess: () => { toast.success('تم تعديل الطلب'); setEditOpen(false); invalidate() },
    onError: (e) => toast.error(e?.response?.data?.message ?? 'فشل التعديل'),
  })

  const packingSlipMut = useMutation({
    mutationFn: () => generatePackingSlip(orderId),
    onSuccess: () => { toast.success('تم إنشاء فاتورة التعبئة'); invalidate() },
    onError: (e) => toast.error(e?.response?.data?.message ?? 'فشل إنشاء الفاتورة'),
  })

  function resetFulfillForm() {
    setFulfillItems([])
    setFulfillCarrier('')
    setFulfillTracking('')
    setFulfillTrackingUrl('')
    setFulfillNotes('')
  }

  function openFulfill() {
    if (order?.items) {
      setFulfillItems(order.items.map(i => ({ product: i.product?._id || i.product, name: i.product?.name || i.name, quantity: i.quantity })))
    }
    setFulfillOpen(true)
  }

  function openEdit() {
    setEditNotes(order?.notes ?? '')
    setEditShippingFee(order?.shippingFee ?? 0)
    setEditOpen(true)
  }

  if (isLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto" dir="rtl">
        <div className="animate-pulse flex flex-col gap-5">
          <div className="h-6 bg-bg-soft rounded w-48" />
          <div className="h-32 bg-bg-soft rounded-xl" />
          <div className="h-48 bg-bg-soft rounded-xl" />
          <div className="h-32 bg-bg-soft rounded-xl" />
        </div>
      </div>
    )
  }

  if (isError || !order) {
    return (
      <div className="p-6 max-w-4xl mx-auto text-center" dir="rtl">
        <div className="w-14 h-14 rounded-2xl bg-danger-100 flex items-center justify-center mx-auto mb-4">
          <X size={24} className="text-danger" />
        </div>
        <h2 className="font-cairo font-bold text-xl text-text mb-2">تعذّر تحميل بيانات الطلب</h2>
        <p className="font-cairo text-sm text-text-muted mb-6">تحقق من رابط الطلب أو حاول مجدداً.</p>
        <button onClick={() => navigate('/dashboard/orders')}
          className="inline-flex items-center gap-2 bg-primary text-white font-cairo font-semibold px-5 py-2.5 rounded-lg hover:bg-primary-700 transition-colors"
        >
          <ArrowRight size={16} />
          العودة للطلبات
        </button>
      </div>
    )
  }

  const isDigital = order.store?.type === 'digital'
  const shortId   = String(order._id).slice(-8).toUpperCase()
  const total     = order.items?.reduce((s, i) => s + (i.price ?? 0) * i.quantity, 0) ?? 0
  const shipping  = isDigital ? 0 : (order.shippingFee ?? 0)
  const customerPhone = order.deliveryAddress?.phone ?? order.customer?.phone ?? ''
  const customerName  = order.deliveryAddress?.name ?? order.customer?.name ?? 'عميل'
  const customerEmail = order.customer?.email ?? ''
  const createdAt     = order.createdAt ? new Date(order.createdAt).toLocaleString('ar-YE') : ''
  const updatedAt     = order.updatedAt ? new Date(order.updatedAt).toLocaleString('ar-YE') : ''

  // Status action availability
  const canReview   = order.status === 'pending' || order.status === 'payment_under_review'
  const canShip     = !isDigital && order.status === 'confirmed'
  const canDeliver  = !isDigital && order.status === 'shipped'
  const canProcess  = order.status === 'confirmed'
  const canFulfill  = order.status === 'confirmed' || order.status === 'processing'
  const canCancel   = ['pending', 'payment_under_review', 'confirmed', 'processing'].includes(order.status)
  const canReturn   = order.status === 'delivered'
  const canCapture  = !order.paymentConfirmed && order.paymentMethod !== 'cash' && (order.status === 'confirmed' || order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered')
  const canRefund   = order.paymentMethod !== 'cash' && order.paymentConfirmed && ['shipped', 'delivered', 'returned'].includes(order.status)
  const canPackingSlip = !isDigital && ['confirmed', 'processing', 'shipped'].includes(order.status)
  const canEdit     = canCancel

  async function copyPhone() {
    try { await navigator.clipboard.writeText(customerPhone); toast.success('تم نسخ رقم الهاتف') }
    catch { toast.error('فشل النسخ') }
  }

  function printOrder() { window.print() }

  const cmKeys = plan === 'starter' ? ['whatsapp', 'instagram', 'phone'] : ['whatsapp', 'telegram', 'instagram', 'phone']
  const cmMap  = Object.fromEntries(cmKeys.map(k => [k, CONTACT_META[k]]))
  const cm     = cmMap[order.contactMethod] || cmMap.whatsapp
  const handle = order.contactHandle || order.deliveryAddress?.phone || ''

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto print:p-0" dir="rtl">
      {/* ── Back ── */}
      <button onClick={() => navigate('/dashboard/orders')}
        className="hidden print:hidden inline-flex items-center gap-1.5 text-sm text-text-muted font-cairo hover:text-primary transition-colors mb-4"
      >
        <ArrowRight size={16} />
        العودة للطلبات
      </button>

      {/* ── Order Header ── */}
      <div className="bg-surface border border-border rounded-xl p-4 sm:p-5 mb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h1 className="font-cairo font-extrabold text-xl sm:text-2xl text-text">
              طلب <span className="font-inter text-primary dk-num">#{shortId}</span>
            </h1>
            <StatusBadge status={order.status} />
          </div>
          <div className="flex items-center gap-2 print:hidden">
            <button onClick={copyPhone} title="نسخ رقم الهاتف"
              className="w-9 h-9 rounded-lg border border-border flex items-center justify-center text-text-muted hover:bg-bg hover:text-text transition-colors">
              <Copy size={16} />
            </button>
            <a href={`tel:${customerPhone}`} title="اتصال بالعميل"
              className="w-9 h-9 rounded-lg border border-border flex items-center justify-center text-text-muted hover:bg-bg hover:text-text transition-colors">
              <Phone size={16} />
            </a>
            <button onClick={printOrder} title="طباعة"
              className="w-9 h-9 rounded-lg border border-border flex items-center justify-center text-text-muted hover:bg-bg hover:text-text transition-colors">
              <Printer size={16} />
            </button>
          </div>
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-1 mt-3 text-xs font-cairo text-text-muted">
          <span>تاريخ الطلب: <span className="font-semibold text-text">{createdAt}</span></span>
          <span>آخر تحديث: <span className="font-semibold text-text">{updatedAt}</span></span>
          {order.isFullyFulfilled && <span className="text-success font-bold">مكتمل التنفيذ</span>}
        </div>
      </div>

      {/* ── Customer + Delivery ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div className="bg-surface border border-border rounded-xl p-4 sm:p-5">
          <h3 className="font-cairo font-bold text-sm text-text mb-3 flex items-center gap-2">
            <User size={16} className="text-text-muted" />
            معلومات العميل
          </h3>
          <div className="flex flex-col gap-2">
            <div>
              <p className="font-cairo text-xs text-text-muted">الاسم</p>
              <p className="font-cairo text-sm font-semibold text-text">{customerName}</p>
            </div>
            <div>
              <p className="font-cairo text-xs text-text-muted">رقم الهاتف</p>
              <p className="font-inter text-sm font-semibold text-text dk-num" dir="ltr">{customerPhone}</p>
            </div>
            {customerEmail && (
              <div>
                <p className="font-cairo text-xs text-text-muted">البريد الإلكتروني</p>
                <p className="font-cairo text-sm font-semibold text-text">{customerEmail}</p>
              </div>
            )}
          </div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4 sm:p-5">
          <h3 className="font-cairo font-bold text-sm text-text mb-3 flex items-center gap-2">
            <MapPin size={16} className="text-text-muted" />
            معلومات التوصيل
          </h3>
          <div className="flex flex-col gap-2">
            {!isDigital ? (
              <>
                <div>
                  <p className="font-cairo text-xs text-text-muted">العنوان</p>
                  <p className="font-cairo text-sm font-semibold text-text">{order.deliveryAddress?.details || '—'}</p>
                </div>
                <div>
                  <p className="font-cairo text-xs text-text-muted">المدينة</p>
                  <p className="font-cairo text-sm font-semibold text-text">{order.deliveryAddress?.city || '—'}</p>
                </div>
                {order.deliveryAddress?.district && (
                  <div>
                    <p className="font-cairo text-xs text-text-muted">الحي</p>
                    <p className="font-cairo text-sm font-semibold text-text">{order.deliveryAddress.district}</p>
                  </div>
                )}
              </>
            ) : (
              <p className="font-cairo text-sm text-text-muted">منتج رقمي — لا يتطلب توصيل</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Order Notes ── */}
      {order.notes && (
        <div className="bg-surface border border-border rounded-xl p-4 sm:p-5 mb-4">
          <p className="font-cairo text-xs text-text-muted mb-1">ملاحظات الطلب</p>
          <p className="font-cairo text-sm text-text">{order.notes}</p>
        </div>
      )}

      {/* ── Order Items ── */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden mb-4">
        <div className="px-4 sm:px-5 py-3 border-b border-border">
          <h3 className="font-cairo font-bold text-sm text-text flex items-center gap-2">
            <Package size={16} className="text-text-muted" />
            المنتجات
            {order.fulfilledQuantity > 0 && (
              <span className="text-xs font-normal text-text-muted mr-2">
                (تم تنفيذ {order.fulfilledQuantity} من {order.items?.reduce((s, i) => s + i.quantity, 0)})
              </span>
            )}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <div className="min-w-[500px]">
            <div className="grid grid-cols-[48px_1fr_60px_80px_80px] gap-2 px-4 sm:px-5 py-2.5 bg-bg text-xs font-semibold font-cairo text-text-muted">
              <span></span><span>المنتج</span><span>الكمية</span><span>السعر</span><span>الإجمالي</span>
            </div>
            <div className="divide-y divide-border">
              {order.items?.map((item, i) => {
                const lineTotal = (item.price ?? 0) * item.quantity
                return (
                  <div key={i} className="grid grid-cols-[48px_1fr_60px_80px_80px] gap-2 px-4 sm:px-5 py-3 items-center">
                    <div className="w-10 h-10 rounded-lg bg-bg-soft border border-border overflow-hidden flex items-center justify-center shrink-0">
                      {item.product?.images?.[0]
                        ? <img src={resolveAssetUrl(item.product.images[0])} alt="" className="w-full h-full object-cover" />
                        : <Package size={16} className="text-text-subtle" />}
                    </div>
                    <span className="font-cairo text-sm font-semibold text-text truncate">{item.product?.name ?? item.name}</span>
                    <span className="font-cairo text-sm text-text-muted text-center">{item.quantity}</span>
                    <span className="font-inter text-sm text-text dk-num">{item.price?.toLocaleString('en-US')}</span>
                    <span className="font-inter text-sm font-bold text-text dk-num">{lineTotal.toLocaleString('en-US')}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
        <div className="border-t border-border px-4 sm:px-5 py-3 flex flex-col gap-1.5">
          <div className="flex justify-between font-cairo text-sm text-text-muted">
            <span>المجموع الفرعي</span>
            <span className="font-inter font-semibold text-text dk-num">{total.toLocaleString('en-US')} ر.ي</span>
          </div>
          {!isDigital && (
            <div className="flex justify-between font-cairo text-sm text-text-muted">
              <span>رسوم التوصيل</span>
              <span className="font-inter font-semibold text-text dk-num">{shipping.toLocaleString('en-US')} ر.ي</span>
            </div>
          )}
          <div className="flex justify-between font-cairo font-bold text-base text-text pt-2 border-t border-border">
            <span>الإجمالي الكلي</span>
            <span className="font-inter dk-num">{(total + shipping).toLocaleString('en-US')} ر.ي</span>
          </div>
        </div>
      </div>

      {/* ── Payment Info ── */}
      <div className="bg-surface border border-border rounded-xl p-4 sm:p-5 mb-4">
        <h3 className="font-cairo font-bold text-sm text-text mb-3 flex items-center gap-2">
          <CreditCard size={16} className="text-text-muted" />
          معلومات الدفع
        </h3>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-cairo">
          <div>
            <span className="text-text-muted">طريقة الدفع: </span>
            <span className="font-semibold text-text">
              {order.paymentMethod === 'kuraimi' ? 'الكريمي' :
               order.paymentMethod === 'oneCash' ? 'OneCash' :
               order.paymentMethod === 'jaib' ? 'جيب' :
               order.paymentMethod === 'cash' ? 'كاش' : order.paymentMethod}
            </span>
          </div>
          <div>
            <span className="text-text-muted">حالة الدفع: </span>
            <span className={`font-semibold ${order.paymentConfirmed ? 'text-success' : 'text-warning'}`}>
              {order.paymentConfirmed ? 'تم التأكيد' : 'بانتظار التأكيد'}
            </span>
          </div>
          {order.contactMethod && (
            <div>
              <span className="text-text-muted">طريقة التواصل: </span>
              <span className="font-semibold text-text">{CONTACT_META[order.contactMethod]?.label || order.contactMethod}</span>
            </div>
          )}
          {order.paymentWasl && (
            <div className="flex items-center gap-2">
              <span className="text-text-muted">الوصل: </span>
              <a href={resolveAssetUrl(order.paymentWasl)} target="_blank" rel="noopener noreferrer"
                className="w-12 h-12 rounded-lg border border-border overflow-hidden block hover:opacity-80 transition-opacity">
                <img src={resolveAssetUrl(order.paymentWasl)} alt="وصل" className="w-full h-full object-cover" />
              </a>
            </div>
          )}
        </div>
      </div>

      {/* ── Status Management ── */}
      <div className="bg-surface border border-border rounded-xl p-4 sm:p-5 mb-4 print:hidden">
        <h3 className="font-cairo font-bold text-sm text-text mb-4 flex items-center gap-2">
          <CheckCircle size={16} className="text-text-muted" />
          إدارة حالة الطلب
        </h3>
        <div className="flex flex-wrap items-center gap-2">
          {canReview && (
            <button onClick={() => confirmMut.mutate()} disabled={confirmMut.isPending}
              className="inline-flex items-center gap-2 font-cairo font-bold text-sm px-4 py-2.5 rounded-lg bg-success-100 text-success hover:bg-green-200 transition-colors disabled:opacity-50"
            >
              {confirmMut.isPending ? <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg> : <Check size={16} />}
              تأكيد الدفع
            </button>
          )}
          {canReview && (
            <button onClick={() => setRejectOpen(true)}
              className="inline-flex items-center gap-2 font-cairo font-bold text-sm px-4 py-2.5 rounded-lg bg-danger-100 text-danger hover:bg-red-200 transition-colors"
            >
              <X size={16} /> رفض الطلب
            </button>
          )}
          {canProcess && (
            <button onClick={() => processMut.mutate()} disabled={processMut.isPending}
              className="inline-flex items-center gap-2 font-cairo font-bold text-sm px-4 py-2.5 rounded-lg bg-info-100 text-blue-600 hover:bg-blue-200 transition-colors disabled:opacity-50"
            >
              {processMut.isPending ? <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg> : <Clock size={16} />}
              قيد المعالجة
            </button>
          )}
          {canShip && (
            <button onClick={() => shipMut.mutate()} disabled={shipMut.isPending}
              className="inline-flex items-center gap-2 font-cairo font-bold text-sm px-4 py-2.5 rounded-lg bg-info-100 text-info hover:bg-blue-200 transition-colors disabled:opacity-50"
            >
              {shipMut.isPending ? <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg> : <Truck size={16} />}
              تم الشحن
            </button>
          )}
          {canDeliver && (
            <button onClick={() => deliverMut.mutate()} disabled={deliverMut.isPending}
              className="inline-flex items-center gap-2 font-cairo font-bold text-sm px-4 py-2.5 rounded-lg bg-success-100 text-success hover:bg-green-200 transition-colors disabled:opacity-50"
            >
              {deliverMut.isPending ? <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg> : <CheckCircle size={16} />}
              تم التسليم
            </button>
          )}

          {/* Separator */}
          <div className="w-px h-7 bg-border mx-1" />

          {canFulfill && (
            <button onClick={openFulfill}
              className="inline-flex items-center gap-2 font-cairo font-bold text-sm px-4 py-2.5 rounded-lg bg-primary-50 text-primary hover:bg-primary-100 transition-colors"
            >
              <Package size={16} /> تنفيذ شحنة
            </button>
          )}
          {canCapture && (
            <button onClick={() => captureMut.mutate()} disabled={captureMut.isPending}
              className="inline-flex items-center gap-2 font-cairo font-bold text-sm px-4 py-2.5 rounded-lg bg-success-100 text-success hover:bg-green-200 transition-colors disabled:opacity-50"
            >
              {captureMut.isPending ? <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg> : <DollarSign size={16} />}
              تأكيد الدفع (Capture)
            </button>
          )}
          {canRefund && (
            <button onClick={() => setRefundOpen(true)}
              className="inline-flex items-center gap-2 font-cairo font-bold text-sm px-4 py-2.5 rounded-lg bg-warning-100 text-yellow-700 hover:bg-yellow-200 transition-colors"
            >
              <RotateCcw size={16} /> استرداد
            </button>
          )}
          {canPackingSlip && (
            <button onClick={() => packingSlipMut.mutate()} disabled={packingSlipMut.isPending}
              className="inline-flex items-center gap-2 font-cairo font-bold text-sm px-4 py-2.5 rounded-lg bg-bg-soft text-text-muted hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              {packingSlipMut.isPending ? <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg> : <FileText size={16} />}
              فاتورة تعبئة
            </button>
          )}
          {canCancel && (
            <button onClick={() => setCancelOpen(true)}
              className="inline-flex items-center gap-2 font-cairo font-bold text-sm px-4 py-2.5 rounded-lg bg-danger-50 text-danger hover:bg-red-100 transition-colors"
            >
              <Ban size={16} /> إلغاء الطلب
            </button>
          )}
          {canReturn && (
            <button onClick={() => setReturnOpen(true)}
              className="inline-flex items-center gap-2 font-cairo font-bold text-sm px-4 py-2.5 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors"
            >
              <RotateCcw size={16} /> إرجاع الطلب
            </button>
          )}

          <div className="w-px h-7 bg-border mx-1" />

          {canEdit && (
            <button onClick={openEdit}
              className="inline-flex items-center gap-2 font-cairo font-bold text-sm px-4 py-2.5 rounded-lg bg-primary-50 text-primary hover:bg-primary-100 transition-colors"
            >
              <Edit size={16} /> تعديل
            </button>
          )}
          <button onClick={() => setNoteOpen(true)}
            className="inline-flex items-center gap-2 font-cairo font-bold text-sm px-4 py-2.5 rounded-lg bg-bg-soft text-text-muted hover:bg-gray-200 transition-colors"
          >
            <StickyNote size={16} /> ملاحظة
          </button>
        </div>

        {order.status === 'rejected' && order.rejectionReason && (
          <div className="mt-3 flex items-start gap-2 bg-danger-100 rounded-lg p-3">
            <X size={16} className="text-danger shrink-0 mt-0.5" />
            <div>
              <p className="font-cairo font-bold text-xs text-danger">سبب الرفض</p>
              <p className="font-cairo text-sm text-text-muted">{order.rejectionReason}</p>
            </div>
          </div>
        )}
        {order.status === 'cancelled' && order.cancellationReason && (
          <div className="mt-3 flex items-start gap-2 bg-red-50 rounded-lg p-3">
            <Ban size={16} className="text-danger shrink-0 mt-0.5" />
            <div>
              <p className="font-cairo font-bold text-xs text-danger">سبب الإلغاء</p>
              <p className="font-cairo text-sm text-text-muted">{order.cancellationReason}</p>
            </div>
          </div>
        )}
      </div>

      {/* ── Fulfillments ── */}
      {fulfillments.length > 0 && (
        <div className="bg-surface border border-border rounded-xl p-4 sm:p-5 mb-4 print:hidden">
          <h3 className="font-cairo font-bold text-sm text-text mb-4 flex items-center gap-2">
            <Truck size={16} className="text-text-muted" />
            التوصيلات ({fulfillments.length})
          </h3>
          <div className="flex flex-col gap-3">
            {fulfillments.map((f, i) => (
              <div key={f._id} className="border border-border rounded-xl p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-cairo font-bold text-sm text-text">شحنة #{i + 1}</span>
                  <StatusBadge status={f.status} />
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm font-cairo">
                  <div>
                    <p className="text-xs text-text-muted">المنتجات</p>
                    <p className="font-semibold text-text">{f.items?.map(i => `${i.name} (${i.quantity})`).join(', ')}</p>
                  </div>
                  {f.carrier && (
                    <div>
                      <p className="text-xs text-text-muted">شركة الشحن</p>
                      <p className="font-semibold text-text">{f.carrier}</p>
                    </div>
                  )}
                  {f.trackingNumber && (
                    <div>
                      <p className="text-xs text-text-muted">رقم التتبع</p>
                      {f.trackingUrl ? (
                        <a href={f.trackingUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline">{f.trackingNumber}</a>
                      ) : (
                        <p className="font-semibold text-text">{f.trackingNumber}</p>
                      )}
                    </div>
                  )}
                  {f.notes && (
                    <div>
                      <p className="text-xs text-text-muted">ملاحظات</p>
                      <p className="text-text">{f.notes}</p>
                    </div>
                  )}
                </div>
                <div className="mt-2 text-xs text-text-muted">
                  {f.createdAt && `تاريخ الإنشاء: ${new Date(f.createdAt).toLocaleString('ar-YE')}`}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Notes Section ── */}
      {notes.length > 0 && (
        <div className="bg-surface border border-border rounded-xl p-4 sm:p-5 mb-4 print:hidden">
          <h3 className="font-cairo font-bold text-sm text-text mb-4 flex items-center gap-2">
            <ClipboardList size={16} className="text-text-muted" />
            الملاحظات ({notes.length})
          </h3>
          <div className="flex flex-col gap-3">
            {notes.map((n) => (
              <div key={n._id} className="border-r-3 border-primary pr-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-cairo font-semibold text-xs text-text">{n.authorName || n.author?.name || 'النظام'}</span>
                  {n.isInternal && <span className="text-xs bg-warning-100 text-yellow-700 px-1.5 py-0.5 rounded font-cairo font-semibold">داخلي</span>}
                  <span className="font-cairo text-xs text-text-muted mr-auto">{n.createdAt ? new Date(n.createdAt).toLocaleString('ar-YE') : ''}</span>
                </div>
                <p className="font-cairo text-sm text-text">{n.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Timeline ── */}
      <div className="bg-surface border border-border rounded-xl p-4 sm:p-5 mb-4 print:hidden">
        <h3 className="font-cairo font-bold text-sm text-text mb-4 flex items-center gap-2">
          <Clock size={16} className="text-text-muted" />
          تسلسل الطلب
        </h3>
        <OrderTimeline order={order} />
      </div>

      {/* ── Reject Modal ── */}
      {rejectOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setRejectOpen(false)}>
          <div className="bg-surface rounded-2xl w-full max-w-md shadow-lg" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h3 className="font-cairo font-bold text-base text-text">رفض الطلب</h3>
              <button onClick={() => setRejectOpen(false)} className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:bg-bg"><X size={18} /></button>
            </div>
            <div className="px-5 py-4 flex flex-col gap-3">
              <p className="font-cairo text-sm text-text-muted">اذكر سبب الرفض حتى يتمكن العميل من فهم المشكلة.</p>
              <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)}
                placeholder="مثال: الوصل غير واضح، المبلغ غير مطابق..." rows={3}
                className="w-full font-cairo text-sm px-3.5 py-2.5 rounded-lg border border-border bg-surface text-text placeholder:text-text-subtle outline-none focus:border-danger focus:shadow-[0_0_0_3px_rgba(231,76,60,0.18)] transition-[border-color,box-shadow] resize-none"
              />
            </div>
            <div className="px-5 py-4 border-t border-border flex justify-end gap-2">
              <button onClick={() => setRejectOpen(false)} className="font-cairo font-semibold text-sm px-4 py-2 rounded-lg border border-border text-text-muted hover:bg-bg transition-colors">إلغاء</button>
              <button onClick={() => rejectMut.mutate()} disabled={!rejectReason.trim() || rejectMut.isPending}
                className="inline-flex items-center gap-2 font-cairo font-bold text-sm px-4 py-2 rounded-lg bg-danger text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
              >
                {rejectMut.isPending && <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>}
                تأكيد الرفض
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Cancel Modal ── */}
      {cancelOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setCancelOpen(false)}>
          <div className="bg-surface rounded-2xl w-full max-w-md shadow-lg" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h3 className="font-cairo font-bold text-base text-text">إلغاء الطلب</h3>
              <button onClick={() => setCancelOpen(false)} className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:bg-bg"><X size={18} /></button>
            </div>
            <div className="px-5 py-4 flex flex-col gap-3">
              <p className="font-cairo text-sm text-text-muted">سيتم إلغاء الطلب واستعادة الكميات إلى المخزون.</p>
              <textarea value={cancelReason} onChange={e => setCancelReason(e.target.value)}
                placeholder="سبب الإلغاء" rows={3}
                className="w-full font-cairo text-sm px-3.5 py-2.5 rounded-lg border border-border bg-surface text-text placeholder:text-text-subtle outline-none focus:border-danger focus:shadow-[0_0_0_3px_rgba(231,76,60,0.18)] transition-[border-color,box-shadow] resize-none"
              />
            </div>
            <div className="px-5 py-4 border-t border-border flex justify-end gap-2">
              <button onClick={() => setCancelOpen(false)} className="font-cairo font-semibold text-sm px-4 py-2 rounded-lg border border-border text-text-muted hover:bg-bg transition-colors">إلغاء</button>
              <button onClick={() => cancelMut.mutate()} disabled={cancelMut.isPending}
                className="inline-flex items-center gap-2 font-cairo font-bold text-sm px-4 py-2 rounded-lg bg-danger text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {cancelMut.isPending && <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>}
                تأكيد الإلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Return Modal ── */}
      {returnOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setReturnOpen(false)}>
          <div className="bg-surface rounded-2xl w-full max-w-md shadow-lg" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h3 className="font-cairo font-bold text-base text-text">إرجاع الطلب</h3>
              <button onClick={() => setReturnOpen(false)} className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:bg-bg"><X size={18} /></button>
            </div>
            <div className="px-5 py-4 flex flex-col gap-3">
              <p className="font-cairo text-sm text-text-muted">سيتم إرجاع الطلب واستعادة الكميات إلى المخزون.</p>
              <textarea value={returnReason} onChange={e => setReturnReason(e.target.value)}
                placeholder="سبب الإرجاع" rows={3}
                className="w-full font-cairo text-sm px-3.5 py-2.5 rounded-lg border border-border bg-surface text-text placeholder:text-text-subtle outline-none focus:border-purple-400 focus:shadow-[0_0_0_3px_rgba(147,51,234,0.15)] transition-[border-color,box-shadow] resize-none"
              />
            </div>
            <div className="px-5 py-4 border-t border-border flex justify-end gap-2">
              <button onClick={() => setReturnOpen(false)} className="font-cairo font-semibold text-sm px-4 py-2 rounded-lg border border-border text-text-muted hover:bg-bg transition-colors">إلغاء</button>
              <button onClick={() => returnMut.mutate()} disabled={returnMut.isPending}
                className="inline-flex items-center gap-2 font-cairo font-bold text-sm px-4 py-2 rounded-lg bg-purple-600 text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {returnMut.isPending && <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>}
                تأكيد الإرجاع
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Fulfill Modal ── */}
      {fulfillOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setFulfillOpen(false)}>
          <div className="bg-surface rounded-2xl w-full max-w-lg shadow-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h3 className="font-cairo font-bold text-base text-text">تنفيذ شحنة جديدة</h3>
              <button onClick={() => setFulfillOpen(false)} className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:bg-bg"><X size={18} /></button>
            </div>
            <div className="px-5 py-4 flex flex-col gap-4">
              <div>
                <p className="font-cairo text-xs font-bold text-text-muted mb-2">المنتجات والكميات</p>
                {order.items?.map((item, i) => {
                  const match = fulfillItems.find(f => (f.product === (item.product?._id || item.product)))
                  return (
                    <div key={i} className="flex items-center gap-3 mb-2">
                      <span className="font-cairo text-sm text-text flex-1">{item.name}</span>
                      <span className="font-cairo text-xs text-text-muted">الحد الأقصى: {item.quantity}</span>
                      <input type="number" min={0} max={item.quantity}
                        value={match?.quantity ?? 0}
                        onChange={e => {
                          const qty = Math.min(Math.max(0, Number(e.target.value)), item.quantity)
                          setFulfillItems(prev => {
                            const exists = prev.findIndex(f => f.product === (item.product?._id || item.product))
                            if (exists >= 0) {
                              const next = [...prev]
                              next[exists] = { ...next[exists], quantity: qty }
                              return next
                            }
                            return [...prev, { product: item.product?._id || item.product, name: item.name, quantity: qty }]
                          })
                        }}
                        className="w-20 h-9 rounded-lg border border-border text-center font-inter text-sm outline-none focus:border-primary"
                      />
                    </div>
                  )
                })}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="font-cairo text-xs font-bold text-text-muted mb-1">شركة الشحن</p>
                  <input value={fulfillCarrier} onChange={e => setFulfillCarrier(e.target.value)}
                    placeholder="مثال: YCS, DHL..."
                    className="w-full h-9 rounded-lg border border-border px-3 font-cairo text-sm outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <p className="font-cairo text-xs font-bold text-text-muted mb-1">رقم التتبع</p>
                  <input value={fulfillTracking} onChange={e => setFulfillTracking(e.target.value)}
                    placeholder="رقم التتبع"
                    className="w-full h-9 rounded-lg border border-border px-3 font-inter text-sm outline-none focus:border-primary"
                  />
                </div>
              </div>
              <div>
                <p className="font-cairo text-xs font-bold text-text-muted mb-1">رابط التتبع</p>
                <input value={fulfillTrackingUrl} onChange={e => setFulfillTrackingUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full h-9 rounded-lg border border-border px-3 font-cairo text-sm outline-none focus:border-primary"
                />
              </div>
              <div>
                <p className="font-cairo text-xs font-bold text-text-muted mb-1">ملاحظات</p>
                <textarea value={fulfillNotes} onChange={e => setFulfillNotes(e.target.value)}
                  rows={2}
                  className="w-full rounded-lg border border-border px-3 py-2 font-cairo text-sm outline-none focus:border-primary resize-none"
                />
              </div>
            </div>
            <div className="px-5 py-4 border-t border-border flex justify-end gap-2">
              <button onClick={() => setFulfillOpen(false)} className="font-cairo font-semibold text-sm px-4 py-2 rounded-lg border border-border text-text-muted hover:bg-bg transition-colors">إلغاء</button>
              <button onClick={() => fulfillMut.mutate()} disabled={fulfillMut.isPending || fulfillItems.every(f => f.quantity === 0)}
                className="inline-flex items-center gap-2 font-cairo font-bold text-sm px-4 py-2 rounded-lg bg-primary text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {fulfillMut.isPending && <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>}
                تأكيد التنفيذ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Note Modal ── */}
      {noteOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setNoteOpen(false)}>
          <div className="bg-surface rounded-2xl w-full max-w-md shadow-lg" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h3 className="font-cairo font-bold text-base text-text">إضافة ملاحظة</h3>
              <button onClick={() => setNoteOpen(false)} className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:bg-bg"><X size={18} /></button>
            </div>
            <div className="px-5 py-4 flex flex-col gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={noteInternal} onChange={e => setNoteInternal(e.target.checked)}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                />
                <span className="font-cairo text-sm text-text">ملاحظة داخلية (لن تظهر للعميل)</span>
              </label>
              <textarea value={noteContent} onChange={e => setNoteContent(e.target.value)}
                placeholder="اكتب ملاحظتك..."
                rows={3}
                className="w-full font-cairo text-sm px-3.5 py-2.5 rounded-lg border border-border bg-surface text-text placeholder:text-text-subtle outline-none focus:border-primary transition-[border-color,box-shadow] resize-none"
              />
            </div>
            <div className="px-5 py-4 border-t border-border flex justify-end gap-2">
              <button onClick={() => setNoteOpen(false)} className="font-cairo font-semibold text-sm px-4 py-2 rounded-lg border border-border text-text-muted hover:bg-bg transition-colors">إلغاء</button>
              <button onClick={() => noteMut.mutate()} disabled={!noteContent.trim() || noteMut.isPending}
                className="inline-flex items-center gap-2 font-cairo font-bold text-sm px-4 py-2 rounded-lg bg-primary text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {noteMut.isPending && <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>}
                حفظ الملاحظة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Modal ── */}
      {editOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setEditOpen(false)}>
          <div className="bg-surface rounded-2xl w-full max-w-md shadow-lg" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h3 className="font-cairo font-bold text-base text-text">تعديل الطلب</h3>
              <button onClick={() => setEditOpen(false)} className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:bg-bg"><X size={18} /></button>
            </div>
            <div className="px-5 py-4 flex flex-col gap-3">
              <div>
                <p className="font-cairo text-xs font-bold text-text-muted mb-1">ملاحظات الطلب</p>
                <textarea value={editNotes} onChange={e => setEditNotes(e.target.value)}
                  rows={3}
                  className="w-full font-cairo text-sm px-3.5 py-2.5 rounded-lg border border-border bg-surface text-text placeholder:text-text-subtle outline-none focus:border-primary transition-[border-color,box-shadow] resize-none"
                />
              </div>
              {!isDigital && (
                <div>
                  <p className="font-cairo text-xs font-bold text-text-muted mb-1">رسوم التوصيل</p>
                  <input type="number" min={0} value={editShippingFee} onChange={e => setEditShippingFee(Number(e.target.value))}
                    className="w-full h-9 rounded-lg border border-border px-3 font-inter text-sm outline-none focus:border-primary"
                  />
                </div>
              )}
              <p className="font-cairo text-xs text-text-muted">ملاحظة: لا يمكن تعديل المنتجات بعد تأكيد الطلب.</p>
            </div>
            <div className="px-5 py-4 border-t border-border flex justify-end gap-2">
              <button onClick={() => setEditOpen(false)} className="font-cairo font-semibold text-sm px-4 py-2 rounded-lg border border-border text-text-muted hover:bg-bg transition-colors">إلغاء</button>
              <button onClick={() => editMut.mutate()} disabled={editMut.isPending}
                className="inline-flex items-center gap-2 font-cairo font-bold text-sm px-4 py-2 rounded-lg bg-primary text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {editMut.isPending && <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>}
                حفظ التعديلات
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Refund Modal ── */}
      {refundOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setRefundOpen(false)}>
          <div className="bg-surface rounded-2xl w-full max-w-md shadow-lg" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h3 className="font-cairo font-bold text-base text-text">استرداد المبلغ</h3>
              <button onClick={() => setRefundOpen(false)} className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:bg-bg"><X size={18} /></button>
            </div>
            <div className="px-5 py-4 flex flex-col gap-3">
              <div>
                <p className="font-cairo text-xs font-bold text-text-muted mb-1">المبلغ المسترد</p>
                <input type="number" min={0} max={order.totalAmount} value={refundAmount} onChange={e => setRefundAmount(Number(e.target.value))}
                  className="w-full h-9 rounded-lg border border-border px-3 font-inter text-sm outline-none focus:border-primary"
                />
              </div>
              <div>
                <p className="font-cairo text-xs font-bold text-text-muted mb-1">سبب الاسترداد</p>
                <textarea value={refundReasonText} onChange={e => setRefundReasonText(e.target.value)}
                  rows={2}
                  className="w-full font-cairo text-sm px-3.5 py-2.5 rounded-lg border border-border bg-surface text-text placeholder:text-text-subtle outline-none focus:border-primary transition-[border-color,box-shadow] resize-none"
                />
              </div>
            </div>
            <div className="px-5 py-4 border-t border-border flex justify-end gap-2">
              <button onClick={() => setRefundOpen(false)} className="font-cairo font-semibold text-sm px-4 py-2 rounded-lg border border-border text-text-muted hover:bg-bg transition-colors">إلغاء</button>
              <button onClick={() => refundMut.mutate()} disabled={refundAmount <= 0 || refundMut.isPending}
                className="inline-flex items-center gap-2 font-cairo font-bold text-sm px-4 py-2 rounded-lg bg-warning text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {refundMut.isPending && <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>}
                تأكيد الاسترداد
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Vertical Timeline ─────────────────────────────────────── */
function OrderTimeline({ order }) {
  const events = []

  events.push({
    id: 'created',
    label: 'تم إنشاء الطلب',
    time: order.createdAt ? new Date(order.createdAt).toLocaleString('ar-YE') : '',
    done: true,
    icon: 'check',
    color: 'success',
  })

  if (order.status === 'rejected') {
    events.push({
      id: 'rejected',
      label: 'تم رفض الطلب',
      time: order.rejectedAt ? new Date(order.rejectedAt).toLocaleString('ar-YE') : '',
      done: true,
      icon: 'x',
      color: 'danger',
    })
    return (
      <div className="flex flex-col gap-0 pr-4">
        {events.map((ev, i) => (
          <TimelineEvent key={ev.id} event={ev} isLast={i === events.length - 1} />
        ))}
      </div>
    )
  }

  if (order.status === 'cancelled') {
    events.push({
      id: 'cancelled',
      label: 'تم إلغاء الطلب',
      time: order.cancelledAt ? new Date(order.cancelledAt).toLocaleString('ar-YE') : '',
      done: true,
      icon: 'x',
      color: 'danger',
    })
    return (
      <div className="flex flex-col gap-0 pr-4">
        {events.map((ev, i) => (
          <TimelineEvent key={ev.id} event={ev} isLast={i === events.length - 1} />
        ))}
      </div>
    )
  }

  if (order.status === 'returned') {
    events.push({
      id: 'confirmed',
      label: 'تم تأكيد الدفع',
      time: order.confirmedAt ? new Date(order.confirmedAt).toLocaleString('ar-YE') : '',
      done: true,
      icon: 'check',
      color: 'success',
    })
    events.push({
      id: 'delivered',
      label: 'تم التسليم',
      time: order.deliveredAt ? new Date(order.deliveredAt).toLocaleString('ar-YE') : '',
      done: true,
      icon: 'check',
      color: 'success',
    })
    events.push({
      id: 'returned',
      label: 'تم الإرجاع',
      time: order.returnedAt ? new Date(order.returnedAt).toLocaleString('ar-YE') : '',
      done: true,
      icon: 'x',
      color: 'danger',
    })
    return (
      <div className="flex flex-col gap-0 pr-4">
        {events.map((ev, i) => (
          <TimelineEvent key={ev.id} event={ev} isLast={i === events.length - 1} />
        ))}
      </div>
    )
  }

  const isDelivered  = order.status === 'delivered' || order.status === 'digital-delivered'
  const isShipped    = order.status === 'shipped' || order.status === 'chat-open' || isDelivered
  const isProcessing = order.status === 'processing' || isShipped || isDelivered
  const isConfirmed  = order.status === 'confirmed' || isProcessing || isShipped || isDelivered

  events.push({
    id: 'confirmed',
    label: 'تم تأكيد الدفع',
    time: order.confirmedAt ? new Date(order.confirmedAt).toLocaleString('ar-YE') : '',
    done: isConfirmed,
    icon: isConfirmed ? 'check' : 'clock',
    color: isConfirmed ? 'success' : 'muted',
  })

  if (order.store?.type === 'physical') {
    events.push({
      id: 'processing',
      label: 'قيد المعالجة',
      time: order.processingAt ? new Date(order.processingAt).toLocaleString('ar-YE') : '',
      done: isProcessing,
      icon: isProcessing ? 'check' : 'clock',
      color: isProcessing ? 'success' : 'muted',
    })
  }

  if (order.store?.type === 'digital' || order.chatId) {
    events.push({
      id: 'chat-open',
      label: order.chatId ? 'محادثة مفتوحة' : 'بانتظار المحادثة',
      time: '',
      done: isDelivered,
      icon: isDelivered ? 'check' : 'clock',
      color: isDelivered ? 'success' : 'muted',
    })
  }

  if (order.store?.type === 'digital') {
    events.push({
      id: 'delivered',
      label: 'تم التسليم',
      time: order.deliveredAt ? new Date(order.deliveredAt).toLocaleString('ar-YE') : '',
      done: isDelivered,
      icon: isDelivered ? 'check' : 'clock',
      color: isDelivered ? 'success' : 'muted',
    })
  } else {
    events.push({
      id: 'shipped',
      label: 'تم الشحن',
      time: order.shippedAt ? new Date(order.shippedAt).toLocaleString('ar-YE') : '',
      done: isShipped,
      icon: isShipped ? 'check' : 'clock',
      color: isShipped ? 'success' : 'muted',
    })
    events.push({
      id: 'delivered',
      label: 'تم التسليم',
      time: order.deliveredAt ? new Date(order.deliveredAt).toLocaleString('ar-YE') : '',
      done: isDelivered,
      icon: isDelivered ? 'check' : 'clock',
      color: isDelivered ? 'success' : 'muted',
    })
  }

  return (
    <div className="flex flex-col gap-0 pr-4">
      {events.map((ev, i) => (
        <TimelineEvent key={ev.id} event={ev} isLast={i === events.length - 1} />
      ))}
    </div>
  )
}

function TimelineEvent({ event, isLast }) {
  const dotColor = event.color === 'danger'
    ? 'bg-danger border-danger text-white'
    : event.color === 'success'
      ? 'bg-success border-success text-white'
      : 'bg-surface border-border text-text-muted'

  return (
    <div className="relative flex items-start gap-3 pb-1">
      {!isLast && (
        <div className="absolute top-5 right-[-10px] w-0.5 h-full bg-border" />
      )}
      <div className={`relative z-10 w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 ${dotColor}`}>
        <Icon name={event.icon} size={12} strokeWidth={2.5} />
      </div>
      <div className="pb-4">
        <p className={`font-cairo text-sm font-semibold ${event.done ? 'text-text' : 'text-text-muted'}`}>
          {event.label}
        </p>
        {event.time && (
          <p className="font-cairo text-xs text-text-subtle mt-0.5">{event.time}</p>
        )}
      </div>
    </div>
  )
}
