const mongoose = require('mongoose');

const LEGAL_PAGE_TYPES = [
  'privacy_policy',
  'terms_of_service',
  'refund_policy',
  'shipping_policy',
  'cookie_policy',
  'dpa',
];

const legalPageSchema = new mongoose.Schema({
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: [true, 'المتجر مطلوب'],
  },
  merchant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Merchant',
    required: [true, 'التاجر مطلوب'],
  },
  type: {
    type: String,
    enum: {
      values: LEGAL_PAGE_TYPES,
      message: 'نوع الصفحة غير صالح: {VALUE}',
    },
    required: [true, 'نوع الصفحة مطلوب'],
  },
  title: {
    type: String,
    required: [true, 'العنوان مطلوب'],
    trim: true,
    maxlength: [200, 'العنوان لا يمكن أن يتجاوز 200 حرف'],
  },
  content: {
    type: String,
    required: [true, 'المحتوى مطلوب'],
  },
  isPublished: {
    type: Boolean,
    default: false,
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
  version: {
    type: String,
    default: '1.0',
  },
  lastReviewedAt: {
    type: Date,
    default: null,
  },
  lastReviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
  },
  effectiveDate: {
    type: Date,
    default: null,
  },
  template: {
    type: String,
    default: null,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

legalPageSchema.index({ store: 1, type: 1 }, { unique: true });
legalPageSchema.index({ merchant: 1 });
legalPageSchema.index({ isPublished: 1 });

legalPageSchema.statics.getTypes = function () {
  return LEGAL_PAGE_TYPES;
};

legalPageSchema.statics.getTypeLabel = function (type) {
  const labels = {
    privacy_policy: 'سياسة الخصوصية',
    terms_of_service: 'شروط الخدمة',
    refund_policy: 'سياسة الاسترجاع',
    shipping_policy: 'سياسة الشحن',
    cookie_policy: 'سياسة ملفات تعريف الارتباط',
    dpa: 'اتفاقية معالجة البيانات (DPA)',
  };
  return labels[type] || type;
};

legalPageSchema.statics.getDefaultTemplate = function (type, store) {
  const storeName = store?.name || 'متجري';
  const templates = {
    privacy_policy: `# سياسة الخصوصية
آخر تحديث: ${new Date().toLocaleDateString('ar-YE')}

## مقدمة
نحن في ${storeName} نلتزم بحماية خصوصية عملائنا. توضح سياسة الخصوصية هذه كيفية جمع واستخدام وحماية معلوماتك الشخصية.

## المعلومات التي نجمعها
- الاسم وبيانات الاتصال (البريد الإلكتروني، رقم الهاتف)
- عنوان التوصيل
- سجل الطلبات والمنتجات المشتراة
- معلومات الدفع (لا نخزن معلومات البطاقة الائتمانية)

## كيفية استخدام معلوماتك
- معالجة الطلبات وتوصيلها
- تحسين خدماتنا
- التواصل معك بخصوص طلباتك
- إرسال عروض ترويجية (بموافقتك)

## حماية البيانات
نتخذ إجراءات أمنية مناسبة لحماية معلوماتك من الوصول غير المصرح به.

## حقوقك
- طلب نسخة من بياناتك
- طلب تصحيح أو حذف بياناتك
- سحب الموافقة في أي وقت

## الاتصال بنا
للتواصل بخصوص سياسة الخصوصية: ${store?.contactEmail || 'البريد الإلكتروني'}`,

    terms_of_service: `# شروط الخدمة
آخر تحديث: ${new Date().toLocaleDateString('ar-YE')}

## قبول الشروط
باستخدامك لـ ${storeName}، فإنك توافق على شروط الخدمة هذه.

## استخدام المنصة
- يجب أن تكون فوق سن 18 عاماً
- تقديم معلومات دقيقة وكاملة
- عدم استخدام المنصة لأي غرض غير قانوني

## الطلبات والدفع
- الأسعار قابلة للتغيير دون إشعار مسبق
- الدفع يتم من خلال طرق الدفع المتاحة
- نحتفظ بالحق في رفض أي طلب

## الشحن والتوصيل
- أوقات التوصيل تقريبية وقد تتأثر بظروف خارجة عن إرادتنا
- رسوم التوصيل تحسب بناءً على المنطقة

## سياسة الاسترجاع
يرجى مراجعة سياسة الاسترجاع الخاصة بنا للمزيد من التفاصيل.

## تعديل الشروط
نحتفظ بالحق في تعديل هذه الشروط في أي وقت.`,

    refund_policy: `# سياسة الاسترجاع والاستبدال
آخر تحديث: ${new Date().toLocaleDateString('ar-YE')}

## فترة الاسترجاع
يمكن استرجاع المنتجات خلال 7 أيام من تاريخ الاستلام.

## شروط الاسترجاع
- أن يكون المنتج في حالته الأصلية
- عدم استخدام المنتج
- وجود فاتورة الشراء

## المنتجات غير القابلة للاسترجاع
- المنتجات الرقمية بعد التوصيل
- المنتجات المخصصة حسب الطلب

## عملية الاسترجاع
1. التواصل معنا عبر البريد الإلكتروني أو الهاتف
2. إعادة المنتج إلينا
3. فحص المنتج والموافقة على الاسترجاع
4. استرداد المبلغ خلال 3-5 أيام عمل

## الاستبدال
يمكن استبدال المنتجات ذات العيوب التصنيعية خلال 14 يوماً.`,

    shipping_policy: `# سياسة الشحن والتوصيل
آخر تحديث: ${new Date().toLocaleDateString('ar-YE')}

## مناطق التوصيل
نقوم بالتوصيل إلى جميع المدن والمناطق المتاحة.

## أوقات التوصيل
- داخل المدينة: 1-3 أيام عمل
- خارج المدينة: 3-7 أيام عمل
- قد تختلف أوقات التوصيل حسب الظروف

## رسوم التوصيل
- تحسب رسوم التوصيل حسب المنطقة والوزن
- قد تكون هناك عروض توصيل مجاني

## تتبع الطلب
يمكنك تتبع طلبك من خلال لوحة التحكم.
بعد تأكيد الطلب، ستتلقى إشعاراً بحالة الشحن.`,

    cookie_policy: `# سياسة ملفات تعريف الارتباط (Cookies)
آخر تحديث: ${new Date().toLocaleDateString('ar-YE')}

## ما هي ملفات تعريف الارتباط؟
ملفات تعريف الارتباط هي ملفات نصية صغيرة يتم تخزينها على جهازك عند زيارة موقعنا.

## كيف نستخدم ملفات تعريف الارتباط؟
- أساسية: ضرورية لتشغيل الموقع
- وظيفية: لتحسين تجربة المستخدم
- تحليلات: لفهم كيفية استخدام الموقع
- تسويق: لعرض إعلانات مخصصة

## التحكم في ملفات تعريف الارتباط
يمكنك التحكم في ملفات تعريف الارتباط من خلال إعدادات المتصفح الخاص بك.`,

    dpa: `# اتفاقية معالجة البيانات (DPA)
آخر تحديث: ${new Date().toLocaleDateString('ar-YE')}

## الأطراف
- **مراقب البيانات**: ${storeName}
- **معالج البيانات**: نوامارت

## نطاق المعالجة
تتعلق المعالجة ببيانات العملاء الضرورية لتشغيل المتجر الإلكتروني وتشمل:
- الاسم وبيانات الاتصال
- عنوان التوصيل
- سجل الطلبات
- معلومات الدفع

## التزامات معالج البيانات
- معالجة البيانات فقط وفق تعليمات مراقب البيانات
- الحفاظ على سرية وأمن البيانات
- إخطار مراقب البيانات في حالة حدوث خرق للبيانات
- حذف أو إعادة البيانات عند انتهاء العقد

## مدة المعالجة
تستمر المعالجة طوال فترة استخدام المنصة، وبعدها يتم حذف البيانات وفق سياسة الاحتفاظ.

## الأمن
يتخذ المعالج إجراءات أمنية مناسبة تشمل التشفير، التحكم في الوصول، والمراقبة المستمرة.`,
  };

  return templates[type] || '';
};

module.exports = mongoose.model('LegalPage', legalPageSchema);
