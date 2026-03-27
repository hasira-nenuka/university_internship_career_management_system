import React from "react";
import {
  FaArrowLeft,
  FaBriefcase,
  FaMapMarkerAlt,
  FaRegClock,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const recommendationMetrics = [
  { label: "Skill Match", value: 84 },
  { label: "Profile Strength", value: 76 },
  { label: "Interview Readiness", value: 68 },
  { label: "ATS Visibility", value: 72 },
];

const recommendationBreakdown = [
  { label: "Technical Skills", value: 42, color: "#4F46E5" },
  { label: "Experience", value: 28, color: "#0EA5E9" },
  { label: "Projects", value: 18, color: "#F97316" },
  { label: "Communication", value: 12, color: "#A855F7" },
];

const recommendedJobs = [
  {
    title: "Frontend Intern",
    company: "Nova Labs",
    location: "Colombo",
    type: "Full Time",
    score: "92% Match",
  },
  {
    title: "UI Engineering Intern",
    company: "Pixel Forge",
    location: "Kandy",
    type: "Hybrid",
    score: "88% Match",
  },
  {
    title: "Web Development Intern",
    company: "Bright Stack",
    location: "Galle",
    type: "Remote",
    score: "81% Match",
  },
];

function ScoreRing({ value, label }) {
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const progress = (value / 100) * circumference;

  return (
    <div className="rounded-[28px] border border-slate-200/80 bg-white/70 p-5 backdrop-blur dark:border-white/10 dark:bg-white/6">
      <div className="mb-4 flex items-center justify-center">
        <div className="relative flex h-28 w-28 items-center justify-center">
          <svg className="-rotate-90 h-28 w-28" viewBox="0 0 80 80">
            <circle
              cx="40"
              cy="40"
              r={radius}
              fill="none"
              stroke="rgba(255,255,255,0.14)"
              strokeWidth="8"
            />
            <circle
              cx="40"
              cy="40"
              r={radius}
              fill="none"
              stroke="url(#jobsScoreRingGradient)"
              strokeLinecap="round"
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - progress}
            />
            <defs>
              <linearGradient id="jobsScoreRingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#67E8F9" />
                <stop offset="50%" stopColor="#818CF8" />
                <stop offset="100%" stopColor="#E879F9" />
              </linearGradient>
            </defs>
          </svg>
          <span className="absolute text-2xl font-black text-slate-900 dark:text-white">{value}%</span>
        </div>
      </div>
      <p className="text-center text-sm font-semibold tracking-wide text-slate-700 dark:text-white">{label}</p>
    </div>
  );
}

function S_JobsAnalysis() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.18),_transparent_35%),linear-gradient(135deg,_#eef2ff_0%,_#f8fafc_45%,_#fdf2f8_100%)] font-sans dark:bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.12),_transparent_35%),linear-gradient(135deg,_#020617_0%,_#0f172a_45%,_#111827_100%)]">
      <div className="mx-auto max-w-7xl px-4 pb-12 pt-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-indigo-500 dark:text-cyan-300">
              View Jobs
            </p>
            <h1 className="mt-3 text-4xl font-black text-slate-900 dark:text-white">
              CV analysis and recommended jobs
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500 dark:text-slate-300">
              This page opens after clicking the dashboard `View Jobs` action and shows the detailed recommendation UI.
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

        <div className="mb-10 overflow-hidden rounded-[36px] border border-slate-200/80 bg-white/90 text-slate-900 shadow-[0_35px_100px_rgba(148,163,184,0.22)] dark:border-white/10 dark:bg-slate-950 dark:text-white dark:shadow-[0_35px_100px_rgba(15,23,42,0.45)]">
          <div className="grid gap-10 p-8 xl:grid-cols-[1.05fr_1.15fr] xl:p-10">
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-indigo-500 dark:text-cyan-300">
                    CV Analysis
                  </p>
                  <h2 className="mt-3 text-3xl font-black leading-tight">
                    Recommendation insights for your next internship move
                  </h2>
                </div>
                <div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600 dark:border-white/15 dark:bg-white/10 dark:text-slate-200">
                  Updated from student CV
                </div>
              </div>

              <p className="max-w-xl text-sm leading-7 text-slate-600 dark:text-slate-300">
                Your CV is visualized here as a modern recommendation page with match scores, circular metrics, and a clear view of likely job fits.
              </p>

              <div className="grid gap-4 sm:grid-cols-2">
                {recommendationMetrics.map((item) => (
                  <ScoreRing key={item.label} value={item.value} label={item.label} />
                ))}
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-3xl border border-cyan-300/30 bg-cyan-50 p-4 dark:border-cyan-400/20 dark:bg-cyan-400/10">
                  <p className="text-xs uppercase tracking-[0.24em] text-cyan-700 dark:text-cyan-200">Best Match</p>
                  <p className="mt-3 text-2xl font-black text-slate-900 dark:text-white">UI Engineer Intern</p>
                </div>
                <div className="rounded-3xl border border-fuchsia-300/30 bg-fuchsia-50 p-4 dark:border-fuchsia-400/20 dark:bg-fuchsia-400/10">
                  <p className="text-xs uppercase tracking-[0.24em] text-fuchsia-700 dark:text-fuchsia-200">Recommended Jobs</p>
                  <p className="mt-3 text-2xl font-black text-slate-900 dark:text-white">12 Openings</p>
                </div>
                <div className="rounded-3xl border border-emerald-300/30 bg-emerald-50 p-4 dark:border-emerald-400/20 dark:bg-emerald-400/10">
                  <p className="text-xs uppercase tracking-[0.24em] text-emerald-700 dark:text-emerald-200">Next Step</p>
                  <p className="mt-3 text-2xl font-black text-slate-900 dark:text-white">Apply Jobs</p>
                </div>
              </div>
            </div>

            <div className="rounded-[32px] border border-slate-200/80 bg-white/80 p-6 backdrop-blur dark:border-white/10 dark:bg-white/5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                    Analysis Details
                  </p>
                  <h3 className="mt-2 text-xl font-bold text-slate-900 dark:text-white">
                    CV match breakdown
                  </h3>
                </div>
                <div className="rounded-2xl bg-emerald-400/15 px-3 py-2 text-sm font-semibold text-emerald-300">
                  79% overall fit
                </div>
              </div>

              <div className="mt-8 flex justify-center">
                <div className="relative h-72 w-72">
                  <svg viewBox="0 0 160 160" className="h-full w-full">
                    <circle cx="80" cy="80" r="56" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="24" />
                    <circle
                      cx="80"
                      cy="80"
                      r="56"
                      fill="none"
                      stroke="#4F46E5"
                      strokeWidth="24"
                      strokeDasharray="147.78 351.87"
                      strokeLinecap="round"
                      transform="rotate(-90 80 80)"
                    />
                    <circle
                      cx="80"
                      cy="80"
                      r="56"
                      fill="none"
                      stroke="#0EA5E9"
                      strokeWidth="24"
                      strokeDasharray="98.52 401.13"
                      strokeDashoffset="-155"
                      strokeLinecap="round"
                      transform="rotate(-90 80 80)"
                    />
                    <circle
                      cx="80"
                      cy="80"
                      r="56"
                      fill="none"
                      stroke="#F97316"
                      strokeWidth="24"
                      strokeDasharray="63.33 436.32"
                      strokeDashoffset="-259"
                      strokeLinecap="round"
                      transform="rotate(-90 80 80)"
                    />
                    <circle
                      cx="80"
                      cy="80"
                      r="56"
                      fill="none"
                      stroke="#A855F7"
                      strokeWidth="24"
                      strokeDasharray="42.22 457.43"
                      strokeDashoffset="-328"
                      strokeLinecap="round"
                      transform="rotate(-90 80 80)"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-5xl font-black text-slate-900 dark:text-white">79%</span>
                    <span className="mt-2 text-center text-xs uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">
                      Recommendation Score
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {recommendationBreakdown.map((item) => (
                  <div key={item.label} className="rounded-2xl bg-slate-100 px-4 py-3 dark:bg-white/5">
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <div className="flex items-center gap-3">
                        <span
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-slate-700 dark:text-slate-200">{item.label}</span>
                      </div>
                      <span className="font-semibold text-slate-900 dark:text-white">{item.value}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-200 dark:bg-white/10">
                      <div
                        className="h-2 rounded-full"
                        style={{
                          width: `${item.value}%`,
                          backgroundColor: item.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[32px] border border-slate-200/70 bg-white/85 p-6 shadow-[0_20px_60px_rgba(148,163,184,0.18)] backdrop-blur-xl dark:border-slate-700/80 dark:bg-slate-900/78 dark:shadow-[0_20px_60px_rgba(15,23,42,0.5)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-indigo-500 dark:text-cyan-300">
                Recommended Jobs
              </p>
              <h3 className="mt-3 text-2xl font-black text-slate-900 dark:text-white">
                Matched opportunities for you
              </h3>
            </div>
            <div className="rounded-2xl bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-600">
              UI Only
            </div>
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-3">
            {recommendedJobs.map((job) => (
              <div
                key={job.title}
                className="rounded-[28px] border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-indigo-50 p-5 shadow-sm dark:border-slate-700 dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-900 dark:to-slate-800"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="rounded-2xl bg-slate-900 p-3 text-white dark:bg-slate-700">
                    <FaBriefcase />
                  </div>
                  <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
                    {job.score}
                  </div>
                </div>
                <h4 className="mt-5 text-xl font-bold text-slate-900 dark:text-white">{job.title}</h4>
                <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-300">{job.company}</p>
                <div className="mt-5 space-y-2 text-sm text-slate-500 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <FaMapMarkerAlt className="text-indigo-500" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaRegClock className="text-indigo-500" />
                    <span>{job.type}</span>
                  </div>
                </div>
                <button className="mt-6 w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 py-3 text-sm font-semibold text-white transition hover:scale-[1.02]">
                  Apply Now
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default S_JobsAnalysis;
