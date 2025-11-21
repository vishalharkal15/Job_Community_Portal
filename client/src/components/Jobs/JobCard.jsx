import { Link } from "react-router-dom";
import { timeAgo } from "../../utils/date";

export default function JobCard({ job }) {
  const createdDate = job.postedAt?.toDate ? job.postedAt.toDate() : job.postedAt;
  return (
    <Link
      to={`/jobs/${job.id}`}
      className="block bg-white rounded-lg shadow-md hover:shadow-lg p-6 transition"
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-xl font-semibold">{job.title}</h3>
          <p className="text-gray-600">{job.company}</p>
        </div>

        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs">
          {job.type}
        </span>
      </div>

      <p className="text-gray-700 mb-4">{job.description.slice(0, 150)}...</p>

      <div className="flex gap-6 text-gray-600 text-sm">
        <p>📍 {job.location}</p>
        <p>💰 {job.minSalary} - {job.maxSalary}</p>
        <p>⏱ {timeAgo(createdDate)}</p>
      </div>
    </Link>
  );
}