// src/components/Blog/BlogComments.jsx
import { useState, useEffect } from "react";
import { db } from "../../firebase/firebaseConfig";
import { useAuth } from "../../context/AuthContext";
import {
  collection,
  addDoc,
  query,
  getDocs,
  orderBy,
} from "firebase/firestore";

export default function BlogComments({ blogId }) {
  const { currentUser } = useAuth();
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);

  useEffect(() => {
    loadComments();
  }, []);

  async function loadComments() {
    const q = query(
      collection(db, "blogs", blogId, "comments"),
      orderBy("createdAt", "asc")
    );

    const snap = await getDocs(q);
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    setComments(list);
  }

  async function postComment() {
    if (!comment.trim()) return;

    await addDoc(collection(db, "blogs", blogId, "comments"), {
      text: comment,
      author: currentUser.displayName,
      createdAt: new Date(),
    });

    setComment("");
    loadComments();
  }

  return (
    <div className="mt-10">
      <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Comments</h2>

      {comments.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">No comments yet.</p>
      ) : (
        <div className="space-y-4">
          {comments.map((c) => (
            <div key={c.id} className="p-3 bg-gray-100 dark:bg-gray-700 rounded-md">
              <p className="font-semibold text-gray-900 dark:text-gray-100">{c.author}</p>
              <p className="text-gray-700 dark:text-gray-300">{c.text}</p>
            </div>
          ))}
        </div>
      )}

      {currentUser && (
        <div className="mt-4 flex gap-3">
          <input
            className="border border-gray-300 dark:border-gray-600 p-2 flex-grow rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
            placeholder="Write comment..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <button
            onClick={postComment}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Post
          </button>
        </div>
      )}
    </div>
  );
}
