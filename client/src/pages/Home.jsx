import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Search, Briefcase, Building2, Users, ArrowRight, MapPin, Clock, DollarSign, TrendingUp } from "lucide-react";

export default function Home() {
  const navigate = useNavigate();
  const [search, setSearch] = useState({ role: "", location: "" });
  const [allJobs, setAllJobs] = useState([]);
  const [companyCount, setCompanyCount] = useState(0);
  const [jobSeekerCount, setJobSeekerCount] = useState(0);
  const [displayedJobs, setDisplayedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const categories = [
    { name: "Software Development", icon: "💻", count: 0 },
    { name: "Marketing", icon: "📱", count: 0 },
    { name: "Finance", icon: "💰", count: 0 },
    { name: "Human Resources", icon: "👥", count: 0 },
    { name: "Sales", icon: "📊", count: 0 },
    { name: "Engineering", icon: "⚙️", count: 0 },
    { name: "Healthcare", icon: "🏥", count: 0 },
    { name: "Remote Jobs", icon: "🌐", count: 0 },
    { name: "Design", icon: "🎨", count: 0 },
    { name: "Customer Support", icon: "📞", count: 0 },
  ];

  // 🔹 Fetch all jobs on page load
  useEffect(() => {
    const loadAllJobs = async () => {
      try {
        const res = await axios.get("http://localhost:5000/search-jobs");
        const jobs = res.data.jobs || [];
        setAllJobs(jobs);
        setDisplayedJobs(jobs);
      } catch (err) {
        console.error("Error loading jobs:", err);
      } finally {
        setLoading(false);
      }
    };
    loadAllJobs();
  }, []);

  useEffect(() => {
    const loadCounts = async () => {
      try {
        const res = await axios.get("http://localhost:5000/public/stats");

        setCompanyCount(res.data.companyCount);
        setJobSeekerCount(res.data.jobSeekerCount);
      } catch (err) {
        console.error("Stats load error:", err);
      }
    };

    loadCounts();
  }, []);

  // 🔹 Search Handler
  const handleSearch = async () => {
    if (!search.role && !search.location) {
      setDisplayedJobs(allJobs);
      return;
    }

    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/search-jobs", {
        params: {
          role: search.role,
          location: search.location,
        },
      });
      setDisplayedJobs(res.data.jobs || []);
    } catch (err) {
      console.error("Search error:", err);
      setDisplayedJobs([]);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Handle Enter key for search
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // 🔹 Category filter
  const filterByCategory = async (categoryName) => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/search-jobs", {
        params: { role: categoryName },
      });
      setDisplayedJobs(res.data.jobs || []);
    } catch (err) {
      console.error("Filter error:", err);
      setDisplayedJobs([]);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Navigate to job details
  const viewJobDetails = (jobId) => {
    navigate(`/jobs/${jobId}`);
  };

  // 🔹 View all jobs
  const viewAllJobs = () => {
    navigate('/jobs');
  };

  return (
    <div className="w-full bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* ============ HERO SECTION ============ */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-800 dark:to-purple-800 px-6 md:px-20 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight mb-4">
              Find Your <span className="text-yellow-300">Dream Job</span> Today
            </h1>
            <p className="text-white/90 text-lg md:text-xl max-w-2xl mx-auto">
              Explore thousands of jobs from top companies
            </p>
          </div>

          {/* Search Box */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 shadow-2xl rounded-2xl p-4 md:p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Job Title, Role, Keywords..."
                    className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:border-blue-500 focus:outline-none text-base"
                    value={search.role}
                    onChange={(e) => setSearch({ ...search, role: e.target.value })}
                    onKeyPress={handleKeyPress}
                  />
                </div>
                <div className="flex-1 relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="City, State, Remote..."
                    className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:border-blue-500 focus:outline-none text-base"
                    value={search.location}
                    onChange={(e) => setSearch({ ...search, location: e.target.value })}
                    onKeyPress={handleKeyPress}
                  />
                </div>
                <button
                  onClick={handleSearch}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold shadow-lg transition-all flex items-center justify-center gap-2 md:w-auto w-full"
                >
                  <Search size={20} /> Search Jobs
                </button>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-6 mt-12 max-w-3xl mx-auto">
            <div className="text-center text-white">
              <div className="text-3xl md:text-4xl font-bold">{allJobs.length}</div>
              <div className="text-white/80 text-sm md:text-base mt-1">Active Jobs</div>
            </div>
            <div className="text-center text-white">
              <div className="text-3xl md:text-4xl font-bold">{companyCount}</div>
              <div className="text-white/80 text-sm md:text-base mt-1">Companies</div>
            </div>
            <div className="text-center text-white">
              <div className="text-3xl md:text-4xl font-bold">{jobSeekerCount}</div>
              <div className="text-white/80 text-sm md:text-base mt-1">Job Seekers</div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ MAIN CONTENT - AVAILABLE JOBS ============ */}
      <section className="py-12 px-6 md:px-20">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Briefcase className="text-blue-600" size={32} />
              Available Jobs
            </h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {displayedJobs.length} jobs found
            </span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : displayedJobs.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
              <Briefcase className="mx-auto text-gray-400 mb-4" size={64} />
              <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">No jobs found matching your criteria.</p>
              <button
                onClick={() => {
                  setDisplayedJobs(allJobs);
                  setSearch({ role: "", location: "" });
                }}
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                View All Jobs
              </button>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {displayedJobs.map((job) => (
                  <div
                    key={job.id}
                    onClick={() => viewJobDetails(job.id)}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all p-6 border border-gray-200 dark:border-gray-700 cursor-pointer group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition mb-2">
                          {job.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 font-medium flex items-center gap-2 mb-3">
                          <Building2 size={18} className="text-blue-600" />
                          {job.company}
                        </p>
                        
                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-sm flex items-center gap-1">
                            <MapPin size={14} />
                            {job.location || "Remote"}
                          </span>
                          <span className="px-3 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-full text-sm flex items-center gap-1">
                            <Clock size={14} />
                            {job.type || "Full-time"}
                          </span>
                          {job.salary && (
                            <span className="px-3 py-1 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-full text-sm flex items-center gap-1">
                              <DollarSign size={14} />
                              {job.salary}
                            </span>
                          )}
                        </div>

                        {job.description && (
                          <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                            {job.description}
                          </p>
                        )}
                      </div>
                      
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          viewJobDetails(job.id);
                        }}
                        className="ml-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-all whitespace-nowrap"
                      >
                        Apply Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 text-center">
                <button
                  onClick={viewAllJobs}
                  className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition-all inline-flex items-center gap-2"
                >
                  View All Jobs <ArrowRight size={20} />
                </button>
              </div>
            </>
          )}
        </div>
      </section>

      {/* ============ JOB CATEGORIES ============ */}
      <section className="py-12 px-6 md:px-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Job Categories
          </h2>
          
          <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar-horizontal">
            {categories.map((cat, index) => {
              const categoryJobs = allJobs.filter(job => 
                job.title?.toLowerCase().includes(cat.name.toLowerCase()) ||
                job.category?.toLowerCase().includes(cat.name.toLowerCase())
              );
              
              return (
                <div
                  key={index}
                  onClick={() => filterByCategory(cat.name)}
                  className="min-w-[280px] p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 rounded-xl hover:shadow-lg cursor-pointer transition-all border border-blue-100 dark:border-gray-600 group"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">{cat.icon}</div>
                    <div className="flex-1">
                      <h4 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-blue-600 transition">
                        {cat.name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        {categoryJobs.length} positions available
                      </p>
                    </div>
                    <ArrowRight className="text-gray-400 group-hover:text-blue-600 transition" size={24} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ WHY CHOOSE US ============ */}
      <section className="py-16 px-6 md:px-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Why Choose Us?
          </h2>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { icon: <Briefcase size={40} />, title: "10,000+ Jobs", text: "Verified job postings from trusted companies" },
              { icon: <Building2 size={40} />, title: "5,000+ Companies", text: "Top recruiters hiring daily" },
              { icon: <Users size={40} />, title: "1-Click Apply", text: "Fast and easy application process" },
              { icon: <TrendingUp size={40} />, title: "Smart Matching", text: "AI-powered job recommendations" },
            ].map((item, index) => (
              <div key={index} className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 p-8 shadow-lg rounded-2xl text-center hover:shadow-2xl transition-all border border-blue-100 dark:border-gray-600">
                <div className="mx-auto mb-4 text-blue-600 dark:text-blue-400 flex justify-center">{item.icon}</div>
                <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-2">{item.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}