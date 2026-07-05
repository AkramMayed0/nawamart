import { NavLink, useNavigate } from 'react-router-dom'
import {
  Banknote, BarChart3, Eye, LayoutDashboard, LogOut,
  MessageSquare, Package, Settings, ShoppingBag, Store,
  User, Users, ShieldAlert, Truck, Shield, Smartphone,
  UserCog, Clock, Tag, Key, Webhook, BookOpen, FileText,
  HelpCircle, Palette, Image, File, Warehouse, Sun, Moon,
  ChevronRight, Sparkles, Save,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useThemeStore } from '@/store/themeStore'
import StoreSwitcher from './StoreSwitcher'
import { useState } from 'react'

/* ── Icon color map ── */
const ICON_COLORS = {
  LayoutDashboard: '#6366F1',
  Eye:             '#0EA5E9',
  ShoppingBag:     '#F59E0B',
  Package:         '#10B981',
  Warehouse:       '#8B5CF6',
  Users:           '#EC4899',
  MessageSquare:   '#14B8A6',
  Banknote:        '#22C55E',
  BarChart3:       '#3B82F6',
  Tag:             '#F97316',
  HelpCircle:      '#6366F1',
  BookOpen:        '#8B5CF6',
  Palette:         '#EC4899',
  Sparkles:        '#F59E0B',
  Save:            '#0EA5E9',
  Image:           '#0EA5E9',
  File:            '#6366F1',
  User:            '#14B8A6',
  UserCog:         '#3B82F6',
  Clock:           '#F97316',
  Shield:          '#22C55E',
  Settings:        '#8B5CF6',
  Key:             '#EC4899',
  Webhook:         '#F59E0B',
  FileText:        '#6366F1',
  Smartphone:      '#14B8A6',
  ShieldAlert:     '#EC4899',
  Truck:           '#F97316',
}

const PLAN_COLORS = {
  starter:  '#3B82F6',
  pro:      '#F59E0B',
  business: '#22C55E',
}
const PLAN_LABELS = {
  starter:  'ستارتر',
  pro:      'برو',
  business: 'بيزنس',
}

const NAV = [
  {
    label: 'الرئيسية',
    items: [
      { to: '/dashboard',          label: 'لوحة التحكم', icon: LayoutDashboard, iconName: 'LayoutDashboard', end: true },
      { to: '/dashboard/shop',     label: 'متجري',       icon: Eye,             iconName: 'Eye' },
      { to: '/dashboard/orders',   label: 'الطلبات',     icon: ShoppingBag,     iconName: 'ShoppingBag' },
      { to: '/dashboard/products', label: 'المنتجات',    icon: Package,         iconName: 'Package' },
      { to: '/dashboard/inventory',label: 'المخزون',     icon: Warehouse,       iconName: 'Warehouse' },
      { to: '/dashboard/customers',label: 'العملاء',     icon: Users,           iconName: 'Users' },
      { to: '/dashboard/chat',     label: 'التسليم',     icon: MessageSquare,   iconName: 'MessageSquare' },
    ],
  },
  {
    label: 'النشاط التجاري',
    items: [
      { to: '/dashboard/finance',   label: 'المالية',    icon: Banknote,   iconName: 'Banknote' },
      { to: '/dashboard/reports',   label: 'التقارير',   icon: BarChart3,  iconName: 'BarChart3' },
      { to: '/dashboard/discounts', label: 'الخصومات',   icon: Tag,        iconName: 'Tag' },
      { to: '/dashboard/support',   label: 'الدعم',      icon: HelpCircle, iconName: 'HelpCircle' },
      { to: '/dashboard/knowledge', label: 'المعرفة',    icon: BookOpen,   iconName: 'BookOpen' },
    ],
  },
  {
    label: 'التخصيص',
    collapsible: true,
    items: [
      { to: '/dashboard/customize',        label: 'مركز التخصيص', icon: Palette,        iconName: 'Palette' },
      { to: '/dashboard/themes',           label: 'القوالب',      icon: Sparkles,       iconName: 'Sparkles' },
      { to: '/dashboard/themes/customize', label: 'تخصيص القالب', icon: Palette,        iconName: 'Palette' },
      { to: '/dashboard/themes/presets',   label: 'الإعدادات',    icon: Save,           iconName: 'Save' },
      { to: '/dashboard/themes/homepage',  label: 'بناء الصفحة',  icon: LayoutDashboard,iconName: 'LayoutDashboard' },
      { to: '/dashboard/themes/assets',    label: 'الملفات',      icon: Image,          iconName: 'Image' },
      { to: '/dashboard/pages',            label: 'الصفحات',      icon: File,           iconName: 'File' },
    ],
  },
  {
    label: 'الإعدادات',
    collapsible: true,
    items: [
      { to: '/dashboard/profile',      label: 'الملف الشخصي',      icon: User,       iconName: 'User' },
      { to: '/dashboard/staff',        label: 'الفريق',             icon: UserCog,    iconName: 'UserCog' },
      { to: '/dashboard/activity',     label: 'النشاطات',           icon: Clock,      iconName: 'Clock' },
      { to: '/dashboard/security/mfa', label: 'المصادقة الثنائية',  icon: Shield,     iconName: 'Shield' },
      { to: '/dashboard/sessions',     label: 'الجلسات',            icon: Smartphone, iconName: 'Smartphone' },
      { to: '/dashboard/settings',     label: 'الإعدادات',          icon: Settings,   iconName: 'Settings' },
      { to: '/dashboard/api-keys',     label: 'مفاتيح API',         icon: Key,        iconName: 'Key' },
      { to: '/dashboard/webhooks',     label: 'Webhooks',           icon: Webhook,    iconName: 'Webhook' },
      { to: '/dashboard/compliance',   label: 'الامتثال',           icon: Shield,     iconName: 'Shield' },
      { to: '/dashboard/legal-pages',  label: 'الصفحات القانونية', icon: FileText,   iconName: 'FileText' },
    ],
  },
]

export default function DashboardSidebar({ onNavClick }) {
  const navigate     = useNavigate()
  const logout       = useAuthStore(s => s.logout)
  const stores       = useAuthStore(s => s.stores)
  const store        = useAuthStore(s => s.store)
  const user         = useAuthStore(s => s.user)
  const theme        = useThemeStore(s => s.theme)
  const toggleTheme  = useThemeStore(s => s.toggleTheme)
  const isDark       = theme === 'dark'

  const [collapsed, setCollapsed] = useState({ 'التخصيص': true, 'الإعدادات': true })

  function handleLogout() {
    logout()
    navigate('/merchant/login', { replace: true })
  }

  const D = isDark
  const sidebar = {
    bg:           D ? 'linear-gradient(180deg,#0F1117 0%,#131620 100%)' : '#FFFFFF',
    border:       D ? '1px solid rgba(255,255,255,0.06)' : '1px solid #E2E2E9',
    divider:      D ? 'rgba(255,255,255,0.06)' : '#E2E2E9',
    sectionLbl:   D ? 'rgba(255,255,255,0.28)' : '#9494A8',
    chevron:      D ? 'rgba(255,255,255,0.28)' : '#B8B8C8',
    storeName:    D ? '#FFFFFF' : '#0D0D12',
    storeEmail:   D ? 'rgba(255,255,255,0.4)' : '#9494A8',
    navInactive:  D ? 'rgba(255,255,255,0.5)' : '#6B7280',
    navHoverBg:   D ? 'rgba(255,255,255,0.05)' : '#F5F5F7',
    navHoverText: D ? '#FFFFFF' : '#18212F',
    activePill:   '#C93F2B',
    bottomText:   D ? 'rgba(255,255,255,0.45)' : '#9494A8',
    bottomHoverBg:D ? 'rgba(255,255,255,0.06)' : '#F5F5F7',
    bottomHoverText:D ? '#FFFFFF' : '#18212F',
    logoutText:   D ? 'rgba(201,63,43,0.75)' : '#C93F2B',
    logoutHoverBg:D ? 'rgba(201,63,43,0.12)' : 'rgba(201,63,43,0.08)',
    logoutHoverText:'#C93F2B',
  }

  const plan = store?.plan || 'starter'
  const planColor = PLAN_COLORS[plan] || PLAN_COLORS.starter
  const planLabel = PLAN_LABELS[plan] || plan

  return (
    <aside
      dir="rtl"
      className="flex h-full flex-col select-none"
      style={{ background: sidebar.bg, borderLeft: sidebar.border }}
    >
      {/* ── Store header ── */}
      <div className="shrink-0 px-4 pt-5 pb-4" style={{ borderBottom: `1px solid ${sidebar.divider}` }}>
        {stores?.length > 1 ? (
          <StoreSwitcher onNavClick={onNavClick} dark={isDark} />
        ) : (
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
              style={{
                background: 'linear-gradient(135deg, #C93F2B 0%, #A62F20 100%)',
                boxShadow: '0 2px 10px rgba(201,63,43,0.35)',
                borderRight: `2px solid ${planColor}`,
              }}
            >
              <Store size={18} className="text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate font-cairo text-[13.5px] font-bold leading-tight" style={{ color: sidebar.storeName }}>
                  {store?.name ?? 'متجري'}
                </p>
                <span style={{
                  background: `rgba(${hexToRgb(planColor)},0.12)`,
                  color: planColor,
                  borderRadius: '6px',
                  padding: '2px 8px',
                  fontSize: '10px',
                  fontWeight: 700,
                  fontFamily: 'Cairo, sans-serif',
                  flexShrink: 0,
                }}>
                  {planLabel}
                </span>
              </div>
              <p className="truncate font-cairo text-[11px] mt-0.5" style={{ color: sidebar.storeEmail }}>
                {user?.email ?? ''}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5 admin-sidebar-scroll">
        {NAV.map((section) => {
          const isCollapsible = !!section.collapsible
          const isOpen = isCollapsible ? !collapsed[section.label] : true

          return (
            <div key={section.label} className="mb-1">
              <button
                type="button"
                onClick={() => isCollapsible && setCollapsed(p => ({ ...p, [section.label]: !p[section.label] }))}
                className={`w-full flex items-center justify-between px-3 py-1 mb-0.5 rounded-lg ${isCollapsible ? 'cursor-pointer' : 'cursor-default'}`}
                style={{ background: 'transparent' }}
                onMouseEnter={e => { if (isCollapsible) e.currentTarget.style.background = sidebar.navHoverBg }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
              >
                <span
                  className="font-cairo font-bold text-[10px] uppercase tracking-widest"
                  style={{ color: sidebar.sectionLbl, letterSpacing: '0.1em' }}
                >
                  {section.label}
                </span>
                {isCollapsible && (
                  <ChevronRight
                    size={11}
                    style={{
                      color: sidebar.chevron,
                      transition: 'transform 200ms ease',
                      transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                    }}
                  />
                )}
              </button>

              {isOpen && section.items.map(({ to, label, icon: Icon, iconName, end = false }) => {
                const iconColor = ICON_COLORS[iconName] || '#6366F1'
                return (
                  <NavLink
                    key={to}
                    to={to}
                    end={end}
                    onClick={onNavClick}
                    className="relative flex items-center gap-2.5 rounded-[10px] px-3 py-[9px] font-cairo text-[13px] font-medium transition-none"
                    style={({ isActive }) => ({
                      background: isActive ? `rgba(${hexToRgb(iconColor)},0.10)` : 'transparent',
                      color: isActive ? iconColor : sidebar.navInactive,
                      fontWeight: isActive ? 600 : 500,
                    })}
                    onMouseEnter={e => {
                      const active = e.currentTarget.getAttribute('aria-current') === 'page'
                      if (!active) {
                        e.currentTarget.style.background = sidebar.navHoverBg
                        e.currentTarget.style.color = sidebar.navHoverText
                      }
                    }}
                    onMouseLeave={e => {
                      const active = e.currentTarget.getAttribute('aria-current') === 'page'
                      if (!active) {
                        e.currentTarget.style.background = 'transparent'
                        e.currentTarget.style.color = sidebar.navInactive
                      }
                    }}
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <span
                            className="absolute inset-y-1.5 end-0 w-[3px] rounded-full"
                            style={{ background: sidebar.activePill }}
                          />
                        )}
                        <Icon
                          size={15}
                          style={{
                            color: iconColor,
                            opacity: isActive ? 1 : 0.45,
                            flexShrink: 0,
                          }}
                        />
                        <span className="truncate">{label}</span>
                      </>
                    )}
                  </NavLink>
                )
              })}
            </div>
          )
        })}

        {/* Business plan advanced features */}
        {store?.type === 'physical' && store?.plan === 'business' && (
          <div className="mb-1">
            <div className="px-3 py-1 mb-0.5">
              <span className="font-cairo font-bold text-[10px] uppercase tracking-widest" style={{ color: sidebar.sectionLbl }}>
                ميزات متقدمة
              </span>
            </div>
            {[
              { to: '/dashboard/anti-fraud', label: 'درع المرتجعات', icon: ShieldAlert, iconName: 'ShieldAlert' },
              { to: '/dashboard/couriers',   label: 'إدارة المناديب', icon: Truck,       iconName: 'Truck' },
            ].map(({ to, label, icon: Icon, iconName }) => {
              const iconColor = ICON_COLORS[iconName] || '#6366F1'
              return (
                <NavLink
                  key={to}
                  to={to}
                  onClick={onNavClick}
                  className="relative flex items-center gap-2.5 rounded-[10px] px-3 py-[9px] font-cairo text-[13px] font-medium"
                  style={({ isActive }) => ({
                    background: isActive ? `rgba(${hexToRgb(iconColor)},0.10)` : 'transparent',
                    color: isActive ? iconColor : sidebar.navInactive,
                    fontWeight: isActive ? 600 : 500,
                  })}
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        size={15}
                        style={{ color: iconColor, opacity: isActive ? 1 : 0.45, flexShrink: 0 }}
                      />
                      <span className="truncate">{label}</span>
                    </>
                  )}
                </NavLink>
              )
            })}
          </div>
        )}
      </nav>

      {/* ── Bottom actions ── */}
      <div className="shrink-0 px-2 pb-3 pt-2 space-y-0.5" style={{ borderTop: `1px solid ${sidebar.divider}` }}>
        <button
          type="button"
          onClick={toggleTheme}
          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-[9px] font-cairo text-[13px] font-medium transition-none"
          style={{ color: sidebar.bottomText, background: 'transparent' }}
          onMouseEnter={e => { e.currentTarget.style.background = sidebar.bottomHoverBg; e.currentTarget.style.color = sidebar.bottomHoverText }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = sidebar.bottomText }}
        >
          {isDark
            ? <Sun size={15} style={{ color: '#F59E0B', flexShrink: 0 }} />
            : <Moon size={15} style={{ color: '#6366F1', flexShrink: 0 }} />
          }
          <span>{isDark ? 'الوضع النهاري' : 'الوضع الليلي'}</span>
        </button>

        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-[9px] font-cairo text-[13px] font-medium transition-none"
          style={{ color: sidebar.logoutText, background: 'transparent' }}
          onMouseEnter={e => { e.currentTarget.style.background = sidebar.logoutHoverBg; e.currentTarget.style.color = sidebar.logoutHoverText }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = sidebar.logoutText }}
        >
          <LogOut size={15} style={{ flexShrink: 0 }} />
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </aside>
  )
}

/* ── Helper: convert #RRGGBB → "R, G, B" for rgba() ── */
function hexToRgb(hex) {
  const h = hex.replace('#', '')
  const r = parseInt(h.substring(0, 2), 16)
  const g = parseInt(h.substring(2, 4), 16)
  const b = parseInt(h.substring(4, 6), 16)
  return `${r}, ${g}, ${b}`
}
