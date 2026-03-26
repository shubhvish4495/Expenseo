/**
 * Utility for managing current group session state across page navigation
 */

const CURRENT_GROUP_KEY = 'expense-tracker-current-group'

export interface CurrentGroup {
  groupName: string
  timestamp: number
}

/**
 * Store the current group in session storage
 */
export const setCurrentGroup = (groupName: string): void => {
  if (!groupName?.trim()) {
    console.warn('Cannot set empty group name')
    return
  }

  const currentGroup: CurrentGroup = {
    groupName: groupName.trim(),
    timestamp: Date.now()
  }

  try {
    sessionStorage.setItem(CURRENT_GROUP_KEY, JSON.stringify(currentGroup))
  } catch (error) {
    console.error('Failed to save current group to session storage:', error)
  }
}

/**
 * Get the current group from session storage
 */
export const getCurrentGroup = (): CurrentGroup | null => {
  try {
    const stored = sessionStorage.getItem(CURRENT_GROUP_KEY)
    if (!stored) return null

    const parsed = JSON.parse(stored) as CurrentGroup

    // Validate the stored data
    if (!parsed.groupName || typeof parsed.groupName !== 'string') {
      clearCurrentGroup()
      return null
    }

    return parsed
  } catch (error) {
    console.error('Failed to retrieve current group from session storage:', error)
    clearCurrentGroup()
    return null
  }
}

/**
 * Get just the group name from session storage
 */
export const getCurrentGroupName = (): string | null => {
  const currentGroup = getCurrentGroup()
  return currentGroup?.groupName || null
}

/**
 * Clear the current group from session storage
 */
export const clearCurrentGroup = (): void => {
  try {
    sessionStorage.removeItem(CURRENT_GROUP_KEY)
  } catch (error) {
    console.error('Failed to clear current group from session storage:', error)
  }
}

/**
 * Check if a group is currently active
 */
export const isCurrentGroup = (groupName: string): boolean => {
  const current = getCurrentGroupName()
  return current === groupName
}