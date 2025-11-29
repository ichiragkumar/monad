import { useState, useEffect } from 'react'
import { useAccount, usePublicClient } from 'wagmi'
import { TOKEN_CONTRACT_ADDRESS } from '@/config/wagmi'
import { formatUnits } from 'viem'

export interface Transaction {
  hash: string
  from: string
  to: string
  value: string
  timestamp: number
  type: 'sent' | 'received'
  status: 'pending' | 'confirmed' | 'failed'
}

// Maximum block range per request (Monad RPC limit is 100)
const MAX_BLOCK_RANGE = 100n
// Maximum blocks to look back (last 1000 blocks = ~100 chunks)
const MAX_LOOKBACK_BLOCKS = 1000n

export function useTransactionHistory() {
  const { address } = useAccount()
  const publicClient = usePublicClient()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!address || !publicClient) {
      // Try to load from localStorage
      const stored = localStorage.getItem(`transactions-${address}`)
      if (stored) {
        try {
          setTransactions(JSON.parse(stored))
        } catch (e) {
          // Ignore parse errors
        }
      }
      return
    }

    const fetchTransactions = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Get current block number
        const currentBlock = await publicClient.getBlockNumber()
        
        // Start from a reasonable recent block range (last 1000 blocks)
        const startBlock = currentBlock > MAX_LOOKBACK_BLOCKS 
          ? currentBlock - MAX_LOOKBACK_BLOCKS 
          : 0n

        // Use the Transfer event from ERC20 ABI
        const transferEvent = {
          type: 'event',
          name: 'Transfer',
          inputs: [
            { type: 'address', indexed: true, name: 'from' },
            { type: 'address', indexed: true, name: 'to' },
            { type: 'uint256', indexed: false, name: 'value' },
          ],
        } as const

        const allEvents: any[] = []
        let fromBlock = startBlock
        const toBlock = currentBlock

        // Fetch logs in chunks of MAX_BLOCK_RANGE
        while (fromBlock <= toBlock) {
          const chunkToBlock = fromBlock + MAX_BLOCK_RANGE - 1n > toBlock 
            ? toBlock 
            : fromBlock + MAX_BLOCK_RANGE - 1n

          try {
            // Get events where user is sender
            const sentEvents = await publicClient.getLogs({
              address: TOKEN_CONTRACT_ADDRESS as `0x${string}`,
              event: transferEvent,
              args: {
                from: address as `0x${string}`,
              },
              fromBlock,
              toBlock: chunkToBlock,
            })

            // Get events where user is receiver
            const receivedEvents = await publicClient.getLogs({
              address: TOKEN_CONTRACT_ADDRESS as `0x${string}`,
              event: transferEvent,
              args: {
                to: address as `0x${string}`,
              },
              fromBlock,
              toBlock: chunkToBlock,
            })

            allEvents.push(...sentEvents, ...receivedEvents)
          } catch (chunkError: any) {
            // If chunk fails, log and continue with next chunk
            console.warn(`Failed to fetch logs for blocks ${fromBlock}-${chunkToBlock}:`, chunkError.message)
            // Continue with next chunk instead of failing completely
          }

          fromBlock = chunkToBlock + 1n
        }

        // Remove duplicates by transaction hash
        const uniqueEvents = Array.from(
          new Map(allEvents.map(event => [event.transactionHash, event])).values()
        )

        // Process events in batches to avoid overwhelming the RPC
        const processedTransactions: Transaction[] = []
        
        for (let i = 0; i < uniqueEvents.length; i += 10) {
          const batch = uniqueEvents.slice(i, i + 10)
          
          const batchResults = await Promise.all(
            batch.map(async (event) => {
              try {
                const [tx, block] = await Promise.all([
                  publicClient.getTransactionReceipt({ hash: event.transactionHash }),
                  publicClient.getBlock({ blockNumber: event.blockNumber }),
                ])

                // Decode event args
                const decoded = event.args
                const from = decoded?.from || address
                const to = decoded?.to || address
                const value = decoded?.value || 0n

                const isSent = from.toLowerCase() === address?.toLowerCase()

                return {
                  hash: event.transactionHash,
                  from: typeof from === 'string' ? from : String(from).toLowerCase(),
                  to: typeof to === 'string' ? to : String(to).toLowerCase(),
                  value: formatUnits(value, 18),
                  timestamp: Number(block.timestamp),
                  type: isSent ? ('sent' as const) : ('received' as const),
                  status: tx.status === 'success' ? ('confirmed' as const) : ('failed' as const),
                } as Transaction
              } catch (err) {
                console.error('Error processing transaction:', err)
                return null
              }
            })
          )

          processedTransactions.push(...batchResults.filter((tx): tx is Transaction => tx !== null))
        }

        // Sort by timestamp descending (most recent first)
        processedTransactions.sort((a, b) => b.timestamp - a.timestamp)

        setTransactions(processedTransactions)
      } catch (err: any) {
        console.error('Error fetching transactions:', err)
        // Don't show error for RPC limitations, just use localStorage
        if (err.message?.includes('limited to') || err.message?.includes('413') || err.status === 413) {
          console.warn('RPC block range limit reached, using cached transactions')
          setError(null) // Don't show error for known RPC limitations
        } else {
          setError(err.message || 'Failed to fetch transaction history')
        }
        
        // Fallback to localStorage if available
        const stored = localStorage.getItem(`transactions-${address}`)
        if (stored) {
          try {
            setTransactions(JSON.parse(stored))
          } catch (e) {
            // Ignore parse errors
          }
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchTransactions()

    // Refresh every 60 seconds (reduced frequency to avoid RPC rate limits)
    const interval = setInterval(fetchTransactions, 60000)

    return () => clearInterval(interval)
  }, [address, publicClient])

  // Save to localStorage when transactions change
  useEffect(() => {
    if (address && transactions.length > 0) {
      localStorage.setItem(`transactions-${address}`, JSON.stringify(transactions))
    }
  }, [transactions, address])

  return {
    transactions,
    isLoading,
    error,
    refetch: () => {
      // Trigger refetch by clearing transactions
      setTransactions([])
    },
  }
}
