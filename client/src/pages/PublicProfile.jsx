import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { formatBlogTime } from "../utils/date";
import { useAuth } from "../context/AuthContext";

export default function PublicProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [profile, setProfile] = useState(null);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // 🔒 If viewing own profile, redirect to private profile
    if (currentUser && currentUser.uid === userId) {
        navigate("/profile", { replace: true });
        return;
    }
    async function loadProfile() {
        try {
        const res = await axios.get(
            `http://localhost:5000/users/${userId}/profile`
        );

        setProfile(res.data.profile);
        setCompany(res.data.company || null);
        } catch (err) {
        console.error(err);
        setError("Profile not found");
        } finally {
        setLoading(false);
        }
    }

    loadProfile();
    }, [userId, currentUser, navigate]);

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await axios.get(
          `http://localhost:5000/users/${userId}/profile`
        );

        setProfile(res.data.profile);
        setCompany(res.data.company || null);
      } catch (err) {
        console.error(err);
        setError("Profile not found");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-b-4 border-blue-600 rounded-full"></div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-24"></div>
          <div className="-mt-14 px-6 pb-6 flex items-center gap-4">
            <div className="w-28 h-28 rounded-full bg-white shadow-lg flex items-center justify-center">
              <span className="text-3xl font-bold text-blue-600">
                {profile.name?.charAt(0)}
              </span>
            </div>

            <div>
              <h1 className="text-2xl font-bold">{profile.name}</h1>
              {profile.position && (
                <p className="text-gray-600">{profile.position}</p>
              )}
            </div>
          </div>
        </div>

        {/* Company */}
        {company && (
          <div className="bg-white rounded-xl shadow p-6 mb-6">
            <p className="text-sm text-gray-500 mb-1">Company</p>
            <div className="flex items-center gap-4">
              {company.logoUrl && (
                <img
                  src={company.logoUrl}
                  className="w-14 h-14 rounded-lg"
                />
              )}
              <h3 className="text-xl font-semibold">{company.name}</h3>
            </div>
          </div>
        )}

        {/* Professional Info */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-bold mb-4">Professional Details</h2>

          {profile.experience && (
            <p className="mb-2">
              <strong>Experience:</strong>{" "}
              {typeof profile.experience === "object"
                ? `${profile.experience.value} ${profile.experience.unit}`
                : profile.experience}
            </p>
          )}

          {profile.gender && (
            <p>
              <strong>Gender:</strong> {profile.gender}
            </p>
          )}

          <p className="text-sm text-gray-500 mt-4">
            Member since{" "}
            {profile.createdAt
              ? formatBlogTime(profile.createdAt)
              : "Recently joined"}
          </p>
        </div>      
      </div>
    </div>
  );
}