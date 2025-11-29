import { useState } from 'react'
import { X } from 'lucide-react'
import { Event } from '@/types'
import './CreateEventModal.css'

interface CreateEventModalProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (event: Omit<Event, 'id' | 'createdAt' | 'participants' | 'totalDistributed' | 'status'>) => void
}

export default function CreateEventModal({ isOpen, onClose, onCreate }: CreateEventModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    onCreate({
      name,
      description,
      owner: '', // Will be set by parent
      startDate: startDate ? Math.floor(new Date(startDate).getTime() / 1000) : undefined,
      endDate: endDate ? Math.floor(new Date(endDate).getTime() / 1000) : undefined,
    })

    // Reset form
    setName('')
    setDescription('')
    setStartDate('')
    setEndDate('')
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content create-event-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create New Event/Program</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="create-event-form">
          <div className="form-group">
            <label htmlFor="event-name">Event/Program Name *</label>
            <input
              id="event-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Hackathon Nov 2025"
              required
              className="input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="event-description">Description</label>
            <textarea
              id="event-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your event or loyalty program..."
              rows={4}
              className="input textarea"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="start-date">Start Date (Optional)</label>
              <input
                id="start-date"
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="end-date">End Date (Optional)</label>
              <input
                id="end-date"
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="input"
              />
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create Event
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

