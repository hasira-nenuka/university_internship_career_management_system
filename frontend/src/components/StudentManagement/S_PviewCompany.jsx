import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { resolveUploadUrl } from "./uploadUrl";

const ALL_PROFILES_URL = "http://localhost:5000/api/profiles/all";

function S_PviewCompany() {
  const [students, setStudents] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleDownloadCv = async (student) => {
    try {
      const cvUrl = resolveUploadUrl(student.cv);
      const response = await fetch(cvUrl);

      if (!response.ok) {
        throw new Error("Failed to download CV");
      }

      const blob = await response.blob();
      const objectUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      const extension = student.cv?.split(".").pop() || "pdf";

      link.href = objectUrl;
      link.download = `${student.firstName || "student"}_${student.lastName || "cv"}.${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(objectUrl);
    } catch (err) {
      alert(err.message || "CV download failed");
    }
  };

  const formatList = (items) => {
    if (!Array.isArray(items) || items.length === 0) {
      return "Not provided";
    }
    return items.join(", ");
  };

  useEffect(() => {
    const loadProfiles = async () => {
      try {
        const res = await axios.get(ALL_PROFILES_URL);
        setStudents(res.data);
        setError("");
      } catch (err) {
        console.error("Failed to fetch student profiles", err);
        setError(err.response?.data?.message || "Failed to load student profiles");
      }
    };

    loadProfiles();
  }, []);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.16),_transparent_24%),radial-gradient(circle_at_bottom_right,_rgba(168,85,247,0.16),_transparent_28%),linear-gradient(180deg,_#eef2ff_0%,_#faf5ff_100%)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.14),_transparent_22%),radial-gradient(circle_at_bottom_right,_rgba(129,140,248,0.14),_transparent_28%),linear-gradient(180deg,_#020617_0%,_#0f172a_56%,_#111827_100%)]">

      {/* HEADER */}
      <div className="bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 shadow-lg dark:from-slate-950 dark:via-indigo-950 dark:to-cyan-950">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <h1 className="text-white text-4xl font-bold">
            Student Profiles
          </h1>
          <p className="text-white/80 mt-2">
            Explore and review student details
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* BACK BUTTON */}
        <div className="mb-6 flex justify-end">
          <button
            onClick={() => navigate("/student/dashboard")}
            className="rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 px-6 py-2 text-white shadow transition hover:scale-105 dark:from-indigo-500 dark:via-violet-500 dark:to-cyan-400"
          >
            Back
          </button>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
            {error}
          </div>
        )}

        {/* EMPTY */}
        {!error && students.length === 0 && (
          <div className="rounded-2xl border border-white/70 bg-white/85 p-8 text-center text-gray-600 shadow dark:border-slate-700/80 dark:bg-slate-900/75 dark:text-slate-300">
            No student profiles found.
          </div>
        )}

        {/* STUDENT CARDS */}
        <div className="grid gap-8">

          {students.map((student) => (
            <div
              key={student._id}
              className="rounded-[2rem] border border-white/70 bg-white/85 p-8 shadow-[0_22px_60px_rgba(99,102,241,0.14)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_80px_rgba(99,102,241,0.18)] dark:border-slate-700/80 dark:bg-slate-900/75 dark:shadow-[0_22px_60px_rgba(15,23,42,0.48)] dark:hover:shadow-[0_28px_80px_rgba(8,47,73,0.42)]"
            >

              {/* TOP PROFILE */}
              <div className="mb-6 border-b border-slate-200 pb-6 text-center dark:border-slate-700">
                <img
                  src={
                    student.profileImage
                      ? resolveUploadUrl(student.profileImage)
                      : "/placeholder-profile.png"
                  }
                  className="mx-auto mb-4 h-32 w-32 rounded-full border-4 border-indigo-500 object-cover shadow-md dark:border-cyan-400"
                  alt="profile"
                />

                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {student.firstName} {student.lastName}
                </h2>

                <p className="text-gray-500 dark:text-slate-400">{student.email}</p>

                {student.cv && (
                  <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                    <a
                      href={resolveUploadUrl(student.cv)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-block rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 px-5 py-2 font-semibold text-white shadow transition hover:scale-105 dark:from-indigo-500 dark:via-violet-500 dark:to-cyan-400"
                    >
                      View CV
                    </a>
                    <button
                      type="button"
                      onClick={() => handleDownloadCv(student)}
                      className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-2 font-semibold text-white shadow-[0_14px_30px_rgba(16,185,129,0.28)] transition hover:scale-105 hover:from-emerald-600 hover:to-teal-600 dark:from-emerald-400 dark:to-cyan-400 dark:text-slate-950 dark:hover:from-emerald-300 dark:hover:to-cyan-300"
                    >
                      Download CV
                    </button>
                  </div>
                )}
              </div>

              {/* DETAILS */}
              <div className="grid md:grid-cols-2 gap-6">

                {/* BASIC */}
                <div className="rounded-2xl border border-indigo-100 bg-indigo-50/90 p-4 dark:border-cyan-400/10 dark:bg-cyan-400/5">
                  <h3 className="mb-2 font-bold text-indigo-700 dark:text-cyan-300">Basic Info</h3>
                  <div className="space-y-2 text-slate-700 dark:text-slate-200">
                    <p><b>First Name:</b> {student.firstName || "Not provided"}</p>
                    <p><b>Last Name:</b> {student.lastName || "Not provided"}</p>
                    <p><b>Province:</b> {student.province || "Not provided"}</p>
                    <p><b>District:</b> {student.district || "Not provided"}</p>
                    <p><b>Contact:</b> {student.contactNumber || "Not provided"}</p>
                  </div>
                </div>

                {/* EDUCATION */}
                <div className="rounded-2xl border border-violet-100 bg-violet-50/90 p-4 dark:border-violet-400/10 dark:bg-violet-400/5">
                  <h3 className="mb-2 font-bold text-violet-700 dark:text-violet-300">Education</h3>
                  <div className="space-y-2 text-slate-700 dark:text-slate-200">
                    <p><b>School:</b> {student.school || "Not provided"}</p>
                    <p><b>A/L Stream:</b> {student.localStream || "Not provided"}</p>
                    <p><b>Level:</b> {student.eduLevel || "Not provided"}</p>
                    <p><b>University:</b> {student.university || "Not provided"}</p>
                    <p><b>Degree:</b> {student.degree || "Not provided"}</p>
                  </div>
                </div>

                {/* SKILLS */}
                <div className="rounded-2xl border border-indigo-100 bg-indigo-50/90 p-4 dark:border-cyan-400/10 dark:bg-cyan-400/5">
                  <h3 className="mb-2 font-bold text-indigo-700 dark:text-cyan-300">Skills</h3>
                  <div className="space-y-2 text-slate-700 dark:text-slate-200">
                    <p><b>Frontend:</b> {formatList(student.frontendSkills)}</p>
                    <p><b>Backend:</b> {formatList(student.backendSkills)}</p>
                    <p><b>Database:</b> {formatList(student.databaseSkills)}</p>
                    <p><b>Preferred:</b> {student.preferredField || "Not provided"}</p>
                  </div>
                </div>

                {/* EXTRA */}
                <div className="rounded-2xl border border-violet-100 bg-violet-50/90 p-4 dark:border-violet-400/10 dark:bg-violet-400/5">
                  <h3 className="mb-2 font-bold text-violet-700 dark:text-violet-300">Extra</h3>
                  <div className="space-y-2 text-slate-700 dark:text-slate-200">
                    <p><b>Leadership:</b> {student.leadership || "Not provided"}</p>
                    <p><b>Awards:</b> {student.awards || "Not provided"}</p>
                    <p className="whitespace-pre-line break-words">
                      <b>Bio:</b> {student.bio || "Not provided"}
                    </p>
                  </div>
                </div>

              </div>

              {/* CARD BUTTON */}
              <div className="mt-6 flex justify-center">
                <button
                  onClick={() => navigate("/student/dashboard")}
                  className="rounded-xl bg-gradient-to-r from-slate-700 to-slate-900 px-6 py-2 font-semibold text-white shadow-[0_14px_30px_rgba(15,23,42,0.24)] transition hover:scale-105 hover:from-slate-800 hover:to-black dark:from-slate-200 dark:to-slate-400 dark:text-slate-950 dark:hover:from-white dark:hover:to-slate-300"
                >
                  Back
                </button>
              </div>

            </div>
          ))}

        </div>
      </div>
    </div>
  );
}

export default S_PviewCompany;
