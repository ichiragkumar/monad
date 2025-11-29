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
  role?: 'USER' | 'VENDOR'
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
  viewAsUser: boolean
  login: () => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
  requestVendorRole: () => Promise<void>
  toggleViewAsUser: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const { address, isConnected } = useAccount()
  const { signMessageAsync } = useSignMessage()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [viewAsUser, setViewAsUser] = useState(false) // Toggle to view as user even if vendor

  const login = async () => {
    if (!address || !isConnected) return

    try {
      setIsLoading(true)

      // Create EIP-712 message for authentication
      const timestamp = Math.floor(Date.now() / 1000)
      const message = `Sign in to PayMint\n\nTimestamp: ${timestamp}\nAddress: ${address}`

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
          role: userData.role || 'USER',
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
          role: userData.role || 'USER',
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

  // Determine if user is vendor based on role from backend
  const isVendor = user?.role === 'VENDOR'

  const requestVendorRole = async () => {
    if (!address) return
    
    try {
      // Prompt user for business details
      const businessName = prompt('Enter your business name:')
      if (!businessName) return

      const description = prompt('Enter business description (optional):') || undefined
      const website = prompt('Enter website URL (optional):') || undefined

      // Create EIP-712 message for vendor request
      const timestamp = Math.floor(Date.now() / 1000)
      const message = `Request vendor role for MonadPay\n\nBusiness: ${businessName}\nTimestamp: ${timestamp}\nAddress: ${address}`

      // Sign message
      const signature = await signMessageAsync({ message })

      // Submit vendor request
      await apiService.requestVendorRole(
        address,
        businessName,
        description,
        website,
        signature,
        message,
        timestamp
      )

      alert('Vendor role request submitted! We will review your request.')
      await refreshUser() // Refresh to check if role was updated
    } catch (error) {
      console.error('Error requesting vendor role:', error)
      alert('Failed to submit vendor request. Please try again.')
    }
  }

  const toggleViewAsUser = () => {
    setViewAsUser(!viewAsUser)
  }

  // Show vendor dashboard only if user is vendor and not viewing as user
  const shouldShowVendor = isVendor && !viewAsUser

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        isVendor,
        viewAsUser,
        login,
        logout,
        refreshUser,
        requestVendorRole,
        toggleViewAsUser,
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
