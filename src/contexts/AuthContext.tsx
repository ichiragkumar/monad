/**
 * Authentication Context
 * Manages user authentication state with EIP-712 signature
 */

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useAccount } from 'wagmi'
import { useSignMessage } from 'wagmi'
import { apiService } from '@/services/api'

interface User {
  userId: string
  walletAddress: string
  ensName: string | null
  createdAt: string
  lastSeenAt: string
  profile?: {
    displayName?: string
    avatar?: string
  }
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  isVendor: boolean
  login: () => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const { address, isConnected } = useAccount()
  const { signMessageAsync } = useSignMessage()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false) // Start as false, set true only when needed

  const login = async () => {
    if (!address || !isConnected) return

    try {
      setIsLoading(true)

      // Create EIP-712 message for authentication
      const timestamp = Math.floor(Date.now() / 1000)
      const message = `Sign in to MonadPay\n\nTimestamp: ${timestamp}\nAddress: ${address}`

      // Sign message
      const signature = await signMessageAsync({ message })

      // Create or get user with signature
      const response = await apiService.createOrGetUser(
        address,
        signature,
        message,
        timestamp
      )

      if (response.success && response.data) {
        const userData = response.data as any
        setUser({
          userId: userData.userId || userData.id || '',
          walletAddress: userData.walletAddress || userData.address || address || '',
          ensName: userData.ensName || null,
          createdAt: userData.createdAt || new Date().toISOString(),
          lastSeenAt: userData.lastSeenAt || userData.createdAt || new Date().toISOString(),
          profile: userData.profile,
        })
      }
    } catch (error) {
      console.error('Login error:', error)
      // Don't throw - allow user to continue without backend auth
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
  }

  const refreshUser = async () => {
    if (!address) return

    try {
      const response = await apiService.getUserProfile(address)
      if (response.success && response.data) {
        const userData = response.data as any
        setUser({
          userId: userData.userId || userData.id || '',
          walletAddress: userData.walletAddress || userData.address || address || '',
          ensName: userData.ensName || null,
          createdAt: userData.createdAt || new Date().toISOString(),
          lastSeenAt: userData.lastSeenAt || userData.createdAt || new Date().toISOString(),
          profile: userData.profile,
        })
      }
    } catch (error) {
      console.error('Refresh user error:', error)
      // If profile fetch fails, try to login again
      if (isConnected && address) {
        await login()
      }
    }
  }

  useEffect(() => {
    if (isConnected && address) {
      // Try to get user profile first (if already registered)
      refreshUser().catch(() => {
        // If profile fetch fails, login (which will register if needed)
        login().catch(console.error)
      })
    } else {
      setUser(null)
      setIsLoading(false)
    }
  }, [isConnected, address])

  // Determine if user is vendor (can be based on role or other criteria)
  const isVendor = false // TODO: Add vendor role check when backend supports it

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        isVendor,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
