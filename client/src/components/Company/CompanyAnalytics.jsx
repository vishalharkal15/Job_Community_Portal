import { useState, useEffect } from "react";
import axios from "axios";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Eye, Briefcase, Users, Target, Award } from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function CompanyAnalytics({ companyProfile }) {
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    // Detect correct company ID
    const companyId =
      companyProfile?.companyId || // If dashboard passed user profile
      companyProfile?.id ||        // If dashboard passed company object
      companyProfile?.company?.id; // Backup path

    if (!companyId) {
      console.warn("No company ID found for analytics");
      return;
    }

    const token = localStorage.getItem("token");

    axios
      .get(`${import.meta.env.VITE_API_URL}/company/${companyId}/analytics`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setAnalytics(res.data))
      .catch((err) => console.error("Analytics Load Error:", err));
  }, [companyProfile]);

  if (!analytics)
    return (
      <div className="p-6 text-center text-gray-500 dark:text-gray-300">
        Loading analytics...
      </div>
    );

  const conversionRate = analytics.jobViews
    ? ((analytics.totalApplications / analytics.jobViews) * 100).toFixed(2)
    : 0;

  const statsCards = [
    {
      title: "Total Profile Views",
      value: analytics.profileViews,
      icon: Eye,
      color: "bg-blue-500",
      trend: "+12.5%",
    },
    {
      title: "Total Job Views",
      value: analytics.jobViews,
      icon: Briefcase,
      color: "bg-green-500",
      trend: "+8.3%",
    },
    {
      title: "Total Applications",
      value: analytics.totalApplications,
      icon: Users,
      color: "bg-purple-500",
      trend: "+15.2%",
    },
    {
      title: "Conversion Rate",
      value: `${conversionRate}%`,
      icon: Target,
      color: "bg-orange-500",
      trend: "+0.4%",
    },
  ];

  const employeeGrowthData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Employee Count",
        data: analytics.employeeGrowth,
        borderColor: "rgb(59,130,246)",
        backgroundColor: "rgba(59,130,246,0.3)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const monthlyHiringData = {
    labels: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
    datasets: [
      {
        label: "New Hires",
        data: analytics.monthlyHiring,
        backgroundColor: "rgba(34,197,94,0.8)",
      },
    ],
  };

  const genderDiversityData = {
    labels: ["Male", "Female", "Other"],
    datasets: [
      {
        data: Object.values(analytics.diversityMetrics.gender),
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
        data: Object.values(analytics.diversityMetrics.experience),
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
        data: Object.values(analytics.diversityMetrics.remote),
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
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 border dark:border-gray-700"
            >
              <div className="flex justify-between items-center mb-3">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="text-white" />
                </div>
                <span className="text-green-600 dark:text-green-400 text-sm font-bold">
                  {stat.trend}
                </span>
              </div>
              <p className="text-gray-500 dark:text-gray-400">{stat.title}</p>
              <p className="text-3xl font-bold dark:text-white">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Top Jobs */}
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 border dark:border-gray-700">
        <h2 className="text-xl font-bold flex items-center gap-2 dark:text-white">
          <Award className="text-yellow-500" /> Top Performing Jobs
        </h2>

        <div className="mt-4 space-y-3">
          {analytics.topPerformingJobs.map((job, i) => (
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

              <div className="text-right">
                <p className="text-blue-600 dark:text-blue-400 font-bold">
                  {((job.applications / job.views) * 100).toFixed(2)}%
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-300">
                  Conversion
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border dark:border-gray-700">
          <h2 className="text-xl font-bold dark:text-white">Employee Growth</h2>
          <Line data={employeeGrowthData} />
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border dark:border-gray-700">
          <h2 className="text-xl font-bold dark:text-white">Monthly Hiring</h2>
          <Bar data={monthlyHiringData} />
        </div>
      </div>

      {/* Diversity */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border dark:border-gray-700">
        <h2 className="text-xl font-bold dark:text-white mb-6">
          Diversity & Inclusion
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Doughnut data={genderDiversityData} />
          <Doughnut data={experienceLevelData} />
          <Doughnut data={workModeData} />
        </div>
      </div>
    </div>
  );
}
