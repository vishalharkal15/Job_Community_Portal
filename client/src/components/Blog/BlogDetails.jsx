import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import BlogActions from "./BlogActions";
import BlogComments from "./BlogComments";
import { timeAgo } from "../../utils/date";

export default function BlogDetails() {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const [blog, setBlog] = useState(null);

  useEffect(() => {
    fetchBlog();
  }, [id]);

  async function fetchBlog() {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/blogs/${id}`
      );
      setBlog(res.data.blog);
    } catch (err) {
      console.error("Failed to load blog:", err);
    }
  }

  if (!blog) return <p className="p-6">Loading...</p>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      {blog.image && (
        <img
          src={blog.image || "/placeholder.jpg"}
          alt="cover"
          className="w-full h-52 object-cover transition-transform duration-300 group-hover:scale-110"
          onError={(e) => {
            e.currentTarget.src = "/placeholder.jpg";
          }}
        />
      )}
<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
  <h1 className="text-4xl font-bold break-words">
    {blog.title}
  </h1>

  {currentUser?.uid === blog.authorId && (
    <BlogActions
      type="edit-delete"
      blog={blog}
      refresh={fetchBlog}
    />
  )}
</div>

      <p className="text-gray-600 mb-8 flex flex-wrap items-center gap-2">
        <span>By</span>

        {blog.authorId ? (
          <Link
            to={`/users/${blog.authorId}`}
            className="font-semibold text-indigo-600 hover:text-indigo-800 hover:underline transition-colors"
          >
            {blog.authorName || "Anonymous"}
          </Link>
        ) : (
          <span className="font-semibold">
            {blog.authorName || "Anonymous"}
          </span>
        )}

        <span>•</span>
        <span>{timeAgo(blog.createdAt)}</span>
      </p>

      <p className="text-lg mb-10 whitespace-pre-wrap">{blog.content}</p>

      <BlogActions type="likes" blog={blog} refresh={fetchBlog} />

      <BlogComments blogId={blog.id} />
    </div>
  );
}
