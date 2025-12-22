import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";

export default function BlogComments({ blogId }) {
  const { currentUser } = useAuth();
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);

  useEffect(() => {
    loadComments();
  }, [blogId]);

  async function loadComments() {
    const res = await axios.get(
      `${import.meta.env.VITE_API_URL}/blogs/${blogId}/comments`
    );
    setComments(res.data.comments || []);
  }

  async function postComment() {
    if (!currentUser || !comment.trim()) return;

    await axios.post(
      `${import.meta.env.VITE_API_URL}/blogs/${blogId}/comments`,
      { text: comment },
      {
        headers: {
          Authorization: `Bearer ${await currentUser.getIdToken()}`
        }
      }
    );

    setComment("");
    loadComments();
  }

  return (
    <div className="mt-10">
      <h2 className="text-2xl font-semibold mb-4">Comments</h2>

      {comments.length === 0 ? (
        <p className="text-gray-500">No comments yet.</p>
      ) : (
        <div className="space-y-4">
          {comments.map((c) => (
            <div key={c.id} className="p-4 bg-gray-100 rounded-lg">
              <Link
                to={`/users/${c.userId}`}
                className="font-semibold text-indigo-600 hover:text-indigo-800 hover:underline transition"
              >
                {c.authorName || "User"}
              </Link>

              <p className="mt-1 text-gray-800">{c.text}</p>
            </div>
          ))}
        </div>
      )}

      {currentUser && (
        <div className="mt-4 flex gap-3">
          <input
            className="border p-2 flex-grow rounded"
            placeholder="Write comment..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <button
            onClick={postComment}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Post
          </button>
        </div>
      )}
    </div>
  );
}
