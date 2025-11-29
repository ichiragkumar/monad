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
  amount: bigint | string | null | undefined,
  decimals: number = 18,
  displayDecimals: number = 4
): string {
  // Handle null, undefined, or empty values
  if (amount === null || amount === undefined || amount === '') {
    return '0'
  }

  try {
    const amountStr = typeof amount === 'string' ? amount.trim() : amount.toString()
    
    // Check if string is valid number
    if (typeof amount === 'string' && (isNaN(Number(amountStr)) || amountStr === '')) {
      return '0'
    }

    // Ensure the string represents a valid integer
    if (typeof amount === 'string' && !/^\d+$/.test(amountStr)) {
      return '0'
    }

    const divisor = BigInt(10 ** decimals)
    const amountBigInt = BigInt(amountStr)
    const whole = amountBigInt / divisor
    const remainder = amountBigInt % divisor
    
    if (remainder === 0n) {
      return whole.toString()
    }
    
    const remainderStr = remainder.toString().padStart(decimals, '0')
    const trimmed = remainderStr.slice(0, displayDecimals).replace(/0+$/, '')
    
    if (trimmed === '') {
      return whole.toString()
    }
    
    return `${whole}.${trimmed}`
  } catch (error) {
    console.error('Error formatting token amount:', error, amount)
    return '0'
  }
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


