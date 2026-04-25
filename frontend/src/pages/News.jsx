import React from 'react';
import {
  FaBriefcase,
  FaBuilding,
  FaFileCircleCheck,
  FaGraduationCap,
  FaRocket,
  FaStar,
} from 'react-icons/fa6';

const featureUpdates = [
  {
    title: 'Student Accounts and Profile Flow Updated',
    summary:
      'Students can now move through registration, dashboard access, profile creation, profile viewing, and CV-based job exploration with a clearer journey.',
    date: 'March 2026',
    icon: <FaGraduationCap />,
    accent: 'from-cyan-500 to-sky-500',
  },
  {
    title: 'Company Accounts and Internship Management Improved',
    summary:
      'Company users can register, log in, manage company profiles, post internships, review applicants, and organize hiring activity from one place.',
    date: 'March 2026',
    icon: <FaBuilding />,
    accent: 'from-indigo-500 to-violet-500',
  },
  {
    title: 'Pro Account and Payment Flow Highlighted',
    summary:
      'Relevant premium features such as pro account upgrades, payment upload flow, and advanced company access are now more clearly represented across the platform.',
    date: 'March 2026',
    icon: <FaStar />,
    accent: 'from-fuchsia-500 to-pink-500',
  },
];

const platformHighlights = [
  {
    icon: <FaFileCircleCheck />,
    title: 'Profile and CV Management',
    text: 'Students can maintain profile details, upload CVs, and use that information as a base for better internship visibility.',
  },
  {
    icon: <FaBriefcase />,
    title: 'Internship and Application Tracking',
    text: 'The system supports internship posting, job exploration, application review, and progress tracking in one connected workflow.',
  },
  {
    icon: <FaRocket />,
    title: 'Recommendation and Matching Experience',
    text: 'The platform includes recommendation-oriented experiences for both students and companies, helping connect profiles with relevant opportunities.',
  },
];

const News = () => {
  return (
    <section className="min-h-[70vh] bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.18),_transparent_22%),radial-gradient(circle_at_bottom_right,_rgba(99,102,241,0.18),_transparent_26%),linear-gradient(180deg,_#ecfeff_0%,_#f8fafc_44%,_#eef2ff_100%)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.14),_transparent_24%),radial-gradient(circle_at_bottom_right,_rgba(99,102,241,0.14),_transparent_26%),linear-gradient(180deg,_#020617_0%,_#0f172a_52%,_#111827_100%)]">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-slate-950 text-white shadow-[0_35px_100px_rgba(15,23,42,0.2)]">
          <div className="absolute inset-0 opacity-80">
            <div className="absolute -left-16 top-10 h-56 w-56 rounded-full bg-cyan-400/20 blur-3xl" />
            <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />
            <div className="absolute bottom-0 left-1/3 h-44 w-44 rounded-full bg-fuchsia-400/20 blur-3xl" />
          </div>

          <div className="relative grid gap-8 px-8 py-10 lg:grid-cols-[1.15fr_0.85fr] lg:px-10 lg:py-12">
            <div>
              <p className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">
                News and Updates
              </p>
              <h1 className="mt-6 text-4xl font-black leading-tight md:text-5xl">
                Latest platform updates from INTERNIX
              </h1>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300 dark:text-slate-300">
                Follow the latest improvements across student accounts, company accounts, internship workflows, profile management, and pro account related features.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-[1.75rem] border border-white/12 bg-white/8 p-6 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.24em] text-cyan-200">Focus Area</p>
                <p className="mt-3 text-3xl font-black text-white">Companies pro features</p>
              </div>
              <div className="rounded-[1.75rem] border border-white/12 bg-white/8 p-6 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.24em] text-cyan-200">Platform Direction</p>
                <p className="mt-3 text-3xl font-black text-white">Clearer workflows and better visibility</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {featureUpdates.map((item) => (
            <article
              key={item.title}
              className="rounded-[1.8rem] border border-slate-200/80 bg-white/88 p-7 shadow-[0_22px_60px_rgba(148,163,184,0.18)] backdrop-blur transition hover:-translate-y-1 hover:shadow-[0_28px_80px_rgba(79,70,229,0.14)] dark:border-slate-700/80 dark:bg-slate-900/78 dark:shadow-[0_22px_60px_rgba(15,23,42,0.5)] dark:hover:shadow-[0_28px_80px_rgba(8,47,73,0.46)]"
            >
              <div className="flex items-center justify-between gap-4">
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${item.accent} text-2xl text-white shadow-lg`}>
                  {item.icon}
                </div>
                <p className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                  {item.date}
                </p>
              </div>
              <h2 className="mt-5 text-2xl font-black text-slate-900 dark:text-white">{item.title}</h2>
              <p className="mt-4 text-base leading-8 text-slate-600 dark:text-slate-300">
                {item.summary}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-8 rounded-[2rem] border border-slate-200/80 bg-white/88 p-8 shadow-[0_22px_60px_rgba(148,163,184,0.18)] backdrop-blur md:p-10 dark:border-slate-700/80 dark:bg-slate-900/78 dark:shadow-[0_22px_60px_rgba(15,23,42,0.5)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-indigo-500 dark:text-cyan-300">
                Feature Overview
              </p>
              <h2 className="mt-4 text-3xl font-black text-slate-900 md:text-4xl dark:text-white">
                What this system currently supports
              </h2>
            </div>
            <div className="rounded-2xl bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-600 dark:bg-cyan-400/10 dark:text-cyan-200">
              Relevant platform details
            </div>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {platformHighlights.map((item) => (
              <div
                key={item.title}
                className="rounded-[1.6rem] border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-cyan-50 p-6 dark:border-slate-700 dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-900 dark:to-slate-800/85"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-2xl text-cyan-300 dark:bg-cyan-400/10 dark:text-cyan-200">
                  {item.icon}
                </div>
                <h3 className="mt-5 text-xl font-black text-slate-900 dark:text-white">{item.title}</h3>
                <p className="mt-4 text-base leading-8 text-slate-600 dark:text-slate-300">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default News;
