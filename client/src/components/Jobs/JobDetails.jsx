import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { db } from "../../firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { timeAgo } from "../../utils/date";
import { useAuth } from "../../context/AuthContext";

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

  // Load job from Firestore
  async function loadJob() {
    const snap = await getDoc(doc(db, "jobs", id));
    const data = snap.data();

    if (!data) return;

    const owner = data.postedBy || data.createdBy;

    setJob({
      id: snap.id,
      ...data,
      owner,
      postedAt: data.postedAt?.toDate() || new Date(),
    });

    setForm({
      title: data.title,
      description: data.description,
      company: data.company,
      location: data.location,
      minSalary: data.minSalary,
      maxSalary: data.maxSalary,
      type: data.type,
      workMode: data.workMode,
      category: data.category || "",
    });
  }

  const canEdit =
    currentUser &&
    (currentUser.uid === job?.owner ||
      userRole === "admin" ||
      userRole === "super-admin");

  // ⭐ APPLY Job
  async function applyJob() {
    if (!currentUser) return alert("Login first!");

    setApplying(true);

    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/jobs/${id}/apply`,
        {},
        { headers: { Authorization: `Bearer ${await currentUser.getIdToken()}` } }
      );

      loadJob();
    } catch (e) {
      console.error(e);
      alert("Failed to apply");
    }

    setApplying(false);
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

  if (!job) return <p className="p-6">Loading...</p>;

  // Determine states
  const isSaved = job.savedBy?.includes(currentUser?.uid);
  const isApplied = job.appliedBy?.includes(currentUser?.uid);

  return (
    <div className="max-w-3xl mx-auto p-6">

      {/* TITLE */}
      {!editing ? (
        <h1 className="text-4xl font-bold mb-2">{job.title}</h1>
      ) : (
        <input
          className="border p-2 w-full mb-3"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
      )}

      {/* META */}
      {!editing ? (
        <p className="text-gray-600 mb-8">
          {job.company} • {job.location} • {timeAgo(job.postedAt)}
        </p>
      ) : (
        <>
          <input
            className="border p-2 w-full mb-2"
            value={form.company}
            onChange={(e) => setForm({ ...form, company: e.target.value })}
          />
          <input
            className="border p-2 w-full mb-4"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          />
        </>
      )}

      {/* DESCRIPTION */}
      {!editing ? (
        <p className="text-lg mb-6 whitespace-pre-wrap">{job.description}</p>
      ) : (
        <textarea
          className="border p-2 w-full mb-4"
          rows="5"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
      )}

      {/* DETAILS */}
      <div className="space-y-2 mb-6">

        {/* CATEGORY */}
        {!editing ? (
          <p>
            <strong>Category:</strong>{" "}
            <span className="px-3 py-1 bg-blue-100 rounded-full text-sm">
              {job.category || "Not specified"}
            </span>
          </p>
        ) : (
          <input
            className="border p-2 w-full mb-2"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          />
        )}

        {/* TYPE */}
        {!editing ? (
          <p><strong>Job Type:</strong> {job.type}</p>
        ) : (
          <select
            className="border p-2 w-full mb-2"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
          >
            <option>Full-time</option>
            <option>Part-time</option>
            <option>Contract</option>
          </select>
        )}

        {/* SALARY */}
        {!editing ? (
          <p><strong>Salary:</strong> {job.minSalary} - {job.maxSalary}</p>
        ) : (
          <div className="flex gap-2">
            <input
              type="number"
              className="border p-2 w-full"
              value={form.minSalary}
              onChange={(e) => setForm({ ...form, minSalary: e.target.value })}
            />
            <input
              type="number"
              className="border p-2 w-full"
              value={form.maxSalary}
              onChange={(e) => setForm({ ...form, maxSalary: e.target.value })}
            />
          </div>
        )}

        {/* MODE */}
        {!editing ? (
          <p><strong>Mode:</strong> {job.workMode}</p>
        ) : (
          <select
            className="border p-2 w-full"
            value={form.workMode}
            onChange={(e) => setForm({ ...form, workMode: e.target.value })}
          >
            <option>Remote</option>
            <option>Hybrid</option>
            <option>Onsite</option>
          </select>
        )}
      </div>

      {/* SAVE / CANCEL BUTTONS */}
      {canEdit && editing && (
        <div className="flex gap-3 mb-6">
          <button
            onClick={saveChanges}
            className="px-4 py-2 bg-green-600 text-white rounded-lg"
          >
            Save Changes
          </button>

          <button
            onClick={() => setEditing(false)}
            className="px-4 py-2 bg-gray-400 text-white rounded-lg"
          >
            Cancel
          </button>
        </div>
      )}

      {/* ACTION BUTTONS */}
      {!editing && (
        <div className="flex gap-3 flex-wrap mt-6">

          {/* APPLY */}
          <button
            onClick={applyJob}
            disabled={applying}
            className={`px-4 py-2 rounded-lg text-white ${
              isApplied ? "bg-green-600" : "bg-blue-600"
            }`}
          >
            {isApplied ? "Applied" : applying ? "Applying..." : "Apply"}
          </button>

          {/* SAVE */}
          <button
            onClick={saveJob}
            disabled={saving}
            className={`px-4 py-2 rounded-lg ${
              isSaved ? "bg-yellow-400 text-black" : "bg-gray-200 text-black"
            }`}
          >
            {isSaved ? "Saved" : saving ? "Saving..." : "Save"}
          </button>

          {/* SHARE */}
          <button
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              alert("Copied link!");
            }}
            className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400"
          >
            Share
          </button>

          {/* EDIT */}
          {canEdit && (
            <button
              onClick={() => setEditing(true)}
              className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700"
            >
              Edit Job
            </button>
          )}

          {/* DELETE */}
          {canEdit && (
            <button
              onClick={deleteJob}
              disabled={deleting}
              className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
            >
              {deleting ? "Deleting..." : "Delete Job"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
