import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:5000/api";
const EMPTY_FORM = {
  payerType: "company",
  paymentType: "internship_post",
  companyId: "",
  companyName: "",
  studentId: "",
  studentName: "",
  payerEmail: "",
  internshipId: "",
  internshipTitle: "",
  name: "",
  nic: "",
  phoneNumber: "",
  bankName: "Sampath Bank",
  branchName: "",
  accountNumber: "",
  amount: "",
  paymentDate: "",
  paymentTime: "",
  referenceNo: "",
  slipUrl: "",
  notes: "",
  status: "pending"
};

const PAYMENT_TYPE_OPTIONS = {
  company: [
    { value: "internship_post", label: "Internship Post" },
    { value: "pro_account", label: "Pro Account" },
    { value: "other", label: "Other" }
  ],
  student: [
    { value: "student_payment", label: "Student Payment" },
    { value: "other", label: "Other" }
  ]
};

const STATUS_STYLES = {
  verified: "bg-emerald-100 text-emerald-700",
  pending: "bg-amber-100 text-amber-700",
  rejected: "bg-rose-100 text-rose-700"
};

const PAYMENT_LABELS = {
  internship_post: "Internship Post",
  pro_account: "Pro Account",
  student_payment: "Student Payment",
  other: "Other"
};

const getStoredAdminSession = () => {
  const modernSession = localStorage.getItem("stepin_admin_session");
  if (modernSession) {
    try {
      return JSON.parse(modernSession);
    } catch (err) {
      return null;
    }
  }

  const legacySession = localStorage.getItem("adminSession");
  if (legacySession) {
    try {
      return JSON.parse(legacySession);
    } catch (err) {
      return null;
    }
  }

  return null;
};

const A_PaymentManagement = () => {
  const [payments, setPayments] = useState([]);
  const [filters, setFilters] = useState({ payerType: "all", status: "all" });
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [adminSession, setAdminSession] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);

  const filteredPayments = useMemo(() => {
    return payments.filter((item) => {
      if (filters.payerType !== "all" && item.payerType !== filters.payerType) {
        return false;
      }

      if (filters.status !== "all" && item.status !== filters.status) {
        return false;
      }

      return true;
    });
  }, [filters, payments]);

  const authConfig = useMemo(() => {
    const token = adminSession?.token;
    return token
      ? {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      : {};
  }, [adminSession]);

  const formatDate = (value) => {
    if (!value) return "-";
    return new Date(value).toLocaleString();
  };

  const displayPartyName = (payment) => (
    payment.payerType === "student" ? payment.studentName || "-" : payment.companyName || "-"
  );

  const fetchPayments = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(`${API_URL}/payments/admin`, authConfig);
      const payload = response.data;
      const normalized = Array.isArray(payload?.data) ? payload.data : [];
      setPayments(normalized);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load payments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setAdminSession(getStoredAdminSession());
  }, []);

  useEffect(() => {
    if (adminSession?.token) {
      fetchPayments();
    }
  }, [adminSession]);

  const handleStatusChange = async (paymentId, status) => {
    setActionLoadingId(paymentId);
    setError("");
    setSuccess("");

    try {
      await axios.put(`${API_URL}/payments/${paymentId}/status`, { status }, authConfig);
      setSuccess(`Payment marked as ${status}.`);
      await fetchPayments();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update payment");
    } finally {
      setActionLoadingId("");
    }
  };

  const filterButtonClass = (group, value) =>
    `px-4 py-2 rounded-lg text-sm font-semibold transition ${
      filters[group] === value
        ? "bg-indigo-600 text-white"
        : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
    }`;

  const handleFilterChange = (group, value) => {
    setFilters((current) => ({ ...current, [group]: value }));
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => {
      const next = { ...current, [name]: value };

      if (name === "payerType") {
        next.paymentType = value === "student" ? "student_payment" : "internship_post";
        if (value === "student") {
          next.companyId = "";
          next.companyName = "";
          next.internshipId = "";
          next.internshipTitle = "";
        } else {
          next.studentId = "";
          next.studentName = "";
        }
      }

      return next;
    });
  };

  const handleCreatePayment = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      await axios.post(`${API_URL}/payments/admin`, formData, authConfig);
      setSuccess("Payment record created successfully.");
      setFormData(EMPTY_FORM);
      await fetchPayments();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create payment record");
    } finally {
      setSubmitting(false);
    }
  };

  const paymentSummary = useMemo(() => {
    return payments.reduce(
      (summary, item) => {
        summary.total += 1;
        summary.amount += Number(item.amount || 0);
        if (item.payerType === "student") {
          summary.students += 1;
        } else {
          summary.companies += 1;
        }
        return summary;
      },
      { total: 0, amount: 0, companies: 0, students: 0 }
    );
  }, [payments]);

  if (!adminSession?.token) {
    return (
      <div className="min-h-screen bg-slate-100 px-4 py-10">
        <div className="mx-auto max-w-4xl rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-900 shadow-sm">
          Admin login is required to manage payment records.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-slate-100 py-10 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 md:p-8">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-200">
              <p className="text-sm text-slate-500">Total Records</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{paymentSummary.total}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-200">
              <p className="text-sm text-slate-500">Company Payments</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{paymentSummary.companies}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-200">
              <p className="text-sm text-slate-500">Student Payments</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{paymentSummary.students}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-200">
              <p className="text-sm text-slate-500">Recorded Amount</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                Rs {paymentSummary.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Add Payment Record</h2>
              <p className="text-slate-600 mt-1">Payment Admin can record complete company and student payment details.</p>
            </div>
            <div className="text-sm text-slate-600 bg-slate-100 px-4 py-2 rounded-lg">
              Admin: {adminSession?.admin?.fullName || adminSession?.name || "System Admin"}
            </div>
          </div>

          <form onSubmit={handleCreatePayment} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <label className="text-sm text-slate-700">
              <span className="mb-1 block font-medium">Payer Type</span>
              <select name="payerType" value={formData.payerType} onChange={handleFormChange} className="w-full rounded-lg border border-slate-300 px-3 py-2">
                <option value="company">Company</option>
                <option value="student">Student</option>
              </select>
            </label>

            <label className="text-sm text-slate-700">
              <span className="mb-1 block font-medium">Payment Type</span>
              <select name="paymentType" value={formData.paymentType} onChange={handleFormChange} className="w-full rounded-lg border border-slate-300 px-3 py-2">
                {PAYMENT_TYPE_OPTIONS[formData.payerType].map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>

            {formData.payerType === "company" ? (
              <>
                <label className="text-sm text-slate-700">
                  <span className="mb-1 block font-medium">Company ID</span>
                  <input name="companyId" value={formData.companyId} onChange={handleFormChange} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
                </label>
                <label className="text-sm text-slate-700">
                  <span className="mb-1 block font-medium">Company Name</span>
                  <input required name="companyName" value={formData.companyName} onChange={handleFormChange} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
                </label>
              </>
            ) : (
              <>
                <label className="text-sm text-slate-700">
                  <span className="mb-1 block font-medium">Student ID</span>
                  <input name="studentId" value={formData.studentId} onChange={handleFormChange} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
                </label>
                <label className="text-sm text-slate-700">
                  <span className="mb-1 block font-medium">Student Name</span>
                  <input required name="studentName" value={formData.studentName} onChange={handleFormChange} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
                </label>
              </>
            )}

            <label className="text-sm text-slate-700">
              <span className="mb-1 block font-medium">Payer Email</span>
              <input name="payerEmail" type="email" value={formData.payerEmail} onChange={handleFormChange} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
            </label>

            <label className="text-sm text-slate-700">
              <span className="mb-1 block font-medium">Account Holder Name</span>
              <input required name="name" value={formData.name} onChange={handleFormChange} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
            </label>

            <label className="text-sm text-slate-700">
              <span className="mb-1 block font-medium">NIC</span>
              <input required name="nic" value={formData.nic} onChange={handleFormChange} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
            </label>

            <label className="text-sm text-slate-700">
              <span className="mb-1 block font-medium">Phone Number</span>
              <input required name="phoneNumber" value={formData.phoneNumber} onChange={handleFormChange} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
            </label>

            <label className="text-sm text-slate-700">
              <span className="mb-1 block font-medium">Bank Name</span>
              <select name="bankName" value={formData.bankName} onChange={handleFormChange} className="w-full rounded-lg border border-slate-300 px-3 py-2">
                <option value="Sampath Bank">Sampath Bank</option>
                <option value="BOC Bank">BOC Bank</option>
                <option value="Other">Other</option>
              </select>
            </label>

            <label className="text-sm text-slate-700">
              <span className="mb-1 block font-medium">Branch Name</span>
              <input required name="branchName" value={formData.branchName} onChange={handleFormChange} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
            </label>

            <label className="text-sm text-slate-700">
              <span className="mb-1 block font-medium">Account Number</span>
              <input required name="accountNumber" value={formData.accountNumber} onChange={handleFormChange} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
            </label>

            <label className="text-sm text-slate-700">
              <span className="mb-1 block font-medium">Amount</span>
              <input required name="amount" type="number" min="0" step="0.01" value={formData.amount} onChange={handleFormChange} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
            </label>

            <label className="text-sm text-slate-700">
              <span className="mb-1 block font-medium">Payment Date</span>
              <input required name="paymentDate" type="date" value={formData.paymentDate} onChange={handleFormChange} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
            </label>

            <label className="text-sm text-slate-700">
              <span className="mb-1 block font-medium">Payment Time</span>
              <input required name="paymentTime" type="time" step="1" value={formData.paymentTime} onChange={handleFormChange} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
            </label>

            <label className="text-sm text-slate-700">
              <span className="mb-1 block font-medium">Reference No</span>
              <input required name="referenceNo" value={formData.referenceNo} onChange={handleFormChange} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
            </label>

            {formData.payerType === "company" && (
              <>
                <label className="text-sm text-slate-700">
                  <span className="mb-1 block font-medium">Internship ID</span>
                  <input name="internshipId" value={formData.internshipId} onChange={handleFormChange} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
                </label>
                <label className="text-sm text-slate-700">
                  <span className="mb-1 block font-medium">Internship Title</span>
                  <input name="internshipTitle" value={formData.internshipTitle} onChange={handleFormChange} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
                </label>
              </>
            )}

            <label className="text-sm text-slate-700">
              <span className="mb-1 block font-medium">Slip URL</span>
              <input name="slipUrl" value={formData.slipUrl} onChange={handleFormChange} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
            </label>

            <label className="text-sm text-slate-700">
              <span className="mb-1 block font-medium">Status</span>
              <select name="status" value={formData.status} onChange={handleFormChange} className="w-full rounded-lg border border-slate-300 px-3 py-2">
                <option value="pending">Pending</option>
                <option value="verified">Verified</option>
                <option value="rejected">Rejected</option>
              </select>
            </label>

            <label className="text-sm text-slate-700 md:col-span-2 xl:col-span-4">
              <span className="mb-1 block font-medium">Notes</span>
              <textarea name="notes" value={formData.notes} onChange={handleFormChange} rows="3" className="w-full rounded-lg border border-slate-300 px-3 py-2" />
            </label>

            <div className="md:col-span-2 xl:col-span-4">
              <button type="submit" disabled={submitting} className="rounded-lg bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700 disabled:opacity-50">
                {submitting ? "Saving..." : "Add Payment Record"}
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Admin Payment Management</h1>
            <p className="text-slate-600 mt-1">View every payment detail for companies and students, then update payment status.</p>
          </div>
        </div>

        <div className="flex flex-col gap-4 mb-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={() => handleFilterChange("payerType", "all")} className={filterButtonClass("payerType", "all")}>
              All Payers
            </button>
            <button type="button" onClick={() => handleFilterChange("payerType", "company")} className={filterButtonClass("payerType", "company")}>
              Companies
            </button>
            <button type="button" onClick={() => handleFilterChange("payerType", "student")} className={filterButtonClass("payerType", "student")}>
              Students
            </button>
          </div>

          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={() => handleFilterChange("status", "all")} className={filterButtonClass("status", "all")}>
              All Statuses
            </button>
            <button type="button" onClick={() => handleFilterChange("status", "pending")} className={filterButtonClass("status", "pending")}>
              Pending
            </button>
            <button type="button" onClick={() => handleFilterChange("status", "verified")} className={filterButtonClass("status", "verified")}>
              Verified
            </button>
            <button type="button" onClick={() => handleFilterChange("status", "rejected")} className={filterButtonClass("status", "rejected")}>
              Rejected
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-700">
            {success}
          </div>
        )}

        {loading ? (
          <div className="py-12 text-center text-slate-600">Loading payments...</div>
        ) : error ? (
          <div className="rounded-lg bg-rose-50 p-4 text-rose-700 border border-rose-200">
            <p className="font-semibold">Error loading payments:</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-slate-600 text-lg">No payments found for the selected filters.</p>
            <p className="text-slate-500 text-sm mt-3">Payments will appear here when:</p>
            <ul className="text-slate-500 text-sm mt-2 space-y-1">
              <li>• Companies submit payment slips from the payment upload page</li>
              <li>• You manually add payment records using the form above</li>
            </ul>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-y-2 text-sm text-slate-700">
              <thead>
                <tr className="text-left text-slate-500">
                  <th className="px-3 py-2">Payer</th>
                  <th className="px-3 py-2">Type</th>
                  <th className="px-3 py-2">Party Details</th>
                  <th className="px-3 py-2">Bank Details</th>
                  <th className="px-3 py-2">Amount</th>
                  <th className="px-3 py-2">Dates</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment) => (
                  <tr key={payment._id} className="align-top rounded-xl bg-slate-50 shadow-sm">
                    <td className="px-3 py-4">
                      <div className="font-semibold text-slate-900">{displayPartyName(payment)}</div>
                      <div className="text-xs uppercase tracking-wide text-slate-500">{payment.payerType}</div>
                      <div className="mt-1 text-xs text-slate-500">{payment._id}</div>
                    </td>
                    <td className="px-3 py-4">
                      <div className="font-medium">{PAYMENT_LABELS[payment.paymentType] || payment.paymentType}</div>
                      {payment.internshipTitle ? <div className="text-xs text-slate-500">{payment.internshipTitle}</div> : null}
                    </td>
                    <td className="px-3 py-4">
                      <div>Account Name: {payment.name || "-"}</div>
                      <div>NIC: {payment.nic || "-"}</div>
                      <div>Phone: {payment.phoneNumber || "-"}</div>
                      <div>Email: {payment.payerEmail || "-"}</div>
                      <div>{payment.payerType === "student" ? "Student ID" : "Company ID"}: {payment.studentId || payment.companyId || "-"}</div>
                      {payment.notes ? <div className="mt-1 text-xs text-slate-500">Notes: {payment.notes}</div> : null}
                    </td>
                    <td className="px-3 py-4">
                      <div>Bank: {payment.bankName || "-"}</div>
                      <div>Branch: {payment.branchName || "-"}</div>
                      <div>Account No: {payment.accountNumber || "-"}</div>
                      <div>Reference: {payment.referenceNo || "-"}</div>
                      <div>
                        Slip:{" "}
                        {payment.slipUrl ? (
                          <a href={payment.slipUrl} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">
                            View
                          </a>
                        ) : (
                          "-"
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-4 font-semibold text-slate-900">
                      Rs {Number(payment.amount || 0).toFixed(2)}
                    </td>
                    <td className="px-3 py-4">
                      <div>Payment: {formatDate(payment.paymentDate)}</div>
                      <div>Time: {payment.paymentTime || "-"}</div>
                      <div>Created: {formatDate(payment.createdAt)}</div>
                      <div>Recorded By: {payment.recordedByAdminName || "-"}</div>
                    </td>
                    <td className="px-3 py-4">
                      <span className={`rounded-full px-2 py-1 text-xs font-semibold ${STATUS_STYLES[payment.status] || STATUS_STYLES.pending}`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-3 py-4">
                      <div className="flex min-w-[180px] flex-col gap-2">
                        <button
                          type="button"
                          disabled={actionLoadingId === payment._id || payment.status === "verified"}
                          onClick={() => handleStatusChange(payment._id, "verified")}
                          className="rounded-lg bg-emerald-600 px-3 py-2 font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                        >
                          {actionLoadingId === payment._id && payment.status !== "verified" ? "Updating..." : "Verify"}
                        </button>
                        <button
                          type="button"
                          disabled={actionLoadingId === payment._id || payment.status === "pending"}
                          onClick={() => handleStatusChange(payment._id, "pending")}
                          className="rounded-lg bg-amber-500 px-3 py-2 font-semibold text-white hover:bg-amber-600 disabled:opacity-50"
                        >
                          Set Pending
                        </button>
                        <button
                          type="button"
                          disabled={actionLoadingId === payment._id || payment.status === "rejected"}
                          onClick={() => handleStatusChange(payment._id, "rejected")}
                          className="rounded-lg bg-rose-600 px-3 py-2 font-semibold text-white hover:bg-rose-700 disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default A_PaymentManagement;
