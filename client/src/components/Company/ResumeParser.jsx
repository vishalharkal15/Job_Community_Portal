import { useState } from "react";
import { Upload, FileText, Star, TrendingUp } from "lucide-react";

export default function ResumeParser({ companyProfile }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [matchScore, setMatchScore] = useState(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      // Simulate parsing
      setTimeout(() => {
        setParsedData({
          name: "John Doe",
          email: "john@example.com",
          phone: "+1 234 567 8900",
          skills: ["React", "Node.js", "MongoDB", "Express", "JavaScript", "TypeScript"],
          experience: "5 years",
          education: "B.Tech in Computer Science",
          summary: "Experienced full-stack developer with expertise in MERN stack...",
        });
      }, 1500);
    }
  };

  const analyzeMatch = () => {
    if (parsedData && jobDescription) {
      // Simulate AI matching
      const score = Math.floor(Math.random() * 30) + 70; // Random score between 70-100
      setMatchScore({
        overall: score,
        skillMatch: score + 5,
        experienceMatch: score - 3,
        suggestions: [
          "Strong technical skills match",
          "Relevant experience in required technologies",
          "Consider interviewing for senior position",
        ],
      });
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
        <FileText className="w-8 h-8 text-blue-600" />
        Resume Parser + AI Match
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Upload Resume</h2>
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Upload PDF, DOC, or DOCX file
            </p>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileUpload}
              className="hidden"
              id="resume-upload"
            />
            <label
              htmlFor="resume-upload"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg cursor-pointer inline-block transition"
            >
              Choose File
            </label>
            {selectedFile && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
                Selected: {selectedFile.name}
              </p>
            )}
          </div>

          {parsedData && (
            <div className="mt-6 space-y-3">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Parsed Information:</h3>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg space-y-2 text-sm">
                <p><strong>Name:</strong> {parsedData.name}</p>
                <p><strong>Email:</strong> {parsedData.email}</p>
                <p><strong>Phone:</strong> {parsedData.phone}</p>
                <p><strong>Experience:</strong> {parsedData.experience}</p>
                <p><strong>Education:</strong> {parsedData.education}</p>
                <div>
                  <strong>Skills:</strong>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {parsedData.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded text-xs"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Job Description Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Job Description</h2>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste job description here to analyze match..."
            rows="12"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
          <button
            onClick={analyzeMatch}
            disabled={!parsedData || !jobDescription}
            className="w-full mt-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold transition"
          >
            Analyze Match
          </button>
        </div>
      </div>

      {/* Match Results */}
      {matchScore && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-green-600" />
            AI Match Analysis
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="text-center">
              <div className="text-5xl font-bold text-green-600 mb-2">{matchScore.overall}%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Overall Match</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-blue-600 mb-2">{matchScore.skillMatch}%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Skills Match</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-purple-600 mb-2">{matchScore.experienceMatch}%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Experience Match</div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">AI Suggestions:</h3>
            <ul className="space-y-2">
              {matchScore.suggestions.map((suggestion, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2 text-gray-700 dark:text-gray-300"
                >
                  <Star className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" fill="currentColor" />
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6 flex gap-3">
            <button className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition">
              Shortlist Candidate
            </button>
            <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition">
              Schedule Interview
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
