import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Notifications() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
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

        if (isMounted) {
          setNotifications(Array.isArray(data.notifications) ? data.notifications : []);
        }

      } catch (err) {
        console.error("Failed to load notifications:", err);
      }

      if (isMounted) setLoading(false);
    };

    fetchNotifications();
    return () => (isMounted = false);
  }, [currentUser]);


  // mark read helper
  const markAsRead = async (id) => {
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


  // 🔥 fix — handle redirection click
  const handleNotificationClick = async (n) => {
    // update UI + backend
    if (n.status === "unread") await markAsRead(n.id);

    if (!n.redirectUrl) return;

    console.log("Redirecting to:", n.redirectUrl);

    if (n.redirectUrl.startsWith("http")) {
      // open external link (zoom, website)
      window.open(n.redirectUrl, "_blank");
    } else {
      // navigate internal route
      navigate(n.redirectUrl);
    }
  };


  if (!currentUser)
    return <div className="p-6 text-center text-gray-900 dark:text-gray-100">Login required</div>;

  if (loading)
    return <div className="p-6 text-center text-gray-900 dark:text-gray-100">Loading notifications...</div>;


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">Notifications</h1>

        {notifications.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">No notifications yet.</p>
          </div>
        )}

        <div className="space-y-4">
          {notifications.map(n => (
            <div
              key={n.id}
              onClick={() => handleNotificationClick(n)}
              className={`cursor-pointer p-5 rounded-lg shadow-md transition-all hover:shadow-lg ${
                n.status === "unread"
                  ? "bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500"
                  : "bg-white dark:bg-gray-800 border-l-4 border-gray-300 dark:border-gray-600"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-semibold text-lg text-gray-900 dark:text-gray-100">{n.title}</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{n.message}</p>
                  
                  {n.createdAt && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      {new Date(n.createdAt).toLocaleString()}
                    </p>
                  )}
                </div>
                
                {n.status === "unread" && (
                  <span className="ml-3 px-2 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full">
                    New
                  </span>
                )}
              </div>

              {n.redirectUrl && (
                <p className="text-blue-600 dark:text-blue-400 underline text-sm mt-3 font-medium flex items-center gap-1">
                  {n.redirectUrl.startsWith("http")
                    ? "🔗 Open link"
                    : "➡️ Go to page"}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
