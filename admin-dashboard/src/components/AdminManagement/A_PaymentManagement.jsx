import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AdminLayout from "./admin_layout";
import { downloadFilteredPdfReport } from "./admin_pdf_utils";
import { PAGE_ACCESS } from "./admin_utils";

const API_URL = "http://localhost:5000/api";
const EMPTY_FORM = {
  paymentType: "internship_post",
  companyId: "",
  companyName: "",
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
  ]
};

const STATUS_STYLES = {
  verified: "bg-emerald-100 text-emerald-700",
  pending: "bg-amber-100 text-amber-700",
  rejected: "bg-rose-100 text-rose-700"
};

const formatStatusLabel = (status) => {
  if (status === "verified") return "Verified";
  if (status === "pending") return "Pending";
  if (status === "rejected") return "Rejected";
  return "Pending";
};
const PAYMENT_LABELS = {
  internship_post: "Internship Post",
  pro_account: "Pro Account",
  other: "Other"
};

const getStoredAdminSession = () => {
  const saved = localStorage.getItem("stepin_admin_session");
  if (!saved) {
    return null;
  }

  try {
    return JSON.parse(saved);
  } catch (err) {
    return null;
  }
};

const A_PaymentManagement = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [filters, setFilters] = useState({ status: "all" });
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [adminSession, setAdminSession] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [rejectingPayment, setRejectingPayment] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

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

  const filteredPayments = useMemo(() => {
    return payments.filter((item) => {
      if (filters.status !== "all" && item.status !== filters.status) {
        return false;
      }

      if (searchTerm.trim()) {
        const searchableContent = [
          item.companyName,
          item.name,
          item.nic,
          item.phoneNumber,
          item.payerEmail,
          item.referenceNo,
          item.internshipTitle,
          item.paymentType,
          item.bankName,
          item.branchName,
          item.accountNumber,
          item.companyId,
          item.notes
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        if (!searchableContent.includes(searchTerm.trim().toLowerCase())) {
          return false;
        }
      }

      return true;
    });
  }, [filters, payments, searchTerm]);

  const paymentSummary = useMemo(() => {
    return payments.reduce(
      (summary, item) => {
        summary.total += 1;
        summary.amount += Number(item.amount || 0);
        summary.companies += 1;
        return summary;
      },
      { total: 0, amount: 0, companies: 0 }
    );
  }, [payments]);

  useEffect(() => {
    setAdminSession(getStoredAdminSession());
  }, []);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(`${API_URL}/payments/admin`, authConfig);
      setPayments(Array.isArray(response.data?.data) ? response.data.data : []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load payments");
    } finally {
      setLoading(false);
    }
  }, [authConfig]);

  useEffect(() => {
    if (adminSession?.token) {
      fetchPayments();
    }
  }, [adminSession, fetchPayments]);

  const handleStatusChange = async (paymentId, status) => {
    setActionLoadingId(paymentId);
    setError("");
    setSuccess("");

    try {
      const response = await axios.put(
        `${API_URL}/payments/${paymentId}/status`,
        { status },
        authConfig
      );

      const updatedPayment = response.data?.data;
      setPayments((current) =>
        current.map((payment) =>
          payment._id === paymentId
            ? {
                ...payment,
                ...(updatedPayment || {}),
                status
              }
            : payment
        )
      );
      setSuccess(`Payment marked as ${status}.`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update payment");
    } finally {
      setActionLoadingId("");
    }
  };

  const openRejectDialog = (payment) => {
    setRejectingPayment(payment);
    setRejectionReason(payment?.rejectionReason || "");
    setError("");
    setSuccess("");
  };

  const closeRejectDialog = () => {
    setRejectingPayment(null);
    setRejectionReason("");
  };

  const handleRejectSubmit = async () => {
    if (!rejectingPayment?._id) {
      return;
    }

    if (!rejectionReason.trim()) {
      setError("Please enter the reason for rejecting this payment.");
      return;
    }

    setActionLoadingId(rejectingPayment._id);
    setError("");
    setSuccess("");

    try {
      const response = await axios.put(
        `${API_URL}/payments/${rejectingPayment._id}/status`,
        { status: "rejected", rejectionReason: rejectionReason.trim() },
        authConfig
      );

      const updatedPayment = response.data?.data;
      setPayments((current) =>
        current.map((payment) =>
          payment._id === rejectingPayment._id
            ? {
                ...payment,
                ...(updatedPayment || {}),
                status: "rejected",
                rejectionReason: rejectionReason.trim()
              }
            : payment
        )
      );
      setSuccess("Payment rejected and company notification saved.");
      closeRejectDialog();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reject payment");
    } finally {
      setActionLoadingId("");
    }
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
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

  const formatDate = (value) => {
    if (!value) return "-";
    return new Date(value).toLocaleString();
  };

  const displayPartyName = (payment) => payment.companyName || "-";

  const filterButtonClass = (group, value) =>
    `px-4 py-2 rounded-lg text-sm font-semibold transition ${
      filters[group] === value
        ? "bg-indigo-600 text-white"
        : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
    }`;

  const handleDownloadReport = () => {
    downloadFilteredPdfReport({
      fileName: "payment-records-report.pdf",
      title: "Payment Records Report",
      subtitle: "This report contains only the payment records visible after the current search and filter settings.",
      filters: {
        Search: searchTerm || "All",
        Status: filters.status === "all" ? "All" : filters.status
      },
      columns: [
        { key: "payer", label: "Payer" },
        { key: "paymentType", label: "Payment Type" },
        { key: "email", label: "Email" },
        { key: "phoneNumber", label: "Phone Number" },
        { key: "referenceNo", label: "Reference No" },
        { key: "bankName", label: "Bank Name" },
        { key: "amount", label: "Amount" },
        { key: "status", label: "Status" },
        { key: "paymentDate", label: "Payment Date" }
      ],
      rows: filteredPayments.map((payment) => ({
        payer: displayPartyName(payment),
        paymentType: PAYMENT_LABELS[payment.paymentType] || payment.paymentType || "-",
        email: payment.payerEmail || "-",
        phoneNumber: payment.phoneNumber || "-",
        referenceNo: payment.referenceNo || "-",
        bankName: payment.bankName || "-",
        amount: `Rs ${Number(payment.amount || 0).toFixed(2)}`,
        status: formatStatusLabel(payment.status),
        paymentDate: formatDate(payment.paymentDate)
      }))
    });
  };

  if (!adminSession?.token) {
    return (
      <AdminLayout
        title="Payment Data"
        description="Manage company payment records."
        allowedRoles={PAGE_ACCESS.payments}
      >
        <div className="mx-auto max-w-4xl rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-900 shadow-sm">
          Admin login is required to manage payment records.
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Payment Data"
      description="Record, review, and update all company payments from one admin workspace."
      allowedRoles={PAGE_ACCESS.payments}
    >
      <div className="space-y-6">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 md:p-8">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-200">
              <p className="text-sm text-slate-500">Total Records</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{paymentSummary.total}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-200">
              <p className="text-sm text-slate-500">Company Payments</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{paymentSummary.companies}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-200">
              <p className="text-sm text-slate-500">Recorded Amount</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                Rs {paymentSummary.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="rounded-xl border border-cyan-200 bg-gradient-to-br from-cyan-50 via-sky-50 to-indigo-50 p-4 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-wide text-cyan-700">Ranking And Analysis</p>
              <p className="mt-2 text-sm text-slate-700">Go to the Top Partners page to see company ranking, then open Analyze for charts and updates.</p>
              <button
                type="button"
                onClick={() => navigate("/payments/top-partners")}
                className="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-cyan-600 via-sky-600 to-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:from-cyan-700 hover:via-sky-700 hover:to-indigo-700"
              >
                Open Top Partners Page
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Add Payment Record</h2>
              <p className="text-slate-600 mt-1">Enter the full company payment details required by the backend.</p>
            </div>
            <div className="text-sm text-slate-600 bg-slate-100 px-4 py-2 rounded-lg">
              Admin: {adminSession?.admin?.fullName || "System Admin"}
            </div>
          </div>

          {error ? (
            <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700">
              {error}
            </div>
          ) : null}
          {success ? (
            <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-700">
              {success}
            </div>
          ) : null}

          <form onSubmit={handleCreatePayment} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <label className="text-sm text-slate-700">
              <span className="mb-1 block font-medium">Payment Type</span>
              <select name="paymentType" value={formData.paymentType} onChange={handleFormChange} className="w-full rounded-lg border border-slate-300 px-3 py-2">
                {PAYMENT_TYPE_OPTIONS.company.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>
            <label className="text-sm text-slate-700">
              <span className="mb-1 block font-medium">Company ID</span>
              <input name="companyId" value={formData.companyId} onChange={handleFormChange} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
            </label>
            <label className="text-sm text-slate-700">
              <span className="mb-1 block font-medium">Company Name</span>
              <input required name="companyName" value={formData.companyName} onChange={handleFormChange} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
            </label>

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

            <label className="text-sm text-slate-700">
              <span className="mb-1 block font-medium">Internship ID</span>
              <input name="internshipId" value={formData.internshipId} onChange={handleFormChange} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
            </label>
            <label className="text-sm text-slate-700">
              <span className="mb-1 block font-medium">Internship Title</span>
              <input name="internshipTitle" value={formData.internshipTitle} onChange={handleFormChange} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
            </label>

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
          <div className="flex flex-col gap-4 mb-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Payment Records</h1>
              <p className="text-slate-600 mt-1">All company payments in one table.</p>
            </div>

            <div className="w-full lg:max-w-md">
              <label className="block text-sm text-slate-700">
                <span className="mb-1 block font-medium">Search payment records</span>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search by payer, email, reference, bank..."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </label>
            </div>
          </div>

          <div className="mb-6 flex flex-wrap gap-3">
            <button type="button" onClick={() => setFilters((current) => ({ ...current, status: "all" }))} className={filterButtonClass("status", "all")}>All Statuses</button>
            <button type="button" onClick={() => setFilters((current) => ({ ...current, status: "pending" }))} className={filterButtonClass("status", "pending")}>Pending</button>
            <button type="button" onClick={() => setFilters((current) => ({ ...current, status: "verified" }))} className={filterButtonClass("status", "verified")}>Verified</button>
            <button type="button" onClick={() => setFilters((current) => ({ ...current, status: "rejected" }))} className={filterButtonClass("status", "rejected")}>Rejected</button>
            <button
              type="button"
              onClick={handleDownloadReport}
              disabled={filteredPayments.length === 0}
              className="rounded-lg bg-gradient-to-r from-violet-700 to-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:from-violet-800 hover:to-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Export PDF
            </button>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-600">Loading payments...</div>
          ) : error ? (
            <div className="rounded-lg bg-rose-50 p-4 text-rose-700 border border-rose-200">
              <p className="font-semibold">Error loading payments:</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-slate-600 text-lg">No payments found for the current search and filters.</p>
              <p className="text-slate-500 text-sm mt-3">Payments will appear here when:</p>
              <ul className="text-slate-500 text-sm mt-2 space-y-1">
                <li>- Companies submit payment slips from the payment upload page</li>
                <li>- You manually add payment records using the form above</li>
              </ul>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredPayments.map((payment) => (
                <div key={payment._id} className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-xl font-bold text-slate-900">{displayPartyName(payment)}</h3>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[payment.status] || STATUS_STYLES.pending}`}>
                          {formatStatusLabel(payment.status)}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-slate-700">
                        {PAYMENT_LABELS[payment.paymentType] || payment.paymentType}
                        {payment.internshipTitle ? ` • ${payment.internshipTitle}` : ""}
                      </p>
                      <p className="text-sm text-slate-500">Record ID: {payment._id}</p>
                    </div>

                    <div className="rounded-xl bg-white px-4 py-3 text-left shadow-sm xl:min-w-[190px] xl:text-right">
                      <p className="text-sm text-slate-500">Amount</p>
                      <p className="mt-1 text-2xl font-bold text-slate-900">Rs {Number(payment.amount || 0).toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4 lg:grid-cols-2 2xl:grid-cols-4">
                    <div className="rounded-xl border border-slate-200 bg-white p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Company Details</p>
                      <div className="mt-3 space-y-1 text-sm text-slate-700 break-words">
                        <p>Company ID: {payment.companyId || "-"}</p>
                        <p>Account Name: {payment.name || "-"}</p>
                        <p>Email: {payment.payerEmail || "-"}</p>
                        <p>Phone: {payment.phoneNumber || "-"}</p>
                        <p>NIC: {payment.nic || "-"}</p>
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Bank Details</p>
                      <div className="mt-3 space-y-1 text-sm text-slate-700 break-words">
                        <p>Bank: {payment.bankName || "-"}</p>
                        <p>Branch: {payment.branchName || "-"}</p>
                        <p>Account No: {payment.accountNumber || "-"}</p>
                        <p>Reference: {payment.referenceNo || "-"}</p>
                        <p>
                          Slip:{" "}
                          {payment.slipUrl ? (
                            <a href={payment.slipUrl} target="_blank" rel="noreferrer" className="font-semibold text-indigo-600 hover:underline">
                              View Slip
                            </a>
                          ) : "-"}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Payment Timeline</p>
                      <div className="mt-3 space-y-1 text-sm text-slate-700">
                        <p>Payment Date: {formatDate(payment.paymentDate)}</p>
                        <p>Payment Time: {payment.paymentTime || "-"}</p>
                        <p>Created: {formatDate(payment.createdAt)}</p>
                        <p>Recorded By: {payment.recordedByAdminName || "-"}</p>
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Actions And Notes</p>
                      <div className="mt-3 space-y-3">
                        <div className="space-y-2">
                          <button
                            type="button"
                            disabled={actionLoadingId === payment._id || payment.status === "verified"}
                            onClick={() => handleStatusChange(payment._id, "verified")}
                            className="w-full rounded-lg bg-emerald-600 px-3 py-2 font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                          >
                            {actionLoadingId === payment._id && payment.status !== "verified" ? "Updating..." : "Verify"}
                          </button>
                          <button
                            type="button"
                            disabled={actionLoadingId === payment._id || payment.status === "pending"}
                            onClick={() => handleStatusChange(payment._id, "pending")}
                            className="w-full rounded-lg bg-amber-500 px-3 py-2 font-semibold text-white hover:bg-amber-600 disabled:opacity-50"
                          >
                            Set Pending
                          </button>
                          <button
                            type="button"
                            disabled={actionLoadingId === payment._id}
                            onClick={() => openRejectDialog(payment)}
                            className="w-full rounded-lg bg-rose-600 px-3 py-2 font-semibold text-white hover:bg-rose-700 disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </div>
                        {payment.notes ? (
                          <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
                            <p className="font-medium text-slate-700">Notes</p>
                            <p className="mt-1 break-words">{payment.notes}</p>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {rejectingPayment ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="text-2xl font-bold text-slate-900">Reject Payment</h3>
                <p className="mt-1 text-sm text-slate-600">
                  Type the reason below. This message will be shown to the company as a notification.
                </p>
              </div>
              <button
                type="button"
                onClick={closeRejectDialog}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
              >
                Close
              </button>
            </div>

            <div className="mt-5 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
              <div><span className="font-semibold text-slate-900">Company:</span> {displayPartyName(rejectingPayment)}</div>
              <div className="mt-2"><span className="font-semibold text-slate-900">Amount:</span> Rs {Number(rejectingPayment.amount || 0).toFixed(2)}</div>
              <div className="mt-2"><span className="font-semibold text-slate-900">Reference:</span> {rejectingPayment.referenceNo || "-"}</div>
            </div>

            <label className="mt-5 block text-sm text-slate-700">
              <span className="mb-2 block font-medium">Reason for rejecting</span>
              <textarea
                value={rejectionReason}
                onChange={(event) => setRejectionReason(event.target.value)}
                rows="5"
                placeholder="Example: Payment slip is unclear, reference number does not match bank rules, or amount is incorrect."
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
              />
            </label>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeRejectDialog}
                className="rounded-lg border border-slate-300 px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoadingId === rejectingPayment._id}
                onClick={handleRejectSubmit}
                className="rounded-lg bg-rose-600 px-5 py-3 font-semibold text-white transition hover:bg-rose-700 disabled:opacity-50"
              >
                {actionLoadingId === rejectingPayment._id ? "Sending..." : "Send Rejection"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </AdminLayout>
  );
};

export default A_PaymentManagement;
