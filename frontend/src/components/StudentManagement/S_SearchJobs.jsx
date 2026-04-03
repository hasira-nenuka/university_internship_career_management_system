import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  FaArrowLeft,
  FaBriefcase,
  FaBuilding,
  FaFilter,
  FaLocationDot,
  FaMagnifyingGlass,
  FaRegClock,
  FaUsers,
} from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import { resolveUploadUrl } from "./uploadUrl";
import {
  getStudentSession as getStoredStudentSession,
  isStudentAuthError,
  logoutStudent,
} from "./student_utils";

const INTERNSHIP_API_URL = "http://localhost:5000/api/internships";
const APPLICATION_API_URL = "http://localhost:5000/api/applications";

const suggestedFilters = [
  "Frontend Developer",
  "Backend Developer",
  "QA Engineer",
  "Remote",
  "Colombo",
  "Jaffna",
];

const DISTRICTS = [
  "Colombo",
  "Gampaha",
  "Kalutara",
  "Kandy",
  "Matale",
  "Nuwara Eliya",
  "Galle",
  "Matara",
  "Hambantota",
  "Jaffna",
  "Kilinochchi",
  "Mannar",
  "Vavuniya",
  "Mullaitivu",
  "Batticaloa",
  "Ampara",
  "Trincomalee",
  "Kurunegala",
  "Puttalam",
  "Anuradhapura",
  "Polonnaruwa",
  "Badulla",
  "Moneragala",
  "Ratnapura",
  "Kegalle",
];

const PREFERRED_AREAS = [
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Mobile App Developer",
  "QA Engineer",
  "Software Tester",
  "Automation Tester",
  "DevOps Engineer",
  "Cloud Engineer",
  "System Administrator",
  "Data Analyst",
  "Data Scientist",
  "Machine Learning Engineer",
  "UI/UX Designer",
  "Project Manager",
  "Product Manager",
  "Business Analyst",
  "Cybersecurity Analyst",
];

const getStudentAuth = () => {
  const session = getStoredStudentSession();
  const account = session?.student || JSON.parse(localStorage.getItem("studentAccount") || "null");
  const token = session?.token || "";

  return {
    studentId: account?._id || "",
    token,
  };
};

const normalizeList = (value) => {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
};

const normalizeText = (value) => String(value || "").trim().toLowerCase();

const getThumbnail = (job) => {
  if (Array.isArray(job?.images) && job.images.length > 0) {
    return resolveUploadUrl(job.images[0]);
  }

  if (job?.companyId?.logo) {
    return resolveUploadUrl(job.companyId.logo);
  }

  return "";
};

function S_SearchJobs() {
  const navigate = useNavigate();
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [location, setLocation] = useState("");
  const [jobType, setJobType] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [applyingId, setApplyingId] = useState("");
  const [appliedIds, setAppliedIds] = useState([]);
  const { studentId, token } = useMemo(() => getStudentAuth(), []);

  useEffect(() => {
    const fetchInternships = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await axios.get(INTERNSHIP_API_URL, {
          params: { status: "active" },
        });

        const items = Array.isArray(res.data?.data) ? res.data.data : [];
        setInternships(items.filter((job) => job.paymentVerificationStatus === "verified"));
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load internships");
      } finally {
        setLoading(false);
      }
    };

    fetchInternships();
  }, []);

  useEffect(() => {
    const fetchAppliedInternships = async () => {
      if (!token || !studentId) return;

      try {
        const res = await axios.get(`${APPLICATION_API_URL}/student/${studentId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const applicationList = Array.isArray(res.data?.data) ? res.data.data : [];
        setAppliedIds(
          applicationList.map((item) => item.internshipId?._id).filter(Boolean)
        );
      } catch (err) {
        if (isStudentAuthError(err)) {
          logoutStudent();
          setNotice("Your student session expired. Please log in again.");
          navigate("/login/student");
          return;
        }

        console.error("Failed to load applications", err);
      }
    };

    fetchAppliedInternships();
  }, [studentId, token]);

  const filteredJobs = useMemo(() => {
    return internships.filter((job) => {
      const matchesSearch =
        !searchTerm ||
        normalizeText(job.title).includes(normalizeText(searchTerm)) ||
        normalizeText(job.description).includes(normalizeText(searchTerm)) ||
        normalizeText(job.companyId?.companyName).includes(normalizeText(searchTerm)) ||
        normalizeList(job.skills).some((skill) =>
          normalizeText(skill).includes(normalizeText(searchTerm))
        );

      const matchesLocation = !location || job.location === location;

      const matchesType = !jobType || job.type === jobType;
      const matchesCategory = !selectedCategory || job.title === selectedCategory;

      return matchesSearch && matchesLocation && matchesType && matchesCategory;
    });
  }, [internships, jobType, location, searchTerm, selectedCategory]);

  const handleApply = async (internshipId) => {
    if (!token || !studentId) {
      navigate("/login/student");
      return;
    }

    try {
      setApplyingId(internshipId);
      setNotice("");

      const response = await axios.post(
        APPLICATION_API_URL,
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

      setAppliedIds((current) =>
        current.includes(internshipId) ? current : [...current, internshipId]
      );
      setNotice(response.data?.message || "Application submitted successfully");
    } catch (err) {
      if (isStudentAuthError(err)) {
        logoutStudent();
        setNotice("Your student session expired. Please log in again.");
        navigate("/login/student");
        return;
      }

      setNotice(err.response?.data?.message || "Failed to apply for internship");
    } finally {
      setApplyingId("");
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.18),_transparent_35%),linear-gradient(135deg,_#eef2ff_0%,_#f8fafc_45%,_#fdf2f8_100%)] font-sans dark:bg-[radial-gradient(circle_at_top,_rgba(168,85,247,0.22),_transparent_30%),linear-gradient(135deg,_#140f23_0%,_#1b1530_48%,_#221735_100%)]">
      <div className="mx-auto max-w-7xl px-4 pb-12 pt-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-indigo-500 dark:text-violet-300">
              Search Jobs
            </p>
            <h1 className="mt-3 text-4xl font-black text-slate-900 dark:text-violet-50">
              Explore all company internship posts
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500 dark:text-slate-300">
               Search all verified company posts by role, company, skill, location, and job type, then apply directly from this page.
            </p>
          </div>

          <button
            onClick={() => navigate("/student/dashboard")}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 dark:border-violet-500/20 dark:bg-slate-900/80 dark:text-violet-100"
          >
            <FaArrowLeft />
            Back to Dashboard
          </button>
        </div>

        {notice && (
          <div className="mb-6 rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm font-medium text-indigo-700 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-100">
            {notice}
          </div>
        )}

        <div className="mb-8 overflow-hidden rounded-[36px] border border-violet-100/80 bg-[linear-gradient(135deg,_#ede9fe_0%,_#f5f3ff_42%,_#faf5ff_100%)] text-slate-900 shadow-[0_35px_100px_rgba(139,92,246,0.14)] dark:border-violet-500/20 dark:bg-[linear-gradient(135deg,_rgba(45,27,78,0.98)_0%,_rgba(58,36,98,0.96)_45%,_rgba(68,41,110,0.94)_100%)] dark:text-violet-50 dark:shadow-[0_35px_100px_rgba(76,29,149,0.35)]">
          <div className="grid gap-8 p-8 xl:grid-cols-[1.15fr_0.85fr] xl:p-10">
            <div>
              <p className="inline-flex rounded-full border border-violet-200 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-violet-700 dark:border-violet-400/20 dark:bg-white/10 dark:text-violet-200">
                 Smart Search
              </p>
              <h2 className="mt-6 text-3xl font-black leading-tight">
                Search all available internships in one place
              </h2>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-600 dark:text-violet-100/80">
                Students can browse every verified company post here and apply directly without leaving the search page.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                {suggestedFilters.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      if (["Remote", "Hybrid", "Part-time", "Full-time"].includes(item)) {
                        setJobType(item);
                        return;
                      }

                      if (DISTRICTS.includes(item)) {
                        setLocation(item);
                        return;
                      }

                      setSearchTerm(item);
                    }}
                    className="rounded-full border border-violet-500 bg-violet-600 px-4 py-2 text-sm font-bold text-white shadow-[0_10px_25px_rgba(139,92,246,0.28)] transition hover:-translate-y-0.5 hover:bg-violet-700 dark:border-fuchsia-400 dark:bg-fuchsia-500 dark:text-slate-950 dark:shadow-[0_10px_25px_rgba(217,70,239,0.28)] dark:hover:bg-fuchsia-400"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-[32px] border border-violet-200/80 bg-white/75 p-6 backdrop-blur dark:border-violet-400/15 dark:bg-slate-950/35">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-xl text-white shadow-lg">
                  <FaFilter />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-500 dark:text-violet-200/70">
                    Search Filters
                  </p>
                  <h3 className="mt-1 text-xl font-bold text-slate-900 dark:text-violet-50">
                    Internship filter panel
                  </h3>
                </div>
              </div>

              <div className="mt-6 grid gap-4">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by role, company, keyword, or skill"
                  className="w-full rounded-2xl border border-violet-200 bg-white px-4 py-3 text-slate-800 placeholder:text-slate-400 outline-none dark:border-violet-400/15 dark:bg-slate-900/80 dark:text-violet-50 dark:placeholder:text-slate-500"
                />
                <div className="grid gap-4 md:grid-cols-2">
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full rounded-2xl border border-violet-200 bg-white px-4 py-3 text-slate-800 outline-none dark:border-violet-400/15 dark:bg-slate-900/80 dark:text-violet-50"
                  >
                    <option value="" className="text-slate-900">District</option>
                    {DISTRICTS.map((district) => (
                      <option key={district} value={district} className="text-slate-900">
                        {district}
                      </option>
                    ))}
                  </select>
                  <select
                    value={jobType}
                    onChange={(e) => setJobType(e.target.value)}
                    className="w-full rounded-2xl border border-violet-200 bg-white px-4 py-3 text-slate-800 outline-none dark:border-violet-400/15 dark:bg-slate-900/80 dark:text-violet-50"
                  >
                    <option value="" className="text-slate-900">Job Type</option>
                    <option value="Full-time" className="text-slate-900">Full-time</option>
                    <option value="Part-time" className="text-slate-900">Part-time</option>
                    <option value="Remote" className="text-slate-900">Remote</option>
                    <option value="Hybrid" className="text-slate-900">Hybrid</option>
                  </select>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full rounded-2xl border border-violet-200 bg-white px-4 py-3 text-slate-800 outline-none dark:border-violet-400/15 dark:bg-slate-900/80 dark:text-violet-50"
                  >
                    <option value="" className="text-slate-900">Relevant Field</option>
                    {PREFERRED_AREAS.map((area) => (
                      <option key={area} value={area} className="text-slate-900">
                        {area}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTerm("");
                      setLocation("");
                      setJobType("");
                      setSelectedCategory("");
                    }}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-3 text-sm font-semibold text-white transition hover:scale-[1.02]"
                  >
                    <FaMagnifyingGlass />
                    Reset Filters
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[32px] border border-slate-200/80 bg-white/88 p-6 shadow-[0_22px_60px_rgba(148,163,184,0.18)] backdrop-blur md:p-8 dark:border-violet-400/15 dark:bg-slate-950/45 dark:shadow-[0_22px_60px_rgba(17,24,39,0.45)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-indigo-500 dark:text-violet-300">
                Search Results
              </p>
              <h3 className="mt-3 text-3xl font-black text-slate-900 dark:text-violet-50">
                Verified company posts
              </h3>
            </div>
            <div className="rounded-2xl bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-600 dark:bg-violet-500/10 dark:text-violet-200">
              {filteredJobs.length} result{filteredJobs.length === 1 ? "" : "s"}
            </div>
          </div>

          {loading && (
            <div className="mt-8 rounded-[28px] border border-slate-200 bg-slate-50 p-5 text-sm text-slate-500 dark:border-violet-400/15 dark:bg-slate-900/60 dark:text-slate-300">
              Loading internships...
            </div>
          )}

          {!loading && error && (
            <div className="mt-8 rounded-[28px] border border-rose-200 bg-rose-50 p-5 text-sm text-rose-600 dark:border-rose-400/25 dark:bg-rose-500/10 dark:text-rose-200">
              {error}
            </div>
          )}

          {!loading && !error && filteredJobs.length === 0 && (
            <div className="mt-8 rounded-[28px] border border-slate-200 bg-slate-50 p-5 text-sm text-slate-500 dark:border-violet-400/15 dark:bg-slate-900/60 dark:text-slate-300">
              No internship posts matched your search filters.
            </div>
          )}

          {!loading && !error && filteredJobs.length > 0 && (
            <div className="mt-8 grid gap-5 lg:grid-cols-2">
              {filteredJobs.map((job) => (
                <div
                  key={job._id}
                  className="rounded-[28px] border border-violet-200 bg-gradient-to-br from-white via-violet-50 to-fuchsia-50 p-5 shadow-sm dark:border-violet-400/15 dark:bg-gradient-to-br dark:from-[#241638] dark:via-[#2d1c46] dark:to-[#321f4b]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 text-xl text-white">
                        {getThumbnail(job) ? (
                          <img
                            src={getThumbnail(job)}
                            alt={job.title || "Internship"}
                            className="h-full w-full object-cover"
                          />
                        ) : job.companyId?.logo ? (
                          <img
                            src={resolveUploadUrl(job.companyId.logo)}
                            alt={job.companyId?.companyName || "Company"}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <FaBriefcase />
                        )}
                      </div>

                      <div>
                        <h4 className="text-xl font-black text-slate-900 dark:text-violet-50">{job.title}</h4>
                        <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-300">
                          {job.companyId?.companyName || "Company"}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleApply(job._id)}
                      disabled={applyingId === job._id || appliedIds.includes(job._id)}
                      className="rounded-2xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 px-4 py-2 text-sm font-semibold text-white transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {appliedIds.includes(job._id)
                        ? "Already Applied"
                        : applyingId === job._id
                        ? "Applying..."
                        : "Apply Now"}
                    </button>
                  </div>

                  <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">
                    {job.description || "No description available"}
                  </p>

                  <div className="mt-5 grid gap-3 text-sm md:grid-cols-3">
                    <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-violet-400/15 dark:bg-slate-900/70">
                      <div className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">Location</div>
                      <div className="mt-1 flex items-center gap-2 font-semibold text-slate-800 dark:text-violet-50">
                        <FaLocationDot className="text-violet-500" />
                        {job.location || "N/A"}
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-violet-400/15 dark:bg-slate-900/70">
                      <div className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">Type</div>
                      <div className="mt-1 flex items-center gap-2 font-semibold text-slate-800 dark:text-violet-50">
                        <FaRegClock className="text-violet-500" />
                        {job.type || "N/A"}
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-violet-400/15 dark:bg-slate-900/70">
                      <div className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">Openings</div>
                      <div className="mt-1 flex items-center gap-2 font-semibold text-slate-800 dark:text-violet-50">
                        <FaUsers className="text-violet-500" />
                        {job.openings || 0}
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap gap-2">
                      {normalizeList(job.skills).length > 0 ? (
                        normalizeList(job.skills).map((skill) => (
                        <span
                          key={`${job._id}-${skill}`}
                          className="rounded-full border border-slate-300 bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 dark:border-violet-400/15 dark:bg-slate-900/80 dark:text-violet-100"
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-slate-500 dark:text-slate-400">No skills listed</span>
                    )}
                  </div>

                  <div className="inline-flex items-center gap-2 rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700 dark:bg-violet-500/15 dark:text-violet-100">
                      <FaBuilding />
                      Verified Post
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default S_SearchJobs;
