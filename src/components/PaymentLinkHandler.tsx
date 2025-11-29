/**
 * PaymentLinkHandler Component
 * Handles parsing and approving payment links
 */

import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useAccount, useBalance } from 'wagmi'
import { formatUnits } from 'ethers'
import { X, CheckCircle, AlertCircle, Send, Clock } from 'lucide-react'
import { decodePaymentLink, PaymentLinkData } from '@/utils/eip712'
import { usePaymentLink } from '@/hooks/usePaymentLink'
import { TOKEN_CONTRACT_ADDRESS } from '@/config/wagmi'
import { formatAddress } from '@/utils/format'
import './PaymentLinkHandler.css'

export default function PaymentLinkHandler() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { address, isConnected } = useAccount()
  const [paymentData, setPaymentData] = useState<PaymentLinkData | null>(null)
  const [error, setError] = useState<string | null>(null)

  const { data: tokenBalance } = useBalance({
    address,
    token: TOKEN_CONTRACT_ADDRESS,
  })

  const {
    executePaymentLink,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error: executionError,
  } = usePaymentLink()

  useEffect(() => {
    if (!isConnected) {
      setError('Please connect your wallet first')
      return
    }

    const data = decodePaymentLink(searchParams)
    if (!data) {
      setError('Invalid payment link format')
      return
    }

    // Validate sender matches connected wallet
    if (data.sender.toLowerCase() !== address?.toLowerCase()) {
      setError('Payment link is for a different wallet address')
      return
    }

    // Check expiry
    if (Date.now() / 1000 > data.expiry) {
      setError('This payment link has expired')
      return
    }

    setPaymentData(data)
  }, [searchParams, isConnected, address])

  const handleApprove = async () => {
    if (!paymentData) return

    try {
      await executePaymentLink(paymentData)
    } catch (err: any) {
      setError(err.message || 'Failed to execute payment link')
    }
  }

  const totalAmount = paymentData
    ? paymentData.amounts.reduce((sum, amt) => sum + parseFloat(amt), 0)
    : 0

  const hasEnoughBalance =
    tokenBalance && totalAmount > 0
      ? parseFloat(formatUnits(tokenBalance.value, tokenBalance.decimals)) >=
        totalAmount
      : false

  if (!isConnected) {
    return (
      <div className="payment-link-container">
        <div className="payment-link-card">
          <AlertCircle className="icon-error" />
          <h2>Wallet Not Connected</h2>
          <p>Please connect your wallet to view this payment link.</p>
        </div>
      </div>
    )
  }

  if (error || executionError) {
    return (
      <div className="payment-link-container">
        <div className="payment-link-card error">
          <AlertCircle className="icon-error" />
          <h2>Payment Link Error</h2>
          <p>{error || executionError?.message || 'Unknown error'}</p>
          <button className="btn btn-secondary" onClick={() => navigate('/')}>
            Go Home
          </button>
        </div>
      </div>
    )
  }

  if (!paymentData) {
    return (
      <div className="payment-link-container">
        <div className="payment-link-card">
          <div className="spinner" />
          <p>Loading payment link...</p>
        </div>
      </div>
    )
  }

  const expiryDate = new Date(paymentData.expiry * 1000)
  const isExpired = Date.now() / 1000 > paymentData.expiry

  return (
    <div className="payment-link-container">
      <div className="payment-link-card">
        <div className="payment-link-header">
          <h2>
            <Send size={24} />
            Payment Link Approval
          </h2>
          <button
            className="close-button"
            onClick={() => navigate('/')}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="payment-link-content">
          <div className="payment-summary">
            <div className="summary-item">
              <span className="label">Total Recipients:</span>
              <span className="value">{paymentData.recipients.length}</span>
            </div>
            <div className="summary-item">
              <span className="label">Total Amount:</span>
              <span className="value amount">
                {totalAmount.toFixed(4)} XTK
              </span>
            </div>
            <div className="summary-item">
              <span className="label">Expires:</span>
              <span className={`value ${isExpired ? 'expired' : ''}`}>
                <Clock size={14} />
                {expiryDate.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="recipients-list">
            <h3>Recipients ({paymentData.recipients.length})</h3>
            <div className="recipients-scroll">
              {paymentData.recipients.map((recipient, index) => (
                <div key={index} className="recipient-item">
                  <div className="recipient-info">
                    <span className="recipient-address">
                      {formatAddress(recipient)}
                    </span>
                    <span className="recipient-amount">
                      {parseFloat(paymentData.amounts[index]).toFixed(4)} XTK
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {tokenBalance && (
            <div className="balance-check">
              <p>
                Your Balance: <strong>{formatUnits(tokenBalance.value, tokenBalance.decimals)}</strong> XTK
              </p>
              {!hasEnoughBalance && (
                <div className="balance-warning">
                  <AlertCircle size={16} />
                  <span>Insufficient balance for this payment</span>
                </div>
              )}
            </div>
          )}

          {isSuccess && (
            <div className="success-message">
              <CheckCircle size={16} />
              <span>Payment executed successfully!</span>
            </div>
          )}
        </div>

        <div className="payment-link-actions">
          <button
            className="btn btn-secondary"
            onClick={() => navigate('/')}
            disabled={isPending || isConfirming}
          >
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleApprove}
            disabled={
              isPending ||
              isConfirming ||
              !hasEnoughBalance ||
              isExpired ||
              isSuccess
            }
          >
            {isPending || isConfirming
              ? 'Processing...'
              : isSuccess
                ? 'Approved!'
                : 'Approve & Execute Payment'}
          </button>
        </div>

        {hash && (
          <div className="tx-link-container">
            <a
              href={`#`} // Update with explorer URL
              target="_blank"
              rel="noopener noreferrer"
              className="tx-link"
            >
              View transaction on explorer
            </a>
          </div>
        )}
      </div>
    </div>
  )
}

