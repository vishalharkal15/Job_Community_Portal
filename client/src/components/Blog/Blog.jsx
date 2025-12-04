import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { auth } from "../../firebase/firebaseConfig";
import axios from "axios";

export default function BlogList() {
  const [blogs, setBlogs] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

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

  if (loading)
    return (
      <div className="flex justify-center mt-10 text-xl font-semibold">
        Loading blogs...
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto p-6">
      
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-indigo-600">Blogs</h1>

        {/* Only job-seeker can create blog */}
        {profile?.role === "job-seeker" && (
          <Link
            to="/create-blog"
            className="bg-indigo-600 text-white px-4 py-2 rounded shadow hover:bg-indigo-700"
          >
            + Create Blog
          </Link>
        )}
      </div>

      {/* No blogs available */}
      {blogs.length === 0 && (
        <div className="text-center text-gray-500 text-lg mt-10">
          No blogs available yet.
        </div>
      )}

      {/* Blogs List */}
      <div className="space-y-4">
        {blogs.map((blog) => (
          <div
            key={blog.id}
            className="p-5 bg-white rounded-lg shadow border"
          >
            <h2 className="text-xl font-semibold text-indigo-700">
              {blog.title}
            </h2>
            <p className="text-gray-600 mt-2">{blog.content}</p>

            <p className="text-sm mt-3 text-gray-400">
              Posted by: <span className="font-medium">{blog.authorName}</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
