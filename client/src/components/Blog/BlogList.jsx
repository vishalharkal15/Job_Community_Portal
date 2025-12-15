import { useEffect, useState } from "react";
import axios from "axios";
import BlogCard from "./BlogCard";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import { BookOpen, PenSquare, Search, TrendingUp } from "lucide-react";

export default function BlogList() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { userRole } = useAuth();

  useEffect(() => {
    fetchBlogs();
  }, []);

  async function fetchBlogs() {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/blogs`
      );
      setBlogs(res.data.blogs || []);
    } catch (err) {
      console.error("Failed to load blogs:", err);
    } finally {
      setLoading(false);
    }
  }

  const filteredBlogs = blogs.filter((blog) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      blog.title?.toLowerCase().includes(searchLower) ||
      blog.content?.toLowerCase().includes(searchLower) ||
      blog.authorName?.toLowerCase().includes(searchLower)
    );
  });

  const canCreateBlog = [
    "recruiter",
    "company",
    "admin",
    "super-admin"
  ].includes(userRole);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">Loading blogs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-6 shadow-lg">
            <BookOpen className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-gray-100 mb-4">
            Community Blogs
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Discover insights, experiences, and stories from our community
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 text-center border border-gray-100 dark:border-gray-700">
            <BookOpen className="w-8 h-8 text-indigo-600 mx-auto mb-3" />
            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
              {blogs.length}
            </div>
            <div className="text-gray-600 dark:text-gray-400">Total Blogs</div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 text-center border border-gray-100 dark:border-gray-700">
            <Search className="w-8 h-8 text-purple-600 mx-auto mb-3" />
            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
              {filteredBlogs.length}
            </div>
            <div className="text-gray-600 dark:text-gray-400">Matching Blogs</div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 text-center border border-gray-100 dark:border-gray-700">
            <TrendingUp className="w-8 h-8 text-pink-600 mx-auto mb-3" />
            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
              {canCreateBlog ? "Writer" : "Reader"}
            </div>
            <div className="text-gray-600 dark:text-gray-400">Your Role</div>
          </div>
        </div>

        {/* Search and Create Button */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-8 border border-gray-100 dark:border-gray-700">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Search */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search blogs by title, content, or author..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>

            {/* Create Blog Button */}
            {canCreateBlog && (
              <Link
                to="/create-blog"
                className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 font-semibold whitespace-nowrap"
              >
                <PenSquare className="w-5 h-5" />
                Create Blog
              </Link>
            )}
          </div>
        </div>

        {/* Blogs Grid */}
        {filteredBlogs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredBlogs.map((blog) => (
              <BlogCard key={blog.id} blog={blog} />
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-12 text-center border border-gray-100 dark:border-gray-700">
            <BookOpen className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              {searchTerm ? "No Blogs Found" : "No Blogs Available"}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchTerm
                ? "Try adjusting your search criteria"
                : "Be the first to share your insights with the community"}
            </p>
            {canCreateBlog && !searchTerm && (
              <Link
                to="/create-blog"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 font-semibold"
              >
                <PenSquare className="w-5 h-5" />
                Create Your First Blog
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
