import React from "react";
import {
  FaArrowLeft,
  FaBriefcase,
  FaBuilding,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaUserCheck,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const statusCards = [
  {
    title: "Hired",
    value: "01",
    icon: <FaCheckCircle />,
    tone: "from-emerald-500 to-green-500",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
  },
  {
    title: "Pending",
    value: "03",
    icon: <FaClock />,
    tone: "from-amber-400 to-orange-500",
    bg: "bg-amber-50",
    text: "text-amber-700",
  },
  {
    title: "Shortlisted",
    value: "02",
    icon: <FaUserCheck />,
    tone: "from-cyan-500 to-sky-500",
    bg: "bg-cyan-50",
    text: "text-cyan-700",
  },
  {
    title: "Rejected",
    value: "01",
    icon: <FaTimesCircle />,
    tone: "from-rose-500 to-pink-500",
    bg: "bg-rose-50",
    text: "text-rose-700",
  },
];

const applications = [
  {
    role: "Frontend Intern",
    company: "Nova Labs",
    status: "Hired",
    statusTone: "bg-emerald-100 text-emerald-700",
    date: "Updated 2 days ago",
  },
  {
    role: "UI/UX Intern",
    company: "Pixel Forge",
    status: "Shortlisted",
    statusTone: "bg-cyan-100 text-cyan-700",
    date: "Updated 1 day ago",
  },
  {
    role: "Software Engineering Intern",
    company: "Bright Stack",
    status: "Pending",
    statusTone: "bg-amber-100 text-amber-700",
    date: "Updated today",
  },
  {
    role: "Web Developer Intern",
    company: "Code Harbor",
    status: "Rejected",
    statusTone: "bg-rose-100 text-rose-700",
    date: "Updated 3 days ago",
  },
];

function S_Applications() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.18),_transparent_35%),linear-gradient(135deg,_#eef2ff_0%,_#f8fafc_45%,_#fdf2f8_100%)] font-sans">
      <div className="mx-auto max-w-7xl px-4 pb-12 pt-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-indigo-500">
              Application Status
            </p>
            <h1 className="mt-3 text-4xl font-black text-slate-900">
              Track your internship application progress
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
              View hired, pending, shortlisted, and rejected application results in one modern status page.
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
                Student Status Overview
              </p>
              <h2 className="mt-6 text-3xl font-black leading-tight">
                A clear view of where each application stands
              </h2>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-300">
                This page is designed as a stylish overview for student application results, giving fast visibility into hiring progress and outcomes.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {statusCards.map((card) => (
                  <div
                    key={card.title}
                    className="rounded-[28px] border border-white/10 bg-white/8 p-5 backdrop-blur"
                  >
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${card.tone} text-xl text-white shadow-lg`}>
                      {card.icon}
                    </div>
                    <p className="mt-5 text-sm uppercase tracking-[0.22em] text-slate-400">
                      {card.title}
                    </p>
                    <p className="mt-2 text-4xl font-black text-white">{card.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[32px] border border-white/10 bg-white/8 p-6 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                Current Summary
              </p>
              <div className="mt-6 space-y-4">
                <div className="rounded-3xl bg-white/8 p-5">
                  <p className="text-sm text-slate-300">Most recent update</p>
                  <p className="mt-2 text-2xl font-black text-white">UI/UX Intern shortlisted</p>
                </div>
                <div className="rounded-3xl bg-white/8 p-5">
                  <p className="text-sm text-slate-300">Best progress</p>
                  <p className="mt-2 text-2xl font-black text-white">1 hired application</p>
                </div>
                <div className="rounded-3xl bg-white/8 p-5">
                  <p className="text-sm text-slate-300">Open applications</p>
                  <p className="mt-2 text-2xl font-black text-white">3 still active</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[32px] border border-slate-200/80 bg-white/88 p-6 shadow-[0_22px_60px_rgba(148,163,184,0.18)] backdrop-blur md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-indigo-500">
                Recent Applications
              </p>
              <h3 className="mt-3 text-3xl font-black text-slate-900">
                Application activity
              </h3>
            </div>
            <div className="rounded-2xl bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-600">
              UI only status view
            </div>
          </div>

          <div className="mt-8 grid gap-5">
            {applications.map((item) => (
              <div
                key={`${item.role}-${item.company}`}
                className="rounded-[28px] border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-indigo-50 p-5 shadow-sm"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-xl text-cyan-300">
                      <FaBriefcase />
                    </div>
                    <div>
                      <h4 className="text-xl font-black text-slate-900">{item.role}</h4>
                      <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-slate-500">
                        <span className="inline-flex items-center gap-2">
                          <FaBuilding className="text-indigo-500" />
                          {item.company}
                        </span>
                        <span>{item.date}</span>
                      </div>
                    </div>
                  </div>

                  <div className={`inline-flex rounded-full px-4 py-2 text-sm font-semibold ${item.statusTone}`}>
                    {item.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default S_Applications;
