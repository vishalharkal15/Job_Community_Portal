import { useState } from "react";
import { Star, ThumbsUp, Flag, Filter } from "lucide-react";

export default function CompanyReviews({ companyProfile }) {
  const [reviews, setReviews] = useState([
    {
      id: 1,
      authorName: "Anonymous Employee",
      authorType: "Current Employee",
      position: "Software Engineer",
      rating: 4.5,
      workCulture: 5,
      interviewExperience: 4,
      salarySatisfaction: 4,
      date: "2024-11-20",
      title: "Great place to work!",
      pros: "Excellent work-life balance, supportive management, and great learning opportunities.",
      cons: "Limited parking space, occasional long meetings.",
      helpful: 12,
      verified: true,
    },
    {
      id: 2,
      authorName: "Anonymous Candidate",
      authorType: "Ex-Employee",
      position: "Product Manager",
      rating: 4.0,
      workCulture: 4,
      interviewExperience: 5,
      salarySatisfaction: 3,
      date: "2024-11-15",
      title: "Good experience overall",
      pros: "Professional interview process, transparent communication.",
      cons: "Salary could be more competitive compared to industry standards.",
      helpful: 8,
      verified: false,
    },
    {
      id: 3,
      authorName: "Anonymous Employee",
      authorType: "Current Employee",
      position: "UX Designer",
      rating: 5.0,
      workCulture: 5,
      interviewExperience: 5,
      salarySatisfaction: 5,
      date: "2024-11-10",
      title: "Best company I've worked for!",
      pros: "Amazing team, cutting-edge projects, excellent benefits and perks.",
      cons: "Sometimes challenging deadlines during product launches.",
      helpful: 20,
      verified: true,
    },
  ]);

  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");

  const calculateAverageRating = (type) => {
    const sum = reviews.reduce((acc, review) => acc + review[type], 0);
    return (sum / reviews.length).toFixed(1);
  };

  const filteredReviews = reviews.filter((review) => {
    if (filter === "employees") return review.authorType.includes("Employee");
    if (filter === "candidates") return review.authorType === "Candidate";
    return true;
  });

  const sortedReviews = [...filteredReviews].sort((a, b) => {
    if (sortBy === "recent") return new Date(b.date) - new Date(a.date);
    if (sortBy === "rating") return b.rating - a.rating;
    if (sortBy === "helpful") return b.helpful - a.helpful;
    return 0;
  });

  const handleMarkHelpful = (id) => {
    setReviews(
      reviews.map((r) => (r.id === id ? { ...r, helpful: r.helpful + 1 } : r))
    );
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
        <Star className="w-8 h-8 text-blue-600" />
        Company Ratings & Reviews
      </h1>

      {/* Overall Rating Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-5xl font-bold text-yellow-500 mb-2">
              {calculateAverageRating("rating")}
            </div>
            <div className="flex justify-center mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-5 h-5 ${
                    star <= calculateAverageRating("rating")
                      ? "text-yellow-500 fill-yellow-500"
                      : "text-gray-300 dark:text-gray-600"
                  }`}
                />
              ))}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Overall Rating</div>
            <div className="text-xs text-gray-500 dark:text-gray-500">{reviews.length} reviews</div>
          </div>

          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">
              {calculateAverageRating("workCulture")}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Work Culture</div>
          </div>

          <div className="text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">
              {calculateAverageRating("interviewExperience")}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Interview Experience</div>
          </div>

          <div className="text-center">
            <div className="text-4xl font-bold text-purple-600 mb-2">
              {calculateAverageRating("salarySatisfaction")}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Salary Satisfaction</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="all">All Reviews</option>
            <option value="employees">Employees Only</option>
            <option value="candidates">Candidates Only</option>
          </select>
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        >
          <option value="recent">Most Recent</option>
          <option value="rating">Highest Rating</option>
          <option value="helpful">Most Helpful</option>
        </select>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {sortedReviews.map((review) => (
          <div
            key={review.id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-bold text-gray-900 dark:text-gray-100">{review.title}</h3>
                  {review.verified && (
                    <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs px-2 py-1 rounded-full">
                      ✓ Verified
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <span>{review.authorName}</span>
                  <span>•</span>
                  <span>{review.authorType}</span>
                  <span>•</span>
                  <span>{review.position}</span>
                  <span>•</span>
                  <span>{new Date(review.date).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${
                      star <= review.rating
                        ? "text-yellow-500 fill-yellow-500"
                        : "text-gray-300 dark:text-gray-600"
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
              <div>
                <div className="text-gray-600 dark:text-gray-400">Work Culture</div>
                <div className="font-semibold text-gray-900 dark:text-gray-100">
                  {review.workCulture}/5
                </div>
              </div>
              <div>
                <div className="text-gray-600 dark:text-gray-400">Interview</div>
                <div className="font-semibold text-gray-900 dark:text-gray-100">
                  {review.interviewExperience}/5
                </div>
              </div>
              <div>
                <div className="text-gray-600 dark:text-gray-400">Salary</div>
                <div className="font-semibold text-gray-900 dark:text-gray-100">
                  {review.salarySatisfaction}/5
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div>
                <div className="font-semibold text-green-600 dark:text-green-400 mb-1">Pros:</div>
                <p className="text-gray-700 dark:text-gray-300">{review.pros}</p>
              </div>
              <div>
                <div className="font-semibold text-red-600 dark:text-red-400 mb-1">Cons:</div>
                <p className="text-gray-700 dark:text-gray-300">{review.cons}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => handleMarkHelpful(review.id)}
                className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition"
              >
                <ThumbsUp className="w-4 h-4" />
                Helpful ({review.helpful})
              </button>
              <button className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition">
                <Flag className="w-4 h-4" />
                Report
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
