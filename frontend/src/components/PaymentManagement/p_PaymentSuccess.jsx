import React, { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const P_PaymentSuccess = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const isProPayment = state?.paymentType === "pro_account";

  const redirectPath = "/company/dashboard";
  const redirectState = isProPayment ? { activeTab: "profile" } : { activeTab: "internships" };
  const redirectLabel = isProPayment ? "Go to Company Profile" : "Go to My Internships";
  const redirectText = isProPayment
    ? "Your payment has been submitted. Redirecting to Company Profile..."
    : "Your payment has been submitted. Redirecting to My Internships...";

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate(redirectPath, { state: isProPayment ? { activeTab: "profile" } : { activeTab: "internships" } });
    }, 1800);

    return () => clearTimeout(timer);
  }, [navigate, redirectPath, isProPayment]);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-primary to-secondary py-8">

      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md border border-gray-200 text-center">

        <span className="text-6xl mb-4">✅</span>

        <h1 className="text-3xl font-bold text-primary mb-4">
          Payment Submitted Successfully
        </h1>

        <p className="text-gray-600 mb-6">{redirectText}</p>

        <Link
          to={redirectPath}
          state={redirectState}
          className="inline-block bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-semibold transition duration-200 shadow-lg"
        >
          {redirectLabel}
        </Link>

      </div>
    </div>
  );
};

export default P_PaymentSuccess;