import { Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import GroupLedger from './pages/GroupLedger'
import Stats from './pages/Stats'
import Layout from './components/Layout'

function App() {
  return (
    <div className="min-h-screen bg-light-surface text-light-on-surface">
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="group/:groupName" element={<GroupLedger />} />
          <Route path="stats" element={<Stats />} />
        </Route>
      </Routes>
    </div>
  )
}

export default App