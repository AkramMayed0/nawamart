import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import ErrorBoundary from '@/components/ui/ErrorBoundary'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 2, // 2 min
    },
  },
})

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''
const GoogleProvider = googleClientId
  ? ({ children }) => <GoogleOAuthProvider clientId={googleClientId}>{children}</GoogleOAuthProvider>
  : ({ children }) => <>{children}</>

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
    <GoogleProvider>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              fontFamily: 'var(--font-ar)',
              direction: 'rtl',
              fontSize: '14px',
              borderRadius: '10px',
              background: '#1A1A2E',
              color: '#fff',
              padding: '12px 16px',
              maxWidth: '380px',
            },
            success: {
              iconTheme: { primary: '#27AE60', secondary: '#fff' },
              style: { background: '#1B4332', color: '#fff' },
            },
            error: {
              iconTheme: { primary: '#E74C3C', secondary: '#fff' },
              style: { background: '#7F1D1D', color: '#fff' },
            },
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
    </GoogleProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)
