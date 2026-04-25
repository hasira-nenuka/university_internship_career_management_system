import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import AdminLayout from "./admin_layout";
import { PAGE_ACCESS } from "./admin_utils";

const API_URL = "http://localhost:5000/api";
const PAYMENT_REFRESH_KEY = "admin_payments_last_updated";

const getStoredAdminSession = () => {
  const saved = localStorage.getItem("stepin_admin_session");
  if (!saved) {
    return null;
  }

  try {
    return JSON.parse(saved);
  } catch (error) {
    return null;
  }
};

const AdminTopPartnersPage = () => {
  const [adminSession, setAdminSession] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
      setError(err.response?.data?.message || "Failed to load top partner data");
    } finally {
      setLoading(false);
    }
  }, [authConfig]);

  useEffect(() => {
    if (adminSession?.token) {
      fetchPayments();
    }
  }, [adminSession, fetchPayments]);

  useEffect(() => {
    if (!adminSession?.token) {
      return undefined;
    }

    const handleStorage = (event) => {
      if (event.key === PAYMENT_REFRESH_KEY) {
        fetchPayments();
      }
    };

    const handleFocus = () => {
      fetchPayments();
    };

    const refreshInterval = setInterval(() => {
      fetchPayments();
    }, 30000);

    window.addEventListener("storage", handleStorage);
    window.addEventListener("focus", handleFocus);

    return () => {
      clearInterval(refreshInterval);
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("focus", handleFocus);
    };
  }, [adminSession, fetchPayments]);

  const partnerTotals = useMemo(() => {
    const latestPaymentsMap = payments.reduce((accumulator, payment) => {
      const companyName = (payment.companyName || "").trim() || "Unknown Company";
      const amount = Number(payment.amount || 0);
      const paymentTimestamp = new Date(payment.paymentDate || payment.createdAt || 0).getTime();

      if (!accumulator[companyName]) {
        accumulator[companyName] = {
          companyName,
          amount,
          paymentTimestamp
        };
        return accumulator;
      }

      if (paymentTimestamp >= accumulator[companyName].paymentTimestamp) {
        accumulator[companyName] = {
          companyName,
          amount,
          paymentTimestamp
        };
      }

      return accumulator;
    }, {});

    return Object.values(latestPaymentsMap).sort(
      (firstCompany, secondCompany) => secondCompany.amount - firstCompany.amount
    );
  }, [payments]);

  const highestPartner = partnerTotals[0] || null;
  const lowestPartner = partnerTotals.length > 0 ? partnerTotals[partnerTotals.length - 1] : null;

  return (
    <AdminLayout
      title="Top Partners"
      description="Companies ranked automatically by payment amount, from highest to lowest."
      allowedRoles={PAGE_ACCESS.payments}
    >
      <div className="space-y-6">
        <div className="rounded-3xl border border-violet-200 bg-[linear-gradient(135deg,_rgba(245,243,255,0.98)_0%,_rgba(224,231,255,0.98)_32%,_rgba(219,234,254,0.98)_62%,_rgba(236,254,255,0.98)_100%)] p-6 shadow-xl shadow-indigo-100/80">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-violet-700">Company Ranking Board</p>
              <h2 className="mt-2 text-3xl font-bold text-slate-950">Company Payment Ranking</h2>
              <p className="mt-1 text-slate-700">
                This list updates automatically from your current payment records.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/payments/analytics"
                className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-sky-500 px-5 py-3 font-semibold text-white shadow-lg shadow-indigo-200/80 transition duration-200 hover:-translate-y-0.5 hover:from-violet-700 hover:via-indigo-700 hover:to-sky-600"
              >
                Analyze
              </Link>
              <Link
                to="/payments"
                className="inline-flex items-center justify-center rounded-xl border border-violet-200 bg-white/90 px-5 py-3 font-semibold text-violet-800 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-violet-300 hover:bg-violet-50"
              >
                Back to Payment Data
              </Link>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-sky-200 bg-gradient-to-br from-white to-sky-50 p-6 shadow-xl">
            <p className="text-sm font-semibold text-sky-700">Companies Ranked</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{partnerTotals.length}</p>
          </div>
          <div className="rounded-2xl border border-teal-200 bg-gradient-to-br from-teal-50 to-cyan-50 p-6 shadow-xl">
            <p className="text-sm font-semibold text-teal-700">Highest Paid Company</p>
            <p className="mt-2 text-xl font-bold text-slate-900">{highestPartner?.companyName || "-"}</p>
            <p className="mt-1 text-lg font-semibold text-teal-700">
              {highestPartner
                ? `Rs ${highestPartner.amount.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}`
                : "-"}
            </p>
          </div>
          <div className="rounded-2xl border border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 p-6 shadow-xl">
            <p className="text-sm font-semibold text-orange-700">Lowest Paid Company</p>
            <p className="mt-2 text-xl font-bold text-slate-900">{lowestPartner?.companyName || "-"}</p>
            <p className="mt-1 text-lg font-semibold text-orange-700">
              {lowestPartner
                ? `Rs ${lowestPartner.amount.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}`
                : "-"}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl md:p-8">
          {loading ? (
            <div className="py-12 text-center text-slate-600">Loading top partners...</div>
          ) : error ? (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700">{error}</div>
          ) : partnerTotals.length === 0 ? (
            <div className="py-12 text-center text-slate-600">
              No payment records found to rank companies yet.
            </div>
          ) : (
            <div className="space-y-4">
              {partnerTotals.map((partner, index) => (
                <div
                  key={partner.companyName}
                  className={`rounded-2xl border p-5 shadow-sm transition ${
                    index === 0
                      ? "border-teal-200 bg-gradient-to-r from-teal-50 via-cyan-50 to-white"
                      : index === partnerTotals.length - 1
                        ? "border-orange-200 bg-gradient-to-r from-orange-50 via-amber-50 to-white"
                        : "border-slate-200 bg-gradient-to-r from-slate-50 to-white"
                  }`}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-full text-base font-bold ${
                          index === 0
                            ? "bg-teal-600 text-white"
                            : index === 1
                              ? "bg-sky-600 text-white"
                              : index === 2
                                ? "bg-orange-500 text-white"
                                : "bg-slate-200 text-slate-700"
                        }`}
                      >
                        #{index + 1}
                      </div>
                      <div>
                        <p className="text-lg font-bold text-slate-900">{partner.companyName}</p>
                        <p className="text-sm text-slate-500">
                          {index === 0 ? "Top earning company" : index === partnerTotals.length - 1 ? "Lowest in current ranking" : "Active ranked partner"}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-xl bg-white px-4 py-3 shadow-sm">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Amount</p>
                      <p className={`mt-1 text-xl font-bold ${
                        index === 0 ? "text-teal-700" : index === partnerTotals.length - 1 ? "text-orange-700" : "text-sky-700"
                      }`}>
                        Rs{" "}
                        {partner.amount.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminTopPartnersPage;
