import { Outlet, useLocation } from 'react-router-dom'
import Header from './Header'
import BottomNavigation from './BottomNavigation'

const Layout = () => {
  const location = useLocation()

  // Show bottom navigation on group ledger pages and stats page, but not on dashboard
  const showBottomNav = location.pathname.includes('/group/') || location.pathname === '/stats'

  return (
    <div className="min-h-screen bg-light-surface text-light-on-surface">
      <Header />
      <main className={`pt-24 px-6 max-w-2xl mx-auto ${showBottomNav ? 'pb-32' : ''}`}>
        <Outlet />
      </main>
      {showBottomNav && <BottomNavigation />}
    </div>
  )
}

export default Layout