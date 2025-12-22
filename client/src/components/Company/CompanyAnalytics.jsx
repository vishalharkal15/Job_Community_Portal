import { useState, useEffect } from "react";
import axios from "axios";
import { Line, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Eye, Briefcase, Users, Award } from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function CompanyAnalytics({ companyProfile }) {
  const [analytics, setAnalytics] = useState(null);
  const [employeeGrowth, setEmployeeGrowth] = useState(null);

  useEffect(() => {
    const companyId =
      companyProfile?.companyId ||
      companyProfile?.id ||
      companyProfile?.company?.id;

    if (!companyId) {
      console.warn("No company ID found for analytics");
      return;
    }

    const token = localStorage.getItem("token");

    // 🔹 Load main analytics
    axios
      .get(
        `${import.meta.env.VITE_API_URL}/company/${companyId}/analytics`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(res => setAnalytics(res.data))
      .catch(err => console.error("Analytics load error:", err));

    // 🔹 Load REAL employee growth
    axios
      .get(
        `${import.meta.env.VITE_API_URL}/company/${companyId}/employee-growth`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(res => setEmployeeGrowth(res.data))
      .catch(err => console.error("Employee growth error:", err));

  }, [companyProfile]);

  if (!analytics)
    return (
      <div className="p-6 text-center text-gray-500 dark:text-gray-300">
        Loading analytics...
      </div>
    );

  /* ===============================
     📊 STATS CARDS
  =============================== */
  const statsCards = [
    {
      title: "Total Profile Views",
      value: analytics.profileViews ?? 0,
      icon: Eye,
      color: "bg-blue-500",
    },
    {
      title: "Total Job Views",
      value: analytics.jobViews ?? 0,
      icon: Briefcase,
      color: "bg-green-500",
    },
    {
      title: "Total Applications",
      value: analytics.totalApplications ?? 0,
      icon: Users,
      color: "bg-purple-500",
    },
  ];

  /* ===============================
     📈 EMPLOYEE GROWTH (REAL DATA)
  =============================== */
  const employeeGrowthData =
    employeeGrowth && {
      labels: employeeGrowth.labels,
      datasets: [
        {
          label: "Employees Joined",
          data: employeeGrowth.data,
          borderColor: "rgb(59,130,246)",
          backgroundColor: "rgba(59,130,246,0.3)",
          tension: 0.4,
          fill: true,
        },
      ],
    };

  /* ===============================
     🥧 DIVERSITY DATA
  =============================== */
  const genderDiversityData = {
    labels: ["Male", "Female", "Other"],
    datasets: [
      {
        data: Object.values(analytics.diversityMetrics?.gender || {}),
        backgroundColor: [
          "rgba(59,130,246,0.8)",
          "rgba(236,72,153,0.8)",
          "rgba(168,85,247,0.8)",
        ],
      },
    ],
  };

  const experienceLevelData = {
    labels: ["Fresher", "Mid-Level", "Senior"],
    datasets: [
      {
        data: Object.values(analytics.diversityMetrics?.experience || {}),
        backgroundColor: [
          "rgba(34,197,94,0.8)",
          "rgba(251,146,60,0.8)",
          "rgba(239,68,68,0.8)",
        ],
      },
    ],
  };

  const workModeData = {
    labels: ["Onsite", "Hybrid", "Remote"],
    datasets: [
      {
        data: Object.values(analytics.diversityMetrics?.remote || {}),
        backgroundColor: [
          "rgba(239,68,68,0.8)",
          "rgba(251,146,60,0.8)",
          "rgba(34,197,94,0.8)",
        ],
      },
    ],
  };

  return (
    <div className="space-y-6">

      {/* ===============================
          📊 STAT CARDS
      =============================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statsCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 border dark:border-gray-700"
            >
              <div className="flex items-center gap-4">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="text-white" />
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold dark:text-white">
                    {stat.value}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ===============================
          🏆 TOP JOBS
      =============================== */}
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 border dark:border-gray-700">
        <h2 className="text-xl font-bold flex items-center gap-2 dark:text-white">
          <Award className="text-yellow-500" /> Top Performing Jobs
        </h2>

        <div className="mt-4 space-y-3">
          {(analytics.topPerformingJobs || []).map((job, i) => (
            <div
              key={i}
              className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <div>
                <h3 className="font-semibold dark:text-white">{job.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-300">
                  {job.views} views • {job.applications} applications
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ===============================
          📈 EMPLOYEE GROWTH
      =============================== */}
      {employeeGrowthData && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border dark:border-gray-700">
          <h2 className="text-xl font-bold dark:text-white mb-4">
            Employee Growth
          </h2>
          <Line data={employeeGrowthData} />
        </div>
      )}

      {/* ===============================
          🥧 DIVERSITY & INCLUSION
      =============================== */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border dark:border-gray-700">
        <h2 className="text-xl font-bold dark:text-white mb-6">
          Diversity & Inclusion
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-56">
            <Doughnut
              data={genderDiversityData}
              options={{ maintainAspectRatio: false }}
            />
          </div>

          <div className="h-56">
            <Doughnut
              data={experienceLevelData}
              options={{ maintainAspectRatio: false }}
            />
          </div>

          <div className="h-56">
            <Doughnut
              data={workModeData}
              options={{ maintainAspectRatio: false }}
            />
          </div>
        </div>
      </div>

    </div>
  );
}
