import { useState } from 'react'
import usePageTitle from '@/hooks/usePageTitle'
import { Store, Key, Webhook, BookOpen, Code, Shield, ArrowLeft, Copy, Check } from 'lucide-react'
import toast from 'react-hot-toast'

const SECTIONS = [
  { id: 'overview', label: 'نظرة عامة', icon: BookOpen },
  { id: 'auth', label: 'المصادقة', icon: Shield },
  { id: 'apikeys', label: 'مفاتيح API', icon: Key },
  { id: 'endpoints', label: 'النقاط النهائية', icon: Code },
  { id: 'webhooks', label: 'Webhooks', icon: Webhook },
  { id: 'errors', label: 'الأخطاء', icon: Shield },
  { id: 'sdk', label: 'SDKs', icon: Code },
]

const CURL_EXAMPLES = {
  products: `curl -X GET "https://api.nawamart.com/api/v1/products" \\
  -H "X-API-Key: nw_abc123..." \\
  -H "Accept-Version: v1"`,

  createProduct: `curl -X POST "https://api.nawamart.com/api/v1/products" \\
  -H "X-API-Key: nw_abc123..." \\
  -H "Content-Type: application/json" \\
  -d '{"name": "منتج جديد", "price": 5000}'`,

  orders: `curl -X GET "https://api.nawamart.com/api/v1/orders" \\
  -H "X-API-Key: nw_abc123..." \\
  -H "Accept-Version: v1"`,

  webhook: `curl -X POST "https://your-server.com/webhook" \\
  -H "Content-Type: application/json" \\
  -H "X-Webhook-Event: order.created" \\
  -H "X-Webhook-Signature: {signature}" \\
  -d '{"event": "order.created", "data": {...}}'`,
}

function CodeBlock({ code, lang = 'bash' }) {
  const [copied, setCopied] = useState(false)
  function handleCopy() {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <div className="relative group bg-[#0D1B2A] rounded-xl overflow-hidden my-3">
      <div className="flex items-center justify-between px-4 py-2 bg-[#1a2744]">
        <span className="font-mono text-[11px] text-gray-400">{lang}</span>
        <button onClick={handleCopy} className="text-gray-400 hover:text-white transition-all">
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-sm leading-relaxed" dir="ltr">
        <code className="font-mono text-green-400 whitespace-pre">{code}</code>
      </pre>
    </div>
  )
}

function Section({ id, children, icon: Icon }) {
  return (
    <section id={id} className="scroll-mt-20 mb-12">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-accent-50 flex items-center justify-center">
          <Icon size={18} className="text-accent-700" />
        </div>
        <h2 className="font-cairo font-extrabold text-xl text-text">{children}</h2>
      </div>
    </section>
  )
}

export default function DeveloperPortal() {
  usePageTitle('بوابة المطورين')
  const [activeSection, setActiveSection] = useState('overview')

  return (
    <div className="min-h-screen bg-bg" dir="rtl">
      <header className="bg-white border-b border-border sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <Store size={18} className="text-white" />
            </div>
            <span className="font-cairo font-extrabold text-lg text-text">نوامارت</span>
            <span className="font-cairo text-sm text-text-muted mr-2">بوابة المطورين</span>
          </div>
          <a href="/merchant/login" className="font-cairo text-sm font-bold text-accent hover:text-accent-700 transition-colors">
            لوحة التحكم
          </a>
        </div>
      </header>

      <div className="max-w-7xl mx-auto flex">
        <aside className="hidden lg:block w-64 shrink-0 sticky top-[73px] h-[calc(100vh-73px)] overflow-y-auto border-l border-border px-4 py-6">
          <nav className="space-y-1">
            {SECTIONS.map(({ id, label, icon: Icon }) => (
              <a
                key={id}
                href={`#${id}`}
                onClick={() => setActiveSection(id)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl font-cairo text-sm font-semibold transition-all ${
                  activeSection === id ? 'bg-accent text-white' : 'text-text-muted hover:bg-bg-soft hover:text-text'
                }`}
              >
                <Icon size={16} />
                {label}
              </a>
            ))}
          </nav>
        </aside>

        <main className="flex-1 min-w-0 px-4 lg:px-8 py-8 max-w-4xl">
          <Section id="overview" icon={BookOpen}>نظرة عامة</Section>
          <div className="pr-4 space-y-4 text-text-muted font-cairo text-sm leading-relaxed">
            <p>
              ترحب بكم بوابة مطوري نوامارت. تتيح لكم واجهات برمجة التطبيقات (API) إمكانية التكامل مع
              منصة نوامارت لبناء تطبيقات مخصصة، وأدوات، وأتمتة العمليات التجارية لمتجرك.
            </p>
            <p>توفر المنصة واجهتين رئيسيتين:</p>
            <ul className="list-disc pr-5 space-y-2">
              <li><strong className="text-text">واجهة RESTful API</strong> — للوصول إلى بيانات المتجر والمنتجات والطلبات.</li>
              <li><strong className="text-text">Webhooks</strong> — للإشعارات الفورية عند حدوث أحداث في متجرك.</li>
            </ul>
            <div className="bg-primary-5 border border-primary/20 rounded-2xl p-4 mt-4">
              <p className="font-cairo text-sm font-bold text-primary mb-1">الإصدار الحالي: v1</p>
              <p className="font-cairo text-xs text-text-muted">آخر تحديث: يونيو 2026</p>
            </div>
          </div>

          <Section id="auth" icon={Shield}>المصادقة</Section>
          <div className="pr-4 space-y-4 text-text-muted font-cairo text-sm leading-relaxed">
            <p>جميع طلبات API تتطلب مصادقة عبر مفتاح API. يتم إرسال المفتاح في ترويسة الطلب:</p>
            <CodeBlock code={`X-API-Key: nw_your_api_key_here`} lang="http" />
            <div className="bg-warning-100 border border-warning rounded-2xl p-4">
              <p className="font-cairo text-sm font-bold text-warning">مهم</p>
              <p className="font-cairo text-xs text-text-muted mt-1">لا تشارك مفتاح API الخاص بك مع أي شخص. قم بتخزينه بشكل آمن واستخدم مفاتيح مختلفة لكل تطبيق.</p>
            </div>
          </div>

          <Section id="apikeys" icon={Key}>مفاتيح API</Section>
          <div className="pr-4 space-y-4 text-text-muted font-cairo text-sm leading-relaxed">
            <p>يمكنك إنشاء وإدارة مفاتيح API من لوحة التحكم. كل مفتاح يمكن أن يكون له صلاحيات محددة:</p>
            <div className="overflow-x-auto mt-3">
              <table className="w-full text-sm border border-border rounded-xl overflow-hidden">
                <thead>
                  <tr className="bg-bg-soft">
                    <th className="font-cairo font-bold text-text px-4 py-2 text-right">الصلاحية</th>
                    <th className="font-cairo font-bold text-text px-4 py-2 text-right">الوصف</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['products:read', 'قراءة المنتجات'],
                    ['products:write', 'إنشاء وتحديث المنتجات'],
                    ['orders:read', 'قراءة الطلبات'],
                    ['orders:write', 'إنشاء الطلبات'],
                    ['customers:read', 'قراءة العملاء'],
                    ['store:read', 'قراءة بيانات المتجر'],
                    ['webhooks:manage', 'إدارة الـ Webhooks'],
                    ['analytics:read', 'قراءة التقارير'],
                  ].map(([scope, desc]) => (
                    <tr key={scope} className="border-t border-border">
                      <td className="font-mono text-xs text-accent-700 px-4 py-2" dir="ltr">{scope}</td>
                      <td className="font-cairo text-xs text-text-muted px-4 py-2">{desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <Section id="endpoints" icon={Code}>النقاط النهائية</Section>
          <div className="pr-4 space-y-6 text-text-muted font-cairo text-sm leading-relaxed">
            <p>جميع النقاط النهائية متاحة تحت المسار <code className="font-mono text-xs bg-bg-soft px-2 py-0.5 rounded text-accent-700">/api/v1/</code>.</p>

            <div className="bg-white border border-border rounded-2xl p-4">
              <h3 className="font-cairo font-bold text-text mb-3">المتجر</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[11px] bg-primary-5 text-primary px-2 py-0.5 rounded font-bold">GET</span>
                  <code className="font-mono text-xs text-text">/api/v1/store</code>
                  <span className="font-cairo text-xs text-text-muted">بيانات المتجر</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-border rounded-2xl p-4">
              <h3 className="font-cairo font-bold text-text mb-3">المنتجات</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[11px] bg-primary-5 text-primary px-2 py-0.5 rounded font-bold">GET</span>
                  <code className="font-mono text-xs text-text">/api/v1/products</code>
                  <span className="font-cairo text-xs text-text-muted">قائمة المنتجات</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[11px] bg-primary-5 text-primary px-2 py-0.5 rounded font-bold">GET</span>
                  <code className="font-mono text-xs text-text">/api/v1/products/:id</code>
                  <span className="font-cairo text-xs text-text-muted">تفاصيل منتج</span>
                </div>
              </div>
              <CodeBlock code={CURL_EXAMPLES.products} lang="bash" />
            </div>

            <div className="bg-white border border-border rounded-2xl p-4">
              <h3 className="font-cairo font-bold text-text mb-3">الطلبات</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[11px] bg-primary-5 text-primary px-2 py-0.5 rounded font-bold">GET</span>
                  <code className="font-mono text-xs text-text">/api/v1/orders</code>
                  <span className="font-cairo text-xs text-text-muted">قائمة الطلبات</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[11px] bg-primary-5 text-primary px-2 py-0.5 rounded font-bold">GET</span>
                  <code className="font-mono text-xs text-text">/api/v1/orders/:id</code>
                  <span className="font-cairo text-xs text-text-muted">تفاصيل طلب</span>
                </div>
              </div>
              <CodeBlock code={CURL_EXAMPLES.orders} lang="bash" />
            </div>
          </div>

          <Section id="webhooks" icon={Webhook}>Webhooks</Section>
          <div className="pr-4 space-y-4 text-text-muted font-cairo text-sm leading-relaxed">
            <p>تسمح لك الـ Webhooks باستقبال إشعارات آنية عند حدوث أحداث في متجرك. قم بتسجيل رابط الاستقبال من لوحة التحكم وسنقوم بإرسال طلب POST إليه عند كل حدث.</p>

            <h4 className="font-cairo font-bold text-text mt-4 mb-2">الأحداث المدعومة</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-border rounded-xl overflow-hidden">
                <thead>
                  <tr className="bg-bg-soft">
                    <th className="font-cairo font-bold text-text px-4 py-2 text-right">الحدث</th>
                    <th className="font-cairo font-bold text-text px-4 py-2 text-right">الوصف</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['product.created', 'إنشاء منتج جديد'],
                    ['product.updated', 'تحديث منتج'],
                    ['product.deleted', 'حذف منتج'],
                    ['order.created', 'إنشاء طلب جديد'],
                    ['order.confirmed', 'تأكيد طلب'],
                    ['order.shipped', 'شحن طلب'],
                    ['order.delivered', 'تسليم طلب'],
                    ['order.cancelled', 'إلغاء طلب'],
                    ['order.rejected', 'رفض طلب'],
                    ['store.updated', 'تحديث المتجر'],
                  ].map(([ev, desc]) => (
                    <tr key={ev} className="border-t border-border">
                      <td className="font-mono text-xs text-accent-700 px-4 py-2" dir="ltr">{ev}</td>
                      <td className="font-cairo text-xs text-text-muted px-4 py-2">{desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h4 className="font-cairo font-bold text-text mt-4 mb-2">توقيع الطلب (Signature)</h4>
            <p>كل طلب Webhook يتضمن ترويسة <code className="font-mono text-xs bg-bg-soft px-2 py-0.5 rounded text-accent-700">X-Webhook-Signature</code> تحتوي على توقيع HMAC-SHA256 للـ body باستخدام السر الخاص بك. يمكنك التحقق من صحة الطلب بمقارنة التوقيع:</p>
            <CodeBlock code={CURL_EXAMPLES.webhook} lang="bash" />

            <div className="bg-info-100 border border-info rounded-2xl p-4 mt-4">
              <p className="font-cairo text-sm font-bold text-info">آلية إعادة المحاولة</p>
              <p className="font-cairo text-xs text-text-muted mt-1">
                في حالة فشل التسليم، سنقوم بإعادة المحاولة 3 مرات بفواصل زمنية متزايدة (دقيقة، 5 دقائق، 15 دقيقة).
                إذا فشلت جميع المحاولات، سيتم وضع علامة فشل على التوصيل وسيتم إيقاف الـ Webhook مؤقتاً.
              </p>
            </div>
          </div>

          <Section id="errors" icon={Shield}>الأخطاء</Section>
          <div className="pr-4 space-y-4 text-text-muted font-cairo text-sm leading-relaxed">
            <p>تستخدم API نوامارت رموز حالة HTTP قياسية للإشارة إلى نجاح أو فشل الطلب:</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-border rounded-xl overflow-hidden">
                <thead>
                  <tr className="bg-bg-soft">
                    <th className="font-cairo font-bold text-text px-4 py-2 text-right">الرمز</th>
                    <th className="font-cairo font-bold text-text px-4 py-2 text-right">المعنى</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['200', 'نجاح'],
                    ['201', 'تم الإنشاء'],
                    ['400', 'خطأ في الطلب'],
                    ['401', 'مطلوب مصادقة'],
                    ['403', 'صلاحية غير كافية'],
                    ['404', 'غير موجود'],
                    ['429', 'تجاوز حد الطلبات (Rate Limit)'],
                    ['500', 'خطأ داخلي في الخادم'],
                  ].map(([code, desc]) => (
                    <tr key={code} className="border-t border-border">
                      <td className="font-mono text-xs text-accent-700 px-4 py-2">{code}</td>
                      <td className="font-cairo text-xs text-text-muted px-4 py-2">{desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-2">جميع الأخطاء تعيد JSON بالتنسيق التالي:</p>
            <CodeBlock code={`{
  "success": false,
  "data": null,
  "message": "رسالة الخطأ"
}`} lang="json" />
          </div>

          <Section id="sdk" icon={Code}>SDKs</Section>
          <div className="pr-4 space-y-4 text-text-muted font-cairo text-sm leading-relaxed">
            <p>قريباً — مكتبات برمجية بلغات متعددة لتسهيل التكامل مع نوامارت:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              {[
                { name: 'JavaScript / Node.js', status: 'قريباً' },
                { name: 'Python', status: 'قريباً' },
                { name: 'PHP', status: 'قريباً' },
                { name: 'Ruby', status: 'قريباً' },
                { name: 'Java', status: 'قريباً' },
                { name: 'Go', status: 'قريباً' },
              ].map((sdk) => (
                <div key={sdk.name} className="flex items-center justify-between p-3 bg-white border border-border rounded-xl">
                  <span className="font-cairo text-sm font-semibold text-text">{sdk.name}</span>
                  <span className="font-cairo text-xs bg-warning-100 text-warning px-2 py-0.5 rounded-lg font-bold">{sdk.status}</span>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
