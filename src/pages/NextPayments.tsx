/**
 * Next Payments Page
 * Shows upcoming subscription payments
 */

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { CreditCard, Clock, Calendar, CheckCircle } from 'lucide-react'
import { apiService } from '@/services/api'
import { formatAddress, formatTimestamp } from '@/utils/format'
import { formatUnits } from 'ethers'
import './NextPayments.css'

export default function NextPayments() {
  const { address } = useAccount()
  const [payments, setPayments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!address) return

    const fetchNextPayments = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Fetch next payments directly from API
        const response = await apiService.getNextPayments(address || '', { days: 30 })
        if (response.success && response.data) {
          const data = response.data as any
          const payments = Array.isArray(data) ? data : data.payments || []
          setPayments(payments)
        }
      } catch (err: any) {
        console.error('Error fetching next payments:', err)
        setError(err.message || 'Failed to fetch payments')
      } finally {
        setIsLoading(false)
      }
    }

    fetchNextPayments()
    // Refresh every minute
    const interval = setInterval(fetchNextPayments, 60000)
    return () => clearInterval(interval)
  }, [address])

  const isPaymentDue = (nextPaymentTime: number | string | null): boolean => {
    if (!nextPaymentTime) return false
    const time = typeof nextPaymentTime === 'string' 
      ? new Date(nextPaymentTime).getTime() / 1000
      : Number(nextPaymentTime)
    return Date.now() / 1000 >= time
  }

  if (!address) {
    return (
      <div className="payments-container">
        <div className="connect-prompt">
          <h2>Connect Your Wallet</h2>
          <p>Please connect your wallet to view your next payments.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="payments-container">
      <div className="page-header">
        <h1>
          <CreditCard size={28} />
          Next Payments
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
          <CreditCard size={48} />
          <p>No upcoming payments</p>
          <p className="empty-note">
            You don't have any active subscriptions with upcoming payments.
          </p>
        </div>
      )}

      {!isLoading && payments.length > 0 && (
        <div className="payments-list">
          {payments.map((payment, index) => {
            const due = isPaymentDue(payment.nextPaymentTime)
            return (
              <div
                key={payment.subscriptionId || index}
                className={`payment-card ${due ? 'due' : ''}`}
              >
                <div className="payment-header">
                  <div className="payment-info">
                    <h3>Payment #{index + 1}</h3>
                    {due && (
                      <span className="due-badge">
                        <Clock size={14} />
                        Due Now
                      </span>
                    )}
                  </div>
                </div>

                <div className="payment-details">
                  <div className="detail-row">
                    <span className="label">Recipient:</span>
                    <span className="value">{formatAddress(payment.recipient)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Amount:</span>
                    <span className="value amount">
                      {formatUnits(payment.amount || '0', 18)} XTK
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Due Date:</span>
                    <span className={`value ${due ? 'due' : ''}`}>
                      <Calendar size={14} />
                      {payment.nextPaymentTime
                        ? formatTimestamp(Number(payment.nextPaymentTime))
                        : 'N/A'}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Subscription:</span>
                    <span className="value">
                      #{payment.subscriptionId}
                    </span>
                  </div>
                  {payment.totalPayments > 0 && (
                    <div className="detail-row">
                      <span className="label">Progress:</span>
                      <span className="value">
                        {payment.paidCount} / {payment.totalPayments}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

