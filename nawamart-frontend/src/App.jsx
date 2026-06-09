import { useEffect } from 'react'
import { Routes, Route, Navigate, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getProfile } from '@/api/auth'
import { getAdminSession } from '@/api/admin'
import { useAuthStore } from '@/store/authStore'
import { useCustomerAuthStore } from '@/store/customerAuthStore'
import { useAdminStore } from '@/store/adminStore'

import LandingPage from '@/pages/LandingPage'
import ChangelogPage from '@/pages/ChangelogPage'
import NotFoundPage from '@/pages/NotFoundPage'
import MerchantLogin from '@/pages/auth/MerchantLogin'
import MerchantRegister from '@/pages/auth/MerchantRegister'
import MfaChallenge from '@/pages/auth/MfaChallenge'
import CustomerLogin from '@/pages/auth/CustomerLogin'
import CustomerRegister from '@/pages/auth/CustomerRegister'
import ForgotPassword from '@/pages/auth/ForgotPassword'
import ResetPassword from '@/pages/auth/ResetPassword'
import OnboardingPage from '@/pages/OnboardingPage'
import SubscribePage from '@/pages/subscribe/SubscribePage'

import AdminLogin from '@/pages/admin/AdminLogin'
import AdminForgotPassword from '@/pages/admin/AdminForgotPassword'
import AdminResetPassword from '@/pages/admin/AdminResetPassword'
import AdminLayout from '@/pages/admin/AdminLayout'
import AdminOverview from '@/pages/admin/AdminOverview'
import AdminSubscriptions from '@/pages/admin/AdminSubscriptions'
import AdminMerchants from '@/pages/admin/AdminMerchants'
import AdminStores from '@/pages/admin/AdminStores'
import AdminOrders from '@/pages/admin/AdminOrders'
import AdminCustomers from '@/pages/admin/AdminCustomers'
import AdminAnalytics from '@/pages/admin/AdminAnalytics'
import AdminHealthScores from '@/pages/admin/AdminHealthScores'
import AdminReports from '@/pages/admin/AdminReports'
import AdminTickets from '@/pages/admin/AdminTickets'
import AdminKnowledgeBase from '@/pages/admin/AdminKnowledgeBase'
import AdminFeedback from '@/pages/admin/AdminFeedback'
import AdminFeatureFlags from '@/pages/admin/AdminFeatureFlags'
import AdminChangelog from '@/pages/admin/AdminChangelog'
import SupportPage from '@/pages/dashboard/SupportPage'
import KnowledgeViewPage from '@/pages/dashboard/KnowledgeViewPage'

import DashboardLayout from '@/pages/dashboard/DashboardLayout'
import DashboardHome from '@/pages/dashboard/DashboardHome'
import ShopPage from '@/pages/dashboard/ShopPage'
import OrdersPage from '@/pages/dashboard/OrdersPage'
import OrderDetailPage from '@/pages/dashboard/OrderDetailPage'
import ProductsPage from '@/pages/dashboard/ProductsPage'
import CustomersPage from '@/pages/dashboard/CustomersPage'
import ChatListPage from '@/pages/dashboard/ChatListPage'
import ChatPage from '@/pages/dashboard/ChatPage'
import FinancePage from '@/pages/dashboard/FinancePage'
import ReportsPage from '@/pages/dashboard/ReportsPage'
import ProfilePage from '@/pages/dashboard/ProfilePage'
import MfaSetupPage from '@/pages/dashboard/MfaSetupPage'
import SessionsPage from '@/pages/dashboard/SessionsPage'
import StaffPage from '@/pages/dashboard/StaffPage'
import SettingsPage from '@/pages/dashboard/SettingsPage'
import AntiFraudPage from '@/pages/dashboard/AntiFraudPage'
import CourierDispatcherPage from '@/pages/dashboard/CourierDispatcherPage'
import ActivityLogPage from '@/pages/dashboard/ActivityLogPage'
import DiscountsPage from '@/pages/dashboard/DiscountsPage'
import ApiKeysPage from '@/pages/dashboard/ApiKeysPage'
import WebhooksPage from '@/pages/dashboard/WebhooksPage'
import CompliancePage from '@/pages/dashboard/CompliancePage'
import LegalPagesPage from '@/pages/dashboard/LegalPagesPage'
import ThemesPage from '@/pages/dashboard/ThemesPage'
import ThemeCustomizerPage from '@/pages/dashboard/ThemeCustomizerPage'
import PagesPage from '@/pages/dashboard/PagesPage'
import PageBuilderPage from '@/pages/dashboard/PageBuilderPage'
import DeveloperPortal from '@/pages/developer/DeveloperPortal'
import LegalPageView from '@/pages/storefront/LegalPageView'
import CourierPortalPage from '@/pages/courier/CourierPortalPage'


import StorefrontLayout from '@/pages/storefront/StorefrontLayout'
import StorePage from '@/pages/storefront/StorePage'
import ProductDetailPage from '@/pages/storefront/ProductDetailPage'
import CartPage from '@/pages/storefront/CartPage'
import CheckoutPage from '@/pages/storefront/CheckoutPage'
import OrderConfirmationPage from '@/pages/storefront/OrderConfirmationPage'
import OrderTrackingPage from '@/pages/storefront/OrderTrackingPage'
import CustomerOrdersPage from '@/pages/storefront/CustomerOrdersPage'
import CustomerChatPage from '@/pages/storefront/CustomerChatPage'

function RouteLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg" dir="rtl">
      <p className="font-cairo text-sm font-semibold text-text-muted">جاري التحقق من الجلسة...</p>
    </div>
  )
}

function dashboardForRole(role) {
  return role === 'merchant' ? '/dashboard' : '/'
}

function PrivateRoute({ children, role = 'merchant' }) {
  const token = useAuthStore((state) => state.token)
  const user = useAuthStore((state) => state.user)
  const login = useAuthStore((state) => state.login)
  const setStore = useAuthStore((state) => state.setStore)
  const setStores = useAuthStore((state) => state.setStores)
  const logout = useAuthStore((state) => state.logout)

  const session = useQuery({
    queryKey: ['auth-session', token],
    queryFn: () => getProfile().then((response) => response.data.data),
    enabled: !!token,
    retry: false,
    staleTime: 60_000,
  })

  useEffect(() => {
    if (!session.data) return

    login(token, session.data.user)
    const sessionStores = session.data.role === 'merchant' ? session.data.stores ?? [] : []
    if (sessionStores.length > 0) {
      setStores(sessionStores)
    }
    const currentStore = useAuthStore.getState().store
    const sessionStore = sessionStores[0] ?? null
    if (sessionStore || !currentStore) {
      setStore(sessionStore)
    }
  }, [session.data, login, setStore, setStores, token])

  useEffect(() => {
    if (session.isError) logout()
  }, [session.isError, logout])

  if (!token) return <Navigate to="/merchant/login" replace />
  if (session.isLoading) return <RouteLoader />
  if (session.isError) return <Navigate to="/merchant/login" replace />

  const activeRole = session.data?.role ?? user?.role
  if (role && activeRole !== role) {
    return <Navigate to={dashboardForRole(activeRole)} replace />
  }

  return children
}

function GuestRoute({ children }) {
  const token = useAuthStore((state) => state.token)
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)

  const session = useQuery({
    queryKey: ['auth-session', token],
    queryFn: () => getProfile().then((response) => response.data.data),
    enabled: !!token,
    retry: false,
    staleTime: 60_000,
  })

  useEffect(() => {
    if (session.isError) logout()
  }, [session.isError, logout])

  if (!token || session.isError) return children
  if (session.isLoading) return <RouteLoader />

  return <Navigate to={dashboardForRole(session.data?.role ?? user?.role)} replace />
}

function CustomerGuestRoute({ children }) {
  const token = useCustomerAuthStore((state) => state.token)
  const [searchParams] = useSearchParams()

  if (token) {
    const redirect = searchParams.get('redirect') || '/'
    return <Navigate to={redirect} replace />
  }

  return children
}

function AdminRoute({ children }) {
  const token = useAdminStore((state) => state.token)
  const login = useAdminStore((state) => state.login)
  const logout = useAdminStore((state) => state.logout)

  const session = useQuery({
    queryKey: ['admin-session', token],
    queryFn: () => getAdminSession().then((response) => response.data.data),
    enabled: !!token,
    retry: false,
    staleTime: 60_000,
  })

  useEffect(() => {
    if (session.data?.admin) login(token, session.data.admin)
  }, [session.data, login, token])

  useEffect(() => {
    if (session.isError) logout()
  }, [session.isError, logout])

  if (!token) return <Navigate to="/admin/login" replace />
  if (session.isLoading) return <RouteLoader />
  if (session.isError) return <Navigate to="/admin/login" replace />

  return children
}

function AdminGuestRoute({ children }) {
  const token = useAdminStore((state) => state.token)
  const logout = useAdminStore((state) => state.logout)

  const session = useQuery({
    queryKey: ['admin-session', token],
    queryFn: () => getAdminSession().then((response) => response.data.data),
    enabled: !!token,
    retry: false,
    staleTime: 60_000,
  })

  useEffect(() => {
    if (session.isError) logout()
  }, [session.isError, logout])

  if (!token || session.isError) return children
  if (session.isLoading) return <RouteLoader />

  return <Navigate to="/admin/dashboard" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/changelog" element={<ChangelogPage />} />

      <Route path="/merchant/login" element={<GuestRoute><MerchantLogin /></GuestRoute>} />
      <Route path="/merchant/register" element={<GuestRoute><MerchantRegister /></GuestRoute>} />
      <Route path="/merchant/mfa-challenge" element={<MfaChallenge />} />
      <Route path="/merchant/forgot-password" element={<ForgotPassword />} />
      <Route path="/merchant/reset-password/:token" element={<ResetPassword />} />
      <Route path="/customer/login" element={<CustomerGuestRoute><CustomerLogin /></CustomerGuestRoute>} />
      <Route path="/customer/register" element={<CustomerGuestRoute><CustomerRegister /></CustomerGuestRoute>} />
      <Route path="/customer/forgot-password" element={<ForgotPassword />} />
      <Route path="/customer/reset-password/:token" element={<ResetPassword />} />
      <Route path="/onboarding" element={<PrivateRoute role="merchant"><OnboardingPage /></PrivateRoute>} />
      <Route path="/subscribe" element={<PrivateRoute role="merchant"><SubscribePage /></PrivateRoute>} />

      <Route path="/dashboard" element={<PrivateRoute role="merchant"><DashboardLayout /></PrivateRoute>}>
        <Route index element={<DashboardHome />} />
        <Route path="shop" element={<ShopPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="orders/:orderId" element={<OrderDetailPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="customers" element={<CustomersPage />} />
        <Route path="chat" element={<ChatListPage />} />
        <Route path="chat/order/:orderId" element={<ChatPage />} />
        <Route path="chat/:chatId" element={<ChatPage />} />
        <Route path="finance" element={<FinancePage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="security/mfa" element={<MfaSetupPage />} />
        <Route path="sessions" element={<SessionsPage />} />
        <Route path="staff" element={<StaffPage />} />
        <Route path="activity" element={<ActivityLogPage />} />
        <Route path="anti-fraud" element={<AntiFraudPage />} />
        <Route path="couriers" element={<CourierDispatcherPage />} />
        <Route path="discounts" element={<DiscountsPage />} />
        <Route path="api-keys" element={<ApiKeysPage />} />
        <Route path="webhooks" element={<WebhooksPage />} />
        <Route path="compliance" element={<CompliancePage />} />
        <Route path="legal-pages" element={<LegalPagesPage />} />
        <Route path="support" element={<SupportPage />} />
        <Route path="knowledge" element={<KnowledgeViewPage />} />
        <Route path="themes" element={<ThemesPage />} />
        <Route path="themes/:themeId/customize" element={<ThemeCustomizerPage />} />
        <Route path="pages" element={<PagesPage />} />
        <Route path="pages/:pageId/builder" element={<PageBuilderPage />} />
      </Route>

      <Route path="/developers" element={<DeveloperPortal />} />
      <Route path="/courier-portal/:courierId" element={<CourierPortalPage />} />

      <Route path="/store/:slug" element={<StorefrontLayout />}>
        <Route index element={<StorePage />} />
        <Route path="product/:productId" element={<ProductDetailPage />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="checkout" element={<CheckoutPage />} />
        <Route path="orders" element={<CustomerOrdersPage />} />
        <Route path="order/:orderId" element={<OrderConfirmationPage />} />
        <Route path="order/:orderId/track" element={<OrderTrackingPage />} />
        <Route path="chat/:chatId" element={<CustomerChatPage />} />
        <Route path="legal/:type" element={<LegalPageView />} />
      </Route>

      <Route path="/admin/login" element={<AdminGuestRoute><AdminLogin /></AdminGuestRoute>} />
      <Route path="/admin/forgot-password" element={<AdminForgotPassword />} />
      <Route path="/admin/reset-password/:token" element={<AdminResetPassword />} />
      <Route path="/admin/dashboard" element={<AdminRoute><AdminLayout /></AdminRoute>}>
        <Route index element={<AdminOverview />} />
        <Route path="subscriptions" element={<AdminSubscriptions />} />
        <Route path="merchants" element={<AdminMerchants />} />
        <Route path="stores" element={<AdminStores />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="customers" element={<AdminCustomers />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="health-scores" element={<AdminHealthScores />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="tickets" element={<AdminTickets />} />
        <Route path="knowledge-base" element={<AdminKnowledgeBase />} />
        <Route path="feedback" element={<AdminFeedback />} />
        <Route path="feature-flags" element={<AdminFeatureFlags />} />
        <Route path="changelog" element={<AdminChangelog />} />
      </Route>

      <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
