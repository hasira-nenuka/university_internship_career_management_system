import React, { useEffect, useMemo, useState } from 'react';
import { FiMessageSquare, FiPieChart, FiCreditCard, FiStar, FiCheckCircle, FiInfo } from 'react-icons/fi';
import { getCompanyPayments, getCompanyReviews, submitCompanyReview } from './C_CompanyUtils';

const initialForm = {
  rating: 5,
  title: '',
  comment: '',
  category: 'General',
  recommendation: 'Yes',
  performance: 5,
};

const statusTone = {
  pending: 'bg-amber-100 text-amber-700 border-amber-200',
  replied: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  closed: 'bg-slate-100 text-slate-600 border-slate-200',
};

const paymentStatusTone = {
  pending: 'bg-amber-100 text-amber-700 border-amber-200',
  verified: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  rejected: 'bg-rose-100 text-rose-700 border-rose-200',
};

const C_CompanyReviews = () => {
  const [activePage, setActivePage] = useState('submit');
  const [formData, setFormData] = useState(initialForm);
  const [reviews, setReviews] = useState([]);
  const [payments, setPayments] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [paymentsLoading, setPaymentsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const result = await getCompanyReviews();
        setReviews(result.data || []);
      } catch (err) {
        setError(err.message || 'Failed to load reviews');
      } finally {
        setLoading(false);
      }
    };

    loadReviews();
  }, []);

  useEffect(() => {
    const loadPayments = async () => {
      try {
        const result = await getCompanyPayments();
        setPayments(result.data || []);
      } catch (err) {
        setError(err.message || 'Failed to load payment history');
      } finally {
        setPaymentsLoading(false);
      }
    };

    loadPayments();
  }, []);

  const paymentSummary = useMemo(
    () => ({
      total: payments.length,
      verified: payments.filter((payment) => payment.status === 'verified').length,
      pending: payments.filter((payment) => payment.status === 'pending').length,
    }),
    [payments]
  );

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: (name === 'rating' || name === 'performance') ? Number(value) : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');

    // Concatenate new fields into the comment for backend compatibility
    const enrichedComment = `${formData.comment}\n\n--- Additional Details ---\nCategory: ${formData.category}\nRecommend: ${formData.recommendation}\nSystem Performance: ${formData.performance}/5`;

    try {
      const submissionData = {
        rating: formData.rating,
        title: formData.title,
        comment: enrichedComment
      };

      const result = await submitCompanyReview(submissionData);
      setReviews((current) => [result.data, ...current]);
      setFormData(initialForm);
      setMessage('Your review was submitted. Our team will review and reply shortly.');

      // Auto switch to history after submission for better UX
      setTimeout(() => setActivePage('history'), 2000);
    } catch (err) {
      setError(err.message || 'Failed to submit review');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
      {/* Alert Messages */}
      <div className="fixed top-24 right-8 z-50 flex flex-col gap-3 w-80">
        {message && (
          <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-white/90 backdrop-blur-md px-5 py-4 text-sm text-emerald-700 shadow-xl shadow-emerald-100/50 animate-in slide-in-from-right-10">
            <FiCheckCircle className="text-xl flex-shrink-0" />
            <span>{message}</span>
          </div>
        )}
        {error && (
          <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-white/90 backdrop-blur-md px-5 py-4 text-sm text-rose-700 shadow-xl shadow-rose-100/50 animate-in slide-in-from-right-10">
            <FiInfo className="text-xl flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Navigation Header */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-indigo-900 p-8 text-white shadow-2xl shadow-indigo-200">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-violet-600/30 blur-3xl" />
        <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-blue-600/20 blur-3xl" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-white">Review Center</h1>
            <p className="mt-2 text-indigo-200 max-w-md">
              Manage your feedback, track admin responses, and monitor payment records in one place.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 rounded-2xl bg-white/10 p-1.5 backdrop-blur-sm">
            {[
              { id: 'submit', label: 'Leave Review', icon: FiMessageSquare },
              { id: 'history', label: 'History', icon: FiPieChart },
              { id: 'payments', label: 'Payments', icon: FiCreditCard },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActivePage(tab.id)}
                className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all duration-300 ${activePage === tab.id
                    ? 'bg-white text-indigo-900 shadow-lg'
                    : 'text-white hover:bg-white/10'
                  }`}
              >
                <tab.icon className={activePage === tab.id ? 'text-indigo-600' : ''} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="min-h-[500px]">
        {activePage === 'submit' && (
          <div className="grid gap-8 lg:grid-cols-5">
            <div className="lg:col-span-3 space-y-6">
              <div className="rounded-[2.5rem] border border-slate-100 bg-white p-8 shadow-sm">
                <div className="flex items-center gap-4 mb-8">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                    <FiMessageSquare size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">Share Your Experience</h2>
                    <p className="text-sm text-slate-500">Your feedback helps us build a better tool for hiring teams.</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Review Title</label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3.5 text-sm outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50/50"
                        placeholder="e.g. Smooth internship posting"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Category</label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3.5 text-sm outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50/50 appearance-none"
                      >
                        <option>General</option>
                        <option>User Interface</option>
                        <option>Performance</option>
                        <option>Student Matching</option>
                        <option>Job Management</option>
                        <option>Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 flex justify-between">
                        <span>Overall Rating</span>
                        <span className="text-indigo-600">{formData.rating} Stars</span>
                      </label>
                      <div className="flex items-center gap-2 pt-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                            className={`text-2xl transition-transform hover:scale-110 ${star <= formData.rating ? 'text-amber-400' : 'text-slate-200'}`}
                          >
                            <FiStar fill={star <= formData.rating ? 'currentColor' : 'none'} />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 flex justify-between">
                        <span>System Performance</span>
                        <span className="text-indigo-600">{formData.performance}/5</span>
                      </label>
                      <input
                        type="range"
                        name="performance"
                        min="1"
                        max="5"
                        value={formData.performance}
                        onChange={handleChange}
                        className="w-full h-2 rounded-lg bg-slate-200 appearance-none cursor-pointer accent-indigo-600"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Detailed Feedback</label>
                    <textarea
                      name="comment"
                      value={formData.comment}
                      onChange={handleChange}
                      required
                      rows="5"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3.5 text-sm outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50/50"
                      placeholder="What works well? What could be improved for your hiring workflow?"
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="text-sm font-bold text-slate-700 block">Would you recommend this system to other universities?</label>
                    <div className="flex gap-4">
                      {['Yes', 'Maybe', 'No'].map(option => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, recommendation: option }))}
                          className={`flex-1 rounded-xl py-3 text-sm font-bold border-2 transition-all ${formData.recommendation === option
                              ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
                              : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200'
                            }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full relative overflow-hidden group rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 p-4 font-bold text-white shadow-xl shadow-indigo-100 transition-all hover:scale-[1.02] active:scale-100 disabled:opacity-50"
                  >
                    <div className="relative z-10 flex items-center justify-center gap-2">
                      {saving ? 'Processing submission...' : 'Send Analysis Feedback'}
                    </div>
                    <div className="absolute inset-0 translate-y-full bg-gradient-to-r from-violet-600 to-indigo-600 transition-transform duration-300 group-hover:translate-y-0" />
                  </button>
                </form>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <div className="rounded-[2.5rem] bg-gradient-to-br from-indigo-600 to-violet-700 p-8 text-white shadow-xl">
                <h3 className="text-xl font-black">Why your review matters?</h3>
                <div className="mt-6 space-y-4">
                  <div className="flex gap-4">
                    <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0 text-white">1</div>
                    <p className="text-sm text-indigo-100">Helps students find better matching internships based on company quality.</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0 text-white">2</div>
                    <p className="text-sm text-indigo-100">Drives technical improvements in our AI-based matching engine.</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0 text-white">3</div>
                    <p className="text-sm text-indigo-100">Ensures university admins can provide necessary support to companies.</p>
                  </div>
                </div>
              </div>

              <div className="rounded-[2.5rem] border border-slate-100 bg-white p-8 shadow-sm">
                <h3 className="font-bold text-slate-900 border-b pb-4 mb-4">Submission Guide</h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <div className="mt-1 h-1.5 w-1.5 rounded-full bg-indigo-600 shrink-0" />
                    <p className="text-xs text-slate-600 leading-relaxed">Be specific about the features you use most like "Application Tracking" or "Filter Tools".</p>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="mt-1 h-1.5 w-1.5 rounded-full bg-indigo-600 shrink-0" />
                    <p className="text-xs text-slate-600 leading-relaxed">Mention if any technical errors occurred during your evaluation phase.</p>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activePage === 'history' && (
          <div className="rounded-[2.5rem] border border-slate-100 bg-white p-8 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 leading-tight">Review Timeline</h2>
                <p className="text-sm text-slate-500">Track and view responses from the university administration.</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 font-bold text-indigo-600">
                {reviews.length}
              </div>
            </div>

            <div className="space-y-6">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
                  <p className="text-sm font-medium text-slate-400">Loading history...</p>
                </div>
              ) : reviews.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-100 py-20">
                  <div className="h-16 w-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 mb-4 text-2xl text-slate-300">
                    <FiMessageSquare />
                  </div>
                  <p className="text-sm font-bold text-slate-900">No reviews found</p>
                  <p className="text-xs text-slate-500 mt-1">Start by sharing your first experience with us.</p>
                </div>
              ) : (
                reviews.map((review) => (
                  <div key={review._id} className="group relative rounded-3xl border border-slate-100 bg-slate-50/50 p-6 transition-all hover:bg-white hover:shadow-xl hover:shadow-indigo-50/50">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg font-bold text-slate-900">{review.title}</span>
                          <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${statusTone[review.status] || 'bg-slate-100'}`}>
                            {review.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <div className="flex items-center gap-1">
                            <FiStar className="text-amber-400 fill-amber-400" />
                            <span className="font-bold text-slate-700">{review.rating}.0</span>
                          </div>
                          <span>•</span>
                          <span>{new Date(review.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm leading-relaxed text-slate-600 whitespace-pre-line">{review.comment}</p>

                    {review.adminReply ? (
                      <div className="mt-6 rounded-2xl bg-indigo-600 p-5 text-white shadow-lg shadow-indigo-100">
                        <div className="flex items-center gap-2 mb-2 text-xs font-bold text-indigo-100">
                          <FiInfo />
                          <span>ADMIN RESPONSE FROM {review.repliedByName?.toUpperCase() || 'SYSTEM ADMIN'}</span>
                        </div>
                        <p className="text-sm leading-relaxed">{review.adminReply}</p>
                      </div>
                    ) : (
                      <div className="mt-6 flex items-center gap-2 rounded-2xl bg-amber-50 px-4 py-3 text-[11px] font-bold text-amber-700 border border-amber-100">
                        <FiInfo className="text-sm" />
                        AWAITING OFFICIAL REVIEW AND REPLY
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activePage === 'payments' && (
          <div className="space-y-8">
            {/* Payment Summary Cards */}
            <div className="grid gap-6 sm:grid-cols-3">
              <div className="rounded-[2.5rem] border border-slate-100 bg-white p-8 text-center shadow-sm">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Transactions</p>
                <p className="mt-2 text-4xl font-black text-indigo-900">{paymentSummary.total}</p>
              </div>
              <div className="rounded-[2.5rem] border border-amber-100 bg-amber-50/50 p-8 text-center shadow-sm">
                <p className="text-[10px] font-black uppercase tracking-widest text-amber-600">Pending verified</p>
                <p className="mt-2 text-4xl font-black text-amber-600">{paymentSummary.pending}</p>
              </div>
              <div className="rounded-[2.5rem] border border-indigo-100 bg-indigo-50/50 p-8 text-center shadow-sm">
                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Successfully verified</p>
                <p className="mt-2 text-4xl font-black text-indigo-600">{paymentSummary.verified}</p>
              </div>
            </div>

            <div className="rounded-[2.5rem] border border-slate-100 bg-white p-8 shadow-sm">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900">Payment Ledger</h2>
                <p className="text-sm text-slate-500">History of all internship posting and upgrade payments.</p>
              </div>

              <div className="space-y-6">
                {paymentsLoading ? (
                  <div className="flex flex-col items-center justify-center py-10 space-y-3">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
                    <p className="text-xs font-medium text-slate-400">Processing records...</p>
                  </div>
                ) : payments.length === 0 ? (
                  <div className="text-center py-20 text-slate-400 border-2 border-dashed rounded-3xl font-medium">
                    No payment records detected.
                  </div>
                ) : (
                  payments.map((payment) => (
                    <div key={payment._id} className="rounded-3xl border border-slate-50 bg-slate-50/30 p-6 transition-all hover:bg-white hover:shadow-xl hover:shadow-indigo-50/50">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6 mb-6">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600 text-xl">
                            <FiCreditCard />
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900">{payment.internshipTitle || 'Service Payment'}</h4>
                            <p className="text-xs font-medium text-slate-400 uppercase tracking-tighter">
                              {payment.paymentType?.replaceAll('_', ' ')} • ID: {payment._id.slice(-6)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-right">
                          <div className="flex flex-col items-end">
                            <p className="text-xl font-black text-indigo-900">LKR {Number(payment.amount || 0).toLocaleString()}</p>
                            <p className="text-[10px] font-bold text-slate-400">{new Date(payment.createdAt).toLocaleDateString()}</p>
                          </div>
                          <span className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-wider ${paymentStatusTone[payment.status] || 'bg-slate-100'}`}>
                            {payment.status}
                          </span>
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="rounded-2xl bg-white p-4 shadow-sm">
                          <p className="text-[10px] font-black text-slate-400 uppercase">Provider</p>
                          <p className="mt-1 text-sm font-bold text-indigo-900">{payment.bankName || 'Direct Transfer'}</p>
                        </div>
                        <div className="rounded-2xl bg-white p-4 shadow-sm">
                          <p className="text-[10px] font-black text-slate-400 uppercase">Reference</p>
                          <p className="mt-1 text-sm font-bold text-indigo-900">{payment.referenceNo || 'N/A'}</p>
                        </div>
                        <div className="rounded-2xl bg-white p-4 shadow-sm">
                          <p className="text-[10px] font-black text-slate-400 uppercase">Payer Account</p>
                          <p className="mt-1 text-sm font-bold text-indigo-900 truncate">{payment.name}</p>
                        </div>
                        <div className="rounded-2xl bg-white p-4 shadow-sm">
                          <p className="text-[10px] font-black text-slate-400 uppercase">Status</p>
                          <div className="mt-1 flex items-center gap-2">
                            <div className={`h-2 w-2 rounded-full ${payment.status === 'verified' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                            <span className="text-sm font-bold text-indigo-900 capitalize">{payment.status}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default C_CompanyReviews;
