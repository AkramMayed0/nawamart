import { createContext, useContext } from 'react'

export const StoreThemeContext = createContext(null)

export function useStoreTheme() {
  return useContext(StoreThemeContext) || {}
}

/* Resolved helpers so components don't repeat fallback logic */
export function useStoreColors() {
  const t = useStoreTheme()
  const c = t?.colors || {}
  return {
    primary:    c.primary    || '#18212F',
    accent:     c.accent     || '#C93F2B',
    background: c.background || '#FFFFFF',
    surface:    c.surface    || '#F9FAFB',
    text:       c.text       || '#111827',
    textMuted:  c.textMuted  || '#6B7280',
    border:     c.border     || '#E5E7EB',
    headerBg:   c.headerBg   || c.header || '#FFFFFF',
    headerText: c.headerText || c.text   || '#111827',
    footerBg:   c.footerBg   || c.footer || '#111827',
    footerText: c.footerText || '#F9FAFB',
    buttonBg:   c.buttonBg   || c.button || c.accent || '#C93F2B',
    buttonText: c.buttonText || '#FFFFFF',
  }
}

export function useStoreLayout() {
  const t = useStoreTheme()
  const l = t?.layout || {}
  return {
    borderRadius:     l.borderRadius     || '10px',
    headerStyle:      l.headerStyle      || 'split',      // split | centered | minimal | bold
    heroStyle:        l.heroStyle        || 'dark',       // dark | split | compact | banner
    productCardStyle: l.productCardStyle || 'shadow',     // shadow | bordered | minimal | elevated
    gridColumns:      l.gridColumns      || 3,
    imageRatio:       l.imageRatio       || '4/5',
    containerWidth:   l.containerWidth   || '1280px',
  }
}

export function useStoreTypography() {
  const t = useStoreTheme()
  const ty = t?.typography || t?.fonts || {}
  return {
    headingFont:   ty.headingFont || ty.heading?.family || 'Cairo',
    bodyFont:      ty.bodyFont    || ty.body?.family    || 'Cairo',
    headingWeight: ty.headingWeight || '800',
  }
}
