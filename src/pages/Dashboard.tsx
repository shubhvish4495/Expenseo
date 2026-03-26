import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDashboard, createGroup } from '../utils/api'
import type { Group } from '../utils/api'
import CreateGroupModal from '../components/CreateGroupModal'

const Dashboard = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [groups, setGroups] = useState<Group[]>([])
  const [activeGroups, setActiveGroups] = useState<Group[]>([])
  const [creatingGroup, setCreatingGroup] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch all groups
        const dashboardResponse = await getDashboard()

        if (!dashboardResponse.success) {
          throw new Error(dashboardResponse.error || 'Failed to fetch dashboard data')
        }

        // Handle the new response format: {status: "success", data: {groups: [...], timestamp: ...}}
        const responseData = dashboardResponse.data?.data || dashboardResponse.data
        const fetchedGroups = responseData?.groups || []

        setGroups(fetchedGroups)

        // Filter for active groups only
        const activeGroupsList = fetchedGroups.filter((group: Group) => group.status === 'active')
        setActiveGroups(activeGroupsList)

      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
        setError(error instanceof Error ? error.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const handleGroupClick = (group: Group) => {
    // Navigate to group ledger page
    navigate(`/group/${encodeURIComponent(group.groupName)}`)
  }

  const handleCreateGroup = () => {
    setShowCreateModal(true)
  }

  const handleModalCreateGroup = async (groupName: string) => {
    try {
      setCreatingGroup(true)
      setError(null)

      // Call API to create group
      const response = await createGroup(groupName)

      if (!response.success) {
        throw new Error(response.error || 'Failed to create trip')
      }

      // Refresh dashboard data to show new group
      const dashboardResponse = await getDashboard()

      if (dashboardResponse.success) {
        const responseData = dashboardResponse.data?.data || dashboardResponse.data
        const fetchedGroups = responseData?.groups || []
        setGroups(fetchedGroups)
        setActiveGroups(fetchedGroups.filter((group: Group) => group.status === 'active'))
      }

      // Navigate to the new group
      navigate(`/group/${encodeURIComponent(groupName)}`)

    } catch (error) {
      console.error('Failed to create trip:', error)
      setError(error instanceof Error ? error.message : 'Failed to create trip')
      // Re-throw error so modal can handle it
      throw error
    } finally {
      setCreatingGroup(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-light-on-surface-variant">Loading your trips...</p>
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
            Connection Error
          </h3>
          <p className="text-light-on-surface-variant mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  // Empty state - no active groups exist
  if (activeGroups.length === 0) {
    return (
      <>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-2xl text-secondary">explore</span>
            </div>
            <h3 className="text-display-md font-headline font-bold text-light-on-surface mb-4 text-balance">
              Ready for Your Next <span className="gradient-text">Adventure</span>?
            </h3>
            <p className="text-light-on-surface-variant mb-8">
              {groups.length === 0
                ? "Create your first trip group to start tracking shared expenses with your fellow travelers."
                : "No active trips found. Create a new trip or check back later."}
            </p>
            <button
              onClick={handleCreateGroup}
              className="btn-primary"
            >
              <span className="material-symbols-outlined mr-2" style={{ fontVariationSettings: "'FILL' 1" }}>
                add
              </span>
              Create New Trip
            </button>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="space-y-8">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-headline font-bold text-light-on-surface">
              Your Trips
            </h1>
            <p className="text-light-on-surface-variant mt-1">
              {activeGroups.length} active trip{activeGroups.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={handleCreateGroup}
            className="btn-primary"
          >
            <span className="material-symbols-outlined mr-2" style={{ fontVariationSettings: "'FILL' 1" }}>
              add
            </span>
            New Trip
          </button>
        </div>

        {/* Groups List */}
        <div className="space-y-4">
          {activeGroups.map((group) => (
            <div
              key={group.groupId}
              onClick={() => handleGroupClick(group)}
              className="bg-white p-6 rounded-lg editorial-shadow cursor-pointer hover:shadow-lg transition-all duration-200 border border-transparent hover:border-primary/20"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-headline font-bold text-light-on-surface mb-1">
                    {group.groupName}
                  </h3>
                  <p className="text-sm text-light-on-surface-variant">
                    Created on {new Date(group.createdDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-secondary/10 text-secondary border border-secondary/20">
                    {group.status}
                  </span>
                  <span className="material-symbols-outlined text-light-on-surface-variant">
                    chevron_right
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Group Modal */}
      <CreateGroupModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateGroup={handleModalCreateGroup}
        existingGroups={groups.map(group => group.groupName)}
        isCreating={creatingGroup}
      />
    </>
  )
}

export default Dashboard