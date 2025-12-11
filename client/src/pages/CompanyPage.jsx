import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Building2, Users, MapPin, Briefcase, Globe } from "lucide-react";

export default function CompanyPage() {
  const { id } = useParams();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompany();
  }, []);

  const fetchCompany = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/company/${id}`);
      setCompany(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Error:", err);
      setLoading(false);
    }
  };

  if (loading) return <div className="p-10 text-center">Loading company...</div>;

  if (!company) return <div className="p-10 text-center">Company not found</div>;

  const data = company.company;

  return (
    <div className="max-w-5xl mx-auto p-6">

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
      <div className="grid md:grid-cols-3 gap-6 mt-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
          <Users className="w-6 h-6 text-blue-600 mb-2" />
          <p className="text-2xl font-bold">{company.employeesCount}</p>
          <p className="text-gray-500">Employees</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
          <Briefcase className="w-6 h-6 text-green-600 mb-2" />
          <p className="text-2xl font-bold">{company.openJobs}</p>
          <p className="text-gray-500">Open Jobs</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
          <Globe className="w-6 h-6 text-purple-600 mb-2" />
          <p className="text-2xl font-bold">
            {data.website ? (
              <a className="text-blue-600 underline" href={data.website} target="_blank">
                Visit
              </a>
            ) : (
              "N/A"
            )}
          </p>
          <p className="text-gray-500">Website</p>
        </div>
      </div>

      {/* About */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow mt-6">
        <h2 className="text-xl font-bold mb-3">About</h2>
        <p className="text-gray-700 dark:text-gray-300">
          {data.description || "No company description available."}
        </p>
      </div>

      {/* Metadata */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow mt-6 text-sm text-gray-500 dark:text-gray-400">
        <p><b>Status:</b> {data.status}</p>
        <p><b>Created At:</b> {data.createdAt?.toDate ? data.createdAt.toDate().toLocaleString() : "N/A"}</p>
        <p><b>Updated At:</b> {data.updatedAt?.toDate ? data.updatedAt.toDate().toLocaleString() : "N/A"}</p>
      </div>
    </div>
  );
}