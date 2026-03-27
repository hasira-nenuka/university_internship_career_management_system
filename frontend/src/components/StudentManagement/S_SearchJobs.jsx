import React from "react";
import {
  FaArrowLeft,
  FaBriefcase,
  FaFilter,
  FaLocationDot,
  FaMagnifyingGlass,
  FaRegClock,
} from "react-icons/fa6";
import { useNavigate } from "react-router-dom";

const suggestedFilters = [
  "Frontend",
  "Backend",
  "UI/UX",
  "Remote",
  "Colombo",
  "Part Time",
];

const jobs = [
  {
    title: "Frontend Intern",
    company: "Nova Labs",
    location: "Colombo",
    type: "Full Time",
    category: "Web Development",
  },
  {
    title: "UI/UX Intern",
    company: "Pixel Forge",
    location: "Kandy",
    type: "Hybrid",
    category: "Design",
  },
  {
    title: "Software Engineering Intern",
    company: "Bright Stack",
    location: "Remote",
    type: "Part Time",
    category: "Engineering",
  },
];

function S_SearchJobs() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.18),_transparent_35%),linear-gradient(135deg,_#eef2ff_0%,_#f8fafc_45%,_#fdf2f8_100%)] font-sans">
      <div className="mx-auto max-w-7xl px-4 pb-12 pt-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-indigo-500">
              Search Jobs
            </p>
            <h1 className="mt-3 text-4xl font-black text-slate-900">
              Explore internships with focused search filters
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
              This page opens after clicking the dashboard search jobs box and is designed as a clean UI for filtering internship opportunities.
            </p>
          </div>

          <button
            onClick={() => navigate("/student/dashboard")}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5"
          >
            <FaArrowLeft />
            Back to Dashboard
          </button>
        </div>

        <div className="mb-8 overflow-hidden rounded-[36px] border border-white/70 bg-slate-950 text-white shadow-[0_35px_100px_rgba(15,23,42,0.2)]">
          <div className="grid gap-8 p-8 xl:grid-cols-[1.15fr_0.85fr] xl:p-10">
            <div>
              <p className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">
                Smart Search
              </p>
              <h2 className="mt-6 text-3xl font-black leading-tight">
                Find internships by location, type, and career focus
              </h2>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-300">
                Use filters to quickly narrow internship results. This UI is prepared for search functionality later, while already giving a clear modern layout.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                {suggestedFilters.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-white/12 bg-white/10 px-4 py-2 text-sm font-semibold text-white"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-[32px] border border-white/10 bg-white/8 p-6 backdrop-blur">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-indigo-500 text-xl text-white shadow-lg">
                  <FaFilter />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                    Search Filters
                  </p>
                  <h3 className="mt-1 text-xl font-bold text-white">
                    Internship filter panel
                  </h3>
                </div>
              </div>

              <div className="mt-6 grid gap-4">
                <input
                  type="text"
                  placeholder="Search by role or keyword"
                  className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder:text-slate-400 outline-none"
                />
                <div className="grid gap-4 md:grid-cols-2">
                  <input
                    type="text"
                    placeholder="Location"
                    className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder:text-slate-400 outline-none"
                  />
                  <select className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none">
                    <option className="text-slate-900">Job Type</option>
                    <option className="text-slate-900">Full Time</option>
                    <option className="text-slate-900">Part Time</option>
                    <option className="text-slate-900">Remote</option>
                    <option className="text-slate-900">Hybrid</option>
                  </select>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <select className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none">
                    <option className="text-slate-900">Category</option>
                    <option className="text-slate-900">Web Development</option>
                    <option className="text-slate-900">Software Engineering</option>
                    <option className="text-slate-900">UI/UX</option>
                    <option className="text-slate-900">Data</option>
                  </select>
                  <select className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none">
                    <option className="text-slate-900">Experience Level</option>
                    <option className="text-slate-900">Entry</option>
                    <option className="text-slate-900">Intermediate</option>
                  </select>
                </div>

                <button className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:scale-[1.02]">
                  <FaMagnifyingGlass />
                  Search Jobs
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[32px] border border-slate-200/80 bg-white/88 p-6 shadow-[0_22px_60px_rgba(148,163,184,0.18)] backdrop-blur md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-indigo-500">
                Search Results
              </p>
              <h3 className="mt-3 text-3xl font-black text-slate-900">
                Suggested internships
              </h3>
            </div>
            <div className="rounded-2xl bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-600">
              UI only search page
            </div>
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {jobs.map((job) => (
              <div
                key={`${job.title}-${job.company}`}
                className="rounded-[28px] border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-indigo-50 p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-xl text-cyan-300">
                    <FaBriefcase />
                  </div>
                  <span className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-semibold text-cyan-700">
                    {job.category}
                  </span>
                </div>

                <h4 className="mt-5 text-xl font-black text-slate-900">{job.title}</h4>
                <p className="mt-1 text-sm font-medium text-slate-500">{job.company}</p>

                <div className="mt-5 space-y-2 text-sm text-slate-500">
                  <div className="flex items-center gap-2">
                    <FaLocationDot className="text-indigo-500" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaRegClock className="text-indigo-500" />
                    <span>{job.type}</span>
                  </div>
                </div>

                <button className="mt-6 w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 py-3 text-sm font-semibold text-white transition hover:scale-[1.02]">
                  View Details
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default S_SearchJobs;
