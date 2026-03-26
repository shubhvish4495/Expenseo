import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { getGroupData, addMember, addExpense, deleteExpense, startPolling } from '../utils/api'
import type { Member, Expense, GroupData } from '../utils/api'
import { setCurrentGroup } from '../utils/groupSession'

const GroupLedger = () => {
  const { groupName } = useParams<{ groupName: string }>()
  const [members, setMembers] = useState<Member[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAddingMember, setIsAddingMember] = useState(false)
  const [isAddMemberLoading, setIsAddMemberLoading] = useState(false)
  const [newMemberName, setNewMemberName] = useState('')
  const [isAddingExpense, setIsAddingExpense] = useState(false)
  const [isAddExpenseLoading, setIsAddExpenseLoading] = useState(false)
  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: '',
    paidBy: '',
    splitType: 'equal' as 'equal' | 'custom',
    customSplits: {} as Record<string, string>,
    selectedMembers: [] as string[] // For equal split member selection
  })
  const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null)
  const [isDeletingExpense, setIsDeletingExpense] = useState(false)

  // Function to fetch group data
  const fetchGroupData = async () => {
    if (!groupName) return

    try {
      setError(null)
      const response = await getGroupData(groupName)

      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch group data')
      }

      const groupData = response.data?.data || response.data
      setMembers(groupData?.members || [])
      setExpenses(groupData?.expenses || [])

    } catch (error) {
      console.error('Failed to fetch group data:', error)
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Store current group in session storage for navigation persistence
    if (groupName) {
      setCurrentGroup(groupName)
    }

    fetchGroupData()

    // Set up polling for real-time updates every 15 seconds
    const stopPolling = startPolling(fetchGroupData, 15000)

    // Cleanup polling on unmount
    return () => {
      stopPolling()
    }
  }, [groupName])

  // Function to handle adding new members
  const handleAddMember = async () => {
    if (!groupName || !newMemberName.trim()) return

    try {
      setIsAddMemberLoading(true)
      setError(null) // Clear any previous errors

      const response = await addMember(groupName, newMemberName.trim())

      if (!response.success) {
        throw new Error(response.error || 'Failed to add member')
      }

      // Refresh group data to get the updated members list
      await fetchGroupData()
      setNewMemberName('')
      setIsAddingMember(false) // Close the form after successful add

    } catch (error) {
      console.error('Failed to add member:', error)
      setError(error instanceof Error ? error.message : 'Failed to add member')
    } finally {
      setIsAddMemberLoading(false)
    }
  }

  // Function to handle adding new expenses
  const handleAddExpense = async () => {
    if (!groupName || !newExpense.description.trim() || !newExpense.amount.trim() || !newExpense.paidBy.trim()) return

    try {
      setIsAddExpenseLoading(true)
      setError(null) // Clear any previous errors

      const amount = parseFloat(newExpense.amount)
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Please enter a valid amount')
      }

      // Calculate fractions based on split type
      let fractions: Record<string, number> = {}

      if (newExpense.splitType === 'equal') {
        // Equal split among selected members
        const selectedMembers = newExpense.selectedMembers
        if (selectedMembers.length === 0) {
          throw new Error('Please select at least one member for equal split.')
        }
        const fraction = 1 / selectedMembers.length
        selectedMembers.forEach(memberName => {
          fractions[memberName] = fraction
        })
      } else {
        // Custom split - validate and convert to fractions
        const totalCustomAmount = Object.values(newExpense.customSplits)
          .map(val => parseFloat(val) || 0)
          .reduce((sum, val) => sum + val, 0)

        if (Math.abs(totalCustomAmount - amount) > 0.01) {
          throw new Error('Custom split amounts must add up to the total expense amount')
        }

        Object.entries(newExpense.customSplits).forEach(([member, amountStr]) => {
          const memberAmount = parseFloat(amountStr) || 0
          if (memberAmount > 0) {
            fractions[member] = memberAmount / amount
          }
        })
      }

      const expenseData = {
        paidBy: newExpense.paidBy.trim(),
        amount: amount,
        description: newExpense.description.trim(),
        fractions: fractions
      }

      const response = await addExpense(groupName, expenseData)

      if (!response.success) {
        throw new Error(response.error || 'Failed to add expense')
      }

      // Refresh group data to get the updated expenses list
      await fetchGroupData()

      // Reset form
      setNewExpense({
        description: '',
        amount: '',
        paidBy: '',
        splitType: 'equal',
        customSplits: {},
        selectedMembers: []
      })
      setIsAddingExpense(false) // Close the form after successful add

    } catch (error) {
      console.error('Failed to add expense:', error)
      setError(error instanceof Error ? error.message : 'Failed to add expense')
    } finally {
      setIsAddExpenseLoading(false)
    }
  }

  // Function to handle deleting expenses
  const handleDeleteExpense = async (expenseId: string) => {
    if (!groupName) return

    try {
      setIsDeletingExpense(true)
      setError(null)

      const response = await deleteExpense(groupName, expenseId)

      if (!response.success) {
        throw new Error(response.error || 'Failed to delete expense')
      }

      // Refresh group data to get the updated expenses list
      await fetchGroupData()
      setExpenseToDelete(null) // Close confirmation dialog

    } catch (error) {
      console.error('Failed to delete expense:', error)
      setError(error instanceof Error ? error.message : 'Failed to delete expense')
    } finally {
      setIsDeletingExpense(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-light-on-surface-variant">Loading {groupName} ledger...</p>
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
            Error Loading Group Data
          </h3>
          <p className="text-light-on-surface-variant mb-4">{error}</p>
          <button
            onClick={fetchGroupData}
            className="btn-primary"
          >
            Retry
          </button>
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
            {groupName}
          </h1>
          <p className="text-light-on-surface-variant">
            {members.length} member{members.length !== 1 ? 's' : ''} • {expenses.length} expense{expenses.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Members Section */}
      <div className="bg-white p-6 rounded-lg editorial-shadow border border-transparent">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-headline font-bold text-light-on-surface">
            Group Members
          </h2>
          <button
            onClick={() => setIsAddingMember(!isAddingMember)}
            className="btn-secondary text-sm"
          >
            <span className="material-symbols-outlined text-base mr-1" style={{ fontVariationSettings: "'FILL' 1" }}>
              person_add
            </span>
            Add Member
          </button>
        </div>

        {/* Add Member Form */}
        {isAddingMember && (
          <div className="mb-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
            <div className="flex gap-3">
              <input
                type="text"
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                placeholder="Member name"
                disabled={isAddMemberLoading}
                className="flex-1 px-3 py-2 border border-light-outline bg-light-surface-variant text-light-on-surface rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !isAddMemberLoading) {
                    handleAddMember()
                  }
                }}
              />
              <button
                onClick={handleAddMember}
                disabled={isAddMemberLoading || !newMemberName.trim()}
                className="btn-primary"
              >
                {isAddMemberLoading ? 'Adding...' : 'Add'}
              </button>
              <button
                onClick={() => {
                  setIsAddingMember(false)
                  setIsAddMemberLoading(false)
                  setNewMemberName('')
                  setError(null) // Clear any errors when canceling
                }}
                disabled={isAddMemberLoading}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Members List */}
        {members.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center mx-auto mb-3">
              <span className="material-symbols-outlined text-xl text-secondary">groups</span>
            </div>
            <p className="text-light-on-surface-variant">
              No members yet. Add your first member to get started.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {members.map((member, index) => (
              <div
                key={index}
                className="flex items-center p-3 bg-light-surface-variant rounded-lg"
              >
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mr-3">
                  <span className="material-symbols-outlined text-sm text-primary">person</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-light-on-surface">
                    {member.memberName}
                  </p>
                  <p className="text-xs text-light-on-surface-variant">
                    Joined {new Date(member.joinDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Expenses Section */}
      <div className="bg-white p-6 rounded-lg editorial-shadow border border-transparent">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-headline font-bold text-light-on-surface">
            Expenses
          </h2>
          <button
            onClick={() => setIsAddingExpense(!isAddingExpense)}
            className="btn-secondary text-sm"
          >
            <span className="material-symbols-outlined text-base mr-1" style={{ fontVariationSettings: "'FILL' 1" }}>
              add
            </span>
            Add Expense
          </button>
        </div>

        {/* Add Expense Form */}
        {isAddingExpense && (
          <div className="mb-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
            <div className="grid grid-cols-1 gap-4">
              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-light-on-surface mb-2">
                  Description
                </label>
                <input
                  type="text"
                  value={newExpense.description}
                  onChange={(e) => setNewExpense(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="e.g., Dinner at restaurant"
                  disabled={isAddExpenseLoading}
                  className="w-full px-3 py-2 border border-light-outline bg-light-surface-variant text-light-on-surface rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-light-on-surface mb-2">
                  Amount ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="0.00"
                  disabled={isAddExpenseLoading}
                  className="w-full px-3 py-2 border border-light-outline bg-light-surface-variant text-light-on-surface rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* Paid By */}
              <div>
                <label className="block text-sm font-medium text-light-on-surface mb-2">
                  Paid By
                </label>
                <select
                  value={newExpense.paidBy}
                  onChange={(e) => setNewExpense(prev => ({ ...prev, paidBy: e.target.value }))}
                  disabled={isAddExpenseLoading}
                  className="w-full px-3 py-2 border border-light-outline bg-light-surface-variant text-light-on-surface rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">Select member...</option>
                  {members.map((member) => (
                    <option key={member.memberName} value={member.memberName}>
                      {member.memberName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Split Type */}
              <div>
                <label className="block text-sm font-medium text-light-on-surface mb-2">
                  Split Type
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="equal"
                      checked={newExpense.splitType === 'equal'}
                      onChange={() => setNewExpense(prev => ({ ...prev, splitType: 'equal' }))}
                      disabled={isAddExpenseLoading}
                      className="mr-2"
                    />
                    <span className="text-sm text-light-on-surface">Equal Split</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="custom"
                      checked={newExpense.splitType === 'custom'}
                      onChange={() => setNewExpense(prev => ({ ...prev, splitType: 'custom' }))}
                      disabled={isAddExpenseLoading}
                      className="mr-2"
                    />
                    <span className="text-sm text-light-on-surface">Custom Split</span>
                  </label>
                </div>
              </div>

              {/* Equal Split Member Selection */}
              {newExpense.splitType === 'equal' && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-light-on-surface">
                      Select Members for Equal Split
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setNewExpense(prev => ({
                            ...prev,
                            selectedMembers: members.map(m => m.memberName)
                          }))
                        }}
                        disabled={isAddExpenseLoading}
                        className="text-xs text-primary hover:text-primary-dark underline"
                      >
                        Select All
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setNewExpense(prev => ({
                            ...prev,
                            selectedMembers: []
                          }))
                        }}
                        disabled={isAddExpenseLoading}
                        className="text-xs text-light-on-surface-variant hover:text-light-on-surface underline"
                      >
                        Clear All
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {members.map((member) => (
                      <label key={member.memberName} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={newExpense.selectedMembers.includes(member.memberName)}
                          onChange={(e) => {
                            const isChecked = e.target.checked
                            setNewExpense(prev => ({
                              ...prev,
                              selectedMembers: isChecked
                                ? [...prev.selectedMembers, member.memberName]
                                : prev.selectedMembers.filter(name => name !== member.memberName)
                            }))
                          }}
                          disabled={isAddExpenseLoading}
                          className="mr-2"
                        />
                        <span className="text-sm text-light-on-surface">{member.memberName}</span>
                      </label>
                    ))}
                    {newExpense.selectedMembers.length > 0 && (
                      <p className="text-xs text-light-on-surface-variant mt-2">
                        Split equally among {newExpense.selectedMembers.length} member{newExpense.selectedMembers.length !== 1 ? 's' : ''}: {newExpense.selectedMembers.join(', ')}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Custom Split Details */}
              {newExpense.splitType === 'custom' && (
                <div>
                  <label className="block text-sm font-medium text-light-on-surface mb-2">
                    Custom Split Amounts
                  </label>
                  <div className="space-y-2">
                    {members.map((member) => (
                      <div key={member.memberName} className="flex items-center gap-3">
                        <span className="text-sm text-light-on-surface w-24 flex-shrink-0">
                          {member.memberName}:
                        </span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={newExpense.customSplits[member.memberName] || ''}
                          onChange={(e) => setNewExpense(prev => ({
                            ...prev,
                            customSplits: {
                              ...prev.customSplits,
                              [member.memberName]: e.target.value
                            }
                          }))}
                          placeholder="0.00"
                          disabled={isAddExpenseLoading}
                          className="flex-1 px-3 py-1 text-sm border border-light-outline bg-light-surface-variant text-light-on-surface rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleAddExpense}
                  disabled={isAddExpenseLoading || !newExpense.description.trim() || !newExpense.amount.trim() || !newExpense.paidBy.trim()}
                  className="btn-primary"
                >
                  {isAddExpenseLoading ? 'Adding...' : 'Add Expense'}
                </button>
                <button
                  onClick={() => {
                    setIsAddingExpense(false)
                    setIsAddExpenseLoading(false)
                    setNewExpense({
                      description: '',
                      amount: '',
                      paidBy: '',
                      splitType: 'equal',
                      customSplits: {},
                      selectedMembers: []
                    })
                    setError(null) // Clear any errors when canceling
                  }}
                  disabled={isAddExpenseLoading}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Expenses List */}
        {expenses.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center mx-auto mb-3">
              <span className="material-symbols-outlined text-xl text-secondary">receipt_long</span>
            </div>
            <p className="text-light-on-surface-variant">
              No expenses yet. Start tracking your group spending.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {expenses.map((expense) => (
              <div
                key={expense.expenseId}
                className="flex items-center justify-between p-4 bg-light-surface-variant rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-light-on-surface">
                      {expense.description}
                    </p>
                    <span className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full">
                      ${expense.amount.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-sm text-light-on-surface-variant">
                    Paid by <span className="font-medium">{expense.paidBy}</span> • {new Date(expense.timestamp).toLocaleDateString()}
                  </p>
                  {expense.fractions && Object.keys(expense.fractions).length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {Object.entries(expense.fractions).map(([member, fraction]) => (
                        <span
                          key={member}
                          className="px-2 py-1 text-xs bg-secondary/10 text-secondary rounded-full"
                        >
                          {member}: ${(expense.amount * fraction).toFixed(2)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => setExpenseToDelete(expense.expenseId)}
                    disabled={isDeletingExpense}
                    className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Delete expense"
                  >
                    <span className="material-symbols-outlined text-lg">delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {expenseToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <span className="material-symbols-outlined text-xl text-red-600">warning</span>
              </div>
              <div>
                <h3 className="text-lg font-headline font-bold text-light-on-surface">
                  Delete Expense?
                </h3>
                <p className="text-sm text-light-on-surface-variant">
                  This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="mb-6">
              {(() => {
                const expense = expenses.find(e => e.expenseId === expenseToDelete)
                return expense ? (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium text-light-on-surface">{expense.description}</p>
                    <p className="text-sm text-light-on-surface-variant">
                      ${expense.amount.toFixed(2)} • Paid by {expense.paidBy}
                    </p>
                  </div>
                ) : null
              })()}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setExpenseToDelete(null)}
                disabled={isDeletingExpense}
                className="flex-1 px-4 py-2 border border-light-outline text-light-on-surface bg-white rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteExpense(expenseToDelete)}
                disabled={isDeletingExpense}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isDeletingExpense ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-sm">delete</span>
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default GroupLedger