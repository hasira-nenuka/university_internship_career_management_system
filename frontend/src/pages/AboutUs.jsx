import React from 'react';

const AboutUs = () => {
  return (
    <section className="min-h-[80vh] bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-10 rounded-3xl border border-indigo-100 bg-white/80 p-8 shadow-xl backdrop-blur-sm dark:border-slate-700 dark:bg-slate-800/80 md:p-10">
          <p className="mb-3 inline-flex items-center rounded-full bg-indigo-100 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
            About Us - INTERNIX
          </p>
          <h1 className="mb-4 text-4xl font-extrabold leading-tight text-gray-900 dark:text-white md:text-5xl">
            Building Smarter Internship Journeys
          </h1>
          <p className="max-w-4xl text-lg leading-relaxed text-gray-600 dark:text-slate-300">
            At INTERNIX, we are dedicated to transforming the way organizations manage and engage with interns. Our platform is designed to simplify internship management by providing a centralized system that streamlines recruitment, onboarding, tracking, and performance evaluation.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <article className="rounded-2xl border border-indigo-100 bg-white p-7 shadow-md transition hover:-translate-y-1 hover:shadow-xl dark:border-slate-700 dark:bg-slate-800">
            <h2 className="mb-3 text-2xl font-bold text-gray-900 dark:text-white">Why INTERNIX</h2>
            <p className="text-base leading-relaxed text-gray-600 dark:text-slate-300">
              We understand that internships play a vital role in shaping future professionals. That is why INTERNIX focuses on creating a seamless experience for both administrators and interns.
            </p>
          </article>

          <article className="rounded-2xl border border-indigo-100 bg-white p-7 shadow-md transition hover:-translate-y-1 hover:shadow-xl dark:border-slate-700 dark:bg-slate-800">
            <h2 className="mb-3 text-2xl font-bold text-gray-900 dark:text-white">What We Simplify</h2>
            <p className="text-base leading-relaxed text-gray-600 dark:text-slate-300">
              From assigning tasks and monitoring progress to maintaining records and generating reports, our system ensures efficiency, transparency, and productivity at every stage.
            </p>
          </article>
        </div>

        <div className="mt-6 rounded-3xl border border-indigo-100 bg-white p-8 shadow-lg dark:border-slate-700 dark:bg-slate-800 md:p-10">
          <h2 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">Our Mission</h2>
          <p className="mb-6 text-lg leading-relaxed text-gray-600 dark:text-slate-300">
            Our mission is to empower organizations with smart tools that enhance intern development while reducing administrative workload. With a user-friendly interface and modern features, INTERNIX helps build stronger connections between companies and emerging talent.
          </p>

          <div className="rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-500 p-[1px]">
            <div className="rounded-2xl bg-white p-6 dark:bg-slate-900">
              <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">At Our Core</h3>
              <p className="text-base leading-relaxed text-gray-600 dark:text-slate-300">
                At its core, INTERNIX is more than just a management system. It is a platform that supports growth, learning, and success for the next generation of professionals.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
