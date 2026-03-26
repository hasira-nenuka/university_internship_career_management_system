import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { resolveUploadUrl } from "./uploadUrl";

const API_BASE_URL = "http://localhost:5000/api/profiles";

function S_ProfileView() {
  const [student, setStudent] = useState({});
  const { id } = useParams();
  const navigate = useNavigate();

  const formatList = (items) => {
    if (!Array.isArray(items) || items.length === 0) {
      return "Not provided";
    }
    return items.join(", ");
  };

  useEffect(() => {
    const storedProfile = JSON.parse(localStorage.getItem("student"));
    const account = JSON.parse(localStorage.getItem("studentAccount")) || storedProfile;
    if (storedProfile) setStudent(storedProfile);

    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/${id}`);
        setStudent(res.data);
        localStorage.setItem("student", JSON.stringify(res.data));
      } catch (err) {
        try {
          if (account?.email) {
            const profileRes = await axios.get(
              `${API_BASE_URL}/email/${encodeURIComponent(account.email)}`
            );
            setStudent(profileRes.data);
            localStorage.setItem("student", JSON.stringify(profileRes.data));
            return;
          }
        } catch (emailErr) {
          console.error("Failed to fetch profile by email", emailErr);
        }

        console.error("Failed to fetch profile", err);
        const data = JSON.parse(localStorage.getItem("student"));
        if (data) setStudent(data);
      }
    };

    if (id) fetchProfile();
    else {
      const data = JSON.parse(localStorage.getItem("student"));
      if (data) setStudent(data);
    }
  }, [id]);

  const handleDelete = async () => {
    try {
      await axios.delete(`${API_BASE_URL}/${student._id}`);

      const account = JSON.parse(localStorage.getItem("studentAccount"));
      if (account) {
        localStorage.setItem("student", JSON.stringify(account));
      } else {
        localStorage.removeItem("student");
      }

      alert("Profile deleted");
      navigate("/student/dashboard");
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    }
  };

  const sectionCard = "rounded-[1.75rem] border border-white/70 bg-white/85 p-6 shadow-[0_22px_60px_rgba(99,102,241,0.14)] backdrop-blur dark:border-slate-700/80 dark:bg-slate-900/75 dark:shadow-[0_22px_60px_rgba(15,23,42,0.5)]";

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.16),_transparent_22%),radial-gradient(circle_at_bottom_right,_rgba(168,85,247,0.16),_transparent_26%),linear-gradient(180deg,_#eef2ff_0%,_#faf5ff_100%)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.14),_transparent_22%),radial-gradient(circle_at_bottom_right,_rgba(129,140,248,0.12),_transparent_26%),linear-gradient(180deg,_#020617_0%,_#0f172a_55%,_#111827_100%)]">

      {/* HEADER */}
      <div className="bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 h-52 flex items-center justify-center shadow-lg dark:from-slate-950 dark:via-indigo-950 dark:to-cyan-950">
        <h1 className="text-white text-4xl font-bold tracking-wide">
          My Profile
        </h1>
      </div>

      {/* PROFILE CARD */}
      <div className="max-w-5xl mx-auto px-4 -mt-20">

        <div className="rounded-[2rem] border border-white/70 bg-white/85 p-8 text-center shadow-[0_24px_70px_rgba(99,102,241,0.16)] backdrop-blur dark:border-slate-700/80 dark:bg-slate-900/78 dark:shadow-[0_24px_70px_rgba(15,23,42,0.5)]">

          {/* Profile Image */}
          <div className="flex justify-center">
            <img
              src={
                student.profileImage
                  ? resolveUploadUrl(student.profileImage)
                  : "/placeholder-profile.png"
              }
              className="w-32 h-32 rounded-full border-4 border-indigo-500 shadow-lg object-cover dark:border-cyan-400"
              alt="profile"
            />
          </div>

          {/* Name */}
          <h2 className="mt-4 text-3xl font-bold text-slate-900 dark:text-white">
            {student.firstName} {student.lastName}
          </h2>
          <p className="text-gray-500 dark:text-slate-400">{student.email}</p>

          {/* CV BUTTON */}
          {student.cv && (
            <a
              href={resolveUploadUrl(student.cv)}
              target="_blank"
              rel="noreferrer"
              className="inline-block mt-4 rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 px-6 py-2 text-white font-semibold shadow transition hover:scale-105 dark:from-indigo-500 dark:via-violet-500 dark:to-cyan-400"
            >
              View CV
            </a>
          )}

        </div>

        {/* DETAILS */}
        <div className="mt-6 grid gap-6 md:grid-cols-2">

          {/* BASIC */}
          <div className={sectionCard}>
            <h3 className="mb-3 text-lg font-bold text-indigo-600 dark:text-cyan-300">Basic Info</h3>
            <div className="space-y-2 text-slate-700 dark:text-slate-200">
              <p><b>Province:</b> {student.province || "Not provided"}</p>
              <p><b>District:</b> {student.district || "Not provided"}</p>
              <p><b>Contact:</b> {student.contactNumber || "Not provided"}</p>
            </div>
          </div>

          {/* SCHOOL */}
          <div className={sectionCard}>
            <h3 className="mb-3 text-lg font-bold text-violet-600 dark:text-violet-300">School</h3>
            <div className="space-y-2 text-slate-700 dark:text-slate-200">
              <p><b>School:</b> {student.school || "Not provided"}</p>
              <p><b>A/L Stream:</b> {student.localStream || "Not provided"}</p>
            </div>
          </div>

          {/* UNIVERSITY */}
          <div className={sectionCard}>
            <h3 className="mb-3 text-lg font-bold text-indigo-600 dark:text-cyan-300">University</h3>
            <div className="space-y-2 text-slate-700 dark:text-slate-200">
              <p><b>Level:</b> {student.eduLevel || "Not provided"}</p>
              <p><b>University:</b> {student.university || "Not provided"}</p>
              <p><b>Degree:</b> {student.degree || "Not provided"}</p>
            </div>
          </div>

          {/* SKILLS */}
          <div className={sectionCard}>
            <h3 className="mb-3 text-lg font-bold text-violet-600 dark:text-violet-300">Skills</h3>
            <div className="space-y-2 text-slate-700 dark:text-slate-200">
              <p><b>Frontend:</b> {formatList(student.frontendSkills)}</p>
              <p><b>Backend:</b> {formatList(student.backendSkills)}</p>
              <p><b>Database:</b> {formatList(student.databaseSkills)}</p>
              <p><b>Preferred:</b> {student.preferredField || "Not provided"}</p>
            </div>
          </div>

          {/* EXTRA */}
          <div className={`${sectionCard} md:col-span-2`}>
            <h3 className="mb-3 text-lg font-bold text-indigo-600 dark:text-cyan-300">Extra Details</h3>
            <div className="space-y-2 text-slate-700 dark:text-slate-200">
              <p><b>Leadership:</b> {student.leadership || "Not provided"}</p>
              <p><b>Awards:</b> {student.awards || "Not provided"}</p>
              <p><b>Bio:</b> {student.bio || "Not provided"}</p>
            </div>
          </div>

        </div>

        {/* BUTTONS */}
        <div className="mb-10 mt-8 flex flex-wrap justify-center gap-4">
          <button
            onClick={() => navigate("/student/profile")}
            className="rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 px-6 py-2 text-white shadow transition hover:scale-105 dark:from-indigo-500 dark:via-violet-500 dark:to-cyan-400"
          >
            Update Profile
          </button>

          <button
            onClick={handleDelete}
            className="rounded-xl bg-rose-500 px-6 py-2 text-white shadow transition hover:scale-105 dark:bg-rose-600"
          >
            Delete Profile
          </button>
        </div>

      </div>
    </div>
  );
}

export default S_ProfileView;
