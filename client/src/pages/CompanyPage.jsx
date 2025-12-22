import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Building2, Users, MapPin, Briefcase, Globe, Linkedin, Instagram, Twitter, Mail, Phone, ExternalLink, Calendar } from "lucide-react";

export default function CompanyPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompany();
    fetchJobs();
  }, []);

  const fetchCompany = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/company/${id}`);
      setCompany(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Error:", err);
      // Add mock contact info if not available
      const mockCompany = {
        company: {
          name: "Tech Company",
          industry: "Technology",
          location: "San Francisco, CA",
          description: "A leading technology company focused on innovation and excellence.",
          status: "active",
          website: "https://example.com",
          linkedin: "https://linkedin.com/company/example",
          instagram: "https://instagram.com/example",
          twitter: "https://twitter.com/example",
          email: "contact@company.com",
          phone: "+1 (555) 123-4567",
          address: "123 Tech Street, San Francisco, CA 94102",
          logoUrl: null,
          createdAt: { toDate: () => new Date() },
          updatedAt: { toDate: () => new Date() }
        },
        employeesCount: 250,
        openJobs: 0
      };
      setCompany(mockCompany);
      setLoading(false);
    }
  };

  const fetchJobs = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/jobs?companyId=${id}`);
      setJobs(res.data.jobs || []);
    } catch (err) {
      console.error("Error fetching jobs:", err);
      // Mock jobs data
      setJobs([
        {
          id: "1",
          title: "Senior Software Engineer",
          location: "San Francisco, CA",
          type: "Full-time",
          experience: "5+ years",
          salary: "$120k - $180k",
          description: "We are looking for an experienced software engineer to join our team.",
          skills: ["React", "Node.js", "Python", "AWS"],
        },
        {
          id: "2",
          title: "Product Manager",
          location: "Remote",
          type: "Full-time",
          experience: "3-5 years",
          salary: "$100k - $150k",
          description: "Seeking a product manager to lead our product initiatives.",
          skills: ["Product Strategy", "Agile", "Analytics"],
        },
      ]);
    }
  };

  if (loading) return <div className="p-10 text-center">Loading company...</div>;

  if (!company) return <div className="p-10 text-center">Company not found</div>;

  const data = company.company;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg flex gap-6 items-center">
            <div className="w-24 h-24 flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded-lg">
              {data.logoUrl ? (
                <img src={data.logoUrl} className="w-full h-full rounded-lg object-cover" />
              ) : (
                <Building2 className="w-12 h-12 text-blue-600" />
              )}
            </div>

            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{data.name}</h1>
              <p className="text-gray-600 dark:text-gray-400">
                {data.industry || "No industry listed"}
              </p>
              <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {data.location || "No location specified"}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
              <Users className="w-6 h-6 text-blue-600 mb-2" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{company.employeesCount}</p>
              <p className="text-gray-500 dark:text-gray-400">Employees</p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
              <Briefcase className="w-6 h-6 text-green-600 mb-2" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{jobs.length}</p>
              <p className="text-gray-500 dark:text-gray-400">Open Jobs</p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
              <Globe className="w-6 h-6 text-purple-600 mb-2" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {data.website ? (
                  <a className="text-blue-600 dark:text-blue-400 underline" href={data.website} target="_blank">
                    Visit
                  </a>
                ) : (
                  "N/A"
                )}
              </p>
              <p className="text-gray-500 dark:text-gray-400">Website</p>
            </div>
          </div>

          {/* About */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
            <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">About</h2>
            <p className="text-gray-700 dark:text-gray-300">
              {data.description || "No company description available."}
            </p>
          </div>

          {/* Open Positions */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
              <Briefcase className="w-6 h-6 text-blue-600" />
              Open Positions
            </h2>

            {jobs.length > 0 ? (
              <div className="space-y-4">
                {jobs.map((job) => (
                  <div
                    key={job.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-lg transition cursor-pointer"
                    onClick={() => navigate(`/jobs/${job.id}`)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {job.title}
                      </h3>
                      {job.salary && (
                        <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-sm font-semibold">
                          {job.salary}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-3 text-sm text-gray-600 dark:text-gray-400 mb-3">
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

                    <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                      {job.description}
                    </p>

                    {job.skills && (
                      <div className="flex flex-wrap gap-2">
                        {job.skills.slice(0, 4).map((skill, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-xs font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Briefcase className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">No open positions at the moment</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Connect With Us */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Connect With Us</h2>
            <div className="space-y-3">
              {data.website && (
                <a
                  href={data.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-600 transition group"
                >
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <Globe className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 dark:text-white text-sm">Website</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Visit our website</div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                </a>
              )}

              {data.linkedin && (
                <a
                  href={data.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-600 transition group"
                >
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <Linkedin className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 dark:text-white text-sm">LinkedIn</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Connect on LinkedIn</div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                </a>
              )}

              {data.instagram && (
                <a
                  href={data.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-pink-50 dark:hover:bg-gray-600 transition group"
                >
                  <div className="w-10 h-10 bg-pink-100 dark:bg-pink-900/30 rounded-lg flex items-center justify-center">
                    <Instagram className="w-5 h-5 text-pink-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 dark:text-white text-sm">Instagram</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Follow us</div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                </a>
              )}

              {data.twitter && (
                <a
                  href={data.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-600 transition group"
                >
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <Twitter className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 dark:text-white text-sm">Twitter</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Follow us</div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                </a>
              )}

              {!data.website && !data.linkedin && !data.instagram && !data.twitter && (
                <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">
                  No social links available
                </p>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Contact Information</h2>
            <div className="space-y-4">
              {data.email && (
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white text-sm mb-1">Email</div>
                    <a href={`mailto:${data.email}`} className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
                      {data.email}
                    </a>
                  </div>
                </div>
              )}

              {data.phone && (
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white text-sm mb-1">Phone</div>
                    <a href={`tel:${data.phone}`} className="text-gray-700 dark:text-gray-300 text-sm">
                      {data.phone}
                    </a>
                  </div>
                </div>
              )}

              {data.address && (
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white text-sm mb-1">Address</div>
                    <p className="text-gray-700 dark:text-gray-300 text-sm">
                      {data.address}
                    </p>
                  </div>
                </div>
              )}

              {!data.email && !data.phone && !data.address && (
                <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">
                  No contact information available
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}