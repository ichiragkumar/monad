import { useState, useMemo } from 'react'
import { useAccount } from 'wagmi'
import { Gift, Users, Plus, Send, Loader2 } from 'lucide-react'
import { Event } from '@/types'
import CreateEventModal from '@/components/CreateEventModal'
import EventCard from '@/components/EventCard'
import ParticipantManager from '@/components/ParticipantManager'
import DistributionModal from '@/components/DistributionModal'
import { useVendorEvents, BackendEvent } from '@/hooks/useVendorEvents'
import './VendorDashboard.css'

export default function VendorDashboard() {
  const { isConnected } = useAccount()
  const { events: backendEvents, isLoading, error, createEvent, refetch } = useVendorEvents()
  const [showCreateEvent, setShowCreateEvent] = useState(false)
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [showParticipantManager, setShowParticipantManager] = useState(false)
  const [showDistribution, setShowDistribution] = useState(false)

  // Convert backend events to frontend Event format
  const events: Event[] = useMemo(() => {
    if (!backendEvents || !Array.isArray(backendEvents)) {
      return []
    }
    return backendEvents
      .filter((backendEvent): backendEvent is BackendEvent => !!backendEvent)
      .map((backendEvent: BackendEvent) => ({
        id: backendEvent.id || (backendEvent as any).eventId || '', // Handle both id and eventId
        name: backendEvent.name || '',
        description: backendEvent.description || '',
        owner: backendEvent.organizer?.address || '',
        createdAt: backendEvent.createdAt 
          ? Math.floor(new Date(backendEvent.createdAt).getTime() / 1000)
          : Math.floor(Date.now() / 1000),
        participants: [], // Will be loaded separately when needed
        totalDistributed: backendEvent.tokenBudget || (backendEvent as any).totalDistributed || '0',
        status: (backendEvent.status?.toLowerCase() || 'draft') as 'draft' | 'active' | 'completed',
      }))
  }, [backendEvents])

  // Calculate stats
  const stats = useMemo(() => {
    if (!backendEvents || !Array.isArray(backendEvents)) {
      return { totalEvents: 0, totalParticipants: 0, totalDistributed: 0 }
    }
    const totalEvents = events.length
    const totalParticipants = backendEvents
      .filter((e): e is BackendEvent => !!e)
      .reduce((sum, event) => sum + (event.whitelistCount || event.participantCount || 0), 0)
    const totalDistributed = backendEvents
      .filter((e): e is BackendEvent => !!e)
      .reduce((sum, event) => {
        const amount = event.tokenBudget || event.totalDistributed || '0'
        return sum + parseFloat(amount)
      }, 0)

    return { totalEvents, totalParticipants, totalDistributed }
  }, [events, backendEvents])

  const selectedEvent = selectedEventId 
    ? events.find(e => e.id === selectedEventId)
    : null

  const handleCreateEvent = async (eventData: Omit<Event, 'id' | 'createdAt' | 'participants' | 'totalDistributed' | 'status'>) => {
    try {
      // Convert frontend event data to backend format
      await createEvent({
        name: eventData.name,
        description: eventData.description || '',
        startDate: eventData.startDate ? new Date(eventData.startDate * 1000).toISOString() : undefined,
        endDate: eventData.endDate ? new Date(eventData.endDate * 1000).toISOString() : undefined,
        tokenBudget: '0', // Can be set later or added to form
      })
      // Events will be automatically refetched by the hook
      setShowCreateEvent(false)
    } catch (err: any) {
      console.error('Error creating event:', err)
      alert(err.message || 'Failed to create event')
    }
  }

  const handleManageParticipants = (eventId: string) => {
    setSelectedEventId(eventId)
    setShowParticipantManager(true)
  }

  const handleAddParticipants = (_addresses: string[]) => {
    // This will be handled by ParticipantManager component which calls the API
    // Just refresh events after participants are added
    if (selectedEventId) {
      refetch()
    }
  }

  const handleRemoveParticipant = (_address: string) => {
    // This will be handled by ParticipantManager component which calls the API
    // Just refresh events after participant is removed
    if (selectedEventId) {
      refetch()
    }
  }

  const handleDistribute = (eventId: string) => {
    setSelectedEventId(eventId)
    setShowDistribution(true)
  }

  const handleDistributionSuccess = () => {
    // Refresh events after distribution
    if (selectedEventId) {
      refetch()
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
        
        {isLoading && (
          <div className="loading-state">
            <Loader2 className="spinner" size={32} />
            <p>Loading events...</p>
          </div>
        )}

        {error && (
          <div className="error-message">
            <p>Error loading events: {error}</p>
            <button className="btn btn-secondary" onClick={() => refetch()}>
              Retry
            </button>
          </div>
        )}

        {!isLoading && !error && events.length === 0 && (
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
        )}

        {!isLoading && !error && events.length > 0 && (
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

      <ParticipantManager
        isOpen={showParticipantManager}
        onClose={() => {
          setShowParticipantManager(false)
          setSelectedEventId(null)
        }}
        eventId={selectedEventId || ''}
        participants={[]} // Will be loaded by ParticipantManager from API
        onAddParticipants={handleAddParticipants}
        onRemoveParticipant={handleRemoveParticipant}
      />

      <DistributionModal
        isOpen={showDistribution}
        onClose={() => {
          setShowDistribution(false)
          setSelectedEventId(null)
        }}
        eventId={selectedEventId || ''}
        participants={[]} // Will be loaded by DistributionModal from API
        onSuccess={handleDistributionSuccess}
      />
    </div>
  )
}


