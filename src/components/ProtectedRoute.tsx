import { Navigate } from 'react-router-dom'
import { useAccount } from 'wagmi'

interface ProtectedRouteProps {
  children: React.ReactNode
}

/**
 * ProtectedRoute component that redirects to home if wallet is not connected
 */
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isConnected } = useAccount()

  if (!isConnected) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

