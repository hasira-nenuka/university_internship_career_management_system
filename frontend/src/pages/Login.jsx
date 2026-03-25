import React from 'react';
import { Link } from 'react-router-dom';

const Login = () => {
  return (
    <section className="min-h-[70vh] bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="mx-auto grid max-w-5xl gap-6 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div className="rounded-2xl bg-white dark:bg-slate-800 p-8 shadow-md dark:shadow-lg border dark:border-slate-700">
          <h1 className="mb-2 text-3xl font-extrabold text-gray-900 dark:text-white">Login</h1>
          <p className="mb-6 text-gray-600 dark:text-slate-300">Choose your login portal</p>
          <div className="space-y-3">
            <Link to="/login/student" className="block rounded-lg border border-indigo-200 dark:border-slate-700 px-4 py-3 font-medium text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-slate-700">
              Student Login
            </Link>
            <Link to="/login/company" className="block rounded-lg border border-indigo-200 dark:border-slate-700 px-4 py-3 font-medium text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-slate-700">
              Company Login
            </Link>
          </div>
        </div>

        <div className="rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-700 dark:to-purple-700 p-8 text-white shadow-md dark:shadow-lg">
          <h2 className="mb-3 text-2xl font-bold">New here?</h2>
          <p className="mb-6 text-indigo-100">Create your account and start your internship journey today.</p>
          <div className="space-y-3">
            <Link to="/register/student" className="block rounded-lg bg-white/20 px-4 py-3 font-medium hover:bg-white/30">
              Register as Student
            </Link>
            <Link to="/register/company" className="block rounded-lg bg-white/20 px-4 py-3 font-medium hover:bg-white/30">
              Register as Company
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Login;
