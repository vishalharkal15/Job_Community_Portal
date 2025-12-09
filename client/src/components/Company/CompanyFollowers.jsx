import { useState } from "react";
import { Users, UserPlus, Search, Filter, Star, Mail, Phone, MapPin } from "lucide-react";

export default function CompanyFollowers({ companyProfile }) {
  const [followers, setFollowers] = useState([
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      phone: "+1 234 567 8900",
      location: "New York, NY",
      skills: ["React", "Node.js", "MongoDB"],
      experience: "5 years",
      followedAt: "2024-11-15",
      matchScore: 95,
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane@example.com",
      phone: "+1 234 567 8901",
      location: "San Francisco, CA",
      skills: ["Python", "Django", "PostgreSQL"],
      experience: "3 years",
      followedAt: "2024-11-18",
      matchScore: 88,
    },
    {
      id: 3,
      name: "Mike Johnson",
      email: "mike@example.com",
      phone: "+1 234 567 8902",
      location: "Austin, TX",
      skills: ["Java", "Spring Boot", "AWS"],
      experience: "7 years",
      followedAt: "2024-11-20",
      matchScore: 92,
    },
    {
      id: 4,
      name: "Sarah Williams",
      email: "sarah@example.com",
      phone: "+1 234 567 8903",
      location: "Boston, MA",
      skills: ["UI/UX", "Figma", "Adobe XD"],
      experience: "4 years",
      followedAt: "2024-11-22",
      matchScore: 85,
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterExperience, setFilterExperience] = useState("all");

  const similarCandidates = [
    { name: "Alex Brown", skills: ["React", "Vue.js", "TypeScript"], matchScore: 89 },
    { name: "Emma Davis", skills: ["Python", "FastAPI", "Docker"], matchScore: 87 },
    { name: "David Wilson", skills: ["Java", "Microservices", "Kubernetes"], matchScore: 91 },
  ];

  const filteredFollowers = followers.filter((follower) => {
    const matchesSearch =
      follower.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      follower.skills.some((skill) =>
        skill.toLowerCase().includes(searchTerm.toLowerCase())
      );
    const matchesExperience =
      filterExperience === "all" ||
      (filterExperience === "fresher" && parseInt(follower.experience) <= 2) ||
      (filterExperience === "mid" &&
        parseInt(follower.experience) > 2 &&
        parseInt(follower.experience) <= 5) ||
      (filterExperience === "senior" && parseInt(follower.experience) > 5);

    return matchesSearch && matchesExperience;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
          <Users className="w-8 h-8 text-blue-600" />
          Talent Pool & Followers
        </h1>
        <div className="text-right">
          <div className="text-3xl font-bold text-blue-600">{followers.length}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Followers</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name or skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterExperience}
              onChange={(e) => setFilterExperience(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="all">All Experience</option>
              <option value="fresher">Fresher (0-2 years)</option>
              <option value="mid">Mid-Level (3-5 years)</option>
              <option value="senior">Senior (5+ years)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Followers List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredFollowers.map((follower) => (
          <div
            key={follower.id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {follower.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{follower.experience} experience</p>
              </div>
              <div className="flex items-center gap-1 bg-green-100 dark:bg-green-900 px-3 py-1 rounded-full">
                <Star className="w-4 h-4 text-green-600 dark:text-green-400" fill="currentColor" />
                <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                  {follower.matchScore}%
                </span>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Mail className="w-4 h-4" />
                {follower.email}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Phone className="w-4 h-4" />
                {follower.phone}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <MapPin className="w-4 h-4" />
                {follower.location}
              </div>
            </div>

            <div className="mb-4">
              <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Skills:</div>
              <div className="flex flex-wrap gap-2">
                {follower.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-xs font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              Followed on {new Date(follower.followedAt).toLocaleDateString()}
            </div>

            <div className="flex gap-2">
              <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
                Contact
              </button>
              <button className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
                View Profile
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Similar Candidates Suggestions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <UserPlus className="w-6 h-6 text-purple-600" />
          Suggested Candidates (Similar to your applicants)
        </h2>
        <div className="space-y-3">
          {similarCandidates.map((candidate, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">{candidate.name}</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  {candidate.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-1 rounded text-xs"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-purple-600 dark:text-purple-400 font-semibold">
                  <Star className="w-4 h-4" fill="currentColor" />
                  {candidate.matchScore}%
                </div>
                <button className="mt-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-1 rounded-lg text-sm transition">
                  Invite
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
