import { Link } from 'react-router-dom'
import { useAccount } from 'wagmi'
import { Send, Gift, Users, Zap, Check, ArrowRight } from 'lucide-react'
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
    <div className="home">
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

      {/* Features Section */}
      <section className="features-section">
        <h2 className="section-title">Why Choose MonadPay?</h2>
        <div className="features">
          <div className="feature-card">
            <div className="feature-icon">
              <Send />
            </div>
            <h3>Peer-to-Peer Payments</h3>
            <p>
              Split bills, tip creators, or send micro-donations instantly. With
              Monad's negligible fees, even $0.50 payments are practical.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <Gift />
            </div>
            <h3>Loyalty Rewards</h3>
            <p>
              Businesses can distribute tokenized loyalty points that customers
              truly own. Transparent, secure, and interoperable.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <Users />
            </div>
            <h3>Event Rewards</h3>
            <p>
              Hackathons, quizzes, and communities can reward participants with
              on-chain tokens. All distributions are verifiable and trustless.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <Zap />
            </div>
            <h3>Lightning Fast</h3>
            <p>
              Monad delivers 10,000 TPS with sub-second finality. Experience
              blockchain payments that feel instant.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <h2 className="section-title">Our Impact</h2>
        <div className="stats">
          <div className="stat">
            <div className="stat-value">10,000+</div>
            <div className="stat-label">Transactions per Second</div>
          </div>
          <div className="stat">
            <div className="stat-value">&lt;1s</div>
            <div className="stat-label">Transaction Finality</div>
          </div>
          <div className="stat">
            <div className="stat-value">~$0.001</div>
            <div className="stat-label">Average Transaction Fee</div>
          </div>
          <div className="stat">
            <div className="stat-value">50K+</div>
            <div className="stat-label">Our Participants</div>
          </div>
          <div className="stat">
            <div className="stat-value">1,200+</div>
            <div className="stat-label">Our Business</div>
          </div>
          <div className="stat">
            <div className="stat-value">25K+</div>
            <div className="stat-label">Individual Supporters</div>
          </div>
          <div className="stat">
            <div className="stat-value">100+</div>
            <div className="stat-label">Hosted Events</div>
          </div>
          <div className="stat">
            <div className="stat-value">500+</div>
            <div className="stat-label">Contributors</div>
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="trusted-section">
        <h2 className="section-title">Trusted & Used By</h2>
        <div className="companies-scroll">
          <div className="companies-track">
            <div className="company-logo">Company A</div>
            <div className="company-logo">Company B</div>
            <div className="company-logo">Company C</div>
            <div className="company-logo">Company D</div>
            <div className="company-logo">Company E</div>
            <div className="company-logo">Company F</div>
            <div className="company-logo">Company G</div>
            <div className="company-logo">Company H</div>
            {/* Duplicate for seamless loop */}
            <div className="company-logo">Company A</div>
            <div className="company-logo">Company B</div>
            <div className="company-logo">Company C</div>
            <div className="company-logo">Company D</div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="pricing-section">
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
      <section className="roadmap-section">
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
