import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import axios from "axios";
import { 
  BarChart3, Users, Briefcase, Calendar, Settings, Bell, LogOut, Home
} from "lucide-react";
import CompanyAnalytics from "../components/Company/CompanyAnalytics";
import CompanyFollowers from "../components/Company/CompanyFollowers";
import CareerPageBuilder from "../components/Company/CareerPageBuilder";
import TeamRoles from "../components/Company/TeamRoles";
import InterviewManagement from "../components/Company/InterviewManagement";
import CandidatePipeline from "../components/Company/CandidatePipeline";
import CompanyNotifications from "../components/Company/CompanyNotifications";
import ExitManagement from "../components/Company/ExitManagement";

export default function CompanyDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [activeTab, setActiveTab] = useState("analytics");
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate("/auth/login");
        return;
      }

      try {
        const token = await user.getIdToken();
        const response = await axios.get("http://localhost:5000/user/profile", {
          headers: { Authorization: `Bearer ${token}` }
        });

        const profile = response.data.profile;
        
        // Check if user is a company/recruiter
        if (profile.role !== "company" && profile.role !== "recruiter") {
          setError("Access denied. This page is only for companies and recruiters.");
          setLoading(false);
          return;
        }

        setUserProfile(profile);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Failed to load profile");
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const menuItems = [
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "followers", label: "Talent Pool", icon: Users },
    { id: "career-page", label: "Career Page", icon: Home },
    { id: "team-roles", label: "Team & Roles", icon: Settings },
    { id: "interviews", label: "Interviews", icon: Calendar },
    { id: "pipeline", label: "Candidate Pipeline", icon: Briefcase },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "exit-mgmt", label: "Exit Management", icon: LogOut },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "analytics":
        return <CompanyAnalytics companyProfile={userProfile} />;
      case "followers":
        return <CompanyFollowers companyProfile={userProfile} />;
      case "career-page":
        return <CareerPageBuilder companyProfile={userProfile} />;
      case "team-roles":
        return <TeamRoles companyProfile={userProfile} />;
      case "interviews":
        return <InterviewManagement companyProfile={userProfile} />;
      case "pipeline":
        return <CandidatePipeline companyProfile={userProfile} />;
      case "notifications":
        return <CompanyNotifications companyProfile={userProfile} />;
      case "exit-mgmt":
        return <ExitManagement companyProfile={userProfile} />;
      default:
        return <CompanyAnalytics companyProfile={userProfile} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-xl text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="text-xl text-red-600 dark:text-red-400 mb-4">{error}</div>
          <button
            onClick={() => navigate("/")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 min-h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              {userProfile?.name || "Company"}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Company Dashboard</p>
          </div>
          
          <nav className="px-3">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition ${
                    activeTab === item.id
                      ? "bg-blue-600 text-white"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
