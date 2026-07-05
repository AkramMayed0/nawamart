const INDUSTRIES = [
  {
    id: 'fashion',
    label: 'أزياء وموضة',
    icon: 'Shirt',
    description: 'ملابس، أحذية، إكسسوارات',
    suggestedCategories: ['ملابس', 'أحذية', 'إكسسوارات', 'عطور', 'مكياج'],
    suggestedTags: ['توصيل مجاني', 'مقاسات', 'ألوان'],
    templates: [
      { id: 'fashion-classic', label: 'كلاسيكي', preview: null },
      { id: 'fashion-modern', label: 'مودرن', preview: null },
      { id: 'fashion-luxury', label: 'فاخر', preview: null },
    ],
  },
  {
    id: 'electronics',
    label: 'إلكترونيات',
    icon: 'Smartphone',
    description: 'جوالات، لابتوب، أجهزة كهربائية',
    suggestedCategories: ['جوالات', 'لابتوب', 'إكسسوارات إلكترونية', 'أجهزة منزلية'],
    suggestedTags: ['ضمان', 'شحن سريع', 'أصلي ١٠٠٪'],
    templates: [
      { id: 'elec-tech', label: 'تقني', preview: null },
      { id: 'elec-minimal', label: 'بسيط', preview: null },
    ],
  },
  {
    id: 'food',
    label: 'أغذية ومشروبات',
    icon: 'Pizza',
    description: 'مواد غذائية، مشروبات، حلويات',
    suggestedCategories: ['مواد غذائية', 'مشروبات', 'حلويات', 'بهارات', 'زيوت'],
    suggestedTags: ['طازج', 'توصيل سريع', 'جودة عالية'],
    templates: [
      { id: 'food-warm', label: 'دافئ', preview: null },
      { id: 'food-fresh', label: 'طازج', preview: null },
    ],
  },
  {
    id: 'digital',
    label: 'منتجات رقمية',
    icon: 'Monitor',
    description: 'حسابات، أكواد، اشتراكات، برامج',
    suggestedCategories: ['أكواد ألعاب', 'حسابات', 'اشتراكات', 'برامج', 'شحن'],
    suggestedTags: ['تسليم فوري', 'دعم ٢٤ ساعة'],
    templates: [
      { id: 'digital-store', label: 'متجر رقمي', preview: null },
      { id: 'digital-gaming', label: 'ألعاب', preview: null },
    ],
  },
  {
    id: 'services',
    label: 'خدمات',
    icon: 'Wrench',
    description: 'خدمات تصليح، تصميم، استشارات',
    suggestedCategories: ['تصليح', 'تصميم', 'استشارات', 'تعليم', 'تصوير'],
    suggestedTags: ['حجز موعد', 'خدمة سريعة'],
    templates: [
      { id: 'svc-professional', label: 'مهني', preview: null },
      { id: 'svc-creative', label: 'إبداعي', preview: null },
    ],
  },
]

export default INDUSTRIES