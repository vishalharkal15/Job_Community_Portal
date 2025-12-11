import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  MapPin,
  Building2,
  Users,
  Calendar,
  Globe,
  Linkedin,
  Instagram,
  Twitter,
  Briefcase,
  UserPlus,
  UserMinus,
  ExternalLink,
  Target,
  Eye,
  Heart,
  Mail,
} from "lucide-react";

export default function CompanyProfile() {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);

  useEffect(() => {
    fetchCompanyData();
    fetchCompanyJobs();
  }, [companyId]);

  const fetchCompanyData = async () => {
    try {
      // Fetch company profile data
      const response = await axios.get(
        `http://localhost:5000/company/${companyId}`
      );
      setCompany(response.data);
      setFollowersCount(response.data.followers || 0);
      setIsFollowing(response.data.isFollowing || false);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching company data:", error);
      setLoading(false);
    }
  };

  const fetchCompanyJobs = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/jobs?companyId=${companyId}`
      );
      setJobs(response.data.jobs || []);
    } catch (error) {
      console.error("Error fetching company jobs:", error);
    }
  };

  const handleFollowToggle = async () => {
    try {
      if (isFollowing) {
        await axios.post(`http://localhost:5000/company/${companyId}/unfollow`);
        setFollowersCount((prev) => prev - 1);
      } else {
        await axios.post(`http://localhost:5000/company/${companyId}/follow`);
        setFollowersCount((prev) => prev + 1);
      }
      setIsFollowing(!isFollowing);
    } catch (error) {
      console.error("Error toggling follow:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">
            Loading company profile...
          </p>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Company Not Found
          </h2>
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Company Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden mb-8">
          {/* Cover Image */}
          <div className="h-48 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600"></div>

          <div className="px-8 pb-8">
            {/* Logo and Basic Info */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between -mt-16 mb-6">
              <div className="flex items-end gap-6">
                {/* Company Logo */}
                <div className="w-32 h-32 bg-white dark:bg-gray-700 rounded-2xl shadow-lg p-2 flex items-center justify-center border-4 border-white dark:border-gray-800">
                  {company.logo ? (
                    <img
                      src={company.logo}
                      alt={company.name}
                      className="w-full h-full object-contain rounded-xl"
                    />
                  ) : (
                    <Building2 className="w-16 h-16 text-blue-600" />
                  )}
                </div>

                {/* Company Name and Location */}
                <div className="mb-4">
                  <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-gray-100 mb-2">
                    {company.name || "Company Name"}
                  </h1>
                  <div className="flex flex-wrap items-center gap-4 text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      <span>{company.industry || "Technology"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{company.location || "Location"}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Follow Button */}
              <button
                onClick={handleFollowToggle}
                className={`mt-4 md:mt-0 px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition transform hover:scale-105 ${
                  isFollowing
                    ? "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                    : "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
                }`}
              >
                {isFollowing ? (
                  <>
                    <UserMinus className="w-5 h-5" />
                    Unfollow
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5" />
                    Follow
                  </>
                )}
              </button>
            </div>

            {/* Company Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-4 text-center">
                <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {company.employeeCount || "100+"}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Employees
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-4 text-center">
                <Heart className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {followersCount}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Followers
                </div>
              </div>

              <div className="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 rounded-xl p-4 text-center">
                <Calendar className="w-8 h-8 text-pink-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {company.foundedYear || "2020"}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Founded
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-4 text-center">
                <Briefcase className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {jobs.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Open Jobs
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - About and Mission */}
          <div className="lg:col-span-2 space-y-8">
            {/* About Section */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <Building2 className="w-6 h-6 text-blue-600" />
                About Company
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {company.about ||
                  "We are a leading company in our industry, dedicated to innovation and excellence. Our team of passionate professionals works together to deliver outstanding results and create value for our clients and stakeholders."}
              </p>
            </div>

            {/* Mission, Vision, Values */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
                  Mission
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {company.mission ||
                    "To deliver innovative solutions that transform businesses and improve lives."}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4">
                  <Eye className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
                  Vision
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {company.vision ||
                    "To be the global leader in our industry, setting standards for excellence."}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center mb-4">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
                  Values
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {company.values ||
                    "Integrity, Innovation, Excellence, Collaboration, and Customer Focus."}
                </p>
              </div>
            </div>

            {/* Open Jobs Section */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
                <Briefcase className="w-6 h-6 text-blue-600" />
                Open Positions
              </h2>

              {jobs.length > 0 ? (
                <div className="space-y-4">
                  {jobs.map((job) => (
                    <div
                      key={job.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-lg transition cursor-pointer"
                      onClick={() => navigate(`/jobs/${job.id}`)}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                            {job.title}
                          </h3>
                          <div className="flex flex-wrap gap-3 text-sm text-gray-600 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {job.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <Briefcase className="w-4 h-4" />
                              {job.type}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {job.experience}
                            </span>
                          </div>
                        </div>
                        <span className="px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-sm font-semibold">
                          {job.salary || "Competitive"}
                        </span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                        {job.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {job.skills?.slice(0, 5).map((skill, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-xs font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Briefcase className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    No open positions at the moment
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Social Links and Contact */}
          <div className="space-y-8">
            {/* Social Links */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                Connect With Us
              </h2>
              <div className="space-y-4">
                {company.website && (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-blue-50 dark:hover:bg-gray-600 transition group"
                  >
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-800/40 transition">
                      <Globe className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 dark:text-gray-100">
                        Website
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Visit our website
                      </div>
                    </div>
                    <ExternalLink className="w-5 h-5 text-gray-400" />
                  </a>
                )}

                {company.linkedin && (
                  <a
                    href={company.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-blue-50 dark:hover:bg-gray-600 transition group"
                  >
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-800/40 transition">
                      <Linkedin className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 dark:text-gray-100">
                        LinkedIn
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Connect on LinkedIn
                      </div>
                    </div>
                    <ExternalLink className="w-5 h-5 text-gray-400" />
                  </a>
                )}

                {company.instagram && (
                  <a
                    href={company.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-pink-50 dark:hover:bg-gray-600 transition group"
                  >
                    <div className="w-10 h-10 bg-pink-100 dark:bg-pink-900/30 rounded-lg flex items-center justify-center group-hover:bg-pink-200 dark:group-hover:bg-pink-800/40 transition">
                      <Instagram className="w-5 h-5 text-pink-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 dark:text-gray-100">
                        Instagram
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Follow us on Instagram
                      </div>
                    </div>
                    <ExternalLink className="w-5 h-5 text-gray-400" />
                  </a>
                )}

                {company.twitter && (
                  <a
                    href={company.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-blue-50 dark:hover:bg-gray-600 transition group"
                  >
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-800/40 transition">
                      <Twitter className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 dark:text-gray-100">
                        Twitter
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Follow us on Twitter
                      </div>
                    </div>
                    <ExternalLink className="w-5 h-5 text-gray-400" />
                  </a>
                )}

                {company.email && (
                  <a
                    href={`mailto:${company.email}`}
                    className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-purple-50 dark:hover:bg-gray-600 transition group"
                  >
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center group-hover:bg-purple-200 dark:group-hover:bg-purple-800/40 transition">
                      <Mail className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 dark:text-gray-100">
                        Email
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Get in touch
                      </div>
                    </div>
                    <ExternalLink className="w-5 h-5 text-gray-400" />
                  </a>
                )}
              </div>
            </div>

            {/* Contact Info */}
            {company.contactInfo && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                  Contact Information
                </h2>
                <div className="space-y-4 text-gray-600 dark:text-gray-400">
                  {company.contactInfo.phone && (
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-gray-100">
                        Phone
                      </div>
                      <div>{company.contactInfo.phone}</div>
                    </div>
                  )}
                  {company.contactInfo.address && (
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-gray-100">
                        Address
                      </div>
                      <div>{company.contactInfo.address}</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
