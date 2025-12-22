// src/components/Blog/BlogCard.jsx
import { Link } from "react-router-dom";
import { User, Calendar, ArrowRight } from "lucide-react";

export default function BlogCard({ blog }) {
  return (
    <Link
      to={`/blog/${blog.id}`}
      className="block bg-white dark:bg-gray-800 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700 group overflow-hidden"
    >
      {blog.image && (
        <div className="relative overflow-hidden">
          <img
            src={blog.image || "/placeholder.jpg"}
            alt="cover"
            className="w-full h-52 object-cover transition-transform duration-300 group-hover:scale-110"
            onError={(e) => {
              e.currentTarget.src = "/placeholder.jpg";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
      )}

      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {blog.title}
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mt-2 line-clamp-3 leading-relaxed">
          {blog.content}
        </p>

        <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <User className="w-4 h-4" />
            <span className="font-medium text-gray-700 dark:text-gray-300">
              {blog.authorName || "Anonymous"}
            </span>
          </div>
          
          {blog.createdAt && (
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Calendar className="w-4 h-4" />
              <span>
                {new Date(blog.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold text-sm">
          Read More
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  );
}