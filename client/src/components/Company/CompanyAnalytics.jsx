import { useState, useEffect } from "react";
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
import { Eye, Briefcase, TrendingUp, Users, Target, Award } from "lucide-react";

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
  const [analytics, setAnalytics] = useState({
    profileViews: 2847,
    jobViews: 15632,
    totalApplications: 456,
    conversionRate: 2.9,
    topPerformingJobs: [
      { title: "Senior React Developer", views: 3456, applications: 89 },
      { title: "Product Manager", views: 2891, applications: 67 },
      { title: "UX Designer", views: 2245, applications: 54 },
      { title: "DevOps Engineer", views: 1834, applications: 43 },
    ],
    employeeGrowth: [45, 52, 58, 65, 72, 85, 98, 112, 125, 138, 156, 172],
    monthlyHiring: [12, 15, 8, 18, 22, 14, 19, 25, 17, 20, 28, 24],
    diversityMetrics: {
      gender: { male: 62, female: 35, other: 3 },
      experience: { fresher: 25, mid: 45, senior: 30 },
      remote: { onsite: 45, hybrid: 35, remote: 20 },
    },
  });

  const statsCards = [
    {
      title: "Total Profile Views",
      value: analytics.profileViews.toLocaleString(),
      icon: Eye,
      color: "bg-blue-500",
      trend: "+12.5%",
    },
    {
      title: "Total Job Views",
      value: analytics.jobViews.toLocaleString(),
      icon: Briefcase,
      color: "bg-green-500",
      trend: "+8.3%",
    },
    {
      title: "Total Applications",
      value: analytics.totalApplications.toLocaleString(),
      icon: Users,
      color: "bg-purple-500",
      trend: "+15.2%",
    },
    {
      title: "Conversion Rate",
      value: `${analytics.conversionRate}%`,
      icon: Target,
      color: "bg-orange-500",
      trend: "+0.4%",
    },
  ];

  const employeeGrowthData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    datasets: [
      {
        label: "Employee Count",
        data: analytics.employeeGrowth,
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const monthlyHiringData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    datasets: [
      {
        label: "New Hires",
        data: analytics.monthlyHiring,
        backgroundColor: "rgba(34, 197, 94, 0.8)",
      },
    ],
  };

  const genderDiversityData = {
    labels: ["Male", "Female", "Other"],
    datasets: [
      {
        data: Object.values(analytics.diversityMetrics.gender),
        backgroundColor: [
          "rgba(59, 130, 246, 0.8)",
          "rgba(236, 72, 153, 0.8)",
          "rgba(168, 85, 247, 0.8)",
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
          "rgba(34, 197, 94, 0.8)",
          "rgba(251, 146, 60, 0.8)",
          "rgba(239, 68, 68, 0.8)",
        ],
      },
    ],
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Analytics Dashboard
        </h1>
        <select className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
          <option>Last 30 Days</option>
          <option>Last 90 Days</option>
          <option>Last Year</option>
          <option>All Time</option>
        </select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-green-600 dark:text-green-400 text-sm font-semibold">
                  {stat.trend}
                </span>
              </div>
              <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                {stat.title}
              </h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                {stat.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Top Performing Jobs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <Award className="w-6 h-6 text-yellow-500" />
          Top Performing Job Posts
        </h2>
        <div className="space-y-3">
          {analytics.topPerformingJobs.map((job, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">{job.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {job.views.toLocaleString()} views • {job.applications} applications
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                  {((job.applications / job.views) * 100).toFixed(2)}%
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Conversion</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Employee Growth Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Employee Growth (2024)
          </h2>
          <Line data={employeeGrowthData} options={{ responsive: true, maintainAspectRatio: true }} />
        </div>

        {/* Monthly Hiring Report */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Monthly Hiring Report (2024)
          </h2>
          <Bar data={monthlyHiringData} options={{ responsive: true, maintainAspectRatio: true }} />
        </div>
      </div>

      {/* Diversity & Inclusion Metrics */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          Diversity & Inclusion Metrics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="text-center font-semibold text-gray-700 dark:text-gray-300 mb-4">
              Gender Distribution
            </h3>
            <Doughnut data={genderDiversityData} options={{ responsive: true }} />
          </div>
          <div>
            <h3 className="text-center font-semibold text-gray-700 dark:text-gray-300 mb-4">
              Experience Level
            </h3>
            <Doughnut data={experienceLevelData} options={{ responsive: true }} />
          </div>
          <div>
            <h3 className="text-center font-semibold text-gray-700 dark:text-gray-300 mb-4">
              Work Mode
            </h3>
            <Doughnut
              data={{
                labels: ["On-site", "Hybrid", "Remote"],
                datasets: [
                  {
                    data: Object.values(analytics.diversityMetrics.remote),
                    backgroundColor: [
                      "rgba(239, 68, 68, 0.8)",
                      "rgba(251, 146, 60, 0.8)",
                      "rgba(34, 197, 94, 0.8)",
                    ],
                  },
                ],
              }}
              options={{ responsive: true }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
