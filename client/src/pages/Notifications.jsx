import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Notifications() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  /* -----------------------------------------
     1️⃣ FETCH NOTIFICATIONS
  ------------------------------------------ */
  useEffect(() => {
    if (!currentUser) return;

    let mounted = true;

    const fetchNotifications = async () => {
      try {
        const token = await currentUser.getIdToken(true);

        const res = await fetch("http://localhost:5000/notifications", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await res.json();

        if (mounted) {
          // sort newest first
          const sorted = (data.notifications || []).sort(
            (a, b) => (b.createdAt || 0) - (a.createdAt || 0)
          );
          setNotifications(sorted);
        }
      } catch (err) {
        console.error("Failed to load notifications:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchNotifications();
    return () => (mounted = false);
  }, [currentUser]);

  /* -----------------------------------------
     3️⃣ MARK SINGLE AS READ
  ------------------------------------------ */
  const markAsRead = async (id) => {
    const token = await currentUser.getIdToken();

    await fetch(`http://localhost:5000/notifications/${id}/read`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, status: "read" } : n))
    );
  };

  /* -----------------------------------------
     4️⃣ GROUP BY DATE
  ------------------------------------------ */
  const groupNotifications = (list) => {
    const now = new Date();

    const today = new Date(now);
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 7);

    const groups = {
      Today: [],
      Yesterday: [],
      "This week": [],
      Older: [],
    };

    list.forEach(n => {
      if (!n.createdAt) return groups.Older.push(n);

      const d = new Date(n.createdAt);

      if (d >= today) groups.Today.push(n);
      else if (d >= yesterday) groups.Yesterday.push(n);
      else if (d >= weekAgo) groups["This week"].push(n);
      else groups.Older.push(n);
    });

    return groups;
  };

  const grouped = groupNotifications(notifications);

  /* -----------------------------------------
     5️⃣ CLICK HANDLER
  ------------------------------------------ */
  const handleNotificationClick = async (n) => {
    if (n.status === "unread") await markAsRead(n.id);

    if (!n.redirectUrl) return;

    if (n.redirectUrl.startsWith("http")) {
      window.open(n.redirectUrl, "_blank");
    } else {
      navigate(n.redirectUrl);
    }
  };

  /* -----------------------------------------
     6️⃣ RENDER
  ------------------------------------------ */
  if (!currentUser)
    return <div className="p-6 text-center">Login required</div>;

  if (loading)
    return <div className="p-6 text-center">Loading notifications...</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Notifications</h1>

        {notifications.length === 0 && (
          <div className="bg-white dark:bg-gray-800 p-8 rounded text-center">
            No notifications yet.
          </div>
        )}

        {Object.entries(grouped).map(([label, items]) =>
          items.length > 0 && (
            <div key={label} className="mb-8">
              <h2 className="text-lg font-semibold mb-3">{label}</h2>

              <div className="space-y-4">
                {items.map(n => (
                  <div
                    key={n.id}
                    onClick={() => handleNotificationClick(n)}
                    className={`cursor-pointer p-5 rounded-lg shadow transition ${
                      n.status === "unread"
                        ? "bg-blue-50 border-l-4 border-blue-500"
                        : "bg-white border-l-4 border-gray-300"
                    }`}
                  >
                    <p className="font-semibold text-lg">{n.title}</p>
                    <p className="text-sm text-gray-600">{n.message}</p>

                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(n.createdAt).toLocaleString()}
                    </p>

                    {n.status === "unread" && (
                      <span className="inline-block mt-2 text-xs font-semibold bg-blue-600 text-white px-2 py-1 rounded">
                        New
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
