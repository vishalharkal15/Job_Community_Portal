import { useState } from "react";
import { TrendingUp, Plus, Edit, Trash2, Calendar, Award } from "lucide-react";

export default function CompanyEvents({ companyProfile }) {
  const [events, setEvents] = useState([
    {
      id: 1,
      title: "Tech Talk: Future of AI",
      type: "News",
      date: "2024-12-15",
      description: "Join us for an exciting discussion about AI trends and innovations.",
      attendees: 45,
    },
    {
      id: 2,
      title: "Company Achieves $10M Revenue Milestone",
      type: "Achievement",
      date: "2024-12-10",
      description: "We're proud to announce reaching our $10M revenue milestone!",
      attendees: 0,
    },
    {
      id: 3,
      title: "Campus Hiring Drive 2025",
      type: "Hiring Drive",
      date: "2025-01-20",
      description: "We're coming to top universities to find the best talent!",
      attendees: 120,
    },
  ]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    type: "News",
    date: "",
    description: "",
  });

  const handleCreateEvent = () => {
    if (newEvent.title && newEvent.date) {
      setEvents([
        ...events,
        {
          id: Date.now(),
          ...newEvent,
          attendees: 0,
        },
      ]);
      setNewEvent({ title: "", type: "News", date: "", description: "" });
      setShowCreateModal(false);
      alert("Event created successfully!");
    }
  };

  const handleDeleteEvent = (id) => {
    if (confirm("Are you sure you want to delete this event?")) {
      setEvents(events.filter((e) => e.id !== id));
    }
  };

  const typeColors = {
    News: "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200",
    Achievement: "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200",
    "Hiring Drive": "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200",
    Announcement: "bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200",
  };

  const typeIcons = {
    News: TrendingUp,
    Achievement: Award,
    "Hiring Drive": Calendar,
    Announcement: TrendingUp,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
          <TrendingUp className="w-8 h-8 text-blue-600" />
          Company Events & Announcements
        </h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
        >
          <Plus className="w-5 h-5" />
          Create Event
        </button>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {events.map((event) => {
          const Icon = typeIcons[event.type];
          return (
            <div
              key={event.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-lg ${typeColors[event.type]}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{event.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(event.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${typeColors[event.type]}`}>
                  {event.type}
                </span>
              </div>

              <p className="text-gray-700 dark:text-gray-300 mb-4">{event.description}</p>

              {event.attendees > 0 && (
                <div className="flex items-center gap-2 mb-4 text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-semibold">{event.attendees}</span> attendees registered
                </div>
              )}

              <div className="flex gap-2">
                <button className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition">
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteEvent(event.id)}
                  className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Event Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Create New Event
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Event Title
                </label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Event Type
                </label>
                <select
                  value={newEvent.type}
                  onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="News">News</option>
                  <option value="Achievement">Achievement</option>
                  <option value="Hiring Drive">Hiring Drive</option>
                  <option value="Announcement">Announcement</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateEvent}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
