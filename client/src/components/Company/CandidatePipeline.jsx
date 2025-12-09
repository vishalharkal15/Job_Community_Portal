import { useState } from "react";
import { Users, ArrowRight } from "lucide-react";

export default function CandidatePipeline({ companyProfile }) {
  const [pipeline, setPipeline] = useState({
    Applied: [
      { id: 1, name: "John Doe", position: "React Developer", appliedDate: "2024-12-01" },
      { id: 2, name: "Jane Smith", position: "Product Manager", appliedDate: "2024-12-02" },
    ],
    Shortlisted: [
      { id: 3, name: "Mike Johnson", position: "DevOps Engineer", appliedDate: "2024-11-28" },
    ],
    "Interview Scheduled": [
      { id: 4, name: "Sarah Williams", position: "UX Designer", appliedDate: "2024-11-25" },
    ],
    "In Review": [
      { id: 5, name: "Tom Brown", position: "Backend Developer", appliedDate: "2024-11-20" },
    ],
    Rejected: [],
    Hired: [
      { id: 6, name: "Emma Davis", position: "Frontend Developer", appliedDate: "2024-11-15" },
    ],
  });

  const stages = ["Applied", "Shortlisted", "Interview Scheduled", "In Review", "Rejected", "Hired"];

  const stageColors = {
    Applied: "bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600",
    Shortlisted: "bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700",
    "Interview Scheduled": "bg-purple-50 dark:bg-purple-900/20 border-purple-300 dark:border-purple-700",
    "In Review": "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700",
    Rejected: "bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700",
    Hired: "bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700",
  };

  const handleDragStart = (e, candidate, fromStage) => {
    e.dataTransfer.setData("candidate", JSON.stringify(candidate));
    e.dataTransfer.setData("fromStage", fromStage);
  };

  const handleDrop = (e, toStage) => {
    e.preventDefault();
    const candidate = JSON.parse(e.dataTransfer.getData("candidate"));
    const fromStage = e.dataTransfer.getData("fromStage");

    if (fromStage !== toStage) {
      setPipeline({
        ...pipeline,
        [fromStage]: pipeline[fromStage].filter((c) => c.id !== candidate.id),
        [toStage]: [...pipeline[toStage], candidate],
      });
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
          <Users className="w-8 h-8 text-blue-600" />
          Candidate Pipeline / ATS
        </h1>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Drag & drop candidates between stages
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stages.map((stage) => (
          <div
            key={stage}
            onDrop={(e) => handleDrop(e, stage)}
            onDragOver={handleDragOver}
            className={`rounded-xl border-2 p-4 min-h-[400px] ${stageColors[stage]}`}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 dark:text-gray-100 text-sm">{stage}</h2>
              <span className="bg-white dark:bg-gray-800 px-2 py-1 rounded-full text-xs font-semibold">
                {pipeline[stage].length}
              </span>
            </div>

            <div className="space-y-3">
              {pipeline[stage].map((candidate) => (
                <div
                  key={candidate.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, candidate, stage)}
                  className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow cursor-move hover:shadow-md transition border border-gray-200 dark:border-gray-700"
                >
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                    {candidate.name}
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{candidate.position}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                    Applied: {new Date(candidate.appliedDate).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Pipeline Stats */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Pipeline Statistics</h2>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {stages.map((stage) => (
            <div key={stage} className="text-center">
              <div className="text-3xl font-bold text-blue-600">{pipeline[stage].length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{stage}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
