// src/components/Blog/BlogList.jsx
import { useEffect, useState } from "react";
import { db } from "../../firebase/firebaseConfig";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import BlogCard from "./BlogCard";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";

export default function BlogList() {
  const [blogs, setBlogs] = useState([]);
  const { userRole } = useAuth();

  useEffect(() => {
    fetchBlogs();
  }, []);

  async function fetchBlogs() {
    const q = query(collection(db, "blogs"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);

    const list = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setBlogs(list);
  }

  return (
    <div className="max-w-4xl mx-auto p-6 text-gray-900 dark:text-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Blogs</h1>

        {userRole === "recruiter" && (
          <Link
            to="/create-blog"
            className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            Create Blog
          </Link>
        )}
      </div>

      {blogs.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-center">No blogs available yet.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {blogs.map((blog) => (
            <BlogCard key={blog.id} blog={blog} />
          ))}
        </div>
      )}
    </div>
  );
}
