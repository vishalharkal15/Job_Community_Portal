import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { auth } from "../firebase/firebaseConfig";

export default function MeetingApprovalPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { meeting, action } = location.state || {};

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  if (!meeting || !action) {
    return <div className="p-10 text-center text-red-600">Invalid access. No meeting or action specified.</div>;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const token = await auth.currentUser.getIdToken();

    try {
      if (action === "approve") {
        if (!date || !time) {
          alert("Date and time are required.");
          setLoading(false);
          return;
        }

        await axios.put(
          `http://localhost:5000/admin/meetings/${meeting.id}/approve`,
          { date, time },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        alert("Meeting Approved & Zoom link sent!");
      } else if (action === "decline") {
        if (!reason) {
          alert("Reason is required.");
          setLoading(false);
          return;
        }

        await axios.put(
          `http://localhost:5000/admin/meetings/${meeting.id}/decline`,
          { reason },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        alert("Meeting Declined.");
      }

      navigate("/admin", { state: { refresh: true } });
    } catch (err) {
      console.error(err);
      alert(`${action === "approve" ? "Approval" : "Decline"} failed`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          {action === "approve" ? "Approve Meeting" : "Decline Meeting"}
        </h1>

        <div className="mb-4">
          <p className="font-semibold text-gray-900 dark:text-gray-100">{meeting.name}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">{meeting.email}</p>
          <p className="text-sm font-bold text-gray-800 dark:text-gray-200 mt-1">{meeting.purpose}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {action === "approve" ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Select meeting date (YYYY-MM-DD):
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Select meeting time (HH:MM):
                </label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Decline Reason:
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                rows="4"
                required
              />
            </div>
          )}

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate("/admin")}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 px-4 py-2 rounded-lg text-white transition ${
                action === "approve"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {loading ? "Processing..." : action === "approve" ? "Approve" : "Decline"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}