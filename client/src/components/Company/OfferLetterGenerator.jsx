import { useState } from "react";
import { FileText, Download, Plus, Edit } from "lucide-react";

export default function OfferLetterGenerator({ companyProfile }) {
  const [letters, setLetters] = useState([
    {
      id: 1,
      candidateName: "John Doe",
      position: "Senior React Developer",
      type: "Offer Letter",
      salary: "$120,000",
      joinDate: "2025-01-15",
      generatedDate: "2024-12-08",
      status: "Sent",
    },
    {
      id: 2,
      candidateName: "Jane Smith",
      position: "Product Manager",
      type: "Appointment Letter",
      salary: "$150,000",
      joinDate: "2025-01-20",
      generatedDate: "2024-12-07",
      status: "Draft",
    },
  ]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newLetter, setNewLetter] = useState({
    candidateName: "",
    position: "",
    type: "Offer Letter",
    salary: "",
    joinDate: "",
  });

  const handleCreateLetter = () => {
    const letter = {
      id: Date.now(),
      ...newLetter,
      generatedDate: new Date().toISOString().split("T")[0],
      status: "Draft",
    };
    setLetters([...letters, letter]);
    setNewLetter({ candidateName: "", position: "", type: "Offer Letter", salary: "", joinDate: "" });
    setShowCreateModal(false);
    alert("Letter generated successfully!");
  };

  const downloadLetter = (letter) => {
    alert(`Downloading ${letter.type} for ${letter.candidateName}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
          <FileText className="w-8 h-8 text-blue-600" />
          Offer Letter Generator
        </h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
        >
          <Plus className="w-5 h-5" />
          Generate New Letter
        </button>
      </div>

      {/* Letters List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {letters.map((letter) => (
          <div
            key={letter.id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{letter.candidateName}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{letter.position}</p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  letter.status === "Sent"
                    ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                    : "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200"
                }`}
              >
                {letter.status}
              </span>
            </div>

            <div className="space-y-2 mb-4 text-sm text-gray-700 dark:text-gray-300">
              <div className="flex justify-between">
                <span className="font-medium">Type:</span>
                <span>{letter.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Salary:</span>
                <span className="font-semibold text-green-600">{letter.salary}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Join Date:</span>
                <span>{new Date(letter.joinDate).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Generated:</span>
                <span>{new Date(letter.generatedDate).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => downloadLetter(letter)}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm transition">
                <Edit className="w-4 h-4" />
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Letter Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Generate New Letter
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Candidate Name
                </label>
                <input
                  type="text"
                  value={newLetter.candidateName}
                  onChange={(e) => setNewLetter({ ...newLetter, candidateName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Position
                </label>
                <input
                  type="text"
                  value={newLetter.position}
                  onChange={(e) => setNewLetter({ ...newLetter, position: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Letter Type
                </label>
                <select
                  value={newLetter.type}
                  onChange={(e) => setNewLetter({ ...newLetter, type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option>Offer Letter</option>
                  <option>Appointment Letter</option>
                  <option>Internship Letter</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Salary Package
                </label>
                <input
                  type="text"
                  value={newLetter.salary}
                  onChange={(e) => setNewLetter({ ...newLetter, salary: e.target.value })}
                  placeholder="$100,000"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Join Date
                </label>
                <input
                  type="date"
                  value={newLetter.joinDate}
                  onChange={(e) => setNewLetter({ ...newLetter, joinDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateLetter}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
                >
                  Generate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
