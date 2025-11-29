import { useState, useEffect } from 'react'
import { useAccount, useBalance, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther, formatEther, formatUnits } from 'ethers'
import { Send, History, Copy, Check, ExternalLink, User } from 'lucide-react'
import { TOKEN_CONTRACT_ADDRESS } from '@/config/wagmi'
import { erc20Abi } from 'viem'
import Faucet from '@/components/Faucet'
import ENSRegistration from '@/components/ENSRegistration'
import './Wallet.css'

interface Transaction {
  hash: string
  from: string
  to: string
  value: string
  timestamp: number
}

export default function Wallet() {
  const { address, isConnected, chain } = useAccount()
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [copied, setCopied] = useState(false)
  const [ensName, setEnsName] = useState<string | null>(null)
  const [showENSRegistration, setShowENSRegistration] = useState(false)

  // Load ENS name from localStorage (in production, fetch from ENS resolver)
  useEffect(() => {
    if (address) {
      const stored = localStorage.getItem(`ens-${address}`)
      if (stored) {
        setEnsName(stored)
      }
    }
  }, [address])

  // Get native token balance (for gas)
  const { data: nativeBalance } = useBalance({
    address,
  })

  // Get token balance
  const { data: tokenBalance, refetch: refetchTokenBalance } = useBalance({
    address,
    token: TOKEN_CONTRACT_ADDRESS !== '0x0000000000000000000000000000000000000000' 
      ? TOKEN_CONTRACT_ADDRESS 
      : undefined,
  })

  // Write contract for token transfer
  const { 
    data: hash, 
    writeContract, 
    isPending, 
    error: writeError 
  } = useWriteContract()

  const { isLoading: isConfirming, isSuccess: isConfirmed } = 
    useWaitForTransactionReceipt({
      hash,
    })

  // Handle token transfer
  const handleSend = async () => {
    if (!address || !recipient || !amount) return

    try {
      const amountWei = parseEther(amount)
      
      writeContract({
        address: TOKEN_CONTRACT_ADDRESS as `0x${string}`,
        abi: erc20Abi,
        functionName: 'transfer',
        args: [recipient as `0x${string}`, amountWei],
      })
    } catch (err) {
      console.error('Error sending tokens:', err)
    }
  }

  // Reset form and refetch balance after successful transaction
  useEffect(() => {
    if (isConfirmed) {
      setRecipient('')
      setAmount('')
      refetchTokenBalance()
      // TODO: Fetch transaction history
    }
  }, [isConfirmed, refetchTokenBalance])

  // Copy address to clipboard
  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // Format address for display
  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  if (!isConnected) {
    return (
      <div className="wallet-container">
        <div className="connect-prompt">
          <h2>Connect Your Wallet</h2>
          <p>Please connect your wallet to view your balance and send payments.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="wallet-container">
      <div className="wallet-header">
        <h1>Wallet</h1>
        <div className="network-badge">
          {chain?.name || 'Unknown Network'}
        </div>
      </div>

      <div className="wallet-content">
        {/* Balance Card */}
        <div className="balance-card">
          <div className="balance-header">
            <h2>Your Balance</h2>
            <div className="address-section">
              <button 
                className="address-display" 
                onClick={copyAddress}
                title="Copy address"
              >
                {ensName || formatAddress(address || '')}
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </button>
              {!ensName && (
                <button
                  className="btn-ens-register"
                  onClick={() => setShowENSRegistration(true)}
                  title="Claim ENS name"
                >
                  <User size={16} />
                  Get ENS Name
                </button>
              )}
            </div>
          </div>
          
          <div className="balance-amount">
            <div className="token-balance">
              <span className="balance-label">X Token</span>
              <span className="balance-value">
                {tokenBalance 
                  ? parseFloat(formatUnits(tokenBalance.value, tokenBalance.decimals)).toFixed(4)
                  : '0.0000'}
              </span>
            </div>
            <div className="native-balance">
              <span className="balance-label">{nativeBalance?.symbol || 'ETH'}</span>
              <span className="balance-value">
                {nativeBalance 
                  ? parseFloat(formatEther(nativeBalance.value)).toFixed(6)
                  : '0.000000'}
              </span>
              <span className="balance-note">(for gas fees)</span>
            </div>
          </div>
        </div>

        {/* Faucet Card - Show if balance is low or zero */}
        {(!tokenBalance || parseFloat(formatUnits(tokenBalance.value, tokenBalance.decimals)) < 1) && (
          <Faucet onSuccess={refetchTokenBalance} />
        )}

        {/* Send Tokens Card */}
        <div className="send-card">
          <h2>
            <Send size={24} />
            Send Tokens
          </h2>
          
          <div className="send-form">
            <div className="form-group">
              <label htmlFor="recipient">Recipient Address or ENS Name</label>
              <input
                id="recipient"
                type="text"
                placeholder="0x... or name.ourapp.eth"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="amount">Amount (X Token)</label>
              <input
                id="amount"
                type="number"
                step="0.0001"
                min="0"
                placeholder="0.0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="input"
              />
              {tokenBalance && (
                <button
                  className="max-button"
                  onClick={() => setAmount(formatUnits(tokenBalance.value, tokenBalance.decimals))}
                >
                  Max
                </button>
              )}
            </div>

            {writeError && (
              <div className="error-message">
                {writeError.message || 'Transaction failed'}
              </div>
            )}

            <button
              className="btn btn-primary btn-send"
              onClick={handleSend}
              disabled={!recipient || !amount || isPending || isConfirming}
            >
              {isPending || isConfirming 
                ? 'Processing...' 
                : isConfirmed 
                  ? 'Sent!' 
                  : 'Send Tokens'}
            </button>

            {hash && (
              <a
                href={`${chain?.blockExplorers?.default?.url}/tx/${hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="tx-link"
              >
                View on Explorer <ExternalLink size={16} />
              </a>
            )}
          </div>
        </div>

        {/* Transaction History */}
        <div className="history-card">
          <h2>
            <History size={24} />
            Recent Transactions
          </h2>
          {transactions.length === 0 ? (
            <div className="empty-state">
              <p>No transactions yet</p>
              <p className="empty-note">
                Your transaction history will appear here
              </p>
            </div>
          ) : (
            <div className="transaction-list">
              {transactions.map((tx) => (
                <div key={tx.hash} className="transaction-item">
                  <div className="tx-info">
                    <div className="tx-type">
                      {tx.from.toLowerCase() === address?.toLowerCase() 
                        ? 'Sent' 
                        : 'Received'}
                    </div>
                    <div className="tx-address">
                      {tx.from.toLowerCase() === address?.toLowerCase() 
                        ? `To: ${formatAddress(tx.to)}`
                        : `From: ${formatAddress(tx.from)}`}
                    </div>
                    <div className="tx-time">
                      {new Date(tx.timestamp * 1000).toLocaleString()}
                    </div>
                  </div>
                  <div className="tx-amount">
                    {formatEther(tx.value)} X Token
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <ENSRegistration
        isOpen={showENSRegistration}
        onClose={() => setShowENSRegistration(false)}
        onSuccess={(name) => {
          setEnsName(name)
          if (address) {
            localStorage.setItem(`ens-${address}`, name)
          }
        }}
      />
    </div>
  )
}

