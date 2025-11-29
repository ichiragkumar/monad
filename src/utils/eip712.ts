/**
 * EIP-712 Typed Data Signing Utilities
 * For creating and verifying signed payment links
 */

import { TypedDataDomain } from 'viem'

export interface PaymentLinkData {
  token: string
  sender: string
  recipients: string[]
  amounts: string[]
  nonce: number
  expiry: number
}

export const PAYMENT_LINK_DOMAIN = {
  name: 'RewardLinkExecutor',
  version: '1',
} as const

export const PAYMENT_LINK_TYPES = {
  PaymentLink: [
    { name: 'token', type: 'address' },
    { name: 'sender', type: 'address' },
    { name: 'recipients', type: 'address[]' },
    { name: 'amounts', type: 'uint256[]' },
    { name: 'nonce', type: 'uint256' },
    { name: 'expiry', type: 'uint256' },
  ],
} as const

/**
 * Create EIP-712 typed data for payment link signing
 */
export function createPaymentLinkTypedData(
  chainId: number,
  contractAddress: string,
  data: PaymentLinkData
) {
  const domain: TypedDataDomain = {
    ...PAYMENT_LINK_DOMAIN,
    chainId,
    verifyingContract: contractAddress as `0x${string}`,
  }

  const message = {
    token: data.token as `0x${string}`,
    sender: data.sender as `0x${string}`,
    recipients: data.recipients as `0x${string}`[],
    amounts: data.amounts.map((amt) => BigInt(amt)),
    nonce: BigInt(data.nonce),
    expiry: BigInt(data.expiry),
  }

  return {
    domain,
    types: PAYMENT_LINK_TYPES,
    primaryType: 'PaymentLink' as const,
    message,
  }
}

/**
 * Encode payment link data into URL parameters
 */
export function encodePaymentLink(data: PaymentLinkData): string {
  const params = new URLSearchParams({
    token: data.token,
    sender: data.sender,
    recipients: data.recipients.join(','),
    amounts: data.amounts.join(','),
    nonce: data.nonce.toString(),
    expiry: data.expiry.toString(),
  })

  return params.toString()
}

/**
 * Decode payment link data from URL parameters
 */
export function decodePaymentLink(searchParams: URLSearchParams): PaymentLinkData | null {
  try {
    const token = searchParams.get('token')
    const sender = searchParams.get('sender')
    const recipients = searchParams.get('recipients')?.split(',') || []
    const amounts = searchParams.get('amounts')?.split(',') || []
    const nonce = searchParams.get('nonce')
    const expiry = searchParams.get('expiry')

    if (!token || !sender || !nonce || !expiry || recipients.length === 0 || amounts.length === 0) {
      return null
    }

    if (recipients.length !== amounts.length) {
      return null
    }

    return {
      token,
      sender,
      recipients,
      amounts,
      nonce: parseInt(nonce, 10),
      expiry: parseInt(expiry, 10),
    }
  } catch (error) {
    console.error('Error decoding payment link:', error)
    return null
  }
}

/**
 * Generate a payment link URL
 */
export function generatePaymentLinkUrl(
  baseUrl: string,
  data: PaymentLinkData
): string {
  const encoded = encodePaymentLink(data)
  return `${baseUrl}/approve-payment?${encoded}`
}

