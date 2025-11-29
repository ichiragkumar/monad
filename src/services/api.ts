/**
 * API Service Layer
 * Centralized API calls to backend v1
 */

import { API_ENDPOINTS } from '@/config/api'

export interface ApiResponse<T> {
  success: boolean
  data?: T
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
  error?: {
    code: string
    message: string
    details?: any
  }
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

class ApiService {
  constructor() {
    // baseURL is not used directly, endpoints are constructed from API_ENDPOINTS
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    try {
      const response = await fetch(endpoint, {
        ...options,
        headers,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error?.message || data.message || 'API request failed')
      }

      return data
    } catch (error: any) {
      console.error('API Error:', error)
      throw error
    }
  }

  /**
   * Create or get user with EIP-712 signature
   */
  async createOrGetUser(
    walletAddress: string,
    signature: string,
    message: string,
    timestamp: number
  ) {
    return this.request(API_ENDPOINTS.USERS.CREATE_OR_GET, {
      method: 'POST',
      body: JSON.stringify({
        walletAddress,
        signature,
        message,
        timestamp,
      }),
    })
  }

  /**
   * Get user profile with stats
   */
  async getUserProfile(walletAddress: string) {
    return this.request(API_ENDPOINTS.USERS.GET_PROFILE(walletAddress), {
      method: 'GET',
    })
  }

  // Transactions
  async getTransactions(params?: {
    walletAddress?: string
    page?: number
    limit?: number
    type?: string
    status?: string
    fromDate?: string
    toDate?: string
  }) {
    const queryParams = new URLSearchParams()
    if (params?.walletAddress) queryParams.append('walletAddress', params.walletAddress)
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.type) queryParams.append('type', params.type)
    if (params?.status) queryParams.append('status', params.status)
    if (params?.fromDate) queryParams.append('fromDate', params.fromDate)
    if (params?.toDate) queryParams.append('toDate', params.toDate)

    const url = `${API_ENDPOINTS.TRANSACTIONS.LIST}?${queryParams.toString()}`
    return this.request<PaginatedResponse<any>>(url, { method: 'GET' })
  }

  async getRecentTransactions(walletAddress: string, minutes: number = 10) {
    return this.request(
      `${API_ENDPOINTS.TRANSACTIONS.RECENT}?walletAddress=${walletAddress}&minutes=${minutes}`,
      { method: 'GET' }
    )
  }

  async createTransaction(data: {
    txHash: string
    from: string
    to: string
    amount: string
    token: string
    type: 'send' | 'batch' | 'reward' | 'subscription' | 'payment_link'
    metadata?: {
      eventId?: string
      subscriptionId?: string
      paymentLinkId?: string
      batchId?: string
    }
  }) {
    return this.request(API_ENDPOINTS.TRANSACTIONS.CREATE, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateTransaction(txHash: string, data: {
    status?: 'confirmed' | 'failed'
    blockNumber?: number
    blockTimestamp?: number
    gasUsed?: string
    gasPrice?: string
    syncStatus?: 'synced'
  }) {
    return this.request(API_ENDPOINTS.TRANSACTIONS.UPDATE(txHash), {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  async getTransaction(txHash: string) {
    return this.request(API_ENDPOINTS.TRANSACTIONS.GET(txHash), { method: 'GET' })
  }

  // Batch Transactions
  async createBatchTransaction(data: {
    txHash: string
    sender: string
    recipients: Array<{ address: string; amount: string }>
    totalAmount: string
    token: string
    type: 'equal' | 'variable'
    eventId?: string
    note?: string
  }) {
    return this.request(API_ENDPOINTS.BATCH_TRANSACTIONS.CREATE, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getBatchTransactions(walletAddress: string, page: number = 1, limit: number = 20) {
    const queryParams = new URLSearchParams()
    queryParams.append('walletAddress', walletAddress)
    queryParams.append('page', page.toString())
    queryParams.append('limit', limit.toString())

    return this.request<PaginatedResponse<any>>(
      `${API_ENDPOINTS.BATCH_TRANSACTIONS.LIST}?${queryParams.toString()}`,
      { method: 'GET' }
    )
  }

  async getBatchTransaction(batchId: string) {
    return this.request(API_ENDPOINTS.BATCH_TRANSACTIONS.GET(batchId), { method: 'GET' })
  }

  // Rewards
  async createReward(data: {
    eventId: string
    vendorAddress: string
    txHash: string
    recipients: Array<{ address: string; amount: string; reason?: string }>
    totalAmount: string
    token: string
    distributionType: 'equal' | 'variable'
    metadata?: any
  }) {
    return this.request(API_ENDPOINTS.REWARDS.CREATE, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getRewardsByEvent(eventId: string) {
    return this.request(API_ENDPOINTS.REWARDS.GET_BY_EVENT(eventId), { method: 'GET' })
  }

  // Events
  async createEvent(data: {
    vendorAddress: string
    name: string
    description: string
    eventDate?: string
    status?: 'draft' | 'active' | 'completed'
    metadata?: any
  }) {
    return this.request(API_ENDPOINTS.EVENTS.CREATE, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getVendorEvents(vendorAddress: string, params?: {
    status?: string
    page?: number
    limit?: number
  }) {
    const queryParams = new URLSearchParams()
    queryParams.append('vendorAddress', vendorAddress)
    if (params?.status) queryParams.append('status', params.status)
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())

    return this.request<PaginatedResponse<any>>(
      `${API_ENDPOINTS.EVENTS.LIST}?${queryParams.toString()}`,
      { method: 'GET' }
    )
  }

  async getEvent(eventId: string) {
    return this.request(API_ENDPOINTS.EVENTS.GET(eventId), { method: 'GET' })
  }

  async updateEvent(eventId: string, data: {
    name?: string
    description?: string
    status?: string
  }) {
    return this.request(API_ENDPOINTS.EVENTS.UPDATE(eventId), {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  async deleteEvent(eventId: string) {
    return this.request(API_ENDPOINTS.EVENTS.DELETE(eventId), { method: 'DELETE' })
  }

  async addEventParticipants(eventId: string, participants: Array<{
    address: string
    ensName?: string
    amount?: string
  }>) {
    return this.request(API_ENDPOINTS.EVENTS.ADD_PARTICIPANTS(eventId), {
      method: 'POST',
      body: JSON.stringify({ participants }),
    })
  }

  async getEventParticipants(eventId: string, page: number = 1, limit: number = 50) {
    const queryParams = new URLSearchParams()
    queryParams.append('page', page.toString())
    queryParams.append('limit', limit.toString())

    return this.request<PaginatedResponse<any>>(
      `${API_ENDPOINTS.EVENTS.GET_PARTICIPANTS(eventId)}?${queryParams.toString()}`,
      { method: 'GET' }
    )
  }

  // Subscriptions
  async createSubscription(data: {
    subscriptionId: string // On-chain subscription ID
    payer: string
    recipient: string
    amount: string
    token: string
    interval: number // seconds
    totalPayments: number
    nextPaymentTime: number // unix timestamp
    startTime: number // unix timestamp
    txHash: string
  }) {
    return this.request(API_ENDPOINTS.SUBSCRIPTIONS.CREATE, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getSubscriptions(walletAddress: string, params?: {
    type?: string
    page?: number
    limit?: number
  }) {
    const queryParams = new URLSearchParams()
    queryParams.append('walletAddress', walletAddress)
    if (params?.type) queryParams.append('type', params.type)
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())

    return this.request<PaginatedResponse<any>>(
      `${API_ENDPOINTS.SUBSCRIPTIONS.LIST}?${queryParams.toString()}`,
      { method: 'GET' }
    )
  }

  async updateSubscriptionStatus(subscriptionId: string, data: {
    status: 'active' | 'paused' | 'cancelled'
    txHash: string
    nextPaymentTime?: number
  }) {
    return this.request(API_ENDPOINTS.SUBSCRIPTIONS.UPDATE(subscriptionId), {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  async recordSubscriptionPayment(subscriptionId: string, data: {
    txHash: string
    amount: string
    paymentNumber: number
    nextPaymentTime: number
  }) {
    return this.request(API_ENDPOINTS.SUBSCRIPTIONS.RECORD_PAYMENT(subscriptionId), {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // Payment Links
  async generatePaymentLink(data: {
    sender: string
    recipients: Array<{ address: string; amount: string }>
    token: string
    expiry: number // unix timestamp
    note?: string
    eventId?: string
  }) {
    return this.request(API_ENDPOINTS.PAYMENT_LINKS.GENERATE, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getPaymentLink(paymentLinkId: string) {
    return this.request(API_ENDPOINTS.PAYMENT_LINKS.GET(paymentLinkId), { method: 'GET' })
  }

  async executePaymentLink(paymentLinkId: string, data: {
    txHash: string
    executedBy: string
  }) {
    return this.request(API_ENDPOINTS.PAYMENT_LINKS.EXECUTE(paymentLinkId), {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // Sync Status
  async getSyncStatus(walletAddress: string) {
    return this.request(
      `${API_ENDPOINTS.SYNC_STATUS}?walletAddress=${walletAddress}`,
      { method: 'GET' }
    )
  }

  // Metrics
  async sendMetrics(metrics: Array<{
    metric_name: string
    page_path?: string | null
    value: number
    tags: Record<string, any>
    type: string
  }>) {
    return this.request(API_ENDPOINTS.METRICS, {
      method: 'POST',
      body: JSON.stringify({ metrics }),
    })
  }
}

export const apiService = new ApiService()
export default apiService
