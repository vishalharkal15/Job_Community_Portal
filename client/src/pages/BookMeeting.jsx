import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function BookMeeting() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // State to prevent page from rendering too early
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Main form data
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    purpose: "",
    message: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const purposes = [
    'Job Interview',
    'Career Counseling',
    'Resume Review',
    'Consultation',
    'Technical Discussion',
    'Other'
  ];

  // Redirect if NOT authenticated
  useEffect(() => {
    if (!currentUser) {
      navigate("/auth/login");
    } else {
      setCheckingAuth(false);
    }
  }, [currentUser, navigate]);

  // Fetch Firestore user profile → Autofill Name, Email, Mobile
  useEffect(() => {
    const fetchProfile = async () => {
      if (!currentUser) return;

      const token = await currentUser.getIdToken();

      const res = await fetch("http://localhost:5000/user/profile", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (data.profile) {
        setFormData(prev => ({
          ...prev,
          name: data.profile.name || currentUser.displayName || "",
          email: data.profile.email || currentUser.email || "",
          phone: data.profile.mobile || ""
        }));
      }
    };

    fetchProfile();
  }, [currentUser]);

  // Submit meeting-request
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccess(false);

    try {
      const response = await fetch("http://localhost:5000/meeting-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);

        // Reset only non-autofill fields
        setFormData(prev => ({
          ...prev,
          phone: prev.phone,
          name: prev.name,
          email: prev.email,
          purpose: "",
          message: ""
        }));
      } else {
        alert("Failed to submit request");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Server error");
    }

    setIsSubmitting(false);
  };

  // Change handler for inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Show while checking login
  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl">
        Checking authentication...
      </div>
    );
  }

  // Main UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12 text-gray-900 dark:text-gray-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-600 text-white p-4 rounded-full">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 
                     002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 
                     002 2z" />
              </svg>
            </div>
          </div>

          <h1 className="text-4xl font-bold dark:text-white mb-4">Book a Meeting</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-2">
            Request a Zoom meeting with our team
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Admin will approve and send date, time & Zoom link
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-white dark:bg-gray-700 rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
            <h2 className="text-2xl font-bold text-white">Meeting Request Form</h2>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">

            {success && (
              <div className="bg-green-50 dark:bg-green-900 border-l-4 border-green-500 p-4">
                <h3 className="text-green-800 dark:text-green-200 font-semibold">
                  Request Submitted Successfully!
                </h3>
                <p className="text-green-700 dark:text-green-300 text-sm">
                  Check your email for confirmation.
                </p>
              </div>
            )}

            {/* Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-600"
                placeholder="Full Name"
              />

              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-600"
                placeholder="Email Address"
              />

              <input
                type="tel"
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-600"
                placeholder="Phone Number"
              />

              <select
                name="purpose"
                required
                value={formData.purpose}
                onChange={handleChange}
                className="w-full px-4 py-3 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-600"
              >
                <option value="">Select purpose</option>
                {purposes.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            <textarea
              name="message"
              rows="4"
              value={formData.message}
              onChange={handleChange}
              className="w-full px-4 py-3 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-600"
              placeholder="Additional message (optional)"
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-4 rounded-lg font-semibold text-white text-lg transition-all ${
                isSubmitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:scale-105'
              }`}
            >
              {isSubmitting ? "Submitting..." : "Submit Meeting Request"}
            </button>

          </form>
        </div>

      </div>
    </div>
  );
}

export default BookMeeting;
