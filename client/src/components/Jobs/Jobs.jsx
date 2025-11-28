import { useEffect, useState } from "react";
import { db } from "../../firebase/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { useAuth } from "../../context/AuthContext";
import JobCard from "./JobCard";
import { useNavigate } from "react-router-dom";

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const { currentUser, userRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadJobs();
  }, []);

  async function loadJobs() {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "jobs"));
      const list = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setJobs(list);
    } catch (err) {
      console.error("Error fetching jobs:", err);
    }
    setLoading(false);
  }

  const handleAddJob = () => {
    navigate("/create-job"); // navigate to your CreateJob page
  };

  return (
    <div className="max-w-6xl mx-auto p-6 text-gray-900 dark:text-gray-100">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Available Jobs</h1>

        {currentUser && userRole === "recruiter" && (
          <button
            onClick={handleAddJob}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
          >
            + Add Job
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-gray-600 dark:text-gray-300">Loading jobs...</p>
      ) : jobs.length === 0 ? (
        <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded text-center text-gray-600 dark:text-gray-300">
          No jobs available at the moment.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} refresh={loadJobs} />
          ))}
        </div>
      )}
    </div>
  );
}
