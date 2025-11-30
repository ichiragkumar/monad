/**
 * Hook for managing vendor events via backend API
 */

import { useState, useEffect, useCallback } from 'react'
import { useAccount } from 'wagmi'
import { apiService } from '@/services/api'

export interface BackendEvent {
  id?: string
  eventId?: string // Backend may return eventId instead of id
  name: string
  description: string
  status: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'draft' | 'active' | 'completed'
  organizer?: {
    address: string
    ensName: string | null
  }
  tokenBudget?: string
  totalDistributed?: string
  startDate?: string | null
  endDate?: string | null
  whitelistCount?: number
  participantCount?: number
  airdropCount?: number
  createdAt: string
}

export function useVendorEvents() {
  const { address } = useAccount()
  const [events, setEvents] = useState<BackendEvent[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dashboardStats, setDashboardStats] = useState<any>(null)

  const fetchEvents = useCallback(async () => {
    if (!address) {
      setEvents([])
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await apiService.getVendorEvents(address || '')
      if (response.success && response.data) {
        if (Array.isArray(response.data)) {
          setEvents(response.data)
        } else if ((response.data as any).events) {
          setEvents((response.data as any).events)
        }
      }
    } catch (err: any) {
      console.error('Error fetching events:', err)
      setError(err.message || 'Failed to fetch events')
    } finally {
      setIsLoading(false)
    }
  }, [address])

  const fetchDashboard = useCallback(async () => {
    if (!address) return

    try {
      // Calculate dashboard stats from events
      const response = await apiService.getVendorEvents(address)
      if (response.success && response.data) {
        const data = response.data as any
        const events = Array.isArray(data) ? data : (data?.events || [])
        const stats = {
          totalEvents: events.length,
          activeEvents: events.filter((e: any) => e.status === 'ACTIVE' || e.status === 'active').length,
          totalDistributed: events.reduce((sum: number, e: any) => {
            return sum + parseFloat(e.totalDistributed || '0')
          }, 0),
        }
        setDashboardStats(stats)
      }
    } catch (err: any) {
      console.error('Error fetching dashboard:', err)
    }
  }, [address])

  const createEvent = useCallback(
    async (eventData: {
      name: string
      description: string
      startDate?: string
      endDate?: string
      tokenBudget?: string
    }) => {
      if (!address) {
        throw new Error('Wallet not connected')
      }

      try {
        const response = await apiService.createEvent({
          ...eventData,
          vendorAddress: address,
        })
        await fetchEvents() // Refresh events list
        return response
      } catch (err: any) {
        console.error('Error creating event:', err)
        throw err
      }
    },
    [address, fetchEvents]
  )

  useEffect(() => {
    fetchEvents()
    fetchDashboard()
  }, [fetchEvents, fetchDashboard])

  return {
    events,
    dashboardStats,
    isLoading,
    error,
    createEvent,
    refetch: fetchEvents,
  }
}

