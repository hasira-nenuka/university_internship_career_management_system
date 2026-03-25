import React from 'react';

const items = [
  {
    title: 'Top Internship Trends 2026',
    summary: 'A look at high-demand skills and sectors students should target this year.',
    date: 'March 2026',
  },
  {
    title: 'How Companies Can Build Better Internship Programs',
    summary: 'Practical tips for better mentoring, onboarding, and project impact.',
    date: 'February 2026',
  },
  {
    title: 'University Partnerships Expanded',
    summary: 'StepIn now collaborates with more institutions to expand internship access.',
    date: 'January 2026',
  },
];

const News = () => {
  return (
    <section className="min-h-[70vh] bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="mb-4 text-4xl font-extrabold text-gray-900 dark:text-white">News</h1>
        <p className="mb-10 text-lg text-gray-600 dark:text-slate-300">Latest updates from the INTERNIX internship community.</p>

        <div className="space-y-5">
          {items.map((item) => (
            <article key={item.title} className="rounded-2xl bg-white dark:bg-slate-800 p-6 shadow-md dark:shadow-lg border dark:border-slate-700">
              <p className="mb-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400">{item.date}</p>
              <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">{item.title}</h2>
              <p className="text-gray-600 dark:text-slate-300">{item.summary}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default News;
