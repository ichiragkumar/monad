import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { config } from './config/wagmi'
import { ErrorBoundary } from './components/ErrorBoundary'
import { AuthProvider } from './contexts/AuthContext'
import Layout from './components/Layout'
import ScrollToTop from './components/ScrollToTop'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Wallet from './pages/Wallet'
import VendorDashboard from './pages/VendorDashboard'
import Privacy from './pages/Privacy'
import Terms from './pages/Terms'
import PaymentLinkHandler from './components/PaymentLinkHandler'
import Analytics from './pages/Analytics'
import MySubscriptions from './pages/MySubscriptions'
import MyEventParticipants from './pages/MyEventParticipants'
import NextPayments from './pages/NextPayments'
import PaymentInitiated from './pages/PaymentInitiated'
import '@rainbow-me/rainbowkit/styles.css'
import './App.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

function App() {
  return (
    <ErrorBoundary>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider
            modalSize="wide"
            showRecentTransactions={true}
            appInfo={{
              appName: 'Monad Micropayments Platform',
              learnMoreUrl: 'https://monad.xyz',
            }}
          >
            <AuthProvider>
              <Router>
                <ScrollToTop />
                <Layout>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route 
                      path="/wallet" 
                      element={
                        <ProtectedRoute>
                          <Wallet />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/vendor" 
                      element={
                        <ProtectedRoute>
                          <VendorDashboard />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/analytics" 
                      element={
                        <ProtectedRoute>
                          <Analytics />
                        </ProtectedRoute>
                      } 
                    />
                    <Route path="/privacy" element={<Privacy />} />
                    <Route path="/terms" element={<Terms />} />
                    <Route path="/approve-payment" element={<PaymentLinkHandler />} />
                    <Route
                      path="/subscriptions"
                      element={
                        <ProtectedRoute>
                          <MySubscriptions />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/my-events"
                      element={
                        <ProtectedRoute>
                          <MyEventParticipants />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/next-payments"
                      element={
                        <ProtectedRoute>
                          <NextPayments />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/payment-initiated"
                      element={
                        <ProtectedRoute>
                          <PaymentInitiated />
                        </ProtectedRoute>
                      }
                    />
                  </Routes>
                </Layout>
              </Router>
            </AuthProvider>
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </ErrorBoundary>
  )
}

export default App

