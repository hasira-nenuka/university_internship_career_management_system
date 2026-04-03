import React, { useEffect, useMemo, useState } from 'react';
import AdminLayout from './admin_layout';
import { downloadFilteredPdfReport } from './admin_pdf_utils';
import {
  RESOURCE_CONFIGS,
  createResourceRecord,
  deleteResourceRecord,
  fetchResourceRecords,
  updateResourceRecord,
} from './admin_utils';

const AdminResourcePage = ({ resourceKey }) => {
  const config = RESOURCE_CONFIGS[resourceKey];
  const getValue = (record, path) =>
    path.split('.').reduce((current, key) => (current == null ? undefined : current[key]), record);

  const initialForm = useMemo(
    () =>
      config.fields.reduce((acc, field) => {
        acc[field.name] = field.type === 'select' ? field.options[0] : '';
        return acc;
      }, {}),
    [config.fields]
  );

  const [records, setRecords] = useState([]);
  const [formData, setFormData] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const shouldUseDark = savedTheme === 'dark';
    setIsDarkMode(shouldUseDark);
  }, []);

  useEffect(() => {
    const loadRecords = async () => {
      try {
        const data = await fetchResourceRecords(resourceKey);
        setRecords(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load records');
      }
    };

    loadRecords();
  }, [resourceKey]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const resetForm = () => {
    setFormData(initialForm);
    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      if (editingId) {
        const updated = await updateResourceRecord(resourceKey, editingId, formData);
        setRecords((current) => current.map((item) => (item._id === editingId ? updated : item)));
        setMessage(`${config.title} record updated successfully.`);
      } else {
        const created = await createResourceRecord(resourceKey, formData);
        setRecords((current) => [created, ...current]);
        setMessage(`${config.title} record created successfully.`);
      }
      resetForm();
    } catch (err) {
      setError(err.response?.data?.message || 'Request failed');
    }
  };

  const handleEdit = (record) => {
    const nextForm = config.fields.reduce((acc, field) => {
      acc[field.name] = record[field.name] ?? (field.type === 'select' ? field.options[0] : '');
      return acc;
    }, {});
    setFormData(nextForm);
    setEditingId(record._id);
  };

  const handleDelete = async (record) => {
    const confirmed = window.confirm(`Delete this ${config.title.toLowerCase()} record?`);
    if (!confirmed) {
      return;
    }

    try {
      await deleteResourceRecord(resourceKey, record._id);
      setRecords((current) => current.filter((item) => item._id !== record._id));
      if (editingId === record._id) {
        resetForm();
      }
      setMessage(`${config.title} record deleted successfully.`);
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed');
    }
  };

  const statusField = config.fields.find((field) => field.name === 'status');

  const filteredRecords = records.filter((record) => {
    const matchesSearch =
      !searchTerm ||
      config.columns.some((column) =>
        String(getValue(record, column) ?? '')
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      );

    const matchesStatus =
      statusFilter === 'All' || String(record.status ?? '') === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleDownloadReport = () => {
    downloadFilteredPdfReport({
      fileName: `${config.endpoint}-report.pdf`,
      title: `${config.title} Report`,
      subtitle: 'This report contains only the records visible after the current filter and search settings.',
      filters: {
        Search: searchTerm || 'All',
        Status: statusFilter,
      },
      columns: config.columns.map((column) => ({ key: column, label: column })),
      rows: filteredRecords,
    });
  };

  return (
    <AdminLayout
      title={config.title}
      description={config.description}
      allowedRoles={config.allowedRoles}
    >
      <div className="space-y-8 pb-10">
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

        <div className={`rounded-[2.5rem] border shadow-sm backdrop-blur-sm transition-all overflow-hidden ${
          isDarkMode ? 'border-slate-800 bg-slate-900/40' : 'border-slate-200/60 bg-white/40 shadow-indigo-500/5'
        }`}>
          <div className={`border-b p-8 flex items-start justify-between gap-4 ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="h-2 w-2 rounded-full bg-indigo-600" />
                <p className={`text-[10px] font-bold uppercase tracking-[0.4em] ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
                  Record Management
                </p>
              </div>
              <h2 className={`text-2xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                {editingId ? `Edit ${config.title}` : `New Entry`}
              </h2>
              <p className={`mt-2 text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                {editingId ? 'Modify existing operational data and save changes.' : 'Register a new profile in the database.'}
              </p>
            </div>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className={`rounded-xl border px-5 py-2 text-xs font-bold uppercase tracking-widest transition-all ${
                  isDarkMode 
                    ? 'border-slate-700 text-slate-300 hover:bg-slate-800' 
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Abort
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="grid gap-6 p-8 md:grid-cols-2">
            {config.fields.map((field) => (
              <label key={field.name} className="block space-y-2">
                <span className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{field.label}</span>
                {field.type === 'select' ? (
                  <select
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleChange}
                    required={field.required}
                    className={`w-full rounded-2xl border px-5 py-3 text-sm font-bold outline-none appearance-none transition-all ${
                      isDarkMode 
                        ? 'border-slate-700 bg-slate-800/50 text-white focus:border-indigo-500' 
                        : 'border-slate-200 bg-white text-slate-900 focus:border-indigo-600'
                    }`}
                  >
                    {field.options.map((option) => (
                      <option key={option} value={option} className="dark:bg-slate-900">
                        {option}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type}
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleChange}
                    required={editingId && field.name === 'password' ? false : field.required}
                    className={`w-full rounded-2xl border px-5 py-3 text-sm font-medium outline-none transition-all ${
                      isDarkMode 
                        ? 'border-slate-700 bg-slate-800/50 text-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10' 
                        : 'border-slate-200 bg-white text-slate-900 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5'
                    }`}
                    placeholder={`Enter ${field.label.toLowerCase()}`}
                  />
                )}
              </label>
            ))}

            <div className="flex items-end mt-4">
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-slate-900 dark:bg-indigo-600 px-6 py-4 text-sm font-bold text-white shadow-lg shadow-indigo-100 dark:shadow-none hover:scale-[1.01] active:scale-[0.99] transition-all"
              >
                {editingId ? (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                    Commit Changes
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
                    Add {config.title}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        <div className={`rounded-[2.5rem] border shadow-sm backdrop-blur-sm transition-all overflow-hidden ${
          isDarkMode ? 'border-slate-800 bg-slate-900/40' : 'border-slate-200/60 bg-white/40 shadow-indigo-500/5'
        }`}>
          <div className={`p-8 flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between ${isDarkMode ? 'bg-slate-900/50' : 'bg-slate-50/50'}`}>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="h-2 w-2 rounded-full bg-blue-600" />
                <p className={`text-[10px] font-bold uppercase tracking-[0.4em] ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                  Operational Registry
                </p>
              </div>
              <h2 className={`text-2xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                Platform Workspace
              </h2>
              <p className={`mt-2 text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Managing {records.length} total entries under the {config.title} security scope.
              </p>
            </div>

            <div className="flex flex-col gap-6 lg:items-end">
              <button
                type="button"
                onClick={handleDownloadReport}
                disabled={filteredRecords.length === 0}
                className="flex items-center gap-2 rounded-2xl bg-slate-900 dark:bg-indigo-600 px-6 py-4 text-sm font-bold text-white shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                Export Registry Report
              </button>

              <div className="flex flex-wrap items-center gap-4">
                <div className="relative group min-w-[200px]">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search registry..."
                    className={`w-full rounded-2xl border px-5 py-3 pl-11 text-sm font-medium outline-none transition-all ${
                      isDarkMode 
                        ? 'border-slate-700 bg-slate-800 text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10' 
                        : 'border-slate-200 bg-white text-slate-900 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5'
                    }`}
                  />
                  <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                </div>

                {statusField && (
                  <div className="relative min-w-[140px]">
                    <select
                      value={statusFilter}
                      onChange={(event) => setStatusFilter(event.target.value)}
                      className={`w-full rounded-2xl border px-5 py-3 text-sm font-bold outline-none appearance-none transition-all ${
                        isDarkMode 
                          ? 'border-slate-700 bg-slate-800 text-white focus:border-blue-500' 
                          : 'border-slate-200 bg-white text-slate-900 focus:border-blue-600'
                      }`}
                    >
                      <option value="All">All Status</option>
                      {statusField.options.map((option) => (
                        <option key={option} value={option} className="dark:bg-slate-900">{option}</option>
                      ))}
                    </select>
                    <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={`border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                  {config.columns.map((column) => (
                    <th key={column} className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">{column}</th>
                  ))}
                  <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDarkMode ? 'divide-slate-800' : 'divide-slate-100'}`}>
                {filteredRecords.map((record) => (
                  <tr key={record._id} className="group hover:bg-indigo-50/10 transition-colors">
                    {config.columns.map((column) => (
                      <td key={`${record._id}-${column}`} className="px-8 py-5 text-sm font-medium">
                        {String(getValue(record, column) ?? '-')}
                      </td>
                    ))}
                    <td className="px-8 py-5">
                      <div className="flex items-center justify-end gap-3 translate-x-2 group-hover:translate-x-0 transition-transform">
                        <button
                          type="button"
                          onClick={() => handleEdit(record)}
                          className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all ${
                            isDarkMode 
                              ? 'bg-slate-800 text-slate-400 hover:bg-indigo-500/20 hover:text-indigo-400' 
                              : 'bg-slate-100 text-slate-500 hover:bg-white hover:text-indigo-600 hover:shadow-sm'
                          }`}
                          title="Edit Resource"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(record)}
                          className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all ${
                            isDarkMode 
                              ? 'bg-slate-800 text-slate-400 hover:bg-rose-500/20 hover:text-rose-400' 
                              : 'bg-slate-100 text-slate-500 hover:bg-white hover:text-rose-600 hover:shadow-sm'
                          }`}
                          title="Purge Resource"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredRecords.length === 0 && (
                  <tr>
                    <td
                      colSpan={config.columns.length + 1}
                      className="px-8 py-20 text-center"
                    >
                      <div className="flex flex-col items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                          <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                        </div>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No entries found in this scope</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className={`p-6 border-t ${isDarkMode ? 'border-slate-800 bg-slate-900/50' : 'border-slate-100 bg-slate-50/50'}`}>
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-400">
              End of Registry Sequence
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminResourcePage;
