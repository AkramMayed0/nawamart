import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

// Pages — Landing & Auth
import LandingPage from '@/pages/LandingPage'
import MerchantLogin from '@/pages/auth/MerchantLogin'
import MerchantRegister from '@/pages/auth/MerchantRegister'
import CustomerLogin from '@/pages/auth/CustomerLogin'
import OnboardingPage from '@/pages/OnboardingPage'

// Dashboard (merchant)
import DashboardLayout from '@/pages/dashboard/DashboardLayout'
import DashboardHome from '@/pages/dashboard/DashboardHome'
import OrdersPage from '@/pages/dashboard/OrdersPage'
import ProductsPage from '@/pages/dashboard/ProductsPage'
import CustomersPage from '@/pages/dashboard/CustomersPage'
import ChatPage from '@/pages/dashboard/ChatPage'
import FinancePage from '@/pages/dashboard/FinancePage'
import SettingsPage from '@/pages/dashboard/SettingsPage'

// Storefront (customer-facing)
import StorefrontLayout from '@/pages/storefront/StorefrontLayout'
import StorePage from '@/pages/storefront/StorePage'
import ProductDetailPage from '@/pages/storefront/ProductDetailPage'
import CheckoutPage from '@/pages/storefront/CheckoutPage'
import OrderTrackingPage from '@/pages/storefront/OrderTrackingPage'

// Guards
function PrivateRoute({ children }) {
  const token = useAuthStore(s => s.token)
  return token ? children : <Navigate to="/merchant/login" replace />
}

export default function App() {
  return (
    <Routes>
      {/* ── Public landing ── */}
      <Route path="/" element={<LandingPage />} />

      {/* ── Auth ── */}
      <Route path="/merchant/login"    element={<MerchantLogin />} />
      <Route path="/merchant/register" element={<MerchantRegister />} />
      <Route path="/customer/login"    element={<CustomerLogin />} />
      <Route path="/onboarding"        element={<OnboardingPage />} />

      {/* ── Merchant Dashboard ── */}
      <Route path="/dashboard" element={
        <PrivateRoute><DashboardLayout /></PrivateRoute>
      }>
        <Route index element={<DashboardHome />} />
        <Route path="orders"    element={<OrdersPage />} />
        <Route path="products"  element={<ProductsPage />} />
        <Route path="customers" element={<CustomersPage />} />
        <Route path="chat"      element={<ChatPage />} />
        <Route path="finance"   element={<FinancePage />} />
        <Route path="settings"  element={<SettingsPage />} />
      </Route>

      {/* ── Customer storefront ── */}
      <Route path="/store/:slug" element={<StorefrontLayout />}>
        <Route index element={<StorePage />} />
        <Route path="product/:productId" element={<ProductDetailPage />} />
        <Route path="checkout" element={<CheckoutPage />} />
        <Route path="order/:orderId" element={<OrderTrackingPage />} />
      </Route>

      {/* ── 404 fallback ── */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
