import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

// Pages — Landing & Auth
import LandingPage    from '@/pages/LandingPage'
import NotFoundPage   from '@/pages/NotFoundPage'
import MerchantLogin from '@/pages/auth/MerchantLogin'
import MerchantRegister from '@/pages/auth/MerchantRegister'
import CustomerLogin from '@/pages/auth/CustomerLogin'
import OnboardingPage from '@/pages/OnboardingPage'
import SubscribePage from '@/pages/subscribe/SubscribePage'

// Dashboard (merchant)
import DashboardLayout from '@/pages/dashboard/DashboardLayout'
import DashboardHome from '@/pages/dashboard/DashboardHome'
import OrdersPage from '@/pages/dashboard/OrdersPage'
import ProductsPage from '@/pages/dashboard/ProductsPage'
import CustomersPage from '@/pages/dashboard/CustomersPage'
import ChatListPage from '@/pages/dashboard/ChatListPage'
import ChatPage from '@/pages/dashboard/ChatPage'
import FinancePage from '@/pages/dashboard/FinancePage'
import SettingsPage from '@/pages/dashboard/SettingsPage'

// Storefront (customer-facing)
import StorefrontLayout from '@/pages/storefront/StorefrontLayout'
import StorePage from '@/pages/storefront/StorePage'
import ProductDetailPage from '@/pages/storefront/ProductDetailPage'
import CheckoutPage from '@/pages/storefront/CheckoutPage'
import OrderConfirmationPage from '@/pages/storefront/OrderConfirmationPage'
import OrderTrackingPage from '@/pages/storefront/OrderTrackingPage'

// Guards
function PrivateRoute({ children }) {
  const token = useAuthStore(s => s.token)
  return token ? children : <Navigate to="/merchant/login" replace />
}

// Redirect logged-in users away from auth pages
function GuestRoute({ children }) {
  const token = useAuthStore(s => s.token)
  return token ? <Navigate to="/dashboard" replace /> : children
}

export default function App() {
  return (
    <Routes>
      {/* ── Public landing ── */}
      <Route path="/" element={<LandingPage />} />

      {/* ── Auth ── */}
      <Route path="/merchant/login"    element={<GuestRoute><MerchantLogin /></GuestRoute>} />
      <Route path="/merchant/register" element={<GuestRoute><MerchantRegister /></GuestRoute>} />
      <Route path="/customer/login"    element={<GuestRoute><CustomerLogin /></GuestRoute>} />
      <Route path="/onboarding"        element={<OnboardingPage />} />
      <Route path="/subscribe"         element={<PrivateRoute><SubscribePage /></PrivateRoute>} />

      {/* ── Merchant Dashboard ── */}
      <Route path="/dashboard" element={
        <PrivateRoute><DashboardLayout /></PrivateRoute>
      }>
        <Route index element={<DashboardHome />} />
        <Route path="orders"    element={<OrdersPage />} />
        <Route path="products"  element={<ProductsPage />} />
        <Route path="customers" element={<CustomersPage />} />
        <Route path="chat"         element={<ChatListPage />} />
        <Route path="chat/:chatId" element={<ChatPage />} />
        <Route path="finance"   element={<FinancePage />} />
        <Route path="settings"  element={<SettingsPage />} />
      </Route>

      {/* ── Customer storefront ── */}
      <Route path="/store/:slug" element={<StorefrontLayout />}>
        <Route index element={<StorePage />} />
        <Route path="product/:productId" element={<ProductDetailPage />} />
        <Route path="checkout" element={<CheckoutPage />} />
        <Route path="order/:orderId" element={<OrderConfirmationPage />} />
        <Route path="order/:orderId/track" element={<OrderTrackingPage />} />
      </Route>

      {/* ── 404 fallback ── */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
