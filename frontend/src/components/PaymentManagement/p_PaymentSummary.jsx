import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const P_PaymentSummary = () => {

  const { state } = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!state) return <div>No Data</div>;

  const timeString = state.time ? `${state.time.hours || '00'}:${state.time.minutes || '00'}:${state.time.seconds || '00'}` : '';

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append('companyId', state.companyId || localStorage.getItem('companyId') || '');
    formData.append('internshipId', state.internshipId || '');
    formData.append('internshipTitle', state.internshipTitle || '');
    formData.append('name', state.name);
    formData.append('nic', state.nic);
    formData.append('companyName', state.companyName);
    formData.append('phoneNumber', state.phoneNumber);
    formData.append('bankName', state.bankName);
    formData.append('branchName', state.branchName);
    formData.append('accountNumber', state.accountNumber);
    formData.append('amount', state.amount);
    formData.append('paymentDate', state.paymentDate);
    formData.append('hours', state.time.hours);
    formData.append('minutes', state.time.minutes);
    formData.append('seconds', state.time.seconds);
    formData.append('referenceNo', state.referenceNo);
    formData.append('slip', state.slip);

    try {
      const response = await fetch('http://localhost:5000/api/payments', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        navigate("/payments/success");
      } else {
        setError(data.message || "Failed to submit payment");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-primary to-secondary py-8">

      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-4xl border border-gray-200">

        <h2 className="text-2xl font-bold mb-6 text-center text-primary">Payment Summary</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Left Column */}
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">Bank Name:</span>
              <span className="text-gray-900">{state.bankName}</span>
            </div>

            <div className="flex justify-between">
              <span className="font-medium text-gray-700">Branch Name:</span>
              <span className="text-gray-900">{state.branchName}</span>
            </div>

            <div className="flex justify-between">
              <span className="font-medium text-gray-700">Account Number:</span>
              <span className="text-gray-900">{state.accountNumber}</span>
            </div>

            <div className="flex justify-between">
              <span className="font-medium text-gray-700">Amount:</span>
              <span className="text-gray-900">Rs {state.amount}</span>
            </div>

            <div className="flex justify-between">
              <span className="font-medium text-gray-700">Date:</span>
              <span className="text-gray-900">{state.paymentDate}</span>
            </div>

            <div className="flex justify-between">
              <span className="font-medium text-gray-700">Reference No:</span>
              <span className="text-gray-900">{state.referenceNo}</span>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">Name:</span>
              <span className="text-gray-900">{state.studentName || state.name}</span>
            </div>

            <div className="flex justify-between">
              <span className="font-medium text-gray-700">NIC:</span>
              <span className="text-gray-900">{state.nic}</span>
            </div>

            <div className="flex justify-between">
              <span className="font-medium text-gray-700">Company Name:</span>
              <span className="text-gray-900">{state.companyName}</span>
            </div>

            <div className="flex justify-between">
              <span className="font-medium text-gray-700">Mobile Number:</span>
              <span className="text-gray-900">{state.phoneNumber}</span>
            </div>

            <div className="flex justify-between">
              <span className="font-medium text-gray-700">Time:</span>
              <span className="text-gray-900">{timeString}</span>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <img
            src={URL.createObjectURL(state.slip)}
            alt="Payment Slip"
            className="w-full rounded-lg shadow-md"
          />
        </div>

        {error && <p className="text-red-500 text-center mt-4">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full mt-6 bg-primary hover:bg-primary/90 text-white py-3 rounded-lg font-semibold transition duration-200 shadow-lg disabled:opacity-50"
        >
          {loading ? "Submitting..." : "Confirm Payment"}
        </button>

      </div>
    </div>
  );
};

export default P_PaymentSummary;