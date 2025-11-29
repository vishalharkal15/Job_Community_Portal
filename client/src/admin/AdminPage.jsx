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
  const [meetings, setMeetings] = useState([]);

  const [error, setError] = useState("");

  const ROLES = ["super-admin", "admin", "job-seeker", "recruiter", "company"];

  const fetchAdminData = async (token) => {
    try {
      const [usersRes, jobsRes, blogsRes, meetingsRes] = await Promise.all([
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
      ]);

      setUsers(usersRes.data.users || []);
      setJobs(jobsRes.data.jobs || []);
      setBlogs(blogsRes.data.blogs || []);
      setMeetings(meetingsRes.data.meetings || []);
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
  }, []);

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

  const approveMeeting = async (meeting) => {
    const date = prompt("Select meeting date (YYYY-MM-DD):");
    const time = prompt("Select meeting time (HH:MM):");

    if (!date || !time) return alert("Date and time required.");

    const token = await auth.currentUser.getIdToken();

    try {
      await axios.put(
        `http://localhost:5000/admin/meetings/${meeting.id}/approve`,
        { date, time },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Meeting Approved & Zoom link sent!");

      setMeetings((prev) =>
        prev.map((m) =>
          m.id === meeting.id ? { ...m, status: "approved" } : m
        )
      );
    } catch (err) {
      console.error(err);
      alert("Approval failed");
    }
  };

  const declineMeeting = async (meeting) => {
    const reason = prompt("Enter decline reason:");

    const token = await auth.currentUser.getIdToken();

    try {
      await axios.put(
        `http://localhost:5000/admin/meetings/${meeting.id}/decline`,
        { reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMeetings((prev) =>
        prev.map((m) =>
          m.id === meeting.id ? { ...m, status: "declined" } : m
        )
      );
    } catch (err) {
      console.error(err);
      alert("Decline failed");
    }
  };

  if (loading)
    return <div className="p-10 text-center text-xl">Loading...</div>;

  if (error)
    return <div className="p-10 text-center text-red-600 text-xl">{error}</div>;

  const isAdmin = ["admin", "super-admin"].includes(currentUserRole);
  const isSuperAdmin = currentUserRole === "super-admin";

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

        <section className="bg-white shadow-md rounded-lg p-6 md:col-span-1">
          <h2 className="text-xl font-semibold mb-4">Users</h2>

          <div className="space-y-3 max-h-96 overflow-auto">
            {users.map(u => (
              <div
                key={u.id}
                className="border p-3 rounded-md flex justify-between items-center"
              >
                <div>
                  <p className="font-medium">{u.name}</p>
                  <p className="text-sm">{u.email}</p>
                  <p className="text-blue-600 font-semibold text-sm">{u.role}</p>
                </div>

                {isSuperAdmin ? (
                  <select
                    value={u.role}
                    onChange={(e) =>
                      updateUserRole(u.id, e.target.value)
                    }
                    className="border px-2 py-1 rounded-md"
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
        </section>

        <section className="bg-white shadow-md rounded-lg p-6 md:col-span-1">
          <h2 className="text-xl font-semibold mb-4">Jobs</h2>
          <div className="space-y-3 max-h-96 overflow-auto">
            {jobs.map((job) => (
              <div key={job.id} className="border p-3 rounded-md">
                <p className="font-medium">{job.title}</p>
                <p className="text-sm">{job.company}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white shadow-md rounded-lg p-6 md:col-span-1">
          <h2 className="text-xl font-semibold mb-4">Blogs</h2>
          <div className="space-y-3 max-h-96 overflow-auto">
            {blogs.map((blog) => (
              <div key={blog.id} className="border p-3 rounded-md">
                <p className="font-medium">{blog.title}</p>
                <p className="text-sm text-gray-600">
                  {blog.authorName || "Unknown"}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white shadow-md rounded-lg p-6 md:col-span-1">
          <h2 className="text-xl font-semibold mb-4">Meeting Requests</h2>

          <div className="space-y-3 max-h-96 overflow-auto">
            {meetings.map((m) => (
              <div
                key={m.id}
                className="border p-3 rounded-md"
              >
                <p className="font-semibold">{m.name}</p>
                <p className="text-sm">{m.email}</p>
                <p className="text-sm font-bold">{m.purpose}</p>

                <p className={`mt-1 text-sm ${
                  m.status === "pending"
                    ? "text-yellow-600"
                    : m.status === "approved"
                    ? "text-green-600"
                    : "text-red-600"
                }`}>
                  Status: {m.status}
                </p>

                {m.status === "pending" && isAdmin && (
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => approveMeeting(m)}
                      className="bg-green-600 text-white px-3 py-1 rounded"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => declineMeeting(m)}
                      className="bg-red-600 text-white px-3 py-1 rounded"
                    >
                      Decline
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

      </div>

      {!isSuperAdmin && (
        <p className="text-center text-sm text-gray-500 mt-6">
          You are an <b>admin</b>. Role editing is disabled.
        </p>
      )}

    </div>
  );
}
