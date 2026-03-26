import React, { useEffect, useMemo, useState } from 'react';
import AdminLayout from './admin_layout';
import {
  deleteReviewRecord,
  fetchReviewRecords,
  replyToReviewRecord,
  updateReviewRecordStatus,
} from './admin_utils';

const statusTone = {
  pending: 'bg-amber-100 text-amber-700',
  replied: 'bg-emerald-100 text-emerald-700',
  closed: 'bg-slate-200 text-slate-700',
};

const initialReplyState = {
  adminReply: '',
  status: 'replied',
};

const AdminReviewPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [replyForm, setReplyForm] = useState(initialReplyState);

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const data = await fetchReviewRecords();
        setReviews(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load review records');
      } finally {
        setLoading(false);
      }
    };

    loadReviews();
  }, []);

  const filteredReviews = useMemo(
    () =>
      reviews.filter((review) => {
        const matchesSearch =
          !searchTerm ||
          [review.companyName, review.title, review.comment, review.adminReply]
            .join(' ')
            .toLowerCase()
            .includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'All' || review.status === statusFilter;
        return matchesSearch && matchesStatus;
      }),
    [reviews, searchTerm, statusFilter]
  );

  const handleStartReply = (review) => {
    setEditingReviewId(review._id);
    setReplyForm({
      adminReply: review.adminReply || '',
      status: review.status === 'closed' ? 'closed' : 'replied',
    });
    setMessage('');
    setError('');
  };

  const handleReplySubmit = async (event) => {
    event.preventDefault();

    try {
      const updated = await replyToReviewRecord(editingReviewId, replyForm);
      setReviews((current) => current.map((review) => (review._id === updated._id ? updated : review)));
      setEditingReviewId(null);
      setReplyForm(initialReplyState);
      setMessage('Reply saved successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save reply');
    }
  };

  const handleStatusChange = async (reviewId, status) => {
    try {
      const updated = await updateReviewRecordStatus(reviewId, status);
      setReviews((current) => current.map((review) => (review._id === updated._id ? updated : review)));
      setMessage('Review status updated.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update review status');
    }
  };

  const handleDelete = async (review) => {
    const confirmed = window.confirm(`Delete review "${review.title}" from ${review.companyName}?`);
    if (!confirmed) {
      return;
    }

    try {
      await deleteReviewRecord(review._id);
      setReviews((current) => current.filter((item) => item._id !== review._id));
      setMessage('Review deleted successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete review');
    }
  };

  return (
    <AdminLayout
      title="Review Management"
      description="Review Admins and Super Admins can monitor company feedback, reply to comments, and close completed conversations."
      allowedRoles={['Super Admin', 'Review Admin']}
    >
      <div className="space-y-6">
        {message && (
          <div className="rounded-3xl border border-indigo-100 bg-indigo-50 px-6 py-4 text-sm text-indigo-700 shadow-sm">
            {message}
          </div>
        )}
        {error && (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 px-6 py-4 text-sm text-rose-700 shadow-sm">
            {error}
          </div>
        )}

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-3xl border border-indigo-100 bg-white p-6 shadow-xl">
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-indigo-500">Total Reviews</div>
            <div className="mt-3 text-4xl font-black text-slate-900">{reviews.length}</div>
          </div>
          <div className="rounded-3xl border border-indigo-100 bg-white p-6 shadow-xl">
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-indigo-500">Pending</div>
            <div className="mt-3 text-4xl font-black text-amber-600">
              {reviews.filter((review) => review.status === 'pending').length}
            </div>
          </div>
          <div className="rounded-3xl border border-indigo-100 bg-white p-6 shadow-xl">
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-indigo-500">Replied</div>
            <div className="mt-3 text-4xl font-black text-emerald-600">
              {reviews.filter((review) => review.adminReply).length}
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-indigo-100 bg-white p-6 shadow-xl">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-indigo-500">
                Search
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search company, title, comment..."
                className="w-full rounded-2xl border border-indigo-100 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-indigo-500">
                Status
              </span>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="w-full rounded-2xl border border-indigo-100 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              >
                <option value="All">All</option>
                <option value="pending">pending</option>
                <option value="replied">replied</option>
                <option value="closed">closed</option>
              </select>
            </label>
          </div>
        </div>

        <div className="space-y-4">
          {loading && (
            <div className="rounded-3xl border border-indigo-100 bg-white px-6 py-10 text-center text-slate-500 shadow-xl">
              Loading review records...
            </div>
          )}

          {!loading && filteredReviews.length === 0 && (
            <div className="rounded-3xl border border-indigo-100 bg-white px-6 py-10 text-center text-slate-500 shadow-xl">
              No review records match the current filters.
            </div>
          )}

          {filteredReviews.map((review) => (
            <div key={review._id} className="rounded-3xl border border-indigo-100 bg-white p-6 shadow-xl">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div className="max-w-4xl">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-2xl font-black text-slate-900">{review.title}</h2>
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusTone[review.status] || 'bg-slate-200 text-slate-700'}`}>
                      {review.status}
                    </span>
                    <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                      {review.rating}/5
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-500">
                    {review.companyName} • {new Date(review.createdAt).toLocaleString()}
                  </p>
                  <p className="mt-4 text-sm leading-7 text-slate-700">{review.comment}</p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <select
                    value={review.status}
                    onChange={(event) => handleStatusChange(review._id, event.target.value)}
                    className="rounded-2xl border border-indigo-100 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  >
                    <option value="pending">pending</option>
                    <option value="replied">replied</option>
                    <option value="closed">closed</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => handleStartReply(review)}
                    className="rounded-2xl bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-700 transition hover:bg-sky-100"
                  >
                    {review.adminReply ? 'Edit Reply' : 'Reply'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(review)}
                    className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {review.adminReply && editingReviewId !== review._id && (
                <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                  <div className="text-sm font-semibold text-slate-900">
                    Reply from {review.repliedByName || 'Review Admin'}
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{review.adminReply}</p>
                </div>
              )}

              {editingReviewId === review._id && (
                <form onSubmit={handleReplySubmit} className="mt-5 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-5">
                  <div className="grid gap-4 md:grid-cols-[1fr_220px]">
                    <label className="block">
                      <span className="mb-2 block text-sm font-medium text-slate-700">Admin reply</span>
                      <textarea
                        name="adminReply"
                        value={replyForm.adminReply}
                        onChange={(event) => setReplyForm((current) => ({ ...current, adminReply: event.target.value }))}
                        rows="5"
                        required
                        className="w-full rounded-2xl border border-indigo-100 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-sm font-medium text-slate-700">Status after reply</span>
                      <select
                        name="status"
                        value={replyForm.status}
                        onChange={(event) => setReplyForm((current) => ({ ...current, status: event.target.value }))}
                        className="w-full rounded-2xl border border-indigo-100 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                      >
                        <option value="replied">replied</option>
                        <option value="closed">closed</option>
                        <option value="pending">pending</option>
                      </select>
                    </label>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      type="submit"
                      className="rounded-2xl bg-gradient-to-r from-indigo-700 to-blue-600 px-5 py-3 font-semibold text-white transition hover:from-indigo-800 hover:to-blue-700"
                    >
                      Save reply
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingReviewId(null);
                        setReplyForm(initialReplyState);
                      }}
                      className="rounded-2xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 transition hover:border-slate-500"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminReviewPage;
