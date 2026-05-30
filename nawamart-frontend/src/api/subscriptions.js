import api from './axios'

/**
 * GET /api/subscriptions/my
 * Returns the merchant's current subscription.
 * Shape: { plan, status, expiresAt, paymentMethod, waslUrl, createdAt }
 */
export const getMySubscription = () => api.get('/subscriptions/my')

/**
 * POST /api/subscriptions
 * Body: { plan, paymentMethod, waslUrl }
 * Creates a new pending subscription (admin reviews & activates).
 */
export const createSubscription = (data) => api.post('/subscriptions/request', data)

/**
 * GET /api/subscriptions/prorate?targetPlan=x&billing=monthly|yearly
 * Returns prorated upgrade cost estimate.
 */
export const getSubscriptionProration = (targetPlan, billing = 'monthly') =>
  api.get(`/subscriptions/prorate?targetPlan=${targetPlan}&billing=${billing}`)

/**
 * POST /api/upload/wasl
 * Body: FormData { wasl: File }
 * Uploads وصل image and returns { url }
 */
export const uploadSubscriptionWasl = (formData) =>
  api.post('/upload/wasl', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

// ── Plan metadata ─────────────────────────────────────────────────────────
export const PLANS = {
  starter: {
    key:      'starter',
    name:     'Starter',
    nameAr:   'المبتدئ',
    price:    2500,
    yearlyPrice: 24900,
    color:    'text-text-muted',
    bgColor:  'bg-bg-soft',
    features: ['حتى 10 منتجات', 'نطاق فرعي nawa.shop', 'تقارير مبيعات أساسية', 'توصيل يدوي (واتساب/انستقرام)', 'دعم أساسي'],
  },
  pro: {
    key:      'pro',
    name:     'Pro',
    nameAr:   'الاحترافي',
    price:    8000,
    yearlyPrice: 79680,
    color:    'text-primary',
    bgColor:  'bg-primary-50',
    badge:    'الأكثر شعبية',
    features: ['منتجات غير محدودة', 'نطاق مخصص .com', 'تقارير + رسوم بيانية', 'توصيل يدوي (واتساب/انستقرام/تيليجرام)', 'تحليلات متوسطة', 'دعم بريد إلكتروني'],
  },
  business: {
    key:      'business',
    name:     'Business',
    nameAr:   'الأعمال',
    price:    13000,
    yearlyPrice: 129480,
    color:    'text-amber-700',
    bgColor:  'bg-amber-50',
    features: ['منتجات غير محدودة + SKU/brand/barcode', 'نطاق مخصص .com', 'تقارير متقدمة + تقارير ضريبية', 'توصيل مدمج (داخل التطبيق) + خارجي', 'تحليلات متقدمة', 'محادثة مدمجة داخل التطبيق', 'حتى 5 مستخدمين فريق', 'دعم أولوية 24/7'],
  },
}

export const WALLETS = [
  { id: 'kuraimi', label: 'الكريمي',  sub: 'تطبيق بنك التضامن' },
  { id: 'onecash', label: 'OneCash',  sub: 'محفظة وان كاش' },
  { id: 'jaib',    label: 'جيب',      sub: 'محفظة جيب' },
]
