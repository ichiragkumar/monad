import { useState } from 'react'
import { Calendar, Users, Gift, ChevronDown, ChevronUp, Plus, Send } from 'lucide-react'
import { Event } from '@/types'
import { formatTimestamp } from '@/utils/format'
import './EventCard.css'

interface EventCardProps {
  event: Event
  onManageParticipants: (eventId: string) => void
  onDistribute: (eventId: string) => void
}

export default function EventCard({ event, onManageParticipants, onDistribute }: EventCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const statusColors = {
    draft: 'var(--text-muted)',
    active: 'var(--success)',
    completed: 'var(--primary)',
  }

  return (
    <div className="event-card">
      <div className="event-card-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="event-info">
          <h3>{event.name}</h3>
          <div className="event-meta">
            <span className="event-status" style={{ color: statusColors[event.status] }}>
              {event.status}
            </span>
            <span className="event-date">
              <Calendar size={14} />
              {formatTimestamp(event.createdAt)}
            </span>
          </div>
        </div>
        <button className="expand-button">
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>

      {isExpanded && (
        <div className="event-card-content">
          {event.description && (
            <p className="event-description">{event.description}</p>
          )}

          <div className="event-stats">
            <div className="stat-item">
              <Users size={16} />
              <span>{event.participants.length} Participants</span>
            </div>
            <div className="stat-item">
              <Gift size={16} />
              <span>{event.totalDistributed || '0'} X Tokens Distributed</span>
            </div>
          </div>

          <div className="event-actions">
            <button
              className="btn btn-secondary"
              onClick={() => onManageParticipants(event.id)}
            >
              <Plus size={16} />
              Manage Participants
            </button>
            <button
              className="btn btn-primary"
              onClick={() => onDistribute(event.id)}
              disabled={event.participants.length === 0}
            >
              <Send size={16} />
              Distribute Rewards
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

