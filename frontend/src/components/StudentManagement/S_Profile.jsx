import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaBell, FaCalendarAlt, FaMapMarkerAlt } from "react-icons/fa";
import { resolveUploadUrl } from "./uploadUrl";
import { getStudentInterviewSchedules } from "./student_utils";

const API_BASE_URL = "http://localhost:5000/api/profiles";
const SKILL_FIELDS = ["frontendSkills", "backendSkills", "databaseSkills"];

const normalizeSkillArray = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value !== "string" || !value.trim()) return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
};

const normalizeStudentProfile = (profile) => {
  if (!profile) return profile;

  const normalized = { ...profile };
  SKILL_FIELDS.forEach((field) => {
    normalized[field] = normalizeSkillArray(profile[field]);
  });

  return normalized;
};

function S_Profile() {
  const [student, setStudent] = useState({});
  const [cvFile, setCvFile] = useState(null);
  const [showInterviewNotifications, setShowInterviewNotifications] = useState(false);
  const [interviewSchedules, setInterviewSchedules] = useState([]);
  const [loadingInterviews, setLoadingInterviews] = useState(false);
  const [interviewError, setInterviewError] = useState("");
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
      interviewSchedules.filter((schedule) => {
        const date = new Date(schedule?.interviewDateTime);
        return !Number.isNaN(date.getTime()) && date.getTime() >= Date.now();
      }),
    [interviewSchedules]
  );

  useEffect(() => {
    const loadProfile = async () => {
      const storedProfile = JSON.parse(localStorage.getItem("student"));
      const account = JSON.parse(localStorage.getItem("studentAccount")) || storedProfile;

      if (!account) return;

      const isProfileRecord = storedProfile && !storedProfile.password && !storedProfile.address;
      if (isProfileRecord) {
        setStudent(normalizeStudentProfile(storedProfile));
        return;
      }

      const { _id, password, ...accountFields } = account;

      try {
        const res = await axios.get(`${API_BASE_URL}/email/${encodeURIComponent(account.email)}`);
        const normalizedProfile = normalizeStudentProfile(res.data);
        setStudent(normalizedProfile);
        localStorage.setItem("student", JSON.stringify(normalizedProfile));
      } catch (err) {
        if (err.response?.status === 404) {
          setStudent(normalizeStudentProfile({ ...accountFields, accountId: _id }));
        } else {
          console.error("Failed to load profile", err);
          setStudent(normalizeStudentProfile({ ...accountFields, accountId: _id }));
        }
      }
    };

    loadProfile();
  }, []);

  useEffect(() => {
    const loadInterviewSchedules = async () => {
      setLoadingInterviews(true);
      setInterviewError("");

      try {
        const result = await getStudentInterviewSchedules();
        const schedules = Array.isArray(result?.data) ? result.data : [];
        setInterviewSchedules(schedules);
      } catch (err) {
        setInterviewError(err?.message || "Could not load interview notifications");
      } finally {
        setLoadingInterviews(false);
      }
    };

    loadInterviewSchedules();
  }, []);

  const handleChange = (e) => {
    setStudent({ ...student, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setStudent({ ...student, profileImage: file });
  };

  const handleCvChange = (e) => {
    setCvFile(e.target.files[0]);
  };

  const handleSubmit = async () => {
    try {
      const formData = new FormData();

      Object.keys(student).forEach((key) => {
        if (["frontendSkills", "backendSkills", "databaseSkills"].includes(key)) {
          const val = student[key];
          if (Array.isArray(val)) formData.append(key, JSON.stringify(val));
          else if (typeof val === "string") formData.append(key, val);
        } else if (key === "profileImage" && student[key] instanceof File) {
          formData.append("profileImage", student[key]);
        } else if (key !== "profileImage") {
          if (student[key] !== undefined && student[key] !== null) {
            formData.append(key, student[key]);
          }
        }
      });

      if (cvFile) formData.append("cv", cvFile);

      const isUpdate = Boolean(student._id && !student.password && !student.address);
      const url = isUpdate
        ? `${API_BASE_URL}/update/${student._id}`
        : `${API_BASE_URL}/create`;
      const method = isUpdate ? axios.put : axios.post;

      const res = await method(url, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const savedProfileRes = await axios.get(`${API_BASE_URL}/${res.data._id}`);
      const normalizedProfile = normalizeStudentProfile(savedProfileRes.data);
      setStudent(normalizedProfile);
      localStorage.setItem("student", JSON.stringify(normalizedProfile));

      alert(isUpdate ? "Profile Updated ✅" : "Profile Created ✅");
      navigate("/student/dashboard");
    } catch (err) {
      console.error(
        "Profile save failed",
        err.response?.status,
        err.response?.data || err.message
      );
      alert(`Failed ❌ ${err.response?.data?.message || err.message}`);
    }
  };

  const provinces = [
    "Central",
    "Eastern",
    "North Central",
    "Northern",
    "North Western",
    "Sabaragamuwa",
    "Southern",
    "Uva",
    "Western"
  ];

  const districts = [
    "Ampara", "Anuradhapura", "Badulla", "Batticaloa", "Colombo", "Galle", "Gampaha", "Hambantota", "Jaffna", "Kalutara",
    "Kandy", "Kegalle", "Kilinochchi", "Kurunegala", "Mannar", "Matale", "Matara", "Moneragala", "Mullaitivu", "Nuwara Eliya",
    "Polonnaruwa", "Puttalam", "Ratnapura", "Trincomalee", "Vavuniya"
  ];

  const frontendLanguages = [
    "HTML", "CSS", "JavaScript", "TypeScript", "React", "Vue.js", "Angular", "Svelte", "Next.js", "Nuxt.js", "Ember.js", "Backbone.js"
  ];

  const backendLanguages = [
    "Node.js", "Java", "Python", "PHP", "C#", "Ruby", "Go", "Rust", "Kotlin", "Swift", "Scala", "Perl", "Elixir", "Dart"
  ];

  const databaseSkills = [
    "MySQL", "MongoDB", "PostgreSQL", "SQLite", "Redis", "Oracle", "SQL Server", "Cassandra", "DynamoDB", "Firebase", "CouchDB"
  ];

  const sectionCardClass = "rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-[0_24px_70px_rgba(99,102,241,0.14)] backdrop-blur dark:border-slate-700/80 dark:bg-slate-900/75 dark:shadow-[0_24px_70px_rgba(15,23,42,0.5)]";
  const inputClass = "w-full rounded-2xl border border-slate-200 bg-white/95 px-4 py-3 text-sm text-slate-700 outline-none transition duration-200 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-950/80 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-cyan-400 dark:focus:ring-cyan-400/10";
  const labelClass = "mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200";
  const sectionTitleClass = "text-lg font-bold text-slate-900 dark:text-white";
  const sectionHintClass = "mt-1 text-sm text-slate-500 dark:text-slate-400";
  const skillChipClass = (isActive) => `flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium transition duration-200 ${
    isActive
      ? "border-indigo-500 bg-indigo-500/10 text-indigo-700 shadow-sm dark:border-cyan-400 dark:bg-cyan-400/10 dark:text-cyan-300"
      : "border-slate-200 bg-white text-slate-600 hover:border-indigo-400 hover:bg-indigo-500/5 dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-300 dark:hover:border-cyan-400/50 dark:hover:bg-cyan-400/5"
  }`;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.18),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(6,182,212,0.18),_transparent_24%),linear-gradient(180deg,_#eef2ff_0%,_#f8fafc_42%,_#f8fafc_100%)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.14),_transparent_24%),radial-gradient(circle_at_top_right,_rgba(129,140,248,0.14),_transparent_22%),linear-gradient(180deg,_#020617_0%,_#0f172a_46%,_#111827_100%)]">
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 dark:from-slate-950 dark:via-indigo-950 dark:to-cyan-950">
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.18),transparent_40%,rgba(255,255,255,0.08))] dark:bg-[linear-gradient(120deg,rgba(148,163,184,0.12),transparent_40%,rgba(34,211,238,0.08))]" />
        <div className="relative mx-auto flex max-w-6xl flex-col gap-6 px-6 py-12 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-white/70">
              Student Profile
            </p>
            <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-white">
              Build a profile that feels complete
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/80 md:text-base">
              Add your education, skills, CV, and personal details in a cleaner layout using your main theme colors.
            </p>
          </div>

          <div className="flex flex-col items-end gap-3">
            <div className="relative w-full max-w-md">
              <button
                type="button"
                onClick={() => setShowInterviewNotifications((prev) => !prev)}
                className="ml-auto flex items-center gap-3 rounded-2xl border border-white/30 bg-white/15 px-4 py-2 text-sm font-semibold text-white shadow-md backdrop-blur-md transition hover:bg-white/25 dark:border-cyan-300/20 dark:bg-slate-900/40"
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

              {showInterviewNotifications && (
                <div className="absolute right-0 z-20 mt-3 w-[min(92vw,26rem)] overflow-hidden rounded-3xl border border-indigo-200/70 bg-white/95 p-4 text-slate-800 shadow-[0_20px_55px_rgba(30,41,59,0.24)] backdrop-blur dark:border-slate-700 dark:bg-slate-900/95 dark:text-slate-100">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-indigo-700 dark:text-cyan-300">
                      Scheduled Interviews
                    </h3>
                    <span className="rounded-full bg-indigo-500/10 px-2.5 py-1 text-xs font-semibold text-indigo-700 dark:bg-cyan-400/10 dark:text-cyan-300">
                      {interviewSchedules.length} total
                    </span>
                  </div>

                  {loadingInterviews && (
                    <p className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300">
                      Loading interview details...
                    </p>
                  )}

                  {!loadingInterviews && interviewError && (
                    <p className="rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-400/20 dark:bg-rose-500/10 dark:text-rose-300">
                      {interviewError}
                    </p>
                  )}

                  {!loadingInterviews && !interviewError && interviewSchedules.length === 0 && (
                    <p className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300">
                      No interview schedules yet. Once a company schedules one, it will appear here.
                    </p>
                  )}

                  {!loadingInterviews && !interviewError && interviewSchedules.length > 0 && (
                    <div className="max-h-80 space-y-3 overflow-y-auto pr-1">
                      {interviewSchedules.map((schedule) => (
                        <article
                          key={schedule._id || schedule.referenceKey}
                          className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-3 shadow-sm dark:border-slate-700 dark:from-slate-900 dark:via-slate-900 dark:to-cyan-950/30"
                        >
                          <p className="text-sm font-bold text-slate-900 dark:text-white">
                            {schedule.internshipTitle || "Internship Interview"}
                          </p>

                          <div className="mt-2 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                            <p className="flex items-start gap-2">
                              <FaCalendarAlt className="mt-0.5 shrink-0 text-indigo-600 dark:text-cyan-300" />
                              <span>{formatInterviewDate(schedule.interviewDateTime)}</span>
                            </p>
                            <p className="flex items-start gap-2">
                              <FaMapMarkerAlt className="mt-0.5 shrink-0 text-indigo-600 dark:text-cyan-300" />
                              <span>
                                {schedule.interviewType === "online" ? "Online" : "Onsite"} - {schedule.venueOrLink || "Venue/link not provided"}
                              </span>
                            </p>
                            <p>
                              Duration: <span className="font-semibold">{schedule.duration || "30 mins"}</span>
                            </p>
                            {schedule.internshipLocation && (
                              <p>
                                Internship Location: <span className="font-semibold">{schedule.internshipLocation}</span>
                              </p>
                            )}
                            {schedule.notes && (
                              <p className="rounded-xl bg-white/80 px-2 py-1 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                                Note: {schedule.notes}
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

            <div className="w-full rounded-3xl border border-white/20 bg-white/10 p-5 text-white shadow-lg backdrop-blur-md dark:border-cyan-400/10 dark:bg-slate-900/35">
              <p className="text-xs uppercase tracking-[0.22em] text-white/70">Profile status</p>
              <p className="mt-2 text-2xl font-bold">
                {student._id ? "Ready to update" : "Create profile"}
              </p>
              <p className="mt-2 text-sm text-white/80">
                Keep your CV and profile image polished before companies view them.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto -mt-10 max-w-6xl px-4 pb-12 sm:px-6">
        <div className={`${sectionCardClass} mb-6 p-6 md:p-8`}>
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-5">
              <div
                className="group relative h-28 w-28 overflow-hidden rounded-[2rem] border-4 border-white bg-slate-100 shadow-[0_18px_50px_rgba(99,102,241,0.2)] cursor-pointer dark:border-slate-800 dark:bg-slate-800 dark:shadow-[0_18px_50px_rgba(8,47,73,0.35)]"
                onClick={() => document.getElementById("profileInput").click()}
              >
                <img
                  src={
                    student.profileImage instanceof File
                      ? URL.createObjectURL(student.profileImage)
                      : student.profileImage ? resolveUploadUrl(student.profileImage) : "/placeholder-profile.png"
                  }
                  alt="profile"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/70 to-transparent px-3 py-2 text-center text-xs font-semibold text-white opacity-100 md:opacity-0 md:transition md:duration-200 md:group-hover:opacity-100">
                  Change photo
                </div>
                <input
                  type="file"
                  id="profileInput"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </div>

              <div>
                <span className="inline-flex rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-700 dark:bg-cyan-400/10 dark:text-cyan-300">
                  Student Identity
                </span>
                <h2 className="mt-3 text-3xl font-bold text-slate-900 dark:text-white">
                  {student.firstName || "Your"} {student.lastName || "Profile"}
                </h2>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  {student.email || "Add your account details and present them clearly."}
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-indigo-500/10 bg-indigo-500/5 px-4 py-3 dark:border-cyan-400/10 dark:bg-cyan-400/5">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-700 dark:text-cyan-300">Profile image</p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  Use a clear professional photo.
                </p>
              </div>
              <div className="rounded-2xl border border-violet-500/10 bg-violet-500/5 px-4 py-3 dark:border-violet-400/10 dark:bg-violet-400/5">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-700 dark:text-violet-300">CV upload</p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  Keep your latest resume attached.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className={sectionCardClass}>
            <div className="mb-6">
              <h3 className={sectionTitleClass}>Basic Info</h3>
              <p className={sectionHintClass}>Present your contact and location details clearly.</p>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className={labelClass}>Province</label>
                <select
                  name="province"
                  value={student.province || ""}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="">Select Province</option>
                  {provinces.map((prov) => (
                    <option key={prov} value={prov}>{prov}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>District</label>
                <select
                  name="district"
                  value={student.district || ""}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="">Select District</option>
                  {districts.map((dist) => (
                    <option key={dist} value={dist}>{dist}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Phone Number</label>
                <input
                  name="contactNumber"
                  placeholder="Enter your contact number"
                  value={student.contactNumber || ""}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
            </div>
          </section>

          <section className={sectionCardClass}>
            <div className="mb-6">
              <h3 className={sectionTitleClass}>School Education</h3>
              <p className={sectionHintClass}>Add your school background and A/L stream.</p>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className={labelClass}>School</label>
                <input
                  name="school"
                  placeholder="Enter your school"
                  value={student.school || ""}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>A/L Stream</label>
                <select
                  name="localStream"
                  value={student.localStream || ""}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="">Select A/L Stream</option>
                  <option>Physical Science</option>
                  <option>Biological Science</option>
                  <option>Commerce</option>
                  <option>Arts</option>
                </select>
              </div>
            </div>
          </section>

          <section className={`${sectionCardClass} lg:col-span-2`}>
            <div className="mb-6">
              <h3 className={sectionTitleClass}>University</h3>
              <p className={sectionHintClass}>Highlight your current academic level and degree path.</p>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              <div>
                <label className={labelClass}>Level</label>
                <select
                  name="eduLevel"
                  value={student.eduLevel || ""}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="">Select Level</option>
                  <option>Undergraduate</option>
                  <option>Graduate</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>University</label>
                <input
                  name="university"
                  placeholder="Enter your university"
                  value={student.university || ""}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Degree</label>
                <input
                  name="degree"
                  placeholder="Enter your degree"
                  value={student.degree || ""}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
            </div>
          </section>

          <section className={`${sectionCardClass} lg:col-span-2`}>
            <div className="mb-6">
              <h3 className={sectionTitleClass}>Technical Skills</h3>
              <p className={sectionHintClass}>Choose the areas you want employers to notice first.</p>
            </div>

            <div className="space-y-8">
              <div>
                <h4 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-indigo-700 dark:text-cyan-300">Frontend Languages</h4>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {frontendLanguages.map((skill) => (
                    <label key={skill} className={skillChipClass(student.frontendSkills?.includes(skill) || false)}>
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                        checked={student.frontendSkills?.includes(skill) || false}
                        onChange={(e) => {
                          let updated = [...(student.frontendSkills || [])];
                          if (e.target.checked && !updated.includes(skill)) updated.push(skill);
                          else updated = updated.filter((s) => s !== skill);
                          setStudent({ ...student, frontendSkills: updated });
                        }}
                      />
                      <span>{skill}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-violet-700 dark:text-violet-300">Backend Languages</h4>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {backendLanguages.map((skill) => (
                    <label key={skill} className={skillChipClass(student.backendSkills?.includes(skill) || false)}>
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                        checked={student.backendSkills?.includes(skill) || false}
                        onChange={(e) => {
                          let updated = [...(student.backendSkills || [])];
                          if (e.target.checked && !updated.includes(skill)) updated.push(skill);
                          else updated = updated.filter((s) => s !== skill);
                          setStudent({ ...student, backendSkills: updated });
                        }}
                      />
                      <span>{skill}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-cyan-700 dark:text-sky-300">Database Skills</h4>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {databaseSkills.map((skill) => (
                    <label key={skill} className={skillChipClass(student.databaseSkills?.includes(skill) || false)}>
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                        checked={student.databaseSkills?.includes(skill) || false}
                        onChange={(e) => {
                          let updated = [...(student.databaseSkills || [])];
                          if (e.target.checked && !updated.includes(skill)) updated.push(skill);
                          else updated = updated.filter((s) => s !== skill);
                          setStudent({ ...student, databaseSkills: updated });
                        }}
                      />
                      <span>{skill}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className={labelClass}>Preferred Field</label>
                <select
                  name="preferredField"
                  value={student.preferredField || ""}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="">Select Preferred Area</option>
                  <option>Frontend Developer</option>
                  <option>Backend Developer</option>
                  <option>Full Stack Developer</option>
                  <option>Mobile App Developer</option>
                  <option>QA Engineer</option>
                  <option>Software Tester</option>
                  <option>Automation Tester</option>
                  <option>DevOps Engineer</option>
                  <option>Cloud Engineer</option>
                  <option>System Administrator</option>
                  <option>Data Analyst</option>
                  <option>Data Scientist</option>
                  <option>Machine Learning Engineer</option>
                  <option>UI/UX Designer</option>
                  <option>Project Manager</option>
                  <option>Product Manager</option>
                  <option>Business Analyst</option>
                  <option>Cybersecurity Analyst</option>
                </select>
              </div>
            </div>
          </section>

          <section className={sectionCardClass}>
            <div className="mb-6">
              <h3 className={sectionTitleClass}>Extra Details</h3>
              <p className={sectionHintClass}>Add achievements and a short professional summary.</p>
            </div>
            <div className="grid gap-5">
              <div>
                <label className={labelClass}>Leadership</label>
                <input
                  name="leadership"
                  placeholder="Leadership roles or experience"
                  value={student.leadership || ""}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Awards</label>
                <input
                  name="awards"
                  placeholder="Awards and recognitions"
                  value={student.awards || ""}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>About Me</label>
                <textarea
                  name="bio"
                  placeholder="Write a short summary about yourself"
                  value={student.bio || ""}
                  onChange={handleChange}
                  rows={5}
                  className={`${inputClass} resize-none`}
                />
              </div>
            </div>
          </section>

          <section className={sectionCardClass}>
            <div className="mb-6">
              <h3 className={sectionTitleClass}>CV & Attachments</h3>
              <p className={sectionHintClass}>Upload your latest CV and keep it easy to access.</p>
            </div>
            <div className="space-y-5">
              <div className="rounded-2xl border border-dashed border-indigo-500/30 bg-indigo-500/5 p-5 dark:border-cyan-400/20 dark:bg-cyan-400/5">
                <label className={labelClass}>Upload CV</label>
                <input
                  type="file"
                  onChange={handleCvChange}
                  className={`${inputClass} file:mr-4 file:rounded-xl file:border-0 file:bg-indigo-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-violet-600 dark:file:bg-cyan-500 dark:hover:file:bg-sky-500`}
                />
                <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                  PDF format is recommended for better viewing.
                </p>
              </div>

              {student.cv && !cvFile && (
                <a
                  href={resolveUploadUrl(student.cv)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex w-full items-center justify-center rounded-2xl border border-cyan-500/20 bg-cyan-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(6,182,212,0.25)] transition duration-200 hover:-translate-y-0.5 hover:bg-sky-500"
                >
                  View Current CV
                </a>
              )}
            </div>
          </section>
        </div>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-end">
          <button
            onClick={() => navigate("/student/dashboard")}
            className="rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition duration-200 hover:border-indigo-400 hover:text-indigo-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-cyan-400 dark:hover:text-cyan-300"
          >
            Back to Dashboard
          </button>
          <button
            onClick={handleSubmit}
            className="rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 px-8 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(99,102,241,0.32)] transition duration-200 hover:-translate-y-0.5 dark:from-indigo-500 dark:via-violet-500 dark:to-cyan-400"
          >
            Save Profile
          </button>
        </div>
      </div>
    </div>
  );
}

export default S_Profile;
