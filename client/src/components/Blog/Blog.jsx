import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { auth } from "../../firebase/firebaseConfig";
import axios from "axios";
import { BookOpen, PenSquare, Search, User, Calendar, TrendingUp } from "lucide-react";

export default function BlogList() {
  const [blogs, setBlogs] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadProfileAndBlogs();
  }, []);

  const loadProfileAndBlogs = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const token = await user.getIdToken();
        const res = await axios.post(
          "http://localhost:5000/login",
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setProfile(res.data.profile);
      }

      const blogsRes = await axios.get("http://localhost:5000/blogs");
      setBlogs(blogsRes.data.blogs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredBlogs = blogs.filter((blog) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      blog.title?.toLowerCase().includes(searchLower) ||
      blog.content?.toLowerCase().includes(searchLower) ||
      blog.authorName?.toLowerCase().includes(searchLower)
    );
  });

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
            Share insights, experiences, and connect with the community
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
              {profile?.role === "job-seeker" ? "Writer" : "Reader"}
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
            {profile?.role === "job-seeker" && (
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

        {/* Blogs List */}
        {filteredBlogs.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredBlogs.map((blog) => (
              <div
                key={blog.id}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 p-6 border border-gray-100 dark:border-gray-700 group"
              >
                {/* Blog Title */}
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {blog.title}
                </h2>

                {/* Blog Content */}
                <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3 leading-relaxed">
                  {blog.content}
                </p>

                {/* Blog Meta Info */}
                <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
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
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  )}
                </div>

                {/* Read More Button */}
                <button className="mt-4 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold text-sm flex items-center gap-1 group">
                  Read More
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </button>
              </div>
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
                : "Be the first to share your thoughts with the community"}
            </p>
            {profile?.role === "job-seeker" && !searchTerm && (
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
