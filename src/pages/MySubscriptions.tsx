/**
 * My Subscriptions Page
 * Shows user's active subscriptions
 */

import { useState, useEffect } from 'react'
import { useAccount, useChainId } from 'wagmi'
import { Calendar, Clock, Pause, CheckCircle, ExternalLink } from 'lucide-react'
import { apiService } from '@/services/api'
import { formatAddress, formatTimestamp } from '@/utils/format'
import { formatUnits } from 'ethers'
import { config } from '@/config/wagmi'
import './MySubscriptions.css'

export default function MySubscriptions() {
  const { address } = useAccount()
  const chainId = useChainId()
  const [subscriptions, setSubscriptions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'paused' | 'cancelled'>('all')

  useEffect(() => {
    if (!address) return

    const fetchSubscriptions = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Get all subscriptions, filter by status if needed
        const response = await apiService.getSubscriptionsForUser(
          address || '', 
          statusFilter !== 'all' ? { status: statusFilter } : {}
        )
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
  }, [address, statusFilter])

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

  // Get explorer URL
  const getExplorerUrl = (txHash?: string, onChainId?: string) => {
    if (!txHash && !onChainId) return null
    
    // Get chain from config
    const chain = config.chains.find(c => c.id === chainId) || config.chains[0]
    const explorerUrl = chain?.blockExplorers?.default?.url || 'https://monad-testnet.socialscan.io'
    
    // If we have txHash, link to transaction
    if (txHash) {
      return `${explorerUrl}/tx/${txHash}`
    }
    
    // If we have onChainId, link to the subscription contract
    // Note: This might need adjustment based on your contract structure
    if (onChainId) {
      // For now, we'll try to link to the subscription scheduler contract
      // You might want to add a method to view individual subscriptions
      return `${explorerUrl}/address/0xE119fC309692Fa06f81Fe324b63df6Af32fd394D`
    }
    
    return null
  }

  return (
    <div className="subscriptions-container">
      <div className="page-header">
        <h1>
          <Calendar size={28} />
          My Subscriptions
        </h1>
        <div className="status-filters">
          <button
            className={`filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
            onClick={() => setStatusFilter('all')}
          >
            All
          </button>
          <button
            className={`filter-btn ${statusFilter === 'active' ? 'active' : ''}`}
            onClick={() => setStatusFilter('active')}
          >
            Active
          </button>
          <button
            className={`filter-btn ${statusFilter === 'paused' ? 'active' : ''}`}
            onClick={() => setStatusFilter('paused')}
          >
            Paused
          </button>
          <button
            className={`filter-btn ${statusFilter === 'cancelled' ? 'active' : ''}`}
            onClick={() => setStatusFilter('cancelled')}
          >
            Cancelled
          </button>
        </div>
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
          <p>No subscriptions {statusFilter !== 'all' ? `(${statusFilter})` : ''}</p>
          <p className="empty-note">
            {statusFilter === 'all' 
              ? "You don't have any subscriptions yet. Create one from your wallet page."
              : `You don't have any ${statusFilter} subscriptions.`}
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
                  <div className="header-actions">
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
                    {(sub.txHash || sub.onChainId) && getExplorerUrl(sub.txHash, sub.onChainId) && (
                      <a
                        href={getExplorerUrl(sub.txHash, sub.onChainId) || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="explorer-link"
                        title="View on Explorer"
                      >
                        <ExternalLink size={16} />
                        View on Explorer
                      </a>
                    )}
                  </div>
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
                    {(() => {
                      try {
                        const amount = sub.amountPerPeriod || sub.amount || '0'
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
                    {(() => {
                      if (sub.nextPaymentTime) {
                        const time = Number(sub.nextPaymentTime)
                        if (!isNaN(time) && time > 0) {
                          return formatTimestamp(time)
                        }
                      }
                      if (sub.nextBillingDate) {
                        try {
                          return new Date(sub.nextBillingDate).toLocaleString()
                        } catch {
                          return 'N/A'
                        }
                      }
                      return 'N/A'
                    })()}
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
                {sub.txHash && (
                  <div className="detail-row">
                    <span className="label">Transaction:</span>
                    <span className="value">
                      <a
                        href={getExplorerUrl(sub.txHash) || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="tx-link"
                        title="View transaction on Explorer"
                      >
                        {formatAddress(sub.txHash, 10, 8)}
                        <ExternalLink size={14} />
                      </a>
                    </span>
                  </div>
                )}
                {sub.createdAt && (
                  <div className="detail-row">
                    <span className="label">Created:</span>
                    <span className="value">
                      {new Date(sub.createdAt).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

