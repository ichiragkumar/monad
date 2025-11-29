import { useState, useMemo } from 'react'
import { useAccount } from 'wagmi'
import { Gift, Users, Plus, Send } from 'lucide-react'
import { Event, Participant } from '@/types'
import CreateEventModal from '@/components/CreateEventModal'
import EventCard from '@/components/EventCard'
import ParticipantManager from '@/components/ParticipantManager'
import DistributionModal from '@/components/DistributionModal'
import './VendorDashboard.css'

export default function VendorDashboard() {
  const { isConnected, address } = useAccount()
  const [events, setEvents] = useState<Event[]>([])
  const [showCreateEvent, setShowCreateEvent] = useState(false)
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [showParticipantManager, setShowParticipantManager] = useState(false)
  const [showDistribution, setShowDistribution] = useState(false)

  // Calculate stats
  const stats = useMemo(() => {
    const totalEvents = events.length
    const totalParticipants = events.reduce((sum, event) => sum + event.participants.length, 0)
    const totalDistributed = events.reduce((sum, event) => {
      return sum + parseFloat(event.totalDistributed || '0')
    }, 0)

    return { totalEvents, totalParticipants, totalDistributed }
  }, [events])

  const selectedEvent = selectedEventId 
    ? events.find(e => e.id === selectedEventId)
    : null

  const handleCreateEvent = (eventData: Omit<Event, 'id' | 'createdAt' | 'participants' | 'totalDistributed' | 'status'>) => {
    const newEvent: Event = {
      id: `event-${Date.now()}`,
      ...eventData,
      owner: address || '',
      createdAt: Math.floor(Date.now() / 1000),
      participants: [],
      totalDistributed: '0',
      status: 'draft',
    }
    setEvents([...events, newEvent])
  }

  const handleManageParticipants = (eventId: string) => {
    setSelectedEventId(eventId)
    setShowParticipantManager(true)
  }

  const handleAddParticipants = (addresses: string[]) => {
    if (!selectedEventId) return

    setEvents(events.map(event => {
      if (event.id === selectedEventId) {
        const newParticipants: Participant[] = addresses.map(addr => ({
          address: addr,
          claimed: false,
        }))
        // Avoid duplicates
        const existingAddresses = new Set(event.participants)
        const uniqueNew = newParticipants.filter(p => !existingAddresses.has(p.address))
        return {
          ...event,
          participants: [...event.participants, ...uniqueNew.map(p => p.address)],
          status: event.status === 'draft' ? 'active' : event.status,
        }
      }
      return event
    }))
  }

  const handleRemoveParticipant = (address: string) => {
    if (!selectedEventId) return

    setEvents(events.map(event => {
      if (event.id === selectedEventId) {
        return {
          ...event,
          participants: event.participants.filter(addr => addr.toLowerCase() !== address.toLowerCase()),
        }
      }
      return event
    }))
  }

  const handleDistribute = (eventId: string) => {
    setSelectedEventId(eventId)
    setShowDistribution(true)
  }

  const handleDistributionSuccess = () => {
    // Update event with distribution info
    // In production, this would fetch actual transaction data
    if (selectedEventId) {
      setEvents(events.map(event => {
        if (event.id === selectedEventId) {
          // Update total distributed (in production, calculate from actual tx)
          return {
            ...event,
            status: 'completed',
          }
        }
        return event
      }))
    }
  }

  if (!isConnected) {
    return (
      <div className="vendor-container">
        <div className="connect-prompt">
          <h2>Connect Your Wallet</h2>
          <p>Please connect your wallet to access the vendor dashboard.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="vendor-container">
      <div className="vendor-header">
        <h1>Vendor Dashboard</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowCreateEvent(true)}
        >
          <Plus size={20} />
          Create Event
        </button>
      </div>

      <div className="vendor-stats">
        <div className="stat-card">
          <div className="stat-icon">
            <Gift />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalEvents}</div>
            <div className="stat-label">Total Events</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <Users />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalParticipants}</div>
            <div className="stat-label">Participants Rewarded</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <Send />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalDistributed.toFixed(2)}</div>
            <div className="stat-label">Tokens Distributed</div>
          </div>
        </div>
      </div>

      <div className="events-section">
        <h2>Your Events & Programs</h2>
        {events.length === 0 ? (
          <div className="empty-state">
            <Gift size={48} />
            <p>No events created yet</p>
            <p className="empty-note">
              Create your first loyalty program or event to start rewarding participants
            </p>
            <button 
              className="btn btn-primary"
              onClick={() => setShowCreateEvent(true)}
            >
              Create Event
            </button>
          </div>
        ) : (
          <div className="events-list">
            {events.map(event => (
              <EventCard
                key={event.id}
                event={event}
                onManageParticipants={handleManageParticipants}
                onDistribute={handleDistribute}
              />
            ))}
          </div>
        )}
      </div>

      <CreateEventModal
        isOpen={showCreateEvent}
        onClose={() => setShowCreateEvent(false)}
        onCreate={handleCreateEvent}
      />

      {selectedEvent && (
        <>
          <ParticipantManager
            isOpen={showParticipantManager}
            onClose={() => {
              setShowParticipantManager(false)
              setSelectedEventId(null)
            }}
            eventId={selectedEvent.id}
            participants={selectedEvent.participants.map(addr => ({
              address: addr,
              claimed: false,
            }))}
            onAddParticipants={handleAddParticipants}
            onRemoveParticipant={handleRemoveParticipant}
          />

          <DistributionModal
            isOpen={showDistribution}
            onClose={() => {
              setShowDistribution(false)
              setSelectedEventId(null)
            }}
            eventId={selectedEvent.id}
            participants={selectedEvent.participants.map(addr => ({
              address: addr,
              claimed: false,
            }))}
            onSuccess={handleDistributionSuccess}
          />
        </>
      )}
    </div>
  )
}


