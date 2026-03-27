import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { requestProAccountUpgrade } from "../CompanyManagement/C_CompanyUtils";

const P_ProAccountUpgrade = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const companyId = useMemo(() => state?.companyId || localStorage.getItem("companyId") || "", [state]);
  const companyName = useMemo(() => state?.companyName || localStorage.getItem("companyName") || "", [state]);

  const handleProceedToPayment = async () => {
    setLoading(true);
    setError("");

    try {
      await requestProAccountUpgrade();

      navigate("/payments/upload", {
        state: {
          companyId,
          companyName,
          paymentType: "pro_account",
          fixedAmount: 6000,
          planName: "Pro Account",
          planCycleDays: 30
        }
      });
    } catch (err) {
      setError(err.message || "Failed to start the pro account payment request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-cyan-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl border border-emerald-100 p-8">
          <h1 className="text-3xl font-bold text-emerald-700">Upgrade to Pro Account</h1>
          <p className="text-gray-600 mt-2">
            Unlock premium company tools to find students faster and scale recruitment.
          </p>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6">
              <div className="text-sm text-emerald-700 font-semibold">Pro Plan</div>
              <div className="mt-3 text-4xl font-extrabold text-emerald-800">Rs 6,000.00</div>
              <div className="text-gray-600 mt-2">Every 30 days</div>
              <div className="text-xs text-gray-500 mt-4">
                Pro access will automatically become inactive after 30 days unless renewed.
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-6">
              <div className="text-sm font-semibold text-slate-700">Benefits</div>
              <ul className="mt-3 space-y-2 text-slate-700 text-sm">
                <li>Unlimited direct student search by job category and district</li>
                <li>Unlimited internship/job post publishing</li>
                <li>Priority recruitment workflow for company users</li>
              </ul>
            </div>
          </div>

          <div className="mt-8 rounded-xl border border-slate-200 p-4 bg-white">
            <div className="text-sm text-slate-600">Company</div>
            <div className="font-semibold text-slate-900">{companyName || "Company Account"}</div>
          </div>

          <div className="mt-8 flex gap-3">
            <button
              onClick={handleProceedToPayment}
              disabled={loading}
              className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-semibold disabled:opacity-50"
            >
              {loading ? "Please wait..." : "Continue to Payment"}
            </button>
            <button
              onClick={() => navigate("/company/dashboard", { state: { activeTab: "profile" } })}
              className="px-6 py-3 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 font-semibold"
            >
              Back to Profile
            </button>
          </div>

          {error ? (
            <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default P_ProAccountUpgrade;
