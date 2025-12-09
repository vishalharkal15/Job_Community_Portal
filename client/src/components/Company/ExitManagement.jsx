import { useState } from "react";
import { LogOut, Clock, CheckCircle, AlertCircle, Calendar } from "lucide-react";

export default function ExitManagement({ companyProfile }) {
  const [resignations, setResignations] = useState([
    {
      id: 1,
      employeeName: "John Doe",
      position: "Senior Developer",
      resignDate: "2024-11-15",
      lastWorkingDay: "2024-12-15",
      noticePeriod: "30 days",
      status: "In Progress",
      exitInterviewCompleted: false,
      clearanceStatus: "Pending",
    },
    {
      id: 2,
      employeeName: "Jane Smith",
      position: "Product Manager",
      resignDate: "2024-10-20",
      lastWorkingDay: "2024-11-20",
      noticePeriod: "30 days",
      status: "Completed",
      exitInterviewCompleted: true,
      clearanceStatus: "Cleared",
    },
  ]);

  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const statusColors = {
    "In Progress": "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200",
    Completed: "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200",
    Cancelled: "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200",
  };

  const clearanceColors = {
    Pending: "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200",
    Cleared: "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200",
    Issues: "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200",
  };

  const handleExitInterview = (resignation) => {
    setSelectedEmployee(resignation);
  };

  const completeExitInterview = () => {
    setResignations(
      resignations.map((r) =>
        r.id === selectedEmployee.id ? { ...r, exitInterviewCompleted: true } : r
      )
    );
    setSelectedEmployee(null);
    alert("Exit interview marked as completed!");
  };

  const updateClearanceStatus = (id, status) => {
    setResignations(
      resignations.map((r) => (r.id === id ? { ...r, clearanceStatus: status } : r))
    );
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
        <LogOut className="w-8 h-8 text-blue-600" />
        Employee Exit Management
      </h1>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="text-3xl font-bold text-yellow-600 mb-2">
            {resignations.filter((r) => r.status === "In Progress").length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Active Resignations</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {resignations.filter((r) => r.exitInterviewCompleted).length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Exit Interviews Completed</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {resignations.filter((r) => r.clearanceStatus === "Pending").length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Pending Clearances</div>
        </div>
      </div>

      {/* Resignations List */}
      <div className="space-y-4">
        {resignations.map((resignation) => (
          <div
            key={resignation.id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {resignation.employeeName}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{resignation.position}</p>
              </div>
              <div className="flex gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[resignation.status]}`}>
                  {resignation.status}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${clearanceColors[resignation.clearanceStatus]}`}>
                  {resignation.clearanceStatus}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
              <div>
                <div className="text-gray-600 dark:text-gray-400">Resign Date</div>
                <div className="font-semibold text-gray-900 dark:text-gray-100">
                  {new Date(resignation.resignDate).toLocaleDateString()}
                </div>
              </div>
              <div>
                <div className="text-gray-600 dark:text-gray-400">Last Working Day</div>
                <div className="font-semibold text-gray-900 dark:text-gray-100">
                  {new Date(resignation.lastWorkingDay).toLocaleDateString()}
                </div>
              </div>
              <div>
                <div className="text-gray-600 dark:text-gray-400">Notice Period</div>
                <div className="font-semibold text-gray-900 dark:text-gray-100">
                  {resignation.noticePeriod}
                </div>
              </div>
              <div>
                <div className="text-gray-600 dark:text-gray-400">Exit Interview</div>
                <div className="font-semibold text-gray-900 dark:text-gray-100">
                  {resignation.exitInterviewCompleted ? (
                    <span className="text-green-600 flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      Done
                    </span>
                  ) : (
                    <span className="text-yellow-600 flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Pending
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              {!resignation.exitInterviewCompleted && (
                <button
                  onClick={() => handleExitInterview(resignation)}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition"
                >
                  <Calendar className="w-4 h-4" />
                  Conduct Exit Interview
                </button>
              )}
              {resignation.clearanceStatus === "Pending" && (
                <button
                  onClick={() => updateClearanceStatus(resignation.id, "Cleared")}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition"
                >
                  <CheckCircle className="w-4 h-4" />
                  Mark Cleared
                </button>
              )}
              <button className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm transition">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Exit Interview Modal */}
      {selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-2xl">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Exit Interview - {selectedEmployee.employeeName}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Reason for Leaving
                </label>
                <textarea
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="Enter reason..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Overall Experience Rating
                </label>
                <select className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                  <option>Excellent</option>
                  <option>Good</option>
                  <option>Average</option>
                  <option>Poor</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Feedback & Suggestions
                </label>
                <textarea
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="Enter feedback..."
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedEmployee(null)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  onClick={completeExitInterview}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
                >
                  Complete Interview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
