import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  getAdminNavigation,
  getAdminSession,
  isAdminLoggedIn,
  logoutAdmin,
} from './admin_utils';

const cardStyles = [
  'from-[#ede9fe] via-[#f7f5ff] to-white border-[#d8d1fa]',
  'from-[#e0e7ff] via-[#f5f7ff] to-white border-[#cdd7ff]',
  'from-[#dbeafe] via-[#f4f9ff] to-white border-[#c6dcff]',
  'from-[#eef2ff] via-[#fafaff] to-white border-[#dbe2ff]',
  'from-[#f3e8ff] via-[#fdf7ff] to-white border-[#ead4ff]',
  'from-[#e9edff] via-[#fbfbff] to-white border-[#d8defe]',
];

const quickFacts = [
  { label: 'Access Model', value: 'Role-Based', tone: 'text-indigo-700' },
  { label: 'Portal Mode', value: 'Live Control', tone: 'text-blue-700' },
  { label: 'Workspace Type', value: 'Admin Only', tone: 'text-violet-700' },
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [sessionAdmin, setSessionAdmin] = useState(null);

  useEffect(() => {
    const loadAdmins = async () => {
      if (!isAdminLoggedIn()) {
        navigate('/login');
        return;
      }

      const session = getAdminSession();
      setSessionAdmin(session?.admin || null);
      setLoading(false);
    };

    loadAdmins();
  }, [navigate]);

  const handleLogout = () => {
    logoutAdmin();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-indigo-950 text-white">
        Loading admin portal...
      </div>
    );
  }

  const navigationItems = getAdminNavigation(sessionAdmin?.role || '');

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.16),_transparent_22%),radial-gradient(circle_at_top_right,_rgba(59,130,246,0.16),_transparent_25%),linear-gradient(180deg,_#ffffff_0%,_#f7f7ff_45%,_#eef4ff_100%)]">
      <header className="relative overflow-hidden border-b border-indigo-100 bg-[linear-gradient(135deg,_rgba(238,242,255,0.95),_rgba(255,255,255,0.9))]">
        <div className="absolute inset-0 bg-[linear-gradient(120deg,transparent_0%,rgba(99,102,241,0.08)_35%,transparent_65%)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-8 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-4xl">
              <p className="text-sm font-semibold uppercase tracking-[0.38em] text-indigo-600">
                StepIn Admin Management
              </p>
              <h1 className="mt-4 max-w-5xl font-serif text-5xl font-black leading-[0.95] text-[#16213b] md:text-6xl">
                Command center for platform governance and operational access
              </h1>
              {sessionAdmin && (
                <div className="mt-6 inline-flex flex-wrap items-center gap-3 rounded-full border border-indigo-100 bg-white/90 px-4 py-3 text-sm font-semibold text-[#334155] shadow-sm">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-indigo-700 to-blue-600 text-white">
                    {sessionAdmin.fullName?.charAt(0)?.toUpperCase() || 'A'}
                  </span>
                  <span>{sessionAdmin.fullName}</span>
                  <span className="text-[#94a3b8]">/</span>
                  <span className="text-indigo-700">{sessionAdmin.role}</span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleLogout}
                className="rounded-full bg-gradient-to-r from-indigo-700 to-blue-600 px-6 py-3 font-semibold text-white transition hover:from-indigo-800 hover:to-blue-700"
              >
                Logout
              </button>
              <a
                href="http://localhost:3000/"
                className="rounded-full border border-indigo-200 bg-white/90 px-6 py-3 font-semibold text-[#334155] transition hover:border-indigo-500 hover:text-indigo-700"
              >
                Back to Home
              </a>
            </div>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {quickFacts.map((fact) => (
              <div
                key={fact.label}
                className="rounded-[2rem] border border-indigo-100 bg-white/80 px-6 py-5 shadow-[0_12px_30px_rgba(79,70,229,0.08)] backdrop-blur"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#64748b]">
                  {fact.label}
                </p>
                <div className={`mt-3 text-3xl font-black ${fact.tone}`}>{fact.value}</div>
              </div>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="rounded-[2rem] border border-indigo-100 bg-white/75 p-6 shadow-[0_24px_60px_rgba(79,70,229,0.08)] backdrop-blur md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.32em] text-indigo-500">
                Role-Based Access
              </p>
              <h2 className="mt-3 text-3xl font-black text-[#16213b]">
                Your available control rooms
              </h2>
            </div>

            <div className="rounded-3xl border border-indigo-100 bg-indigo-50/80 px-5 py-4 text-sm text-[#475569]">
              <span className="font-semibold text-[#16213b]">Active modules:</span> {navigationItems.length}
            </div>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {navigationItems.map((item, index) => (
              <Link
                key={item.path}
                to={item.path}
                className={`group relative overflow-hidden rounded-[1.75rem] border bg-gradient-to-br p-6 shadow-[0_18px_40px_rgba(15,23,42,0.07)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_55px_rgba(15,23,42,0.12)] ${cardStyles[index % cardStyles.length]}`}
              >
                <div className="absolute right-4 top-4 text-xs font-bold uppercase tracking-[0.28em] text-[#64748b]">
                  {String(index + 1).padStart(2, '0')}
                </div>

                <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-700 to-blue-600 text-2xl text-white shadow-lg">
                  {item.label === 'Dashboard' && '⌘'}
                  {item.label === 'Create Admin' && '+'}
                  {item.label === 'Admin Registry' && '≣'}
                  {item.label === 'Company Data' && '▣'}
                  {item.label === 'Internship Data' && '◆'}
                  {item.label === 'Payment Data' && '¤'}
                  {item.label === 'Review Data' && '✦'}
                </div>

                <h3 className="mt-6 text-3xl font-black leading-tight text-[#16213b]">
                  {item.label}
                </h3>
                <p className="mt-3 max-w-xs text-sm leading-7 text-[#475569]">
                  Open the {item.label.toLowerCase()} workspace and manage the records available to your role.
                </p>

                <div className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-indigo-700">
                  Open module
                  <span className="transition group-hover:translate-x-1">→</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;
