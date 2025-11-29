/**
 * Hook for fetching transactions from backend API
 */

import { useState, useEffect, useCallback } from 'react'
import { useAccount } from 'wagmi'
import { apiService } from '@/services/api'

export interface BackendTransaction {
  id: string
  txHash: string
  fromAddress: string
  toAddress: string
  amount: string
  type: string
  status: 'PENDING' | 'CONFIRMED' | 'FAILED'
  blockNumber: string | null
  createdAt: string
  confirmedAt: string | null
  syncStatus?: 'pending' | 'syncing' | 'synced'
}

export interface SyncStatus {
  isSyncing: boolean
  lastSyncTime: string | null
  pendingTransactions: number
  syncWindow?: {
    startTime: string
    endTime: string
  }
  message?: string
}

export function useBackendTransactions() {
  const { address } = useAccount()
  const [transactions, setTransactions] = useState<BackendTransaction[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  })
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null)

  const fetchTransactions = useCallback(
    async (page: number = 1, limit: number = 20) => {
      if (!address) {
        setTransactions([])
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const response = await apiService.getTransactions({
          walletAddress: address,
          page,
          limit,
        })

        if (response.success && response.data) {
          const data = response.data as any
          if (Array.isArray(data)) {
            setTransactions(data as BackendTransaction[])
          } else if (data.transactions) {
            setTransactions(data.transactions as BackendTransaction[])
          } else if (Array.isArray(data)) {
            setTransactions(data as BackendTransaction[])
          }
          
          if (response.pagination) {
            setPagination(response.pagination)
          }
        }
      } catch (err: any) {
        console.error('Error fetching transactions:', err)
        setError(err.message || 'Failed to fetch transactions')
      } finally {
        setIsLoading(false)
      }
    },
    [address]
  )

  const fetchSyncStatus = useCallback(async () => {
    if (!address) return

      try {
        const response = await apiService.getSyncStatus(address)
        if (response.success && response.data) {
          setSyncStatus(response.data as SyncStatus)
        }
      } catch (err) {
        console.error('Error fetching sync status:', err)
      }
  }, [address])

  const fetchRecentTransactions = useCallback(async () => {
    if (!address) return

    try {
      const response = await apiService.getRecentTransactions(address, 10)
      if (response.success && response.data) {
        const data = response.data as any
        const transactions = Array.isArray(data)
          ? data
          : (data?.transactions || [])
        
        // Merge with existing transactions, avoiding duplicates
        setTransactions((prev) => {
          const existingHashes = new Set(prev.map((t) => t.txHash))
          const newTxns = transactions.filter(
            (t: BackendTransaction) => !existingHashes.has(t.txHash)
          )
          return [...newTxns, ...prev].slice(0, 20)
        })
      }
    } catch (err) {
      console.error('Error fetching recent transactions:', err)
    }
  }, [address])

  useEffect(() => {
    fetchTransactions(1)
  }, [fetchTransactions])

  useEffect(() => {
    fetchSyncStatus()
    const interval = setInterval(fetchSyncStatus, 30000) // Every 30 seconds
    return () => clearInterval(interval)
  }, [fetchSyncStatus])

  useEffect(() => {
    fetchRecentTransactions()
    const interval = setInterval(fetchRecentTransactions, 60000) // Every minute
    return () => clearInterval(interval)
  }, [fetchRecentTransactions])

  const logTransaction = useCallback(
    async (txHash: string, toAddress: string, amount: string) => {
      if (!address) return

      try {
        await apiService.createTransaction({
          txHash,
          from: address,
          to: toAddress,
          amount,
          token: 'XTK',
          type: 'send',
        })
        // Refresh transactions after logging
        await fetchTransactions(pagination.page)
      } catch (err: any) {
        console.error('Error logging transaction:', err)
        throw err
      }
    },
    [address, pagination.page, fetchTransactions]
  )

  return {
    transactions,
    isLoading,
    error,
    pagination,
    syncStatus,
    refetch: () => fetchTransactions(pagination.page),
    fetchPage: (page: number) => fetchTransactions(page),
    logTransaction,
  }
}

