// API utility for communicating with Google Apps Script backend
const API_URL = import.meta.env.VITE_GAS_API_URL

interface ApiResponse {
  success: boolean
  data?: any
  error?: string
}

interface ApiPayload {
  action: string
  payload: any
}

// Base API function with error handling and CORS support
const makeApiCall = async (actionType: string, payload: any = {}): Promise<ApiResponse> => {
  const requestPayload: ApiPayload = {
    action: actionType,
    payload
  }

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        // Use text/plain to avoid CORS preflight (OPTIONS) request
        // GAS doesn't handle OPTIONS requests properly
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(requestPayload),
      redirect: 'follow', // Handle GAS redirects
      mode: 'cors',
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()

    // Handle GAS response format: {status: "success"/"error", data: ..., error: ...}
    if (result.status === 'error') {
      throw new Error(result.error || 'Server returned error status')
    }

    return {
      success: true,
      data: result
    }
  } catch (error) {
    console.error('API call failed:', error)

    // Check if it's a CORS error specifically
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      return {
        success: false,
        error: 'CORS error: Please check your Google Apps Script deployment settings and ensure the Web App is deployed with proper permissions.'
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

// API Functions following the Architecture specification

// GET_DASHBOARD: Returns list of all groups from Index sheet
export const getDashboard = async (): Promise<ApiResponse> => {
  return makeApiCall('GET_DASHBOARD')
}

// CREATE_GROUP: Creates new group and associated sheets
export const createGroup = async (groupName: string): Promise<ApiResponse> => {
  return makeApiCall('CREATE_GROUP', { groupName })
}

// GET_GROUP_DATA: Fetches members and expenses for specific group
export const getGroupData = async (groupName: string): Promise<ApiResponse> => {
  return makeApiCall('GET_GROUP_DATA', { groupName })
}

// ADD_MEMBER: Adds member to group
export const addMember = async (groupName: string, memberName: string): Promise<ApiResponse> => {
  return makeApiCall('ADD_MEMBER', { groupName, memberName })
}

// ADD_EXPENSE: Adds expense entry
export const addExpense = async (
  groupName: string,
  expense: {
    paidBy: string
    amount: number
    description: string
    fractions: Record<string, number>
  }
): Promise<ApiResponse> => {
  return makeApiCall('ADD_EXPENSE', {
    groupName,
    ...expense
  })
}

// GET_GROUP_BALANCES: Fetches balances and settlements for specific group
export const getGroupBalances = async (groupName: string): Promise<ApiResponse> => {
  return makeApiCall('GET_GROUP_BALANCES', { groupName })
}

// DELETE_EXPENSE: Deletes an expense from a group
export const deleteExpense = async (groupName: string, expenseId: string): Promise<ApiResponse> => {
  return makeApiCall('DELETE_EXPENSE', { groupName, expenseId })
}

// DELETE_MEMBER: Deletes a member from a group
export const deleteMember = async (groupName: string, memberName: string): Promise<ApiResponse> => {
  return makeApiCall('DELETE_MEMBER', { groupName, memberName })
}

// Utility function for real-time polling
export const startPolling = (
  callback: () => void,
  interval: number = 15000
): (() => void) => {
  const intervalId = setInterval(callback, interval)

  // Return cleanup function
  return () => {
    clearInterval(intervalId)
  }
}

// Type definitions for API responses
export interface Group {
  groupId: string
  groupName: string
  createdDate: string
  status: string
}

export interface Member {
  memberName: string
  joinDate: string
}

export interface Expense {
  expenseId: string
  timestamp: string
  paidBy: string
  amount: number
  description: string
  fractions: Record<string, number>
}

export interface GroupData {
  members: Member[]
  expenses: Expense[]
}

export interface MemberBalance {
  memberName: string
  totalPaid: number
  totalOwes: number
  netBalance: number
}

export interface Settlement {
  from: string
  to: string
  amount: number
  description: string
}

export interface BalanceData {
  balances: MemberBalance[]
  settlements: Settlement[]
  timestamp: string
}