/**
 * My Event Participants Page
 * Shows events where user is a participant
 */

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { Calendar, Users, Gift, ExternalLink } from 'lucide-react'
import { apiService } from '@/services/api'
import { formatAddress, formatTimestamp } from '@/utils/format'
import { formatUnits } from 'ethers'
import './MyEventParticipants.css'

export default function MyEventParticipants() {
  const { address } = useAccount()
  const [events, setEvents] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!address) return

    const fetchEvents = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await apiService.getParticipantEvents(address || '')
        if (response.success && response.data) {
          const data = response.data as any
          if (Array.isArray(data)) {
            setEvents(data)
          } else if (data.events) {
            setEvents(data.events)
          } else if (response.pagination) {
            setEvents(Array.isArray(response.data) ? response.data : [])
          }
        }
      } catch (err: any) {
        console.error('Error fetching participant events:', err)
        setError(err.message || 'Failed to fetch events')
      } finally {
        setIsLoading(false)
      }
    }

    fetchEvents()
  }, [address])

  if (!address) {
    return (
      <div className="events-container">
        <div className="connect-prompt">
          <h2>Connect Your Wallet</h2>
          <p>Please connect your wallet to view your event participations.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="events-container">
      <div className="page-header">
        <h1>
          <Users size={28} />
          My Event Participants
        </h1>
      </div>

      {isLoading && (
        <div className="loading-state">
          <div className="spinner" />
          <p>Loading events...</p>
        </div>
      )}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {!isLoading && events.length === 0 && (
        <div className="empty-state">
          <Calendar size={48} />
          <p>No event participations yet</p>
          <p className="empty-note">
            You haven't participated in any events. Join events to see them here.
          </p>
        </div>
      )}

      {!isLoading && events.length > 0 && (
        <div className="events-list">
          {events.map((event) => (
            <div key={event.id} className="event-card">
              <div className="event-header">
                <div className="event-info">
                  <h3>{event.name}</h3>
                  <span className={`status-badge ${event.status?.toLowerCase()}`}>
                    {event.status || 'Active'}
                  </span>
                </div>
              </div>

              {event.description && (
                <p className="event-description">{event.description}</p>
              )}

              <div className="event-details">
                <div className="detail-item">
                  <Calendar size={16} />
                  <span>Event Date: {event.eventDate ? new Date(event.eventDate).toLocaleDateString() : 'TBD'}</span>
                </div>
                <div className="detail-item">
                  <Gift size={16} />
                  <span>Reward Amount: {event.amount ? formatUnits(event.amount, 18) : '0'} XTK</span>
                </div>
                <div className="detail-item">
                  <Users size={16} />
                  <span>Total Participants: {event.participantCount || 0}</span>
                </div>
              </div>

              {event.organizer && (
                <div className="event-organizer">
                  <span className="label">Organized by:</span>
                  <span className="value">{formatAddress(event.organizer.address)}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

