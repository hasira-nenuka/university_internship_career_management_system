import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import AdminLayout from "./admin_layout";
import { PAGE_ACCESS } from "./admin_utils";

const API_URL = "http://localhost:5000/api";

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
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Company Payment Ranking</h2>
            <p className="mt-1 text-slate-600">
              This list updates automatically from your current payment records.
            </p>
          </div>

          <Link
            to="/payments"
            className="inline-flex items-center justify-center rounded-lg border border-indigo-200 bg-white px-5 py-3 font-semibold text-indigo-700 transition hover:border-indigo-500 hover:text-indigo-800"
          >
            Back to Payment Data
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <p className="text-sm text-slate-500">Companies Ranked</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{partnerTotals.length}</p>
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 shadow-xl">
            <p className="text-sm text-emerald-700">Highest Paid Company</p>
            <p className="mt-2 text-xl font-bold text-slate-900">{highestPartner?.companyName || "-"}</p>
            <p className="mt-1 text-lg font-semibold text-emerald-700">
              {highestPartner
                ? `Rs ${highestPartner.amount.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}`
                : "-"}
            </p>
          </div>
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 shadow-xl">
            <p className="text-sm text-amber-700">Lowest Paid Company</p>
            <p className="mt-2 text-xl font-bold text-slate-900">{lowestPartner?.companyName || "-"}</p>
            <p className="mt-1 text-lg font-semibold text-amber-700">
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
            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-y-3 text-sm text-slate-700">
                <thead>
                  <tr className="text-left text-slate-500">
                    <th className="px-4 py-2">Rank</th>
                    <th className="px-4 py-2">Company Name</th>
                    <th className="px-4 py-2">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {partnerTotals.map((partner, index) => (
                    <tr key={partner.companyName} className="rounded-2xl bg-slate-50 shadow-sm">
                      <td className="px-4 py-4 font-semibold text-slate-900">#{index + 1}</td>
                      <td className="px-4 py-4 font-semibold text-slate-900">{partner.companyName}</td>
                      <td className="px-4 py-4 font-semibold text-indigo-700">
                        Rs{" "}
                        {partner.amount.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminTopPartnersPage;
