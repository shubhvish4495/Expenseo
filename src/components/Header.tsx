import { Link } from 'react-router-dom'

const Header = () => {
  return (
    <header className="fixed top-0 w-full z-50 bg-white/80 glass-blur flex justify-between items-center px-6 py-4 border-b border-gray-100/50">
      <div className="flex items-center">
        <Link
          to="/"
          className="text-xl font-extrabold text-secondary font-headline tracking-tight hover:text-secondary/80 transition-colors cursor-pointer"
        >
          Expenseo
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200">
          <img
            alt="User avatar"
            className="w-full h-full object-cover"
            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80"
          />
        </div>
      </div>
    </header>
  )
}

export default Header