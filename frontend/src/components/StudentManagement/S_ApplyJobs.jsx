import React, { useEffect, useMemo, useState } from "react";
import {
  FaArrowLeft,
  FaMapMarkerAlt,
  FaRegClock,
  FaBuilding,
  FaUsers,
  FaBullseye,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { resolveUploadUrl } from "./uploadUrl";

const INTERNSHIPS_API_URL = "http://localhost:5000/api/internships";
const APPLICATIONS_API_URL = "http://localhost:5000/api/applications";

const getStudentSession = () => {
  const student = JSON.parse(localStorage.getItem("student") || "null");
  const account = JSON.parse(localStorage.getItem("studentAccount") || "null");
  const token = localStorage.getItem("token") || "";

  return {
    studentProfile: student || null,
    studentId: account?._id || "",
    token,
  };
};

const normalizeText = (value) => String(value || "").trim().toLowerCase();

const isPreferredMatch = (internship, preferredField) => {
  const preferred = normalizeText(preferredField);
  if (!preferred) return false;

  const title = normalizeText(internship?.title);
  const description = normalizeText(internship?.description);
  const skills = Array.isArray(internship?.skills)
    ? internship.skills.map((skill) => normalizeText(skill)).join(" ")
    : normalizeText(internship?.skills);

  return (
    title.includes(preferred) ||
    preferred.includes(title) ||
    description.includes(preferred) ||
    skills.includes(preferred)
  );
};

const getVerificationColor = (status) => {
  if (status === "verified") return "text-emerald-700 bg-emerald-100";
  if (status === "pending") return "text-amber-700 bg-amber-100";
  if (status === "rejected") return "text-rose-700 bg-rose-100";
  return "text-slate-700 bg-slate-100";
};

const getTypeStyle = (type) => {
  const category = (type || "").toLowerCase();

  if (category.includes("remote")) return "bg-sky-100 text-sky-700 border-sky-300";
  if (category.includes("part")) return "bg-amber-100 text-amber-700 border-amber-300";
  if (category.includes("hybrid")) return "bg-cyan-100 text-cyan-700 border-cyan-300";
  return "bg-emerald-100 text-emerald-700 border-emerald-300";
};

const getThumbnail = (images) => {
  if (!Array.isArray(images) || images.length === 0) return "";
  return resolveUploadUrl(images[0]);
};

function S_ApplyJobs() {
  const navigate = useNavigate();
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [applyingId, setApplyingId] = useState("");
  const [notice, setNotice] = useState("");
  const [appliedIds, setAppliedIds] = useState([]);

  const { studentProfile, studentId, token } = useMemo(() => getStudentSession(), []);
  const preferredField = studentProfile?.preferredField || "";

  const verifiedInternships = useMemo(() => {
    const verified = internships.filter(
      (item) => item.paymentVerificationStatus === "verified"
    );

    return [...verified].sort((a, b) => {
      const aMatch = isPreferredMatch(a, preferredField);
      const bMatch = isPreferredMatch(b, preferredField);

      if (aMatch === bMatch) {
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      }

      return aMatch ? -1 : 1;
    });
  }, [internships, preferredField]);

  const preferredMatches = useMemo(
    () => verifiedInternships.filter((item) => isPreferredMatch(item, preferredField)),
    [verifiedInternships, preferredField]
  );

  useEffect(() => {
    const loadInternships = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await axios.get(INTERNSHIPS_API_URL, {
          params: { status: "active" },
        });

        setInternships(response.data?.data || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load internships");
      } finally {
        setLoading(false);
      }
    };

    loadInternships();
  }, []);

  useEffect(() => {
    const loadApplications = async () => {
      if (!token || !studentId) return;

      try {
        const response = await axios.get(
          `${APPLICATIONS_API_URL}/student/${studentId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const items = Array.isArray(response.data?.data) ? response.data.data : [];
        setAppliedIds(
          items.map((item) => item.internshipId?._id).filter(Boolean)
        );
      } catch (err) {
        console.error("Failed to load applications", err);
      }
    };

    loadApplications();
  }, [studentId, token]);

  const handleApply = async (internshipId) => {
    if (!token || !studentId) {
      navigate("/login/student");
      return;
    }

    setApplyingId(internshipId);
    setNotice("");

    try {
      const response = await axios.post(
        APPLICATIONS_API_URL,
        {
          internshipId,
          coverLetter: "",
          resume: "",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setNotice(response.data?.message || "Application submitted successfully");
      setAppliedIds((current) =>
        current.includes(internshipId) ? current : [...current, internshipId]
      );
    } catch (err) {
      setNotice(err.response?.data?.message || "Failed to apply for internship");
    } finally {
      setApplyingId("");
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.18),_transparent_35%),linear-gradient(135deg,_#eef2ff_0%,_#f8fafc_45%,_#fdf2f8_100%)] font-sans dark:bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.12),_transparent_35%),linear-gradient(135deg,_#020617_0%,_#0f172a_45%,_#111827_100%)]">
      <div className="mx-auto max-w-7xl px-4 pb-12 pt-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-indigo-500 dark:text-cyan-300">
              Apply Jobs
            </p>
            <h1 className="mt-3 text-4xl font-black text-slate-900 dark:text-white">
              Matching Internship Posts
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500 dark:text-slate-300">
              This page only shows verified internship posts that match the student's preferred field from the profile.
            </p>
          </div>

          <button
            onClick={() => navigate("/student/dashboard")}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          >
            <FaArrowLeft />
            Back to Dashboard
          </button>
        </div>

        {notice && (
          <div className="mb-4 rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm font-medium text-indigo-700">
            {notice}
          </div>
        )}

        {preferredField && !loading && !error && (
          <div className="mb-5 flex flex-wrap items-center gap-3 rounded-2xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm text-cyan-800 dark:border-cyan-500/30 dark:bg-cyan-500/10 dark:text-cyan-100">
            <span className="inline-flex items-center gap-2 font-semibold">
              <FaBullseye />
              Preferred Field
            </span>
            <span className="rounded-full bg-white px-3 py-1 font-semibold text-cyan-700 dark:bg-slate-900 dark:text-cyan-200">
              {preferredField}
            </span>
            <span>
              {preferredMatches.length} matching post{preferredMatches.length === 1 ? "" : "s"} found
            </span>
          </div>
        )}

        {loading ? (
          <div className="rounded-[28px] border border-slate-200 bg-white p-8 text-center text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
            Loading verified internships...
          </div>
        ) : error ? (
          <div className="rounded-[28px] border border-rose-200 bg-rose-50 p-8 text-center text-rose-700 shadow-sm dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-200">
            {error}
          </div>
        ) : !preferredField ? (
          <div className="rounded-[28px] border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm dark:border-slate-600 dark:bg-slate-900">
            <p className="text-xl font-semibold text-slate-900 dark:text-white">Preferred field is not selected</p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Update the student profile and choose a preferred area to see matching internship posts here.
            </p>
          </div>
        ) : verifiedInternships.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm dark:border-slate-600 dark:bg-slate-900">
            <p className="text-xl font-semibold text-slate-900 dark:text-white">No verified internship posts available now</p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Please check again later for new verified openings.</p>
          </div>
        ) : preferredMatches.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm dark:border-slate-600 dark:bg-slate-900">
            <p className="text-xl font-semibold text-slate-900 dark:text-white">No matching internship posts found</p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              There are no verified posts yet for the preferred field `{preferredField}`.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {preferredMatches.map((internship) => (
              <div
                key={internship._id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex min-w-0 flex-1 gap-4">
                    <div className="shrink-0">
                      {getThumbnail(internship.images) ? (
                        <img
                          src={getThumbnail(internship.images)}
                          alt={`${internship.title} preview`}
                          className="h-24 w-24 rounded-2xl border border-slate-300 object-cover dark:border-slate-600"
                        />
                      ) : (
                        <div className="flex h-24 w-24 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-100 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-500 dark:bg-slate-800 dark:text-slate-400">
                          No Image
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{internship.title}</h3>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getVerificationColor(internship.paymentVerificationStatus)}`}>
                        Verified
                      </span>
                      {isPreferredMatch(internship, preferredField) && (
                        <span className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-semibold text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-200">
                          Matches Your Preference
                        </span>
                      )}
                      <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${getTypeStyle(internship.type)}`}>
                        {internship.type || "N/A"}
                      </span>
                    </div>
                    <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-600 dark:text-slate-300">
                      {internship.description || "No description available"}
                    </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleApply(internship._id)}
                    disabled={applyingId === internship._id || appliedIds.includes(internship._id)}
                    className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:scale-[1.02] disabled:opacity-60"
                  >
                    {appliedIds.includes(internship._id)
                      ? "Already Applied"
                      : applyingId === internship._id
                      ? "Applying..."
                      : "Apply Now"}
                  </button>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3 text-sm md:grid-cols-5">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-950/60">
                    <div className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">Location</div>
                    <div className="mt-1 flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-100">
                      <FaMapMarkerAlt className="text-indigo-500" />
                      {internship.location || "N/A"}
                    </div>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-950/60">
                    <div className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">Duration</div>
                    <div className="mt-1 flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-100">
                      <FaRegClock className="text-indigo-500" />
                      {internship.duration || "N/A"}
                    </div>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-950/60">
                    <div className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">Stipend</div>
                    <div className="mt-1 font-semibold text-slate-800 dark:text-slate-100">{internship.stipend || "N/A"}</div>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-950/60">
                    <div className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">Openings</div>
                    <div className="mt-1 font-semibold text-slate-800 dark:text-slate-100">{internship.openings || "N/A"}</div>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-950/60">
                    <div className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">Applications</div>
                    <div className="mt-1 flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-100">
                      <FaUsers className="text-indigo-500" />
                      {internship.applications?.length || 0}
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap gap-2">
                    {(internship.skills || []).length ? (
                      internship.skills.map((skill, idx) => (
                        <span
                          key={`${internship._id}-skill-${idx}`}
                          className="rounded-full border border-slate-300 bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-slate-500 dark:text-slate-400">No skills listed</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 rounded-full border border-slate-300 bg-slate-100 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-slate-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    <FaBuilding />
                    {internship.companyId?.companyName || "Company"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default S_ApplyJobs;
