import { useState, useEffect } from 'react'
import { useAccount, useBalance } from 'wagmi'
import { formatUnits } from 'ethers'
import { X, Send, AlertCircle, CheckCircle } from 'lucide-react'
import { Participant } from '@/types'
import { TOKEN_CONTRACT_ADDRESS } from '@/config/wagmi'
import { useAirdrop } from '@/hooks/useAirdrop'
import './DistributionModal.css'

interface DistributionModalProps {
  isOpen: boolean
  onClose: () => void
  eventId: string
  participants: Participant[]
  onSuccess: () => void
}

export default function DistributionModal({
  isOpen,
  onClose,
  eventId,
  participants,
  onSuccess,
}: DistributionModalProps) {
  const { address } = useAccount()
  const [distributionType, setDistributionType] = useState<'equal' | 'variable'>('equal')
  const [equalAmount, setEqualAmount] = useState('')
  const [amounts, setAmounts] = useState<{ [key: string]: string }>({})
  const [isApproving, setIsApproving] = useState(false)

  const { data: tokenBalance } = useBalance({
    address,
    token: TOKEN_CONTRACT_ADDRESS !== '0x0000000000000000000000000000000000000000' 
      ? TOKEN_CONTRACT_ADDRESS 
      : undefined,
  })

  const {
    approveAirdropHelper,
    airdropEqual,
    airdropVariable,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error: airdropError,
    allowance,
    refetchAllowance,
  } = useAirdrop()

  const [needsApproval, setNeedsApproval] = useState(false)
  const [isApproving, setIsApproving] = useState(false)

  useEffect(() => {
    if (isSuccess) {
      onSuccess()
      // Close after a short delay to show success state
      setTimeout(() => {
        onClose()
      }, 2000)
    }
  }, [isSuccess, onSuccess, onClose])

  // Check if approval is needed
  useEffect(() => {
    if (totalAmount > 0 && tokenBalance) {
      const totalWei = BigInt(Math.floor(totalAmount * 1e18))
      const currentAllowance = allowance as bigint | undefined
      
      if (!currentAllowance || currentAllowance < totalWei) {
        setNeedsApproval(true)
      } else {
        setNeedsApproval(false)
      }
    }
  }, [totalAmount, tokenBalance, allowance])

  // Initialize amounts for variable distribution
  useEffect(() => {
    if (distributionType === 'variable' && participants.length > 0) {
      const initialAmounts: { [key: string]: string } = {}
      participants.forEach(p => {
        initialAmounts[p.address] = p.amount || ''
      })
      setAmounts(initialAmounts)
    }
  }, [distributionType, participants])

  const calculateTotal = () => {
    if (distributionType === 'equal') {
      return equalAmount ? parseFloat(equalAmount) * participants.length : 0
    } else {
      return Object.values(amounts).reduce((sum, amt) => {
        return sum + (amt ? parseFloat(amt) : 0)
      }, 0)
    }
  }

  const totalAmount = calculateTotal()
  const hasEnoughBalance = tokenBalance && totalAmount > 0 
    ? parseFloat(formatUnits(tokenBalance.value, tokenBalance.decimals)) >= totalAmount
    : false

  const handleApprove = async () => {
    if (!totalAmount || totalAmount <= 0) return

    setIsApproving(true)
    try {
      // Approve slightly more than needed for safety
      const approveAmount = BigInt(Math.floor(totalAmount * 1.1 * 1e18))
      await approveAirdropHelper(approveAmount)
      await refetchAllowance()
      setNeedsApproval(false)
    } catch (error) {
      console.error('Approval error:', error)
      alert('Failed to approve tokens. Please try again.')
    } finally {
      setIsApproving(false)
    }
  }

  const handleDistribute = async () => {
    if (!address || participants.length === 0) return

    // Check if approval is needed first
    if (needsApproval) {
      await handleApprove()
      return
    }

    try {
      if (distributionType === 'equal') {
        if (!equalAmount || parseFloat(equalAmount) <= 0) {
          alert('Please enter a valid amount')
          return
        }

        const recipients = participants.map(p => p.address as `0x${string}`)
        await airdropEqual(recipients, equalAmount)
      } else {
        // Variable amounts
        const recipients: `0x${string}`[] = []
        const amountsList: string[] = []

        participants.forEach(p => {
          const amt = amounts[p.address]
          if (amt && parseFloat(amt) > 0) {
            recipients.push(p.address as `0x${string}`)
            amountsList.push(amt)
          }
        })

        if (recipients.length === 0) {
          alert('Please enter amounts for at least one participant')
          return
        }

        await airdropVariable(recipients, amountsList)
      }
    } catch (error: any) {
      console.error('Distribution error:', error)
      alert(error?.message || 'Failed to distribute tokens. Please try again.')
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content distribution-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Distribute Rewards</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="distribution-content">
          <div className="distribution-type-selector">
            <button
              className={`type-button ${distributionType === 'equal' ? 'active' : ''}`}
              onClick={() => setDistributionType('equal')}
            >
              Equal Amount
            </button>
            <button
              className={`type-button ${distributionType === 'variable' ? 'active' : ''}`}
              onClick={() => setDistributionType('variable')}
            >
              Variable Amounts
            </button>
          </div>

          {distributionType === 'equal' ? (
            <div className="equal-distribution">
              <div className="form-group">
                <label htmlFor="equal-amount">Amount per Participant (X Token)</label>
                <input
                  id="equal-amount"
                  type="number"
                  step="0.0001"
                  min="0"
                  value={equalAmount}
                  onChange={(e) => setEqualAmount(e.target.value)}
                  placeholder="0.0"
                  className="input"
                />
              </div>
              <div className="distribution-summary">
                <p>
                  <strong>{participants.length}</strong> participants × <strong>{equalAmount || '0'}</strong> XTK = 
                  <strong> {totalAmount.toFixed(4)}</strong> XTK total
                </p>
              </div>
            </div>
          ) : (
            <div className="variable-distribution">
              <div className="participants-amounts">
                {participants.map((participant, index) => (
                  <div key={index} className="participant-amount-row">
                    <span className="participant-address">
                      {participant.ensName || participant.address.slice(0, 10) + '...'}
                    </span>
                    <input
                      type="number"
                      step="0.0001"
                      min="0"
                      value={amounts[participant.address] || ''}
                      onChange={(e) => setAmounts({
                        ...amounts,
                        [participant.address]: e.target.value
                      })}
                      placeholder="0.0"
                      className="input amount-input"
                    />
                    <span className="token-symbol">XTK</span>
                  </div>
                ))}
              </div>
              <div className="distribution-summary">
                <p>
                  Total: <strong>{totalAmount.toFixed(4)}</strong> XTK to <strong>{Object.values(amounts).filter(a => a && parseFloat(a) > 0).length}</strong> participants
                </p>
              </div>
            </div>
          )}

          {tokenBalance && (
            <div className="balance-check">
              <p>
                Your Balance: <strong>{formatUnits(tokenBalance.value, tokenBalance.decimals)}</strong> XTK
              </p>
              {!hasEnoughBalance && totalAmount > 0 && (
                <div className="balance-warning">
                  <AlertCircle size={16} />
                  <span>Insufficient balance for this distribution</span>
                </div>
              )}
              {needsApproval && totalAmount > 0 && hasEnoughBalance && (
                <div className="approval-notice">
                  <AlertCircle size={16} />
                  <span>Approval required before distribution</span>
                </div>
              )}
            </div>
          )}

          {isSuccess && (
            <div className="success-message">
              <CheckCircle size={16} />
              <span>Tokens distributed successfully!</span>
            </div>
          )}
        </div>

        {airdropError && (
          <div className="error-message">
            {airdropError.message || 'Distribution failed'}
          </div>
        )}

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

        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose} disabled={isPending || isConfirming}>
            {isSuccess ? 'Close' : 'Cancel'}
          </button>
          {needsApproval && !isSuccess ? (
            <button
              className="btn btn-primary"
              onClick={handleApprove}
              disabled={isApproving || isPending || !hasEnoughBalance || totalAmount === 0}
            >
              {isApproving ? 'Approving...' : 'Approve Tokens'}
            </button>
          ) : (
            <button
              className="btn btn-primary"
              onClick={handleDistribute}
              disabled={
                isPending || 
                isConfirming || 
                !hasEnoughBalance || 
                totalAmount === 0 ||
                participants.length === 0 ||
                isSuccess
              }
            >
              <Send size={16} />
              {isPending || isConfirming ? 'Processing...' : isSuccess ? 'Distributed!' : 'Distribute Tokens'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

