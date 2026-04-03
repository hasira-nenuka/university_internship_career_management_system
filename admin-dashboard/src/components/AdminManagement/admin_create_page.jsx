import React, { useEffect, useState } from 'react';
import AdminCreateForm from './admin_create_form';
import AdminLayout from './admin_layout';
import { buildAdminInvitationLink, createAdmin } from './admin_utils';

const AdminCreatePage = () => {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [createdAdmin, setCreatedAdmin] = useState(null);
  const [emailSent, setEmailSent] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const shouldUseDark = savedTheme === 'dark';
    setIsDarkMode(shouldUseDark);
  }, []);

  const handleCreateAdmin = async (formData) => {
    try {
      setSaving(true);
      setError('');
      setMessage('');

      const result = await createAdmin(formData);
      setCreatedAdmin(result.data);
      setEmailSent(false);
      setMessage(
        `Admin created successfully using ${result.source === 'backend' ? 'backend API' : 'local demo storage'}.`
      );
      window.alert('Admin created successfully.');
      return true;
    } catch (err) {
      setCreatedAdmin(null);
      setEmailSent(false);
      const errorMessage = err.response?.data?.message || 'Failed to create admin';
      setError(errorMessage);
      window.alert(errorMessage);
      return false;
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout
      title="Access Control"
      description="Provision new administrative accounts and define operational clearance."
      allowedRoles={['Super Admin', 'Admin Manager']}
    >
      <div className="mx-auto max-w-3xl space-y-8 pb-10">
        <AdminCreateForm onCreate={handleCreateAdmin} saving={saving} isDarkMode={isDarkMode} />

        {message && (
          <div className="flex items-center gap-3 rounded-[2rem] border border-emerald-500/20 bg-emerald-500/10 px-6 py-4 text-sm font-bold text-emerald-600 shadow-sm backdrop-blur-sm animate-in fade-in slide-in-from-top-4">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            {message}
          </div>
        )}

        {error && (
          <div className="flex items-center gap-3 rounded-[2rem] border border-rose-500/20 bg-rose-500/10 px-6 py-4 text-sm font-bold text-rose-600 shadow-sm backdrop-blur-sm animate-in fade-in slide-in-from-top-4">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            {error}
          </div>
        )}

        {createdAdmin && !emailSent && (
          <div className={`relative overflow-hidden rounded-[2.5rem] border p-8 shadow-2xl transition-all animate-in zoom-in-95 duration-500 ${
            isDarkMode ? 'border-slate-800 bg-slate-900/40' : 'border-indigo-100 bg-white shadow-indigo-500/10'
          }`}>
            <div className={`absolute -right-12 -top-12 h-32 w-32 rounded-full opacity-10 ${isDarkMode ? 'bg-indigo-500' : 'bg-indigo-200'}`} />
            
            <div className="relative z-10">
              <h2 className={`text-2xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                Operational Clearance Generated
              </h2>
              <p className={`mt-2 text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Security credentials for the new administrative profile are ready for transmission.
              </p>

              <div className={`mt-8 grid gap-4 rounded-3xl border p-6 ${
                isDarkMode ? 'border-slate-800 bg-slate-800/50' : 'border-slate-50 bg-slate-50/50'
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/50 pb-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Security Identifier</span>
                  <span className="text-sm font-bold font-mono">{createdAdmin.email}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/50 pb-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Privilege Level</span>
                  <span className={`text-sm font-bold ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>{createdAdmin.role}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Access Key</span>
                  <span className="text-sm font-bold font-mono bg-slate-900 text-white px-2 py-0.5 rounded-md">{createdAdmin.password}</span>
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-4">
                <a
                  href={buildAdminInvitationLink(createdAdmin)}
                  onClick={() => setEmailSent(true)}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-6 py-4 text-sm font-bold text-white shadow-lg shadow-indigo-200 dark:shadow-none hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                  Transmit Access via Mail
                </a>
                <p className={`text-center text-[10px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>
                  Requires localized SMTP or external mail provider integration
                </p>
              </div>
            </div>
          </div>
        )}

        {createdAdmin && emailSent && (
          <div className="flex items-center gap-3 rounded-[2rem] border border-indigo-500/20 bg-indigo-500/10 px-6 py-4 text-sm font-bold text-indigo-600 shadow-sm backdrop-blur-sm transition-all duration-500 ease-in-out">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            Clearance documentation transmitted. Access record archived for platform privacy.
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminCreatePage;
