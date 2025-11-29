import { Link, useLocation } from 'react-router-dom'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount } from 'wagmi'
import { Wallet } from 'lucide-react'
import ThemeToggle from './ThemeToggle'
import Footer from './Footer'
import './Layout.css'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const { isConnected } = useAccount()

  return (
    <div className="layout">
      <header className="header">
        <div className="header-content">
          <Link to="/" className="logo">
            <Wallet className="logo-icon" />
            <span>MonadPay</span>
          </Link>
          {!isConnected ? (
            <nav className="nav">
              <a
                href="#pricing"
                onClick={(e) => {
                  e.preventDefault()
                  document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })
                }}
              >
                Pricing
              </a>
              <a
                href="#roadmap"
                onClick={(e) => {
                  e.preventDefault()
                  document.getElementById('roadmap')?.scrollIntoView({ behavior: 'smooth' })
                }}
              >
                Roadmap
              </a>
            </nav>
              ) : (
                <nav className="nav">
                  <Link
                    to="/wallet"
                    className={location.pathname === '/wallet' ? 'active' : ''}
                  >
                    Wallet
                  </Link>
                  <Link
                    to="/vendor"
                    className={location.pathname === '/vendor' ? 'active' : ''}
                  >
                    Vendor Dashboard
                  </Link>
                  <Link
                    to="/analytics"
                    className={location.pathname === '/analytics' ? 'active' : ''}
                  >
                    Analytics
                  </Link>
                </nav>
              )}
          <div className="wallet-connect">
            <ThemeToggle />
            <ConnectButton />
          </div>
        </div>
      </header>
      <main className="main-content">{children}</main>
      <Footer />
    </div>
  )
}


