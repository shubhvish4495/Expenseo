import { Link, useLocation, useParams } from 'react-router-dom'
import { getCurrentGroupName } from '../utils/groupSession'

interface NavItem {
  path: string
  icon: string
  label: string
  isActive?: boolean
}

const BottomNavigation = () => {
  const location = useLocation()
  const { groupName } = useParams<{ groupName: string }>()

  // Determine the current group context for navigation
  // Use URL param first, fall back to session storage
  const currentGroup = groupName || getCurrentGroupName()
  const currentGroupPath = currentGroup ? `/group/${encodeURIComponent(currentGroup)}` : '/'

  const navItems: NavItem[] = [
    {
      path: '/',
      icon: 'explore',
      label: 'Trips',
      isActive: false // Never active since this is only shown on ledger/stats pages
    },
    {
      path: currentGroupPath,
      icon: 'receipt_long',
      label: 'Ledger',
      isActive: location.pathname.includes('/group/')
    },
    {
      path: '/stats',
      icon: 'analytics',
      label: 'Stats',
      isActive: location.pathname === '/stats'
    }
  ]

  return (
    <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center px-4 pb-6 pt-3 bg-white/80 glass-blur rounded-t-3xl z-50 shadow-lg border-t border-gray-100/50">
      {navItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={`flex flex-col items-center justify-center px-5 py-1.5 rounded-full transition-all duration-300 ${
            item.isActive
              ? 'bg-secondary/20 text-secondary'
              : 'text-light-on-surface-variant hover:text-secondary hover:bg-secondary/10'
          }`}
        >
          <span
            className={`material-symbols-outlined ${
              item.isActive ? '' : ''
            }`}
            style={{
              fontVariationSettings: item.isActive ? "'FILL' 1" : "'FILL' 0"
            }}
          >
            {item.icon}
          </span>
          <span className="font-body text-[11px] font-medium mt-1">
            {item.label}
          </span>
        </Link>
      ))}
    </nav>
  )
}

export default BottomNavigation