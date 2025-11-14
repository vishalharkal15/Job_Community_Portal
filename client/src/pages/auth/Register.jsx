import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
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
    cvUrl: "",
    certificatesUrl: "",
    acceptTerms: false,
  });

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const navigate = useNavigate();

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
    if (!formData.cvUrl.trim()) newErrors.cvUrl = "CV URL is required";
    if (!formData.certificatesUrl.trim())
      newErrors.certificatesUrl = "Certification URL is required";
    if (!formData.acceptTerms)
      newErrors.acceptTerms = "You must accept the terms";
    return newErrors;
  };

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
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const user = userCredential.user;

      await sendEmailVerification(user);

      const token = await user.getIdToken();

      const payload = {};
      Object.keys(formData).forEach((key) => {
        if (key !== "password" && key !== "acceptTerms") {
          payload[key] = formData[key];
        }
      });

      await axios.post("http://localhost:5000/register", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSuccessMessage("Welcome ${formData.name}");
      setFormData({
        name: "",
        email: "",
        password: "",
        mobile: "",
        address: "",
        role: "",
        position: "",
        experience: "",
        cvUrl: "",
        certificatesUrl: "",
        acceptTerms: false,
      });
      setErrors({});
    } catch (error) {
      setErrors({
        submit: error.response?.data?.error || error.message || "Registration failed.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const token = await user.getIdToken();

      const payload = {
        name: user.displayName,
        email: user.email,
        role: "job-seeker",
      };

      await axios.post("http://localhost:5000/register", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setSuccessMessage("Google sign-in successful!");
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        navigate("/");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CV URL <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              name="cvUrl"
              value={formData.cvUrl}
              onChange={handleChange}
              placeholder="https://drive.google.com/..."
              className="w-full px-3 py-2 border rounded-md"
            />
            {errors.cvUrl && <p className="text-sm text-red-500">{errors.cvUrl}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Certification URL <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              name="certificatesUrl"
              value={formData.certificatesUrl}
              onChange={handleChange}
              placeholder="https://drive.google.com/..."
              className="w-full px-3 py-2 border rounded-md"
            />
            {errors.certificatesUrl && (
              <p className="text-sm text-red-500">{errors.certificatesUrl}</p>
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

        <button
          onClick={handleGoogleSignIn}
          className="w-full mt-4 border border-gray-300 py-2 rounded-md hover:bg-gray-100 flex justify-center items-center gap-2"
        >
          <img src="https://t4.ftcdn.net/jpg/03/08/54/37/360_F_308543787_DmPo1IELtKY9hG8E8GlW8KHEsRC7JiDN.jpg" alt="Google" className="w-5 h-5" />
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
