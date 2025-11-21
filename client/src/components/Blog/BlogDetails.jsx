// src/components/Blog/BlogDetails.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../../firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { useAuth } from "../../context/AuthContext";
import BlogActions from "./BlogActions";
import BlogComments from "./BlogComments";

export default function BlogDetails() {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    fetchBlog();
  }, []);

  function timeAgo(date) {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

    const units = [
        { name: "week", secs: 7 * 24 * 60 * 60 },
        { name: "day", secs: 24 * 60 * 60 },
        { name: "hour", secs: 60 * 60 },
        { name: "minute", secs: 60 },
        { name: "second", secs: 1 },
    ];

    for (let unit of units) {
        const value = Math.floor(seconds / unit.secs);
        if (value >= 1) {
        return `${value} ${unit.name}${value > 1 ? "s" : ""} ago`;
        }
    }

    return "just now";
    }

  async function fetchBlog() {
    const snap = await getDoc(doc(db, "blogs", id));
    const data = snap.data();

    setBlog({
        id: snap.id,
        ...data,
        createdAt: data.createdAt?.toDate(), // convert Firestore timestamp
    });
  }

  if (!blog) return <p className="p-6">Loading...</p>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      
      {/* Blog cover */}
      {blog.image && (
        <img
          src={blog.image}
          alt="cover"
          className="w-full h-64 object-cover rounded-md mb-4"
        />
      )}

      <h1 className="text-4xl font-bold">{blog.title}</h1>

      <p className="text-gray-600 mt-2 mb-8">
        By {blog.authorName} • {timeAgo(blog.createdAt)}
      </p>

      <p className="text-lg mb-10 whitespace-pre-wrap">{blog.content}</p>

      {/* Only the author can edit/delete */}
      {currentUser?.uid === blog.authorId && (
        <BlogActions type="edit-delete" blog={blog} refresh={fetchBlog} />
      )}

      {/* All logged in users can like/dislike */}
      <BlogActions type="likes" blog={blog} refresh={fetchBlog} />

      {/* All logged in users can comment */}
      <BlogComments blogId={blog.id} />
    </div>
  );
}
