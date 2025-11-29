/**
 * Hook for managing event whitelist via backend API
 */

import { useState, useCallback } from 'react'
import { apiService } from '@/services/api'

export interface WhitelistEntry {
  id: string
  address: string
  ensName: string | null
  amount: string
  claimed: boolean
  createdAt: string
}

export function useWhitelist(eventId: string | null) {
  const [whitelist, setWhitelist] = useState<WhitelistEntry[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchWhitelist = useCallback(async () => {
    if (!eventId) {
      setWhitelist([])
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await apiService.getEventParticipants(eventId)
      if (response.success && response.data) {
        if (Array.isArray(response.data)) {
          setWhitelist(response.data.map((p: any) => ({
            id: p.id,
            address: p.address,
            ensName: p.ensName,
            amount: p.amount || '0',
            claimed: p.claimed || false,
            createdAt: p.createdAt,
          })))
        } else if ((response.data as any).entries) {
          setWhitelist((response.data as any).entries)
        }
      }
    } catch (err: any) {
      console.error('Error fetching whitelist:', err)
      setError(err.message || 'Failed to fetch whitelist')
    } finally {
      setIsLoading(false)
    }
  }, [eventId])

  const addWhitelist = useCallback(
    async (addresses: string[], amounts?: string[]) => {
      if (!eventId) {
        throw new Error('Event ID required')
      }

      try {
        const participants = addresses.map((addr, index) => ({
          address: addr,
          amount: amounts?.[index] || '0',
        }))
        const response = await apiService.addEventParticipants(eventId, participants)
        await fetchWhitelist() // Refresh whitelist
        return response
      } catch (err: any) {
        console.error('Error adding whitelist:', err)
        throw err
      }
    },
    [eventId, fetchWhitelist]
  )

  const uploadWhitelist = useCallback(
    async (file: File) => {
      if (!eventId) {
        throw new Error('Event ID required')
      }

      try {
        // Parse CSV file
        const text = await file.text()
        const lines = text.split('\n').filter(line => line.trim())
        const headers = lines[0].split(',').map(h => h.trim())
        const addressIndex = headers.indexOf('address')
        const amountIndex = headers.indexOf('amount')

        if (addressIndex === -1) {
          throw new Error('CSV must contain "address" column')
        }

        const participants = lines.slice(1).map(line => {
          const values = line.split(',').map(v => v.trim())
          return {
            address: values[addressIndex],
            amount: amountIndex !== -1 ? values[amountIndex] || '0' : '0',
          }
        })

        const response = await apiService.addEventParticipants(eventId, participants)
        await fetchWhitelist() // Refresh whitelist
        return response
      } catch (err: any) {
        console.error('Error uploading whitelist:', err)
        throw err
      }
    },
    [eventId, fetchWhitelist]
  )

  const removeEntry = useCallback(
    async (_entryId: string) => {
      // Note: Backend v1 doesn't have remove participant endpoint
      // This would need to be implemented or handled differently
      console.warn('Remove participant not yet implemented in backend v1')
      await fetchWhitelist()
    },
    [fetchWhitelist]
  )

  return {
    whitelist,
    isLoading,
    error,
    fetchWhitelist,
    addWhitelist,
    uploadWhitelist,
    removeEntry,
  }
}

