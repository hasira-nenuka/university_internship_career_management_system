import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FaUser,
  FaFileUpload,
  FaBriefcase,
  FaSearch,
  FaClipboardList,
  FaChartLine
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { resolveUploadUrl } from "./uploadUrl";

const PROFILE_API_BASE_URL = "http://localhost:5000/api/profiles";

function S_Dashboard() {
  const [student, setStudent] = useState({});
  const navigate = useNavigate();
  const hasSavedProfile = Boolean(
    student?._id && !student.password && !student.address
  );

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("student");
    localStorage.removeItem("studentAccount");
    navigate("/login/student");
  };

  const loadProfileByEmail = async () => {
    const account =
      JSON.parse(localStorage.getItem("studentAccount")) || student;
    if (!account?.email) return null;

    const res = await axios.get(
      `${PROFILE_API_BASE_URL}/email/${encodeURIComponent(account.email)}`
    );
    localStorage.setItem("student", JSON.stringify(res.data));
    setStudent(res.data);
    return res.data;
  };

  const openStudentProfile = async () => {
    if (hasSavedProfile) {
      navigate(`/student/profile/view/${student._id}`);
      return;
    }

    try {
      const profile = await loadProfileByEmail();
      if (profile?._id) {
        navigate(`/student/profile/view/${profile._id}`);
        return;
      }
    } catch (err) {
      console.error("Failed to load profile before navigation", err);
    }

    navigate("/student/profile");
  };

  const openProfileForm = () => navigate("/student/profile");

  const openCompanyProfileView = async () => {
    navigate("/student/profile/company-view");
  };

  useEffect(() => {
    const loadDashboardStudent = async () => {
      const data = JSON.parse(localStorage.getItem("student"));
      const account =
        JSON.parse(localStorage.getItem("studentAccount")) || data;

      if (data && !data.password && !data.address) {
        setStudent(data);
        return;
      }

      if (!account?.email) {
        if (data) setStudent(data);
        return;
      }

      try {
        const res = await axios.get(
          `${PROFILE_API_BASE_URL}/email/${encodeURIComponent(account.email)}`
        );
        setStudent(res.data);
        localStorage.setItem("student", JSON.stringify(res.data));
      } catch (err) {
        setStudent(account);
      }
    };

    loadDashboardStudent();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-purple-100 font-sans">

      {/* ================= HEADER ================= */}
      <div className="bg-white/70 backdrop-blur-lg shadow-md px-6 py-4 flex justify-between items-center border-b">
        
        {/* Left */}
        <div>
          <h1 className="text-2xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Student Dashboard
          </h1>
          <p className="text-sm text-gray-500">
            Manage your career journey 🚀
          </p>
        </div>

        {/* Right */}
        <div className="flex items-center gap-4">
          <div
            onClick={openStudentProfile}
            className="flex items-center gap-3 cursor-pointer hover:bg-gray-100 px-3 py-2 rounded-xl transition"
          >
            {student.profileImage ? (
              <img
                src={resolveUploadUrl(student.profileImage)}
                alt="profile"
                className="w-10 h-10 rounded-full object-cover border-2 border-indigo-500"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                <FaUser />
              </div>
            )}

            <span className="font-semibold text-gray-700">
              {student.firstName} {student.lastName}
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold shadow hover:scale-105 transition"
          >
            Logout
          </button>
        </div>
      </div>

      {/* ================= CONTENT ================= */}
      <div className="max-w-7xl mx-auto px-4 pt-8">

        {/* Create Profile Button */}
        <div className="flex justify-end mb-8">
          <button
            onClick={openProfileForm}
            className="px-6 py-2.5 rounded-xl text-white font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg hover:scale-105 transition"
          >
            + Create Profile
          </button>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-6 pb-10">

          {/* Card Component */}
          {[
            {
              icon: <FaUser />,
              title: "My Profile",
              desc: "View and update your personal details, skills, and education.",
              action: openStudentProfile,
              btn: "View Profile"
            },
            {
              icon: <FaFileUpload />,
              title: "View Companies",
              desc: "Explore companies and opportunities available for you.",
              action: openCompanyProfileView,
              btn: "View Companies"
            },
            {
              icon: <FaSearch />,
              title: "Search Jobs",
              desc: "Find internships by field, location, and job type.",
              action: () => navigate("/student/jobs"),
              btn: "Search Jobs"
            },
            {
              icon: <FaBriefcase />,
              title: "Apply Jobs",
              desc: "Apply for jobs easily and track your applications.",
              action: () => navigate("/student/jobs"),
              btn: "Apply Now"
            },
            {
              icon: <FaClipboardList />,
              title: "Application Status",
              desc: "Check your applications: Pending, Shortlisted, Rejected.",
              action: () => navigate("/student/applications"),
              btn: "View Status"
            },
            {
              icon: <FaChartLine />,
              title: "Recommendations",
              desc: "Get job recommendations based on your profile.",
              action: () => navigate("/student/jobs"),
              btn: "View Jobs"
            }
          ].map((card, index) => (
            <div
              key={index}
              className="bg-white/80 backdrop-blur-lg p-6 rounded-3xl shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border border-gray-200"
            >
              <div className="text-3xl text-indigo-600 mb-3">
                {card.icon}
              </div>

              <h2 className="text-xl font-bold mb-2 text-gray-800">
                {card.title}
              </h2>

              <p className="text-gray-500 mb-4 text-sm">
                {card.desc}
              </p>

              <button
                onClick={card.action}
                className="w-full py-2 rounded-xl text-white font-medium bg-gradient-to-r from-indigo-600 to-purple-600 hover:scale-[1.03] transition"
              >
                {card.btn}
              </button>
            </div>
          ))}

        </div>
      </div>
    </div>
  );
}

export default S_Dashboard;
