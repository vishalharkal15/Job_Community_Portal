"use client";

import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { auth } from "../firebase/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { BarChart3, Users, Briefcase, FileText, Calendar, TrendingUp, Activity } from "lucide-react";

export default function AdminPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [currentUserRole, setCurrentUserRole] = useState("");
  const [companies, setCompanies] = useState([]);

  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [meetings, setMeetings] = useState([]);

  const [error, setError] = useState("");
  const [meetingFilter, setMeetingFilter] = useState("all"); // all, pending, approved, declined
  const [userRoleFilter, setUserRoleFilter] = useState("all"); // all, or specific role
  const [jobTypeFilter, setJobTypeFilter] = useState("all"); // all, full-time, part-time, etc.
  const [refresh, setRefresh] = useState(0);

  const ROLES = ["super-admin", "admin", "job-seeker", "recruiter", "company"];

  const fetchAdminData = async (token) => {
    try {
      const [usersRes, jobsRes, blogsRes, meetingsRes, companiesRes ] = await Promise.all([
        axios.get("http://localhost:5000/admin/users", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:5000/admin/jobs", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:5000/admin/blogs", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:5000/admin/meetings", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:5000/admin/companies/pending", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setUsers(usersRes.data.users || []);
      setJobs(jobsRes.data.jobs || []);
      setBlogs(blogsRes.data.blogs || []);
      setMeetings(meetingsRes.data.meetings || []);
      setCompanies(companiesRes.data.companies || []);
    } catch (err) {
      console.error(err);
      setError("Unable to load admin dashboard data.");
    }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setError("Not authenticated");
        setLoading(false);
        return;
      }

      const token = await user.getIdToken();

      try {
        const profileRes = await axios.get(
          "http://localhost:5000/user/profile",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const role = profileRes.data.profile.role;
        setCurrentUserRole(role);

        if (role === "super-admin" || role === "admin") {
          await fetchAdminData(token);
        } else {
          setError("You do not have admin access.");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load user profile.");
      }

      setLoading(false);
    });

    return () => unsub();
  }, [refresh]);

  useEffect(() => {
    if (location.state?.refresh) {
      setRefresh(prev => prev + 1);
    }
  }, [location.state]);

  const updateUserRole = async (userId, newRole) => {
    if (currentUserRole !== "super-admin") return;

    const token = await auth.currentUser.getIdToken();

    try {
      await axios.put(
        "http://localhost:5000/admin/update-role",
        { userId, newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
    } catch (err) {
      console.error(err);
      setError("Failed to update role.");
    }
  };

  const approveCompany = async (company) => {
    const token = await auth.currentUser.getIdToken();
    try {
      await axios.put(
        `http://localhost:5000/admin/companies/${company.id}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRefresh(p => p + 1);
    } catch (err) {
      console.error(err);
      setError("Failed to approve company.");
    }
  };

  const rejectCompany = async (company) => {
    const token = await auth.currentUser.getIdToken();
    try {
      await axios.put(
        `http://localhost:5000/admin/companies/${company.id}/reject`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRefresh(p => p + 1);
    } catch (err) {
      console.error(err);
      setError("Failed to reject company.");
    }
  };

  const approveMeeting = (meeting) => {
    navigate("/admin/meeting-approval", { state: { meeting, action: "approve" } });
  };

  const declineMeeting = (meeting) => {
    navigate("/admin/meeting-approval", { state: { meeting, action: "decline" } });
  };

  if (loading)
    return <div className="p-10 text-center text-xl">Loading...</div>;

  if (error)
    return <div className="p-10 text-center text-red-600 text-xl">{error}</div>;

  const isAdmin = ["admin", "super-admin"].includes(currentUserRole);
  const isSuperAdmin = currentUserRole === "super-admin";

  // Calculate statistics
  const usersByRole = ROLES.reduce((acc, role) => {
    acc[role] = users.filter(u => u.role === role).length;
    return acc;
  }, {});

  const pendingMeetings = meetings.filter(m => m.status === 'pending').length;
  const approvedMeetings = meetings.filter(m => m.status === 'approved').length;
  const declinedMeetings = meetings.filter(m => m.status === 'declined').length;

  const totalUsers = users.length;
  const totalJobs = jobs.length;
  const totalBlogs = blogs.length;
  const totalMeetings = meetings.length;

  // Bar Chart Component
  const BarChart = ({ data, label, color }) => {
    const maxValue = Math.max(...data.map(d => d.value), 1);
    
    return (
      <div className="space-y-3">
        {data.map((item, idx) => (
          <div key={idx}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-700 dark:text-gray-300">{item.label}</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">{item.value}</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div
                className={`${color} h-3 rounded-full transition-all duration-500`}
                style={{ width: `${(item.value / maxValue) * 100}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
            <Activity className="w-10 h-10 text-blue-600" />
            Admin Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Overview and management of all platform resources</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Users Card */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Users</p>
                <p className="text-4xl font-bold mt-2">{totalUsers}</p>
              </div>
              <Users className="w-12 h-12 text-blue-200" />
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span>Active Platform</span>
            </div>
          </div>

          {/* Jobs Card */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Total Jobs</p>
                <p className="text-4xl font-bold mt-2">{totalJobs}</p>
              </div>
              <Briefcase className="w-12 h-12 text-green-200" />
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span>Job Listings</span>
            </div>
          </div>

          {/* Blogs Card */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Total Blogs</p>
                <p className="text-4xl font-bold mt-2">{totalBlogs}</p>
              </div>
              <FileText className="w-12 h-12 text-purple-200" />
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span>Published</span>
            </div>
          </div>

          {/* Meetings Card */}
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Meetings</p>
                <p className="text-4xl font-bold mt-2">{totalMeetings}</p>
              </div>
              <Calendar className="w-12 h-12 text-orange-200" />
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="bg-orange-400 px-2 py-1 rounded-full text-xs">{pendingMeetings} Pending</span>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Users by Role Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Users by Role</h2>
            </div>
            <BarChart
              data={ROLES.map(role => ({
                label: role.charAt(0).toUpperCase() + role.slice(1).replace('-', ' '),
                value: usersByRole[role] || 0
              }))}
              color="bg-blue-600"
            />
          </div>

          {/* Meeting Status Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 className="w-6 h-6 text-orange-600" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Meeting Status</h2>
            </div>
            <BarChart
              data={[
                { label: 'Pending', value: pendingMeetings },
                { label: 'Approved', value: approvedMeetings },
                { label: 'Declined', value: declinedMeetings }
              ]}
              color="bg-orange-600"
            />
          </div>
        </div>

        {/* Data Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Users Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Users className="w-6 h-6 text-blue-600" />
                Users ({userRoleFilter === 'all' ? totalUsers : users.filter(u => u.role === userRoleFilter).length})
              </h2>
              
              {/* Role Filter Dropdown */}
              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="px-4 py-2 rounded-lg text-sm font-medium border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="all">All Roles</option>
                <option value="super-admin">Super-admin</option>
                <option value="admin">Admin</option>
                <option value="job-seeker">Job-seeker</option>
                <option value="recruiter">Recruiter</option>
                <option value="company">Company</option>
              </select>
            </div>
            
            <div className="space-y-3 max-h-96 overflow-auto">
              {users
                .filter(u => userRoleFilter === 'all' || u.role === userRoleFilter)
                .map(u => (
                <div
                  key={u.id}
                  className="border border-gray-200 dark:border-gray-700 p-3 rounded-lg flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{u.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{u.email}</p>
                    <p className="text-blue-600 dark:text-blue-400 font-semibold text-sm mt-1">{u.role}</p>
                  </div>
                  {isSuperAdmin ? (
                    <select
                      value={u.role}
                      onChange={(e) => updateUserRole(u.id, e.target.value)}
                      className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-2 py-1 rounded-md text-sm"
                    >
                      {ROLES.map(r => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-gray-400 text-sm">Read-only</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Jobs Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Briefcase className="w-6 h-6 text-green-600" />
                Jobs ({jobTypeFilter === 'all' ? totalJobs : jobs.filter(j => (j.type || 'Full-time') === jobTypeFilter).length})
              </h2>
              
              {/* Job Type Filter Dropdown */}
              <select
                value={jobTypeFilter}
                onChange={(e) => setJobTypeFilter(e.target.value)}
                className="px-4 py-2 rounded-lg text-sm font-medium border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer"
              >
                <option value="all">All Types</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
              </select>
            </div>
            
            <div className="space-y-3 max-h-96 overflow-auto">
              {jobs
                .filter(j => jobTypeFilter === 'all' || (j.type || 'Full-time') === jobTypeFilter)
                .map((job) => (
                <div key={job.id} className="border border-gray-200 dark:border-gray-700 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                  <p className="font-medium text-gray-900 dark:text-gray-100">{job.title}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{job.company}</p>
                  <div className="flex gap-2 mt-2">
                    <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-full">
                      {job.type || 'Full-time'}
                    </span>
                    <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full">
                      {job.location || 'Remote'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Blogs Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <FileText className="w-6 h-6 text-purple-600" />
              Blogs ({totalBlogs})
            </h2>
            <div className="space-y-3 max-h-96 overflow-auto">
              {blogs.map((blog) => (
                <div key={blog.id} className="border border-gray-200 dark:border-gray-700 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                  <p className="font-medium text-gray-900 dark:text-gray-100">{blog.title}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    By {blog.authorName || "Unknown"}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    {blog.createdAt ? new Date(blog.createdAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              ))}
            </div>
          </div>
          
          {/* Pending Companies Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">
              Pending Companies ({companies.length})
            </h2>

            <div className="space-y-3 max-h-96 overflow-auto">
              {companies.map((c) => (
                <div key={c.id} className="border border-gray-200 dark:border-gray-700 p-3 rounded-lg">
                  <p className="font-medium text-gray-900 dark:text-gray-100">{c.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Owner ID: {c.owners?.[0]}</p>

                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => approveCompany(c)}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-sm"
                    >
                      Approve
                    </button>

                    <button
                      onClick={() => rejectCompany(c)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg text-sm"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Meeting Requests Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Calendar className="w-6 h-6 text-orange-600" />
                Meeting Requests ({meetingFilter === 'all' ? totalMeetings : meetings.filter(m => m.status === meetingFilter).length})
              </h2>
              
              {/* Filter Dropdown */}
              <select
                value={meetingFilter}
                onChange={(e) => setMeetingFilter(e.target.value)}
                className="px-4 py-2 rounded-lg text-sm font-medium border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="declined">Declined</option>
              </select>
            </div>
            
            <div className="space-y-3 max-h-96 overflow-auto">
              {meetings
                .filter(m => meetingFilter === 'all' || m.status === meetingFilter)
                .map((m) => (
                <div
                  key={m.id}
                  className="border border-gray-200 dark:border-gray-700 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  <p className="font-semibold text-gray-900 dark:text-gray-100">{m.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{m.email}</p>
                  <p className="text-sm font-bold text-gray-800 dark:text-gray-200 mt-1">{m.purpose}</p>
                  <p className={`mt-2 text-sm font-semibold ${
                    m.status === "pending"
                      ? "text-yellow-600 dark:text-yellow-400"
                      : m.status === "approved"
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}>
                    Status: {m.status.toUpperCase()}
                  </p>
                  {m.status === "pending" && isAdmin && (
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => approveMeeting(m)}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-sm transition"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => declineMeeting(m)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg text-sm transition"
                      >
                        Decline
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {!isSuperAdmin && (
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              You are an <b>admin</b>. Role editing is disabled. Contact super-admin for permissions.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
