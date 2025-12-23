import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { db } from "../../firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { formatBlogTime } from "../../utils/date";
import { useAuth } from "../../context/AuthContext";
import { 
  Briefcase, 
  Building2, 
  MapPin, 
  DollarSign, 
  Clock, 
  Monitor, 
  Tag, 
  Send, 
  Bookmark, 
  Share2, 
  Edit, 
  Trash2,
  Calendar,
  CheckCircle,
  XCircle
} from "lucide-react";

export default function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { currentUser, userRole } = useAuth();

  const [job, setJob] = useState(null);
  const [editing, setEditing] = useState(false);

  // Action states
  const [saving, setSaving] = useState(false);
  const [applying, setApplying] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Form state for editing
  const [form, setForm] = useState({});

  useEffect(() => {
    loadJob();
  }, []);

  useEffect(() => {
  if (!id) return;

  axios.put(`${import.meta.env.VITE_API_URL}/jobs/${id}/view`)
    .catch(err => console.error("Failed to increment views:", err));
}, [id]);

  // Load job from Firestore
  async function loadJob() {
    const token = currentUser ? await currentUser.getIdToken() : null;

    const res = await axios.get(
      `${import.meta.env.VITE_API_URL}/jobs/${id}`,
      token ? { headers: { Authorization: `Bearer ${token}` } } : {}
    );

    setJob(res.data.job);
    setForm(res.data.job);
  }

  const canEdit =
    currentUser &&
    (currentUser.uid === job?.owner ||
      userRole === "admin" ||
      userRole === "super-admin");

  // ⭐ APPLY Job (APPLICATION-CENTRIC)
  async function applyJob() {
    if (!currentUser) return alert("Login first!");

    setApplying(true);

    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/jobs/${id}/apply`,
        {},
        {
          headers: {
            Authorization: `Bearer ${await currentUser.getIdToken()}`
          }
        }
      );

      // Reload job to refresh appliedBy[]
      await loadJob();

    } catch (e) {
      console.error(e);

      if (e.response?.status === 400) {
        alert(e.response.data.error || "Already applied");
      } else {
        alert("Failed to apply");
      }
    }

    setApplying(false);
  }

  // ⭐ WITHDRAW APPLICATION
  async function withdrawApplication() {
    if (!currentUser) return alert("Login first!");

    const confirmWithdraw = window.confirm(
      "Are you sure you want to withdraw your application?\n\nThis action will notify the recruiter."
    );

    if (!confirmWithdraw) return;

    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/applications/${id}/withdraw`,
        {},
        {
          headers: {
            Authorization: `Bearer ${await currentUser.getIdToken()}`
          }
        }
      );

      // Refresh job data
      await loadJob();

      alert("Application withdrawn successfully");

    } catch (err) {
      console.error(err);
      alert("Failed to withdraw application");
    }
  }

  // ⭐ SAVE Job
  async function saveJob() {
    if (!currentUser) return alert("Login first!");

    setSaving(true);

    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/jobs/${id}/save`,
        {},
        { headers: { Authorization: `Bearer ${await currentUser.getIdToken()}` } }
      );

      loadJob();
    } catch (e) {
      console.error(e);
      alert("Failed to save");
    }

    setSaving(false);
  }

  // ⭐ DELETE Job
  async function deleteJob() {
    if (!window.confirm("Are you sure?")) return;

    setDeleting(true);

    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/jobs/${id}`, {
        headers: { Authorization: `Bearer ${await currentUser.getIdToken()}` },
      });

      alert("Job deleted");
      navigate("/jobs");
    } catch (e) {
      console.error(e);
      alert("Deletion failed");
    }

    setDeleting(false);
  }

  // ⭐ EDIT → SAVE Changes
  async function saveChanges() {
    try {
      const token = await currentUser.getIdToken();

      await axios.put(
        `${import.meta.env.VITE_API_URL}/jobs/${id}/edit`,
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setEditing(false);
      loadJob();
    } catch (err) {
      console.error(err);
      alert("Failed to update job");
    }
  }

  if (!job) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-600 dark:text-gray-400 font-medium">Loading job details...</p>
      </div>
    </div>
  );

  // Determine states
  const isSaved = job.savedBy?.includes(currentUser?.uid);
  const isApplied = job.appliedBy?.includes(currentUser?.uid);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Main Content Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white">
            {!editing ? (
              <>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h1 className="text-3xl md:text-4xl font-extrabold mb-3">{job.title}</h1>
                    <div className="flex flex-wrap items-center gap-4 text-blue-100">
                      <div onClick={() => navigate(`/company/${job.companyId}`)} className="flex items-center gap-2 cursor-pointer hover:underline">
                        <Building2 className="w-5 h-5" />
                        <span className="font-semibold">{job.companyName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-5 h-5" />
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        <span>{formatBlogTime(job.postedAt)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="ml-4">
                    <span className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl text-sm font-semibold">
                      <Briefcase className="w-4 h-4" />
                      {job.type}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-3">
                <input
                  className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Job Title"
                />
              </div>
            )}
          </div>

          {/* Action Buttons Bar */}
          {!editing && (
            <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-8 py-4">
              <div className="flex flex-wrap gap-3">
                {!isApplied ? (
                  <button
                    onClick={applyJob}
                    disabled={applying}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-5 h-5" />
                    {applying ? "Applying..." : "Apply Now"}
                  </button>
                ) : (
                  <button
                    onClick={withdrawApplication}
                    className="inline-flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl hover:bg-red-700 transition-all duration-200 font-semibold"
                  >
                    <XCircle className="w-5 h-5" />
                    Withdraw Application
                  </button>
                )}

                <button
                  onClick={saveJob}
                  disabled={saving}
                  className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-semibold ${
                    isSaved 
                      ? "bg-yellow-500 text-white hover:bg-yellow-600" 
                      : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                  }`}
                >
                  <Bookmark className={`w-5 h-5 ${isSaved ? "fill-current" : ""}`} />
                  {isSaved ? "Saved" : saving ? "Saving..." : "Save Job"}
                </button>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert("Job link copied to clipboard!");
                  }}
                  className="inline-flex items-center gap-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-6 py-3 rounded-xl shadow-lg hover:shadow-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-200 font-semibold"
                >
                  <Share2 className="w-5 h-5" />
                  Share
                </button>

                {canEdit && (
                  <>
                    <button
                      onClick={() => setEditing(true)}
                      className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl hover:bg-indigo-700 transition-all duration-200 font-semibold ml-auto"
                    >
                      <Edit className="w-5 h-5" />
                      Edit
                    </button>

                    <button
                      onClick={deleteJob}
                      disabled={deleting}
                      className="inline-flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl hover:bg-red-700 transition-all duration-200 font-semibold disabled:opacity-50"
                    >
                      <Trash2 className="w-5 h-5" />
                      {deleting ? "Deleting..." : "Delete"}
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Job Details Content */}
          <div className="p-8">
            {/* Company and Location - Edit Mode */}
            {editing && (
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    <Building2 className="w-4 h-4" />
                    Company
                  </label>
                  <input
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100"
                    value={form.company}
                    onChange={(e) => setForm({ ...form, company: e.target.value })}
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    <MapPin className="w-4 h-4" />
                    Location
                  </label>
                  <input
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                  />
                </div>
              </div>
            )}

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-600" />
                Job Description
              </h2>
              {!editing ? (
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{job.description}</p>
              ) : (
                <textarea
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100 resize-none"
                  rows="8"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              )}
            </div>

            {/* Job Details Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Category */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-5 border border-gray-200 dark:border-gray-600">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-2">
                  <Tag className="w-5 h-5" />
                  <span className="text-sm font-semibold">Category</span>
                </div>
                {!editing ? (
                  <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{job.category || "Not specified"}</p>
                ) : (
                  <input
                    className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                  />
                )}
              </div>

              {/* Job Type */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-5 border border-gray-200 dark:border-gray-600">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-2">
                  <Clock className="w-5 h-5" />
                  <span className="text-sm font-semibold">Job Type</span>
                </div>
                {!editing ? (
                  <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{job.type}</p>
                ) : (
                  <select
                    className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100"
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                  >
                    <option>Full-time</option>
                    <option>Part-time</option>
                    <option>Contract</option>
                    <option>Internship</option>
                  </select>
                )}
              </div>

              {/* Salary */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-5 border border-gray-200 dark:border-gray-600">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-2">
                  <DollarSign className="w-5 h-5" />
                  <span className="text-sm font-semibold">Salary Range</span>
                </div>
                {!editing ? (
                  <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    ₹{job.minSalary?.toLocaleString()} - ₹{job.maxSalary?.toLocaleString()}
                  </p>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="number"
                      className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100"
                      value={form.minSalary}
                      onChange={(e) => setForm({ ...form, minSalary: e.target.value })}
                      placeholder="Min"
                    />
                    <input
                      type="number"
                      className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100"
                      value={form.maxSalary}
                      onChange={(e) => setForm({ ...form, maxSalary: e.target.value })}
                      placeholder="Max"
                    />
                  </div>
                )}
              </div>

              {/* Work Mode */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-5 border border-gray-200 dark:border-gray-600">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-2">
                  <Monitor className="w-5 h-5" />
                  <span className="text-sm font-semibold">Work Mode</span>
                </div>
                {!editing ? (
                  <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{job.workMode}</p>
                ) : (
                  <select
                    className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100"
                    value={form.workMode}
                    onChange={(e) => setForm({ ...form, workMode: e.target.value })}
                  >
                    <option>Remote</option>
                    <option>Hybrid</option>
                    <option>Onsite</option>
                  </select>
                )}
              </div>
            </div>

            {/* Edit Mode Action Buttons */}
            {editing && (
              <div className="flex gap-4 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={saveChanges}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 font-semibold"
                >
                  <CheckCircle className="w-5 h-5" />
                  Save Changes
                </button>

                <button
                  onClick={() => setEditing(false)}
                  className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-semibold"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
