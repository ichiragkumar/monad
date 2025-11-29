/**
 * Profile Dropdown Component
 * Shows user profile menu with options
 */

import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Store, Eye, Calendar, CreditCard, Send, LogOut, ChevronDown } from 'lucide-react'
import { useAccount, useDisconnect } from 'wagmi'
import { useAuth } from '@/contexts/AuthContext'
import { formatAddress } from '@/utils/format'
import './ProfileDropdown.css'

export default function ProfileDropdown() {
  const { address } = useAccount()
  const { disconnect } = useDisconnect()
  const { user, isVendor, viewAsUser, logout, requestVendorRole, toggleViewAsUser } = useAuth()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleRequestVendor = async () => {
    await requestVendorRole()
    setIsOpen(false)
  }

  const handleSeeAsUser = () => {
    toggleViewAsUser()
    navigate('/wallet')
    setIsOpen(false)
  }

  const handleMySubscriptions = () => {
    navigate('/subscriptions')
    setIsOpen(false)
  }

  const handleMyEventParticipants = () => {
    navigate('/my-events')
    setIsOpen(false)
  }

  const handleNextPayments = () => {
    navigate('/next-payments')
    setIsOpen(false)
  }

  const handlePaymentInitiated = () => {
    navigate('/payment-initiated')
    setIsOpen(false)
  }

  const handleLogout = () => {
    logout()
    disconnect()
    navigate('/')
    setIsOpen(false)
  }

  if (!address || !user) {
    return null
  }

  return (
    <div className="profile-dropdown-container" ref={dropdownRef}>
      <button
        className="profile-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Profile menu"
      >
        <div className="profile-avatar">
          {user.profile?.displayName?.[0]?.toUpperCase() || 
           user.walletAddress.slice(2, 3).toUpperCase()}
        </div>
        <span className="profile-name">
          {user.profile?.displayName || 
           user.ensName || 
           `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}`}
        </span>
        <ChevronDown size={16} className={`chevron ${isOpen ? 'open' : ''}`} />
      </button>

      {isOpen && (
        <div className="profile-dropdown">
          <div className="profile-header">
            <div className="profile-info">
              <div className="profile-avatar-large">
                {user.profile?.displayName?.[0]?.toUpperCase() || 
                 user.walletAddress.slice(2, 3).toUpperCase()}
              </div>
              <div className="profile-details">
                <div className="profile-display-name">
                  {user.profile?.displayName || 'User'}
                </div>
                <div className="profile-address">
                  {user.ensName || formatAddress(user.walletAddress, 10, 8)}
                </div>
                {isVendor && (
                  <div className="profile-badge vendor">
                    <Store size={12} />
                    Vendor
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="profile-menu">
            {!isVendor && (
              <button
                className="profile-menu-item"
                onClick={handleRequestVendor}
              >
                <Store size={18} />
                <span>Request for Vendor</span>
              </button>
            )}

            {isVendor && (
              <button
                className="profile-menu-item"
                onClick={handleSeeAsUser}
              >
                <Eye size={18} />
                <span>See as User</span>
              </button>
            )}

            <button
              className="profile-menu-item"
              onClick={handleMySubscriptions}
            >
              <Calendar size={18} />
              <span>My Subscriptions</span>
            </button>

            <button
              className="profile-menu-item"
              onClick={handleMyEventParticipants}
            >
              <User size={18} />
              <span>My Event Participants</span>
            </button>

            <button
              className="profile-menu-item"
              onClick={handleNextPayments}
            >
              <CreditCard size={18} />
              <span>Next Payments</span>
            </button>

            <button
              className="profile-menu-item"
              onClick={handlePaymentInitiated}
            >
              <Send size={18} />
              <span>Payment Initiated</span>
            </button>

            <div className="profile-menu-divider" />

            <button
              className="profile-menu-item danger"
              onClick={handleLogout}
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

