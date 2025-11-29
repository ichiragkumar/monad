import { FileText, Scale, AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react'
import './Terms.css'

export default function Terms() {
  return (
    <div className="terms-page">
      <section className="terms-hero">
        <div className="hero-icon">
          <FileText size={48} />
        </div>
        <h1 className="hero-title">Terms & Conditions</h1>
        <p className="hero-subtitle">
          Please read these terms carefully before using MonadPay. By using our platform, you agree to be bound by these terms.
        </p>
      </section>

      <div className="terms-content">
        <section className="terms-section">
          <div className="section-header">
            <Scale className="section-icon" />
            <h2>Acceptance of Terms</h2>
          </div>
          <div className="section-content">
            <p>
              By accessing and using MonadPay, you accept and agree to be bound by the terms and provision of this agreement. 
              If you do not agree to these terms, you should not use our services.
            </p>
            <p>
              These Terms & Conditions apply to all users of the platform, including individuals, businesses, and organizations.
            </p>
          </div>
        </section>

        <section className="terms-section">
          <div className="section-header">
            <CheckCircle className="section-icon" />
            <h2>Use of Service</h2>
          </div>
          <div className="section-content">
            <p><strong>You agree to:</strong></p>
            <ul>
              <li>Use MonadPay only for lawful purposes and in accordance with these Terms</li>
              <li>Maintain the security of your wallet and private keys</li>
              <li>Provide accurate information when using our services</li>
              <li>Comply with all applicable laws and regulations</li>
              <li>Not use the service for any illegal or unauthorized purpose</li>
              <li>Not attempt to gain unauthorized access to any part of the platform</li>
              <li>Not interfere with or disrupt the service or servers</li>
            </ul>
          </div>
        </section>

        <section className="terms-section">
          <div className="section-header">
            <AlertTriangle className="section-icon" />
            <h2>Prohibited Activities</h2>
          </div>
          <div className="section-content">
            <p>The following activities are strictly prohibited:</p>
            <ul>
              <li>Money laundering or financing of illegal activities</li>
              <li>Fraud, theft, or any form of financial crime</li>
              <li>Violation of any applicable laws or regulations</li>
              <li>Attempting to hack, disrupt, or compromise the platform</li>
              <li>Impersonating any person or entity</li>
              <li>Collecting user information without consent</li>
              <li>Using automated systems to access the service without permission</li>
            </ul>
          </div>
        </section>

        <section className="terms-section">
          <div className="section-header">
            <XCircle className="section-icon" />
            <h2>Limitation of Liability</h2>
          </div>
          <div className="section-content">
            <p>
              <strong>Non-Custodial Service:</strong> MonadPay is a non-custodial platform. We do not hold, store, or have access to your funds or private keys. 
              You are solely responsible for the security of your wallet and private keys.
            </p>
            <p>
              <strong>No Warranty:</strong> The service is provided "as is" without warranties of any kind, either express or implied. 
              We do not guarantee that the service will be uninterrupted, secure, or error-free.
            </p>
            <p>
              <strong>Blockchain Risks:</strong> You acknowledge that blockchain transactions are irreversible and that you are responsible for verifying 
              all transaction details before confirming. We are not liable for any losses resulting from:
            </p>
            <ul>
              <li>Loss of private keys or seed phrases</li>
              <li>Incorrect transaction addresses</li>
              <li>Smart contract vulnerabilities</li>
              <li>Network congestion or failures</li>
              <li>Regulatory changes affecting blockchain technology</li>
            </ul>
          </div>
        </section>

        <section className="terms-section">
          <div className="section-header">
            <Info className="section-icon" />
            <h2>Intellectual Property</h2>
          </div>
          <div className="section-content">
            <p>
              All content, features, and functionality of MonadPay, including but not limited to text, graphics, logos, and software, 
              are the property of MonadPay and are protected by international copyright, trademark, and other intellectual property laws.
            </p>
            <p>
              You may not reproduce, distribute, modify, or create derivative works from any part of the platform without our express written permission.
            </p>
          </div>
        </section>

        <section className="terms-section">
          <div className="section-header">
            <Scale className="section-icon" />
            <h2>Modifications to Terms</h2>
          </div>
          <div className="section-content">
            <p>
              We reserve the right to modify these Terms & Conditions at any time. We will notify users of any material changes 
              through our platform or via email. Your continued use of MonadPay after such modifications constitutes acceptance of the updated terms.
            </p>
            <p>
              It is your responsibility to review these terms periodically for changes.
            </p>
          </div>
        </section>

        <section className="terms-section">
          <div className="section-header">
            <FileText className="section-icon" />
            <h2>Governing Law</h2>
          </div>
          <div className="section-content">
            <p>
              These Terms & Conditions shall be governed by and construed in accordance with applicable laws, without regard to conflict of law provisions.
            </p>
            <p>
              Any disputes arising from these terms or your use of MonadPay shall be resolved through appropriate legal channels.
            </p>
          </div>
        </section>

        <section className="terms-section">
          <div className="section-header">
            <CheckCircle className="section-icon" />
            <h2>Contact Information</h2>
          </div>
          <div className="section-content">
            <p>
              If you have any questions about these Terms & Conditions, please contact us:
            </p>
            <p>
              <strong>Email:</strong> <a href="mailto:legal@monadpay.io">legal@monadpay.io</a>
            </p>
            <p className="last-updated">
              <strong>Last Updated:</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}

