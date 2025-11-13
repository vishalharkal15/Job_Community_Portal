import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }

    try {
      setLoading(true)
      await signIn(email, password)
      navigate('/blog') // Redirect to blog page after login
    } catch (error) {
      console.error('Login error:', error)
      setError('Failed to login. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  // Demo accounts info
  const demoAccounts = [
    { email: 'company@example.com', password: 'company123', role: 'Company' },
    { email: 'recruiter@example.com', password: 'recruiter123', role: 'Recruiter' },
    { email: 'user@example.com', password: 'user123', role: 'User' }
  ]

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Login</h2>
        
        {/* Demo Account Info */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">Demo Accounts:</h3>
          <div className="space-y-2 text-xs text-blue-800">
            {demoAccounts.map((account, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="font-medium">{account.role}:</span>
                <span>{account.email}</span>
              </div>
            ))}
            <p className="text-blue-700 italic mt-2">Password for all: demo123</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your email"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your password"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition font-medium ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <div className="mt-4 text-center">
          <Link 
            to="/auth/forgot-password" 
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Forgot Password?
          </Link>
        </div>
        
        <p className="mt-4 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link to="/auth/register" className="text-blue-600 hover:text-blue-700 font-medium">
            Register here
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Login