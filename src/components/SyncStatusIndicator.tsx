/**
 * Sync Status Indicator Component
 * Shows transaction sync status
 */

import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import { Loader2, CheckCircle } from 'lucide-react'
import { apiService } from '@/services/api'
import './SyncStatusIndicator.css'

interface SyncStatus {
  isSyncing: boolean
  lastSyncTime: string | null
  pendingTransactions: number
  message?: string
}

export default function SyncStatusIndicator() {
  const { address } = useAccount()
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null)

  useEffect(() => {
    if (!address) {
      setSyncStatus(null)
      return
    }

    const fetchSyncStatus = async () => {
      try {
        const response = await apiService.getSyncStatus(address)
        if (response.success && response.data) {
          setSyncStatus(response.data as SyncStatus)
        }
      } catch (error) {
        console.error('Error fetching sync status:', error)
      }
    }

    fetchSyncStatus()
    const interval = setInterval(fetchSyncStatus, 30000) // Every 30 seconds
    return () => clearInterval(interval)
  }, [address])

  if (!address || !syncStatus || (!syncStatus.isSyncing && syncStatus.pendingTransactions === 0)) {
    return null
  }

  return (
    <div className={`sync-status-indicator ${syncStatus.isSyncing ? 'syncing' : 'synced'}`}>
      {syncStatus.isSyncing ? (
        <>
          <Loader2 className="sync-icon spinning" size={16} />
          <span className="sync-message">
            {syncStatus.message || 'Transactions syncing in progress...'}
          </span>
          {syncStatus.pendingTransactions > 0 && (
            <span className="sync-count">
              {syncStatus.pendingTransactions} pending
            </span>
          )}
        </>
      ) : (
        <>
          <CheckCircle className="sync-icon" size={16} />
          <span className="sync-message">All transactions synced</span>
        </>
      )}
    </div>
  )
}

