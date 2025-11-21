import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../../firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { timeAgo } from "../../utils/date";
import JobActions from "./JobActions";

export default function JobDetails() {
  const { id } = useParams();
  const [job, setJob] = useState(null);

  useEffect(() => {
    fetchJob();
  }, []);

  async function fetchJob() {
    const snap = await getDoc(doc(db, "jobs", id));
    const data = snap.data();

    setJob({
      id: snap.id,
      ...data,
      postedAt: data.postedAt ? data.postedAt.toDate() : new Date(),
    });
  }

  if (!job) return <p className="p-6">Loading...</p>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-4xl font-bold mb-2">{job.title}</h1>

      <p className="text-gray-600 mb-8">
        {job.company} • {job.location} • {timeAgo(job.postedAt)}
      </p>

      <p className="text-lg mb-6 whitespace-pre-wrap">{job.description}</p>

      <div className="text-gray-700 space-y-2 mb-6">
        <p><strong>Job Type:</strong> {job.type}</p>
        <p>
          <strong>Salary:</strong> {job.minSalary} - {job.maxSalary}
        </p>
        <p><strong>Mode:</strong> {job.workMode}</p>
      </div>

      <JobActions jobId={job.id} jobData={job} refresh={fetchJob} />
    </div>
  );
}