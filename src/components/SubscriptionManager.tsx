/**
 * SubscriptionManager Component
 * Manages recurring and delayed payments
 */

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { formatUnits } from 'ethers'
import { Calendar, Clock, Play, Pause, X, Plus, CheckCircle } from 'lucide-react'
import { useSubscriptions, Subscription } from '@/hooks/useSubscriptions'
import { formatAddress, formatTimestamp } from '@/utils/format'
import './SubscriptionManager.css'


interface CreateSubscriptionForm {
  recipient: string
  amount: string
  interval: string // in days
  totalPayments: string // 0 for unlimited
  startTime: string // 0 for immediate
}

export default function SubscriptionManager() {
  const { address } = useAccount()
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState<CreateSubscriptionForm>({
    recipient: '',
    amount: '',
    interval: '30', // 30 days default
    totalPayments: '0', // unlimited
    startTime: '0', // immediate
  })

  const {
    subscriptionIds,
    refetchSubscriptionIds,
    createSubscription,
    executePayment,
    cancelSubscription,
    pauseSubscription,
    resumeSubscription,
    isPending,
    isConfirming,
    isSuccess,
    error,
  } = useSubscriptions()

  // Fetch subscription details - we'll fetch them individually but store in state
  const [subscriptions, setSubscriptions] = useState<(Subscription & { id: number })[]>([])

  // Fetch all subscription details when IDs change
  useEffect(() => {
    if (!subscriptionIds || subscriptionIds.length === 0) {
      setSubscriptions([])
      return
    }

    const fetchSubscriptions = async () => {
      // In a real implementation, you'd batch these calls or use a multicall
      // For now, we'll just show the IDs and let users click to see details
      // This is a simplified version - in production, use a multicall hook
      setSubscriptions([])
    }

    fetchSubscriptions()
  }, [subscriptionIds])

  useEffect(() => {
    if (isSuccess) {
      refetchSubscriptionIds()
      setShowCreateForm(false)
      setFormData({
        recipient: '',
        amount: '',
        interval: '30',
        totalPayments: '0',
        startTime: '0',
      })
    }
  }, [isSuccess, refetchSubscriptionIds])

  const handleCreate = async () => {
    if (!formData.recipient || !formData.amount || !formData.interval) {
      alert('Please fill in all required fields')
      return
    }

    // Validate and parse interval (must be positive)
    const intervalDays = parseInt(formData.interval)
    if (isNaN(intervalDays) || intervalDays <= 0) {
      alert('Interval must be a positive number of days')
      return
    }
    const intervalSeconds = intervalDays * 24 * 60 * 60

    // Validate and parse totalPayments (must be non-negative, 0 for unlimited)
    const totalPayments = parseInt(formData.totalPayments) || 0
    if (isNaN(totalPayments) || totalPayments < 0) {
      alert('Total payments must be 0 (unlimited) or a positive number')
      return
    }

    // Validate and parse startTime (must be non-negative, 0 for immediate)
    let startTime = 0
    if (formData.startTime !== '0') {
      const parsedTime = Math.floor(new Date(formData.startTime).getTime() / 1000)
      if (isNaN(parsedTime) || parsedTime < 0) {
        alert('Invalid start date. Please select a valid future date or leave empty for immediate start.')
        return
      }
      // Allow past dates (might be useful for testing), but ensure it's a valid timestamp
      startTime = parsedTime
    }

    // Validate amount (must be positive)
    const amountNum = parseFloat(formData.amount)
    if (isNaN(amountNum) || amountNum <= 0) {
      alert('Amount must be a positive number')
      return
    }

    // Validate recipient address
    if (!formData.recipient.startsWith('0x') || formData.recipient.length !== 42) {
      alert('Please enter a valid Ethereum address')
      return
    }

    try {
      await createSubscription(
        formData.recipient,
        formData.amount,
        intervalSeconds,
        totalPayments,
        startTime
      )
    } catch (err: any) {
      console.error('Error creating subscription:', err)
      alert(err.message || 'Failed to create subscription')
    }
  }

  const formatInterval = (seconds: bigint): string => {
    const days = Number(seconds) / (24 * 60 * 60)
    if (days >= 30) {
      const months = Math.floor(days / 30)
      return `${months} month${months > 1 ? 's' : ''}`
    }
    return `${Math.floor(days)} day${days > 1 ? 's' : ''}`
  }

  const isPaymentDue = (nextPaymentTime: bigint): boolean => {
    return Date.now() / 1000 >= Number(nextPaymentTime)
  }

  if (!address) {
    return (
      <div className="subscription-manager">
        <div className="connect-prompt">
          <p>Please connect your wallet to manage subscriptions.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="subscription-manager">
      <div className="subscription-header">
        <h2>
          <Calendar size={24} />
          Subscription Manager
        </h2>
        <button
          className="btn btn-primary"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          <Plus size={16} />
          Create Subscription
        </button>
      </div>

      {showCreateForm && (
        <div className="create-subscription-form">
          <h3>Create New Subscription</h3>
          <div className="form-group">
            <label>Recipient Address</label>
            <input
              type="text"
              value={formData.recipient}
              onChange={(e) =>
                setFormData({ ...formData, recipient: e.target.value })
              }
              placeholder="0x..."
              className="input"
            />
          </div>
          <div className="form-group">
            <label>Amount per Payment (XTK)</label>
            <input
              type="number"
              min="0"
              step="0.0001"
              value={formData.amount}
              onChange={(e) => {
                const value = e.target.value
                // Only allow positive numbers
                if (value === '' || (parseFloat(value) >= 0)) {
                  setFormData({ ...formData, amount: value })
                }
              }}
              placeholder="0.0"
              className="input"
            />
          </div>
          <div className="form-group">
            <label>Interval (days)</label>
            <input
              type="number"
              min="1"
              step="1"
              value={formData.interval}
              onChange={(e) => {
                const value = e.target.value
                // Only allow positive integers
                if (value === '' || (parseInt(value) > 0)) {
                  setFormData({ ...formData, interval: value })
                }
              }}
              placeholder="30"
              className="input"
            />
          </div>
          <div className="form-group">
            <label>Total Payments (0 for unlimited)</label>
            <input
              type="number"
              min="0"
              step="1"
              value={formData.totalPayments}
              onChange={(e) => {
                const value = e.target.value
                // Only allow non-negative integers
                if (value === '' || (parseInt(value) >= 0)) {
                  setFormData({ ...formData, totalPayments: value })
                }
              }}
              placeholder="0"
              className="input"
            />
          </div>
          <div className="form-group">
            <label>Start Date (leave empty for immediate)</label>
            <input
              type="datetime-local"
              value={formData.startTime === '0' ? '' : new Date(parseInt(formData.startTime) * 1000).toISOString().slice(0, 16)}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  startTime: e.target.value
                    ? Math.floor(new Date(e.target.value).getTime() / 1000).toString()
                    : '0',
                })
              }
              className="input"
            />
          </div>
          <div className="form-actions">
            <button
              className="btn btn-secondary"
              onClick={() => setShowCreateForm(false)}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={handleCreate}
              disabled={isPending || isConfirming}
            >
              {isPending || isConfirming ? 'Creating...' : 'Create Subscription'}
            </button>
          </div>
          {error && (
            <div className="error-message">
              {error.message || 'Failed to create subscription'}
            </div>
          )}
        </div>
      )}

      {isSuccess && (
        <div className="success-message">
          <CheckCircle size={16} />
          <span>Subscription created successfully!</span>
        </div>
      )}

      <div className="subscriptions-list">
        <h3>Your Subscriptions ({subscriptions.length})</h3>
        {subscriptions.length === 0 ? (
          <div className="empty-state">
            <p>No subscriptions yet. Create one to get started!</p>
          </div>
        ) : (
          <div className="subscriptions-grid">
            {subscriptions.map((sub) => (
              <div
                key={sub.id}
                className={`subscription-card ${!sub.active ? 'paused' : ''} ${
                  isPaymentDue(sub.nextPaymentTime) ? 'due' : ''
                }`}
              >
                <div className="subscription-card-header">
                  <div className="subscription-info">
                    <h4>Subscription #{sub.id}</h4>
                    <span
                      className={`status-badge ${sub.active ? 'active' : 'paused'}`}
                    >
                      {sub.active ? 'Active' : 'Paused'}
                    </span>
                  </div>
                </div>
                <div className="subscription-details">
                  <div className="detail-item">
                    <span className="label">Recipient:</span>
                    <span className="value">{formatAddress(sub.recipient)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Amount:</span>
                    <span className="value amount">
                      {formatUnits(sub.amount, 18)} XTK
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Interval:</span>
                    <span className="value">{formatInterval(sub.interval)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Next Payment:</span>
                    <span
                      className={`value ${
                        isPaymentDue(sub.nextPaymentTime) ? 'due' : ''
                      }`}
                    >
                      <Clock size={14} />
                      {formatTimestamp(Number(sub.nextPaymentTime))}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Progress:</span>
                    <span className="value">
                      {sub.totalPayments > 0n
                        ? `${Number(sub.paidCount)} / ${Number(sub.totalPayments)}`
                        : `${Number(sub.paidCount)} payments`}
                    </span>
                  </div>
                </div>
                <div className="subscription-actions">
                  {isPaymentDue(sub.nextPaymentTime) && sub.active && (
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => executePayment(sub.id)}
                      disabled={isPending || isConfirming}
                    >
                      Execute Payment
                    </button>
                  )}
                  {sub.active ? (
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => pauseSubscription(sub.id)}
                      disabled={isPending || isConfirming}
                    >
                      <Pause size={14} />
                      Pause
                    </button>
                  ) : (
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => resumeSubscription(sub.id)}
                      disabled={isPending || isConfirming}
                    >
                      <Play size={14} />
                      Resume
                    </button>
                  )}
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => cancelSubscription(sub.id)}
                    disabled={isPending || isConfirming}
                  >
                    <X size={14} />
                    Cancel
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

