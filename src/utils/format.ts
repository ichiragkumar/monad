/**
 * Formatting utility functions
 */

/**
 * Format an Ethereum address for display
 * @param address Full address
 * @param startLength Number of characters to show at start (default: 6)
 * @param endLength Number of characters to show at end (default: 4)
 * @returns Formatted address (e.g., "0x1234...5678")
 */
export function formatAddress(
  address: string,
  startLength: number = 6,
  endLength: number = 4
): string {
  if (!address || address.length < startLength + endLength) {
    return address
  }
  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`
}

/**
 * Format a token amount for display
 * @param amount Amount in wei or smallest unit
 * @param decimals Token decimals (default: 18)
 * @param displayDecimals Number of decimal places to show (default: 4)
 * @returns Formatted amount string
 */
export function formatTokenAmount(
  amount: bigint | string,
  decimals: number = 18,
  displayDecimals: number = 4
): string {
  const amountStr = typeof amount === 'string' ? amount : amount.toString()
  const divisor = BigInt(10 ** decimals)
  const whole = BigInt(amountStr) / divisor
  const remainder = BigInt(amountStr) % divisor
  
  if (remainder === 0n) {
    return whole.toString()
  }
  
  const remainderStr = remainder.toString().padStart(decimals, '0')
  const trimmed = remainderStr.slice(0, displayDecimals).replace(/0+$/, '')
  
  if (trimmed === '') {
    return whole.toString()
  }
  
  return `${whole}.${trimmed}`
}

/**
 * Format a timestamp to a readable date string
 * @param timestamp Unix timestamp (seconds)
 * @returns Formatted date string
 */
export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleString()
}

/**
 * Format a transaction hash for display
 * @param hash Transaction hash
 * @returns Formatted hash
 */
export function formatTxHash(hash: string): string {
  return formatAddress(hash, 10, 8)
}


