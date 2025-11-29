import { Shield, Lock, Eye, FileCheck, Server, Key } from 'lucide-react'
import './Privacy.css'

export default function Privacy() {
  return (
    <div className="privacy-page">
      <section className="privacy-hero">
        <div className="hero-icon">
          <Shield size={48} />
        </div>
        <h1 className="hero-title">Privacy & Security</h1>
        <p className="hero-subtitle">
          Your privacy and security are our top priorities. Learn how we protect your data and ensure your transactions are secure.
        </p>
      </section>

      <div className="privacy-content">
        <section className="privacy-section">
          <div className="section-header">
            <Lock className="section-icon" />
            <h2>Data Protection</h2>
          </div>
          <div className="section-content">
            <p>
              MonadPay is built on the principle of user sovereignty. We implement industry-leading security measures to protect your personal information and transaction data.
            </p>
            <ul>
              <li><strong>Non-Custodial Wallets:</strong> You maintain full control of your private keys and funds. We never have access to your wallet or tokens.</li>
              <li><strong>Encrypted Communications:</strong> All data transmitted between your device and our services is encrypted using TLS 1.3.</li>
              <li><strong>Minimal Data Collection:</strong> We only collect essential information necessary to provide our services.</li>
              <li><strong>No Personal Data Storage:</strong> Wallet addresses and transaction data are stored on the blockchain, not on our servers.</li>
            </ul>
          </div>
        </section>

        <section className="privacy-section">
          <div className="section-header">
            <Eye className="section-icon" />
            <h2>What We Collect</h2>
          </div>
          <div className="section-content">
            <p>We collect minimal information to provide and improve our services:</p>
            <ul>
              <li><strong>Wallet Address:</strong> Public blockchain addresses for transaction processing</li>
              <li><strong>Transaction Data:</strong> Public on-chain transaction information</li>
              <li><strong>Usage Analytics:</strong> Aggregated, anonymized usage statistics</li>
              <li><strong>Device Information:</strong> Browser type and version for compatibility</li>
            </ul>
            <p className="note">
              <strong>We do NOT collect:</strong> Private keys, seed phrases, personal identification information, or any data that can identify you personally.
            </p>
          </div>
        </section>

        <section className="privacy-section">
          <div className="section-header">
            <Server className="section-icon" />
            <h2>Blockchain Security</h2>
          </div>
          <div className="section-content">
            <p>
              MonadPay leverages the security of the Monad blockchain, which provides:
            </p>
            <ul>
              <li><strong>Immutable Records:</strong> All transactions are permanently recorded on-chain</li>
              <li><strong>Cryptographic Security:</strong> Transactions are secured using advanced cryptographic algorithms</li>
              <li><strong>Decentralized Architecture:</strong> No single point of failure</li>
              <li><strong>Transparent Verification:</strong> All transactions are publicly verifiable</li>
            </ul>
          </div>
        </section>

        <section className="privacy-section">
          <div className="section-header">
            <Key className="section-icon" />
            <h2>Your Responsibilities</h2>
          </div>
          <div className="section-content">
            <p>To maintain the highest level of security:</p>
            <ul>
              <li>Never share your private keys or seed phrases with anyone</li>
              <li>Use hardware wallets for large amounts</li>
              <li>Verify transaction details before confirming</li>
              <li>Keep your wallet software updated</li>
              <li>Be cautious of phishing attempts</li>
            </ul>
          </div>
        </section>

        <section className="privacy-section">
          <div className="section-header">
            <FileCheck className="section-icon" />
            <h2>Third-Party Services</h2>
          </div>
          <div className="section-content">
            <p>
              MonadPay integrates with third-party services for wallet connections (MetaMask, WalletConnect). 
              These services have their own privacy policies. We recommend reviewing their privacy practices.
            </p>
            <p>
              We do not share your data with third parties except as necessary to provide our services or as required by law.
            </p>
          </div>
        </section>

        <section className="privacy-section">
          <div className="section-header">
            <Shield className="section-icon" />
            <h2>Updates to This Policy</h2>
          </div>
          <div className="section-content">
            <p>
              We may update this Privacy & Security policy from time to time. We will notify users of any material changes 
              through our platform or via email. Your continued use of MonadPay after such changes constitutes acceptance of the updated policy.
            </p>
            <p className="last-updated">
              <strong>Last Updated:</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </section>

        <section className="privacy-section">
          <div className="section-header">
            <Lock className="section-icon" />
            <h2>Contact Us</h2>
          </div>
          <div className="section-content">
            <p>
              If you have questions about our Privacy & Security practices, please contact us:
            </p>
            <p>
              <strong>Email:</strong> <a href="mailto:privacy@monadpay.io">privacy@monadpay.io</a>
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}

