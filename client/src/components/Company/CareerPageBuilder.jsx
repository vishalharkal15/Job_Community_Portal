import { useState } from "react";
import { Image, Save, Eye, Edit3, Award } from "lucide-react";

export default function CareerPageBuilder({ companyProfile }) {
  const [careerPage, setCareerPage] = useState({
    bannerImage: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200",
    companyStory: "We are a leading technology company focused on innovation and excellence...",
    cultureHighlights: [
      "Collaborative work environment",
      "Innovation-driven culture",
      "Work-life balance",
      "Continuous learning opportunities",
    ],
    perks: [
      "Health Insurance",
      "Flexible Work Hours",
      "Remote Work Options",
      "Professional Development Budget",
      "Gym Membership",
      "Free Meals",
    ],
    reviews: [
      { author: "Anonymous Employee", rating: 4.5, text: "Great place to work with amazing culture!" },
      { author: "Ex-Employee", rating: 4.0, text: "Good benefits and supportive management." },
    ],
  });

  const [isEditMode, setIsEditMode] = useState(false);

  const handleSave = () => {
    setIsEditMode(false);
    alert("Career page updated successfully!");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Career Page Builder</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setIsEditMode(!isEditMode)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
          >
            {isEditMode ? <Eye className="w-5 h-5" /> : <Edit3 className="w-5 h-5" />}
            {isEditMode ? "Preview" : "Edit"}
          </button>
          {isEditMode && (
            <button
              onClick={handleSave}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
            >
              <Save className="w-5 h-5" />
              Save
            </button>
          )}
        </div>
      </div>

      {/* Banner Image */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
        {isEditMode ? (
          <div className="p-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Banner Image URL
            </label>
            <input
              type="text"
              value={careerPage.bannerImage}
              onChange={(e) => setCareerPage({ ...careerPage, bannerImage: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
        ) : (
          <img src={careerPage.bannerImage} alt="Company Banner" className="w-full h-64 object-cover" />
        )}
      </div>

      {/* Company Story */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Company Story</h2>
        {isEditMode ? (
          <textarea
            value={careerPage.companyStory}
            onChange={(e) => setCareerPage({ ...careerPage, companyStory: e.target.value })}
            rows="6"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        ) : (
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{careerPage.companyStory}</p>
        )}
      </div>

      {/* Culture Highlights */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Culture Highlights</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {careerPage.cultureHighlights.map((highlight, index) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Award className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
              {isEditMode ? (
                <input
                  type="text"
                  value={highlight}
                  onChange={(e) => {
                    const updated = [...careerPage.cultureHighlights];
                    updated[index] = e.target.value;
                    setCareerPage({ ...careerPage, cultureHighlights: updated });
                  }}
                  className="flex-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              ) : (
                <span className="text-gray-700 dark:text-gray-300">{highlight}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Perks & Benefits */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Perks & Benefits</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {careerPage.perks.map((perk, index) => (
            <div
              key={index}
              className="bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 px-4 py-2 rounded-lg text-center font-medium"
            >
              {perk}
            </div>
          ))}
        </div>
      </div>

      {/* Reviews */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Employee Reviews</h2>
        <div className="space-y-4">
          {careerPage.reviews.map((review, index) => (
            <div key={index} className="border-l-4 border-yellow-500 pl-4 py-2">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={i < review.rating ? "text-yellow-500" : "text-gray-300"}>
                      ★
                    </span>
                  ))}
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">by {review.author}</span>
              </div>
              <p className="text-gray-700 dark:text-gray-300">{review.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
