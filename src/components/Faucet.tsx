import { useState } from 'react'
import { useAccount } from 'wagmi'
import { Droplet, Check } from 'lucide-react'
import './Faucet.css'

interface FaucetProps {
  onSuccess?: () => void
}

export default function Faucet({ onSuccess }: FaucetProps) {
  const { address, isConnected } = useAccount()
  const [isClaiming, setIsClaiming] = useState(false)
  const [claimed, setClaimed] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleClaim = async () => {
    if (!address || !isConnected) return

    setIsClaiming(true)
    setError(null)
    try {
      // For testnet: This would call a faucet contract's claim function
      // For now, we'll simulate or use a backend endpoint
      // In production, this would interact with a Faucet contract
      
      // Example: If we have a faucet contract
      // writeContract({
      //   address: FAUCET_CONTRACT_ADDRESS,
      //   abi: faucetAbi,
      //   functionName: 'claim',
      // })

      // For MVP, we can show a message that faucet is coming soon
      // or integrate with a backend API that mints test tokens
      alert('Faucet functionality will be available after token deployment. For now, contact the team to receive test tokens.')
      setClaimed(true)
      if (onSuccess) {
        onSuccess()
      }
    } catch (err: any) {
      console.error('Error claiming tokens:', err)
      setError(err.message || 'Failed to claim tokens')
    } finally {
      setIsClaiming(false)
    }
  }

  if (!isConnected) {
    return null
  }

  return (
    <div className="faucet-card">
      <div className="faucet-header">
        <Droplet className="faucet-icon" />
        <h3>Get Test Tokens</h3>
      </div>
      <p className="faucet-description">
        Need test tokens to try out micropayments? Claim free X Tokens from the faucet.
      </p>
      <button
        className="btn btn-faucet"
        onClick={handleClaim}
        disabled={isClaiming || claimed}
      >
        {isClaiming 
          ? 'Claiming...' 
          : claimed 
            ? (
              <>
                <Check size={16} />
                Claimed
              </>
            )
            : (
              <>
                <Droplet size={16} />
                Claim 100 X Tokens
              </>
            )}
      </button>
      {error && (
        <div className="faucet-error">
          {error}
        </div>
      )}
    </div>
  )
}
