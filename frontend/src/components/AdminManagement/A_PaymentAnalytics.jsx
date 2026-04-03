import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = "http://localhost:5000/api";

const formatCurrency = (amount) =>
  `Rs ${Number(amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const CHART_COLORS = ["#2563eb", "#0f766e", "#7c3aed", "#ea580c", "#dc2626", "#0891b2", "#65a30d", "#ca8a04"];

const getStoredAdminSession = () => {
  const modernSession = localStorage.getItem("stepin_admin_session");
  if (modernSession) {
    try {
      return JSON.parse(modernSession);
    } catch {
      return null;
    }
  }
  const legacySession = localStorage.getItem("adminSession");
  if (legacySession) {
    try {
      return JSON.parse(legacySession);
    } catch {
      return null;
    }
  }
  return null;
};

const A_PaymentAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [adminSession] = useState(getStoredAdminSession());
  const [lastUpdated, setLastUpdated] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const navigate = useNavigate();

  const authConfig = useMemo(() => {
    const token = adminSession?.token;
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  }, [adminSession]);

  const companyChartData = useMemo(() => {
    const partners = analytics?.topPartners || [];
    const total = partners.reduce((sum, item) => sum + Number(item.totalAmount || 0), 0) || 1;

    return partners.map((company, index) => ({
      ...company,
      color: CHART_COLORS[index % CHART_COLORS.length],
      percentage: (Number(company.totalAmount || 0) / total) * 100
    }));
  }, [analytics]);

  const maxCompanyAmount = useMemo(
    () => Math.max(...companyChartData.map((item) => Number(item.totalAmount || 0)), 1),
    [companyChartData]
  );

  const pieChartStyle = useMemo(() => {
    if (companyChartData.length === 0) {
      return { background: "conic-gradient(#e2e8f0 0deg 360deg)" };
    }

    let currentAngle = 0;
    const segments = companyChartData.map((item) => {
      const start = currentAngle;
      const end = currentAngle + (item.percentage / 100) * 360;
      currentAngle = end;
      return `${item.color} ${start}deg ${end}deg`;
    });

    return { background: `conic-gradient(${segments.join(", ")})` };
  }, [companyChartData]);

  useEffect(() => {
    if (!adminSession?.token) {
      setError("Please login as admin to view analytics");
      setLoading(false);
      return;
    }

    let isMounted = true;

    const loadAnalytics = async (showLoader = true) => {
      if (showLoader) setLoading(true);
      setError("");
      try {
        const response = await axios.get(`${API_URL}/payments/admin/analytics`, authConfig);
        if (!response.data?.success) {
          throw new Error(response.data?.message || "Unknown server error");
        }
        if (!isMounted) return;
        setAnalytics(response.data.data);
        setLastUpdated(new Date().toLocaleTimeString());
      } catch (e) {
        if (!isMounted) return;
        setError(e.response?.data?.message || e.message || "Unable to load analytics");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadAnalytics();
    const refreshInterval = setInterval(() => {
      loadAnalytics(false);
    }, 30000);

    return () => {
      isMounted = false;
      clearInterval(refreshInterval);
    };
  }, [adminSession, authConfig, refreshKey]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-slate-100 px-4 py-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Company Payment Ranking & Analytics</h1>
              <p className="mt-1 text-slate-600">This summary page shows total payments, status breakdown, and top companies by payment amount.</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setRefreshKey((current) => current + 1)}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Refresh
              </button>
              <button onClick={() => navigate("/admin/payments")} className="rounded-lg border border-indigo-300 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-100">Back to Management</button>
              <button onClick={() => document.getElementById("top-partners")?.scrollIntoView({ behavior: "smooth" })} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">Top Partners</button>
            </div>
          </div>
          <p className="mt-3 text-sm text-slate-500">Auto-refresh every 30 seconds{lastUpdated ? ` • Last updated ${lastUpdated}` : ""}</p>
        </div>

        {loading && <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-600">Loading analytics...</div>}
        {error && !loading && <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700">{error}</div>}

        {!loading && !error && analytics && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm text-slate-500">Total Payments</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">{analytics.totalPayments}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm text-slate-500">Total Amount</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">{formatCurrency(analytics.totalAmount)}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm text-slate-500">Company Payments</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">{analytics.payerCounts?.find((item) => item._id === "company")?.count || 0}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm text-slate-500">Student Payments</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">{analytics.payerCounts?.find((item) => item._id === "student")?.count || 0}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
              <h2 className="text-xl font-bold text-slate-900">Status Breakdown</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {analytics.statusCounts?.map((stats) => (
                  <div key={stats._id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-wider text-slate-500">{stats._id || "N/A"}</p>
                    <p className="mt-1 text-2xl font-bold text-slate-900">{stats.count}</p>
                    <p className="text-sm text-slate-500">{formatCurrency(stats.amount)}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Company Amount Pie Chart</h2>
                    <p className="mt-1 text-sm text-slate-500">Share of total company payment amount by top partner.</p>
                  </div>
                </div>

                {companyChartData.length === 0 ? (
                  <div className="mt-4 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5 text-slate-500">No company payment data available for charting.</div>
                ) : (
                  <div className="mt-6 grid gap-6 md:grid-cols-[240px_1fr] md:items-center">
                    <div className="mx-auto flex h-56 w-56 items-center justify-center rounded-full" style={pieChartStyle}>
                      <div className="flex h-28 w-28 items-center justify-center rounded-full bg-white text-center shadow-inner">
                        <div>
                          <p className="text-xs uppercase tracking-wide text-slate-500">Companies</p>
                          <p className="text-2xl font-bold text-slate-900">{companyChartData.length}</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {companyChartData.map((company) => (
                        <div key={`${company.companyId}-${company.companyName}-pie`} className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                          <div className="flex items-center gap-3">
                            <span className="h-4 w-4 rounded-full" style={{ backgroundColor: company.color }} />
                            <div>
                              <p className="font-semibold text-slate-800">{company.companyName || "Unknown"}</p>
                              <p className="text-xs text-slate-500">{company.percentage.toFixed(1)}% of company total</p>
                            </div>
                          </div>
                          <p className="text-sm font-bold text-slate-900">{formatCurrency(company.totalAmount)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Company Amount Bar Chart</h2>
                  <p className="mt-1 text-sm text-slate-500">Compare top company payments by total recorded amount.</p>
                </div>

                {companyChartData.length === 0 ? (
                  <div className="mt-4 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5 text-slate-500">No company payment data available for charting.</div>
                ) : (
                  <div className="mt-6 space-y-4">
                    {companyChartData.map((company) => (
                      <div key={`${company.companyId}-${company.companyName}-bar`} className="space-y-2">
                        <div className="flex items-end justify-between gap-4">
                          <div>
                            <p className="font-semibold text-slate-800">{company.companyName || "Unknown"}</p>
                            <p className="text-xs text-slate-500">Company ID: {company.companyId || "-"}</p>
                          </div>
                          <p className="text-sm font-bold text-slate-900">{formatCurrency(company.totalAmount)}</p>
                        </div>
                        <div className="h-4 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.max((Number(company.totalAmount || 0) / maxCompanyAmount) * 100, 6)}%`,
                              backgroundColor: company.color
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div id="top-partners" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">Company Payment Ranking</h2>
                <span className="text-sm text-slate-500">Top {analytics.topPartners?.length || 0} companies</span>
              </div>

              {analytics.topPartners?.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5 text-slate-500">No company payments found.</div>
              ) : (
                <div className="space-y-3">
                  {analytics.topPartners.map((company, index) => (
                    <div key={`${company.companyId}-${index}`} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold text-slate-700">#{index + 1} {company.companyName || "Unknown"}</p>
                          <p className="text-xs text-slate-500">ID: {company.companyId || "-"}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-base font-bold text-slate-900">{formatCurrency(company.totalAmount)}</p>
                          <p className="text-xs text-slate-500">Records: {company.totalRecords} | Verified: {company.verifiedRecords}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default A_PaymentAnalytics;
