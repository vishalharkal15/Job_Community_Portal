import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../firebase/firebaseConfig";
import { doc, updateDoc, arrayUnion, arrayRemove, deleteDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function JobActions({ jobId, jobData, refresh }) {
  const { currentUser, userRole } = useAuth();

  const navigate = useNavigate();

  const [saving, setSaving] = useState(false);
  const [applying, setApplying] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isOwner = jobData?.createdBy === currentUser?.uid;
  const isAdmin = userRole === "admin" || userRole === "super-admin";

  // SAVE JOB
  const [saved, setSaved] = useState(
    jobData?.savedBy?.includes(currentUser?.uid)
  );
  const handleSave = async () => {
    if (!currentUser) return alert("Please login first!");
    setSaving(true);

    try {
      await updateDoc(doc(db, "jobs", jobId), {
        savedBy: saved
          ? arrayRemove(currentUser.uid)
          : arrayUnion(currentUser.uid),
      });

      setSaved(!saved);
      refresh && refresh();
    } catch (error) {
      console.error("Save job error:", error);
    }
    setSaving(false);
  };

  // APPLY JOB
  const [applied, setApplied] = useState(
    jobData?.appliedBy?.includes(currentUser?.uid)
  );
  const handleApply = async () => {
    if (!currentUser) return alert("Please login first!");
    setApplying(true);

    try {
      await updateDoc(doc(db, "jobs", jobId), {
        appliedBy: applied
          ? arrayRemove(currentUser.uid)
          : arrayUnion(currentUser.uid),
      });

      setApplied(!applied);
      refresh && refresh();
    } catch (error) {
      console.error("Apply job error:", error);
    }
    setApplying(false);
  };

  // EDIT JOB (navigate)
  const handleEdit = () => {
    navigate(`/edit-job/${jobId}`);
  };

  // DELETE JOB
  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this job?")) return;

    setDeleting(true);
    try {
      await deleteDoc(doc(db, "jobs", jobId));

      alert("Job deleted successfully!");

      navigate("/jobs");
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete job");
    }
    setDeleting(false);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Job link copied!");
  };

  return (
    <div className="flex gap-3 mt-4 flex-wrap">
      {/* APPLY */}
      <button
        onClick={handleApply}
        disabled={applying}
        className={`px-4 py-2 rounded-lg text-white ${
          applied ? "bg-green-600" : "bg-blue-600"
        }`}
      >
        {applied ? "Applied" : applying ? "Applying..." : "Apply"}
      </button>

      {/* SAVE */}
      <button
        onClick={handleSave}
        disabled={saving}
        className={`px-4 py-2 rounded-lg ${
          saved ? "bg-yellow-400 text-black" : "bg-gray-200 text-black"
        }`}
      >
        {saved ? "Saved" : saving ? "Saving..." : "Save"}
      </button>

      {/* SHARE */}
      <button
        onClick={handleShare}
        className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400"
      >
        Share
      </button>

      {/* EDIT BUTTON — only owner/admin */}
      {(isOwner || isAdmin) && (
        <button
          onClick={handleEdit}
          className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700"
        >
          Edit Job
        </button>
      )}

      {/* DELETE BUTTON — only owner/admin */}
      {(isOwner || isAdmin) && (
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
        >
          {deleting ? "Deleting..." : "Delete Job"}
        </button>
      )}
    </div>
  );
}
