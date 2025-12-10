// src/components/Jobs/CreateJob.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import { db } from "../../firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function CreateJob() {
  const { currentUser, userRole } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [minSalary, setMinSalary] = useState("");
  const [maxSalary, setMaxSalary] = useState("");
  const [jobType, setJobType] = useState("Full-time");
  const [workMode, setWorkMode] = useState("Remote");
  const [category, setCategory] = useState(""); // ⭐ TEXT INPUT
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  // ⭐ Auto-fill company + location
  useEffect(() => {
    const fetchCompanyInfo = async () => {
      try {
        if (!currentUser) return;

        const userDocRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userDocRef);

        if (!userSnap.exists()) return;

        const userData = userSnap.data();
        const companyId = userData.companyId;
        if (!companyId) return;

        const companyDocRef = doc(db, "companies", companyId);
        const companySnap = await getDoc(companyDocRef);

        if (!companySnap.exists()) return;

        const companyData = companySnap.data();

        setCompany(companyData.name || "");
        setLocation(companyData.address || "");
      } catch (err) {
        console.error("Failed to fetch company info:", err);
      }
    };

    fetchCompanyInfo();
  }, [currentUser]);

  if (userRole !== "recruiter" && userRole !== "company") {
    return (
      <p className="p-6 text-red-600">
        You do not have permissions to create a job.
      </p>
    );
  }

  // ⭐ Submit job to backend POST /jobs/create
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = await currentUser.getIdToken();

      await axios.post(
        `${import.meta.env.VITE_API_URL}/jobs/create`,
        {
          title,
          company,
          location,
          minSalary: Number(minSalary),
          maxSalary: Number(maxSalary),
          type: jobType,
          workMode,
          category,       // ⭐ TEXT FIELD SENT HERE
          description,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Job created successfully!");
      navigate("/jobs");
    } catch (err) {
      console.error("Error creating job:", err);
      alert("Failed to create job. Try again.");
    }

    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Create a Job</h1>

      <form onSubmit={handleSubmit} className="space-y-4">

        <input
          className="border p-2 w-full"
          placeholder="Job Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <input
          className="border p-2 w-full bg-gray-100"
          placeholder="Company Name"
          value={company}
          disabled
        />

        <input
          className="border p-2 w-full bg-gray-100"
          placeholder="Location (City, Country)"
          value={location}
          disabled
        />

        <div className="flex gap-4">
          <input
            className="border p-2 w-1/2"
            placeholder="Min Salary"
            type="number"
            value={minSalary}
            onChange={(e) => setMinSalary(e.target.value)}
            required
          />

          <input
            className="border p-2 w-1/2"
            placeholder="Max Salary"
            type="number"
            value={maxSalary}
            onChange={(e) => setMaxSalary(e.target.value)}
            required
          />
        </div>

        <div className="flex gap-4">
          <select
            className="border p-2 w-1/2"
            value={jobType}
            onChange={(e) => setJobType(e.target.value)}
          >
            <option>Full-time</option>
            <option>Part-time</option>
            <option>Contract</option>
          </select>

          <select
            className="border p-2 w-1/2"
            value={workMode}
            onChange={(e) => setWorkMode(e.target.value)}
          >
            <option>Remote</option>
            <option>Hybrid</option>
            <option>Onsite</option>
          </select>
        </div>

        {/* ⭐ CATEGORY TEXT INPUT */}
        <input
          className="border p-2 w-full"
          placeholder="Category (e.g., Software, Marketing, HR...)"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        />

        <textarea
          className="border p-2 w-full"
          rows="6"
          placeholder="Job Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
        >
          {loading ? "Creating..." : "Create Job"}
        </button>
      </form>
    </div>
  );
}
