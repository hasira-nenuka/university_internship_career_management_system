import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  getAdminNavigation,
  getAdminSession,
  isAdminLoggedIn,
  logoutAdmin,
} from './admin_utils';

const cardStyles = [
  'from-white to-[#f8fafc] border-[#e2e8f0] hover:border-indigo-300',
  'from-white to-[#f8fafc] border-[#e2e8f0] hover:border-blue-300',
  'from-white to-[#f8fafc] border-[#e2e8f0] hover:border-violet-300',
  'from-white to-[#f8fafc] border-[#e2e8f0] hover:border-sky-300',
  'from-white to-[#f8fafc] border-[#e2e8f0] hover:border-purple-300',
  'from-white to-[#f8fafc] border-[#e2e8f0] hover:border-indigo-300',
];

const quickFacts = [
  { label: 'Access Model', value: 'Role-Based', tone: 'text-indigo-600', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
  { label: 'Portal Mode', value: 'Live Control', tone: 'text-blue-600', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
  { label: 'Workspace', value: 'Admin Only', tone: 'text-violet-600', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [sessionAdmin, setSessionAdmin] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const loadAdmins = async () => {
      if (!isAdminLoggedIn()) {
        navigate('/login');
        return;
      }

      const session = getAdminSession();
      setSessionAdmin(session?.admin || null);

      const savedTheme = localStorage.getItem('theme');
      const shouldUseDark = savedTheme === 'dark';
      setIsDarkMode(shouldUseDark);
      document.documentElement.classList.toggle('dark', shouldUseDark);
      setLoading(false);
    };

    loadAdmins();
  }, [navigate]);

  const handleLogout = () => {
    logoutAdmin();
    navigate('/login');
  };

  const setTheme = (mode) => {
    const useDark = mode === 'dark';
    setIsDarkMode(useDark);
    document.documentElement.classList.toggle('dark', useDark);
    localStorage.setItem('theme', mode);
  };

  const toggleTheme = () => {
    setTheme(isDarkMode ? 'light' : 'dark');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0b1f43] text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
          <p className="font-medium tracking-widest text-indigo-200">INITIALIZING PORTAL</p>
        </div>
      </div>
    );
  }

  const navigationItems = getAdminNavigation(sessionAdmin?.role || '');

  const getIcon = (label) => {
    switch(label) {
      case 'Dashboard': return <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>;
      case 'Create Admin': return <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/></svg>;
      case 'Admin Registry': return <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>;
      case 'Company Data': return <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011-1v5m-4 0h4"/></svg>;
      case 'Student Data': return <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>;
      case 'Internship Data': return <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>;
      case 'Payment Data': return <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>;
      case 'Review Data': return <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.382-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>;
      default: return null;
    }
  };

  return (
    <div className={`min-h-screen font-sans selection:bg-indigo-100 selection:text-indigo-900 ${
      isDarkMode
        ? 'bg-[#0b172a] text-slate-200'
        : 'bg-[#f8fafc] text-slate-900'
    }`}>
      {/* Dynamic Background Accents */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className={`absolute -top-24 -right-24 w-96 h-96 rounded-full blur-[120px] opacity-20 ${isDarkMode ? 'bg-indigo-500' : 'bg-indigo-200'}`} />
        <div className={`absolute top-1/2 -left-24 w-72 h-72 rounded-full blur-[100px] opacity-10 ${isDarkMode ? 'bg-blue-500' : 'bg-blue-200'}`} />
      </div>

      <header className={`relative z-10 border-b backdrop-blur-md transition-colors ${
        isDarkMode ? 'border-slate-800 bg-slate-900/80' : 'border-slate-200 bg-white/80'
      }`}>
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
                <p className={`text-[10px] font-bold uppercase tracking-[0.4em] ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
                  StepIn Governance
                </p>
              </div>
              <h1 className={`text-3xl font-extrabold tracking-tight sm:text-4xl ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                Admin <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">Dashboard</span>
              </h1>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Manage users, monitor partnerships, and control platform access.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {sessionAdmin && (
                <div className={`flex items-center gap-3 rounded-2xl border px-3 py-2 pr-4 shadow-sm ${
                  isDarkMode ? 'border-slate-700 bg-slate-800/50' : 'border-slate-100 bg-white'
                }`}>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 text-white shadow-lg">
                    {sessionAdmin.fullName?.charAt(0)?.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-bold leading-none">{sessionAdmin.fullName}</p>
                    <p className={`mt-1 text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
                      {sessionAdmin.role}
                    </p>
                  </div>
                </div>
              )}
              
              <div className="h-10 w-px bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block" />

              <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
                <button
                  onClick={toggleTheme}
                  className={`p-2 rounded-xl transition-all ${
                    !isDarkMode ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Light Mode"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M16.95 16.95l.707.707M7.636 7.636l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z"/></svg>
                </button>
                <button
                  onClick={toggleTheme}
                  className={`p-2 rounded-xl transition-all ${
                    isDarkMode ? 'bg-slate-700 shadow-sm text-blue-400' : 'text-slate-400 hover:text-slate-600'
                  }`}
                  title="Dark Mode"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>
                </button>
              </div>

              <a
                href="http://localhost:3000/"
                className={`flex h-10 items-center justify-center rounded-xl border px-4 text-sm font-bold transition-all ${
                  isDarkMode ? 'border-slate-700 hover:bg-slate-800 text-slate-300' : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                Exit
              </a>
              <button
                onClick={handleLogout}
                className="flex h-10 items-center justify-center rounded-xl bg-slate-900 dark:bg-indigo-600 px-6 text-sm font-bold text-white shadow-lg shadow-indigo-200 dark:shadow-none hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Quick Stats Sidebar/Grid */}
        <div className="grid gap-6 md:grid-cols-3 mb-10">
          {quickFacts.map((fact) => (
            <div
              key={fact.label}
              className={`group flex items-center gap-5 rounded-3xl border p-6 transition-all duration-300 hover:shadow-xl ${
                isDarkMode ? 'border-slate-800 bg-slate-900/50 hover:bg-slate-800' : 'border-white bg-white/60 hover:bg-white'
              }`}
            >
              <div className={`p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 transition-colors group-hover:bg-white dark:group-hover:bg-slate-700`}>
                <svg className={`w-6 h-6 ${fact.tone}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={fact.icon} />
                </svg>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">{fact.label}</p>
                <p className={`mt-1 text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{fact.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Modules Section */}
        <section className={`rounded-[2.5rem] border p-8 shadow-sm backdrop-blur-sm ${
          isDarkMode ? 'border-slate-800 bg-slate-900/40' : 'border-slate-200/60 bg-white/40'
        }`}>
          <div className="flex items-center justify-between mb-10">
            <div className="space-y-1">
              <h2 className="text-2xl font-black tracking-tight">Available Control Rooms</h2>
              <p className="text-sm font-medium text-slate-500">Select a module below to start managing the platform.</p>
            </div>
            <div className={`px-4 py-2 rounded-full text-xs font-bold ${
              isDarkMode ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'bg-indigo-50 text-indigo-600 border border-indigo-100'
            }`}>
              {navigationItems.length} Active Modules
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {navigationItems.map((item, index) => (
              <Link
                key={item.path}
                to={item.path}
                className={`group relative flex flex-col items-start overflow-hidden rounded-[2rem] border p-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-indigo-500/10 bg-gradient-to-br ${
                  isDarkMode
                    ? 'from-[#1e293b]/50 to-[#0f172a]/50 border-slate-800 hover:border-indigo-500/50'
                    : cardStyles[index % cardStyles.length]
                }`}
              >
                {/* Decorative background circle */}
                <div className={`absolute -right-12 -top-12 h-32 w-32 rounded-full transition-transform duration-500 group-hover:scale-150 group-hover:rotate-12 ${
                  isDarkMode ? 'bg-indigo-500/5' : 'bg-slate-100/50'
                }`} />

                <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-md group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                  {getIcon(item.label)}
                </div>

                <div className="relative z-10 mt-8">
                  <h3 className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    {item.label}
                  </h3>
                  <p className={`mt-3 text-sm leading-relaxed font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Open the {item.label.toLowerCase()} workspace to view and manage all accessible records.
                  </p>
                </div>

                <div className={`relative z-10 mt-8 flex items-center gap-2 text-xs font-bold uppercase tracking-widest ${
                  isDarkMode ? 'text-indigo-400' : 'text-indigo-600'
                }`}>
                  Launch Module
                  <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <footer className="relative z-10 mx-auto max-w-7xl px-4 py-12 text-center">
        <p className={`text-[10px] font-bold uppercase tracking-[0.4em] ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>
          &copy; 2026 StepIn Platform Governance &bull; Secure Access Layer
        </p>
      </footer>
    </div>
  );
};

export default AdminDashboard;
