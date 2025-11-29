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

        // Get events where user is sender
        const sentEvents = await publicClient.getLogs({
          address: TOKEN_CONTRACT_ADDRESS as `0x${string}`,
          event: transferEvent,
          args: {
            from: address as `0x${string}`,
          },
          fromBlock: 'earliest',
        })

        // Get events where user is receiver
        const receivedEvents = await publicClient.getLogs({
          address: TOKEN_CONTRACT_ADDRESS as `0x${string}`,
          event: transferEvent,
          args: {
            to: address as `0x${string}`,
          },
          fromBlock: 'earliest',
        })

        // Combine events
        const allEvents = [...sentEvents, ...receivedEvents]
        
        // Remove duplicates by transaction hash
        const uniqueEvents = Array.from(
          new Map(allEvents.map(event => [event.transactionHash, event])).values()
        )

        // Process events
        const txPromises = uniqueEvents.map(async (event) => {
          try {
            const tx = await publicClient.getTransactionReceipt({
              hash: event.transactionHash,
            })

            const block = await publicClient.getBlock({
              blockNumber: tx.blockNumber,
            })

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
              type: isSent ? 'sent' : 'received',
              status: tx.status === 'success' ? 'confirmed' : 'failed',
            } as Transaction
          } catch (err) {
            console.error('Error processing transaction:', err)
            return null
          }
        })

        const processedTxs = (await Promise.all(txPromises))
          .filter((tx): tx is Transaction => tx !== null)
          .sort((a, b) => b.timestamp - a.timestamp) // Most recent first

        setTransactions(processedTxs)
      } catch (err: any) {
        console.error('Error fetching transactions:', err)
        setError(err.message || 'Failed to fetch transaction history')
        
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

    // Refresh every 30 seconds
    const interval = setInterval(fetchTransactions, 30000)

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
