/**
 * My Subscriptions Page
 * Shows user's active subscriptions
 */

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { Calendar, Clock, Pause, CheckCircle } from 'lucide-react'
import { apiService } from '@/services/api'
import { formatAddress, formatTimestamp } from '@/utils/format'
import { formatUnits } from 'ethers'
import './MySubscriptions.css'

export default function MySubscriptions() {
  const { address } = useAccount()
  const [subscriptions, setSubscriptions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!address) return

    const fetchSubscriptions = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await apiService.getSubscriptionsForUser(address || '', { status: 'active' })
        if (response.success && response.data) {
          const data = response.data as any
          setSubscriptions(Array.isArray(data) ? data : data.subscriptions || [])
        }
      } catch (err: any) {
        console.error('Error fetching subscriptions:', err)
        setError(err.message || 'Failed to fetch subscriptions')
      } finally {
        setIsLoading(false)
      }
    }

    fetchSubscriptions()
  }, [address])

  if (!address) {
    return (
      <div className="subscriptions-container">
        <div className="connect-prompt">
          <h2>Connect Your Wallet</h2>
          <p>Please connect your wallet to view your subscriptions.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="subscriptions-container">
      <div className="page-header">
        <h1>
          <Calendar size={28} />
          My Subscriptions
        </h1>
      </div>

      {isLoading && (
        <div className="loading-state">
          <div className="spinner" />
          <p>Loading subscriptions...</p>
        </div>
      )}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {!isLoading && subscriptions.length === 0 && (
        <div className="empty-state">
          <Calendar size={48} />
          <p>No subscriptions yet</p>
          <p className="empty-note">
            You don't have any active subscriptions. Create one from your wallet page.
          </p>
        </div>
      )}

      {!isLoading && subscriptions.length > 0 && (
        <div className="subscriptions-list">
          {subscriptions.map((sub) => (
            <div
              key={sub.id || sub.subscriptionId}
              className={`subscription-card ${sub.status === 'active' ? 'active' : 'paused'}`}
            >
              <div className="subscription-header">
                <div className="subscription-info">
                  <h3>Subscription #{sub.onChainId || sub.id}</h3>
                  <span className={`status-badge ${sub.status === 'active' ? 'active' : 'paused'}`}>
                    {sub.status === 'active' ? (
                      <>
                        <CheckCircle size={14} />
                        Active
                      </>
                    ) : (
                      <>
                        <Pause size={14} />
                        {sub.status || 'Paused'}
                      </>
                    )}
                  </span>
                </div>
              </div>

              <div className="subscription-details">
                <div className="detail-row">
                  <span className="label">Recipient:</span>
                  <span className="value">{formatAddress(sub.recipient)}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Amount:</span>
                  <span className="value amount">
                    {formatUnits(sub.amountPerPeriod || sub.amount || '0', 18)} XTK
                  </span>
                </div>
                <div className="detail-row">
                  <span className="label">Interval:</span>
                  <span className="value">
                    {sub.periodDays ? `${sub.periodDays} days` : 
                     sub.interval ? `${Math.floor(Number(sub.interval) / 86400)} days` : 'N/A'}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="label">Next Payment:</span>
                  <span className="value next-payment">
                    <Clock size={14} />
                    {sub.nextPaymentTime 
                      ? formatTimestamp(Number(sub.nextPaymentTime))
                      : sub.nextBillingDate
                        ? new Date(sub.nextBillingDate).toLocaleString()
                        : 'N/A'}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="label">Progress:</span>
                  <span className="value">
                    {sub.totalPayments > 0
                      ? `${sub.paidCount || 0} / ${sub.totalPayments} payments`
                      : `${sub.paidCount || 0} payments`}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

