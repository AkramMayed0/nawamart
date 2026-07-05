const themes = [
  {
    name: 'Fashion Classic',
    slug: 'fashion-classic',
    description: 'قالب كلاسيكي أنيق مناسب لمتاجر الأزياء والملابس',
    category: 'fashion',
    type: 'free',
    price: 0,
    thumbnail: null,
    preview: null,
    version: '1.0.0',
    author: 'NawaMart',
    features: [
      'عرض شبكي للمنتجات',
      'شريط مميزات',
      'تصنيفات متقدمة',
      'بحث ذكي',
      'متجاوب مع الجوال',
    ],
    settings: {
      colors: {
        primary: '#1A1A2E',
        secondary: '#E94560',
        accent: '#0F3460',
        background: '#FAFAFA',
        surface: '#FFFFFF',
        text: '#1A1A2E',
        textMuted: '#6B7280',
        header: '#1A1A2E',
        footer: '#1A1A2E',
        button: '#E94560',
        buttonText: '#FFFFFF',
        success: '#27AE60',
        danger: '#E74C3C',
        warning: '#F39C12',
      },
      fonts: {
        heading: 'Cairo',
        body: 'Cairo',
      },
      layout: {
        headerStyle: 'classic',
        footerStyle: 'classic',
        productCardStyle: 'grid',
        sidebarPosition: 'right',
        containerWidth: '1280px',
      },
      spacing: {
        sectionPadding: '4rem',
        elementGap: '1.5rem',
      },
    },
    isActive: true,
    isDefault: false,
  },
  {
    name: 'Fashion Modern',
    slug: 'fashion-modern',
    description: 'قالب عصري أنيق مع تصميم جريء يناسب ماركات الأزياء العصرية',
    category: 'fashion',
    type: 'premium',
    price: 29.99,
    thumbnail: null,
    preview: null,
    version: '1.0.0',
    author: 'NawaMart',
    features: [
      'عرض شبكي للمنتجات',
      'عرض كامل الشاشة',
      'صور بانورامية',
      'شريط مميزات متحرك',
      'تصنيفات متقدمة',
      'متجاوب مع الجوال',
    ],
    settings: {
      colors: {
        primary: '#000000',
        secondary: '#FFFFFF',
        accent: '#D4AF37',
        background: '#FFFFFF',
        surface: '#F8F8F8',
        text: '#000000',
        textMuted: '#6B7280',
        header: '#000000',
        footer: '#000000',
        button: '#D4AF37',
        buttonText: '#000000',
        success: '#27AE60',
        danger: '#E74C3C',
        warning: '#F39C12',
      },
      fonts: {
        heading: 'Cairo',
        body: 'Cairo',
      },
      layout: {
        headerStyle: 'minimal',
        footerStyle: 'minimal',
        productCardStyle: 'grid',
        sidebarPosition: 'none',
        containerWidth: '100%',
      },
      spacing: {
        sectionPadding: '5rem',
        elementGap: '2rem',
      },
    },
    isActive: true,
    isDefault: false,
  },
  {
    name: 'Fashion Luxury',
    slug: 'fashion-luxury',
    description: 'قالب فاخر لمنتجات الأزياء الراقية والمجوهرات',
    category: 'fashion',
    type: 'premium',
    price: 49.99,
    thumbnail: null,
    preview: null,
    version: '1.0.0',
    author: 'NawaMart',
    features: [
      'تصميم فاخر',
      'صور عالية الجودة',
      'عرض شبكي كبير',
      'مؤثرات بصرية',
      'شريط علامات تجارية',
      'متجاوب مع الجوال',
    ],
    settings: {
      colors: {
        primary: '#1C1C1C',
        secondary: '#C9A96E',
        accent: '#8B7355',
        background: '#F5F0EB',
        surface: '#FFFFFF',
        text: '#1C1C1C',
        textMuted: '#8B7355',
        header: '#1C1C1C',
        footer: '#1C1C1C',
        button: '#C9A96E',
        buttonText: '#1C1C1C',
        success: '#27AE60',
        danger: '#E74C3C',
        warning: '#F39C12',
      },
      fonts: {
        heading: 'Cairo',
        body: 'Cairo',
      },
      layout: {
        headerStyle: 'centered',
        footerStyle: 'classic',
        productCardStyle: 'grid',
        sidebarPosition: 'right',
        containerWidth: '1280px',
      },
      spacing: {
        sectionPadding: '6rem',
        elementGap: '2.5rem',
      },
    },
    isActive: true,
    isDefault: false,
  },
  {
    name: 'Tech Minimal',
    slug: 'electronics-minimal',
    description: 'قالب بسيط وعصري مناسب لمتاجر الإلكترونيات',
    category: 'electronics',
    type: 'free',
    price: 0,
    thumbnail: null,
    preview: null,
    version: '1.0.0',
    author: 'NawaMart',
    features: [
      'تصميم بسيط',
      'عرض منتجات شبكي',
      'شريط مميزات',
      'أيقونات تقنية',
      'متجاوب مع الجوال',
    ],
    settings: {
      colors: {
        primary: '#0F172A',
        secondary: '#3B82F6',
        accent: '#06B6D4',
        background: '#F8FAFC',
        surface: '#FFFFFF',
        text: '#0F172A',
        textMuted: '#64748B',
        header: '#0F172A',
        footer: '#0F172A',
        button: '#3B82F6',
        buttonText: '#FFFFFF',
        success: '#10B981',
        danger: '#EF4444',
        warning: '#F59E0B',
      },
      fonts: {
        heading: 'Cairo',
        body: 'Cairo',
      },
      layout: {
        headerStyle: 'classic',
        footerStyle: 'classic',
        productCardStyle: 'grid',
        sidebarPosition: 'left',
        containerWidth: '1280px',
      },
      spacing: {
        sectionPadding: '4rem',
        elementGap: '1.5rem',
      },
    },
    isActive: true,
    isDefault: false,
  },
  {
    name: 'Tech Bold',
    slug: 'electronics-bold',
    description: 'قالب جريء مع ألوان داكنة يناسب متاجر التكنولوجيا',
    category: 'electronics',
    type: 'premium',
    price: 29.99,
    thumbnail: null,
    preview: null,
    version: '1.0.0',
    author: 'NawaMart',
    features: [
      'وضع داكن',
      'تصميم جريء',
      'شريط منتجات متحرك',
      'مقارنة المنتجات',
      'متجاوب مع الجوال',
    ],
    settings: {
      colors: {
        primary: '#020617',
        secondary: '#6366F1',
        accent: '#22D3EE',
        background: '#0F172A',
        surface: '#1E293B',
        text: '#F1F5F9',
        textMuted: '#94A3B8',
        header: '#020617',
        footer: '#020617',
        button: '#6366F1',
        buttonText: '#FFFFFF',
        success: '#10B981',
        danger: '#EF4444',
        warning: '#F59E0B',
      },
      fonts: {
        heading: 'Cairo',
        body: 'Cairo',
      },
      layout: {
        headerStyle: 'classic',
        footerStyle: 'classic',
        productCardStyle: 'grid',
        sidebarPosition: 'left',
        containerWidth: '1280px',
      },
      spacing: {
        sectionPadding: '5rem',
        elementGap: '2rem',
      },
    },
    isActive: true,
    isDefault: false,
  },
  {
    name: 'Tech Store',
    slug: 'electronics-store',
    description: 'قالب متكامل لمتاجر الإلكترونيات والأجهزة الذكية',
    category: 'electronics',
    type: 'premium',
    price: 39.99,
    thumbnail: null,
    preview: null,
    version: '1.0.0',
    author: 'NawaMart',
    features: [
      'عرض منتجات متقدم',
      'فلترة ذكية',
      'مخطط مقارنة',
      'شريط عروض',
      'تصنيفات متعددة',
      'متجاوب مع الجوال',
    ],
    settings: {
      colors: {
        primary: '#0C1929',
        secondary: '#2563EB',
        accent: '#7C3AED',
        background: '#F1F5F9',
        surface: '#FFFFFF',
        text: '#0C1929',
        textMuted: '#475569',
        header: '#0C1929',
        footer: '#0C1929',
        button: '#2563EB',
        buttonText: '#FFFFFF',
        success: '#059669',
        danger: '#DC2626',
        warning: '#D97706',
      },
      fonts: {
        heading: 'Cairo',
        body: 'Cairo',
      },
      layout: {
        headerStyle: 'classic',
        footerStyle: 'classic',
        productCardStyle: 'grid',
        sidebarPosition: 'right',
        containerWidth: '1320px',
      },
      spacing: {
        sectionPadding: '4rem',
        elementGap: '1.5rem',
      },
    },
    isActive: true,
    isDefault: false,
  },
  {
    name: 'Food Fresh',
    slug: 'food-fresh',
    description: 'قالب طازج ونظيف يناسب متاجر الأطعمة والمشروبات',
    category: 'food',
    type: 'free',
    price: 0,
    thumbnail: null,
    preview: null,
    version: '1.0.0',
    author: 'NawaMart',
    features: [
      'تصميم طازج',
      'ألوان طبيعية',
      'قائمة طعام',
      'عرض منتجات شهية',
      'متجاوب مع الجوال',
    ],
    settings: {
      colors: {
        primary: '#166534',
        secondary: '#22C55E',
        accent: '#EAB308',
        background: '#F0FDF4',
        surface: '#FFFFFF',
        text: '#14532D',
        textMuted: '#6B7280',
        header: '#166534',
        footer: '#14532D',
        button: '#22C55E',
        buttonText: '#FFFFFF',
        success: '#27AE60',
        danger: '#E74C3C',
        warning: '#F39C12',
      },
      fonts: {
        heading: 'Cairo',
        body: 'Cairo',
      },
      layout: {
        headerStyle: 'classic',
        footerStyle: 'classic',
        productCardStyle: 'grid',
        sidebarPosition: 'right',
        containerWidth: '1280px',
      },
      spacing: {
        sectionPadding: '4rem',
        elementGap: '1.5rem',
      },
    },
    isActive: true,
    isDefault: false,
  },
  {
    name: 'Food Organic',
    slug: 'food-organic',
    description: 'قالب عضوي دافئ يناسب متاجر الأطعمة الطبيعية',
    category: 'food',
    type: 'premium',
    price: 29.99,
    thumbnail: null,
    preview: null,
    version: '1.0.0',
    author: 'NawaMart',
    features: [
      'تصميم عضوي',
      'شريط منتجات متميز',
      'عرض الوصفات',
      'أيقونات مواد طبيعية',
      'تصنيفات الأطعمة',
      'متجاوب مع الجوال',
    ],
    settings: {
      colors: {
        primary: '#5D4037',
        secondary: '#8D6E63',
        accent: '#FF6F00',
        background: '#FFF8E1',
        surface: '#FFFFFF',
        text: '#3E2723',
        textMuted: '#8D6E63',
        header: '#5D4037',
        footer: '#3E2723',
        button: '#FF6F00',
        buttonText: '#FFFFFF',
        success: '#27AE60',
        danger: '#E74C3C',
        warning: '#F39C12',
      },
      fonts: {
        heading: 'Cairo',
        body: 'Cairo',
      },
      layout: {
        headerStyle: 'classic',
        footerStyle: 'minimal',
        productCardStyle: 'grid',
        sidebarPosition: 'right',
        containerWidth: '1280px',
      },
      spacing: {
        sectionPadding: '4rem',
        elementGap: '2rem',
      },
    },
    isActive: true,
    isDefault: false,
  },
  {
    name: 'Food Restaurant',
    slug: 'food-restaurant',
    description: 'قالب مطعم متكامل مع قائمة طعام رقمية',
    category: 'food',
    type: 'premium',
    price: 49.99,
    thumbnail: null,
    preview: null,
    version: '1.0.0',
    author: 'NawaMart',
    features: [
      'قائمة طعام رقمية',
      'عرض الأطباق',
      'نظام طلب سريع',
      'شريط عروض اليوم',
      'صور طعام عالية الجودة',
      'متجاوب مع الجوال',
    ],
    settings: {
      colors: {
        primary: '#8B0000',
        secondary: '#DAA520',
        accent: '#FF8C00',
        background: '#FFF8DC',
        surface: '#FFFFFF',
        text: '#2C1810',
        textMuted: '#8B7355',
        header: '#8B0000',
        footer: '#2C1810',
        button: '#DAA520',
        buttonText: '#FFFFFF',
        success: '#27AE60',
        danger: '#E74C3C',
        warning: '#F39C12',
      },
      fonts: {
        heading: 'Cairo',
        body: 'Cairo',
      },
      layout: {
        headerStyle: 'classic',
        footerStyle: 'classic',
        productCardStyle: 'grid',
        sidebarPosition: 'none',
        containerWidth: '1280px',
      },
      spacing: {
        sectionPadding: '5rem',
        elementGap: '2rem',
      },
    },
    isActive: true,
    isDefault: false,
  },
  {
    name: 'Digital Modern',
    slug: 'digital-modern',
    description: 'قالب عصري للمنتجات الرقمية والدورات التعليمية',
    category: 'digital',
    type: 'free',
    price: 0,
    thumbnail: null,
    preview: null,
    version: '1.0.0',
    author: 'NawaMart',
    features: [
      'تصميم عصري',
      'عرض منتجات رقمية',
      'شريط مميزات',
      'متجاوب مع الجوال',
    ],
    settings: {
      colors: {
        primary: '#1E1B4B',
        secondary: '#7C3AED',
        accent: '#F59E0B',
        background: '#F5F3FF',
        surface: '#FFFFFF',
        text: '#1E1B4B',
        textMuted: '#6B7280',
        header: '#1E1B4B',
        footer: '#1E1B4B',
        button: '#7C3AED',
        buttonText: '#FFFFFF',
        success: '#10B981',
        danger: '#EF4444',
        warning: '#F59E0B',
      },
      fonts: {
        heading: 'Cairo',
        body: 'Cairo',
      },
      layout: {
        headerStyle: 'classic',
        footerStyle: 'classic',
        productCardStyle: 'grid',
        sidebarPosition: 'right',
        containerWidth: '1280px',
      },
      spacing: {
        sectionPadding: '4rem',
        elementGap: '1.5rem',
      },
    },
    isActive: true,
    isDefault: false,
  },
  {
    name: 'Digital Clean',
    slug: 'digital-clean',
    description: 'قالب نظيف وبسيط للمحتوى الرقمي والكتب الإلكترونية',
    category: 'digital',
    type: 'premium',
    price: 19.99,
    thumbnail: null,
    preview: null,
    version: '1.0.0',
    author: 'NawaMart',
    features: [
      'تصميم نظيف',
      'قراءة سهلة',
      'عرض المحتوى',
      'تصنيفات',
      'متجاوب مع الجوال',
    ],
    settings: {
      colors: {
        primary: '#1F2937',
        secondary: '#374151',
        accent: '#2563EB',
        background: '#FFFFFF',
        surface: '#F9FAFB',
        text: '#111827',
        textMuted: '#6B7280',
        header: '#1F2937',
        footer: '#1F2937',
        button: '#2563EB',
        buttonText: '#FFFFFF',
        success: '#059669',
        danger: '#DC2626',
        warning: '#D97706',
      },
      fonts: {
        heading: 'Cairo',
        body: 'Cairo',
      },
      layout: {
        headerStyle: 'minimal',
        footerStyle: 'minimal',
        productCardStyle: 'list',
        sidebarPosition: 'right',
        containerWidth: '1200px',
      },
      spacing: {
        sectionPadding: '4rem',
        elementGap: '1.5rem',
      },
    },
    isActive: true,
    isDefault: false,
  },
  {
    name: 'Digital Creative',
    slug: 'digital-creative',
    description: 'قالب إبداعي للمصورين والمصممين والمواهب الرقمية',
    category: 'digital',
    type: 'premium',
    price: 39.99,
    thumbnail: null,
    preview: null,
    version: '1.0.0',
    author: 'NawaMart',
    features: [
      'تصميم إبداعي',
      'عرض شبكي جذاب',
      'معرض أعمال',
      'مؤثرات بصرية',
      'مربعات إبداعية',
      'متجاوب مع الجوال',
    ],
    settings: {
      colors: {
        primary: '#0F0F0F',
        secondary: '#E2E8F0',
        accent: '#EC4899',
        background: '#FAFAFA',
        surface: '#FFFFFF',
        text: '#0F0F0F',
        textMuted: '#6B7280',
        header: '#0F0F0F',
        footer: '#0F0F0F',
        button: '#EC4899',
        buttonText: '#FFFFFF',
        success: '#10B981',
        danger: '#EF4444',
        warning: '#F59E0B',
      },
      fonts: {
        heading: 'Cairo',
        body: 'Cairo',
      },
      layout: {
        headerStyle: 'minimal',
        footerStyle: 'simple',
        productCardStyle: 'grid',
        sidebarPosition: 'none',
        containerWidth: '100%',
      },
      spacing: {
        sectionPadding: '6rem',
        elementGap: '2rem',
      },
    },
    isActive: true,
    isDefault: false,
  },
];

// ─── 10 Premium Themes ─────────────────────────────────────────────────────
const premiumThemes = [
  // ─── 1. Urban Street (fashion) ──────────────────────────────────────────────
  {
    name: 'Urban Street',
    slug: 'urban-street',
    description: 'قالب مستوحى من ثقافة الشارع والجرافيتي — جريء، لافت، وعصري',
    category: 'fashion',
    type: 'premium',
    price: 49.99,
    thumbnail: null,
    preview: null,
    version: '2.0.0',
    author: 'NawaMart Pro',
    features: [
      'تصميم جرافيتي جريء',
      'أزرار كبيرة واضحة',
      'شريط إعلانات متحرك',
      'بطاقات منتجات غير تقليدية',
      'تباين ألوان عالي',
      'تأثيرات طباعة مائلة',
    ],
    settings: {
      colors: {
        primary: '#1A0A00',
        secondary: '#FF2E00',
        accent: '#FFD700',
        background: '#FFF8F0',
        surface: '#FFFFFF',
        text: '#1A0A00',
        textMuted: '#8B7355',
        header: '#1A0A00',
        footer: '#1A0A00',
        button: '#FF2E00',
        buttonText: '#FFFFFF',
        success: '#27AE60',
        danger: '#E74C3C',
        warning: '#F39C12',
      },
      fonts: {
        heading: 'Cairo',
        body: 'Cairo',
        sizes: { h1: '3rem', h2: '2.25rem', h3: '1.75rem', body: '1rem', bodySmall: '0.875rem' },
      },
      layout: {
        headerStyle: 'compact',
        footerStyle: 'compact',
        productCardStyle: 'grid',
        sidebarPosition: 'none',
        containerWidth: '100%',
        borderRadius: 'none',
        card: { radius: '0', shadow: 'lg', padding: '1.25rem' },
      },
      spacing: { sectionPadding: '6rem', elementGap: '2rem' },
    },
    fullSettings: {
      buttons: {
        primary: {
          background: '#FF2E00', text: '#FFFFFF', hover: '#CC2500',
          border: '#FF2E00', radius: '0', padding: '1rem 2rem',
          font: 'Cairo', shadow: true, animation: 'pulse',
        },
        secondary: {
          background: 'transparent', text: '#1A0A00', hover: '#FFF0E6',
          border: '#1A0A00', radius: '0', padding: '0.75rem 1.5rem',
          font: 'Cairo', shadow: false, animation: 'none',
        },
      },
      badges: {
        sale: { text: '🔥 عرض', position: 'top-left', background: '#FF2E00', textColor: '#FFFFFF', shape: 'rectangle', size: 'lg' },
        bestSeller: { text: '⭐ الأكثر مبيعاً', position: 'top-right', background: '#FFD700', textColor: '#1A0A00', shape: 'pill', size: 'md' },
      },
      layout: {
        card: { radius: '0', shadow: 'lg', padding: '1.25rem' },
      },
    },
    assets: {
      css: `/* Urban Street — bold graffiti aesthetic */
.product-card { border: 2px solid #1A0A00; transition: transform 0.2s, box-shadow 0.2s; }
.product-card:hover { transform: translateY(-4px); box-shadow: 8px 8px 0 #1A0A00; }
.btn-primary { text-transform: uppercase; letter-spacing: 2px; font-weight: 900; }
h1, h2, h3 { text-transform: uppercase; letter-spacing: 1px; }
.announcement-bar { background: repeating-linear-gradient(-45deg, #FF2E00, #FF2E00 10px, #CC2500 10px, #CC2500 20px) !important; }`,
    },
  },

  // ─── 2. Minimal Chic (fashion) ─────────────────────────────────────────────
  {
    name: 'Minimal Chic',
    slug: 'minimal-chic',
    description: 'جماليات يابانية بسيطة — مساحة بيضاء وفيرة، خطوط رفيعة، وأناقة هادئة',
    category: 'fashion',
    type: 'premium',
    price: 59.99,
    thumbnail: null,
    preview: null,
    version: '2.0.0',
    author: 'NawaMart Pro',
    features: [
      'تصميم بسيط راقي',
      'مساحات بيضاء واسعة',
      'خطوط رفيعة وأنيقة',
      'بطاقات منتجات نظيفة',
      'صور كاملة العرض',
      'تأثيرات شفافة ناعمة',
    ],
    settings: {
      colors: {
        primary: '#2D2D2D',
        secondary: '#9C9C9C',
        accent: '#1A1A1A',
        background: '#F7F7F7',
        surface: '#FFFFFF',
        text: '#2D2D2D',
        textMuted: '#9C9C9C',
        header: '#FFFFFF',
        footer: '#2D2D2D',
        button: '#2D2D2D',
        buttonText: '#FFFFFF',
        success: '#27AE60',
        danger: '#E74C3C',
        warning: '#F39C12',
      },
      fonts: {
        heading: 'Noto Kufi Arabic',
        body: 'Noto Kufi Arabic',
        sizes: { h1: '2rem', h2: '1.5rem', h3: '1.25rem', body: '0.938rem', bodySmall: '0.813rem' },
      },
      layout: {
        headerStyle: 'centered',
        footerStyle: 'minimal',
        productCardStyle: 'list',
        sidebarPosition: 'none',
        containerWidth: '1100px',
        borderRadius: 'none',
        card: { radius: '0', shadow: 'none', padding: '2rem' },
      },
      spacing: { sectionPadding: '6rem', elementGap: '3rem' },
    },
    fullSettings: {
      typography: {
        heading: { family: 'Noto Kufi Arabic', source: 'google', weight: '300', spacing: '0.15em', lineHeight: '1.6', transform: 'uppercase' },
        body: { family: 'Noto Kufi Arabic', source: 'google', weight: '300', spacing: '0.05em', lineHeight: '2' },
        accent: { family: 'Noto Kufi Arabic', source: 'google', weight: '400', spacing: '0.1em', lineHeight: '1.8' },
        button: { family: 'Noto Kufi Arabic', weight: '400', transform: 'uppercase' },
        sizes: { h1: '2rem', h2: '1.5rem', h3: '1.25rem', h4: '1.125rem', h5: '1rem', h6: '0.875rem', body: '0.938rem', bodySmall: '0.813rem', bodyLarge: '1.063rem' },
      },
      buttons: {
        primary: {
          background: '#2D2D2D', text: '#FFFFFF', hover: '#1A1A1A',
          border: '#2D2D2D', radius: '0', padding: '0.75rem 2.5rem',
          font: 'Noto Kufi Arabic', shadow: false, animation: 'none',
        },
        secondary: {
          background: 'transparent', text: '#2D2D2D', hover: '#F0F0F0',
          border: '#2D2D2D', radius: '0', padding: '0.75rem 2.5rem',
          font: 'Noto Kufi Arabic', shadow: false, animation: 'none',
        },
      },
      badges: {
        sale: { text: 'SALE', position: 'top-left', background: '#2D2D2D', textColor: '#FFFFFF', shape: 'rectangle', size: 'sm' },
        new: { text: 'NEW', position: 'top-right', background: '#9C9C9C', textColor: '#FFFFFF', shape: 'rectangle', size: 'sm', autoExpire: true, expireDays: 30 },
      },
      header: {
        layout: { preset: 'centered', sticky: true, transparent: false, height: '100px' },
        nav: { alignment: 'center', spacing: '3rem', font: 'Noto Kufi Arabic', megaMenu: false, dropdownAnimation: 'fade' },
      },
      layout: {
        card: { radius: '0', shadow: 'none', padding: '2rem' },
        grid: { productsPerRow: { desktop: 3, tablet: 2, mobile: 1 }, gap: { desktop: '2.5rem', tablet: '2rem', mobile: '1.5rem' } },
      },
    },
    assets: {
      css: `/* Minimal Chic — Japanese-inspired minimalism */
.product-card { border: none; border-bottom: 1px solid #E8E8E8; padding: 2rem; }
.product-card:hover { opacity: 0.7; }
.btn-primary { letter-spacing: 3px; font-size: 0.75rem; }
h1, h2, h3 { letter-spacing: 3px; font-weight: 300; }
.section-title { text-align: center; margin-bottom: 4rem; }
body { letter-spacing: 0.3px; }`,
    },
  },

  // ─── 3. Cyberpunk (electronics) ────────────────────────────────────────────
  {
    name: 'Cyberpunk',
    slug: 'cyberpunk',
    description: 'عالم مستقبلي بوهج نيون وألوان داكنة — لتجار التكنولوجيا والألعاب',
    category: 'electronics',
    type: 'premium',
    price: 69.99,
    thumbnail: null,
    preview: null,
    version: '2.0.0',
    author: 'NawaMart Pro',
    features: [
      'وضع داكن كامل',
      'أزهار نيون متوهجة',
      'بطاقات زجاجية شفافة',
      'حواف مشعة',
      'تأثيرات حركية',
      'أيقونات مستقبلية',
    ],
    settings: {
      colors: {
        primary: '#0B0B1A',
        secondary: '#FF00FF',
        accent: '#00FFFF',
        background: '#0B0B1A',
        surface: '#12122A',
        text: '#E0E0FF',
        textMuted: '#6B6B9A',
        header: '#0B0B1A',
        footer: '#0B0B1A',
        button: '#FF00FF',
        buttonText: '#FFFFFF',
        success: '#00FF88',
        danger: '#FF0044',
        warning: '#FFAA00',
      },
      fonts: {
        heading: 'Cairo',
        body: 'Cairo',
        sizes: { h1: '2.75rem', h2: '2rem', h3: '1.5rem', body: '1rem', bodySmall: '0.875rem' },
      },
      layout: {
        headerStyle: 'classic',
        footerStyle: 'classic',
        productCardStyle: 'grid',
        sidebarPosition: 'left',
        containerWidth: '1280px',
        borderRadius: 'sm',
        card: { radius: '0.375rem', shadow: 'lg', padding: '1rem' },
      },
      spacing: { sectionPadding: '5rem', elementGap: '1.5rem' },
    },
    fullSettings: {
      colors: {
        backgrounds: { main: '#0B0B1A', surface: '#12122A', section: '#0F0F22' },
        borders: { default: '#2A2A5A', hover: '#FF00FF', light: '#1A1A3A' },
        textColors: { heading: '#FFFFFF', body: '#C0C0E0', muted: '#6B6B9A', link: '#00FFFF', price: '#FF00FF', onDark: '#FFFFFF' },
        headerColors: { background: '#0B0B1A', text: '#00FFFF', link: '#FF00FF' },
        footerColors: { background: '#060612', text: '#6B6B9A', link: '#00FFFF', heading: '#FFFFFF' },
        cartCheckout: { primary: '#FF00FF', secondary: '#00FFFF' },
      },
      buttons: {
        primary: {
          background: '#FF00FF', text: '#FFFFFF', hover: '#CC00CC',
          border: '#FF00FF', radius: '0.25rem', padding: '0.75rem 1.5rem',
          font: 'Cairo', shadow: true, animation: 'glow',
        },
        secondary: {
          background: 'transparent', text: '#00FFFF', hover: '#0D0D2D',
          border: '#00FFFF', radius: '0.25rem', padding: '0.75rem 1.5rem',
          font: 'Cairo', shadow: false, animation: 'none',
        },
        small: { radius: '0.25rem', padding: '0.375rem 0.75rem', size: '0.875rem' },
        quantity: { radius: '0.25rem', padding: '0.25rem', size: '2rem', style: 'default' },
      },
      badges: {
        sale: { text: '⚡ تخفيض', position: 'top-left', background: '#FF0044', textColor: '#FFFFFF', shape: 'rectangle', size: 'md' },
        new: { text: '🆕 جديد', position: 'top-right', background: '#00FFFF', textColor: '#0B0B1A', shape: 'rectangle', size: 'sm', autoExpire: true, expireDays: 14 },
        lowStock: { enabled: true, text: 'متبقي قليل', position: 'bottom-left', background: '#FFAA00', textColor: '#0B0B1A', shape: 'rectangle', size: 'sm', threshold: 10 },
        bestSeller: { text: '🏆 الأكثر مبيعاً', position: 'top-right', background: '#FF00FF', textColor: '#FFFFFF', shape: 'pill', size: 'sm' },
      },
      layout: {
        card: { radius: '0.375rem', shadow: 'lg', padding: '1rem' },
        grid: { productsPerRow: { desktop: 4, tablet: 2, mobile: 1 }, gap: { desktop: '1rem', tablet: '0.75rem', mobile: '0.5rem' } },
        animationEnabled: true,
      },
      header: {
        layout: { preset: 'classic', sticky: true, transparent: false, height: '70px' },
        search: { style: 'expandable', position: 'left', suggestions: true },
        icons: { size: '22px', color: '#00FFFF' },
      },
    },
    assets: {
      css: `/* Cyberpunk — neon glow futuristic */
@keyframes glow { 0%, 100% { box-shadow: 0 0 5px #FF00FF, 0 0 10px #FF00FF; } 50% { box-shadow: 0 0 20px #FF00FF, 0 0 40px #FF00FF; } }
.btn-primary { animation: glow 2s infinite; text-transform: uppercase; letter-spacing: 2px; font-size: 0.8rem; }
.product-card { background: rgba(18, 18, 42, 0.8) !important; backdrop-filter: blur(10px); border: 1px solid #2A2A5A; }
.product-card:hover { border-color: #FF00FF; box-shadow: 0 0 15px rgba(255, 0, 255, 0.3); }
h1, h2, h3 { text-shadow: 0 0 10px rgba(0, 255, 255, 0.5); }
.announcement-bar { background: linear-gradient(90deg, #FF00FF, #00FFFF) !important; color: #0B0B1A !important; }`,
    },
  },

  // ─── 4. Clean Tech (electronics) ────────────────────────────────────────────
  {
    name: 'Clean Tech',
    slug: 'clean-tech',
    description: 'جمالية آبل البيضاء — أنيق، نظيف، مع مساحات واسعة للصور الكبيرة',
    category: 'electronics',
    type: 'premium',
    price: 54.99,
    thumbnail: null,
    preview: null,
    version: '2.0.0',
    author: 'NawaMart Pro',
    features: [
      'تصميم أبيض أنيق',
      'بطاقات بدون حواف',
      'صور منتجات كبيرة',
      'مسافات واسعة',
      'تأثيرات شفافة',
      'تركيز على المنتج',
    ],
    settings: {
      colors: {
        primary: '#1D1D1F',
        secondary: '#86868B',
        accent: '#0071E3',
        background: '#F5F5F7',
        surface: '#FFFFFF',
        text: '#1D1D1F',
        textMuted: '#86868B',
        header: '#FFFFFF',
        footer: '#F5F5F7',
        button: '#0071E3',
        buttonText: '#FFFFFF',
        success: '#30D158',
        danger: '#FF453A',
        warning: '#FF9F0A',
      },
      fonts: {
        heading: 'Cairo',
        body: 'Cairo',
        sizes: { h1: '3rem', h2: '2rem', h3: '1.25rem', body: '1rem', bodySmall: '0.875rem' },
      },
      layout: {
        headerStyle: 'minimal',
        footerStyle: 'minimal',
        productCardStyle: 'grid',
        sidebarPosition: 'none',
        containerWidth: '1100px',
        borderRadius: 'xl',
        card: { radius: '1rem', shadow: 'none', padding: '1.5rem' },
      },
      spacing: { sectionPadding: '6rem', elementGap: '2rem' },
    },
    fullSettings: {
      buttons: {
        primary: {
          background: '#0071E3', text: '#FFFFFF', hover: '#0060C9',
          border: '#0071E3', radius: '1.5rem', padding: '0.75rem 2rem',
          font: 'Cairo', shadow: false, animation: 'none',
        },
        secondary: {
          background: 'transparent', text: '#0071E3', hover: '#E8F0FE',
          border: '#0071E3', radius: '1.5rem', padding: '0.75rem 2rem',
          font: 'Cairo', shadow: false, animation: 'none',
        },
        small: { radius: '0.75rem', padding: '0.375rem 0.75rem', size: '0.875rem' },
        quantity: { radius: '0.75rem', padding: '0.25rem', size: '2rem', style: 'rounded' },
      },
      badges: {
        sale: { text: 'تخفيض', position: 'top-left', background: '#FF453A', textColor: '#FFFFFF', shape: 'pill', size: 'sm' },
        soldOut: { text: 'نفد', position: 'top-right', background: '#86868B', textColor: '#FFFFFF', shape: 'pill', size: 'sm' },
        new: { text: 'جديد', position: 'top-right', background: '#30D158', textColor: '#FFFFFF', shape: 'pill', size: 'sm', autoExpire: true, expireDays: 30 },
        bestSeller: { text: 'الأكثر مبيعاً', position: 'top-left', background: '#0071E3', textColor: '#FFFFFF', shape: 'pill', size: 'sm' },
      },
      header: {
        layout: { preset: 'minimal', sticky: true, transparent: true, height: '80px' },
        logo: { type: 'text', text: 'متجري', size: { desktop: '120px', tablet: '100px', mobile: '80px' } },
        nav: { alignment: 'center', spacing: '2.5rem', font: 'Cairo', megaMenu: false, dropdownAnimation: 'fade' },
        search: { style: 'icon', position: 'right', suggestions: true },
      },
      layout: {
        card: { radius: '1rem', shadow: 'none', padding: '1.5rem' },
        sectionSpacing: '6rem',
      },
    },
    assets: {
      css: `/* Clean Tech — Apple-inspired minimalism */
.product-card { border: none; border-radius: 1rem; background: #FFFFFF; }
.product-card:hover { transform: scale(1.02); transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.btn-primary { border-radius: 1.5rem; font-weight: 600; transition: all 0.2s; }
.btn-primary:hover { transform: scale(1.02); }
h1 { font-weight: 700; letter-spacing: -0.5px; }
.section-title { font-weight: 600; font-size: 1.25rem; color: #86868B; }`,
    },
  },

  // ─── 5. Artisan Bakery (food) ──────────────────────────────────────────────
  {
    name: 'Artisan Bakery',
    slug: 'artisan-bakery',
    description: 'مخبز حرفي دافئ — ألوان ترابية، زوايا ناعمة، وخطوط يدوية',
    category: 'food',
    type: 'premium',
    price: 44.99,
    thumbnail: null,
    preview: null,
    version: '2.0.0',
    author: 'NawaMart Pro',
    features: [
      'بطاقات مستديرة ناعمة',
      'ألوان ترابية دافئة',
      'خطوط يدوية',
      'خلفيات مناديل ورقية',
      'أيقونات طعام مميزة',
      'شريط وصفات يومية',
    ],
    settings: {
      colors: {
        primary: '#5C3A21',
        secondary: '#A67C52',
        accent: '#D4813E',
        background: '#FFF7ED',
        surface: '#FFFFFF',
        text: '#3E2723',
        textMuted: '#8D6E63',
        header: '#5C3A21',
        footer: '#3E2723',
        button: '#D4813E',
        buttonText: '#FFFFFF',
        success: '#689F38',
        danger: '#C62828',
        warning: '#F57F17',
      },
      fonts: {
        heading: 'Cairo',
        body: 'Cairo',
        sizes: { h1: '2.5rem', h2: '1.875rem', h3: '1.5rem', body: '1rem', bodySmall: '0.875rem' },
      },
      layout: {
        headerStyle: 'classic',
        footerStyle: 'classic',
        productCardStyle: 'grid',
        sidebarPosition: 'right',
        containerWidth: '1200px',
        borderRadius: 'lg',
        card: { radius: '1.25rem', shadow: 'md', padding: '1.25rem' },
      },
      spacing: { sectionPadding: '5rem', elementGap: '2rem' },
    },
    fullSettings: {
      colors: {
        backgrounds: { main: '#FFF7ED', surface: '#FFFFFF', section: '#FFEDD5' },
        borders: { default: '#E6D5C3', hover: '#D4813E', light: '#F5E6D3' },
      },
      typography: {
        heading: { family: 'Cairo', source: 'google', weight: '700', spacing: '0.02em', lineHeight: '1.3', transform: 'none' },
        body: { family: 'Cairo', source: 'google', weight: '400', spacing: '0.02em', lineHeight: '1.8' },
        accent: { family: 'Cairo', source: 'google', weight: '600', spacing: '0.03em', lineHeight: '1.5' },
      },
      buttons: {
        primary: {
          background: '#D4813E', text: '#FFFFFF', hover: '#BF6B2E',
          border: '#D4813E', radius: '1.5rem', padding: '0.75rem 2rem',
          font: 'Cairo', shadow: false, animation: 'none',
        },
        secondary: {
          background: 'transparent', text: '#5C3A21', hover: '#FFF0E0',
          border: '#A67C52', radius: '1.5rem', padding: '0.75rem 2rem',
          font: 'Cairo', shadow: false, animation: 'none',
        },
      },
      badges: {
        sale: { text: '🍞 طازج', position: 'top-left', background: '#D4813E', textColor: '#FFFFFF', shape: 'pill', size: 'md' },
        new: { text: '🧁 جديد', position: 'top-right', background: '#689F38', textColor: '#FFFFFF', shape: 'pill', size: 'sm', autoExpire: true, expireDays: 7 },
        lowStock: { enabled: true, text: 'كمية محدودة', position: 'bottom-left', background: '#F57F17', textColor: '#FFFFFF', shape: 'pill', size: 'sm', threshold: 3 },
      },
      header: {
        layout: { preset: 'classic', sticky: true, transparent: false, height: '80px' },
        nav: { spacing: '2rem', font: 'Cairo' },
        bars: {
          announcement: {
            text: '🍞 مخبوزات طازجة يومياً — اطلب الآن!',
            link: null, background: '#D4813E', textColor: '#FFFFFF', dismissible: true, rotate: false,
          },
        },
      },
      layout: {
        card: { radius: '1.25rem', shadow: 'md', padding: '1.25rem' },
      },
    },
    assets: {
      css: `/* Artisan Bakery — warm handcrafted feel */
.product-card { background: #FFFFFF; border: 1px solid #E6D5C3; border-radius: 1.25rem; overflow: hidden; }
.product-card:hover { border-color: #D4813E; box-shadow: 0 8px 24px rgba(212, 129, 62, 0.15); }
.product-card img { border-radius: 1.25rem 1.25rem 0 0; }
.btn-primary { border-radius: 1.5rem; font-weight: 700; }
h1, h2, h3 { color: #5C3A21; }
body { background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4813e' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E"); }`,
    },
  },

  // ─── 6. Tropical Juice (food) ──────────────────────────────────────────────
  {
    name: 'Tropical Juice',
    slug: 'tropical-juice',
    description: 'انفجار استوائي من الألوان — حيوي، منعش، ومليء بالطاقة',
    category: 'food',
    type: 'premium',
    price: 39.99,
    thumbnail: null,
    preview: null,
    version: '2.0.0',
    author: 'NawaMart Pro',
    features: [
      'ألوان زاهية جداً',
      'بطاقات دائرية',
      'تأثيرات فقاعات',
      'خطوط مرحة',
      'شريط وصفات',
      'أيقونات فواكه',
    ],
    settings: {
      colors: {
        primary: '#FF6B35',
        secondary: '#FFD166',
        accent: '#06D6A0',
        background: '#FFF8F0',
        surface: '#FFFFFF',
        text: '#2D3436',
        textMuted: '#A29BFE',
        header: '#FF6B35',
        footer: '#2D3436',
        button: '#06D6A0',
        buttonText: '#FFFFFF',
        success: '#00B894',
        danger: '#E17055',
        warning: '#FDCB6E',
      },
      fonts: {
        heading: 'Cairo',
        body: 'Cairo',
        sizes: { h1: '3rem', h2: '2.25rem', h3: '1.75rem', body: '1.063rem', bodySmall: '0.875rem' },
      },
      layout: {
        headerStyle: 'centered',
        footerStyle: 'compact',
        productCardStyle: 'grid',
        sidebarPosition: 'none',
        containerWidth: '1280px',
        borderRadius: 'full',
        card: { radius: '2rem', shadow: 'lg', padding: '1.5rem' },
      },
      spacing: { sectionPadding: '5rem', elementGap: '2rem' },
    },
    fullSettings: {
      buttons: {
        primary: {
          background: '#06D6A0', text: '#FFFFFF', hover: '#05B588',
          border: '#06D6A0', radius: '2rem', padding: '0.875rem 2rem',
          font: 'Cairo', shadow: true, animation: 'bounce',
        },
        secondary: {
          background: '#FFD166', text: '#2D3436', hover: '#FFC132',
          border: '#FFD166', radius: '2rem', padding: '0.875rem 2rem',
          font: 'Cairo', shadow: false, animation: 'none',
        },
        small: { radius: '1rem', padding: '0.5rem 1rem', size: '0.875rem' },
        quantity: { radius: '1rem', padding: '0.25rem', size: '2.25rem', style: 'rounded' },
      },
      badges: {
        sale: { text: '🥭 خصم', position: 'top-left', background: '#FF6B35', textColor: '#FFFFFF', shape: 'pill', size: 'md' },
        new: { text: '🍍 جديد', position: 'top-right', background: '#06D6A0', textColor: '#FFFFFF', shape: 'pill', size: 'sm', autoExpire: true, expireDays: 14 },
        bestSeller: { text: '🌟 الأكثر مبيعاً', position: 'top-right', background: '#FFD166', textColor: '#2D3436', shape: 'pill', size: 'md' },
        lowStock: { enabled: true, text: 'وشوش على آخر', position: 'bottom-left', background: '#E17055', textColor: '#FFFFFF', shape: 'pill', size: 'sm', threshold: 8 },
      },
      header: {
        layout: { preset: 'centered', sticky: true, transparent: false, height: '90px' },
        bars: {
          announcement: {
            text: '🍹 عصائر طازجة 100% — اطلب 2 واحصل على 1 مجاناً!',
            link: null, background: '#FF6B35', textColor: '#FFFFFF', dismissible: true, rotate: false,
          },
        },
      },
      layout: {
        card: { radius: '2rem', shadow: 'lg', padding: '1.5rem' },
      },
    },
    assets: {
      css: `/* Tropical Juice — vibrant playful */
.product-card { background: #FFFFFF; border: 3px solid #FFD166; border-radius: 2rem; overflow: hidden; }
.product-card:hover { border-color: #FF6B35; transform: rotate(-1deg); transition: all 0.3s; }
.btn-primary { border-radius: 2rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; }
h1 { background: linear-gradient(135deg, #FF6B35, #FFD166, #06D6A0); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.section-title { color: #FF6B35; font-weight: 900; }
.announcement-bar { background: linear-gradient(90deg, #FF6B35, #FFD166, #06D6A0) !important; }`,
    },
  },

  // ─── 7. Dark Academy (digital) ──────────────────────────────────────────────
  {
    name: 'Dark Academy',
    slug: 'dark-academy',
    description: 'أكاديمية داكنة بأناقة — ذهبي على أسود، جدي ومؤثر للمحتوى العلمي',
    category: 'digital',
    type: 'premium',
    price: 59.99,
    thumbnail: null,
    preview: null,
    version: '2.0.0',
    author: 'NawaMart Pro',
    features: [
      'وضع داكن أنيق',
      'لمسات ذهبية',
      'بطاقات كلاسيكية',
      'طباعة أكاديمية',
      'حدود مزخرفة',
      'تأثيرات ضوئية',
    ],
    settings: {
      colors: {
        primary: '#1A1A24',
        secondary: '#C9A95C',
        accent: '#E8D5A3',
        background: '#12121A',
        surface: '#1E1E2A',
        text: '#E8E0D0',
        textMuted: '#8A8270',
        header: '#1A1A24',
        footer: '#0E0E15',
        button: '#C9A95C',
        buttonText: '#1A1A24',
        success: '#5E8D5E',
        danger: '#8D3A3A',
        warning: '#B8860B',
      },
      fonts: {
        heading: 'Cairo',
        body: 'Cairo',
        sizes: { h1: '2.5rem', h2: '1.875rem', h3: '1.5rem', body: '1rem', bodySmall: '0.875rem' },
      },
      layout: {
        headerStyle: 'classic',
        footerStyle: 'classic',
        productCardStyle: 'list',
        sidebarPosition: 'right',
        containerWidth: '1100px',
        borderRadius: 'none',
        card: { radius: '0', shadow: 'md', padding: '2rem' },
      },
      spacing: { sectionPadding: '5rem', elementGap: '2rem' },
    },
    fullSettings: {
      typography: {
        heading: { family: 'Cairo', source: 'google', weight: '400', spacing: '0.08em', lineHeight: '1.4', transform: 'none' },
        body: { family: 'Cairo', source: 'google', weight: '300', spacing: '0.05em', lineHeight: '1.9' },
        accent: { family: 'Cairo', source: 'google', weight: '400', spacing: '0.1em', lineHeight: '1.6' },
        button: { family: 'Cairo', weight: '400', transform: 'uppercase' },
        sizes: { h1: '2.5rem', h2: '1.875rem', h3: '1.5rem', h4: '1.25rem', h5: '1.125rem', h6: '1rem', body: '1rem', bodySmall: '0.875rem', bodyLarge: '1.125rem' },
      },
      buttons: {
        primary: {
          background: '#C9A95C', text: '#1A1A24', hover: '#B8943A',
          border: '#C9A95C', radius: '0', padding: '0.75rem 2.5rem',
          font: 'Cairo', shadow: false, animation: 'none',
        },
        secondary: {
          background: 'transparent', text: '#C9A95C', hover: '#1E1E2A',
          border: '#C9A95C', radius: '0', padding: '0.75rem 2.5rem',
          font: 'Cairo', shadow: false, animation: 'none',
        },
      },
      badges: {
        sale: { text: '✨ عرض', position: 'top-left', background: '#C9A95C', textColor: '#1A1A24', shape: 'rectangle', size: 'md' },
        new: { text: '📜 جديد', position: 'top-right', background: '#5E8D5E', textColor: '#FFFFFF', shape: 'rectangle', size: 'sm', autoExpire: true, expireDays: 30 },
        bestSeller: { text: '🏅 الأكثر مبيعاً', position: 'top-right', background: '#C9A95C', textColor: '#1A1A24', shape: 'rectangle', size: 'sm' },
        preOrder: { text: '📖 طلب مسبق', position: 'top-left', background: '#8A8270', textColor: '#FFFFFF', shape: 'rectangle', size: 'md' },
      },
      header: {
        layout: { preset: 'classic', sticky: false, transparent: false, height: '90px' },
        nav: { spacing: '2rem', font: 'Cairo' },
        icons: { size: '22px', color: '#C9A95C' },
        bars: {
          announcement: {
            text: '📚 مكتبتك الأكاديمية — خصم 20% على أول كتاب',
            link: null, background: '#C9A95C', textColor: '#1A1A24', dismissible: true, rotate: false,
          },
        },
      },
      layout: {
        card: { radius: '0', shadow: 'md', padding: '2rem' },
        breadcrumbs: { enabled: true, style: 'arrow' },
        pagination: { style: 'numbered', showFirst: true, showLast: true },
      },
    },
    assets: {
      css: `/* Dark Academy — scholarly elegance */
.product-card { background: #1E1E2A; border: 1px solid #2A2A3A; border-left: 3px solid #C9A95C; }
.product-card:hover { border-color: #C9A95C; background: #222233; }
.btn-primary { letter-spacing: 3px; font-size: 0.8rem; }
h1, h2, h3 { letter-spacing: 2px; color: #E8D5A3; }
body { background-image: linear-gradient(rgba(201, 169, 92, 0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(201, 169, 92, 0.02) 1px, transparent 1px); background-size: 40px 40px; }
.section-title { border-bottom: 1px solid #C9A95C; padding-bottom: 1rem; }`,
    },
  },

  // ─── 8. Playground (digital) ────────────────────────────────────────────────
  {
    name: 'Playground',
    slug: 'playground',
    description: 'عالم مرح للأطفال — ألوان زاهية، زوايا مستديرة جداً، وتصميم لعوب',
    category: 'digital',
    type: 'premium',
    price: 34.99,
    thumbnail: null,
    preview: null,
    version: '2.0.0',
    author: 'NawaMart Pro',
    features: [
      'زوايا دائرية جداً',
      'ألوان قوس قزح',
      'بطاقات كالكرات',
      'خطوط مرحة',
      'رسوم متحركة',
      'شخصيات كرتونية',
    ],
    settings: {
      colors: {
        primary: '#6C5CE7',
        secondary: '#00CEC9',
        accent: '#FD79A8',
        background: '#F8F9FF',
        surface: '#FFFFFF',
        text: '#2D3436',
        textMuted: '#B2BEC3',
        header: '#6C5CE7',
        footer: '#2D3436',
        button: '#FD79A8',
        buttonText: '#FFFFFF',
        success: '#00B894',
        danger: '#E17055',
        warning: '#FDCB6E',
      },
      fonts: {
        heading: 'Cairo',
        body: 'Cairo',
        sizes: { h1: '2.5rem', h2: '2rem', h3: '1.5rem', body: '1rem', bodySmall: '0.875rem' },
      },
      layout: {
        headerStyle: 'centered',
        footerStyle: 'minimal',
        productCardStyle: 'grid',
        sidebarPosition: 'none',
        containerWidth: '1280px',
        borderRadius: 'full',
        card: { radius: '2rem', shadow: 'lg', padding: '1.5rem' },
      },
      spacing: { sectionPadding: '4rem', elementGap: '2rem' },
    },
    fullSettings: {
      buttons: {
        primary: {
          background: '#FD79A8', text: '#FFFFFF', hover: '#FC5185',
          border: '#FD79A8', radius: '2rem', padding: '0.875rem 2rem',
          font: 'Cairo', shadow: true, animation: 'bounce',
        },
        secondary: {
          background: '#00CEC9', text: '#FFFFFF', hover: '#00B3AD',
          border: '#00CEC9', radius: '2rem', padding: '0.875rem 2rem',
          font: 'Cairo', shadow: true, animation: 'none',
        },
        small: { radius: '1rem', padding: '0.5rem 1rem', size: '0.875rem' },
        quantity: { radius: '1rem', padding: '0.25rem', size: '2.25rem', style: 'rounded' },
      },
      badges: {
        sale: { text: '🎈 عرض', position: 'top-left', background: '#6C5CE7', textColor: '#FFFFFF', shape: 'pill', size: 'md' },
        new: { text: '🦄 جديد', position: 'top-right', background: '#00CEC9', textColor: '#FFFFFF', shape: 'pill', size: 'md', autoExpire: true, expireDays: 30 },
        bestSeller: { text: '⭐ الأكثر مبيعاً', position: 'top-right', background: '#FDCB6E', textColor: '#2D3436', shape: 'pill', size: 'md' },
        lowStock: { enabled: true, text: 'يكاد يخلص', position: 'bottom-left', background: '#E17055', textColor: '#FFFFFF', shape: 'pill', size: 'sm', threshold: 5 },
      },
      header: {
        layout: { preset: 'centered', sticky: true, transparent: false, height: '80px' },
        nav: { spacing: '2rem', font: 'Cairo' },
        icons: { size: '24px', color: '#FFFFFF' },
        bars: {
          announcement: {
            text: '🎉 توصيل مجاني للطلبات فوق 100 ريال',
            link: null, background: '#00CEC9', textColor: '#FFFFFF', dismissible: true, rotate: false,
          },
        },
      },
      layout: {
        card: { radius: '2rem', shadow: 'lg', padding: '1.5rem' },
        grid: { productsPerRow: { desktop: 4, tablet: 2, mobile: 1 }, gap: { desktop: '1.5rem', tablet: '1rem', mobile: '0.75rem' } },
      },
    },
    assets: {
      css: `/* Playground — fun kids theme */
.product-card { background: #FFFFFF; border: 3px solid transparent; border-radius: 2rem; overflow: hidden; box-shadow: 0 8px 32px rgba(108, 92, 231, 0.1); }
.product-card:nth-child(4n+1) { border-color: #6C5CE7; }
.product-card:nth-child(4n+2) { border-color: #00CEC9; }
.product-card:nth-child(4n+3) { border-color: #FD79A8; }
.product-card:nth-child(4n+4) { border-color: #FDCB6E; }
.product-card:hover { transform: scale(1.05) rotate(-2deg); }
.btn-primary { font-weight: 900; text-transform: uppercase; }
h1 { background: linear-gradient(90deg, #6C5CE7, #FD79A8, #00CEC9); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }`,
    },
  },

  // ─── 9. Luxury Hotel (general) ──────────────────────────────────────────────
  {
    name: 'Luxury Hotel',
    slug: 'luxury-hotel',
    description: 'فخامة خمس نجوم — كريمي وذهبي مع مسافات فخمة وتفاصيل راقية',
    category: 'general',
    type: 'premium',
    price: 79.99,
    thumbnail: null,
    preview: null,
    version: '2.0.0',
    author: 'NawaMart Pro',
    features: [
      'تصميم فندقي فاخر',
      'ذهبي وكريمي أنيق',
      'مسافات فخمة',
      'تأثيرات رخامية',
      'أزرار كريستالية',
      'شريط كونسيرج',
    ],
    settings: {
      colors: {
        primary: '#1A1520',
        secondary: '#D4AF37',
        accent: '#E8D5A3',
        background: '#F8F5F0',
        surface: '#FFFFFF',
        text: '#1A1520',
        textMuted: '#A89A8A',
        header: '#1A1520',
        footer: '#1A1520',
        button: '#D4AF37',
        buttonText: '#1A1520',
        success: '#2E7D5E',
        danger: '#8B3A3A',
        warning: '#B8860B',
      },
      fonts: {
        heading: 'Cairo',
        body: 'Cairo',
        sizes: { h1: '2.5rem', h2: '2rem', h3: '1.5rem', body: '1rem', bodySmall: '0.875rem' },
      },
      layout: {
        headerStyle: 'classic',
        footerStyle: 'classic',
        productCardStyle: 'grid',
        sidebarPosition: 'right',
        containerWidth: '1280px',
        borderRadius: 'sm',
        card: { radius: '0.25rem', shadow: 'lg', padding: '1.5rem' },
      },
      spacing: { sectionPadding: '6rem', elementGap: '2.5rem' },
    },
    fullSettings: {
      buttons: {
        primary: {
          background: '#D4AF37', text: '#1A1520', hover: '#B8942F',
          border: '#D4AF37', radius: '0.125rem', padding: '1rem 3rem',
          font: 'Cairo', shadow: false, animation: 'none',
        },
        secondary: {
          background: 'transparent', text: '#D4AF37', hover: '#1A1520',
          border: '#D4AF37', radius: '0.125rem', padding: '1rem 3rem',
          font: 'Cairo', shadow: false, animation: 'none',
        },
        small: { radius: '0.125rem', padding: '0.5rem 1.25rem', size: '0.875rem' },
        quantity: { radius: '0.125rem', padding: '0.25rem', size: '2rem', style: 'default' },
      },
      badges: {
        sale: { text: 'عرض خاص', position: 'top-left', background: '#D4AF37', textColor: '#1A1520', shape: 'rectangle', size: 'md' },
        soldOut: { text: 'كامل', position: 'top-right', background: '#A89A8A', textColor: '#FFFFFF', shape: 'rectangle', size: 'md' },
        new: { text: 'جديد', position: 'top-left', background: '#2E7D5E', textColor: '#FFFFFF', shape: 'rectangle', size: 'sm', autoExpire: true, expireDays: 30 },
        bestSeller: { text: 'الأنسب', position: 'top-right', background: '#D4AF37', textColor: '#1A1520', shape: 'pill', size: 'sm' },
        preOrder: { text: 'حجز مسبق', position: 'top-left', background: '#1A1520', textColor: '#D4AF37', shape: 'rectangle', size: 'md' },
      },
      header: {
        layout: { preset: 'classic', sticky: true, transparent: false, height: '100px' },
        logo: { type: 'text', text: 'متجري', size: { desktop: '200px', tablet: '160px', mobile: '120px' } },
        nav: { alignment: 'center', spacing: '2.5rem', font: 'Cairo', megaMenu: true, dropdownAnimation: 'fade' },
        icons: { size: '24px', color: '#D4AF37' },
      },
      layout: {
        card: { radius: '0.25rem', shadow: 'lg', padding: '1.5rem' },
        sectionSpacing: '6rem',
      },
    },
    assets: {
      css: `/* Luxury Hotel — 5-star elegance */
.product-card { background: #FFFFFF; border: 1px solid #E8E0D0; box-shadow: 0 4px 24px rgba(26, 21, 32, 0.06); }
.product-card:hover { border-color: #D4AF37; box-shadow: 0 8px 40px rgba(212, 175, 55, 0.12); }
.btn-primary { text-transform: uppercase; letter-spacing: 4px; font-size: 0.75rem; font-weight: 600; }
h1, h2, h3 { letter-spacing: 2px; color: #1A1520; }
body { background-image: linear-gradient(rgba(212, 175, 55, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(212, 175, 55, 0.03) 1px, transparent 1px); background-size: 60px 60px; }
.section-title { text-align: center; font-weight: 300; color: #A89A8A; letter-spacing: 6px; text-transform: uppercase; }`,
    },
  },

  // ─── 10. Handmade Craft (general) ───────────────────────────────────────────
  {
    name: 'Handmade Craft',
    slug: 'handmade-craft',
    description: 'حرفية طبيعية — ألوان أرضية، خامات ورقية، ولمسة يدوية دافئة',
    category: 'general',
    type: 'premium',
    price: 44.99,
    thumbnail: null,
    preview: null,
    version: '2.0.0',
    author: 'NawaMart Pro',
    features: [
      'تصميم حرفي طبيعي',
      'ألوان ترابية',
      'قوائم منقطة',
      'خلفيات ورقية',
      'خطوط غير منتظمة',
      'أيقونات يدوية',
    ],
    settings: {
      colors: {
        primary: '#4A3F35',
        secondary: '#7D6B5D',
        accent: '#B88A5C',
        background: '#F7F3ED',
        surface: '#FFFFFF',
        text: '#3A3028',
        textMuted: '#8B7E73',
        header: '#4A3F35',
        footer: '#3A3028',
        button: '#B88A5C',
        buttonText: '#FFFFFF',
        success: '#6B8E5A',
        danger: '#8B4A4A',
        warning: '#B8860B',
      },
      fonts: {
        heading: 'Cairo',
        body: 'Cairo',
        sizes: { h1: '2.25rem', h2: '1.75rem', h3: '1.375rem', body: '1rem', bodySmall: '0.875rem' },
      },
      layout: {
        headerStyle: 'classic',
        footerStyle: 'classic',
        productCardStyle: 'grid',
        sidebarPosition: 'right',
        containerWidth: '1200px',
        borderRadius: 'none',
        card: { radius: '0', shadow: 'sm', padding: '1.5rem' },
      },
      spacing: { sectionPadding: '5rem', elementGap: '2rem' },
    },
    fullSettings: {
      buttons: {
        primary: {
          background: '#B88A5C', text: '#FFFFFF', hover: '#A0784E',
          border: '#B88A5C', radius: '0', padding: '0.75rem 2.5rem',
          font: 'Cairo', shadow: false, animation: 'none',
        },
        secondary: {
          background: 'transparent', text: '#4A3F35', hover: '#EDE5DC',
          border: '#7D6B5D', radius: '0', padding: '0.75rem 2.5rem',
          font: 'Cairo', shadow: false, animation: 'none',
        },
        small: { radius: '0', padding: '0.375rem 0.75rem', size: '0.875rem' },
        quantity: { radius: '0', padding: '0.25rem', size: '2rem', style: 'default' },
      },
      badges: {
        sale: { text: 'تخفيض حرفي', position: 'top-left', background: '#B88A5C', textColor: '#FFFFFF', shape: 'rectangle', size: 'md' },
        new: { text: 'قطعة جديدة', position: 'top-right', background: '#6B8E5A', textColor: '#FFFFFF', shape: 'rectangle', size: 'sm', autoExpire: true, expireDays: 7 },
        bestSeller: { text: 'الأكثر مبيعاً', position: 'top-right', background: '#4A3F35', textColor: '#F7F3ED', shape: 'rectangle', size: 'sm' },
        lowStock: { enabled: true, text: 'قطعة فريدة', position: 'bottom-left', background: '#8B4A4A', textColor: '#FFFFFF', shape: 'rectangle', size: 'sm', threshold: 2 },
      },
      header: {
        layout: { preset: 'classic', sticky: true, transparent: false, height: '80px' },
        nav: { spacing: '2rem', font: 'Cairo' },
        icons: { size: '22px', color: '#B88A5C' },
        bars: {
          announcement: {
            text: '✂️ كل قطعة مصنوعة يدوياً بعناية — اصنع فرقاً',
            link: null, background: '#B88A5C', textColor: '#FFFFFF', dismissible: true, rotate: false,
          },
        },
      },
      layout: {
        card: { radius: '0', shadow: 'sm', padding: '1.5rem' },
        grid: { productsPerRow: { desktop: 3, tablet: 2, mobile: 1 }, gap: { desktop: '2rem', tablet: '1.5rem', mobile: '1rem' } },
      },
    },
    assets: {
      css: `/* Handmade Craft — natural artisan feel */
.product-card { background: #FFFFFF; border: 1px solid #D6CDC4; border-top: 3px solid #B88A5C; }
.product-card:hover { border-color: #B88A5C; border-top-width: 4px; }
.btn-primary { letter-spacing: 1px; }
h1, h2, h3 { font-weight: 400; color: #4A3F35; }
body { background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3z' fill='%23b88a5c' fill-opacity='0.05' fill-rule='evenodd'/%3E%3C/svg%3E"); }
.section-title { font-weight: 300; letter-spacing: 2px; color: #7D6B5D; border-bottom: 1px dashed #D6CDC4; padding-bottom: 0.5rem; }`,
    },
  },
];

const defaultTheme = {
  name: 'Default',
  slug: 'default',
  description: 'القالب الافتراضي لنظام نوا مارت',
  category: 'general',
  type: 'free',
  price: 0,
  thumbnail: null,
  preview: null,
  version: '1.0.0',
  author: 'NawaMart',
  features: [
    'تصميم متجاوب',
    'ألوان قابلة للتخصيص',
    'خطوط مرنة',
    'سرعة عالية',
  ],
  settings: {
    colors: {
      primary: '#18212F',
      secondary: '#2D7BE0',
      accent: '#C93F2B',
      background: '#F6F3EE',
      surface: '#FFFFFF',
      text: '#1D2430',
      textMuted: '#5F6673',
      header: '#18212F',
      footer: '#18212F',
      button: '#C93F2B',
      buttonText: '#FFFFFF',
      success: '#27AE60',
      danger: '#E74C3C',
      warning: '#F39C12',
    },
    fonts: {
      heading: 'Cairo',
      body: 'Cairo',
    },
    layout: {
      headerStyle: 'classic',
      footerStyle: 'classic',
      productCardStyle: 'grid',
      sidebarPosition: 'right',
      containerWidth: '1280px',
    },
    spacing: {
      sectionPadding: '4rem',
      elementGap: '1.5rem',
    },
  },
  isActive: true,
  isDefault: true,
};

async function seedThemes() {
  const Theme = require('../models/Theme');
  const existing = await Theme.countDocuments();

  // Fresh install — seed everything
  if (existing === 0) {
    const allThemes = [defaultTheme, ...themes, ...premiumThemes];
    await Theme.insertMany(allThemes);
    console.log(`[ThemeSeed] Seeded ${allThemes.length} themes (${themes.length} basic + ${premiumThemes.length} premium + 1 default) successfully.`);
    return;
  }

  // Existing DB — add any missing themes by slug
  const expectedSlugs = [
    'default',
    ...themes.map(t => t.slug),
    ...premiumThemes.map(t => t.slug),
  ];
  const existingDocs = await Theme.find({}).select('slug').lean();
  const existingSlugs = new Set(existingDocs.map(t => t.slug));
  const missing = expectedSlugs.filter(s => !existingSlugs.has(s));

  if (missing.length > 0) {
    const allKnown = [...themes, ...premiumThemes];
    const toInsert = allKnown.filter(t => missing.includes(t.slug));
    if (toInsert.length > 0) {
      await Theme.insertMany(toInsert);
      console.log(`[ThemeSeed] Added ${toInsert.length} missing themes: ${missing.join(', ')}`);
    }
  } else {
    console.log(`[ThemeSeed] ${existing} themes already exist, all up to date.`);
  }
}

module.exports = { seedThemes, defaultTheme, themes, premiumThemes };
