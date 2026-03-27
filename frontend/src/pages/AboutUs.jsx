import React from 'react';
import {
  FaArrowTrendUp,
  FaBriefcase,
  FaClipboardCheck,
  FaGraduationCap,
  FaUsers,
} from 'react-icons/fa6';

const highlights = [
  {
    icon: <FaUsers />,
    title: 'Why INTERNIX',
    text: 'We understand that internships play a vital role in shaping future professionals. That is why INTERNIX focuses on creating a seamless experience for both administrators and interns.',
    accent: 'from-cyan-500 to-sky-500',
  },
  {
    icon: <FaClipboardCheck />,
    title: 'What We Simplify',
    text: 'From assigning tasks and monitoring progress to maintaining records and generating reports, our system ensures efficiency, transparency, and productivity at every stage.',
    accent: 'from-indigo-500 to-violet-500',
  },
];

const values = [
  {
    icon: <FaBriefcase />,
    label: 'Centralized Management',
  },
  {
    icon: <FaArrowTrendUp />,
    label: 'Transparent Progress',
  },
  {
    icon: <FaGraduationCap />,
    label: 'Talent Development',
  },
];

const AboutUs = () => {
  return (
    <section className="min-h-[80vh] bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.16),_transparent_22%),radial-gradient(circle_at_bottom_right,_rgba(99,102,241,0.18),_transparent_26%),linear-gradient(180deg,_#ecfeff_0%,_#f8fafc_42%,_#eef2ff_100%)]">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-slate-950 text-white shadow-[0_35px_100px_rgba(15,23,42,0.2)]">
          <div className="absolute inset-0 opacity-80">
            <div className="absolute -left-16 top-10 h-56 w-56 rounded-full bg-cyan-400/20 blur-3xl" />
            <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />
            <div className="absolute bottom-0 left-1/3 h-44 w-44 rounded-full bg-fuchsia-400/20 blur-3xl" />
          </div>

          <div className="relative grid gap-8 px-8 py-10 lg:grid-cols-[1.2fr_0.8fr] lg:px-10 lg:py-12">
            <div>
              <p className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">
                About Us - INTERNIX
              </p>
              <h1 className="mt-6 text-4xl font-black leading-tight md:text-5xl">
                Building smarter internship journeys
              </h1>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">
                At INTERNIX, we are dedicated to transforming the way organizations manage and engage with interns. Our platform is designed to simplify internship management by providing a centralized system that streamlines recruitment, onboarding, tracking, and performance evaluation.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                {values.map((item) => (
                  <div
                    key={item.label}
                    className="inline-flex items-center gap-3 rounded-2xl border border-white/12 bg-white/8 px-4 py-3 text-sm font-semibold text-white backdrop-blur"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/12 text-cyan-200">
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-[1.75rem] border border-white/12 bg-white/8 p-6 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.24em] text-cyan-200">Platform Focus</p>
                <p className="mt-3 text-3xl font-black text-white">End-to-end internship support</p>
              </div>
              <div className="rounded-[1.75rem] border border-white/12 bg-white/8 p-6 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.24em] text-cyan-200">Core Outcome</p>
                <p className="mt-3 text-3xl font-black text-white">Efficiency, transparency, productivity</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {highlights.map((item) => (
            <article
              key={item.title}
              className="rounded-[1.75rem] border border-slate-200/80 bg-white/85 p-7 shadow-[0_22px_60px_rgba(148,163,184,0.18)] backdrop-blur transition hover:-translate-y-1 hover:shadow-[0_28px_80px_rgba(79,70,229,0.14)]"
            >
              <div className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${item.accent} text-2xl text-white shadow-lg`}>
                {item.icon}
              </div>
              <h2 className="mt-5 text-2xl font-black text-slate-900">{item.title}</h2>
              <p className="mt-4 text-base leading-8 text-slate-600">
                {item.text}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-8 rounded-[2rem] border border-slate-200/80 bg-white/88 p-8 shadow-[0_22px_60px_rgba(148,163,184,0.18)] backdrop-blur md:p-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-indigo-500">
                Our Mission
              </p>
              <h2 className="mt-4 text-3xl font-black text-slate-900 md:text-4xl">
                Supporting organizations and emerging talent with smarter tools
              </h2>
              <p className="mt-5 text-lg leading-8 text-slate-600">
                Our mission is to empower organizations with smart tools that enhance intern development while reducing administrative workload. With a user-friendly interface and modern features, INTERNIX helps build stronger connections between companies and emerging talent.
              </p>
            </div>

            <div className="rounded-[1.75rem] bg-gradient-to-br from-indigo-600 via-sky-500 to-cyan-400 p-[1px] shadow-[0_20px_60px_rgba(59,130,246,0.24)]">
              <div className="h-full rounded-[1.7rem] bg-slate-950 p-7 text-white">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-2xl text-cyan-200">
                  <FaGraduationCap />
                </div>
                <h3 className="mt-5 text-2xl font-black">At Our Core</h3>
                <p className="mt-4 text-base leading-8 text-slate-300">
                  At its core, INTERNIX is more than just a management system. It is a platform that supports growth, learning, and success for the next generation of professionals.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
