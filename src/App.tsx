import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { config } from './config/wagmi'
import { ErrorBoundary } from './components/ErrorBoundary'
import Layout from './components/Layout'
import Home from './pages/Home'
import Wallet from './pages/Wallet'
import VendorDashboard from './pages/VendorDashboard'
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
              <Layout>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/wallet" element={<Wallet />} />
                  <Route path="/vendor" element={<VendorDashboard />} />
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

