import { Link } from "react-router-dom";
import { timeAgo } from "../../utils/date";

export default function JobCard({ job }) {
  const createdDate = job.postedAt?.toDate ? job.postedAt.toDate() : job.postedAt;
  return (
    <Link
      to={`/jobs/${job.id}`}
      className="block bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg p-6 transition"
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{job.title}</h3>
          <p className="text-gray-600 dark:text-gray-300">{job.company}</p>
        </div>

        <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-xs">
          {job.type}
        </span>
      </div>

      <p className="text-gray-700 dark:text-gray-300 mb-4">{(job.description || '').slice(0, 150)}{job.description && job.description.length > 150 ? '...' : ''}</p>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-gray-600 dark:text-gray-400 text-sm">
        <div className="flex gap-4">
          <p>📍 {job.location}</p>
          <p>💰 {job.minSalary} - {job.maxSalary}</p>
        </div>
        <p className="sm:ml-4">⏱ {timeAgo(createdDate)}</p>
      </div>
    </Link>
  );
}