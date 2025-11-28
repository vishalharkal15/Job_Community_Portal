"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { auth } from "../firebase/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";

export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [currentUserRole, setCurrentUserRole] = useState("");
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [error, setError] = useState("");

  const ROLES = ["super-admin", "admin", "job-seeker", "recruiter", "company"];

  // 🔹 Fetch admin data (users, jobs, blogs)
  const fetchData = async (token) => {
    try {
      const [usersRes, jobsRes, blogsRes] = await Promise.all([
        axios.get("http://localhost:5000/admin/users", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:5000/admin/jobs", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:5000/admin/blogs", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setUsers(usersRes.data.users || []);
      setJobs(jobsRes.data.jobs || []);
      setBlogs(blogsRes.data.blogs || []);
    } catch (err) {
      console.error(err);
      setError("Unable to load admin dashboard data.");
    }
  };

  // 🔹 Load logged-in user + role
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
          await fetchData(token);
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
  }, []);

  // 🔹 Update Role (Super-Admin only)
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

  // 🔹 Render states
  if (loading)
    return <div className="p-10 text-center text-xl font-semibold">Loading...</div>;

  if (error)
    return <div className="p-10 text-center text-red-600 text-xl">{error}</div>;

  const isSuperAdmin = currentUserRole === "super-admin";

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* USERS LIST */}
        <section className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Users List</h2>

          <div className="space-y-3 max-h-96 overflow-auto">
            {users.map((user) => (
              <div
                key={user.id}
                className="border p-3 rounded-md flex justify-between items-center"
              >
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-gray-600">{user.email}</p>
                  <p className="text-sm text-blue-600 font-semibold">{user.role}</p>
                </div>

                {isSuperAdmin ? (
                  <select
                    value={user.role}
                    onChange={(e) => updateUserRole(user.id, e.target.value)}
                    className="border px-2 py-1 rounded-md"
                  >
                    {ROLES.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="text-sm text-gray-400">Read-only</span>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* JOBS LIST */}
        <section className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Jobs List</h2>
          <div className="space-y-3 max-h-96 overflow-auto">
            {jobs.map((job) => (
              <div key={job.id} className="border p-3 rounded-md">
                <p className="font-medium">{job.title}</p>
                <p className="text-gray-600">{job.company}</p>
              </div>
            ))}
          </div>
        </section>

        {/* BLOGS LIST */}
        <section className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Blogs List</h2>
          <div className="space-y-3 max-h-96 overflow-auto">
            {blogs.map((blog) => (
              <div key={blog.id} className="border p-3 rounded-md">
                <p className="font-medium">{blog.title}</p>
                <p className="text-gray-600 text-sm">
                  {blog.authorName || "Unknown"}
                </p>
              </div>
            ))}
          </div>
        </section>

      </div>

      {!isSuperAdmin && (
        <p className="text-center mt-6 text-sm text-gray-500">
          You are an <strong>admin</strong>. You have read-only access.
        </p>
      )}
    </div>
  );
}
