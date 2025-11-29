import { Link } from 'react-router-dom'
import { Mail, Info, Shield, FileText } from 'lucide-react'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>About Us</h3>
          <p>
          PayMint is a cutting-edge micropayments and loyalty rewards platform
            built on Monad blockchain. We enable instant, low-cost transactions
            and tokenized rewards for businesses and individuals.
          </p>
        </div>

        <div className="footer-section">
          <h3>Quick Links</h3>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/wallet">Wallet</Link></li>
            <li><Link to="/vendor">Vendor Dashboard</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Legal</h3>
          <ul>
            <li>
              <Link to="/privacy">
                <Shield size={16} />
                Privacy & Security
              </Link>
            </li>
            <li>
              <Link to="/terms">
                <FileText size={16} />
                Terms & Conditions
              </Link>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Contact Us</h3>
          <ul>
            <li>
              <a href="mailto:support@PayMint.io">
                <Mail size={16} />
                support@PayMint.io
              </a>
            </li>
            <li>
              <Link to="/about">
                <Info size={16} />
                Learn More
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2024 PayMint. All rights reserved. Built on Monad Blockchain.</p>
      </div>
    </footer>
  )
}

