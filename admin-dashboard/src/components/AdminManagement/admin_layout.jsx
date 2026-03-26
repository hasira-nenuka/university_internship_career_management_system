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

  useEffect(() => {
    if (!isAdminLoggedIn()) {
      navigate('/login');
      return;
    }

    const session = getAdminSession();
    setSessionAdmin(session?.admin || null);

    if (allowedRoles && session?.admin?.role && !isRoleAllowed(session.admin.role, allowedRoles)) {
      navigate('/dashboard');
    }
  }, [allowedRoles, navigate]);

  const handleLogout = () => {
    logoutAdmin();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.18),_transparent_24%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.16),_transparent_30%),linear-gradient(180deg,_#ffffff_0%,_#f7f7ff_48%,_#eff4ff_100%)]">
      <header className="border-b border-indigo-100 bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-indigo-600">
              StepIn Admin Management
            </p>
            <h1 className="mt-2 text-4xl font-black text-slate-900">{title}</h1>
            <p className="mt-3 max-w-3xl text-slate-600">{description}</p>
            {sessionAdmin && (
              <p className="mt-4 text-sm font-semibold text-indigo-950">
                Logged in as {sessionAdmin.fullName} ({sessionAdmin.role})
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            {sessionAdmin && getAdminNavigation(sessionAdmin.role).map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="rounded-2xl border border-indigo-200 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:border-indigo-500 hover:text-indigo-700"
              >
                {item.label}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="rounded-2xl bg-gradient-to-r from-indigo-700 to-blue-600 px-5 py-3 font-semibold text-white transition hover:from-indigo-800 hover:to-blue-700"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
};

export default AdminLayout;
