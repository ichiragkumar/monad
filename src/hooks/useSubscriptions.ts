/**
 * Hook for managing subscriptions
 */

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { SUBSCRIPTION_SCHEDULER_ADDRESS, TOKEN_CONTRACT_ADDRESS } from '@/config/wagmi'
import { parseEther } from 'ethers'

const SUBSCRIPTION_SCHEDULER_ABI = [
  {
    inputs: [
      { name: 'token', type: 'address' },
      { name: 'recipient', type: 'address' },
      { name: 'amount', type: 'uint256' },
      { name: 'interval', type: 'uint256' },
      { name: 'totalPayments', type: 'uint256' },
      { name: 'startTime', type: 'uint256' },
    ],
    name: 'createSubscription',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'subscriptionId', type: 'uint256' }],
    name: 'executePayment',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'subscriptionIds', type: 'uint256[]' }],
    name: 'executeBatchPayments',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'subscriptionId', type: 'uint256' }],
    name: 'cancelSubscription',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'subscriptionId', type: 'uint256' }],
    name: 'pauseSubscription',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'subscriptionId', type: 'uint256' }],
    name: 'resumeSubscription',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'subscriptionId', type: 'uint256' }],
    name: 'getSubscription',
    outputs: [
      {
        components: [
          { name: 'token', type: 'address' },
          { name: 'payer', type: 'address' },
          { name: 'recipient', type: 'address' },
          { name: 'amount', type: 'uint256' },
          { name: 'interval', type: 'uint256' },
          { name: 'nextPaymentTime', type: 'uint256' },
          { name: 'totalPayments', type: 'uint256' },
          { name: 'paidCount', type: 'uint256' },
          { name: 'active', type: 'bool' },
        ],
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'user', type: 'address' }],
    name: 'getUserSubscriptions',
    outputs: [{ name: '', type: 'uint256[]' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const

export interface Subscription {
  token: string
  payer: string
  recipient: string
  amount: bigint
  interval: bigint
  nextPaymentTime: bigint
  totalPayments: bigint
  paidCount: bigint
  active: boolean
}

export function useSubscriptions() {
  const { address } = useAccount()
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  // Get user's subscriptions
  const { data: subscriptionIds, refetch: refetchSubscriptionIds } = useReadContract({
    address: SUBSCRIPTION_SCHEDULER_ADDRESS,
    abi: SUBSCRIPTION_SCHEDULER_ABI,
    functionName: 'getUserSubscriptions',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  })

  const createSubscription = async (
    recipient: string,
    amount: string,
    interval: number, // in seconds
    totalPayments: number = 0, // 0 for unlimited
    startTime: number = 0 // 0 for immediate
  ) => {
    if (!address) {
      throw new Error('Wallet not connected')
    }

    const amountWei = parseEther(amount)

    return writeContract({
      address: SUBSCRIPTION_SCHEDULER_ADDRESS,
      abi: SUBSCRIPTION_SCHEDULER_ABI,
      functionName: 'createSubscription',
      args: [
        TOKEN_CONTRACT_ADDRESS,
        recipient as `0x${string}`,
        amountWei,
        BigInt(interval),
        BigInt(totalPayments),
        BigInt(startTime),
      ],
    })
  }

  const executePayment = async (subscriptionId: number) => {
    return writeContract({
      address: SUBSCRIPTION_SCHEDULER_ADDRESS,
      abi: SUBSCRIPTION_SCHEDULER_ABI,
      functionName: 'executePayment',
      args: [BigInt(subscriptionId)],
    })
  }

  const executeBatchPayments = async (subscriptionIds: number[]) => {
    return writeContract({
      address: SUBSCRIPTION_SCHEDULER_ADDRESS,
      abi: SUBSCRIPTION_SCHEDULER_ABI,
      functionName: 'executeBatchPayments',
      args: [subscriptionIds.map((id) => BigInt(id))],
    })
  }

  const cancelSubscription = async (subscriptionId: number) => {
    return writeContract({
      address: SUBSCRIPTION_SCHEDULER_ADDRESS,
      abi: SUBSCRIPTION_SCHEDULER_ABI,
      functionName: 'cancelSubscription',
      args: [BigInt(subscriptionId)],
    })
  }

  const pauseSubscription = async (subscriptionId: number) => {
    return writeContract({
      address: SUBSCRIPTION_SCHEDULER_ADDRESS,
      abi: SUBSCRIPTION_SCHEDULER_ABI,
      functionName: 'pauseSubscription',
      args: [BigInt(subscriptionId)],
    })
  }

  const resumeSubscription = async (subscriptionId: number) => {
    return writeContract({
      address: SUBSCRIPTION_SCHEDULER_ADDRESS,
      abi: SUBSCRIPTION_SCHEDULER_ABI,
      functionName: 'resumeSubscription',
      args: [BigInt(subscriptionId)],
    })
  }

  return {
    createSubscription,
    executePayment,
    executeBatchPayments,
    cancelSubscription,
    pauseSubscription,
    resumeSubscription,
    subscriptionIds: subscriptionIds as bigint[] | undefined,
    refetchSubscriptionIds,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  }
}

