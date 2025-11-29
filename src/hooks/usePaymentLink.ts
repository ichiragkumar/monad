/**
 * Hook for handling payment link execution
 */

import { useAccount, useSignTypedData, useWriteContract, useWaitForTransactionReceipt, useChainId } from 'wagmi'
import { REWARD_LINK_EXECUTOR_ADDRESS } from '@/config/wagmi'
import { createPaymentLinkTypedData, PaymentLinkData } from '@/utils/eip712'

const REWARD_LINK_EXECUTOR_ABI = [
  {
    inputs: [
      { name: 'token', type: 'address' },
      { name: 'sender', type: 'address' },
      { name: 'recipients', type: 'address[]' },
      { name: 'amounts', type: 'uint256[]' },
      { name: 'nonce', type: 'uint256' },
      { name: 'expiry', type: 'uint256' },
      { name: 'signature', type: 'bytes' },
    ],
    name: 'executeLink',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'sender', type: 'address' }],
    name: 'getNonce',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const

export function usePaymentLink() {
  const { address } = useAccount()
  const chainId = useChainId()
  const { signTypedDataAsync } = useSignTypedData()
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const executePaymentLink = async (data: PaymentLinkData) => {
    if (!address) {
      throw new Error('Wallet not connected')
    }

    if (address.toLowerCase() !== data.sender.toLowerCase()) {
      throw new Error('Payment link sender does not match connected wallet')
    }

    if (Date.now() / 1000 > data.expiry) {
      throw new Error('Payment link has expired')
    }

    // Create typed data for signing
    const typedData = createPaymentLinkTypedData(
      chainId,
      REWARD_LINK_EXECUTOR_ADDRESS,
      data
    )

    // Sign the typed data
    const signature = await signTypedDataAsync(typedData)

    // Execute the payment link
    return writeContract({
      address: REWARD_LINK_EXECUTOR_ADDRESS,
      abi: REWARD_LINK_EXECUTOR_ABI,
      functionName: 'executeLink',
      args: [
        data.token as `0x${string}`,
        data.sender as `0x${string}`,
        data.recipients as `0x${string}`[],
        data.amounts.map((amt) => BigInt(amt)),
        BigInt(data.nonce),
        BigInt(data.expiry),
        signature as `0x${string}`,
      ],
    })
  }

  return {
    executePaymentLink,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  }
}

