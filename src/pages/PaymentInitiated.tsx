/**
 * Payment Initiated Page
 * Shows payment links and initiated payments
 */

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { Send, Clock, CheckCircle, X } from 'lucide-react'
import { apiService } from '@/services/api'
import { formatAddress, formatTimestamp } from '@/utils/format'
import { formatUnits } from 'ethers'
import './PaymentInitiated.css'

export default function PaymentInitiated() {
  const { address } = useAccount()
  const [payments, setPayments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!address) return

    const fetchInitiatedPayments = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await apiService.getInitiatedPaymentLinks(address || '')
        if (response.success && response.data) {
          const data = response.data as any
          if (Array.isArray(data)) {
            setPayments(data)
          } else if (data.paymentLinks) {
            setPayments(data.paymentLinks)
          } else if (response.pagination) {
            setPayments(Array.isArray(response.data) ? response.data : [])
          }
        }
      } catch (err: any) {
        console.error('Error fetching initiated payments:', err)
        setError(err.message || 'Failed to fetch payments')
      } finally {
        setIsLoading(false)
      }
    }

    fetchInitiatedPayments()
    // Refresh every 30 seconds
    const interval = setInterval(fetchInitiatedPayments, 30000)
    return () => clearInterval(interval)
  }, [address])

  if (!address) {
    return (
      <div className="payments-container">
        <div className="connect-prompt">
          <h2>Connect Your Wallet</h2>
          <p>Please connect your wallet to view your initiated payments.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="payments-container">
      <div className="page-header">
        <h1>
          <Send size={28} />
          Payment Initiated
        </h1>
      </div>

      {isLoading && (
        <div className="loading-state">
          <div className="spinner" />
          <p>Loading payments...</p>
        </div>
      )}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {!isLoading && payments.length === 0 && (
        <div className="empty-state">
          <Send size={48} />
          <p>No initiated payments</p>
          <p className="empty-note">
            You haven't initiated any payment links yet. Create one to see it here.
          </p>
        </div>
      )}

      {!isLoading && payments.length > 0 && (
        <div className="payments-list">
          {payments.map((payment) => (
            <div
              key={payment.id || payment.linkId}
              className={`payment-card ${payment.status?.toLowerCase()}`}
            >
              <div className="payment-header">
                <div className="payment-info">
                  <h3>Payment Link</h3>
                  <span className={`status-badge ${payment.status?.toLowerCase()}`}>
                    {payment.status === 'executed' || payment.status === 'confirmed' ? (
                      <>
                        <CheckCircle size={14} />
                        {payment.status === 'executed' ? 'Executed' : 'Confirmed'}
                      </>
                    ) : payment.status === 'pending' ? (
                      <>
                        <Clock size={14} />
                        Pending
                      </>
                    ) : payment.status === 'expired' ? (
                      <>
                        <X size={14} />
                        Expired
                      </>
                    ) : (
                      <>
                        <X size={14} />
                        {payment.status || 'Unknown'}
                      </>
                    )}
                  </span>
                </div>
              </div>

              <div className="payment-details">
                {payment.txHash && (
                  <div className="detail-row">
                    <span className="label">Transaction Hash:</span>
                    <span className="value hash">
                      {formatAddress(payment.txHash, 10, 8)}
                    </span>
                  </div>
                )}
                {payment.linkId && (
                  <div className="detail-row">
                    <span className="label">Link ID:</span>
                    <span className="value">
                      {payment.linkId}
                    </span>
                  </div>
                )}
                <div className="detail-row">
                  <span className="label">Total Amount:</span>
                  <span className="value amount">
                    {(() => {
                      try {
                        const amount = payment.totalAmount || '0'
                        if (!amount || amount === 'NaN' || isNaN(Number(amount))) {
                          return '0.0000'
                        }
                        return formatUnits(amount, 18)
                      } catch (error) {
                        return '0.0000'
                      }
                    })()} XTK
                  </span>
                </div>
                <div className="detail-row">
                  <span className="label">Recipients:</span>
                  <span className="value">
                    {payment.recipients?.length || 0}
                  </span>
                </div>
                <div className="detail-row">
                    <span className="label">Initiated:</span>
                    <span className="value">
                      <Clock size={14} />
                      {(() => {
                        if (payment.createdAt) {
                          try {
                            const timestamp = Math.floor(new Date(payment.createdAt).getTime() / 1000)
                            if (!isNaN(timestamp) && timestamp > 0) {
                              return formatTimestamp(timestamp)
                            }
                          } catch {
                            return 'N/A'
                          }
                        }
                        return 'N/A'
                      })()}
                    </span>
                </div>
                {payment.executedAt && (
                  <div className="detail-row">
                    <span className="label">Executed:</span>
                    <span className="value">
                      <CheckCircle size={14} />
                      {(() => {
                        try {
                          const timestamp = Math.floor(new Date(payment.executedAt).getTime() / 1000)
                          if (!isNaN(timestamp) && timestamp > 0) {
                            return formatTimestamp(timestamp)
                          }
                        } catch {
                          return 'N/A'
                        }
                        return 'N/A'
                      })()}
                    </span>
                  </div>
                )}
                {payment.confirmedAt && !payment.executedAt && (
                  <div className="detail-row">
                    <span className="label">Confirmed:</span>
                    <span className="value">
                      <CheckCircle size={14} />
                      {(() => {
                        try {
                          const timestamp = Math.floor(new Date(payment.confirmedAt).getTime() / 1000)
                          if (!isNaN(timestamp) && timestamp > 0) {
                            return formatTimestamp(timestamp)
                          }
                        } catch {
                          return 'N/A'
                        }
                        return 'N/A'
                      })()}
                    </span>
                  </div>
                )}
                {payment.executionCount !== undefined && (
                  <div className="detail-row">
                    <span className="label">Executions:</span>
                    <span className="value">
                      {payment.executionCount}
                    </span>
                  </div>
                )}
              </div>

              {payment.recipients && payment.recipients.length > 0 && (
                <div className="recipients-list">
                  <div className="recipients-header">Recipients:</div>
                  {payment.recipients.map((recipient: any, index: number) => {
                    // Handle both string addresses and objects with address/amount
                    const address = typeof recipient === 'string' ? recipient : recipient.address
                    const amount = typeof recipient === 'string' 
                      ? payment.amounts?.[index] 
                      : recipient.amount
                    return (
                      <div key={index} className="recipient-item">
                        <span className="recipient-address">{formatAddress(address)}</span>
                        {amount && (
                          <span className="recipient-amount">
                            {(() => {
                              try {
                                if (!amount || amount === 'NaN' || isNaN(Number(amount))) {
                                  return '0.0000'
                                }
                                return formatUnits(amount, 18)
                              } catch (error) {
                                return '0.0000'
                              }
                            })()} XTK
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

