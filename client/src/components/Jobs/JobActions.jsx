import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../firebase/firebaseConfig";
import { doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";

export default function JobActions({ jobId, jobData, refresh }) {
  const { currentUser } = useAuth();

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(
    jobData?.savedBy?.includes(currentUser?.uid)
  );

  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(
    jobData?.appliedBy?.includes(currentUser?.uid)
  );

  // SAVE JOB
  const handleSave = async () => {
    if (!currentUser) return alert("Please login first!");

    setSaving(true);
    try {
      const ref = doc(db, "jobs", jobId);

      await updateDoc(ref, {
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
  const handleApply = async () => {
    if (!currentUser) return alert("Please login first!");

    setApplying(true);
    try {
      const ref = doc(db, "jobs", jobId);

      await updateDoc(ref, {
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

  // SHARE JOB
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Job link copied!");
  };

  return (
    <div className="flex gap-3 mt-4">
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
          saved ? "bg-yellow-400 text-black" : "bg-gray-200"
        }`}
      >
        {saved ? "Saved" : saving ? "Saving..." : "Save"}
      </button>

      {/* SHARE */}
      <button
        onClick={handleShare}
        className="px-4 py-2 rounded-lg bg-gray-300"
      >
        Share
      </button>
    </div>
  );
}
