// ─── Products ───────────────────────────────────────────────────────────────


export const PHYSICAL_PRODUCTS = [
  { id: 1, name: "عسل سدر يمني أصلي",      cat: "أغذية",      meta: "500 جرام",   price: 14400, tag: "جديد",           tagType: "accent" },
  { id: 2, name: "بُن حرازي مطحون",         cat: "مشروبات",    meta: "250 جرام",   price: 8500,  tag: null },
  { id: 3, name: "ثوب يمني مطرز",           cat: "ملابس",      meta: "مقاس L",     price: 28500, tag: "خصم",            tagType: "danger" },
  { id: 4, name: "حقيبة جلد طبيعي",         cat: "إكسسوارات",  meta: "بني داكن",   price: 21000, tag: null },
  { id: 5, name: "تمر برحي مكنوز",          cat: "أغذية",      meta: "1 كيلو",     price: 6200,  tag: null },
  { id: 6, name: "ساعة جلدية كلاسيكية",     cat: "إكسسوارات",  meta: "Quartz",     price: 18900, tag: null },
  { id: 7, name: "قهوة قشر يمنية",          cat: "مشروبات",    meta: "250 جرام",   price: 5400,  tag: "جديد",           tagType: "accent" },
  { id: 8, name: "زبيب أحمر يمني",          cat: "أغذية",      meta: "500 جرام",   price: 4800,  tag: null },
]

export const DIGITAL_PRODUCTS = [
  { id: 11, name: "اشتراك سبوتيفاي · 12 شهر",    cat: "اشتراكات", meta: "حساب فردي",              price: 7500,  tag: "الأكثر مبيعاً", tagType: "accent" },
  { id: 12, name: "بطاقة شحن PUBG · 660 UC",      cat: "ألعاب",    meta: "تسليم خلال 5 دقائق",    price: 3200,  tag: null },
  { id: 13, name: "حساب نتفلكس · شهر",            cat: "اشتراكات", meta: "حساب مشترك Premium",     price: 4500,  tag: null },
  { id: 14, name: "بطاقة Steam · 50$",             cat: "ألعاب",    meta: "رصيد رقمي",              price: 16800, tag: null },
  { id: 15, name: "اشتراك Microsoft 365",          cat: "برامج",    meta: "12 شهر · شخصي",         price: 22000, tag: "خصم",            tagType: "danger" },
  { id: 16, name: "كود تفعيل ويندوز 11 برو",      cat: "برامج",    meta: "مفتاح رقمي",             price: 8900,  tag: null },
  { id: 17, name: "بطاقة شحن جوجل بلاي · 25$",   cat: "ألعاب",    meta: "للسوق السعودي",          price: 8400,  tag: null },
  { id: 18, name: "اشتراك ChatGPT Plus",           cat: "اشتراكات", meta: "شهر · حساب فردي",        price: 7200,  tag: "جديد",           tagType: "accent" },
]

// ─── Orders ─────────────────────────────────────────────────────────────────

export const ALL_ORDERS = [
  { id: "NM-2840-19", customer: "عبدالرحمن المقطري", city: "صنعاء — حدة",      date: "20 May", items: 3, amount: 42500, status: "pending",           type: "physical" },
  { id: "NM-2840-18", customer: "هدى الكبسي",         city: "—",                date: "20 May", items: 1, amount: 7500,  status: "pending",           type: "digital",  product: "اشتراك سبوتيفاي" },
  { id: "NM-2840-17", customer: "سامي الحضرمي",       city: "المكلا",           date: "19 May", items: 5, amount: 67200, status: "shipped",           type: "physical" },
  { id: "NM-2840-16", customer: "ريم العنسي",         city: "—",                date: "19 May", items: 1, amount: 22000, status: "chat-open",         type: "digital",  product: "Microsoft 365" },
  { id: "NM-2840-15", customer: "أحمد الشميري",       city: "إب",               date: "18 May", items: 4, amount: 21000, status: "rejected",          type: "physical" },
  { id: "NM-2840-14", customer: "ليلى السقاف",        city: "صنعاء — السبعين",  date: "18 May", items: 2, amount: 12400, status: "delivered",         type: "physical" },
  { id: "NM-2840-13", customer: "مازن الإرياني",      city: "—",                date: "18 May", items: 1, amount: 3200,  status: "digital-delivered", type: "digital",  product: "PUBG · 660 UC" },
  { id: "NM-2840-12", customer: "ندى باشراحيل",       city: "عدن — التواهي",    date: "17 May", items: 1, amount: 6800,  status: "delivered",         type: "physical" },
  { id: "NM-2840-11", customer: "خالد الذيباني",      city: "صنعاء — شملان",    date: "17 May", items: 3, amount: 28600, status: "confirmed",         type: "physical" },
  { id: "NM-2840-10", customer: "سلمى المنصور",       city: "—",                date: "17 May", items: 1, amount: 8900,  status: "digital-delivered", type: "digital",  product: "كود ويندوز 11" },
]

export const STATUS_MAP = {
  pending:            { label: "بانتظار الوصل",   cls: "warning" },
  confirmed:          { label: "مؤكد",             cls: "success" },
  shipped:            { label: "تم الشحن",         cls: "info" },
  delivered:          { label: "تم التسليم",       cls: "delivered" },
  rejected:           { label: "مرفوض",             cls: "danger" },
  "chat-open":        { label: "محادثة مفتوحة",    cls: "info" },
  "digital-delivered":{ label: "تم التسليم",       cls: "delivered" },
}

// ─── Testimonials ────────────────────────────────────────────────────────────

export const TESTIMONIALS = [
  {
    name: "محمد الصرابي",
    store: "متجر العسل اليماني",
    initials: "م",
    text: "بدأت بمتجر صغير، خلال 3 أشهر صار عندي 600 طلب شهرياً. أهم شي إن وصلات الدفع تتأكد بسرعة.",
    type: "physical",
  },
  {
    name: "سامر المخلافي",
    store: "Yemen Digital Store",
    initials: "س",
    text: "المحادثة المدمجة وفّرت علي الواتساب الخاص. كل طلب رقمي له شاتّه الخاص، منظم وسريع.",
    type: "digital",
  },
  {
    name: "أمل الكهلاني",
    store: "بوتيك أمل",
    initials: "أ",
    text: "أول مرة أبيع أونلاين، التطبيق سهل جداً وباللغة اللي أفهمها. الزبائن صاروا يطلبوا بالمحافظات.",
    type: "physical",
  },
]

// ─── Customers ───────────────────────────────────────────────────────────────

export const CUSTOMERS = [
  { id: "c1",  name: "عبدالرحمن المقطري", initials: "ع", phone: "+967 770 123 456", city: "صنعاء — حدة",      orders: 14, spent: 285400, last: "20 ماي 2026", joined: "مارس 2025",    tier: "vip",     type: "physical" },
  { id: "c2",  name: "سامي الحضرمي",      initials: "س", phone: "+967 712 553 098", city: "المكلا",           orders: 8,  spent: 184700, last: "19 ماي 2026", joined: "أغسطس 2025",  tier: "regular", type: "physical" },
  { id: "c3",  name: "ليلى السقاف",       initials: "ل", phone: "+967 738 901 234", city: "صنعاء — السبعين", orders: 12, spent: 156200, last: "18 ماي 2026", joined: "يونيو 2025",   tier: "vip",     type: "physical" },
  { id: "c4",  name: "أحمد الشميري",      initials: "أ", phone: "+967 711 222 555", city: "إب",               orders: 3,  spent: 68400,  last: "18 ماي 2026", joined: "فبراير 2026",  tier: "regular", type: "physical" },
  { id: "c5",  name: "ندى باشراحيل",      initials: "ن", phone: "+967 770 446 728", city: "عدن — التواهي",   orders: 5,  spent: 42800,  last: "17 ماي 2026", joined: "نوفمبر 2025",  tier: "regular", type: "physical" },
  { id: "c10", name: "ريم العنسي",        initials: "ر", phone: "+967 770 555 412", city: null,               orders: 18, spent: 312800, last: "20 ماي 2026", joined: "فبراير 2025",  tier: "vip",     type: "digital"  },
  { id: "c11", name: "هدى الكبسي",        initials: "ه", phone: "+967 712 909 887", city: null,               orders: 7,  spent: 52400,  last: "20 ماي 2026", joined: "يوليو 2025",   tier: "regular", type: "digital"  },
  { id: "c12", name: "مازن الإرياني",     initials: "م", phone: "+967 736 122 008", city: null,               orders: 11, spent: 38500,  last: "18 ماي 2026", joined: "سبتمبر 2025",  tier: "regular", type: "digital"  },
  { id: "c15", name: "نور الدين الحاضري", initials: "ن", phone: "+967 770 622 145", city: null,               orders: 22, spent: 184700, last: "14 ماي 2026", joined: "يناير 2025",   tier: "vip",     type: "digital"  },
]

// ─── Chat Threads ────────────────────────────────────────────────────────────

export const CHAT_THREADS = [
  {
    id: "t1", orderId: "NM-2840-16", customer: "ريم العنسي", initials: "ر",
    product: "Microsoft 365 · 12 شهر", amount: 22000, type: "digital",
    online: true, unread: 2, lastTime: "الآن",
    messages: [
      { from: "system",   kind: "info",        text: "تم تأكيد الدفع. القناة مفتوحة لتسليم المنتج الرقمي.", time: "10:22" },
      { from: "customer", kind: "text",        text: "السلام عليكم، تم الدفع وأرسلت الوصل. متى يصلني التفعيل؟", time: "10:23" },
      { from: "merchant", kind: "text",        text: "وعليكم السلام أستاذة ريم، شكراً للطلب 🙏 سأرسل بيانات الحساب الآن.", time: "10:24" },
      { from: "merchant", kind: "credentials", time: "10:25",
        creds: [
          { l: "البريد",        v: "reem.user@m365.team" },
          { l: "كلمة المرور",   v: "S!ky_42_Reem" },
          { l: "مدة الاشتراك",  v: "12 شهراً" },
        ],
      },
      { from: "merchant", kind: "file", time: "10:25", file: { name: "تعليمات-التفعيل.pdf", size: "420 KB" } },
      { from: "customer", kind: "text", text: "اشتغل الحساب ✨ شكراً جزيلاً", time: "10:31" },
    ],
  },
  {
    id: "t2", orderId: "NM-2840-22", customer: "محمد القاضي", initials: "م",
    product: "اشتراك ChatGPT Plus", amount: 7200, type: "digital",
    online: false, unread: 0, lastTime: "10د",
    messages: [
      { from: "customer", kind: "text", text: "متى يتم تفعيل الاشتراك؟", time: "09:50" },
      { from: "merchant", kind: "text", text: "خلال 10 دقائق إن شاء الله، أراجع الوصل الآن.", time: "09:52" },
    ],
  },
  {
    id: "t5", orderId: "NM-2840-19", customer: "عبدالرحمن المقطري", initials: "ع",
    city: "صنعاء — حدة", amount: 42500, type: "physical",
    online: true, unread: 2, lastTime: "الآن",
    messages: [
      { from: "customer", kind: "text", text: "السلام عليكم، أرسلت الوصل قبل قليل.", time: "14:22" },
      { from: "customer", kind: "text", text: "هل تأكّد الطلب؟", time: "14:30" },
    ],
  },
]
