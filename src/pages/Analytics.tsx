/**
 * Analytics Page
 * Shows platform and vendor statistics
 */

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { BarChart3, TrendingUp, Users, Gift, Calendar } from 'lucide-react'
import { apiService } from '@/services/api'
import { useAuth } from '@/contexts/AuthContext'
import { formatUnits } from 'ethers'
import './Analytics.css'

export default function Analytics() {
  const { address } = useAccount()
  const { isVendor } = useAuth()
  const [stats, setStats] = useState<any>(null)
  const [vendorStats, setVendorStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [days, setDays] = useState(30)

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Note: Analytics endpoints not yet in v1 API
        // For now, calculate stats from transactions and events
        // TODO: Implement analytics endpoints in backend v1
        
        // Fetch transactions to calculate stats
        const txResponse = await apiService.getTransactions({
          walletAddress: address,
          limit: 1000,
        })
        
        if (txResponse.success && txResponse.data) {
          const txData = txResponse.data as any
          const transactions = Array.isArray(txData) 
            ? txData 
            : (txData?.transactions || [])
          
          // Calculate basic stats
          const calculatedStats = {
            users: {
              total: 1, // Would need separate endpoint
              newUsers: 0,
            },
            transactions: {
              total: transactions.length,
              volume: transactions.reduce((sum: number, tx: any) => {
                return sum + parseFloat(tx.amount || '0')
              }, 0).toString(),
              byType: [],
              daily: [],
            },
            events: {
              total: 0,
              active: 0,
            },
            airdrops: {
              total: 0,
              totalVolume: '0',
            },
          }
          
          setStats(calculatedStats)
        }

        // Fetch vendor stats if user is a vendor
        if (isVendor && address) {
          const eventsResponse = await apiService.getVendorEvents(address)
          if (eventsResponse.success && eventsResponse.data) {
            const events = Array.isArray(eventsResponse.data)
              ? eventsResponse.data
              : ((eventsResponse.data as any)?.events || [])
            
            const vendorCalculatedStats = {
              events: {
                total: events.length,
                active: events.filter((e: any) => e.status === 'ACTIVE' || e.status === 'active').length,
              },
              airdrops: {
                total: 0, // Would need rewards endpoint
                totalVolume: '0',
                totalRecipients: 0,
              },
            }
            
            setVendorStats(vendorCalculatedStats)
          }
        }
      } catch (err: any) {
        console.error('Error fetching stats:', err)
        setError(err.message || 'Failed to fetch statistics')
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [days, isVendor, address])

  const formatAmount = (amount: string) => {
    try {
      return parseFloat(formatUnits(amount, 18)).toFixed(2)
    } catch {
      return '0.00'
    }
  }

  if (!address) {
    return (
      <div className="analytics-container">
        <div className="connect-prompt">
          <h2>Connect Your Wallet</h2>
          <p>Please connect your wallet to view analytics.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <h1>
          <BarChart3 size={28} />
          Analytics Dashboard
        </h1>
        <div className="period-selector">
          <label>Period:</label>
          <select
            value={days}
            onChange={(e) => setDays(parseInt(e.target.value))}
            className="period-select"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
            <option value={365}>Last year</option>
          </select>
        </div>
      </div>

      {isLoading && (
        <div className="loading-state">
          <div className="spinner" />
          <p>Loading analytics...</p>
        </div>
      )}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {stats && (
        <>
          {/* Platform Stats */}
          <div className="stats-section">
            <h2>Platform Statistics</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">
                  <Users size={24} />
                </div>
                <div className="stat-content">
                  <div className="stat-value">
                    {stats.users?.total || stats.data?.users?.total || 0}
                  </div>
                  <div className="stat-label">Total Users</div>
                  <div className="stat-change">
                    +{stats.users?.newUsers || stats.data?.users?.newUsers || 0} new
                  </div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">
                  <Gift size={24} />
                </div>
                <div className="stat-content">
                  <div className="stat-value">
                    {stats.transactions?.total || stats.data?.transactions?.total || 0}
                  </div>
                  <div className="stat-label">Total Transactions</div>
                  <div className="stat-change">
                    {formatAmount(
                      stats.transactions?.volume ||
                        stats.data?.transactions?.volume ||
                        '0'
                    )}{' '}
                    XTK
                  </div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">
                  <Calendar size={24} />
                </div>
                <div className="stat-content">
                  <div className="stat-value">
                    {stats.events?.total || stats.data?.events?.total || 0}
                  </div>
                  <div className="stat-label">Total Events</div>
                  <div className="stat-change">
                    {stats.events?.active || stats.data?.events?.active || 0} active
                  </div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">
                  <TrendingUp size={24} />
                </div>
                <div className="stat-content">
                  <div className="stat-value">
                    {stats.airdrops?.total || stats.data?.airdrops?.total || 0}
                  </div>
                  <div className="stat-label">Total Airdrops</div>
                  <div className="stat-change">
                    {formatAmount(
                      stats.airdrops?.totalVolume ||
                        stats.data?.airdrops?.totalVolume ||
                        '0'
                    )}{' '}
                    XTK
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Transaction Types Breakdown */}
          {stats.transactions?.byType && (
            <div className="breakdown-section">
              <h2>Transaction Types</h2>
              <div className="breakdown-list">
                {stats.transactions.byType.map((type: any, index: number) => (
                  <div key={index} className="breakdown-item">
                    <div className="breakdown-label">{type.type}</div>
                    <div className="breakdown-bar">
                      <div
                        className="breakdown-fill"
                        style={{
                          width: `${
                            (type.count /
                              (stats.transactions?.total || 1)) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                    <div className="breakdown-value">
                      {type.count} ({formatAmount(type.volume)} XTK)
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Daily Transaction Chart */}
          {stats.transactions?.daily && (
            <div className="chart-section">
              <h2>Daily Transactions</h2>
              <div className="chart-container">
                {stats.transactions.daily.map((day: any, index: number) => (
                  <div key={index} className="chart-bar-wrapper">
                    <div className="chart-bar-label">{day.date}</div>
                    <div className="chart-bar">
                      <div
                        className="chart-bar-fill"
                        style={{
                          height: `${
                            (day.count /
                              Math.max(
                                ...stats.transactions.daily.map(
                                  (d: any) => d.count
                                )
                              )) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                    <div className="chart-bar-value">{day.count}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Vendor Stats */}
      {isVendor && vendorStats && (
        <div className="vendor-stats-section">
          <h2>Your Vendor Statistics</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">
                <Calendar size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-value">
                  {vendorStats.events?.total || 0}
                </div>
                <div className="stat-label">Your Events</div>
                <div className="stat-change">
                  {vendorStats.events?.active || 0} active
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <Gift size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-value">
                  {vendorStats.airdrops?.total || 0}
                </div>
                <div className="stat-label">Airdrops Executed</div>
                <div className="stat-change">
                  {formatAmount(
                    vendorStats.airdrops?.totalVolume || '0'
                  )}{' '}
                  XTK
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <Users size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-value">
                  {vendorStats.airdrops?.totalRecipients || 0}
                </div>
                <div className="stat-label">Total Recipients</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

