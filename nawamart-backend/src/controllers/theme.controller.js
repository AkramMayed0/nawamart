const Theme = require('../models/Theme');
const Store = require('../models/Store');
const ThemeSetting = require('../models/ThemeSetting');
const { asyncHandler, apiResponse, paginate } = require('../utils/helpers');

// ─── Deep merge helper ───────────────────────────────────────────────────────
function deepMerge(target, source) {
  const result = { ...target };
  for (const key of Object.keys(source || {})) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(result[key] || {}, source[key]);
    } else if (source[key] !== undefined) {
      result[key] = source[key];
    }
  }
  return result;
}

// ─── Expand simple theme settings → full ThemeSetting structure ──────────────
function expandThemeSettings(theme) {
  const c = theme.settings?.colors || {};
  const f = theme.settings?.fonts || {};
  const l = theme.settings?.layout || {};
  const s = theme.settings?.spacing || {};

  const expanded = {
    colors: {
      primary: c.primary || '#18212F',
      secondary: c.secondary || '#2D7BE0',
      accent: c.accent || '#C93F2B',
      background: c.background || '#F6F3EE',
      surface: c.surface || '#FFFFFF',
      text: c.text || '#1D2430',
      textMuted: c.textMuted || '#5F6673',
      header: c.header || '#18212F',
      footer: c.footer || '#18212F',
      button: c.button || '#C93F2B',
      buttonText: c.buttonText || '#FFFFFF',
      success: c.success || '#27AE60',
      danger: c.danger || '#E74C3C',
      warning: c.warning || '#F39C12',
      backgrounds: {
        main: c.background || '#F6F3EE',
        surface: c.surface || '#FFFFFF',
        section: '#FAFAF9',
      },
      textColors: {
        heading: c.text || '#1D2430',
        body: '#4A5568',
        muted: c.textMuted || '#5F6673',
        link: c.secondary || '#2D7BE0',
        price: c.accent || '#C93F2B',
        onDark: '#FFFFFF',
      },
      borders: {
        default: '#E2E8F0',
        hover: '#CBD5E0',
        light: '#F0F0F0',
      },
      status: {
        success: c.success || '#27AE60',
        error: c.danger || '#E74C3C',
        warning: c.warning || '#F39C12',
        info: '#3498DB',
      },
      sale: {
        badge: c.danger || '#E74C3C',
        text: '#FFFFFF',
      },
      headerColors: {
        background: c.header || '#18212F',
        text: '#FFFFFF',
        link: '#B0BEC5',
      },
      footerColors: {
        background: c.footer || '#18212F',
        text: '#CBD5E0',
        link: '#A0AEC0',
        heading: '#FFFFFF',
      },
      cartCheckout: {
        primary: c.accent || '#C93F2B',
        secondary: c.secondary || '#2D7BE0',
      },
    },

    typography: {
      heading: {
        family: f.heading || 'Cairo',
        source: 'google',
        weight: '700',
        spacing: 'normal',
        lineHeight: '1.3',
        transform: 'none',
      },
      body: {
        family: f.body || 'Cairo',
        source: 'google',
        weight: '400',
        spacing: 'normal',
        lineHeight: '1.6',
      },
      accent: {
        family: f.body || 'Cairo',
        source: 'google',
        weight: '600',
        spacing: 'normal',
        lineHeight: '1.4',
      },
      button: {
        family: f.heading || 'Cairo',
        weight: '600',
        transform: 'none',
      },
      sizes: {
        h1: f.sizes?.h1 || '2.5rem',
        h2: f.sizes?.h2 || '2rem',
        h3: f.sizes?.h3 || '1.75rem',
        h4: f.sizes?.h4 || '1.5rem',
        h5: '1.25rem',
        h6: '1rem',
        body: '1rem',
        bodySmall: '0.875rem',
        bodyLarge: '1.125rem',
      },
      baseScale: 1,
    },

    layout: {
      headerStyle: l.headerStyle || 'classic',
      footerStyle: l.footerStyle || 'classic',
      productCardStyle: l.productCardStyle || 'grid',
      sidebarPosition: l.sidebarPosition || 'right',
      containerWidth: l.containerWidth || '1280px',
      borderRadius: 'md',
      animationEnabled: true,
      pageWidth: l.containerWidth || '1280px',
      containerPadding: '1rem',
      grid: {
        productsPerRow: { desktop: 4, tablet: 3, mobile: 2 },
        gap: { desktop: '1.5rem', tablet: '1rem', mobile: '0.75rem' },
      },
      sectionSpacing: s.sectionPadding || '4rem',
      card: {
        radius: '0.75rem',
        shadow: 'sm',
        padding: '1rem',
      },
      imageRatios: { product: '1:1', collection: '3:4', blog: '16:9' },
      breadcrumbs: { enabled: true, style: 'slash' },
      pagination: { style: 'numbered', showFirst: true, showLast: true },
    },

    header: {
      layout: { preset: l.headerStyle || 'classic', sticky: true, transparent: false, height: '80px' },
      logo: {
        type: 'text',
        image: null,
        text: 'متجري',
        size: { desktop: '180px', tablet: '140px', mobile: '120px' },
        favicon: null,
      },
      nav: {
        alignment: 'center', spacing: '2rem', font: f.heading || 'Cairo',
        megaMenu: false, dropdownAnimation: 'fade', mobileMenuStyle: 'drawer',
      },
      search: { style: 'bar', position: 'right', suggestions: true },
      icons: {
        cart: { enabled: true, style: 'icon', customUrl: null },
        wishlist: { enabled: false, style: 'icon', customUrl: null },
        account: { enabled: true, style: 'icon', customUrl: null },
        size: '24px',
        color: '#FFFFFF',
      },
      bars: {
        announcement: {
          text: '', link: null, background: '#C93F2B', textColor: '#FFFFFF',
          dismissible: true, rotate: false,
        },
        topBar: { contacts: true, social: true },
      },
    },

    footer: {
      layout: { columns: 4, width: 'full' },
      blocks: [],
      bottom: {
        copyright: '© 2026 جميع الحقوق محفوظة',
        poweredBy: true, backToTop: true,
        languageSelector: false, currencySelector: false,
      },
    },

    buttons: {
      primary: {
        background: c.button || '#C93F2B', text: c.buttonText || '#FFFFFF',
        hover: '#B0352A', border: c.button || '#C93F2B',
        radius: '0.75rem', padding: '0.75rem 1.5rem',
        font: f.heading || 'Cairo', shadow: false, animation: 'none',
      },
      secondary: {
        background: 'transparent', text: c.text || '#1D2430',
        hover: '#F6F3EE', border: '#E2E8F0',
        radius: '0.75rem', padding: '0.75rem 1.5rem',
        font: f.heading || 'Cairo', shadow: false, animation: 'none',
      },
      small: { radius: '0.5rem', padding: '0.375rem 0.75rem', size: '0.875rem' },
      quantity: { radius: '0.5rem', padding: '0.25rem', size: '2rem', style: 'default' },
    },

    badges: {
      sale: { text: 'تخفيض', position: 'top-left', background: '#E74C3C', textColor: '#FFFFFF', shape: 'rectangle', size: 'md' },
      soldOut: { text: 'نفد', position: 'top-right', background: '#95A5A6', textColor: '#FFFFFF', shape: 'rectangle', size: 'md' },
      new: { text: 'جديد', position: 'top-left', background: '#27AE60', textColor: '#FFFFFF', shape: 'rectangle', size: 'sm', autoExpire: true, expireDays: 30 },
      lowStock: { enabled: true, text: 'متبقي قليل', position: 'bottom-left', background: '#F39C12', textColor: '#FFFFFF', shape: 'rectangle', size: 'sm', threshold: 5 },
      bestSeller: { text: 'الأكثر مبيعاً', position: 'top-right', background: '#2D7BE0', textColor: '#FFFFFF', shape: 'pill', size: 'sm' },
      preOrder: { text: 'طلب مسبق', position: 'top-left', background: '#8E44AD', textColor: '#FFFFFF', shape: 'rectangle', size: 'md' },
    },

    customCss: theme.assets?.css || null,
    customCode: {
      css: { code: theme.assets?.css || null, toggle: !!theme.assets?.css },
      js: { head: null, body: null, footer: null, toggle: false },
      versionHistory: [],
    },

    spacing: {
      sectionPadding: s.sectionPadding || '4rem',
      elementGap: s.elementGap || '1.5rem',
      contentPadding: '1rem',
    },
  };

  // Deep-merge with fullSettings overrides (for premium themes)
  if (theme.fullSettings) {
    return deepMerge(expanded, theme.fullSettings);
  }

  return expanded;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const getThemes = asyncHandler(async (req, res) => {
  const { category, type, search } = req.query;
  const query = { isActive: true };
  if (category) query.category = category;
  if (type) query.type = type;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }
  const result = await paginate(Theme, query, {
    page: req.query.page,
    limit: req.query.limit,
    sort: { isDefault: -1, installCount: -1, createdAt: -1 },
  });
  return apiResponse(res, {
    data: result,
    message: 'تم جلب القوائم بنجاح',
  });
});

const getThemeBySlug = asyncHandler(async (req, res) => {
  const theme = await Theme.findOne({ slug: req.params.slug, isActive: true });
  if (!theme) {
    return apiResponse(res, { statusCode: 404, success: false, message: 'القالب غير موجود' });
  }
  return apiResponse(res, { data: theme, message: 'تم جلب القالب بنجاح' });
});

// ─── Install: expand + merge theme settings into ThemeSetting ────────────────
const installTheme = asyncHandler(async (req, res) => {
  const { themeId } = req.body;
  const storeId = req.params.storeId;

  const store = await Store.findOne({ _id: storeId, merchant: req.user._id });
  if (!store) {
    return apiResponse(res, { statusCode: 404, success: false, message: 'المتجر غير موجود' });
  }

  const theme = await Theme.findById(themeId);
  if (!theme || !theme.isActive) {
    return apiResponse(res, { statusCode: 404, success: false, message: 'القالب غير موجود' });
  }

  store.activeTheme = themeId;
  await store.save();

  await Theme.findByIdAndUpdate(themeId, { $inc: { installCount: 1 } });

  // Generate full settings
  const full = expandThemeSettings(theme);

  let themeSetting = await ThemeSetting.findOne({ store: storeId });
  if (!themeSetting) {
    themeSetting = new ThemeSetting({ store: storeId, theme: themeId, ...full });
  } else {
    themeSetting.set({ theme: themeId, ...full });
  }
  await themeSetting.save();

  return apiResponse(res, {
    statusCode: 200,
    data: { store, theme, themeSetting },
    message: `تم تثبيت القالب "${theme.name}" بنجاح`,
  });
});

const uninstallTheme = asyncHandler(async (req, res) => {
  const storeId = req.params.storeId;

  const store = await Store.findOne({ _id: storeId, merchant: req.user._id });
  if (!store) {
    return apiResponse(res, { statusCode: 404, success: false, message: 'المتجر غير موجود' });
  }

  const defaultTheme = await Theme.findOne({ isDefault: true });
  store.activeTheme = defaultTheme ? defaultTheme._id : null;
  await store.save();

  await ThemeSetting.findOneAndUpdate(
    { store: storeId },
    { $set: { theme: defaultTheme ? defaultTheme._id : null } }
  );

  return apiResponse(res, {
    message: 'تم إلغاء تثبيت القالب والعودة إلى القالب الافتراضي',
  });
});

const getCategories = asyncHandler(async (req, res) => {
  const categories = await Theme.distinct('category', { isActive: true });
  const labels = {
    fashion: 'أزياء',
    electronics: 'إلكترونيات',
    food: 'طعام',
    digital: 'رقمي',
    general: 'عام',
  };
  const result = categories.map((cat) => ({
    value: cat,
    label: labels[cat] || cat,
  }));
  return apiResponse(res, { data: result, message: 'تم جلب التصنيفات بنجاح' });
});

module.exports = {
  getThemes,
  getThemeBySlug,
  installTheme,
  uninstallTheme,
  getCategories,
};
