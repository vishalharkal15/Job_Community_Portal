import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase/firebaseConfig'
import { formatBlogTime } from '../utils/date'

function Profile() {
  const { currentUser, userRole, signOut } = useAuth()
  const [companyData, setCompanyData] = useState(null)
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
    experienceUnit: 'years',
    cvUrl: '',
    certificatesUrl: '',
    companyName: '',
    companyAddress: '',
    companyDescription: '',
    companyLogoUrl: '',
    gender: '',
  })

  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        const token = await currentUser.getIdToken();

        const res = await axios.get(
          "http://localhost:5000/user/profile",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // backend should return { profile, company }
        setUserData(res.data.profile);
        setCompanyData(res.data.company || null);

        // prefill edit form
        const data = res.data.profile;
        setForm({
          name: data.name || "",
          mobile: data.mobile || "",
          address: data.address || "",
          position: data.position || "",
          experience:
            typeof data.experience === "object"
              ? Number(data.experience.value)
              : Number(data.experience) || "",
          experienceUnit:
            typeof data.experience === "object"
              ? data.experience.unit
              : "years",
          cvUrl: data.cvUrl || "",
          certificatesUrl: data.certificatesUrl || "",
          companyName: data.companyName || "",
          gender: data.gender || "",
        });

      } catch (err) {
        console.error("Profile fetch error:", err);
        setError("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [currentUser]);

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
      experience: typeof userData?.experience === "object"
          ? Number(userData.experience.value)
          : Number(userData?.experience) || '',
      experienceUnit: typeof userData?.experience === "object"
          ? userData.experience.unit
          : "years",
      cvUrl: userData?.cvUrl || '',
      certificatesUrl: userData?.certificatesUrl || '',
      companyName: userData?.companyName || '',
      companyAddress: userData?.companyAddress || '',
      companyDescription: userData?.companyDescription || '',
      companyLogoUrl: userData?.companyLogo || '',
      gender: userData?.gender || '',
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
    if (form.experience === "" || isNaN(form.experience)) {
      errs.experience = "Experience must be a number";
    } else if (form.experience < 0) {
      errs.experience = "Experience cannot be negative";
    }
    if (!form.gender.trim()) errs.gender = "Gender is required";
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
        experience: {
          value: parseInt(form.experience) || 0,
          unit: form.experienceUnit || "years"
        },
        cvUrl: form.cvUrl?.trim() || null,
        certificatesUrl: form.certificatesUrl?.trim() || null,
        companyName: form.companyName.trim(),
        gender: form.gender,
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
      // Fetch extended profile with company info
      try {
        const token = await currentUser.getIdToken();
        const res = await axios.get("http://localhost:5000/user/profile", {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.data?.company) {
          setUserData(prev => ({
            ...prev,
            companyName: res.data.company.name,
            companyLogo: res.data.company.logoUrl,
            companyOwnerId: res.data.company.ownerId,
            companyAddress: res.data.company.address,
            companyDescription: res.data.company.description
          }));
        }
      } catch (e) {
        console.error("Company fetch error:", e);
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 text-gray-900 dark:text-gray-100">
        <div className="max-w-md mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
            <div className="mb-6">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mx-auto flex items-center justify-center">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Welcome to Your Profile</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8">Please login or create an account to view your profile</p>

            <div className="space-y-3">
              <Link
                to="/auth/login"
                className="block w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition font-medium shadow-md hover:shadow-lg"
              >
                Login to Your Account
              </Link>

              <Link
                to="/auth/register"
                className="block w-full bg-white dark:bg-gray-900 border-2 border-blue-600 text-blue-600 dark:text-blue-300 py-3 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-800 transition font-medium"
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 flex items-center justify-center text-gray-900 dark:text-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300 font-medium">Loading your profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 text-gray-900 dark:text-gray-100">
      <div className="max-w-4xl mx-auto">
        {/* Header Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-28"></div>
          <div className="px-4 sm:px-6 pb-8">
            <div className="-mt-16 mb-6 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
              <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4">
                <div className="w-24 h-24 sm:w-32 sm:h-32 bg-white dark:bg-gray-700 rounded-full ring-4 ring-white dark:ring-gray-800 shadow-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-12 h-12 sm:w-16 sm:h-16 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>

                <div className="mb-2 text-center sm:text-left">
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 sm:px-6 py-2 sm:py-3 rounded-xl shadow-lg inline-block">
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white leading-tight break-words">
                      {userData?.name || currentUser.displayName || 'User'}
                    </h1>
                  </div>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      userRole === 'company' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                      userRole === 'recruiter' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                    }`}>
                      {userRole === 'job-seeker' ? '👤 Job Seeker' :
                       userRole === 'recruiter' ? '🎯 Recruiter' :
                       userRole === 'company' ? '🏢 Company' : '👤 User'}
                    </span>
                    {currentUser.emailVerified && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        ✓ Verified
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-center sm:justify-start lg:justify-end gap-2 sm:gap-3">
                {(userRole === 'admin' || userRole === 'super-admin') && (
                  <button
                    onClick={() => navigate('/admin')}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 transition font-medium shadow-md hover:shadow-lg flex items-center gap-2 text-sm sm:text-base"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Admin
                  </button>
                )}
                
                <button
                  onClick={openEdit}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition font-medium shadow-md hover:shadow-lg text-sm sm:text-base"
                >
                  Edit Profile
                </button>

                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 sm:px-4 py-2 rounded-lg transition font-medium shadow-md hover:shadow-lg text-sm sm:text-base"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* ⭐ If company exists show company card, else show Visit Companies */}
        {companyData ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 mb-6">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {companyData?.logoUrl && (
                  <img
                    src={companyData.logoUrl}
                    alt="Company Logo"
                    className="w-16 h-16 rounded-lg border-2 border-gray-200 dark:border-gray-700 shadow-md object-cover"
                  />
                )}

                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">
                    Company
                  </p>

                  <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    {userData.companyName}

                    {/* ⭐ Show ONLY pending status */}
                    {companyData?.status === "pending" && (
                      <span className="px-3 py-1 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                        Pending Approval
                      </span>
                    )}
                  </h3>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full lg:w-auto">
                {/* ⭐ Allow editing/dashboard buttons ONLY for owners */}
                {companyData?.owners?.includes(currentUser.uid) && (
                  <>
                    <button
                      onClick={() => navigate("/company/edit")}
                      className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg transition font-medium shadow-md hover:shadow-lg text-sm sm:text-base"
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit Company
                    </button>

                    <button
                      onClick={() => navigate("/company/dashboard")}
                      className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg transition font-medium shadow-md hover:shadow-lg text-sm sm:text-base"
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      Dashboard
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* ⭐ When NO companyData returned */
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6 text-center">
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              You are not associated with any company.
            </p>
            <button
              onClick={() => navigate("/companies")}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Visit Companies
            </button>
          </div>
        )}

        {/* Profile Information Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Contact Information Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
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
                  <p className="text-sm text-gray-500 dark:text-gray-300 font-medium">Email</p>
                  <p className="text-gray-900 dark:text-gray-100">{userData?.email || currentUser.email}</p>
                </div>
              </div>

              {userData?.mobile && (
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-300 font-medium">Mobile</p>
                    <p className="text-gray-900 dark:text-gray-100">{userData.mobile || '—'}</p>
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
                    <p className="text-sm text-gray-500 dark:text-gray-300 font-medium">Address</p>
                    <p className="text-gray-900 dark:text-gray-100">{userData.address || '—'}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Professional Information Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
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
                    <p className="text-sm text-gray-500 dark:text-gray-300 font-medium">Position</p>
                    <p className="text-gray-900 dark:text-gray-100 font-semibold">{userData.position || '—'}</p>
                  </div>
                </div>
              )}

              {userData?.experience && (
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-300 font-medium">Experience</p>
                    <p className="text-gray-900 dark:text-gray-100">
  {typeof userData.experience === "object"
    ? `${userData.experience.value} ${userData.experience.unit}`
    : userData.experience}
</p>

                  </div>
                </div>
              )}

              {userData?.gender && (
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-300 font-medium">Gender</p>
                    <p className="text-gray-900 dark:text-gray-100 capitalize">{userData.gender}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-300 font-medium">Member Since</p>
                  <p className="text-gray-900 dark:text-gray-100">
                    {userData?.createdAt ? formatBlogTime(userData.createdAt) : 'Recently joined'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Documents Card */}
        {(userData?.cvUrl || userData?.certificatesUrl) && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
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
                  className="flex items-center gap-3 p-4 border-2 border-blue-200 dark:border-blue-800 rounded-lg hover:border-blue-400 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-gray-700 transition group"
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-gray-100">CV / Resume</p>
                    <p className="text-sm text-gray-500 dark:text-gray-300">Click to download</p>
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
                  className="flex items-center gap-3 p-4 border-2 border-green-200 dark:border-green-800 rounded-lg hover:border-green-400 dark:hover:border-green-600 hover:bg-green-50 dark:hover:bg-gray-700 transition group"
                >
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-gray-100">Certificate</p>
                    <p className="text-sm text-gray-500 dark:text-gray-300">Click to download</p>
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
            <div className="bg-white dark:bg-gray-800 dark:text-gray-100 w-full max-w-2xl rounded-xl shadow-xl overflow-auto max-h-[90vh]">
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
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full name</label>
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      className="mt-1 w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                    />
                    {editErrors.name && <p className="text-sm text-red-500 mt-1">{editErrors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Mobile</label>
                    <input
                      name="mobile"
                      value={form.mobile}
                      onChange={handleChange}
                      placeholder="10 digit mobile"
                      className="mt-1 w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                    />
                    {editErrors.mobile && <p className="text-sm text-red-500 mt-1">{editErrors.mobile}</p>}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Address</label>
                    <textarea
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      rows={2}
                      className="mt-1 w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                    />
                    {editErrors.address && <p className="text-sm text-red-500 mt-1">{editErrors.address}</p>}
                  </div>

                  <div  className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Gender
                    </label>
                    <select
                      name="gender"
                      value={form.gender}
                      onChange={handleChange}
                      className="mt-1 w-full px-3 py-2 border rounded bg-white dark:bg-gray-700
                                border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>

                    {editErrors.gender && (
                      <p className="text-sm text-red-500 mt-1">{editErrors.gender}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Company Name
                    </label>
                    <input
                      name="companyName"
                      value={form.companyName}
                      onChange={handleChange}
                      className="mt-1 w-full px-3 py-2 border rounded bg-white dark:bg-gray-700
                                border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Position</label>
                    <input
                      name="position"
                      value={form.position}
                      onChange={handleChange}
                      className="mt-1 w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                    />
                    {editErrors.position && <p className="text-sm text-red-500 mt-1">{editErrors.position}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Experience</label>
                    
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min="0"
                        name="experience"
                        value={form.experience}
                        onChange={handleChange}
                        placeholder="e.g., 3"
                        className="mt-1 w-full px-3 py-2 border rounded bg-white dark:bg-gray-700
                                  border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                      />
                      
                      <select
                        name="experienceUnit"
                        value={form.experienceUnit}
                        onChange={handleChange}
                        className="mt-1 px-3 py-2 border rounded bg-white dark:bg-gray-700
                                  border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                      >
                        <option value="years">Years</option>
                        <option value="months">Months</option>
                      </select>
                    </div>

                    {editErrors.experience && <p className="text-sm text-red-500 mt-1">{editErrors.experience}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">CV URL</label>
                    <input
                      name="cvUrl"
                      value={form.cvUrl}
                      onChange={handleChange}
                      placeholder="https://..."
                      className="mt-1 w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                    />
                    {editErrors.cvUrl && <p className="text-sm text-red-500 mt-1">{editErrors.cvUrl}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Certificate URL</label>
                    <input
                      name="certificatesUrl"
                      value={form.certificatesUrl}
                      onChange={handleChange}
                      placeholder="https://..."
                      className="mt-1 w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                    />
                    {editErrors.certificatesUrl && <p className="text-sm text-red-500 mt-1">{editErrors.certificatesUrl}</p>}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={closeEdit}
                    className="px-4 py-2 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-100"
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