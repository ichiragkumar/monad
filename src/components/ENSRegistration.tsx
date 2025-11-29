import { useState } from 'react'
import { useAccount } from 'wagmi'
import { X, Check, AlertCircle } from 'lucide-react'
import './ENSRegistration.css'

interface ENSRegistrationProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (ensName: string) => void
}

export default function ENSRegistration({ isOpen, onClose, onSuccess }: ENSRegistrationProps) {
  const { address } = useAccount()
  const [desiredName, setDesiredName] = useState('')
  const [isRegistering, setIsRegistering] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  if (!isOpen) return null

  const validateName = (name: string): boolean => {
    // Basic validation: alphanumeric and hyphens, 3-20 chars
    const nameRegex = /^[a-z0-9-]{3,20}$/i
    return nameRegex.test(name)
  }

  const handleRegister = async () => {
    if (!address) {
      setError('Please connect your wallet')
      return
    }

    if (!desiredName.trim()) {
      setError('Please enter a name')
      return
    }

    if (!validateName(desiredName)) {
      setError('Name must be 3-20 characters, alphanumeric and hyphens only')
      return
    }

    setIsRegistering(true)
    setError(null)

    try {
      // TODO: Integrate with ENS subdomain registrar contract
      // For MVP, we'll simulate the registration
      
      // In production, this would:
      // 1. Check if name is available
      // 2. Call the ENS registrar contract to create subdomain
      // 3. Set resolver and records
      
      // Simulate API call or contract interaction
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const ensName = `${desiredName.toLowerCase()}.ourapp.eth`
      setSuccess(true)
      onSuccess(ensName)
      
      // Close after showing success
      setTimeout(() => {
        onClose()
        setDesiredName('')
        setSuccess(false)
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'Failed to register ENS name')
    } finally {
      setIsRegistering(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content ens-registration" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Claim Your ENS Name</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="ens-content">
          <p className="ens-description">
            Get a human-readable name for your wallet address. This makes it easier for others to send you tokens.
          </p>

          <div className="ens-preview">
            <div className="ens-preview-label">Your ENS name will be:</div>
            <div className="ens-preview-name">
              {desiredName ? (
                <span className="ens-name">{desiredName.toLowerCase()}.ourapp.eth</span>
              ) : (
                <span className="ens-placeholder">name.ourapp.eth</span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="ens-name">Choose a name *</label>
            <div className="input-with-suffix">
              <input
                id="ens-name"
                type="text"
                value={desiredName}
                onChange={(e) => {
                  setDesiredName(e.target.value)
                  setError(null)
                }}
                placeholder="alice"
                className="input"
                disabled={isRegistering || success}
                onKeyPress={(e) => e.key === 'Enter' && handleRegister()}
              />
              <span className="input-suffix">.ourapp.eth</span>
            </div>
            <div className="input-hint">
              3-20 characters, alphanumeric and hyphens only
            </div>
          </div>

          {error && (
            <div className="error-message">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="success-message">
              <Check size={16} />
              <span>ENS name registered successfully!</span>
            </div>
          )}

          <div className="ens-note">
            <p><strong>Note:</strong> This feature requires the ENS subdomain registrar contract to be deployed.</p>
            <p>For MVP, this is a placeholder. In production, this will:</p>
            <ul>
              <li>Check name availability</li>
              <li>Register subdomain on-chain</li>
              <li>Set up resolver records</li>
            </ul>
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose} disabled={isRegistering}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleRegister}
            disabled={isRegistering || success || !desiredName.trim()}
          >
            {isRegistering ? 'Registering...' : success ? 'Registered!' : 'Register Name'}
          </button>
        </div>
      </div>
    </div>
  )
}

