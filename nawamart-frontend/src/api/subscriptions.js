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
 * POST /api/upload/wasl
 * Body: FormData { wasl: File }
 * Uploads وصل image and returns { url }
 */
export const uploadSubscriptionWasl = (formData) =>
  api.post('/upload/wasl', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

// ── Plan metadata (mirrors LandingPricing TIERS) ──────────────────────────
export const PLANS = {
  free: {
    key:      'free',
    name:     'Free',
    nameAr:   'المجاني',
    price:    0,
    color:    'text-text-muted',
    bgColor:  'bg-bg-soft',
    features: ['حتى 20 منتج', 'نطاق فرعي على nawa.shop', 'تأكيد الوصل اليدوي'],
  },
  pro: {
    key:      'pro',
    name:     'Pro',
    nameAr:   'الاحترافي',
    price:    4900,
    color:    'text-primary',
    bgColor:  'bg-primary-50',
    badge:    'الأكثر شعبية',
    features: ['منتجات بلا حدود', 'نطاق مخصص .com', 'قناة محادثة', 'إشعارات SMS', 'تقارير متقدمة'],
  },
  business: {
    key:      'business',
    name:     'Business',
    nameAr:   'الأعمال',
    price:    12000,
    color:    'text-accent-700',
    bgColor:  'bg-accent-50',
    features: ['كل مميزات Pro', 'حتى 5 مستخدمين', 'API تكامل خارجي', 'دعم أولوية 24/7'],
  },
}

export const WALLETS = [
  { id: 'cherry',  label: 'Cherry',   sub: 'محفظة إلكترونية' },
  { id: 'kuraimi', label: 'الكريمي',  sub: 'تطبيق بنك التضامن' },
  { id: 'onecash', label: 'OneCash',  sub: 'محفظة وان كاش' },
]
