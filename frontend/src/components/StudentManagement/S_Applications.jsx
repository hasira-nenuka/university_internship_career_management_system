import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
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
import { resolveUploadUrl } from "./uploadUrl";

const APPLICATIONS_API_URL = "http://localhost:5000/api/applications";

const statusConfig = {
  hired: {
    title: "Hired",
    icon: <FaCheckCircle />,
    tone: "from-emerald-500 to-green-500",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200",
  },
  pending: {
    title: "Pending",
    icon: <FaClock />,
    tone: "from-amber-400 to-orange-500",
    bg: "bg-amber-50",
    text: "text-amber-700",
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-200",
  },
  shortlisted: {
    title: "Shortlisted",
    icon: <FaUserCheck />,
    tone: "from-cyan-500 to-sky-500",
    bg: "bg-cyan-50",
    text: "text-cyan-700",
    badge: "bg-cyan-100 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-200",
  },
  rejected: {
    title: "Rejected",
    icon: <FaTimesCircle />,
    tone: "from-rose-500 to-pink-500",
    bg: "bg-rose-50",
    text: "text-rose-700",
    badge: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-200",
  },
  reviewed: {
    title: "Reviewed",
    icon: <FaUserCheck />,
    tone: "from-indigo-500 to-violet-500",
    bg: "bg-indigo-50",
    text: "text-indigo-700",
    badge: "bg-indigo-100 text-indigo-700 dark:bg-violet-500/15 dark:text-violet-200",
  },
};

function S_Applications() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");
  const studentAccount = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("studentAccount")) || null;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    const loadApplications = async () => {
      if (!token || !studentAccount?._id) {
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `${APPLICATIONS_API_URL}/student/${studentAccount._id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setApplications(Array.isArray(response.data?.data) ? response.data.data : []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load application status");
      } finally {
        setLoading(false);
      }
    };

    loadApplications();
  }, [studentAccount?._id, token]);

  const statusCards = useMemo(() => {
    const counts = applications.reduce(
      (acc, app) => {
        const key = app.displayStatus || app.status || "pending";
        if (acc[key] !== undefined) acc[key] += 1;
        return acc;
      },
      { hired: 0, pending: 0, shortlisted: 0, rejected: 0 }
    );

    return ["hired", "pending", "shortlisted", "rejected"].map((key) => ({
      ...statusConfig[key],
      value: String(counts[key]).padStart(2, "0"),
    }));
  }, [applications]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.18),_transparent_35%),linear-gradient(135deg,_#eef2ff_0%,_#f8fafc_45%,_#fdf2f8_100%)] font-sans dark:bg-[radial-gradient(circle_at_top,_rgba(168,85,247,0.22),_transparent_30%),linear-gradient(135deg,_#140f23_0%,_#1b1530_48%,_#221735_100%)]">
      <div className="mx-auto max-w-7xl px-4 pb-12 pt-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-indigo-500 dark:text-violet-300">
              Application Status
            </p>
            <h1 className="mt-3 text-4xl font-black text-slate-900 dark:text-violet-50">
              Track your internship application progress
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500 dark:text-slate-300">
              View real application updates from companies including pending, shortlisted, hired, and rejected statuses.
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

        <div className="mb-8 overflow-hidden rounded-[36px] border border-violet-100/80 bg-[linear-gradient(135deg,_#ede9fe_0%,_#f5f3ff_42%,_#faf5ff_100%)] text-slate-900 shadow-[0_35px_100px_rgba(139,92,246,0.14)] dark:border-violet-500/20 dark:bg-[linear-gradient(135deg,_rgba(45,27,78,0.98)_0%,_rgba(58,36,98,0.96)_45%,_rgba(68,41,110,0.94)_100%)] dark:text-violet-50 dark:shadow-[0_35px_100px_rgba(76,29,149,0.35)]">
          <div className="grid gap-8 p-8 xl:grid-cols-[1.15fr_0.85fr] xl:p-10">
            <div>
              <p className="inline-flex rounded-full border border-violet-200 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-violet-700 dark:border-violet-400/20 dark:bg-white/10 dark:text-violet-200">
                Student Status Overview
              </p>
              <h2 className="mt-6 text-3xl font-black leading-tight">
                A clear view of where each application stands
              </h2>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-600 dark:text-violet-100/80">
                This page reads your real company responses so you can track progress after applying.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {statusCards.map((card) => (
                  <div
                    key={card.title}
                    className="rounded-[28px] border border-violet-200 bg-white/80 p-5 backdrop-blur dark:border-violet-400/15 dark:bg-slate-950/35"
                  >
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${card.tone} text-xl text-white shadow-lg`}>
                      {card.icon}
                    </div>
                    <p className="mt-5 text-sm uppercase tracking-[0.22em] text-slate-500 dark:text-violet-200/70">
                      {card.title}
                    </p>
                    <p className="mt-2 text-4xl font-black text-slate-900 dark:text-violet-50">{card.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[32px] border border-violet-200/80 bg-white/75 p-6 backdrop-blur dark:border-violet-400/15 dark:bg-slate-950/35">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500 dark:text-violet-200/70">
                Current Summary
              </p>
              <div className="mt-6 space-y-4">
                <div className="rounded-3xl bg-white/80 p-5 dark:bg-slate-900/65">
                  <p className="text-sm text-slate-500 dark:text-violet-100/70">Most recent update</p>
                  <p className="mt-2 text-2xl font-black text-slate-900 dark:text-violet-50">
                    {applications[0]
                      ? `${applications[0].internshipTitle || "Application"} ${applications[0].displayStatus || applications[0].status}`
                      : "No updates yet"}
                  </p>
                </div>
                <div className="rounded-3xl bg-white/80 p-5 dark:bg-slate-900/65">
                  <p className="text-sm text-slate-500 dark:text-violet-100/70">Best progress</p>
                  <p className="mt-2 text-2xl font-black text-slate-900 dark:text-violet-50">
                    {statusCards[0].value} hired application{statusCards[0].value === "01" ? "" : "s"}
                  </p>
                </div>
                <div className="rounded-3xl bg-white/80 p-5 dark:bg-slate-900/65">
                  <p className="text-sm text-slate-500 dark:text-violet-100/70">Open applications</p>
                  <p className="mt-2 text-2xl font-black text-slate-900 dark:text-violet-50">
                    {applications.filter((app) => ["pending", "reviewed", "shortlisted"].includes(app.status)).length} still active
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[32px] border border-slate-200/80 bg-white/88 p-6 shadow-[0_22px_60px_rgba(148,163,184,0.18)] backdrop-blur md:p-8 dark:border-violet-400/15 dark:bg-slate-950/45 dark:shadow-[0_22px_60px_rgba(17,24,39,0.45)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-indigo-500 dark:text-violet-300">
                Recent Applications
              </p>
              <h3 className="mt-3 text-3xl font-black text-slate-900 dark:text-violet-50">
                Application activity
              </h3>
            </div>
            <div className="rounded-2xl bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-600 dark:bg-violet-500/10 dark:text-violet-200">
              {applications.length} application{applications.length === 1 ? "" : "s"}
            </div>
          </div>

          {loading && (
            <div className="mt-8 rounded-[28px] border border-slate-200 bg-slate-50 p-5 text-sm text-slate-500 dark:border-violet-400/15 dark:bg-slate-900/60 dark:text-slate-300">
              Loading application status...
            </div>
          )}

          {!loading && error && (
            <div className="mt-8 rounded-[28px] border border-rose-200 bg-rose-50 p-5 text-sm text-rose-600 dark:border-rose-400/25 dark:bg-rose-500/10 dark:text-rose-200">
              {error}
            </div>
          )}

          {!loading && !error && applications.length === 0 && (
            <div className="mt-8 rounded-[28px] border border-slate-200 bg-slate-50 p-5 text-sm text-slate-500 dark:border-violet-400/15 dark:bg-slate-900/60 dark:text-slate-300">
              No applications submitted yet.
            </div>
          )}

          {!loading && !error && applications.length > 0 && (
            <div className="mt-8 grid gap-5">
            {applications.map((item) => {
              const displayStatus = item.displayStatus || item.status || "pending";
              const statusTone = statusConfig[displayStatus]?.badge || "bg-slate-100 text-slate-700";

              return (
              <div
                key={item._id}
                className="rounded-[28px] border border-violet-200 bg-gradient-to-br from-white via-violet-50 to-fuchsia-50 p-5 shadow-sm dark:border-violet-400/15 dark:bg-gradient-to-br dark:from-[#241638] dark:via-[#2d1c46] dark:to-[#321f4b]"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 text-xl text-white">
                      {item.companyLogo ? (
                        <img
                          src={resolveUploadUrl(item.companyLogo)}
                          alt={item.companyName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <FaBriefcase />
                      )}
                    </div>
                    <div>
                      <h4 className="text-xl font-black text-slate-900 dark:text-violet-50">{item.internshipTitle}</h4>
                      <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-300">
                        <span className="inline-flex items-center gap-2">
                          <FaBuilding className="text-violet-500" />
                          {item.companyName}
                        </span>
                        <span>
                          Applied {new Date(item.appliedAt || item.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className={`inline-flex rounded-full px-4 py-2 text-sm font-semibold capitalize ${statusTone}`}>
                    {displayStatus}
                  </div>
                </div>
              </div>
            );
            })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default S_Applications;
