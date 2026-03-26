import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const PROFILE_API_BASE_URL = "http://localhost:5000/api/profiles";

function S_Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.email || !form.password) {
      setError("Both fields are required");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/api/students/login", form);
      alert("Login Successful");

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("studentAccount", JSON.stringify(res.data.student));

      if (res.data.profile) {
        localStorage.setItem("student", JSON.stringify(res.data.profile));
      } else {
        try {
          const profileRes = await axios.get(
            `${PROFILE_API_BASE_URL}/email/${encodeURIComponent(res.data.student.email)}`
          );
          localStorage.setItem("student", JSON.stringify(profileRes.data));
        } catch (profileErr) {
          if (profileErr.response?.status === 404) {
            localStorage.setItem("student", JSON.stringify(res.data.student));
          } else {
            throw profileErr;
          }
        }
      }

      navigate("/student/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center px-4 py-10">

      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">

          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-8 text-center">
            <h2 className="text-3xl font-bold text-white">Welcome Back</h2>
            <p className="text-indigo-100 mt-2">
              Login to your student account
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-5">

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-center">
                {error}
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
            </div>

            {/* Button */}
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-300"
            >
              Login
            </button>
          </form>

          {/* Footer */}
          <div className="text-center pb-6">
            <p className="text-gray-600">
              Don't have an account?{" "}
              <span
                onClick={() => navigate("/register/student")}
                className="text-indigo-600 hover:text-indigo-700 font-semibold cursor-pointer"
              >
                Register here
              </span>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

export default S_Login;