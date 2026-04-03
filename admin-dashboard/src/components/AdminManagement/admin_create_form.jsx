import React, { useState } from 'react';
import { ADMIN_ROLES } from './admin_utils';

const initialForm = {
  fullName: '',
  email: '',
  password: '',
  role: ADMIN_ROLES[0],
  department: 'Admin Management',
  status: 'Active',
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const AdminCreateForm = ({ onCreate, saving, isDarkMode }) => {
  const [formData, setFormData] = useState(initialForm);
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    setFieldErrors((current) => ({
      ...current,
      [name]: '',
    }));
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!formData.fullName.trim()) {
      nextErrors.fullName = 'Full name is required.';
    } else if (formData.fullName.trim().length < 3) {
      nextErrors.fullName = 'Full name must be at least 3 characters.';
    }

    if (!formData.email.trim()) {
      nextErrors.email = 'Email address is required.';
    } else if (!emailPattern.test(formData.email.trim())) {
      nextErrors.email = 'Enter a valid email address.';
    }

    if (!formData.role.trim()) {
      nextErrors.role = 'Role is required.';
    }

    if (!formData.password.trim()) {
      nextErrors.password = 'Password is required.';
    } else if (formData.password.trim().length < 8) {
      nextErrors.password = 'Password must be at least 8 characters.';
    }

    if (!formData.status.trim()) {
      nextErrors.status = 'Status is required.';
    }

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      window.alert('Please fix the highlighted admin form fields before submitting.');
      return;
    }

    const didCreate = await onCreate({
      ...formData,
      fullName: formData.fullName.trim(),
      email: formData.email.trim().toLowerCase(),
      password: formData.password.trim(),
      department: initialForm.department,
    });

    if (!didCreate) {
      return;
    }

    setFormData(initialForm);
    setFieldErrors({});
  };

  return (
    <div className={`rounded-[2.5rem] border shadow-sm backdrop-blur-sm transition-all overflow-hidden ${
      isDarkMode ? 'border-slate-800 bg-slate-900/40' : 'border-slate-200/60 bg-white/40 shadow-indigo-500/5'
    }`}>
      <div className={`border-b p-8 ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
        <div className="flex items-center gap-2 mb-2">
          <span className="h-2 w-2 rounded-full bg-indigo-600" />
          <p className={`text-[10px] font-bold uppercase tracking-[0.4em] ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
            Admin Setup
          </p>
        </div>
        <h2 className={`text-2xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
          Provision Access
        </h2>
        <p className={`mt-2 text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          Fill in the details below to create a new administrative profile.
        </p>
      </div>

      <form noValidate onSubmit={handleSubmit} className="grid gap-6 p-8 md:grid-cols-2">
        <label className="block space-y-2">
          <span className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Full name</span>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            required
            aria-invalid={Boolean(fieldErrors.fullName)}
            className={`w-full rounded-2xl border px-5 py-3 text-sm font-medium outline-none transition-all ${
              isDarkMode 
                ? 'border-slate-700 bg-slate-800/50 text-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10' 
                : 'border-slate-200 bg-white text-slate-900 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5'
            }`}
            placeholder="John Doe"
          />
          {fieldErrors.fullName && (
            <p className="mt-2 text-[10px] font-bold uppercase tracking-tight text-rose-500">{fieldErrors.fullName}</p>
          )}
        </label>

        <label className="block space-y-2">
          <span className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Email address</span>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            aria-invalid={Boolean(fieldErrors.email)}
            className={`w-full rounded-2xl border px-5 py-3 text-sm font-medium outline-none transition-all ${
              isDarkMode 
                ? 'border-slate-700 bg-slate-800/50 text-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10' 
                : 'border-slate-200 bg-white text-slate-900 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5'
            }`}
            placeholder="admin@stepin.edu"
          />
          {fieldErrors.email && (
            <p className="mt-2 text-[10px] font-bold uppercase tracking-tight text-rose-500">{fieldErrors.email}</p>
          )}
        </label>

        <label className="block space-y-2">
          <span className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Permissions Role</span>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            aria-invalid={Boolean(fieldErrors.role)}
            className={`w-full rounded-2xl border px-5 py-3 text-sm font-bold outline-none appearance-none transition-all ${
              isDarkMode 
                ? 'border-slate-700 bg-slate-800/50 text-white focus:border-indigo-500' 
                : 'border-slate-200 bg-white text-slate-900 focus:border-indigo-600'
            }`}
          >
            {ADMIN_ROLES.map((role) => (
              <option key={role} value={role} className="dark:bg-slate-900">
                {role}
              </option>
            ))}
          </select>
          {fieldErrors.role && (
            <p className="mt-2 text-[10px] font-bold uppercase tracking-tight text-rose-500">{fieldErrors.role}</p>
          )}
        </label>

        <label className="block space-y-2">
          <span className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Access Password</span>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            minLength={8}
            aria-invalid={Boolean(fieldErrors.password)}
            className={`w-full rounded-2xl border px-5 py-3 text-sm font-medium outline-none transition-all ${
              isDarkMode 
                ? 'border-slate-700 bg-slate-800/50 text-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10' 
                : 'border-slate-200 bg-white text-slate-900 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5'
            }`}
            placeholder="Create secure password"
          />
          {fieldErrors.password && (
            <p className="mt-2 text-[10px] font-bold uppercase tracking-tight text-rose-500">{fieldErrors.password}</p>
          )}
        </label>

        <label className="block space-y-2">
          <span className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Department</span>
          <input
            type="text"
            name="department"
            value={formData.department}
            readOnly
            disabled
            className={`w-full cursor-not-allowed rounded-2xl border px-5 py-3 text-sm font-bold ${
              isDarkMode ? 'border-slate-800 bg-slate-900/50 text-slate-500' : 'border-slate-100 bg-slate-50 text-slate-400'
            }`}
          />
        </label>

        <label className="block space-y-2">
          <span className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Account Status</span>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            aria-invalid={Boolean(fieldErrors.status)}
            className={`w-full rounded-2xl border px-5 py-3 text-sm font-bold outline-none appearance-none transition-all ${
              isDarkMode 
                ? 'border-slate-700 bg-slate-800/50 text-white focus:border-indigo-500' 
                : 'border-slate-200 bg-white text-slate-900 focus:border-indigo-600'
            }`}
          >
            <option value="Active" className="dark:bg-slate-900">Active</option>
            <option value="Inactive" className="dark:bg-slate-900">Inactive</option>
          </select>
          {fieldErrors.status && (
            <p className="mt-2 text-[10px] font-bold uppercase tracking-tight text-rose-500">{fieldErrors.status}</p>
          )}
        </label>

        <div className="flex items-end md:col-span-2 mt-4">
          <button
            type="submit"
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-slate-900 dark:bg-indigo-600 px-6 py-4 text-sm font-bold text-white shadow-lg shadow-indigo-100 dark:shadow-none hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Validating Entry...
              </>
            ) : (
              'Initialize Admin Profile'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminCreateForm;
