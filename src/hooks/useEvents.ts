import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { Event } from '@/types'

/**
 * Custom hook for managing events
 * In production, this would fetch from a backend or smart contract
 */
export function useEvents() {
  const { address } = useAccount()
  const [events, setEvents] = useState<Event[]>([])

  // Load events from localStorage (for MVP)
  // In production, fetch from backend or smart contract
  useEffect(() => {
    if (address) {
      const stored = localStorage.getItem(`events-${address}`)
      if (stored) {
        try {
          setEvents(JSON.parse(stored))
        } catch (e) {
          console.error('Error loading events:', e)
        }
      }
    }
  }, [address])

  // Save events to localStorage whenever they change
  useEffect(() => {
    if (address && events.length >= 0) {
      localStorage.setItem(`events-${address}`, JSON.stringify(events))
    }
  }, [events, address])

  const addEvent = (event: Event) => {
    setEvents([...events, event])
  }

  const updateEvent = (eventId: string, updates: Partial<Event>) => {
    setEvents(events.map(e => e.id === eventId ? { ...e, ...updates } : e))
  }

  const deleteEvent = (eventId: string) => {
    setEvents(events.filter(e => e.id !== eventId))
  }

  return {
    events,
    addEvent,
    updateEvent,
    deleteEvent,
    setEvents,
  }
}

