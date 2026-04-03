import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from './admin_layout';
import { PAGE_ACCESS } from './admin_utils';

const API_URL = 'http://localhost:5000/api';
const CHART_COLORS = ['#0f766e', '#06b6d4', '#f59e0b', '#f97316', '#8b5cf6', '#0284c7', '#84cc16', '#ec4899'];

const formatCurrency = (amount) =>
  `Rs ${Number(amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const getStoredAdminSession = () => {
  const modernSession = localStorage.getItem('stepin_admin_session');
  if (modernSession) {
    try {
      return JSON.parse(modernSession);
    } catch {
      return null;
    }
  }

  const legacySession = localStorage.getItem('adminSession');
  if (legacySession) {
    try {
      return JSON.parse(legacySession);
    } catch {
      return null;
    }
  }

  return null;
};

const AdminPaymentAnalyticsPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [adminSession] = useState(getStoredAdminSession());

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
      percentage: (Number(company.totalAmount || 0) / total) * 100,
    }));
  }, [analytics]);

  const maxCompanyAmount = useMemo(
    () => Math.max(...companyChartData.map((item) => Number(item.totalAmount || 0)), 1),
    [companyChartData]
  );

  const pieChartStyle = useMemo(() => {
    if (companyChartData.length === 0) {
      return { background: 'conic-gradient(#e2e8f0 0deg 360deg)' };
    }

    let currentAngle = 0;
    const segments = companyChartData.map((item) => {
      const start = currentAngle;
      const end = currentAngle + (item.percentage / 100) * 360;
      currentAngle = end;
      return `${item.color} ${start}deg ${end}deg`;
    });

    return { background: `conic-gradient(${segments.join(', ')})` };
  }, [companyChartData]);

  useEffect(() => {
    if (!adminSession?.token) {
      setError('Please login as admin to view analytics');
      setLoading(false);
      return;
    }

    let isMounted = true;

    const loadAnalytics = async (showLoader = true) => {
      if (showLoader) setLoading(true);
      setError('');

      try {
        const response = await axios.get(`${API_URL}/payments/admin/analytics`, authConfig);
        if (!response.data?.success) {
          throw new Error(response.data?.message || 'Unknown server error');
        }

        if (!isMounted) return;
        setAnalytics(response.data.data);
        setLastUpdated(new Date().toLocaleTimeString());
      } catch (requestError) {
        if (!isMounted) return;
        setError(requestError.response?.data?.message || requestError.message || 'Unable to load analytics');
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
    <AdminLayout
      title="Payment Analytics"
      description="Visual analytics for company payment amounts, status distribution, and top partner performance."
      allowedRoles={PAGE_ACCESS.payments}
    >
      <div className="space-y-6">
        <div className="rounded-3xl border border-cyan-100 bg-[linear-gradient(135deg,_rgba(236,254,255,0.98)_0%,_rgba(239,246,255,0.98)_52%,_rgba(255,251,235,0.96)_100%)] p-6 shadow-xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-700">Live Analytics Board</p>
              <h2 className="text-3xl font-bold text-slate-900">Company Payment Ranking & Analytics</h2>
              <p className="mt-1 text-slate-600">
                This page shows total payments, status breakdown, and company amount analysis.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setRefreshKey((current) => current + 1)}
                className="rounded-xl border border-cyan-200 bg-white px-4 py-2 text-sm font-semibold text-cyan-800 transition hover:bg-cyan-50"
              >
                Refresh
              </button>
              <Link
                to="/payments/top-partners"
                className="rounded-xl bg-gradient-to-r from-cyan-600 via-sky-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:from-cyan-700 hover:via-sky-700 hover:to-indigo-700"
              >
                Back to Top Partners
              </Link>
            </div>
          </div>
          <p className="mt-3 text-sm text-slate-500">Auto-refresh every 30 seconds{lastUpdated ? ` | Last updated ${lastUpdated}` : ''}</p>
        </div>

        {loading && <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-600">Loading analytics...</div>}
        {error && !loading && <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700">{error}</div>}

        {!loading && !error && analytics && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-2xl border border-sky-200 bg-gradient-to-br from-white to-sky-50 p-6 shadow-xl">
                <p className="text-sm font-semibold text-sky-700">Total Payments</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">{analytics.totalPayments}</p>
              </div>
              <div className="rounded-2xl border border-teal-200 bg-gradient-to-br from-white to-teal-50 p-6 shadow-xl">
                <p className="text-sm font-semibold text-teal-700">Total Amount</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">{formatCurrency(analytics.totalAmount)}</p>
              </div>
              <div className="rounded-2xl border border-orange-200 bg-gradient-to-br from-white to-orange-50 p-6 shadow-xl">
                <p className="text-sm font-semibold text-orange-700">Company Payments</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {analytics.payerCounts?.find((item) => item._id === 'company')?.count || 0}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
              <h3 className="text-xl font-bold text-slate-900">Status Breakdown</h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {analytics.statusCounts?.map((stats) => (
                  <div
                    key={stats._id}
                    className={`rounded-xl border p-4 ${
                      stats._id === 'verified'
                        ? 'border-teal-200 bg-teal-50'
                        : stats._id === 'pending'
                          ? 'border-amber-200 bg-amber-50'
                          : 'border-rose-200 bg-rose-50'
                    }`}
                  >
                    <p className="text-xs uppercase tracking-wider text-slate-500">{stats._id || 'N/A'}</p>
                    <p className="mt-1 text-2xl font-bold text-slate-900">{stats.count}</p>
                    <p className="text-sm text-slate-500">{formatCurrency(stats.amount)}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-cyan-200 bg-gradient-to-br from-white via-cyan-50/70 to-sky-50 p-6 shadow-xl">
                <h3 className="text-xl font-bold text-slate-900">Company Amount Pie Chart</h3>
                <p className="mt-1 text-sm text-slate-500">Share of total company payment amount by top partner.</p>

                {companyChartData.length === 0 ? (
                  <div className="mt-4 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5 text-slate-500">
                    No company payment data available for charting.
                  </div>
                ) : (
                  <div className="mt-6 grid gap-6 md:grid-cols-[240px_1fr] md:items-center">
                    <div className="mx-auto flex h-56 w-56 items-center justify-center rounded-full shadow-[0_18px_40px_rgba(14,116,144,0.14)]" style={pieChartStyle}>
                      <div className="flex h-28 w-28 items-center justify-center rounded-full bg-white text-center shadow-[inset_0_0_24px_rgba(14,116,144,0.12)]">
                        <div>
                          <p className="text-xs uppercase tracking-wide text-slate-500">Companies</p>
                          <p className="text-2xl font-bold text-slate-900">{companyChartData.length}</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {companyChartData.map((company) => (
                        <div
                          key={`${company.companyId}-${company.companyName}-pie`}
                          className="flex items-center justify-between gap-4 rounded-xl border border-white/80 bg-white/85 px-4 py-3 shadow-sm"
                        >
                          <div className="flex items-center gap-3">
                            <span className="h-4 w-4 rounded-full" style={{ backgroundColor: company.color }} />
                            <div>
                              <p className="font-semibold text-slate-800">{company.companyName || 'Unknown'}</p>
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

              <div className="rounded-2xl border border-orange-200 bg-gradient-to-br from-white via-orange-50/80 to-amber-50 p-6 shadow-xl">
                <h3 className="text-xl font-bold text-slate-900">Company Amount Bar Chart</h3>
                <p className="mt-1 text-sm text-slate-500">Compare top company payments by total recorded amount.</p>

                {companyChartData.length === 0 ? (
                  <div className="mt-4 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5 text-slate-500">
                    No company payment data available for charting.
                  </div>
                ) : (
                  <div className="mt-6 space-y-4">
                    {companyChartData.map((company) => (
                      <div key={`${company.companyId}-${company.companyName}-bar`} className="rounded-xl bg-white/85 p-4 shadow-sm">
                        <div className="flex items-end justify-between gap-4">
                          <div>
                            <p className="font-semibold text-slate-800">{company.companyName || 'Unknown'}</p>
                            <p className="text-xs text-slate-500">Company ID: {company.companyId || '-'}</p>
                          </div>
                          <p className="text-sm font-bold text-slate-900">{formatCurrency(company.totalAmount)}</p>
                        </div>
                        <div className="mt-3 h-4 overflow-hidden rounded-full bg-orange-100">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.max((Number(company.totalAmount || 0) / maxCompanyAmount) * 100, 6)}%`,
                              backgroundColor: company.color,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminPaymentAnalyticsPage;
