import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  getAdminNavigation,
  getAdminSession,
  isAdminLoggedIn,
  isRoleAllowed,
  logoutAdmin,
} from './admin_utils';

const AdminLayout = ({ title, description, children, allowedRoles }) => {
  const navigate = useNavigate();
  const [sessionAdmin, setSessionAdmin] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
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

    if (allowedRoles && session?.admin?.role && !isRoleAllowed(session.admin.role, allowedRoles)) {
      navigate('/dashboard');
    }
  }, [allowedRoles, navigate]);

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
                  StepIn Portal
                </p>
              </div>
              <h1 className={`text-4xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                {title}
              </h1>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                {description}
              </p>
              {sessionAdmin && (
                <p className={`mt-2 text-xs font-bold ${isDarkMode ? 'text-cyan-200' : 'text-indigo-700'}`}>
                  OPERATOR: {sessionAdmin.fullName} ({sessionAdmin.role})
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
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

              <div className="h-10 w-px bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block" />

              {sessionAdmin && getAdminNavigation(sessionAdmin.role).map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex h-10 items-center justify-center rounded-xl border px-5 text-sm font-bold transition-all ${
                    isDarkMode 
                      ? 'border-slate-700 hover:bg-slate-800 text-slate-300' 
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              
              <button
                onClick={handleLogout}
                className="flex h-10 items-center justify-center rounded-xl bg-slate-900 dark:bg-indigo-600 px-6 text-sm font-bold text-white shadow-lg shadow-indigo-100 dark:shadow-none hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
