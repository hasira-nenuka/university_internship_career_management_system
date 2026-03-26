import React from 'react';
import { ADMIN_ROLES } from './admin_utils';

const roleColors = {
  'Super Admin': 'bg-rose-100 text-rose-700',
  'Admin Manager': 'bg-indigo-100 text-indigo-700',
  'Payment Manager': 'bg-amber-100 text-amber-700',
  'Company Manager': 'bg-sky-100 text-sky-700',
  'Internship Manager': 'bg-emerald-100 text-emerald-700',
  'Review Admin': 'bg-fuchsia-100 text-fuchsia-700',
};

const AdminList = ({ admins, onRoleChange, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
      <div className="border-b border-slate-100 p-6">
        <h2 className="text-2xl font-bold text-slate-900">Admin team registry</h2>
        <p className="mt-2 text-sm text-slate-600">
          Review the admins you created and change roles from the same screen.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr className="text-left text-xs uppercase tracking-[0.2em] text-slate-500">
              <th className="px-6 py-4">Admin</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Department</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Created</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {admins.map((admin) => (
              <tr key={admin.id} className="hover:bg-slate-50">
                <td className="px-6 py-5">
                  <div className="font-semibold text-slate-900">{admin.fullName}</div>
                  <div className="text-sm text-slate-500">{admin.email}</div>
                  <div className="mt-1 text-xs text-slate-400">{admin.id}</div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex flex-col gap-3">
                    <span
                      className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${
                        roleColors[admin.role] || 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {admin.role}
                    </span>
                    <select
                      value={admin.role}
                      onChange={(event) => onRoleChange(admin.id, event.target.value)}
                      className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-900"
                    >
                      {ADMIN_ROLES.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                  </div>
                </td>
                <td className="px-6 py-5 text-sm text-slate-600">{admin.department}</td>
                <td className="px-6 py-5">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                      admin.status === 'Active'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {admin.status}
                  </span>
                </td>
                <td className="px-6 py-5 text-sm text-slate-500">
                  {new Date(admin.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-5">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit(admin)}
                      className="rounded-xl bg-sky-50 px-3 py-2 text-sm font-semibold text-sky-700 transition hover:bg-sky-100"
                    >
                      Update
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(admin)}
                      className="rounded-xl bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
                    >
                      Remove
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminList;
