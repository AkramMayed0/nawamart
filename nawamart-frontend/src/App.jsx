import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useAdminStore } from '@/store/adminStore'

import LandingPage from '@/pages/LandingPage'
import NotFoundPage from '@/pages/NotFoundPage'
import MerchantLogin from '@/pages/auth/MerchantLogin'
import MerchantRegister from '@/pages/auth/MerchantRegister'
import CustomerLogin from '@/pages/auth/CustomerLogin'
import CustomerRegister from '@/pages/auth/CustomerRegister'
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
import ReportsPage from '@/pages/dashboard/ReportsPage'
import SettingsPage from '@/pages/dashboard/SettingsPage'
import ProfilePage from '@/pages/dashboard/ProfilePage'

import StorefrontLayout from '@/pages/storefront/StorefrontLayout'
import StorePage from '@/pages/storefront/StorePage'
import ProductDetailPage from '@/pages/storefront/ProductDetailPage'
import CartPage from '@/pages/storefront/CartPage'
import CheckoutPage from '@/pages/storefront/CheckoutPage'
import OrderConfirmationPage from '@/pages/storefront/OrderConfirmationPage'
import OrderTrackingPage from '@/pages/storefront/OrderTrackingPage'

function dashboardForRole(role) {
  return role === 'merchant' ? '/dashboard' : '/'
}

function PrivateRoute({ children, role = 'merchant' }) {
  const token = useAuthStore((state) => state.token)
  const user = useAuthStore((state) => state.user)

  if (!token) return <Navigate to="/merchant/login" replace />

  const activeRole = user?.role
  if (role && activeRole !== role) {
    return <Navigate to={dashboardForRole(activeRole)} replace />
  }

  return children
}

function GuestRoute({ children }) {
  const token = useAuthStore((state) => state.token)
  const user = useAuthStore((state) => state.user)

  if (token) {
    return <Navigate to={dashboardForRole(user?.role)} replace />
  }

  return children
}

function AdminRoute({ children }) {
  const token = useAdminStore((state) => state.token)

  if (!token) return <Navigate to="/admin/login" replace />

  return children
}

function AdminGuestRoute({ children }) {
  const token = useAdminStore((state) => state.token)

  if (token) return <Navigate to="/admin/dashboard" replace />

  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

      <Route path="/merchant/login" element={<GuestRoute><MerchantLogin /></GuestRoute>} />
      <Route path="/merchant/register" element={<GuestRoute><MerchantRegister /></GuestRoute>} />
      <Route path="/customer/login" element={<GuestRoute><CustomerLogin /></GuestRoute>} />
      <Route path="/customer/register" element={<GuestRoute><CustomerRegister /></GuestRoute>} />
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
        <Route path="reports" element={<ReportsPage />} />
        <Route path="profile" element={<ProfilePage />} />
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
