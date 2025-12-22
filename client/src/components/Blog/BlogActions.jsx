import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  ThumbsUp,
  ThumbsDown,
  Edit,
  Trash2,
  Save,
  X
} from "lucide-react";

export default function BlogActions({ type, blog, refresh }) {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [editMode, setEditMode] = useState(false);
  const [tempBlog, setTempBlog] = useState(blog);
  const uid = currentUser?.uid;

  async function authHeader() {
    return {
      headers: {
        Authorization: `Bearer ${await currentUser.getIdToken()}`
      }
    };
  }

  async function likeBlog() {
    if (!currentUser) return navigate("/auth/login");
    await axios.put(
      `${import.meta.env.VITE_API_URL}/blogs/${blog.id}/like`,
      {},
      await authHeader()
    );
    refresh();
  }

  async function dislikeBlog() {
    if (!currentUser) return navigate("/auth/login");
    await axios.put(
      `${import.meta.env.VITE_API_URL}/blogs/${blog.id}/dislike`,
      {},
      await authHeader()
    );
    refresh();
  }

  async function saveChanges() {
    await axios.put(
      `${import.meta.env.VITE_API_URL}/blogs/${blog.id}/edit`,
      {
        title: tempBlog.title,
        content: tempBlog.content,
        image: tempBlog.image
      },
      await authHeader()
    );
    setEditMode(false);
    refresh();
  }

  async function deleteBlog() {
    if (!confirm("Delete this blog?")) return;
    await axios.delete(
      `${import.meta.env.VITE_API_URL}/blogs/${blog.id}`,
      await authHeader()
    );
    navigate("/blog");
  }

  if (type === "likes") {
    const liked = uid && blog.likes?.includes(uid);
    const disliked = uid && blog.dislikes?.includes(uid);

    return (
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={likeBlog}
          title="Like"
          className={`flex items-center gap-1 px-3 py-2 rounded-lg transition
            ${liked ? "bg-green-600 text-white" : "bg-green-100 text-green-700 hover:bg-green-200"}`}
        >
          <ThumbsUp className="w-4 h-4" />
          <span className="text-sm font-medium">{blog.likes?.length || 0}</span>
        </button>

        <button
          onClick={dislikeBlog}
          title="Dislike"
          className={`flex items-center gap-1 px-3 py-2 rounded-lg transition
            ${disliked ? "bg-orange-600 text-white" : "bg-orange-100 text-orange-700 hover:bg-orange-200"}`}
        >
          <ThumbsDown className="w-4 h-4" />
          <span className="text-sm font-medium">{blog.dislikes?.length || 0}</span>
        </button>
      </div>
    );
  }

  if (type === "edit-delete") {
    if (editMode) {
      return (
        <div className="mb-10 space-y-3">
          <input
            className="border p-2 w-full rounded"
            value={tempBlog.title}
            onChange={(e) =>
              setTempBlog({ ...tempBlog, title: e.target.value })
            }
          />
          <textarea
            className="border p-2 w-full rounded"
            rows="5"
            value={tempBlog.content}
            onChange={(e) =>
              setTempBlog({ ...tempBlog, content: e.target.value })
            }
          />
          <input
            className="border p-2 w-full rounded"
            placeholder="Image URL"
            value={tempBlog.image || ""}
            onChange={(e) =>
              setTempBlog({ ...tempBlog, image: e.target.value })
            }
          />

          <div className="flex gap-3">
            <button
              onClick={saveChanges}
              title="Save"
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              <Save className="w-4 h-4" />
              Save
            </button>

            <button
              onClick={() => setEditMode(false)}
              title="Cancel"
              className="flex items-center gap-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex gap-4 mb-10">
        <button
          onClick={() => setEditMode(true)}
          title="Edit"
          className="p-3 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200"
        >
          <Edit className="w-5 h-5" />
        </button>

        <button
          onClick={deleteBlog}
          title="Delete"
          className="p-3 rounded-lg bg-red-100 text-red-700 hover:bg-red-200"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return null;
}
