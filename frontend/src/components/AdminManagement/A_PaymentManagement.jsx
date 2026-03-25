import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:5000/api";
const PRO_ACCOUNT_AMOUNT = 6000;

const getPaymentCategory = (payment) => {
  if (payment?.paymentType === "internship_post" || payment?.paymentType === "pro_account") {
    return payment.paymentType;
  }

  // Support legacy records that were created before paymentType existed.
  if (payment?.internshipId || payment?.internshipTitle) {
    return "internship_post";
  }

  if (Number(payment?.amount) === PRO_ACCOUNT_AMOUNT) {
    return "pro_account";
  }

  return "internship_post";
};

const A_PaymentManagement = () => {
  const [payments, setPayments] = useState([]);
  const [activeCategory, setActiveCategory] = useState("internship_post");
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [adminSession, setAdminSession] = useState(null);

  const filteredPayments = useMemo(
    () => payments.filter((item) => getPaymentCategory(item) === activeCategory),
    [payments, activeCategory]
  );

  const formatDate = (value) => {
    if (!value) return "-";
    return new Date(value).toLocaleString();
  };

  const fetchPayments = async () => {
    setLoading(true);
    setError("");
    try {
      let response;
      try {
        response = await axios.get(`${API_URL}/payments`);
      } catch (primaryErr) {
        response = await axios.get(`${API_URL}/payments/all`);
      }
      const payload = response.data;
      const normalized = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload?.payments)
            ? payload.payments
            : [];
      setPayments(normalized);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load payments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem("adminSession");
    if (saved) {
      try {
        setAdminSession(JSON.parse(saved));
      } catch (err) {
        setAdminSession(null);
      }
    }
    fetchPayments();
  }, []);

  const handleVerify = async (paymentId) => {
    setActionLoadingId(paymentId);
    setError("");
    setSuccess("");

    try {
      await axios.put(`${API_URL}/payments/${paymentId}/status`, { status: "verified" });
      setSuccess("Payment verified successfully. Company pages will now show verified/active status.");
      await fetchPayments();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to verify payment");
    } finally {
      setActionLoadingId("");
    }
  };

  const categoryButtonClass = (category) =>
    `px-4 py-2 rounded-lg text-sm font-semibold transition ${
      activeCategory === category
        ? "bg-indigo-600 text-white"
        : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
    }`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-slate-100 py-10 px-4">
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-xl border border-slate-200 p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Admin Payment Management</h1>
            <p className="text-slate-600 mt-1">Review all payment records and verify manually.</p>
          </div>
          <div className="text-sm text-slate-600 bg-slate-100 px-4 py-2 rounded-lg">
            Admin: {adminSession?.name || "System Admin"}
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <button
            type="button"
            onClick={() => setActiveCategory("internship_post")}
            className={categoryButtonClass("internship_post")}
          >
            Company Post Payments
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory("pro_account")}
            className={categoryButtonClass("pro_account")}
          >
            Pro Account Payments
          </button>
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
        ) : filteredPayments.length === 0 ? (
          <div className="py-12 text-center text-slate-600">No payments found in this category.</div>
        ) : (
          <div className="space-y-4">
            {filteredPayments.map((payment) => (
              <div key={payment._id} className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-slate-700 flex-1">
                    <p><span className="font-semibold">Payment ID:</span> {payment._id}</p>
                    <p><span className="font-semibold">Type:</span> {getPaymentCategory(payment) === "pro_account" ? "Pro Account" : "Internship Post"}</p>
                    <p><span className="font-semibold">Company Name:</span> {payment.companyName}</p>
                    <p><span className="font-semibold">Company ID:</span> {payment.companyId}</p>
                    {payment.internshipTitle ? <p><span className="font-semibold">Internship:</span> {payment.internshipTitle}</p> : <p><span className="font-semibold">Plan:</span> Pro Account Upgrade</p>}
                    <p><span className="font-semibold">Amount:</span> Rs {Number(payment.amount || 0).toFixed(2)}</p>
                    <p><span className="font-semibold">Name:</span> {payment.name}</p>
                    <p><span className="font-semibold">NIC:</span> {payment.nic}</p>
                    <p><span className="font-semibold">Phone:</span> {payment.phoneNumber}</p>
                    <p><span className="font-semibold">Bank:</span> {payment.bankName}</p>
                    <p><span className="font-semibold">Branch:</span> {payment.branchName}</p>
                    <p><span className="font-semibold">Account No:</span> {payment.accountNumber}</p>
                    <p><span className="font-semibold">Reference No:</span> {payment.referenceNo}</p>
                    <p><span className="font-semibold">Payment Date:</span> {formatDate(payment.paymentDate)}</p>
                    <p><span className="font-semibold">Submitted At:</span> {formatDate(payment.createdAt)}</p>
                    <p>
                      <span className="font-semibold">Status:</span>{" "}
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          payment.status === "verified"
                            ? "bg-emerald-100 text-emerald-700"
                            : payment.status === "pending"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-rose-100 text-rose-700"
                        }`}
                      >
                        {payment.status}
                      </span>
                    </p>
                    <p>
                      <span className="font-semibold">Slip:</span>{" "}
                      <a
                        href={payment.slipUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-600 hover:underline"
                      >
                        View Uploaded Slip
                      </a>
                    </p>
                  </div>

                  <div className="min-w-[180px]">
                    <button
                      type="button"
                      disabled={payment.status === "verified" || actionLoadingId === payment._id}
                      onClick={() => handleVerify(payment._id)}
                      className="w-full px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 disabled:opacity-50"
                    >
                      {payment.status === "verified"
                        ? "Already Verified"
                        : actionLoadingId === payment._id
                          ? "Verifying..."
                          : "Verify Payment"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default A_PaymentManagement;
