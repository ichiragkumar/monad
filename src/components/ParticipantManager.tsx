import { useState } from 'react'
import { X, Plus, Upload } from 'lucide-react'
import { Participant } from '@/types'
import { formatAddress } from '@/utils/format'
import { isValidENSName as validateENS } from '@/utils/ens'
import './ParticipantManager.css'

interface ParticipantManagerProps {
  isOpen: boolean
  onClose: () => void
  eventId: string
  participants: Participant[]
  onAddParticipants: (addresses: string[]) => void
  onRemoveParticipant: (address: string) => void
}

export default function ParticipantManager({
  isOpen,
  onClose,
  eventId: _eventId,
  participants,
  onAddParticipants,
  onRemoveParticipant,
}: ParticipantManagerProps) {
  const [newAddress, setNewAddress] = useState('')
  const [csvInput, setCsvInput] = useState('')
  const [showCsvInput, setShowCsvInput] = useState(false)

  if (!isOpen) return null

  const handleAddSingle = () => {
    if (!newAddress.trim()) return

    const address = newAddress.trim()
    // Basic validation
    if (!address.startsWith('0x') && !validateENS(address)) {
      alert('Please enter a valid Ethereum address or ENS name')
      return
    }

    // Check if already added
    if (participants.some(p => p.address.toLowerCase() === address.toLowerCase())) {
      alert('This address is already in the participant list')
      return
    }

    onAddParticipants([address])
    setNewAddress('')
  }

  const handleAddBulk = () => {
    if (!csvInput.trim()) return

    const lines = csvInput.split('\n').map(line => line.trim()).filter(line => line)
    const addresses: string[] = []

    for (const line of lines) {
      // Support CSV format: address or address,amount
      const parts = line.split(',')
      const address = parts[0].trim()
      
      if (address.startsWith('0x') || validateENS(address)) {
        if (!participants.some(p => p.address.toLowerCase() === address.toLowerCase())) {
          addresses.push(address)
        }
      }
    }

    if (addresses.length === 0) {
      alert('No valid addresses found in CSV')
      return
    }

    onAddParticipants(addresses)
    setCsvInput('')
    setShowCsvInput(false)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content participant-manager" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Manage Participants</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="participant-manager-content">
          {/* Add Participants Section */}
          <div className="add-participants-section">
            <h3>Add Participants</h3>
            
            {!showCsvInput ? (
              <div className="add-single">
                <div className="input-group">
                  <input
                    type="text"
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    placeholder="0x... or name.ens.eth"
                    className="input"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddSingle()}
                  />
                  <button className="btn btn-primary" onClick={handleAddSingle}>
                    <Plus size={16} />
                    Add
                  </button>
                </div>
                <button
                  className="btn-link"
                  onClick={() => setShowCsvInput(true)}
                >
                  <Upload size={16} />
                  Import from CSV
                </button>
              </div>
            ) : (
              <div className="add-bulk">
                <textarea
                  value={csvInput}
                  onChange={(e) => setCsvInput(e.target.value)}
                  placeholder="Enter addresses, one per line:&#10;0x1234...&#10;0x5678...&#10;or CSV format:&#10;0x1234...,100&#10;0x5678...,200"
                  rows={6}
                  className="input textarea"
                />
                <div className="bulk-actions">
                  <button className="btn btn-secondary" onClick={() => {
                    setShowCsvInput(false)
                    setCsvInput('')
                  }}>
                    Cancel
                  </button>
                  <button className="btn btn-primary" onClick={handleAddBulk}>
                    Add All
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Participants List */}
          <div className="participants-list-section">
            <h3>Participants ({participants.length})</h3>
            {participants.length === 0 ? (
              <div className="empty-participants">
                <p>No participants added yet</p>
                <p className="empty-note">Add addresses or ENS names above</p>
              </div>
            ) : (
              <div className="participants-list">
                {participants.map((participant, index) => (
                  <div key={index} className="participant-item">
                    <div className="participant-info">
                      <span className="participant-address">
                        {participant.ensName || formatAddress(participant.address)}
                      </span>
                      {participant.amount && (
                        <span className="participant-amount">
                          {participant.amount} XTK
                        </span>
                      )}
                    </div>
                    <button
                      className="remove-button"
                      onClick={() => onRemoveParticipant(participant.address)}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn btn-primary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  )
}

