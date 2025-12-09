import { useState } from "react";
import { UserCog, Plus, Edit, Trash2, Shield } from "lucide-react";

export default function TeamRoles({ companyProfile }) {
  const [teamMembers, setTeamMembers] = useState([
    {
      id: 1,
      name: "Alice Johnson",
      email: "alice@company.com",
      role: "Owner",
      permissions: ["Full Access"],
      joinedAt: "2023-01-15",
    },
    {
      id: 2,
      name: "Bob Smith",
      email: "bob@company.com",
      role: "HR Manager",
      permissions: ["Manage Jobs", "Manage Applications", "View Analytics"],
      joinedAt: "2023-06-20",
    },
    {
      id: 3,
      name: "Carol Williams",
      email: "carol@company.com",
      role: "Recruiter",
      permissions: ["View Applications", "Filter Candidates"],
      joinedAt: "2023-09-10",
    },
    {
      id: 4,
      name: "David Brown",
      email: "david@company.com",
      role: "Assistant",
      permissions: ["View Jobs Only"],
      joinedAt: "2024-02-05",
    },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newMember, setNewMember] = useState({ name: "", email: "", role: "Assistant" });

  const roles = {
    Owner: {
      color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      icon: "👑",
      permissions: ["Full Access"],
    },
    "HR Manager": {
      color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      icon: "👔",
      permissions: ["Manage Jobs", "Manage Applications", "View Analytics"],
    },
    Recruiter: {
      color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      icon: "🎯",
      permissions: ["View Applications", "Filter Candidates"],
    },
    Assistant: {
      color: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
      icon: "👤",
      permissions: ["View Jobs Only"],
    },
  };

  const handleAddMember = () => {
    if (newMember.name && newMember.email) {
      const member = {
        id: Date.now(),
        ...newMember,
        permissions: roles[newMember.role].permissions,
        joinedAt: new Date().toISOString().split("T")[0],
      };
      setTeamMembers([...teamMembers, member]);
      setNewMember({ name: "", email: "", role: "Assistant" });
      setShowAddModal(false);
      alert("Team member added successfully!");
    }
  };

  const handleRemoveMember = (id) => {
    if (confirm("Are you sure you want to remove this team member?")) {
      setTeamMembers(teamMembers.filter((m) => m.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
          <UserCog className="w-8 h-8 text-blue-600" />
          Team & Roles Management
        </h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
        >
          <Plus className="w-5 h-5" />
          Add Team Member
        </button>
      </div>

      {/* Role Descriptions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(roles).map(([roleName, roleData]) => (
          <div
            key={roleName}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 border border-gray-200 dark:border-gray-700"
          >
            <div className="text-3xl mb-2">{roleData.icon}</div>
            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2">{roleName}</h3>
            <ul className="space-y-1">
              {roleData.permissions.map((perm, idx) => (
                <li key={idx} className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  {perm}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Team Members List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Team Members</h2>
        <div className="space-y-3">
          {teamMembers.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">{member.name}</h3>
                  <span className={`${roles[member.role].color} px-3 py-1 rounded-full text-xs font-medium`}>
                    {roles[member.role].icon} {member.role}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{member.email}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {member.permissions.map((perm, idx) => (
                    <span
                      key={idx}
                      className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded text-xs"
                    >
                      {perm}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Joined: {new Date(member.joinedAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2">
                {member.role !== "Owner" && (
                  <>
                    <button className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition">
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleRemoveMember(member.id)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Add Team Member</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={newMember.email}
                  onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Role
                </label>
                <select
                  value={newMember.role}
                  onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="Assistant">Assistant</option>
                  <option value="Recruiter">Recruiter</option>
                  <option value="HR Manager">HR Manager</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddMember}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
                >
                  Add Member
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
