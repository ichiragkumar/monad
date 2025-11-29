import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { config } from './config/wagmi'
import { ErrorBoundary } from './components/ErrorBoundary'
import Layout from './components/Layout'
import ScrollToTop from './components/ScrollToTop'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Wallet from './pages/Wallet'
import VendorDashboard from './pages/VendorDashboard'
import Privacy from './pages/Privacy'
import Terms from './pages/Terms'
import '@rainbow-me/rainbowkit/styles.css'
import './App.css'

const queryClient = new QueryClient()

function App() {
  return (
    <ErrorBoundary>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider>
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
                      <Route path="/privacy" element={<Privacy />} />
                      <Route path="/terms" element={<Terms />} />
                    </Routes>
              </Layout>
            </Router>
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </ErrorBoundary>
  )
}

export default App

