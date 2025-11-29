import { useWriteContract, useWaitForTransactionReceipt, useReadContract, useAccount } from 'wagmi'
import { parseEther } from 'ethers'
import { erc20Abi } from 'viem'
import { TOKEN_CONTRACT_ADDRESS, AIRDROP_HELPER_ADDRESS } from '@/config/wagmi'

// AirdropHelper contract ABI
const airdropHelperAbi = [
  {
    inputs: [
      { name: 'token', type: 'address' },
      { name: 'recipients', type: 'address[]' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'airdropEqual',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'token', type: 'address' },
      { name: 'recipients', type: 'address[]' },
      { name: 'amounts', type: 'uint256[]' },
    ],
    name: 'airdropVariable',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const

// AIRDROP_HELPER_ADDRESS is imported from config

export function useAirdrop() {
  const { address } = useAccount()
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  // Check token allowance for AirdropHelper
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: TOKEN_CONTRACT_ADDRESS as `0x${string}`,
    abi: erc20Abi,
    functionName: 'allowance',
    args: [
      (address || '0x0000000000000000000000000000000000000000') as `0x${string}`,
      AIRDROP_HELPER_ADDRESS,
    ],
    query: {
      enabled: !!address && TOKEN_CONTRACT_ADDRESS !== '0x0000000000000000000000000000000000000000',
    },
  })

  const approveAirdropHelper = async (amount: bigint) => {
    if (TOKEN_CONTRACT_ADDRESS === '0x0000000000000000000000000000000000000000') {
      throw new Error('Token contract not deployed')
    }

    return writeContract({
      address: TOKEN_CONTRACT_ADDRESS as `0x${string}`,
      abi: erc20Abi,
      functionName: 'approve',
      args: [AIRDROP_HELPER_ADDRESS, amount],
    })
  }

  const airdropEqual = async (
    recipients: `0x${string}`[],
    amount: string
  ) => {
    if (AIRDROP_HELPER_ADDRESS === '0x0000000000000000000000000000000000000000') {
      throw new Error('AirdropHelper contract not deployed')
    }

    const amountWei = parseEther(amount)

    return writeContract({
      address: AIRDROP_HELPER_ADDRESS,
      abi: airdropHelperAbi,
      functionName: 'airdropEqual',
      args: [TOKEN_CONTRACT_ADDRESS as `0x${string}`, recipients, amountWei],
    })
  }

  const airdropVariable = async (
    recipients: `0x${string}`[],
    amounts: string[]
  ) => {
    if (AIRDROP_HELPER_ADDRESS === '0x0000000000000000000000000000000000000000') {
      throw new Error('AirdropHelper contract not deployed')
    }

    const amountsWei = amounts.map(amt => parseEther(amt))

    return writeContract({
      address: AIRDROP_HELPER_ADDRESS,
      abi: airdropHelperAbi,
      functionName: 'airdropVariable',
      args: [TOKEN_CONTRACT_ADDRESS as `0x${string}`, recipients, amountsWei],
    })
  }

  return {
    approveAirdropHelper,
    airdropEqual,
    airdropVariable,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
    allowance,
    refetchAllowance,
  }
}

