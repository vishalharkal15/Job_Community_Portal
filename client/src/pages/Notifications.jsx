import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Notifications() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!currentUser) return; // <-- Prevents null error

    const fetchNotifications = async () => {
      try {
        const token = await currentUser.getIdToken();

        const res = await fetch("http://localhost:5000/notifications", {
          headers: { Authorization: `Bearer ${token}` }
        });

        const data = await res.json();

        setNotifications(data.notifications || []);
      } catch (err) {
        console.error("Failed to load notifications:", err);
      }

      setLoading(false);
    };

    fetchNotifications();
  }, [currentUser]);

  const markAsRead = async (id) => {
    if (!currentUser) return;

    const token = await currentUser.getIdToken();

    await fetch(`http://localhost:5000/notifications/${id}/read`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` }
    });

    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, status: "read" } : n))
    );
  };

  if (!currentUser)
    return <div className="p-6 text-center">Please login first.</div>;

  if (loading)
    return <div className="p-6 text-center">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Notifications</h1>

      {notifications.length === 0 && (
        <p className="text-gray-500">No notifications yet.</p>
      )}

      <div className="space-y-4">
        {notifications.map(n => (
          <div
            key={n.id}
            className={`p-4 rounded shadow ${
              n.status === "unread" ? "bg-blue-100" : "bg-gray-200"
            }`}
          >
            <p className="text-lg font-semibold">{n.title}</p>
            <p className="text-gray-700">{n.message}</p>
            {n.status === "unread" && (
              <button
                className="mt-2 px-3 py-1 text-sm bg-blue-600 text-white rounded"
                onClick={() => markAsRead(n.id)}
              >
                Mark as Read
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
