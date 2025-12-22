import { useState, useEffect } from "react";
import axios from "axios";
import { Users } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const STAGES = [
  "Applied",
  "Shortlisted",
  "Interview Scheduled",
  "In Review",
  "Rejected",
  "Hired",
];

const STAGE_COLORS = {
  Applied: "bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600",
  Shortlisted: "bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700",
  "Interview Scheduled": "bg-purple-50 dark:bg-purple-900/20 border-purple-300 dark:border-purple-700",
  "In Review": "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700",
  Rejected: "bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700",
  Hired: "bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700",
};

export default function CandidatePipeline({ companyProfile }) {
  const { currentUser } = useAuth();
  const [pipeline, setPipeline] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPipeline = async () => {
      const companyId =
        companyProfile?.companyId ||
        companyProfile?.id ||
        companyProfile?.company?.id;

      if (!companyId || !currentUser) return;

      try {
        const token = await currentUser.getIdToken(true);

        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/applications/company/${companyId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const grouped = {};
        STAGES.forEach(s => (grouped[s] = []));

        res.data.applications.forEach(app => {
          grouped[app.status || "Applied"].push(app);
        });

        setPipeline(grouped);
        setLoading(false);

      } catch (err) {
        console.error("Pipeline load error:", err.response?.data || err.message);
        setLoading(false);
      }
    };

    loadPipeline();
  }, [companyProfile, currentUser]);

  const handleDragStart = (e, app, fromStage) => {
    e.dataTransfer.setData("appId", app.id);
    e.dataTransfer.setData("fromStage", fromStage);
  };

  const handleDrop = async (e, toStage) => {
    e.preventDefault();

    const appId = e.dataTransfer.getData("appId");
    const fromStage = e.dataTransfer.getData("fromStage");

    if (fromStage === toStage) return;

    const movedApp = pipeline[fromStage].find(a => a.id === appId);

    setPipeline(prev => ({
      ...prev,
      [fromStage]: prev[fromStage].filter(a => a.id !== appId),
      [toStage]: [...prev[toStage], { ...movedApp, status: toStage }],
    }));

    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/applications/${appId}/status`,
        { status: toStage }
      );
    } catch (err) {
      console.error("Status update failed:", err);
    }
  };

  if (loading)
    return (
      <div className="p-6 text-center text-gray-500">
        Loading candidate pipeline...
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Users className="text-blue-600" />
          Candidate Pipeline / ATS
        </h1>
        <p className="text-sm text-gray-500">
          Drag & drop candidates between stages
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {STAGES.map(stage => (
          <div
            key={stage}
            onDrop={e => handleDrop(e, stage)}
            onDragOver={e => e.preventDefault()}
            className={`rounded-xl border-2 p-4 min-h-[420px] ${STAGE_COLORS[stage]}`}
          >
            <div className="flex justify-between mb-4">
              <h2 className="font-bold text-sm">{stage}</h2>
              <span className="bg-white dark:bg-gray-800 px-2 py-1 rounded-full text-xs font-semibold">
                {pipeline[stage]?.length || 0}
              </span>
            </div>

            <div className="space-y-3">
              {pipeline[stage]?.map(app => (
                <div
                  key={app.id}
                  draggable
                  onDragStart={e => handleDragStart(e, app, stage)}
                  className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow cursor-move border"
                >
                  <h3 className="font-semibold text-sm">
                    {app.candidateName}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {app.jobTitle}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    Applied:{" "}
                    {new Date(app.appliedAt.seconds * 1000).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
