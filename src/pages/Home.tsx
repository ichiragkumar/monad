import { Link } from 'react-router-dom'
import { useAccount } from 'wagmi'
import { Send, Gift, Users, Zap } from 'lucide-react'
import './Home.css'

export default function Home() {
  const { isConnected } = useAccount()

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
        {!isConnected && (
          <div className="hero-cta">
            <Link to="/wallet" className="btn btn-primary">
              Get Started
            </Link>
          </div>
        )}
      </section>

      <section className="features">
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
      </section>

      <section className="stats">
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
      </section>
    </div>
  )
}


