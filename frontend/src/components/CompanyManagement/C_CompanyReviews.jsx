import React, { useEffect, useState } from 'react';
import { getCompanyReviews, submitCompanyReview } from './C_CompanyUtils';

const initialForm = {
  rating: 5,
  title: '',
  comment: '',
};

const statusTone = {
  pending: 'bg-amber-100 text-amber-700',
  replied: 'bg-emerald-100 text-emerald-700',
  closed: 'bg-slate-200 text-slate-700',
};

const C_CompanyReviews = () => {
  const [activePage, setActivePage] = useState('submit');
  const [formData, setFormData] = useState(initialForm);
  const [reviews, setReviews] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
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

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: name === 'rating' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');

    try {
      const result = await submitCompanyReview(formData);
      setReviews((current) => [result.data, ...current]);
      setFormData(initialForm);
      setMessage('Your review was submitted. A Review Admin can now manage and reply to it.');
    } catch (err) {
      setError(err.message || 'Failed to submit review');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {message && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700">
          {message}
        </div>
      )}
      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="rounded-3xl border border-indigo-100 bg-white p-3 shadow">
        <div className="grid gap-3 md:grid-cols-2">
          <button
            type="button"
            onClick={() => setActivePage('submit')}
            className={`rounded-2xl px-5 py-4 text-left transition ${
              activePage === 'submit'
                ? 'bg-gradient-to-r from-indigo-700 to-blue-600 text-white shadow-lg'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <div className="text-xs font-semibold uppercase tracking-[0.24em] opacity-80">Page 1</div>
            <div className="mt-2 text-lg font-bold">Leave Review</div>
            <div className="mt-1 text-sm opacity-80">Submit a company review about the system.</div>
          </button>

          <button
            type="button"
            onClick={() => setActivePage('history')}
            className={`rounded-2xl px-5 py-4 text-left transition ${
              activePage === 'history'
                ? 'bg-gradient-to-r from-indigo-700 to-blue-600 text-white shadow-lg'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <div className="text-xs font-semibold uppercase tracking-[0.24em] opacity-80">Page 2</div>
            <div className="mt-2 text-lg font-bold">Review History</div>
            <div className="mt-1 text-sm opacity-80">Check review status and admin replies.</div>
          </button>
        </div>
      </div>

      {activePage === 'submit' && (
        <div className="rounded-3xl border border-indigo-100 bg-white p-6 shadow">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-500">
            Company Feedback
          </p>
          <h2 className="mt-3 text-2xl font-black text-slate-900">Leave a review about the system</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Share what works, what blocks your hiring flow, and what should change. This goes to a separate review table for admin follow-up.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 max-w-3xl space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Rating</span>
              <select
                name="rating"
                value={formData.rating}
                onChange={handleChange}
                className="w-full rounded-2xl border border-indigo-100 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              >
                {[5, 4, 3, 2, 1].map((value) => (
                  <option key={value} value={value}>
                    {value} / 5
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Review title</span>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full rounded-2xl border border-indigo-100 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                placeholder="Example: Internship posting flow is smooth"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Comment</span>
              <textarea
                name="comment"
                value={formData.comment}
                onChange={handleChange}
                required
                rows="8"
                className="w-full rounded-2xl border border-indigo-100 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                placeholder="Tell us what happened, what is useful, and what needs improvement."
              />
            </label>

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-2xl bg-gradient-to-r from-indigo-700 to-blue-600 px-5 py-3 font-semibold text-white transition hover:from-indigo-800 hover:to-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? 'Submitting review...' : 'Submit review'}
            </button>
          </form>
        </div>
      )}

      {activePage === 'history' && (
        <div className="rounded-3xl border border-indigo-100 bg-white p-6 shadow">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-500">
                Review History
              </p>
              <h2 className="mt-3 text-2xl font-black text-slate-900">Admin replies to your feedback</h2>
            </div>
            <div className="rounded-2xl bg-indigo-50 px-4 py-3 text-sm font-semibold text-indigo-700">
              {reviews.length} total
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {loading && <div className="text-sm text-slate-500">Loading reviews...</div>}

            {!loading && reviews.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-200 px-5 py-10 text-center text-sm text-slate-500">
                No reviews submitted yet.
              </div>
            )}

            {reviews.map((review) => (
              <div key={review._id} className="rounded-2xl border border-slate-200 p-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="text-lg font-bold text-slate-900">{review.title}</div>
                    <div className="mt-1 text-sm text-slate-500">
                      {review.rating}/5 rating • {new Date(review.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <span className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${statusTone[review.status] || 'bg-slate-200 text-slate-700'}`}>
                    {review.status}
                  </span>
                </div>

                <p className="mt-4 text-sm leading-7 text-slate-700">{review.comment}</p>

                {review.adminReply ? (
                  <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                    <div className="text-sm font-semibold text-slate-900">
                      Reply from {review.repliedByName || 'Review Admin'}
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{review.adminReply}</p>
                  </div>
                ) : (
                  <div className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
                    Waiting for admin review.
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default C_CompanyReviews;
