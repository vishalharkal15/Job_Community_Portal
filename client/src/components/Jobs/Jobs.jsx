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
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Available Jobs</h1>

        {/* Show add job button only for job-seeker */}
        {currentUser && userRole === "job-seeker" && (
          <button
            onClick={handleAddJob}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            + Add Job
          </button>
        )}
      </div>

      {loading ? (
        <p>Loading jobs...</p>
      ) : jobs.length === 0 ? (
        <div className="bg-gray-100 p-6 rounded text-center text-gray-600">
          No jobs available at the moment.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} refresh={loadJobs} />
          ))}
        </div>
      )}
    </div>
  );
}
