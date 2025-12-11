import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Building2,
  MapPin,
  Users,
  Search,
  Briefcase,
  TrendingUp,
  Award,
  Globe,
} from "lucide-react";

export default function Companies() {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("All");

  const industries = [
    "All",
    "Technology",
    "Finance",
    "Healthcare",
    "Education",
    "E-commerce",
    "Manufacturing",
    "Consulting",
    "Marketing",
    "Other",
  ];

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await axios.get("http://localhost:5000/companies");
      setCompanies(response.data.companies || []);
    } catch (error) {
      console.error("Error fetching companies:", error);
      setCompanies([]); // No mock data
    } finally {
      setLoading(false);
    }
  };

  const filteredCompanies = companies.filter((company) => {
    const matchesSearch =
      company.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.location?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesIndustry =
      selectedIndustry === "All" ||
      (company.industry && company.industry === selectedIndustry);

    return matchesSearch && matchesIndustry;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">
            Loading companies...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-6">
            <Building2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-gray-100 mb-4">
            Explore Companies
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Discover top companies hiring talented professionals
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 text-center">
            <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-3" />
            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
              {companies.length}
            </div>
            <div className="text-gray-600 dark:text-gray-400">
              Total Companies
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 text-center">
            <Briefcase className="w-8 h-8 text-purple-600 mx-auto mb-3" />
            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
              {companies.reduce((acc, company) => acc + (company.openJobs || 0), 0)}
            </div>
            <div className="text-gray-600 dark:text-gray-400">Open Positions</div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 text-center">
            <Award className="w-8 h-8 text-pink-600 mx-auto mb-3" />
            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
              {industries.length - 1}
            </div>
            <div className="text-gray-600 dark:text-gray-400">Industries</div>
          </div>
        </div>

        {/* Search + Filter */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-8">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search companies or locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100"
              />
            </div>

            {/* Industry Filter */}
            <select
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              className="px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100"
            >
              {industries.map((industry) => (
                <option key={industry} value={industry}>
                  {industry === "All" ? "All Industries" : industry}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Companies Grid */}
        {filteredCompanies.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCompanies.map((company) => (
              <div
                key={company.id}
                onClick={() => navigate(`/company/${company.id}`)}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition transform hover:scale-105 cursor-pointer"
              >
                <div className="h-32 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

                <div className="p-6 -mt-12">
                  {/* Logo */}
                  <div className="w-24 h-24 bg-white dark:bg-gray-700 rounded-xl shadow-lg p-2 mb-4 flex items-center justify-center border-4 border-white dark:border-gray-800">
                    {company.logo ? (
                      <img
                        src={company.logo}
                        alt={company.name}
                        className="w-full h-full object-contain rounded-lg"
                      />
                    ) : (
                      <Building2 className="w-12 h-12 text-blue-600" />
                    )}
                  </div>

                  {/* Name */}
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    {company.name}
                  </h3>

                  {/* Info */}
                  <div className="space-y-2 mb-4">

                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm">
                      <MapPin className="w-4 h-4" />
                      <span>{company.location || "Not provided"}</span>
                    </div>

                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm">
                      <Users className="w-4 h-4" />
                      <span>{company.employeeCount || 0} employees</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {company.openJobs || 0} Jobs
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {company.followers || 0} Followers
                      </span>
                    </div>
                  </div>

                  {/* Website */}
                  {company.website && (
                    <div className="mt-4">
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"
                      >
                        <Globe className="w-4 h-4" />
                        Visit Website
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-12 text-center">
            <Building2 className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              No Companies Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
