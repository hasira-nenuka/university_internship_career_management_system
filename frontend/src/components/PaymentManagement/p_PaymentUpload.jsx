import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const P_PaymentUpload = () => {
  const navigate = useNavigate();
  const { state } = useLocation();

  const companyId = useMemo(() => state?.companyId || localStorage.getItem("companyId") || "", [state]);
  const internshipId = useMemo(() => state?.internshipId || "", [state]);
  const internshipTitle = useMemo(() => state?.internshipTitle || "", [state]);
  const paymentType = useMemo(() => state?.paymentType || "internship_post", [state]);
  const fixedAmount = useMemo(() => (state?.fixedAmount ? String(state.fixedAmount) : ""), [state]);

  const [formData, setFormData] = useState({
    name: "",
    nic: "",
    companyName: state?.companyName || localStorage.getItem("companyName") || "",
    phoneNumber: "",
    bankName: "",
    branchName: "",
    accountNumber: "",
    amount: fixedAmount || "",
    paymentDate: "",
    time: { hours: "", minutes: "", seconds: "" },
    referenceNo: "",
    slip: null
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "slip") {
      const file = files?.[0];
      if (!file) return;
      if (file.type !== "image/jpeg" && file.type !== "image/jpg") {
        setError("Only JPG/JPEG allowed");
        return;
      }
      setFormData({ ...formData, slip: file });
      return;
    }

    if (name === "hours" || name === "minutes" || name === "seconds") {
      setFormData({ ...formData, time: { ...formData.time, [name]: value } });
      return;
    }

    if (name === "amount" && fixedAmount) {
      return;
    }

    setFormData({ ...formData, [name]: value });

    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (formData.phoneNumber && formData.phoneNumber.length !== 10) {
      newErrors.phoneNumber = "Mobile number must be 10 digits";
    }

    if (formData.bankName === "Sampath Bank" && formData.referenceNo && formData.referenceNo.length !== 12) {
      newErrors.referenceNo = "Reference No must be 12 digits for Sampath Bank";
    }

    if (formData.bankName === "BOC Bank" && formData.referenceNo && formData.referenceNo.length !== 16) {
      newErrors.referenceNo = "Reference No must be 16 digits for BOC Bank";
    }

    if (fixedAmount && Number(formData.amount) !== Number(fixedAmount)) {
      newErrors.amount = `Amount must be Rs ${Number(fixedAmount).toFixed(2)}`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!companyId) {
      setError("Company session not found. Please login again.");
      return;
    }

    if (!validateForm()) return;

    setLoading(true);

    const payload = new FormData();
    payload.append("companyId", companyId);
    payload.append("internshipId", internshipId);
    payload.append("internshipTitle", internshipTitle);
    payload.append("paymentType", paymentType);
    payload.append("name", formData.name);
    payload.append("nic", formData.nic);
    payload.append("companyName", formData.companyName);
    payload.append("phoneNumber", formData.phoneNumber);
    payload.append("bankName", formData.bankName);
    payload.append("branchName", formData.branchName);
    payload.append("accountNumber", formData.accountNumber);
    payload.append("amount", formData.amount);
    payload.append("paymentDate", formData.paymentDate);
    payload.append("hours", formData.time.hours);
    payload.append("minutes", formData.time.minutes);
    payload.append("seconds", formData.time.seconds);
    payload.append("referenceNo", formData.referenceNo);
    payload.append("slip", formData.slip);

    try {
      const response = await fetch("http://localhost:5000/api/payments", {
        method: "POST",
        body: payload
      });

      const data = await response.json();

      if (response.ok) {
        navigate("/payments/success", { state: { paymentType } });
      } else {
        setError(data.message || "Payment submission failed.");
      }
    } catch (err) {
      setError("Network error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-primary to-secondary py-8">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-4xl border border-gray-200">
        <h2 className="text-2xl font-bold mb-2 text-center text-primary">Upload Payment Slip</h2>
        <p className="text-center text-gray-600 mb-6">
          {paymentType === "pro_account" ? "Pro Account Payment (Rs 6,000.00 / 30 days)" : "Internship Payment"}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
              <select name="bankName" required value={formData.bankName} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent">
                <option value="">Select Bank</option>
                <option value="Sampath Bank">Sampath Bank</option>
                <option value="BOC Bank">BOC Bank</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Branch Name</label>
              <input name="branchName" placeholder="Branch Name" required value={formData.branchName} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
              <input name="accountNumber" placeholder="Account Number" required value={formData.accountNumber} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
              <input name="amount" type="number" placeholder="Amount" required value={formData.amount} onChange={handleChange} readOnly={Boolean(fixedAmount)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent bg-white" />
              {errors.amount && <p className="text-red-500 text-sm mt-1">{errors.amount}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input name="paymentDate" type="date" required value={formData.paymentDate} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reference No</label>
              <input name="referenceNo" placeholder="Reference Number" required value={formData.referenceNo} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent" />
              {errors.referenceNo && <p className="text-red-500 text-sm mt-1">{errors.referenceNo}</p>}
            </div>

            {internshipTitle && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Internship</label>
                <input value={internshipTitle} readOnly className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-700" />
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input name="name" placeholder="Your Name" required value={formData.name} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">NIC</label>
              <input name="nic" placeholder="NIC Number" required value={formData.nic} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
              <input name="companyName" placeholder="Company Name" required value={formData.companyName} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
              <input name="phoneNumber" type="tel" placeholder="10-digit Mobile Number" required value={formData.phoneNumber} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent" />
              {errors.phoneNumber && <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
              <div className="flex space-x-2">
                <input name="hours" type="number" placeholder="HH" min="0" max="23" required value={formData.time.hours} onChange={handleChange} className="w-1/3 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent" />
                <input name="minutes" type="number" placeholder="MM" min="0" max="59" required value={formData.time.minutes} onChange={handleChange} className="w-1/3 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent" />
                <input name="seconds" type="number" placeholder="SS" min="0" max="59" required value={formData.time.seconds} onChange={handleChange} className="w-1/3 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent" />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Upload Slip (JPG/JPEG only)</label>
          <input type="file" name="slip" accept=".jpg,.jpeg" required onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-accent file:text-white hover:file:bg-accent/80" />
        </div>

        {error && <p className="text-red-500 text-center mt-3">{error}</p>}

        <button type="submit" disabled={loading} className="w-full mt-6 bg-primary hover:bg-primary/90 text-white py-3 rounded-lg font-semibold transition duration-200 shadow-lg disabled:opacity-50">
          {loading ? "Submitting..." : "Submit Payment"}
        </button>
      </form>
    </div>
  );
};

export default P_PaymentUpload;