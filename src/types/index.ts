/**
 * Type definitions for the platform
 */

export interface Event {
  id: string
  name: string
  description: string
  owner: string
  createdAt: number
  startDate?: number
  endDate?: number
  participants: string[]
  totalDistributed: string
  status: 'draft' | 'active' | 'completed'
}

export interface Participant {
  address: string
  ensName?: string
  amount?: string
  claimed: boolean
}

export interface Distribution {
  eventId: string
  recipients: string[]
  amounts: string[]
  timestamp: number
  txHash?: string
}

