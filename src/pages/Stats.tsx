import { useState, useEffect, useMemo } from 'react'
import { getGroupBalances } from '../utils/api'
import type { MemberBalance, Settlement, BalanceData } from '../utils/api'
import { getCurrentGroupName } from '../utils/groupSession'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'
import { Bar, Pie } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

const Stats = () => {
  const [selectedGroupName, setSelectedGroupName] = useState<string>('')
  const [selectedMemberName, setSelectedMemberName] = useState<string>('all')
  const [balanceData, setBalanceData] = useState<BalanceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [balanceLoading, setBalanceLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Get current group from session storage on component mount
  useEffect(() => {
    try {
      setError(null)
      const currentGroupName = getCurrentGroupName()

      if (!currentGroupName) {
        setError('No group selected. Please select a group from the dashboard first.')
        setLoading(false)
        return
      }

      setSelectedGroupName(currentGroupName)
      setLoading(false)
    } catch (error) {
      console.error('Failed to get current group:', error)
      setError('Failed to load current group context')
      setLoading(false)
    }
  }, [])

  // Fetch balance data when group selection changes
  useEffect(() => {
    const fetchBalanceData = async () => {
      if (!selectedGroupName) {
        setBalanceData(null)
        return
      }

      try {
        setBalanceLoading(true)
        setError(null)

        const response = await getGroupBalances(selectedGroupName)

        if (!response.success) {
          throw new Error(response.error || 'Failed to fetch balance data')
        }

        const data = response.data?.data || response.data
        setBalanceData(data)

      } catch (error) {
        console.error('Failed to fetch balance data:', error)
        setError(error instanceof Error ? error.message : 'Failed to load balance data')
        setBalanceData(null)
      } finally {
        setBalanceLoading(false)
      }
    }

    fetchBalanceData()
  }, [selectedGroupName])

  // Get unique member names for filtering
  const memberNames = useMemo(() => {
    if (!balanceData) return []
    return balanceData.balances.map(balance => balance.memberName)
  }, [balanceData])

  // Filter data based on selected member
  const filteredBalances = useMemo(() => {
    if (!balanceData) return []
    if (selectedMemberName === 'all') return balanceData.balances
    return balanceData.balances.filter(balance => balance.memberName === selectedMemberName)
  }, [balanceData, selectedMemberName])

  const filteredSettlements = useMemo(() => {
    if (!balanceData) return []
    if (selectedMemberName === 'all') return balanceData.settlements
    return balanceData.settlements.filter(settlement =>
      settlement.from === selectedMemberName || settlement.to === selectedMemberName
    )
  }, [balanceData, selectedMemberName])

  // Calculate total stats
  const totalStats = useMemo(() => {
    if (!balanceData) return { totalPaid: 0, totalOwed: 0, totalSettlements: 0 }

    const totalPaid = balanceData.balances.reduce((sum, balance) => sum + balance.totalPaid, 0)
    const totalOwed = balanceData.balances.reduce((sum, balance) => sum + Math.abs(balance.netBalance), 0) / 2 // Divide by 2 to avoid double counting
    const totalSettlements = balanceData.settlements.reduce((sum, settlement) => sum + settlement.amount, 0)

    return { totalPaid, totalOwed, totalSettlements }
  }, [balanceData])

  // Chart data configurations
  const balanceChartData = useMemo(() => {
    if (!balanceData) return null

    const data = filteredBalances.map(balance => balance.netBalance)
    const labels = filteredBalances.map(balance => balance.memberName)

    return {
      labels,
      datasets: [
        {
          label: 'Net Balance',
          data,
          backgroundColor: data.map(value =>
            value >= 0
              ? 'rgba(34, 197, 94, 0.7)' // Green for positive (owed money)
              : 'rgba(239, 68, 68, 0.7)'  // Red for negative (owes money)
          ),
          borderColor: data.map(value =>
            value >= 0
              ? 'rgba(34, 197, 94, 1)'
              : 'rgba(239, 68, 68, 1)'
          ),
          borderWidth: 1,
        },
      ],
    }
  }, [filteredBalances])

  const expenseDistributionData = useMemo(() => {
    if (!balanceData) return null

    const data = filteredBalances.map(balance => balance.totalPaid)
    const labels = filteredBalances.map(balance => balance.memberName)

    // Generate colors for each member
    const colors = [
      'rgba(59, 130, 246, 0.7)',   // Blue
      'rgba(16, 185, 129, 0.7)',   // Green
      'rgba(245, 158, 11, 0.7)',   // Yellow
      'rgba(239, 68, 68, 0.7)',    // Red
      'rgba(139, 92, 246, 0.7)',   // Purple
      'rgba(236, 72, 153, 0.7)',   // Pink
    ]

    return {
      labels,
      datasets: [
        {
          label: 'Total Paid',
          data,
          backgroundColor: colors.slice(0, data.length),
          borderColor: colors.slice(0, data.length).map(color => color.replace('0.7', '1')),
          borderWidth: 1,
        },
      ],
    }
  }, [filteredBalances])

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const value = context.parsed.y || context.parsed
            return `${context.label}: $${value.toFixed(2)}`
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: any) => `$${value.toFixed(2)}`,
        },
      },
    },
  }

  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const value = context.parsed
            return `${context.label}: $${value.toFixed(2)}`
          },
        },
      },
    },
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-light-on-surface-variant">Loading stats...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-2xl text-red-600">error</span>
          </div>
          <h3 className="text-lg font-headline font-bold text-light-on-surface mb-2">
            Error Loading Stats
          </h3>
          <p className="text-light-on-surface-variant mb-4">{error}</p>
        </div>
      </div>
    )
  }

  if (!selectedGroupName) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-2xl text-secondary">analytics</span>
          </div>
          <h3 className="text-lg font-headline font-bold text-light-on-surface mb-2">
            No Group Selected
          </h3>
          <p className="text-light-on-surface-variant">
            Please select a group from the dashboard first to view expense statistics.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-headline font-bold text-light-on-surface">
            Statistics
          </h1>
          <p className="text-light-on-surface-variant">
            Group expense analytics and balance overview
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg editorial-shadow border border-transparent">
        <h2 className="text-lg font-headline font-bold text-light-on-surface mb-4">
          Filters
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Group Display */}
          <div>
            <label className="block text-sm font-medium text-light-on-surface mb-2">
              Group
            </label>
            <div className="w-full px-3 py-2 border border-light-outline bg-light-surface-variant/50 text-light-on-surface rounded-md">
              {selectedGroupName || 'No group selected'}
            </div>
          </div>

          {/* Member Selection */}
          <div>
            <label className="block text-sm font-medium text-light-on-surface mb-2">
              Filter by Member
            </label>
            <select
              value={selectedMemberName}
              onChange={(e) => setSelectedMemberName(e.target.value)}
              disabled={memberNames.length === 0}
              className="w-full px-3 py-2 border border-light-outline bg-light-surface-variant text-light-on-surface rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="all">All Members</option>
              {memberNames.map((memberName) => (
                <option key={memberName} value={memberName}>
                  {memberName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {balanceLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-light-on-surface-variant">Loading balance data...</p>
          </div>
        </div>
      ) : balanceData ? (
        <>
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg editorial-shadow border border-transparent">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-light-on-surface-variant mb-1">
                    Total Spent
                  </p>
                  <p className="text-2xl font-headline font-bold text-light-on-surface">
                    ${totalStats.totalPaid.toFixed(2)}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl text-primary">payments</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg editorial-shadow border border-transparent">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-light-on-surface-variant mb-1">
                    Outstanding Balance
                  </p>
                  <p className="text-2xl font-headline font-bold text-light-on-surface">
                    ${totalStats.totalOwed.toFixed(2)}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl text-secondary">account_balance</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg editorial-shadow border border-transparent">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-light-on-surface-variant mb-1">
                    Pending Settlements
                  </p>
                  <p className="text-2xl font-headline font-bold text-light-on-surface">
                    ${totalStats.totalSettlements.toFixed(2)}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl text-yellow-600">sync_alt</span>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          {balanceChartData && filteredBalances.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Net Balance Chart */}
              <div className="bg-white p-6 rounded-lg editorial-shadow border border-transparent">
                <h3 className="text-lg font-headline font-bold text-light-on-surface mb-4">
                  Member Net Balances
                </h3>
                <div className="h-64">
                  <Bar data={balanceChartData} options={chartOptions} />
                </div>
                <p className="text-xs text-light-on-surface-variant mt-2">
                  Green bars show members who are owed money, red bars show members who owe money.
                </p>
              </div>

              {/* Expense Distribution Chart */}
              {expenseDistributionData && (
                <div className="bg-white p-6 rounded-lg editorial-shadow border border-transparent">
                  <h3 className="text-lg font-headline font-bold text-light-on-surface mb-4">
                    Payment Distribution
                  </h3>
                  <div className="h-64">
                    <Pie data={expenseDistributionData} options={pieChartOptions} />
                  </div>
                  <p className="text-xs text-light-on-surface-variant mt-2">
                    Shows the total amount each member has paid for expenses.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Member Balances */}
          <div className="bg-white p-6 rounded-lg editorial-shadow border border-transparent">
            <h2 className="text-lg font-headline font-bold text-light-on-surface mb-4">
              Member Balances
              {selectedMemberName !== 'all' && (
                <span className="ml-2 px-3 py-1 text-sm bg-primary/10 text-primary rounded-full">
                  Filtered: {selectedMemberName}
                </span>
              )}
            </h2>

            {filteredBalances.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-light-on-surface-variant">
                  No balance data available for the selected filters.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredBalances.map((balance) => (
                  <div
                    key={balance.memberName}
                    className="flex items-center justify-between p-4 bg-light-surface-variant rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="material-symbols-outlined text-lg text-primary">person</span>
                      </div>
                      <div>
                        <h3 className="font-medium text-light-on-surface">
                          {balance.memberName}
                        </h3>
                        <div className="text-xs text-light-on-surface-variant space-x-4">
                          <span>Paid: ${balance.totalPaid.toFixed(2)}</span>
                          <span>Owes: ${balance.totalOwes.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${
                        balance.netBalance >= 0
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}>
                        {balance.netBalance >= 0 ? '+' : ''}${balance.netBalance.toFixed(2)}
                      </div>
                      <p className="text-xs text-light-on-surface-variant">
                        {balance.netBalance >= 0 ? 'Is owed' : 'Owes'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Settlement Plan */}
          {filteredSettlements.length > 0 && (
            <div className="bg-white p-6 rounded-lg editorial-shadow border border-transparent">
              <h2 className="text-lg font-headline font-bold text-light-on-surface mb-4">
                Settlement Plan
                {selectedMemberName !== 'all' && (
                  <span className="ml-2 px-3 py-1 text-sm bg-primary/10 text-primary rounded-full">
                    For: {selectedMemberName}
                  </span>
                )}
              </h2>

              <div className="space-y-3">
                {filteredSettlements.map((settlement, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center">
                        <span className="material-symbols-outlined text-sm text-yellow-600">arrow_forward</span>
                      </div>
                      <div>
                        <p className="font-medium text-light-on-surface">
                          {settlement.from} → {settlement.to}
                        </p>
                        <p className="text-xs text-light-on-surface-variant">
                          {settlement.description}
                        </p>
                      </div>
                    </div>
                    <div className="text-lg font-bold text-yellow-600">
                      ${settlement.amount.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-2xl text-secondary">analytics</span>
          </div>
          <h3 className="text-lg font-headline font-bold text-light-on-surface mb-2">
            No Data Available
          </h3>
          <p className="text-light-on-surface-variant">
            The selected group has no expenses yet.
          </p>
        </div>
      )}
    </div>
  )
}

export default Stats