import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../../firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { useAuth } from "../../context/AuthContext";

import BlogActions from "./BlogActions";
import BlogComments from "./BlogComments";

import { timeAgo } from "../../utils/date";

export default function BlogDetails() {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    fetchBlog();
  }, []);

  async function fetchBlog() {
    const snap = await getDoc(doc(db, "blogs", id));
    const data = snap.data();

    setBlog({
      id: snap.id,
      ...data,
      createdAt: data.createdAt?.toDate() || null, // Firestore → JS Date
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
