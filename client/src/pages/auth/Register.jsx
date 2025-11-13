import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "../../firebase/firebaseConfig.js";

function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    mobile: "",
    address: "",
    role: "",
    position: "",
    experience: "",
    cvFile: null,
    certificationFile: null,
    acceptTerms: false,
  });

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ handle input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // ✅ handle file uploads
  const handleFileChange = (e) => {
    const { name, files } = e.target;
    const file = files[0];
    if (!file) return;

    if (name === "certificationFile" && file.type !== "application/pdf") {
      setErrors((prev) => ({
        ...prev,
        [name]: "Only PDF files allowed for certification",
      }));
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        [name]: "File size must be less than 5MB",
      }));
      e.target.value = "";
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: file }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // ✅ form validation
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Invalid email";
    if (!formData.password.trim()) newErrors.password = "Password is required";
    else if (formData.password.length < 6)
      newErrors.password = "At least 6 characters";
    if (!formData.mobile.trim()) newErrors.mobile = "Mobile number is required";
    else if (!/^\d{10}$/.test(formData.mobile))
      newErrors.mobile = "Must be a 10-digit number";
    if (!formData.address.trim()) newErrors.address = "Address required";
    if (!formData.role) newErrors.role = "Select a role";
    if (!formData.position.trim()) newErrors.position = "Position required";
    if (!formData.experience.trim()) newErrors.experience = "Experience required";
    if (!formData.cvFile) newErrors.cvFile = "Upload your CV";
    if (!formData.certificationFile)
      newErrors.certificationFile = "Upload your certification";
    if (!formData.acceptTerms)
      newErrors.acceptTerms = "You must accept the terms";
    return newErrors;
  };

  // ✅ Email/Password Registration
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage("");
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      // 1️⃣ Create Firebase user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const user = userCredential.user;

      // 2️⃣ Send email verification
      await sendEmailVerification(user);

      // 3️⃣ Get Firebase ID token
      const token = await user.getIdToken();

      // 4️⃣ Send form data to backend
      await axios.post("http://localhost:5000/register", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSuccessMessage("Verification email sent! Please check your inbox.");
      setFormData({
        name: "",
        email: "",
        password: "",
        mobile: "",
        address: "",
        role: "",
        position: "",
        experience: "",
        cvFile: null,
        certificationFile: null,
        acceptTerms: false,
      });
      document.querySelectorAll('input[type="file"]').forEach((i) => (i.value = ""));
      setErrors({});
    } catch (error) {
      setErrors({
        submit: error.response?.data?.error || error.message || "Registration failed.",
      });
    } finally {
      setLoading(false);
    }
  };

  // ✅ Google Sign-in
  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const token = await user.getIdToken();

      await axios.post(
        "http://localhost:5000/register",
        { name: user.displayName, email: user.email, role: "job-seeker" },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccessMessage("Google sign-in successful!");
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center mb-6">Register</h2>

        {successMessage && (
          <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-md">
            {successMessage}
          </div>
        )}
        {errors.submit && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
            {errors.submit}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 👇 all inputs included */}
          {[
            { id: "name", label: "Full Name", type: "text" },
            { id: "email", label: "Email", type: "email" },
            { id: "password", label: "Password", type: "password" },
            { id: "mobile", label: "Mobile", type: "tel" },
            { id: "address", label: "Address", type: "textarea" },
          ].map((field) => (
            <div key={field.id}>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                {field.label} <span className="text-red-500">*</span>
              </label>
              {field.type === "textarea" ? (
                <textarea
                  id={field.id}
                  name={field.id}
                  value={formData[field.id]}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <input
                  type={field.type}
                  id={field.id}
                  name={field.id}
                  value={formData[field.id]}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                />
              )}
              {errors[field.id] && (
                <p className="text-sm text-red-500 mt-1">{errors[field.id]}</p>
              )}
            </div>
          ))}

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Role <span className="text-red-500">*</span>
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a role</option>
              <option value="job-seeker">Job Seeker</option>
              <option value="recruiter">Recruiter</option>
              <option value="company">Company</option>
            </select>
            {errors.role && <p className="text-sm text-red-500">{errors.role}</p>}
          </div>

          {["position", "experience"].map((field) => (
            <div key={field}>
              <label className="block mb-1 text-sm font-medium text-gray-700 capitalize">
                {field} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id={field}
                name={field}
                value={formData[field]}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
              {errors[field] && (
                <p className="text-sm text-red-500 mt-1">{errors[field]}</p>
              )}
            </div>
          ))}

          {/* File uploads */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Upload CV <span className="text-red-500">*</span>
            </label>
            <input
              type="file"
              name="cvFile"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx"
              className="w-full"
            />
            {errors.cvFile && (
              <p className="text-sm text-red-500">{errors.cvFile}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Upload Certification <span className="text-red-500">*</span>
            </label>
            <input
              type="file"
              name="certificationFile"
              onChange={handleFileChange}
              accept=".pdf"
              className="w-full"
            />
            {errors.certificationFile && (
              <p className="text-sm text-red-500">{errors.certificationFile}</p>
            )}
          </div>

          <div className="flex items-start">
            <input
              type="checkbox"
              id="acceptTerms"
              name="acceptTerms"
              checked={formData.acceptTerms}
              onChange={handleChange}
              className="mt-1 h-4 w-4 text-blue-600"
            />
            <label htmlFor="acceptTerms" className="ml-2 text-sm text-gray-700">
              I accept the Terms and Conditions
            </label>
          </div>
          {errors.acceptTerms && (
            <p className="text-sm text-red-500">{errors.acceptTerms}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        {/* ✅ Google Sign-In Button */}
        <button
          onClick={handleGoogleSignIn}
          className="w-full mt-4 border border-gray-300 py-2 rounded-md hover:bg-gray-100 flex justify-center items-center gap-2"
        >
          <img src="/google-icon.png" alt="Google" className="w-5 h-5" />
          Continue with Google
        </button>

        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link to="/auth/login" className="text-blue-600 hover:text-blue-700">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
