import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Notifications() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
  if (!currentUser) return;

  let isMounted = true;

  const fetchNotifications = async () => {
    try {
      const token = await currentUser.getIdToken(true);

      const res = await fetch("http://localhost:5000/notifications", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      const data = await res.json();

      console.log("Fetched data:", data);
      console.log("Response OK:", res.ok);
      console.log("Current User UID:", currentUser.uid);

      if (!isMounted) return;

      if (res.ok && Array.isArray(data.notifications)) {
        setNotifications(data.notifications);
      } else {
        console.error("API returned error:", data.error);
        setNotifications([]);
      }
    } catch (err) {
      console.error("Failed to load notifications:", err);
    }

    if (isMounted) setLoading(false);
  };

  fetchNotifications();
  return () => { isMounted = false };
}, [currentUser]);

  const markAsRead = async (id) => {
    if (!currentUser) return;

    const token = await currentUser.getIdToken();

    await fetch(`http://localhost:5000/notifications/${id}/read`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, status: "read" } : n))
    );
  };

  if (!currentUser)
    return <div className="p-6 text-center text-gray-900 dark:text-gray-100">Please login first.</div>;

  if (loading)
    return <div className="p-6 text-center text-gray-900 dark:text-gray-100">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Notifications</h1>

      {notifications.length === 0 && (
        <p className="text-gray-500 dark:text-gray-400">No notifications yet.</p>
      )}

      <div className="space-y-4">
        {notifications.map(n => (
          <div
            key={n.id}
            className={`p-4 rounded shadow ${
              n.status === "unread" 
                ? "bg-blue-100 dark:bg-blue-900/30" 
                : "bg-gray-200 dark:bg-gray-800"
            }`}
          >
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{n.title}</p>
            <p className="text-gray-700 dark:text-gray-300">{n.message}</p>
            {n.status === "unread" && (
              <button
                className="mt-2 px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded transition"
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
