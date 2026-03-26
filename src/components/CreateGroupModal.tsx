import { useState } from 'react'

interface CreateGroupModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateGroup: (groupName: string) => Promise<void>
  existingGroups: string[]
  isCreating: boolean
}

const CreateGroupModal = ({
  isOpen,
  onClose,
  onCreateGroup,
  existingGroups,
  isCreating
}: CreateGroupModalProps) => {
  const [groupName, setGroupName] = useState('')
  const [error, setError] = useState('')

  const validateGroupName = (name: string): string => {
    if (!name.trim()) {
      return 'Trip name is required'
    }

    if (name.trim().length < 2) {
      return 'Trip name must be at least 2 characters long'
    }

    if (name.trim().length > 50) {
      return 'Trip name must be 50 characters or less'
    }

    if (existingGroups.some(group => group.toLowerCase() === name.trim().toLowerCase())) {
      return 'A trip with this name already exists'
    }

    return ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const validationError = validateGroupName(groupName)
    if (validationError) {
      setError(validationError)
      return
    }

    try {
      await onCreateGroup(groupName.trim())
      // Reset form on success
      setGroupName('')
      setError('')
      onClose()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create trip')
    }
  }

  const handleInputChange = (value: string) => {
    setGroupName(value)
    // Clear error when user starts typing
    if (error && value.trim()) {
      const validationError = validateGroupName(value)
      setError(validationError)
    }
  }

  const handleClose = () => {
    if (!isCreating) {
      setGroupName('')
      setError('')
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 glass-blur"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white rounded-2xl editorial-shadow">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-headline font-bold text-light-on-surface">
            Create New Trip
          </h2>
          <button
            onClick={handleClose}
            disabled={isCreating}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-gray-500">close</span>
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label
              htmlFor="groupName"
              className="block text-sm font-medium text-light-on-surface mb-2"
            >
              Trip Name
            </label>
            <input
              id="groupName"
              type="text"
              value={groupName}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="e.g., Paris Adventure 2026"
              className={`input-field w-full ${error ? 'ring-2 ring-red-500 focus:ring-red-500' : ''}`}
              disabled={isCreating}
              maxLength={50}
              autoFocus
            />
            {error && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-2">
                <span className="material-symbols-outlined text-base">error</span>
                {error}
              </p>
            )}
          </div>

          <div className="text-xs text-light-on-surface-variant">
            <p>• Name should be 2-50 characters long</p>
            <p>• Must be unique (no duplicates allowed)</p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isCreating}
              className="btn-secondary flex-1 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreating || !groupName.trim() || !!error}
              className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-base">add</span>
                  Create Trip
                </div>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateGroupModal