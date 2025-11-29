/**
 * ENS (Ethereum Name Service) utility functions
 * For resolving ENS names to addresses and vice versa
 */

/**
 * Resolve an ENS name to an Ethereum address
 * @param name ENS name (e.g., "alice.ourapp.eth")
 * @param provider Ethers provider instance
 * @returns Resolved address or null if not found
 */
export async function resolveENS(
  name: string,
  provider: any
): Promise<string | null> {
  try {
    // Check if it's already an address
    if (name.startsWith('0x') && name.length === 42) {
      return name
    }

    // Resolve ENS name
    const address = await provider.resolveName(name)
    return address
  } catch (error) {
    console.error('Error resolving ENS name:', error)
    return null
  }
}

/**
 * Reverse resolve an address to an ENS name
 * @param address Ethereum address
 * @param provider Ethers provider instance
 * @returns ENS name or null if not found
 */
export async function reverseResolveENS(
  address: string,
  provider: any
): Promise<string | null> {
  try {
    const name = await provider.lookupAddress(address)
    return name
  } catch (error) {
    console.error('Error reverse resolving address:', error)
    return null
  }
}

/**
 * Validate ENS name format
 * @param name ENS name to validate
 * @returns true if valid format
 */
export function isValidENSName(name: string): boolean {
  // Basic validation: should contain at least one dot and end with .eth
  const ensRegex = /^[a-z0-9-]+\.(eth|test)$/i
  return ensRegex.test(name) || name.startsWith('0x')
}


