import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

function Header() {
  const [isAuthDropdownOpen, setIsAuthDropdownOpen] = useState(false)
  const { currentUser, signOut, userRole } = useAuth()
  const navigate = useNavigate()

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
            
            {/* Auth Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsAuthDropdownOpen(!isAuthDropdownOpen)}
                className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium transition flex items-center gap-2"
              >
                {currentUser ? (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    {currentUser.email.split('@')[0]}
                  </>
                ) : (
                  'Account'
                )}
                <svg 
                  className={`w-4 h-4 transition-transform ${isAuthDropdownOpen ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {isAuthDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                  {currentUser ? (
                    <>
                      <div className="px-4 py-2 border-b border-gray-200">
                        <p className="text-xs text-gray-500">Signed in as</p>
                        <p className="text-sm font-medium text-gray-900 truncate">{currentUser.email}</p>
                        {userRole && (
                          <span className={`inline-block mt-1 px-2 py-1 rounded text-xs font-medium ${
                            userRole === 'company' ? 'bg-blue-100 text-blue-800' :
                            userRole === 'recruiter' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={async () => {
                          setIsAuthDropdownOpen(false)
                          await signOut()
                          navigate('/')
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/auth/login"
                        onClick={() => setIsAuthDropdownOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition"
                      >
                        Login
                      </Link>
                      <Link
                        to="/auth/register"
                        onClick={() => setIsAuthDropdownOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition"
                      >
                        Register
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
      
      {/* Overlay to close dropdown when clicking outside */}
      {isAuthDropdownOpen && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setIsAuthDropdownOpen(false)}
        />
      )}
    </header>
  )
}

export default Header