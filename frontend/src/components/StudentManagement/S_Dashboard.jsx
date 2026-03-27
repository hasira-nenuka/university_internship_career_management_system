import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FaUser,
  FaFileUpload,
  FaBriefcase,
  FaSearch,
  FaClipboardList,
  FaChartLine,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { resolveUploadUrl } from "./uploadUrl";

const PROFILE_API_BASE_URL = "http://localhost:5000/api/profiles";

const dashboardCards = [
  {
    icon: <FaUser />,
    title: "My Profile",
    desc: "View and update your personal details, skills, and education.",
    actionKey: "profile",
    btn: "View Profile",
  },
  {
    icon: <FaFileUpload />,
    title: "View Companies",
    desc: "Explore companies and opportunities available for you.",
    actionKey: "companies",
    btn: "View Companies",
  },
  {
    icon: <FaSearch />,
    title: "Search Jobs",
    desc: "Find internships by field, location, and job type.",
    actionKey: "jobs",
    btn: "Search Jobs",
  },
  {
    icon: <FaBriefcase />,
    title: "Apply Jobs",
    desc: "Apply for jobs easily and track your applications.",
    actionKey: "apply",
    btn: "Apply Now",
  },
  {
    icon: <FaClipboardList />,
    title: "Application Status",
    desc: "Check your applications: Pending, Shortlisted, Rejected.",
    actionKey: "applications",
    btn: "View Status",
  },
  {
    icon: <FaChartLine />,
    title: "Recommendations",
    desc: "Open your CV analysis page and view the jobs matched to your profile.",
    actionKey: "jobs",
    btn: "View CV Analysis",
  },
];

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

  const cardActions = {
    profile: openStudentProfile,
    companies: openCompanyProfileView,
    jobs: () => navigate("/student/jobs"),
    apply: () => navigate("/student/jobs"),
    applications: () => navigate("/student/applications"),
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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.18),_transparent_35%),linear-gradient(135deg,_#eef2ff_0%,_#f8fafc_45%,_#fdf2f8_100%)] font-sans">
      <div className="border-b border-white/60 bg-white/70 px-6 py-4 shadow-sm backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="bg-gradient-to-r from-slate-900 via-indigo-700 to-fuchsia-600 bg-clip-text text-3xl font-black text-transparent">
              Student Dashboard
            </h1>
            <p className="text-sm text-slate-500">
              Clear career progress, profile access, and recommendation insights in one place.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div
              onClick={openStudentProfile}
              className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-200/70 bg-white/85 px-3 py-2 shadow-sm transition hover:-translate-y-0.5 hover:bg-white"
            >
              {student.profileImage ? (
                <img
                  src={resolveUploadUrl(student.profileImage)}
                  alt="profile"
                  className="h-11 w-11 rounded-2xl border-2 border-indigo-500 object-cover"
                />
              ) : (
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
                  <FaUser />
                </div>
              )}

              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                  Student
                </p>
                <span className="font-semibold text-slate-700">
                  {student.firstName} {student.lastName}
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-rose-300/40 transition hover:scale-105"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-12 pt-8">
        <div className="mb-8 flex justify-end">
          <button
            onClick={openProfileForm}
            className="rounded-2xl bg-gradient-to-r from-indigo-600 via-blue-600 to-fuchsia-600 px-6 py-3 text-sm font-semibold text-white shadow-xl shadow-indigo-300/40 transition hover:scale-105"
          >
            + Create Profile
          </button>
        </div>

        <div className="grid gap-5 pb-10 md:grid-cols-2 xl:grid-cols-3">
          {dashboardCards.map((card, index) => (
            <div
              key={index}
              className="rounded-[26px] border border-white/70 bg-white/75 p-5 shadow-[0_16px_40px_rgba(148,163,184,0.14)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(79,70,229,0.12)]"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-100 via-white to-fuchsia-100 text-xl text-indigo-600">
                {card.icon}
              </div>

              <h2 className="mb-2 text-lg font-bold text-slate-900">
                {card.title}
              </h2>

              <p className="mb-5 text-sm leading-6 text-slate-500">
                {card.desc}
              </p>

              <button
                onClick={cardActions[card.actionKey]}
                className="w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 py-3 text-sm font-medium text-white transition hover:scale-[1.03]"
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
