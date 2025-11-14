import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Header() {
  const { currentUser } = useAuth()

  return (
    <header className="bg-white shadow-md">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-blue-600">
              Job Portal
            </Link>
          </div>
          
          <div className="flex items-center space-x-8">
            <Link 
              to="/" 
              className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition"
            >
              Home
            </Link>
            <Link 
              to="/jobs" 
              className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition"
            >
              Jobs
            </Link>
            <Link 
              to="/blog" 
              className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition"
            >
              Blog
            </Link>
            <Link 
              to="/services" 
              className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition"
            >
              Services
            </Link>
            <Link 
              to="/book-meeting" 
              className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Book Meeting
            </Link>
            
            {/* Profile Button */}
            <Link
              to="/profile"
              className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium transition flex items-center gap-2"
            >
              {currentUser ? (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Profile
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Login
                </>
              )}
            </Link>
          </div>
        </div>
      </nav>
    </header>
  )
}

export default Header