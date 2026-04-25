import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaBell,
  FaBuilding,
  FaEnvelope,
  FaCalendarAlt,
  FaFileAlt,
  FaClock,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaUserGraduate,
} from "react-icons/fa";
import { resolveUploadUrl } from "./uploadUrl";
import { getStudentInterviewSchedules } from "./student_utils";

const API_BASE_URL = "http://localhost:5000/api/profiles";

function S_ProfileView() {
  const [student, setStudent] = useState({});
  const [showInterviewNotifications, setShowInterviewNotifications] = useState(false);
  const [interviewSchedules, setInterviewSchedules] = useState([]);
  const [loadingInterviews, setLoadingInterviews] = useState(false);
  const [interviewError, setInterviewError] = useState("");
  const { id } = useParams();
  const navigate = useNavigate();

  const formatInterviewDate = (dateValue) => {
    if (!dateValue) return "Date not set";

    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return "Invalid date";

    return date.toLocaleString("en-LK", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const upcomingInterviews = useMemo(
    () =>
      interviewSchedules
        .filter((schedule) => {
          const date = new Date(schedule?.interviewDateTime);
          return !Number.isNaN(date.getTime()) && date.getTime() >= Date.now();
        })
        .sort((first, second) => new Date(first.interviewDateTime) - new Date(second.interviewDateTime)),
    [interviewSchedules]
  );

  const formatList = (items) => {
    if (!Array.isArray(items) || items.length === 0) {
      return "Not provided";
    }
    return items.join(", ");
  };

  useEffect(() => {
    const loadInterviewSchedules = async () => {
      setLoadingInterviews(true);
      setInterviewError("");

      try {
        const result = await getStudentInterviewSchedules();
        setInterviewSchedules(Array.isArray(result?.data) ? result.data : []);
      } catch (error) {
        setInterviewError(error?.message || "Could not load interview details");
      } finally {
        setLoadingInterviews(false);
      }
    };

    loadInterviewSchedules();

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
      <div className="relative overflow-hidden border-b border-white/20 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.22),_transparent_28%),linear-gradient(135deg,_#312e81_0%,_#6d28d9_45%,_#0891b2_100%)] shadow-xl dark:border-slate-800 dark:bg-[radial-gradient(circle_at_top_left,_rgba(103,232,249,0.12),_transparent_25%),linear-gradient(135deg,_#020617_0%,_#312e81_45%,_#0f766e_100%)]">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute -left-8 top-10 h-40 w-40 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-cyan-300/20 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-36 w-36 rounded-full bg-fuchsia-300/20 blur-3xl" />
        </div>

        <div className="relative mx-auto flex max-w-5xl flex-col gap-8 px-4 py-12 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-100 backdrop-blur">
              <FaUserGraduate />
              Student Portfolio
            </div>
            <h1 className="mt-5 text-4xl font-black tracking-tight text-white md:text-5xl">
              My Profile
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-indigo-100">
              View your academic background, skills, and profile details in one place.
            </p>
          </div>

          <div className="flex flex-col items-stretch gap-4 sm:min-w-[22rem]">
            <button
              type="button"
              onClick={() => setShowInterviewNotifications((prev) => !prev)}
              className="ml-auto inline-flex items-center gap-3 rounded-2xl border border-white/20 bg-white/12 px-4 py-3 text-sm font-semibold text-white shadow-lg backdrop-blur transition hover:bg-white/20"
            >
              <span className="relative inline-flex">
                <FaBell className="text-base" />
                {upcomingInterviews.length > 0 && (
                  <span className="absolute -right-2 -top-2 min-h-5 min-w-5 rounded-full bg-rose-500 px-1 text-center text-[11px] font-bold leading-5 text-white">
                    {upcomingInterviews.length > 9 ? "9+" : upcomingInterviews.length}
                  </span>
                )}
              </span>
              Interview Notifications
            </button>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-3xl border border-white/15 bg-white/10 px-5 py-4 text-white backdrop-blur">
                <p className="text-xs uppercase tracking-[0.24em] text-cyan-100">Location</p>
                <p className="mt-2 text-lg font-bold">{student.district || "Not set"}</p>
              </div>
              <div className="rounded-3xl border border-white/15 bg-white/10 px-5 py-4 text-white backdrop-blur">
                <p className="text-xs uppercase tracking-[0.24em] text-cyan-100">Education</p>
                <p className="mt-2 text-lg font-bold">{student.eduLevel || "Not set"}</p>
              </div>
              <div className="rounded-3xl border border-white/15 bg-white/10 px-5 py-4 text-white backdrop-blur">
                <p className="text-xs uppercase tracking-[0.24em] text-cyan-100">Preferred Field</p>
                <p className="mt-2 text-lg font-bold">{student.preferredField || "Not set"}</p>
              </div>
            </div>

            {showInterviewNotifications && (
              <div className="rounded-[1.75rem] border border-white/30 bg-white/95 p-4 text-slate-900 shadow-[0_20px_50px_rgba(15,23,42,0.2)] backdrop-blur dark:border-slate-700 dark:bg-slate-950/95 dark:text-slate-100">
                <div className="mb-3 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-indigo-600 dark:text-cyan-300">
                      Interview Calendar
                    </p>
                    <h3 className="mt-1 text-lg font-bold">Your scheduled company interviews</h3>
                  </div>
                  <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-cyan-400/10 dark:text-cyan-300">
                    {upcomingInterviews.length} upcoming
                  </span>
                </div>

                {loadingInterviews && (
                  <p className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300">
                    Loading interview details...
                  </p>
                )}

                {!loadingInterviews && interviewError && (
                  <p className="rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200">
                    {interviewError}
                  </p>
                )}

                {!loadingInterviews && !interviewError && upcomingInterviews.length === 0 && (
                  <p className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300">
                    No upcoming interviews yet. Company schedule updates will appear here automatically.
                  </p>
                )}

                {!loadingInterviews && !interviewError && upcomingInterviews.length > 0 && (
                  <div className="max-h-80 space-y-3 overflow-y-auto pr-1">
                    {upcomingInterviews.map((schedule) => (
                      <article
                        key={schedule._id || schedule.referenceKey}
                        className="rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-4 shadow-sm dark:border-slate-700 dark:from-slate-900 dark:via-slate-900 dark:to-cyan-950/35"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">
                              {schedule.internshipTitle || "Interview Schedule"}
                            </p>
                            <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                              {schedule.companyName || "Company"}
                            </p>
                          </div>
                          <span className="rounded-full bg-white/80 px-3 py-1 text-[11px] font-semibold text-indigo-700 shadow-sm dark:bg-slate-800 dark:text-cyan-300">
                            {schedule.interviewType || "online"}
                          </span>
                        </div>

                        <div className="mt-3 space-y-2 text-sm text-slate-700 dark:text-slate-300">
                          <p className="flex items-start gap-2">
                            <FaCalendarAlt className="mt-0.5 shrink-0 text-indigo-600 dark:text-cyan-300" />
                            <span>{formatInterviewDate(schedule.interviewDateTime)}</span>
                          </p>
                          <p className="flex items-start gap-2">
                            <FaClock className="mt-0.5 shrink-0 text-indigo-600 dark:text-cyan-300" />
                            <span>Duration: {schedule.duration || "30 mins"}</span>
                          </p>
                          <p className="flex items-start gap-2">
                            <FaBuilding className="mt-0.5 shrink-0 text-indigo-600 dark:text-cyan-300" />
                            <span>{schedule.companyName || "Company name not provided"}</span>
                          </p>
                          <p className="flex items-start gap-2">
                            <FaMapMarkerAlt className="mt-0.5 shrink-0 text-indigo-600 dark:text-cyan-300" />
                            <span>{schedule.venueOrLink || "Venue/link not provided"}</span>
                          </p>
                          {schedule.internshipLocation && (
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              Internship location: {schedule.internshipLocation}
                            </p>
                          )}
                          {schedule.notes && (
                            <p className="rounded-2xl bg-white/80 px-3 py-2 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                              {schedule.notes}
                            </p>
                          )}
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* PROFILE CARD */}
      <div className="max-w-5xl mx-auto px-4 -mt-16">

        <div className="rounded-[2rem] border border-white/70 bg-white/88 p-8 shadow-[0_24px_70px_rgba(99,102,241,0.16)] backdrop-blur dark:border-slate-700/80 dark:bg-slate-900/78 dark:shadow-[0_24px_70px_rgba(15,23,42,0.5)]">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col items-center gap-5 text-center lg:flex-row lg:text-left">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500/30 via-violet-500/30 to-cyan-400/30 blur-xl" />
                <img
                  src={
                    student.profileImage
                      ? resolveUploadUrl(student.profileImage)
                      : "/placeholder-profile.png"
                  }
                  className="relative h-32 w-32 rounded-full border-4 border-indigo-500 object-cover shadow-lg dark:border-cyan-400"
                  alt="profile"
                />
              </div>

              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-indigo-600 dark:bg-cyan-500/10 dark:text-cyan-200">
                  <FaUserGraduate />
                  Student Profile
                </div>
                <h2 className="mt-4 text-3xl font-black text-slate-900 dark:text-white">
                  {student.firstName} {student.lastName}
                </h2>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  {student.email}
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:max-w-md">
              <div className="rounded-3xl border border-slate-200/80 bg-slate-50/90 p-4 dark:border-slate-700 dark:bg-slate-800/70">
                <div className="flex items-center gap-3 text-slate-700 dark:text-slate-200">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 dark:bg-cyan-500/10 dark:text-cyan-300">
                    <FaEnvelope />
                  </span>
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Email</p>
                    <p className="mt-1 text-sm font-semibold">{student.email || "Not provided"}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200/80 bg-slate-50/90 p-4 dark:border-slate-700 dark:bg-slate-800/70">
                <div className="flex items-center gap-3 text-slate-700 dark:text-slate-200">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-100 text-violet-600 dark:bg-violet-500/10 dark:text-violet-300">
                    <FaPhoneAlt />
                  </span>
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Contact</p>
                    <p className="mt-1 text-sm font-semibold">{student.contactNumber || "Not provided"}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200/80 bg-slate-50/90 p-4 dark:border-slate-700 dark:bg-slate-800/70">
                <div className="flex items-center gap-3 text-slate-700 dark:text-slate-200">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-100 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-300">
                    <FaMapMarkerAlt />
                  </span>
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-400">District</p>
                    <p className="mt-1 text-sm font-semibold">{student.district || "Not provided"}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200/80 bg-slate-50/90 p-4 dark:border-slate-700 dark:bg-slate-800/70">
                <div className="flex items-center gap-3 text-slate-700 dark:text-slate-200">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300">
                    <FaFileAlt />
                  </span>
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-400">CV Status</p>
                    <p className="mt-1 text-sm font-semibold">{student.cv ? "Uploaded" : "Not uploaded"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CV BUTTON */}
          {student.cv && (
            <a
              href={resolveUploadUrl(student.cv)}
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 px-6 py-3 text-white font-semibold shadow transition hover:scale-105 dark:from-indigo-500 dark:via-violet-500 dark:to-cyan-400"
            >
              <FaFileAlt />
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
