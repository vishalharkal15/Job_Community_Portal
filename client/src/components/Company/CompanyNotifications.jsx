import { useState } from "react";
import { Bell, Check, X, Clock, UserPlus, Briefcase, Calendar } from "lucide-react";

export default function CompanyNotifications({ companyProfile }) {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "application",
      title: "New Application Received",
      message: "John Doe applied for Senior React Developer position",
      timestamp: "2024-12-08 10:30 AM",
      read: false,
      icon: Briefcase,
    },
    {
      id: 2,
      type: "offer",
      title: "Offer Accepted",
      message: "Jane Smith accepted the offer for Product Manager role",
      timestamp: "2024-12-08 09:15 AM",
      read: false,
      icon: Check,
    },
    {
      id: 3,
      type: "expiring",
      title: "Job Post Expiring Soon",
      message: "DevOps Engineer position will expire in 2 days",
      timestamp: "2024-12-08 08:00 AM",
      read: true,
      icon: Clock,
    },
    {
      id: 4,
      type: "follower",
      title: "New Follower",
      message: "Mike Johnson started following your company",
      timestamp: "2024-12-07 05:45 PM",
      read: true,
      icon: UserPlus,
    },
    {
      id: 5,
      type: "interview",
      title: "Interview Scheduled",
      message: "Interview with Sarah Williams scheduled for Dec 15, 2024",
      timestamp: "2024-12-07 03:20 PM",
      read: true,
      icon: Calendar,
    },
  ]);

  const [filter, setFilter] = useState("all");

  const markAsRead = (id) => {
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = (id) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread") return !n.read;
    if (filter === "read") return n.read;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const typeColors = {
    application: "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400",
    offer: "bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400",
    expiring: "bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400",
    follower: "bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400",
    interview: "bg-pink-100 dark:bg-pink-900 text-pink-600 dark:text-pink-400",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
          <Bell className="w-8 h-8 text-blue-600" />
          Notifications Center
          {unreadCount > 0 && (
            <span className="bg-red-600 text-white text-sm px-3 py-1 rounded-full">
              {unreadCount} New
            </span>
          )}
        </h1>
        <button
          onClick={markAllAsRead}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition"
        >
          Mark All as Read
        </button>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            filter === "all"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter("unread")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            filter === "unread"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
          }`}
        >
          Unread ({unreadCount})
        </button>
        <button
          onClick={() => setFilter("read")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            filter === "read"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
          }`}
        >
          Read ({notifications.length - unreadCount})
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.map((notification) => {
          const Icon = notification.icon;
          return (
            <div
              key={notification.id}
              className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 border border-gray-200 dark:border-gray-700 ${
                !notification.read ? "border-l-4 border-l-blue-600" : ""
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg ${typeColors[notification.type]}`}>
                  <Icon className="w-6 h-6" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      {notification.title}
                    </h3>
                    {!notification.read && (
                      <span className="bg-blue-600 w-3 h-3 rounded-full flex-shrink-0"></span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    {notification.timestamp}
                  </p>
                </div>

                <div className="flex gap-2">
                  {!notification.read && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition"
                      title="Mark as read"
                    >
                      <Check className="w-5 h-5" />
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(notification.id)}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                    title="Delete"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredNotifications.length === 0 && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            No notifications found
          </div>
        )}
      </div>
    </div>
  );
}
