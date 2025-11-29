import { useWriteContract, useWaitForTransactionReceipt, useReadContract, useAccount } from 'wagmi'
import { parseEther } from 'ethers'
import { erc20Abi } from 'viem'
import { TOKEN_CONTRACT_ADDRESS, AIRDROP_HELPER_ADDRESS } from '@/config/wagmi'

// AirdropHelper contract address (imported from config)
const AIRDROP_HELPER = AIRDROP_HELPER_ADDRESS as `0x${string}`

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
      AIRDROP_HELPER,
    ],
    query: {
      enabled: !!address,
    },
  })

  const approveAirdropHelper = async (amount: bigint) => {
    return writeContract({
      address: TOKEN_CONTRACT_ADDRESS as `0x${string}`,
      abi: erc20Abi,
      functionName: 'approve',
      args: [AIRDROP_HELPER, amount],
    })
  }

  const airdropEqual = async (
    recipients: `0x${string}`[],
    amount: string
  ) => {
    const amountWei = parseEther(amount)

    return writeContract({
      address: AIRDROP_HELPER,
      abi: airdropHelperAbi,
      functionName: 'airdropEqual',
      args: [TOKEN_CONTRACT_ADDRESS as `0x${string}`, recipients, amountWei],
    })
  }

  const airdropVariable = async (
    recipients: `0x${string}`[],
    amounts: string[]
  ) => {
    const amountsWei = amounts.map(amt => parseEther(amt))

    return writeContract({
      address: AIRDROP_HELPER,
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

