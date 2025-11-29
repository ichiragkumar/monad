/**
 * Hook for executing airdrops via backend API
 */

import { useState, useCallback } from 'react'
import { apiService } from '@/services/api'

export interface AirdropResponse {
  message: string
  txHash: string
  recipientCount: number
  totalAmount?: string
  amountPerRecipient?: string
  status: string
}

export function useBackendAirdrop() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastAirdrop, setLastAirdrop] = useState<AirdropResponse | null>(null)

  const executeAirdrop = useCallback(
    async (data: {
      eventId: string
      vendorAddress: string
      txHash: string
      recipients: string[]
      amounts: string[]
      totalAmount: string
    }) => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await apiService.createReward({
          eventId: data.eventId,
          vendorAddress: data.vendorAddress,
          txHash: data.txHash,
          recipients: data.recipients.map((addr, index) => ({
            address: addr,
            amount: data.amounts[index],
          })),
          totalAmount: data.totalAmount,
          token: 'XTK',
          distributionType: 'variable',
        })
        if (response.success && response.data) {
          setLastAirdrop(response.data as AirdropResponse)
        }
        return response
      } catch (err: any) {
        console.error('Error executing airdrop:', err)
        setError(err.message || 'Failed to execute airdrop')
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  const executeAirdropEqual = useCallback(
    async (data: {
      eventId: string
      vendorAddress: string
      txHash: string
      recipients: string[]
      amount: string
      totalAmount: string
    }) => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await apiService.createReward({
          eventId: data.eventId,
          vendorAddress: data.vendorAddress,
          txHash: data.txHash,
          recipients: data.recipients.map(addr => ({
            address: addr,
            amount: data.amount,
          })),
          totalAmount: data.totalAmount,
          token: 'XTK',
          distributionType: 'equal',
        })
        if (response.success && response.data) {
          setLastAirdrop(response.data as AirdropResponse)
        }
        return response
      } catch (err: any) {
        console.error('Error executing airdrop:', err)
        setError(err.message || 'Failed to execute airdrop')
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  return {
    executeAirdrop,
    executeAirdropEqual,
    isLoading,
    error,
    lastAirdrop,
  }
}

