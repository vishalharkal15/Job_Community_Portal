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
    return <div className="p-6 text-center">Login required</div>;

  if (loading)
    return <div className="p-6 text-center">Loading notifications...</div>;


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
            onClick={() => handleNotificationClick(n)}
            className={`cursor-pointer p-4 rounded shadow transition ${
              n.status === "unread"
                ? "bg-blue-100 hover:bg-blue-200"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            <p className="font-semibold">{n.title}</p>
            <p className="text-sm">{n.message}</p>

            {n.redirectUrl && (
              <p className="text-blue-600 underline text-sm mt-2 font-medium">
                {n.redirectUrl.startsWith("http")
                  ? "Open link"
                  : "Go to page"}
                  console.log("Notification entry:", n);
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
