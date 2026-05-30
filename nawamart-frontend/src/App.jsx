import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getProfile } from '@/api/auth'
import { getAdminSession } from '@/api/admin'
import { useAuthStore } from '@/store/authStore'
import { useAdminStore } from '@/store/adminStore'

import LandingPage from '@/pages/LandingPage'
import NotFoundPage from '@/pages/NotFoundPage'
import MerchantLogin from '@/pages/auth/MerchantLogin'
import MerchantRegister from '@/pages/auth/MerchantRegister'
import CustomerLogin from '@/pages/auth/CustomerLogin'
import OnboardingPage from '@/pages/OnboardingPage'
import SubscribePage from '@/pages/subscribe/SubscribePage'

import AdminLogin from '@/pages/admin/AdminLogin'
import AdminLayout from '@/pages/admin/AdminLayout'
import AdminOverview from '@/pages/admin/AdminOverview'
import AdminSubscriptions from '@/pages/admin/AdminSubscriptions'
import AdminMerchants from '@/pages/admin/AdminMerchants'
import AdminStores from '@/pages/admin/AdminStores'
import AdminOrders from '@/pages/admin/AdminOrders'
import AdminCustomers from '@/pages/admin/AdminCustomers'

import DashboardLayout from '@/pages/dashboard/DashboardLayout'
import DashboardHome from '@/pages/dashboard/DashboardHome'
import ShopPage from '@/pages/dashboard/ShopPage'
import OrdersPage from '@/pages/dashboard/OrdersPage'
import ProductsPage from '@/pages/dashboard/ProductsPage'
import CustomersPage from '@/pages/dashboard/CustomersPage'
import ChatListPage from '@/pages/dashboard/ChatListPage'
import ChatPage from '@/pages/dashboard/ChatPage'
import FinancePage from '@/pages/dashboard/FinancePage'
import SettingsPage from '@/pages/dashboard/SettingsPage'

import StorefrontLayout from '@/pages/storefront/StorefrontLayout'
import StorePage from '@/pages/storefront/StorePage'
import ProductDetailPage from '@/pages/storefront/ProductDetailPage'
import CartPage from '@/pages/storefront/CartPage'
import CheckoutPage from '@/pages/storefront/CheckoutPage'
import OrderConfirmationPage from '@/pages/storefront/OrderConfirmationPage'
import OrderTrackingPage from '@/pages/storefront/OrderTrackingPage'

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
  const logout = useAuthStore((state) => state.logout)

  const session = useQuery({
    queryKey: ['auth-session', token],
    queryFn: () => getProfile().then((response) => response.data.data),
    enabled: !!token,
    retry: false,
    staleTime: 0,
  })

  useEffect(() => {
    if (!session.data) return

    login(token, session.data.user)
    const sessionStore = session.data.role === 'merchant' ? session.data.stores?.[0] ?? null : null
    const currentStore = useAuthStore.getState().store
    // Only overwrite store from session if it has stores data, or if Zustand is empty.
    // Prevents a stale session cache (fetched before store creation) from wiping
    // a freshly created store when navigating from OnboardingPage to Dashboard.
    if (sessionStore || !currentStore) {
      setStore(sessionStore)
    }
  }, [session.data, login, setStore, token])

  useEffect(() => {
    if (session.isError) logout()
  }, [session.isError, logout])

  if (!token) return <Navigate to="/merchant/login" replace />
  if (session.isLoading || session.isFetching) return <RouteLoader />
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
  if (session.isLoading || session.isFetching) return <RouteLoader />

  return <Navigate to={dashboardForRole(session.data?.role ?? user?.role)} replace />
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
  if (session.isLoading || session.isFetching) return <RouteLoader />
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
  if (session.isLoading || session.isFetching) return <RouteLoader />

  return <Navigate to="/admin/dashboard" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

      <Route path="/merchant/login" element={<GuestRoute><MerchantLogin /></GuestRoute>} />
      <Route path="/merchant/register" element={<GuestRoute><MerchantRegister /></GuestRoute>} />
      <Route path="/customer/login" element={<GuestRoute><CustomerLogin /></GuestRoute>} />
      <Route path="/onboarding" element={<PrivateRoute role="merchant"><OnboardingPage /></PrivateRoute>} />
      <Route path="/subscribe" element={<PrivateRoute role="merchant"><SubscribePage /></PrivateRoute>} />

      <Route path="/dashboard" element={<PrivateRoute role="merchant"><DashboardLayout /></PrivateRoute>}>
        <Route index element={<DashboardHome />} />
        <Route path="shop" element={<ShopPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="customers" element={<CustomersPage />} />
        <Route path="chat" element={<ChatListPage />} />
        <Route path="chat/order/:orderId" element={<ChatPage />} />
        <Route path="chat/:chatId" element={<ChatPage />} />
        <Route path="finance" element={<FinancePage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      <Route path="/store/:slug" element={<StorefrontLayout />}>
        <Route index element={<StorePage />} />
        <Route path="product/:productId" element={<ProductDetailPage />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="checkout" element={<CheckoutPage />} />
        <Route path="order/:orderId" element={<OrderConfirmationPage />} />
        <Route path="order/:orderId/track" element={<OrderTrackingPage />} />
      </Route>

      <Route path="/admin/login" element={<AdminGuestRoute><AdminLogin /></AdminGuestRoute>} />
      <Route path="/admin/dashboard" element={<AdminRoute><AdminLayout /></AdminRoute>}>
        <Route index element={<AdminOverview />} />
        <Route path="subscriptions" element={<AdminSubscriptions />} />
        <Route path="merchants" element={<AdminMerchants />} />
        <Route path="stores" element={<AdminStores />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="customers" element={<AdminCustomers />} />
      </Route>

      <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
