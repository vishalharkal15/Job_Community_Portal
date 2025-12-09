import { useState } from "react";
import { Calendar, Clock, Video, Star, Plus } from "lucide-react";

export default function InterviewManagement({ companyProfile }) {
  const [interviews, setInterviews] = useState([
    {
      id: 1,
      candidateName: "John Doe",
      position: "Senior React Developer",
      date: "2024-12-15",
      time: "10:00 AM",
      stage: "Technical",
      interviewer: "Alice Johnson",
      status: "Scheduled",
      feedback: "",
      rating: 0,
    },
    {
      id: 2,
      candidateName: "Jane Smith",
      position: "Product Manager",
      date: "2024-12-16",
      time: "2:00 PM",
      stage: "HR",
      interviewer: "Bob Smith",
      status: "Scheduled",
      feedback: "",
      rating: 0,
    },
  ]);

  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState(null);

  const stages = ["Screening", "HR", "Technical", "Final"];

  const handleAddFeedback = (id) => {
    setSelectedInterview(interviews.find((i) => i.id === id));
  };

  const saveFeedback = () => {
    setInterviews(
      interviews.map((i) => (i.id === selectedInterview.id ? selectedInterview : i))
    );
    setSelectedInterview(null);
    alert("Feedback saved successfully!");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
          <Calendar className="w-8 h-8 text-blue-600" />
          Interview Management
        </h1>
        <button
          onClick={() => setShowScheduleModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
        >
          <Plus className="w-5 h-5" />
          Schedule Interview
        </button>
      </div>

      {/* Interview Calendar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Upcoming Interviews</h2>
        <div className="space-y-4">
          {interviews.map((interview) => (
            <div
              key={interview.id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {interview.candidateName}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{interview.position}</p>
                </div>
                <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-xs font-medium">
                  {interview.stage}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-3">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Calendar className="w-4 h-4" />
                  {new Date(interview.date).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Clock className="w-4 h-4" />
                  {interview.time}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Video className="w-4 h-4" />
                  Google Meet
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Interviewer: {interview.interviewer}
                </div>
              </div>

              {interview.rating > 0 && (
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Rating:</span>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-5 h-5 ${
                          star <= interview.rating
                            ? "text-yellow-500 fill-yellow-500"
                            : "text-gray-300 dark:text-gray-600"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => handleAddFeedback(interview.id)}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition"
                >
                  {interview.feedback ? "Edit Feedback" : "Add Feedback"}
                </button>
                <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition">
                  Join Meeting
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Feedback Modal */}
      {selectedInterview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-2xl">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Interview Feedback - {selectedInterview.candidateName}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Rating
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() =>
                        setSelectedInterview({ ...selectedInterview, rating: star })
                      }
                      className="focus:outline-none"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= selectedInterview.rating
                            ? "text-yellow-500 fill-yellow-500"
                            : "text-gray-300 dark:text-gray-600"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Feedback
                </label>
                <textarea
                  value={selectedInterview.feedback}
                  onChange={(e) =>
                    setSelectedInterview({ ...selectedInterview, feedback: e.target.value })
                  }
                  rows="6"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="Enter your feedback here..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Move to Stage
                </label>
                <select
                  value={selectedInterview.stage}
                  onChange={(e) =>
                    setSelectedInterview({ ...selectedInterview, stage: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  {stages.map((stage) => (
                    <option key={stage} value={stage}>
                      {stage}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedInterview(null)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  onClick={saveFeedback}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
                >
                  Save Feedback
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
