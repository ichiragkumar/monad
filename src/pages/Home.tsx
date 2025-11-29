import { Link } from 'react-router-dom'
import { useAccount } from 'wagmi'
import { Check, ArrowRight } from 'lucide-react'
import './Home.css'

export default function Home() {
  const { isConnected } = useAccount()

  // Show full landing page when wallet is not connected
  if (isConnected) {
    return (
      <div className="home">
        <section className="hero">
          <h1 className="hero-title">
            Micropayments & Loyalty Rewards
            <br />
            <span className="gradient-text">Powered by Monad</span>
          </h1>
          <p className="hero-subtitle">
            Send instant, low-cost payments and earn tokenized rewards on the
            world's fastest EVM blockchain. Transactions cost pennies and confirm
            in under a second.
          </p>
          <div className="hero-cta">
            <Link to="/wallet" className="btn btn-primary">
              Go to Wallet
            </Link>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="home landing-page">
      {/* Hero Section */}
      <section className="hero">
        <h1 className="hero-title">
          Micropayments & Loyalty Rewards
          <br />
          <span className="gradient-text">Powered by Monad</span>
        </h1>
        <p className="hero-subtitle">
          Send instant, low-cost payments and earn tokenized rewards on the
          world's fastest EVM blockchain. Transactions cost pennies and confirm
          in under a second.
        </p>
        <div className="hero-cta">
          <Link to="/wallet" className="btn btn-primary">
            Get Started
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="pricing-section">
        <h2 className="section-title">Simple, Transparent Pricing</h2>
        <div className="pricing-cards">
          <div className="pricing-card">
            <h3>Free</h3>
            <div className="pricing-amount">
              <span className="price">$0</span>
              <span className="period">/month</span>
            </div>
            <ul className="pricing-features">
              <li><Check size={16} /> Basic wallet features</li>
              <li><Check size={16} /> Send & receive tokens</li>
              <li><Check size={16} /> Transaction history</li>
              <li><Check size={16} /> Community support</li>
            </ul>
            <Link to="/wallet" className="btn btn-secondary">Get Started</Link>
          </div>

          <div className="pricing-card featured">
            <div className="featured-badge">Most Popular</div>
            <h3>Business</h3>
            <div className="pricing-amount">
              <span className="price">$99</span>
              <span className="period">/month</span>
            </div>
            <ul className="pricing-features">
              <li><Check size={16} /> Everything in Free</li>
              <li><Check size={16} /> Loyalty program management</li>
              <li><Check size={16} /> Event rewards distribution</li>
              <li><Check size={16} /> Advanced analytics</li>
              <li><Check size={16} /> Priority support</li>
            </ul>
            <Link to="/wallet" className="btn btn-primary">Start Free Trial</Link>
          </div>

          <div className="pricing-card">
            <h3>Enterprise</h3>
            <div className="pricing-amount">
              <span className="price">Custom</span>
            </div>
            <ul className="pricing-features">
              <li><Check size={16} /> Everything in Business</li>
              <li><Check size={16} /> Custom integrations</li>
              <li><Check size={16} /> Dedicated support</li>
              <li><Check size={16} /> SLA guarantees</li>
              <li><Check size={16} /> White-label options</li>
            </ul>
            <Link to="/wallet" className="btn btn-secondary">Contact Sales</Link>
          </div>
        </div>
      </section>

      {/* Roadmap Section */}
      <section id="roadmap" className="roadmap-section">
        <h2 className="section-title">Our Roadmap</h2>
        <div className="roadmap">
          <div className="roadmap-item completed">
            <div className="roadmap-marker"></div>
            <div className="roadmap-content">
              <div className="roadmap-date">Q1 2024</div>
              <h3>Platform Launch</h3>
              <p>Initial release with core wallet and payment features</p>
            </div>
          </div>

          <div className="roadmap-item completed">
            <div className="roadmap-marker"></div>
            <div className="roadmap-content">
              <div className="roadmap-date">Q2 2024</div>
              <h3>Loyalty Programs</h3>
              <p>Business dashboard and token distribution tools</p>
            </div>
          </div>

          <div className="roadmap-item active">
            <div className="roadmap-marker"></div>
            <div className="roadmap-content">
              <div className="roadmap-date">Q3 2024</div>
              <h3>ENS Integration</h3>
              <p>Human-readable addresses and subdomain support</p>
            </div>
          </div>

          <div className="roadmap-item">
            <div className="roadmap-marker"></div>
            <div className="roadmap-content">
              <div className="roadmap-date">Q4 2024</div>
              <h3>Mobile App</h3>
              <p>Native iOS and Android applications</p>
            </div>
          </div>

          <div className="roadmap-item">
            <div className="roadmap-marker"></div>
            <div className="roadmap-content">
              <div className="roadmap-date">Q1 2025</div>
              <h3>Multi-Chain Support</h3>
              <p>Expand to additional blockchain networks</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
