/**
 * API Configuration
 * Backend API v1 base URL and configuration
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1'

export const API_ENDPOINTS = {
  // Users
  USERS: {
    CREATE_OR_GET: `${API_BASE_URL}/users`,
    GET_PROFILE: (walletAddress: string) => `${API_BASE_URL}/users/${walletAddress}`,
  },
  
  // Transactions
  TRANSACTIONS: {
    LIST: `${API_BASE_URL}/transactions`,
    CREATE: `${API_BASE_URL}/transactions`,
    UPDATE: (txHash: string) => `${API_BASE_URL}/transactions/${txHash}`,
    GET: (txHash: string) => `${API_BASE_URL}/transactions/${txHash}`,
    RECENT: `${API_BASE_URL}/transactions/recent`,
  },
  
  // Batch Transactions
  BATCH_TRANSACTIONS: {
    CREATE: `${API_BASE_URL}/batch-transactions`,
    LIST: `${API_BASE_URL}/batch-transactions`,
    GET: (batchId: string) => `${API_BASE_URL}/batch-transactions/${batchId}`,
  },
  
  // Rewards
  REWARDS: {
    CREATE: `${API_BASE_URL}/rewards`,
    GET_BY_EVENT: (eventId: string) => `${API_BASE_URL}/rewards/event/${eventId}`,
  },
  
  // Events
  EVENTS: {
    CREATE: `${API_BASE_URL}/events`,
    LIST: `${API_BASE_URL}/events`,
    GET: (eventId: string) => `${API_BASE_URL}/events/${eventId}`,
    UPDATE: (eventId: string) => `${API_BASE_URL}/events/${eventId}`,
    DELETE: (eventId: string) => `${API_BASE_URL}/events/${eventId}`,
    ADD_PARTICIPANTS: (eventId: string) => `${API_BASE_URL}/events/${eventId}/participants`,
    GET_PARTICIPANTS: (eventId: string) => `${API_BASE_URL}/events/${eventId}/participants`,
  },
  
  // Subscriptions
  SUBSCRIPTIONS: {
    CREATE: `${API_BASE_URL}/subscriptions`,
    LIST: `${API_BASE_URL}/subscriptions`,
    UPDATE: (subscriptionId: string) => `${API_BASE_URL}/subscriptions/${subscriptionId}`,
    RECORD_PAYMENT: (subscriptionId: string) => `${API_BASE_URL}/subscriptions/${subscriptionId}/payments`,
  },
  
  // Payment Links
  PAYMENT_LINKS: {
    GENERATE: `${API_BASE_URL}/payment-links`,
    GET: (paymentLinkId: string) => `${API_BASE_URL}/payment-links/${paymentLinkId}`,
    EXECUTE: (paymentLinkId: string) => `${API_BASE_URL}/payment-links/${paymentLinkId}/execute`,
  },
  
  // Sync Status
  SYNC_STATUS: `${API_BASE_URL}/sync/status`,
  
  // Metrics
  METRICS: `${API_BASE_URL}/metrics`,
} as const

export default API_BASE_URL

