const mongoose = require('mongoose');

const themeSettingSchema = new mongoose.Schema(
  {
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      required: [true, 'المتجر مطلوب'],
      unique: true,
    },
    theme: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Theme',
      default: null,
    },

    // ─── 2. COLORS ──────────────────────────────────────────────────────────────
    colors: {
      primary: { type: String, default: '#18212F' },
      secondary: { type: String, default: '#2D7BE0' },
      accent: { type: String, default: '#C93F2B' },
      background: { type: String, default: '#F6F3EE' },
      surface: { type: String, default: '#FFFFFF' },
      text: { type: String, default: '#1D2430' },
      textMuted: { type: String, default: '#5F6673' },
      header: { type: String, default: '#18212F' },
      footer: { type: String, default: '#18212F' },
      button: { type: String, default: '#C93F2B' },
      buttonText: { type: String, default: '#FFFFFF' },
      success: { type: String, default: '#27AE60' },
      danger: { type: String, default: '#E74C3C' },
      warning: { type: String, default: '#F39C12' },
      backgrounds: {
        main: { type: String, default: '#F6F3EE' },
        surface: { type: String, default: '#FFFFFF' },
        section: { type: String, default: '#FAFAF9' },
      },
      textColors: {
        heading: { type: String, default: '#1D2430' },
        body: { type: String, default: '#4A5568' },
        muted: { type: String, default: '#A0AEC0' },
        link: { type: String, default: '#2D7BE0' },
        price: { type: String, default: '#C93F2B' },
        onDark: { type: String, default: '#FFFFFF' },
      },
      borders: {
        default: { type: String, default: '#E2E8F0' },
        hover: { type: String, default: '#CBD5E0' },
        light: { type: String, default: '#F0F0F0' },
      },
      status: {
        success: { type: String, default: '#27AE60' },
        error: { type: String, default: '#E74C3C' },
        warning: { type: String, default: '#F39C12' },
        info: { type: String, default: '#3498DB' },
      },
      sale: {
        badge: { type: String, default: '#E74C3C' },
        text: { type: String, default: '#FFFFFF' },
      },
      headerColors: {
        background: { type: String, default: '#18212F' },
        text: { type: String, default: '#FFFFFF' },
        link: { type: String, default: '#B0BEC5' },
      },
      footerColors: {
        background: { type: String, default: '#18212F' },
        text: { type: String, default: '#CBD5E0' },
        link: { type: String, default: '#A0AEC0' },
        heading: { type: String, default: '#FFFFFF' },
      },
      cartCheckout: {
        primary: { type: String, default: '#C93F2B' },
        secondary: { type: String, default: '#2D7BE0' },
      },
    },

    // ─── 3. TYPOGRAPHY ──────────────────────────────────────────────────────────
    typography: {
      heading: {
        family: { type: String, default: 'Cairo' },
        source: { type: String, default: 'google' },
        weight: { type: String, default: '700' },
        spacing: { type: String, default: 'normal' },
        lineHeight: { type: String, default: '1.3' },
        transform: { type: String, default: 'none' },
      },
      body: {
        family: { type: String, default: 'Cairo' },
        source: { type: String, default: 'google' },
        weight: { type: String, default: '400' },
        spacing: { type: String, default: 'normal' },
        lineHeight: { type: String, default: '1.6' },
      },
      accent: {
        family: { type: String, default: 'Cairo' },
        source: { type: String, default: 'google' },
        weight: { type: String, default: '600' },
        spacing: { type: String, default: 'normal' },
        lineHeight: { type: String, default: '1.4' },
      },
      button: {
        family: { type: String, default: 'Cairo' },
        weight: { type: String, default: '600' },
        transform: { type: String, default: 'none' },
      },
      sizes: {
        h1: { type: String, default: '2.5rem' },
        h2: { type: String, default: '2rem' },
        h3: { type: String, default: '1.75rem' },
        h4: { type: String, default: '1.5rem' },
        h5: { type: String, default: '1.25rem' },
        h6: { type: String, default: '1rem' },
        body: { type: String, default: '1rem' },
        bodySmall: { type: String, default: '0.875rem' },
        bodyLarge: { type: String, default: '1.125rem' },
      },
      baseScale: { type: Number, default: 1 },
    },

    // ─── 4. LAYOUT ──────────────────────────────────────────────────────────────
    layout: {
      headerStyle: {
        type: String,
        enum: ['classic', 'minimal', 'centered', 'compact'],
        default: 'classic',
      },
      footerStyle: {
        type: String,
        enum: ['classic', 'minimal', 'simple', 'compact'],
        default: 'classic',
      },
      productCardStyle: {
        type: String,
        enum: ['grid', 'list', 'compact'],
        default: 'grid',
      },
      sidebarPosition: {
        type: String,
        enum: ['left', 'right', 'none'],
        default: 'right',
      },
      containerWidth: { type: String, default: '1280px' },
      borderRadius: {
        type: String,
        enum: ['none', 'sm', 'md', 'lg', 'xl', 'full'],
        default: 'md',
      },
      animationEnabled: { type: Boolean, default: true },
      pageWidth: { type: String, default: '1280px' },
      containerPadding: { type: String, default: '1rem' },
      grid: {
        productsPerRow: {
          desktop: { type: Number, default: 4 },
          tablet: { type: Number, default: 3 },
          mobile: { type: Number, default: 2 },
        },
        gap: {
          desktop: { type: String, default: '1.5rem' },
          tablet: { type: String, default: '1rem' },
          mobile: { type: String, default: '0.75rem' },
        },
      },
      sectionSpacing: { type: String, default: '4rem' },
      card: {
        radius: { type: String, default: '0.75rem' },
        shadow: { type: String, default: 'sm' },
        padding: { type: String, default: '1rem' },
      },
      imageRatios: {
        product: { type: String, default: '1:1' },
        collection: { type: String, default: '3:4' },
        blog: { type: String, default: '16:9' },
      },
      breadcrumbs: {
        enabled: { type: Boolean, default: true },
        style: { type: String, default: 'slash' },
      },
      pagination: {
        style: { type: String, default: 'numbered' },
        showFirst: { type: Boolean, default: true },
        showLast: { type: Boolean, default: true },
      },
    },

    // ─── 5. HEADER ──────────────────────────────────────────────────────────────
    header: {
      layout: {
        preset: { type: String, default: 'classic' },
        sticky: { type: Boolean, default: true },
        transparent: { type: Boolean, default: false },
        height: { type: String, default: '80px' },
      },
      logo: {
        type: { type: String, enum: ['image', 'text', 'both'], default: 'text' },
        image: { type: String, default: null },
        text: { type: String, default: 'متجري' },
        size: {
          desktop: { type: String, default: '180px' },
          tablet: { type: String, default: '140px' },
          mobile: { type: String, default: '120px' },
        },
        favicon: { type: String, default: null },
      },
      nav: {
        alignment: { type: String, default: 'center' },
        spacing: { type: String, default: '2rem' },
        font: { type: String, default: 'Cairo' },
        megaMenu: { type: Boolean, default: false },
        dropdownAnimation: { type: String, default: 'fade' },
        mobileMenuStyle: { type: String, default: 'drawer' },
      },
      search: {
        style: { type: String, enum: ['icon', 'bar', 'expandable'], default: 'icon' },
        position: { type: String, default: 'right' },
        suggestions: { type: Boolean, default: true },
      },
      icons: {
        cart: {
          enabled: { type: Boolean, default: true },
          style: { type: String, default: 'icon' },
          customUrl: { type: String, default: null },
        },
        wishlist: {
          enabled: { type: Boolean, default: false },
          style: { type: String, default: 'icon' },
          customUrl: { type: String, default: null },
        },
        account: {
          enabled: { type: Boolean, default: true },
          style: { type: String, default: 'icon' },
          customUrl: { type: String, default: null },
        },
        size: { type: String, default: '24px' },
        color: { type: String, default: '#FFFFFF' },
      },
      bars: {
        announcement: {
          text: { type: String, default: '' },
          link: { type: String, default: null },
          background: { type: String, default: '#C93F2B' },
          textColor: { type: String, default: '#FFFFFF' },
          dismissible: { type: Boolean, default: true },
          rotate: { type: Boolean, default: false },
        },
        topBar: {
          contacts: { type: Boolean, default: true },
          social: { type: Boolean, default: true },
        },
      },
    },

    // ─── 6. FOOTER ──────────────────────────────────────────────────────────────
    footer: {
      layout: {
        columns: { type: Number, default: 4, min: 1, max: 4 },
        width: { type: String, default: 'full' },
      },
      blocks: { type: mongoose.Schema.Types.Mixed, default: [] },
      bottom: {
        copyright: { type: String, default: '© 2026 جميع الحقوق محفوظة' },
        poweredBy: { type: Boolean, default: true },
        backToTop: { type: Boolean, default: true },
        languageSelector: { type: Boolean, default: false },
        currencySelector: { type: Boolean, default: false },
      },
    },

    // ─── 7. BUTTONS ─────────────────────────────────────────────────────────────
    buttons: {
      primary: {
        background: { type: String, default: '#C93F2B' },
        text: { type: String, default: '#FFFFFF' },
        hover: { type: String, default: '#B0352A' },
        border: { type: String, default: '#C93F2B' },
        radius: { type: String, default: '0.75rem' },
        padding: { type: String, default: '0.75rem 1.5rem' },
        font: { type: String, default: 'Cairo' },
        shadow: { type: Boolean, default: false },
        animation: { type: String, default: 'none' },
      },
      secondary: {
        background: { type: String, default: 'transparent' },
        text: { type: String, default: '#1D2430' },
        hover: { type: String, default: '#F6F3EE' },
        border: { type: String, default: '#E2E8F0' },
        radius: { type: String, default: '0.75rem' },
        padding: { type: String, default: '0.75rem 1.5rem' },
        font: { type: String, default: 'Cairo' },
        shadow: { type: Boolean, default: false },
        animation: { type: String, default: 'none' },
      },
      small: {
        radius: { type: String, default: '0.5rem' },
        padding: { type: String, default: '0.375rem 0.75rem' },
        size: { type: String, default: '0.875rem' },
      },
      quantity: {
        radius: { type: String, default: '0.5rem' },
        padding: { type: String, default: '0.25rem' },
        size: { type: String, default: '2rem' },
        style: { type: String, default: 'default' },
      },
    },

    // ─── 8. BADGES ──────────────────────────────────────────────────────────────
    badges: {
      sale: {
        text: { type: String, default: 'تخفيض' },
        position: { type: String, default: 'top-left' },
        background: { type: String, default: '#E74C3C' },
        textColor: { type: String, default: '#FFFFFF' },
        shape: { type: String, default: 'rectangle' },
        size: { type: String, default: 'md' },
      },
      soldOut: {
        text: { type: String, default: 'نفد' },
        position: { type: String, default: 'top-right' },
        background: { type: String, default: '#95A5A6' },
        textColor: { type: String, default: '#FFFFFF' },
        shape: { type: String, default: 'rectangle' },
        size: { type: String, default: 'md' },
      },
      new: {
        text: { type: String, default: 'جديد' },
        position: { type: String, default: 'top-left' },
        background: { type: String, default: '#27AE60' },
        textColor: { type: String, default: '#FFFFFF' },
        shape: { type: String, default: 'rectangle' },
        size: { type: String, default: 'sm' },
        autoExpire: { type: Boolean, default: true },
        expireDays: { type: Number, default: 30 },
      },
      lowStock: {
        enabled: { type: Boolean, default: true },
        text: { type: String, default: 'متبقي قليل' },
        position: { type: String, default: 'bottom-left' },
        background: { type: String, default: '#F39C12' },
        textColor: { type: String, default: '#FFFFFF' },
        shape: { type: String, default: 'rectangle' },
        size: { type: String, default: 'sm' },
        threshold: { type: Number, default: 5 },
      },
      bestSeller: {
        text: { type: String, default: 'الأكثر مبيعاً' },
        position: { type: String, default: 'top-right' },
        background: { type: String, default: '#2D7BE0' },
        textColor: { type: String, default: '#FFFFFF' },
        shape: { type: String, default: 'pill' },
        size: { type: String, default: 'sm' },
      },
      preOrder: {
        text: { type: String, default: 'طلب مسبق' },
        position: { type: String, default: 'top-left' },
        background: { type: String, default: '#8E44AD' },
        textColor: { type: String, default: '#FFFFFF' },
        shape: { type: String, default: 'rectangle' },
        size: { type: String, default: 'md' },
      },
    },

    // ─── 9. ICONS ───────────────────────────────────────────────────────────────
    icons: {
      globalColor: { type: String, default: '#1D2430' },
      globalSize: { type: String, default: '24px' },
      iconSet: { type: String, default: 'default' },
      custom: { type: mongoose.Schema.Types.Mixed, default: {} },
    },

    // ─── 10. IMAGES ─────────────────────────────────────────────────────────────
    images: {
      brand: {
        logo: { type: String, default: null },
        logoAlt: { type: String, default: null },
        logoMobile: { type: String, default: null },
        logoEmail: { type: String, default: null },
        favicon: { type: String, default: null },
        socialShare: { type: String, default: null },
      },
      placeholders: {
        product: { type: String, default: null },
        collection: { type: String, default: null },
        avatar: { type: String, default: null },
        blog: { type: String, default: null },
        banner: { type: String, default: null },
      },
      backgrounds: {
        body: { type: String, default: null },
        header: { type: String, default: null },
        footer: { type: String, default: null },
        sections: { type: String, default: null },
      },
      emptyStates: {
        cart: { type: String, default: null },
        wishlist: { type: String, default: null },
        search: { type: String, default: null },
        collection: { type: String, default: null },
        orders: { type: String, default: null },
        notFound: { type: String, default: null },
      },
      loading: {
        spinnerStyle: { type: String, default: 'circle' },
        spinnerColor: { type: String, default: '#C93F2B' },
        skeleton: { type: Boolean, default: true },
        customGif: { type: String, default: null },
      },
      settings: {
        quality: { type: Number, default: 80, min: 1, max: 100 },
        lazyLoading: { type: Boolean, default: true },
        responsiveSizes: { type: Boolean, default: true },
        zoomType: { type: String, default: 'hover' },
        galleryStyle: { type: String, default: 'grid' },
        hoverEffect: { type: String, default: 'none' },
        lightbox: { type: Boolean, default: true },
      },
    },

    // ─── 11. PRODUCT PAGE ───────────────────────────────────────────────────────
    productPage: {
      layout: { type: String, default: 'default' },
      gallery: { type: String, default: 'grid' },
      thumbnails: {
        position: { type: String, default: 'bottom' },
        visible: { type: Number, default: 4 },
      },
      zoom: { type: Boolean, default: true },
      video: { type: Boolean, default: true },
      model3d: { type: Boolean, default: false },
      info: {
        vendor: { type: Boolean, default: true },
        sku: { type: Boolean, default: true },
        availability: { type: Boolean, default: true },
        tags: { type: Boolean, default: true },
      },
      title: {
        size: { type: String, default: '1.5rem' },
        weight: { type: String, default: '700' },
        alignment: { type: String, default: 'right' },
        color: { type: String, default: '#1D2430' },
      },
      price: {
        size: { type: String, default: '1.75rem' },
        weight: { type: String, default: '700' },
        alignment: { type: String, default: 'right' },
        color: { type: String, default: '#C93F2B' },
      },
      variants: {
        type: { type: String, default: 'buttons' },
        shape: { type: String, default: 'circle' },
        size: { type: String, default: 'md' },
      },
      addToCart: {
        style: { type: String, default: 'default' },
        fullWidth: { type: Boolean, default: false },
        stickyMobile: { type: Boolean, default: true },
        buyNow: { type: Boolean, default: true },
        expressPayment: { type: Boolean, default: false },
      },
      content: {
        type: { type: String, default: 'tabs' },
        trustBadges: { type: Boolean, default: true },
        socialProof: { type: Boolean, default: true },
        stockCountdown: { type: Boolean, default: false },
        salesCount: { type: Boolean, default: false },
      },
      sections: {
        relatedProducts: { type: Boolean, default: true },
        recentlyViewed: { type: Boolean, default: true },
        sizeGuide: { type: Boolean, default: false },
        wishlist: { type: Boolean, default: true },
        compare: { type: Boolean, default: false },
      },
    },

    // ─── 12. COLLECTION PAGE ────────────────────────────────────────────────────
    collectionPage: {
      layout: {
        default: { type: String, default: 'grid' },
        productsPerRow: { type: Number, default: 4 },
        viewToggle: { type: Boolean, default: true },
      },
      header: {
        image: { type: String, default: null },
        title: { type: Boolean, default: true },
        description: { type: Boolean, default: true },
        breadcrumbs: { type: Boolean, default: true },
      },
      toolbar: {
        sorting: { type: Boolean, default: true },
        filters: {
          position: { type: String, default: 'sidebar' },
          style: { type: String, default: 'default' },
        },
        productCount: { type: Boolean, default: true },
      },
      cards: {
        style: { type: String, default: 'default' },
        hoverEffects: { type: String, default: 'none' },
        visibleElements: { type: mongoose.Schema.Types.Mixed, default: ['title', 'price', 'addToCart'] },
        quickAdd: { type: Boolean, default: false },
        quickView: { type: Boolean, default: true },
      },
      pagination: {
        type: { type: String, default: 'numbered' },
      },
      emptyState: {
        title: { type: String, default: 'لا توجد منتجات' },
        description: { type: String, default: 'لم نتمكن من العثور على منتجات تطابق بحثك' },
        cta: { type: String, default: 'تصفح جميع المنتجات' },
        image: { type: String, default: null },
      },
    },

    // ─── 13. CART ───────────────────────────────────────────────────────────────
    cart: {
      type: { type: String, default: 'page' },
      position: { type: String, default: 'right' },
      layout: {
        arrangement: { type: String, default: 'side-by-side' },
      },
      features: {
        discount: { type: Boolean, default: true },
        expressCheckout: { type: Boolean, default: true },
        orderNotes: { type: Boolean, default: false },
        giftWrap: { type: Boolean, default: false },
        shippingCalculator: { type: Boolean, default: true },
        crossSells: { type: Boolean, default: true },
      },
      freeShippingBar: {
        enabled: { type: Boolean, default: true },
        threshold: { type: Number, default: 200 },
        progressMessage: { type: String, default: 'توصيل مجاني للطلبات فوق $200' },
        background: { type: String, default: '#27AE60' },
        textColor: { type: String, default: '#FFFFFF' },
      },
      empty: {
        image: { type: String, default: null },
        text: { type: String, default: 'سلة التسوق فارغة' },
        cta: { type: String, default: 'تسوق الآن' },
        recommendations: { type: Boolean, default: true },
      },
    },

    // ─── 14. CHECKOUT ───────────────────────────────────────────────────────────
    checkout: {
      layout: { type: String, default: 'one-page' },
      width: { type: String, default: '800px' },
      branding: { type: String, default: 'store' },
      form: {
        labelStyle: { type: String, default: 'floating' },
        inputBackground: { type: String, default: '#FFFFFF' },
        inputBorder: { type: String, default: '#E2E8F0' },
        inputRadius: { type: String, default: '0.5rem' },
        inputText: { type: String, default: '#1D2430' },
      },
      sections: {
        collapsible: { type: Boolean, default: true },
        styled: { type: Boolean, default: true },
      },
      payment: {
        displayStyle: { type: String, default: 'icons' },
        icons: { type: Boolean, default: true },
      },
      summary: {
        position: { type: String, default: 'right' },
        sticky: { type: Boolean, default: true },
        imageSize: { type: String, default: 'sm' },
      },
      trust: {
        ssl: { type: Boolean, default: true },
        guarantee: { type: Boolean, default: true },
        testimonials: { type: Boolean, default: false },
        badges: { type: Boolean, default: true },
      },
      footer: {
        policyLinks: { type: Boolean, default: true },
        backToStore: { type: Boolean, default: true },
      },
    },

    // ─── 16. MOBILE ─────────────────────────────────────────────────────────────
    mobile: {
      breakpoints: {
        tablet: { type: Number, default: 768 },
        mobile: { type: Number, default: 480 },
      },
      settings: {
        logoSize: { type: String, default: '120px' },
        menuStyle: { type: String, default: 'hamburger' },
        productDisplay: { type: String, default: 'grid' },
        stickyHeader: { type: Boolean, default: true },
        stickyCart: { type: Boolean, default: true },
      },
      bottomNav: {
        enabled: { type: Boolean, default: false },
        items: { type: mongoose.Schema.Types.Mixed, default: [] },
      },
      touch: {
        swipeGallery: { type: Boolean, default: true },
        swipeCarousel: { type: Boolean, default: true },
        tapZoom: { type: Boolean, default: true },
      },
      performance: {
        reduceAnimations: { type: Boolean, default: false },
        lowerQuality: { type: Boolean, default: false },
        hideVideos: { type: Boolean, default: false },
      },
    },

    // ─── 17. CUSTOM CODE ────────────────────────────────────────────────────────
    customCode: {
      css: {
        code: { type: String, default: null },
        toggle: { type: Boolean, default: true },
      },
      js: {
        head: { type: String, default: null },
        body: { type: String, default: null },
        footer: { type: String, default: null },
        toggle: { type: Boolean, default: true },
      },
      versionHistory: { type: mongoose.Schema.Types.Mixed, default: [] },
    },

    // ─── Legacy compatibility fields ────────────────────────────────────────────
    spacing: {
      sectionPadding: { type: String, default: '4rem' },
      elementGap: { type: String, default: '1.5rem' },
      contentPadding: { type: String, default: '1rem' },
    },
    customCss: {
      type: String,
      default: null,
      maxlength: [50000, 'CSS لا يمكن أن يتجاوز 50000 حرف'],
    },
    customHtml: {
      header: { type: String, default: null, maxlength: [10000, 'كود HEAD لا يمكن أن يتجاوز 10000 حرف'] },
      footer: { type: String, default: null, maxlength: [10000, 'كود FOOTER لا يمكن أن يتجاوز 10000 حرف'] },
    },

    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

module.exports = mongoose.model('ThemeSetting', themeSettingSchema);
