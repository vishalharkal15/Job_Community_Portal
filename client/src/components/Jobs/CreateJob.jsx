// src/components/Jobs/CreateJob.jsx
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../firebase/firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
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
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  if (userRole !== "recruiter")
    return (
      <p className="p-6 text-red-600">
        You do not have permissions to create a job.
      </p>
    );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await addDoc(collection(db, "jobs"), {
        title,
        company,
        location,
        minSalary: parseInt(minSalary),
        maxSalary: parseInt(maxSalary),
        type: jobType,
        workMode,
        description,
        postedAt: serverTimestamp(),
        createdBy: currentUser.uid,
        savedBy: [],
        appliedBy: [],
      });

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
          className="border p-2 w-full"
          placeholder="Company Name"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          required
        />

        <input
          className="border p-2 w-full"
          placeholder="Location (City, Country)"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          required
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
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Contract">Contract</option>
          </select>

          <select
            className="border p-2 w-1/2"
            value={workMode}
            onChange={(e) => setWorkMode(e.target.value)}
          >
            <option value="Remote">Remote</option>
            <option value="Hybrid">Hybrid</option>
            <option value="Onsite">Onsite</option>
          </select>
        </div>

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
