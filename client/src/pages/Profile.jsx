// Profile.jsx
import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase/firebaseConfig'

function Profile() {
  const { currentUser, userRole, signOut } = useAuth()
  const navigate = useNavigate()
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Edit modal state
  const [isEditing, setIsEditing] = useState(false)
  const [editLoading, setEditLoading] = useState(false)
  const [editErrors, setEditErrors] = useState({})
  const [editSuccess, setEditSuccess] = useState('')

  // Form fields for editing
  const [form, setForm] = useState({
    name: '',
    mobile: '',
    address: '',
    position: '',
    experience: '',
    cvUrl: '',
    certificatesUrl: '',
  })

  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser) {
        setLoading(false)
        return
      }

      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid))
        if (userDoc.exists()) {
          const data = userDoc.data()
          setUserData(data)
          // fill edit form with existing values
          setForm({
            name: data.name || '',
            mobile: data.mobile || '',
            address: data.address || '',
            position: data.position || '',
            experience: data.experience || '',
            cvUrl: data.cvUrl || '',
            certificatesUrl: data.certificatesUrl || '',
          })
        } else {
          setError('User profile not found')
        }
      } catch (err) {
        console.error('Error fetching user data:', err)
        setError('Failed to load profile data')
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [currentUser])

  const handleLogout = async () => {
    try {
      await signOut()
      navigate('/')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  // open edit modal (ensure form is prefilled)
  const openEdit = () => {
    setEditErrors({})
    setEditSuccess('')
    setForm({
      name: userData?.name || '',
      mobile: userData?.mobile || '',
      address: userData?.address || '',
      position: userData?.position || '',
      experience: userData?.experience || '',
      cvUrl: userData?.cvUrl || '',
      certificatesUrl: userData?.certificatesUrl || '',
    })
    setIsEditing(true)
  }

  const closeEdit = () => {
    setIsEditing(false)
    setEditErrors({})
    setEditSuccess('')
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (editErrors[name]) setEditErrors(prev => ({ ...prev, [name]: '' }))
  }

  const validateEditForm = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Name is required'
    if (form.mobile && !/^\d{10}$/.test(form.mobile.replace(/\D/g, '')))
      errs.mobile = 'Mobile must be 10 digits'
    if (!form.address.trim()) errs.address = 'Address is required'
    if (!form.position.trim()) errs.position = 'Position is required'
    if (!form.experience.trim()) errs.experience = 'Experience is required'
    // If urls provided, very basic url check
    if (form.cvUrl && !/^https?:\/\//i.test(form.cvUrl)) errs.cvUrl = 'CV URL should start with http(s)://'
    if (form.certificatesUrl && !/^https?:\/\//i.test(form.certificatesUrl)) errs.certificatesUrl = 'Certificate URL should start with http(s)://'
    return errs
  }

  // Update profile API call
  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setEditSuccess('')
    const errs = validateEditForm()
    if (Object.keys(errs).length > 0) {
      setEditErrors(errs)
      return
    }

    if (!currentUser) {
      setEditErrors({ global: 'You must be logged in to update profile.' })
      return
    }

    setEditLoading(true)
    try {
      // get firebase id token to authenticate backend
      const token = await currentUser.getIdToken()

      // Prepare payload - only fields we want to update
      const payload = {
        name: form.name.trim(),
        mobile: form.mobile.trim(),
        address: form.address.trim(),
        position: form.position.trim(),
        experience: form.experience.trim(),
        cvUrl: form.cvUrl?.trim() || null,
        certificatesUrl: form.certificatesUrl?.trim() || null,
      }

      // PUT to your backend update route (you should implement /update-profile in server)
      // Example: axios.put('/update-profile', payload, { headers: { Authorization: `Bearer ${token}` }})
      const response = await axios.put('http://localhost:5000/update-profile', payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      // If backend returns updated data, use it; otherwise update locally
      if (response.data?.profile) {
        setUserData(response.data.profile)
      } else {
        setUserData(prev => ({ ...prev, ...payload }))
      }

      setEditSuccess('Profile updated successfully.')
      // close modal after short delay
      setTimeout(() => {
        setIsEditing(false)
        setEditSuccess('')
      }, 1200)
    } catch (err) {
      console.error('Update error:', err)
      const msg = err.response?.data?.error || 'Failed to update profile'
      setEditErrors({ global: msg })
    } finally {
      setEditLoading(false)
    }
  }

  // If user is not logged in, show login/register options
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="mb-6">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mx-auto flex items-center justify-center">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Your Profile</h2>
            <p className="text-gray-600 mb-8">Please login or create an account to view your profile</p>

            <div className="space-y-3">
              <Link
                to="/auth/login"
                className="block w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition font-medium shadow-md hover:shadow-lg"
              >
                Login to Your Account
              </Link>

              <Link
                to="/auth/register"
                className="block w-full bg-white border-2 border-blue-600 text-blue-600 py-3 rounded-lg hover:bg-blue-50 transition font-medium"
              >
                Create New Account
              </Link>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                New to Job Community Portal?{' '}
                <Link to="/" className="text-blue-600 hover:text-blue-700 font-medium">
                  Learn more
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-32"></div>
          <div className="px-8 pb-8">
            <div className="flex items-end justify-between -mt-16 mb-6">
              <div className="flex items-end gap-4">
                <div className="w-32 h-32 bg-white rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                  <svg className="w-16 h-16 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">
                    {userData?.name || currentUser.displayName || 'User'}
                  </h1>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      userRole === 'company' ? 'bg-blue-100 text-blue-800' :
                      userRole === 'recruiter' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {userRole === 'job-seeker' ? '👤 Job Seeker' :
                       userRole === 'recruiter' ? '🎯 Recruiter' :
                       userRole === 'company' ? '🏢 Company' : '👤 User'}
                    </span>
                    {currentUser.emailVerified && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        ✓ Verified
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={openEdit}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition font-medium shadow-md hover:shadow-lg flex items-center gap-2"
                >
                  Edit Profile
                </button>

                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition font-medium shadow-md hover:shadow-lg flex items-center gap-2"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Profile Information Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Contact Information Card */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Contact Information
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Email</p>
                  <p className="text-gray-900">{userData?.email || currentUser.email}</p>
                </div>
              </div>

              {userData?.mobile && (
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Mobile</p>
                    <p className="text-gray-900">{userData.mobile || '—'}</p>
                  </div>
                </div>
              )}

              {userData?.address && (
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Address</p>
                    <p className="text-gray-900">{userData.address || '—'}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Professional Information Card */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Professional Details
            </h2>
            <div className="space-y-4">
              {userData?.position && (
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Position</p>
                    <p className="text-gray-900 font-semibold">{userData.position || '—'}</p>
                  </div>
                </div>
              )}

              {userData?.experience && (
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Experience</p>
                    <p className="text-gray-900">{userData.experience || '—'}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Member Since</p>
                  <p className="text-gray-900">
                    {userData?.createdAt ? new Date(userData.createdAt.seconds * 1000).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : 'Recently joined'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Documents Card */}
        {(userData?.cvUrl || userData?.certificatesUrl) && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Documents
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {userData?.cvUrl && (
                <a
                  href={userData.cvUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 border-2 border-blue-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition group"
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">CV / Resume</p>
                    <p className="text-sm text-gray-500">Click to download</p>
                  </div>
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </a>
              )}

              {userData?.certificatesUrl && (
                <a
                  href={userData.certificatesUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 border-2 border-green-200 rounded-lg hover:border-green-400 hover:bg-green-50 transition group"
                >
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">Certificate</p>
                    <p className="text-sm text-gray-500">Click to download</p>
                  </div>
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </a>
              )}
            </div>
          </div>
        )}

        {/* Edit Profile Modal */}
        {isEditing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 px-4">
            <div className="bg-white w-full max-w-2xl rounded-xl shadow-xl overflow-auto max-h-[90vh]">
              <div className="p-6 border-b">
                <h3 className="text-xl font-semibold">Edit Profile</h3>
                <p className="text-sm text-gray-500 mt-1">Update your personal & professional details</p>
              </div>

              <form onSubmit={handleUpdateProfile} className="p-6 space-y-4">
                {editErrors.global && (
                  <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded">{editErrors.global}</div>
                )}
                {editSuccess && (
                  <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded">{editSuccess}</div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Full name</label>
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      className="mt-1 w-full px-3 py-2 border rounded"
                    />
                    {editErrors.name && <p className="text-sm text-red-500 mt-1">{editErrors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Mobile</label>
                    <input
                      name="mobile"
                      value={form.mobile}
                      onChange={handleChange}
                      placeholder="10 digit mobile"
                      className="mt-1 w-full px-3 py-2 border rounded"
                    />
                    {editErrors.mobile && <p className="text-sm text-red-500 mt-1">{editErrors.mobile}</p>}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Address</label>
                    <textarea
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      rows={2}
                      className="mt-1 w-full px-3 py-2 border rounded"
                    />
                    {editErrors.address && <p className="text-sm text-red-500 mt-1">{editErrors.address}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Position</label>
                    <input
                      name="position"
                      value={form.position}
                      onChange={handleChange}
                      className="mt-1 w-full px-3 py-2 border rounded"
                    />
                    {editErrors.position && <p className="text-sm text-red-500 mt-1">{editErrors.position}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Experience</label>
                    <input
                      name="experience"
                      value={form.experience}
                      onChange={handleChange}
                      placeholder="e.g., 3 years / Fresher"
                      className="mt-1 w-full px-3 py-2 border rounded"
                    />
                    {editErrors.experience && <p className="text-sm text-red-500 mt-1">{editErrors.experience}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">CV URL</label>
                    <input
                      name="cvUrl"
                      value={form.cvUrl}
                      onChange={handleChange}
                      placeholder="https://..."
                      className="mt-1 w-full px-3 py-2 border rounded"
                    />
                    {editErrors.cvUrl && <p className="text-sm text-red-500 mt-1">{editErrors.cvUrl}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Certificate URL</label>
                    <input
                      name="certificatesUrl"
                      value={form.certificatesUrl}
                      onChange={handleChange}
                      placeholder="https://..."
                      className="mt-1 w-full px-3 py-2 border rounded"
                    />
                    {editErrors.certificatesUrl && <p className="text-sm text-red-500 mt-1">{editErrors.certificatesUrl}</p>}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={closeEdit}
                    className="px-4 py-2 rounded border hover:bg-gray-50"
                    disabled={editLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                    disabled={editLoading}
                  >
                    {editLoading ? 'Saving...' : 'Save changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Profile
                