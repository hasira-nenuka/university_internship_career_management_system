import React, { useEffect, useMemo, useState } from 'react';
import AdminLayout from './admin_layout';
import {
  deleteReviewRecord,
  fetchReviewRecords,
  replyToReviewRecord,
  updateReviewRecordStatus,
} from './admin_utils';
import { downloadFilteredPdfReport } from './admin_pdf_utils';

const IconUser = () => <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;

// Inline SVG Icons
const IconMessage = () => <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>;
const IconPie = () => <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path></svg>;
const IconStar = ({ fill = "none" }) => <svg stroke="currentColor" fill={fill} strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>;
const IconEdit = () => <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
const IconTrash = () => <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>;
const IconSearch = () => <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>;
const IconFilter = () => <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>;
const IconCheck = () => <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;
const IconInfo = () => <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>;
const IconChart = () => <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>;
const IconAward = () => <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>;
const IconSparkles = () => <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M8 12a4 4 0 1 1 8 0 4 4 0 0 1-8 0z"></path></svg>;
const IconDownload = () => <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>;
const IconBuilding = () => <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><line x1="9" y1="22" x2="9" y2="22"></line><line x1="15" y1="22" x2="15" y2="22"></line><line x1="12" y1="18" x2="12" y2="18"></line><line x1="12" y1="14" x2="12" y2="14"></line><line x1="12" y1="10" x2="12" y2="10"></line><line x1="12" y1="6" x2="12" y2="6"></line><line x1="8" y1="18" x2="8" y2="18"></line><line x1="8" y1="14" x2="8" y2="14"></line><line x1="8" y1="10" x2="8" y2="10"></line><line x1="8" y1="6" x2="8" y2="6"></line><line x1="16" y1="18" x2="16" y2="18"></line><line x1="16" y1="14" x2="16" y2="14"></line><line x1="16" y1="10" x2="16" y2="10"></line><line x1="16" y1="6" x2="16" y2="6"></line></svg>;
const IconHistory = () => <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;

const statusTone = {
  pending: 'bg-amber-100 text-amber-700 border-amber-200',
  replied: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  closed: 'bg-slate-100 text-slate-600 border-slate-200',
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
  const [typeFilter, setTypeFilter] = useState('All'); // 'All' | 'Company' | 'Student'
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [replyForm, setReplyForm] = useState(initialReplyState);

  // Advanced State: AI, Reports, and View Mode
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [viewMode, setViewMode] = useState('feed'); // 'feed' | 'analysis' | 'student-analysis'
  const [expandedCompany, setExpandedCompany] = useState(null);
  const [expandedStudent, setExpandedStudent] = useState(null);

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

  const parseReviewDetails = (comment) => {
    if (!comment) return { cleanComment: '', details: null };
    
    const delimiter = '--- Additional Details ---';
    if (!comment.includes(delimiter)) return { cleanComment: comment, details: null };
    
    const [cleanComment, detailsSection] = comment.split(delimiter);
    const details = {};
    
    detailsSection.split('\n').forEach(line => {
      if (line.includes(':')) {
        const [key, value] = line.split(':');
        details[key.trim()] = value.trim();
      }
    });
    
    return { cleanComment: cleanComment.trim(), details };
  };

  const handleGenerateAi = () => {
    if (filteredReviews.length === 0) {
      setError("No reviews available for AI analysis.");
      return;
    }

    const totalRating = filteredReviews.reduce((acc, r) => acc + (r.rating || 0), 0);
    const avgRating = totalRating / filteredReviews.length;
    const sentiment = avgRating > 4 ? "Extremely Positive" : avgRating > 3 ? "Generally Positive" : "Needs Management Focus";
    
    const categories = {};
    filteredReviews.forEach(r => {
      const { details } = parseReviewDetails(r.comment);
      const cat = details?.Category || 'General';
      categories[cat] = (categories[cat] || 0) + 1;
    });
    const topCategory = Object.entries(categories).sort((a,b) => b[1] - a[1])[0]?.[0] || 'Unidentified';

    const companyCount = filteredReviews.filter(r => r.reviewerType === 'Company').length;
    const studentCount = filteredReviews.filter(r => r.reviewerType === 'Student').length;

    setAiAnalysis({
      sentiment,
      avgRating: avgRating.toFixed(1),
      topCategory,
      insight: `The system has detected a ${sentiment.toLowerCase()} trend across ${companyCount} company and ${studentCount} student reviews. Management should prioritize feedback in the '${topCategory}' sector, which dominates the current feedback landscape.`,
      recommendations: [
        `Optimize resources in '${topCategory}' based on high engagement.`,
        "Balance student vs company expectations in the next system sprint.",
        "Address pending student queries to maintain platform trust."
      ]
    });
    setShowAiModal(true);
  };

  const handleExportPdf = () => {
    if (filteredReviews.length === 0) {
      setError("No reviews to export.");
      return;
    }

    const rows = filteredReviews.map(r => {
      const { cleanComment, details } = parseReviewDetails(r.comment);
      return {
        companyName: r.companyName,
        title: r.title,
        comment: cleanComment,
        rating: `${r.rating}/5`,
        status: r.status,
        category: details?.Category || 'N/A',
        performance: details?.['System Performance'] || 'N/A'
      };
    });

    downloadFilteredPdfReport({
      fileName: `Unified_Review_Report_${new Date().toLocaleDateString()}.pdf`,
      title: "Consolidated Student & Company Feedback Analysis",
      subtitle: `System-generated export for ${filteredReviews.length} records.`,
      filters: { Status: statusFilter, Source: typeFilter, Search: searchTerm },
      columns: [
        { key: 'reviewerType', label: 'Source' },
        { key: 'name', label: 'Reviewer' },
        { key: 'title', label: 'Feedback Title' },
        { key: 'rating', label: 'Score' },
        { key: 'category', label: 'Domain' },
        { key: 'performance', label: 'Performance' },
        { key: 'comment', label: 'Core Feedback' },
        { key: 'status', label: 'Pipeline Status' }
      ],
      rows: filteredReviews.map(r => {
        const { cleanComment, details } = parseReviewDetails(r.comment);
        return {
          reviewerType: r.reviewerType || 'Company',
          name: r.reviewerType === 'Student' ? r.studentName : r.companyName,
          title: r.title,
          comment: cleanComment,
          rating: `${r.rating}/5`,
          status: r.status,
          category: details?.Category || 'N/A',
          performance: details?.['System Performance'] || 'N/A'
        };
      })
    });
    setMessage("PDF Report successfully generated.");
  };

  const filteredReviews = useMemo(
    () =>
      reviews.filter((review) => {
        const matchesSearch =
          !searchTerm ||
          [review.companyName, review.studentName, review.title, review.comment, review.adminReply]
            .join(' ')
            .toLowerCase()
            .includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'All' || review.status === statusFilter;
        const matchesType = typeFilter === 'All' || review.reviewerType === typeFilter;
        return matchesSearch && matchesStatus && matchesType;
      }),
    [reviews, searchTerm, statusFilter, typeFilter]
  );

  const groupedByCompany = useMemo(() => {
    const groups = {};
    filteredReviews
      .filter((review) => review.reviewerType !== 'Student')
      .forEach(review => {
      const companyName = review.companyName || 'Unknown Company';
      if (!groups[companyName]) {
        groups[companyName] = {
          name: companyName,
          reviews: [],
          avgRating: 0
        };
      }
      groups[companyName].reviews.push(review);
    });

    return Object.values(groups).map(g => {
      const avgRating = (g.reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / g.reviews.length).toFixed(1);
      const sortedReviews = [...g.reviews].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
      return { ...g, avgRating, reviews: sortedReviews };
    }).sort((a,b) => b.reviews.length - a.reviews.length);
  }, [filteredReviews]);

  const groupedByStudent = useMemo(() => {
    const groups = {};
    filteredReviews
      .filter((review) => review.reviewerType === 'Student')
      .forEach((review) => {
        const studentName = review.studentName || 'Unknown Student';
        if (!groups[studentName]) {
          groups[studentName] = {
            name: studentName,
            reviews: [],
            avgRating: 0
          };
        }
        groups[studentName].reviews.push(review);
      });

    return Object.values(groups).map((g) => {
      const avgRating = (g.reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / g.reviews.length).toFixed(1);
      const sortedReviews = [...g.reviews].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return { ...g, avgRating, reviews: sortedReviews };
    }).sort((a, b) => b.reviews.length - a.reviews.length);
  }, [filteredReviews]);

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
      setMessage('Reply saved and status updated successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save reply');
    }
  };

  const handleStatusChange = async (reviewId, status) => {
    try {
      const updated = await updateReviewRecordStatus(reviewId, status);
      setReviews((current) => current.map((review) => (review._id === updated._id ? updated : review)));
      setMessage('Quick status update complete.');
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
      setMessage('Review record removed from system.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete review');
    }
  };

  return (
    <AdminLayout
      title="Analysis Management"
      description="Monitor feedback trends, respond to company evaluations, and manage the quality analysis pipeline."
      allowedRoles={['Super Admin', 'Review Admin']}
    >
      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
        {/* Notifications */}
        <div className="fixed top-24 right-8 z-50 flex flex-col gap-3 w-80">
          {message && (
            <div className="flex items-center gap-3 rounded-2xl border border-indigo-200 bg-white/95 backdrop-blur-md px-5 py-4 text-sm text-indigo-700 shadow-xl animate-in slide-in-from-right-10">
              <IconCheck className="text-xl flex-shrink-0" />
              <span>{message}</span>
            </div>
          )}
          {error && (
            <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-white/95 backdrop-blur-md px-5 py-4 text-sm text-rose-700 shadow-xl animate-in slide-in-from-right-10">
              <IconInfo className="text-xl flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Performance Overview */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="group relative overflow-hidden rounded-[2rem] bg-white p-8 shadow-sm transition-all hover:shadow-xl hover:shadow-indigo-50 border border-slate-100">
            <div className="absolute top-0 right-0 p-4 opacity-5 translate-x-2 -translate-y-2">
              <IconMessage className="text-8xl" />
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 mb-6">
              <IconMessage className="text-2xl" />
            </div>
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Total Feedback</p>
            <p className="mt-2 text-4xl font-black text-indigo-900 tracking-tight">{reviews.length}</p>
          </div>

          <div className="group relative overflow-hidden rounded-[2rem] bg-white p-8 shadow-sm transition-all hover:shadow-xl hover:shadow-amber-50 border border-slate-100">
             <div className="absolute top-0 right-0 p-4 opacity-5 translate-x-2 -translate-y-2">
              <IconPie className="text-8xl" />
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 mb-6">
              <IconPie className="text-2xl" />
            </div>
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Pending Action</p>
            <p className="mt-2 text-4xl font-black text-amber-600 tracking-tight">
              {reviews.filter((review) => review.status === 'pending').length}
            </p>
          </div>

          <div className="group relative overflow-hidden rounded-[2rem] bg-white p-8 shadow-sm transition-all hover:shadow-xl hover:shadow-indigo-100 border border-slate-100">
             <div className="absolute top-0 right-0 p-4 opacity-5 translate-x-2 -translate-y-2">
              <IconAward className="text-8xl" />
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white mb-6">
              <IconAward className="text-2xl" />
            </div>
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Response Rate</p>
            <p className="mt-2 text-4xl font-black text-indigo-900 tracking-tight">
              {reviews.length ? Math.round((reviews.filter(r => r.adminReply).length / reviews.length) * 100) : 0}%
            </p>
          </div>

          <div className="group relative overflow-hidden rounded-[2rem] bg-white p-8 shadow-sm transition-all hover:shadow-xl hover:shadow-emerald-50 border border-slate-100">
             <div className="absolute top-0 right-0 p-4 opacity-5 translate-x-2 -translate-y-2">
              <IconChart className="text-8xl" />
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 mb-6">
              <IconChart className="text-2xl" />
            </div>
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Platform Split</p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-indigo-900">{reviews.filter(r => r.reviewerType === 'Company').length}C</span>
              <span className="text-slate-300">/</span>
              <span className="text-2xl font-black text-emerald-600">{reviews.filter(r => r.reviewerType === 'Student').length}S</span>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-[2rem] bg-indigo-900 p-8 text-white shadow-xl shadow-indigo-100">
            <div className="absolute -right-10 -bottom-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 mb-6">
              <IconChart className="text-2xl" />
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-300">Avg Rating</p>
            <p className="mt-2 text-4xl font-black tracking-tight">
              {reviews.length ? (reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / reviews.length).toFixed(1) : '0.0'}
            </p>
          </div>
        </div>

        {/* Global Toolbar */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-4 bg-indigo-50/30 p-1.5 rounded-[2rem] border border-indigo-100/50 self-start">
             {[
               { id: 'feed', label: 'Detailed Stream', icon: IconMessage },
               { id: 'analysis', label: 'Company Profiles', icon: IconBuilding },
               { id: 'student-analysis', label: 'Student Profiles', icon: IconUser },
             ].map((mode) => (
               <button
                 key={mode.id}
                 onClick={() => {
                   setViewMode(mode.id);
                   setExpandedCompany(null);
                   setExpandedStudent(null);
                 }}
                 className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                   viewMode === mode.id
                     ? 'bg-white text-indigo-900 shadow-md shadow-indigo-100'
                     : 'text-indigo-400 hover:text-indigo-600'
                 }`}
               >
                 <mode.icon />
                 {mode.label}
               </button>
             ))}
          </div>

          <div className="rounded-[2rem] border border-slate-100 bg-white p-4 py-3 shadow-md flex flex-wrap items-center gap-6">
          <div className="relative flex-1 min-w-[300px]">
            <IconSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Filter by company, student, keyword, or context..."
              className="w-full rounded-[1.5rem] border-transparent bg-slate-50 px-14 py-4 text-sm outline-none transition-all focus:bg-white focus:ring-4 focus:ring-indigo-50 font-medium"
            />
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400">
               <IconFilter />
               Status
            </div>
            <div className="flex rounded-[1.5rem] bg-slate-50 p-1">
              {['All', 'pending', 'replied', 'closed'].map(filter => (
                <button
                  key={filter}
                  onClick={() => setStatusFilter(filter)}
                  className={`rounded-[1.25rem] px-5 py-2.5 text-xs font-black uppercase tracking-tighter transition-all ${
                    statusFilter === filter
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                      : 'text-slate-500 hover:text-indigo-600'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400">
               <IconUser />
               Source
            </div>
            <div className="flex rounded-[1.5rem] bg-slate-50 p-1">
              {['All', 'Company', 'Student'].map(type => (
                <button
                  key={type}
                  onClick={() => setTypeFilter(type)}
                  className={`rounded-[1.25rem] px-5 py-2.5 text-xs font-black uppercase tracking-tighter transition-all ${
                    typeFilter === type
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-100'
                      : 'text-slate-500 hover:text-indigo-600'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 ml-auto border-l border-slate-100 pl-6">
            <button
              onClick={handleGenerateAi}
              className="flex items-center gap-2 rounded-2xl bg-indigo-900 px-5 py-4 text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-slate-900 shadow-xl shadow-indigo-100"
            >
              <IconSparkles />
              AI Analysis
            </button>
            <button
              onClick={handleExportPdf}
              className="flex items-center gap-2 rounded-2xl border-2 border-indigo-100 bg-white px-5 py-4 text-xs font-black uppercase tracking-widest text-indigo-900 transition-all hover:border-indigo-600 hover:bg-indigo-50"
            >
              <IconDownload />
              Export PDF
            </button>
          </div>
        </div>
      </div>

        {/* AI Modal Drawer */}
        {showAiModal && aiAnalysis && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-indigo-950/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="w-full max-w-2xl rounded-[3rem] bg-white p-10 shadow-3xl animate-in zoom-in-95 duration-500">
               <div className="flex items-center justify-between mb-10">
                  <div className="flex items-center gap-3">
                     <div className="h-14 w-14 rounded-2xl bg-indigo-900 flex items-center justify-center text-white text-2xl shadow-xl shadow-indigo-100">
                       <IconSparkles />
                     </div>
                     <div>
                       <h2 className="text-3xl font-black text-slate-900 tracking-tighter">AI Analysis</h2>
                       <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Automated Intelligence Dashboard</p>
                     </div>
                  </div>
                  <button 
                    onClick={() => setShowAiModal(false)}
                    className="h-12 w-12 rounded-full border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all focus:outline-none"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                  </button>
               </div>

               <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="rounded-[2rem] bg-indigo-50/50 p-6 border border-indigo-100">
                     <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-2">Overall Sentiment</p>
                     <p className="text-xl font-black text-indigo-950 tracking-tight">{aiAnalysis.sentiment}</p>
                     <div className="mt-3 h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                        <div className={`h-full ${parseFloat(aiAnalysis.avgRating) > 4 ? 'bg-emerald-500' : 'bg-indigo-600'}`} style={{width: `${(parseFloat(aiAnalysis.avgRating)/5)*100}%`}}></div>
                     </div>
                  </div>
                  <div className="rounded-[2rem] bg-indigo-50/50 p-6 border border-indigo-100">
                     <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-2">Top Domain</p>
                     <p className="text-xl font-black text-indigo-950 tracking-tight">{aiAnalysis.topCategory}</p>
                     <p className="text-xs font-bold text-slate-400 mt-2">Primary Analysis Area</p>
                  </div>
               </div>

               <div className="space-y-6">
                  <div className="p-6 rounded-[2rem] bg-indigo-900 text-white shadow-xl shadow-indigo-100">
                     <p className="text-[10px] font-black uppercase tracking-widest text-indigo-300 mb-3">Systematic Summary</p>
                     <p className="text-lg leading-relaxed font-medium italic">"{aiAnalysis.insight}"</p>
                  </div>

                  <div className="space-y-3">
                     <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-4">Action Roadmap</p>
                     {aiAnalysis.recommendations.map((rec, i) => (
                        <div key={i} className="flex items-center gap-4 px-6 py-4 rounded-2xl bg-white border border-slate-100 hover:border-indigo-600 transition-all group">
                           <div className="h-2 w-2 rounded-full bg-indigo-400 group-hover:scale-150 transition-all"></div>
                           <p className="text-sm font-bold text-slate-600">{rec}</p>
                        </div>
                     ))}
                  </div>
               </div>

               <button 
                  onClick={() => setShowAiModal(false)}
                  className="mt-10 w-full rounded-2xl bg-slate-900 py-5 text-sm font-black uppercase tracking-widest text-white hover:bg-slate-800 transition-all shadow-xl"
               >
                  Close Insights Dashboard
               </button>
            </div>
          </div>
        )}

        {/* Feedback Display Path */}
        <div className="space-y-6 pb-20">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-40 gap-4">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
              <p className="font-bold text-slate-400">Synchronizing records...</p>
            </div>
          ) : filteredReviews.length === 0 ? (
            <div className="rounded-[2.5rem] border-2 border-dashed border-slate-100 bg-white py-32 text-center">
              <div className="mx-auto h-20 w-20 rounded-full bg-slate-50 flex items-center justify-center mb-6 text-3xl text-slate-200">
                <IconSearch />
              </div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">System holds no matching records</h3>
              <p className="text-sm text-slate-500 mt-2">Try adjusting your filters or analysis mode.</p>
            </div>
          ) : viewMode === 'analysis' ? (
            <div className="grid gap-6 md:grid-cols-2">
              {groupedByCompany.map((company) => (
                <div key={company.name} className="group overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white transition-all hover:shadow-2xl hover:shadow-indigo-50/50">
                  <div className="p-8">
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-2xl bg-indigo-900 border-4 border-indigo-50 flex items-center justify-center text-white text-2xl shadow-xl shadow-indigo-100 group-hover:rotate-6 transition-all">
                          <IconBuilding />
                        </div>
                        <div>
                          <h3 className="text-2xl font-black text-slate-900 tracking-tight">{company.name}</h3>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{company.reviews.length} Global Evaluations</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black uppercase tracking-widest text-amber-500 mb-1">Avg Score</p>
                        <div className="flex items-center gap-2 text-2xl font-black text-indigo-950">
                           <IconStar className="fill-amber-400 text-amber-400 text-xl" />
                           {company.avgRating}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setExpandedCompany(expandedCompany === company.name ? null : company.name)}
                      className={`w-full rounded-2xl py-4 text-xs font-black uppercase tracking-widest transition-all ${
                        expandedCompany === company.name
                          ? 'bg-slate-900 text-white'
                          : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white shadow-sm'
                      }`}
                    >
                      {expandedCompany === company.name ? 'Collapse Portfolio' : 'One-by-One History View'}
                    </button>
                  </div>

                  {expandedCompany === company.name && (
                    <div className="bg-slate-50/50 border-t border-slate-100 p-8 space-y-8 animate-in slide-in-from-top-4 duration-500">
                      <div className="relative pl-8 space-y-12 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-indigo-100">
                        {company.reviews.map((rev, idx) => (
                           <div key={rev._id} className="relative group/item">
                              <div className="absolute -left-[2.25rem] top-1.5 h-4 w-4 rounded-full border-4 border-white bg-indigo-600 shadow-sm z-10"></div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-black uppercase tracking-tighter text-indigo-400">
                                  {idx === 0 ? 'Latest Interaction' : `Point ${company.reviews.length - idx}`}
                                </span>
                                <span className="text-[10px] font-bold text-slate-400">
                                  {new Date(rev.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                                </span>
                              </div>
                              <h4 className="text-lg font-black text-slate-900 tracking-tight mb-3">{rev.title}</h4>
                              <p className="text-sm font-medium text-slate-600 leading-relaxed italic border-l-4 border-indigo-50 pl-5">
                                "{parseReviewDetails(rev.comment).cleanComment}"
                              </p>
                              <div className="mt-4 flex items-center gap-3">
                                 <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-100 text-[10px] font-black text-amber-600 uppercase">
                                    <IconStar className="fill-amber-400" />
                                    {rev.rating}.0
                                 </div>
                                 <span className={`px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest ${statusTone[rev.status] || 'bg-slate-100'}`}>
                                    {rev.status}
                                 </span>
                              </div>

                              {rev.adminReply && (
                                <div className="mt-5 p-5 rounded-2xl bg-indigo-900 text-white shadow-xl shadow-indigo-100/50 animate-in fade-in zoom-in-95">
                                   <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-indigo-300 mb-2">
                                      <IconCheck className="text-sm" />
                                      Official Response
                                   </div>
                                   <p className="text-xs leading-relaxed font-medium">"{rev.adminReply}"</p>
                                </div>
                              )}
                           </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : viewMode === 'student-analysis' ? (
            <div className="grid gap-6 md:grid-cols-2">
              {groupedByStudent.map((student) => (
                <div key={student.name} className="group overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white transition-all hover:shadow-2xl hover:shadow-emerald-50/50">
                  <div className="p-8">
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-2xl bg-emerald-600 border-4 border-emerald-50 flex items-center justify-center text-white text-2xl shadow-xl shadow-emerald-100 group-hover:rotate-6 transition-all">
                          <IconUser />
                        </div>
                        <div>
                          <h3 className="text-2xl font-black text-slate-900 tracking-tight">{student.name}</h3>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{student.reviews.length} Global Evaluations</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black uppercase tracking-widest text-amber-500 mb-1">Avg Score</p>
                        <div className="flex items-center gap-2 text-2xl font-black text-indigo-950">
                           <IconStar className="fill-amber-400 text-amber-400 text-xl" />
                           {student.avgRating}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setExpandedStudent(expandedStudent === student.name ? null : student.name)}
                      className={`w-full rounded-2xl py-4 text-xs font-black uppercase tracking-widest transition-all ${
                        expandedStudent === student.name
                          ? 'bg-slate-900 text-white'
                          : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white shadow-sm'
                      }`}
                    >
                      {expandedStudent === student.name ? 'Collapse Portfolio' : 'One-by-One History View'}
                    </button>
                  </div>

                  {expandedStudent === student.name && (
                    <div className="bg-slate-50/50 border-t border-slate-100 p-8 space-y-8 animate-in slide-in-from-top-4 duration-500">
                      <div className="relative pl-8 space-y-12 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-emerald-100">
                        {student.reviews.map((rev, idx) => (
                           <div key={rev._id} className="relative group/item">
                              <div className="absolute -left-[2.25rem] top-1.5 h-4 w-4 rounded-full border-4 border-white bg-emerald-600 shadow-sm z-10"></div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-black uppercase tracking-tighter text-emerald-500">
                                  {idx === 0 ? 'Latest Interaction' : `Point ${student.reviews.length - idx}`}
                                </span>
                                <span className="text-[10px] font-bold text-slate-400">
                                  {new Date(rev.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                                </span>
                              </div>
                              <h4 className="text-lg font-black text-slate-900 tracking-tight mb-3">{rev.title}</h4>
                              <p className="text-sm font-medium text-slate-600 leading-relaxed italic border-l-4 border-emerald-50 pl-5">
                                "{parseReviewDetails(rev.comment).cleanComment}"
                              </p>
                              <div className="mt-4 flex items-center gap-3">
                                 <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-100 text-[10px] font-black text-amber-600 uppercase">
                                    <IconStar className="fill-amber-400" />
                                    {rev.rating}.0
                                 </div>
                                 <span className={`px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest ${statusTone[rev.status] || 'bg-slate-100'}`}>
                                    {rev.status}
                                 </span>
                              </div>

                              {rev.adminReply && (
                                <div className="mt-5 p-5 rounded-2xl bg-emerald-700 text-white shadow-xl shadow-emerald-100/50 animate-in fade-in zoom-in-95">
                                   <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-emerald-200 mb-2">
                                      <IconCheck className="text-sm" />
                                      Official Response
                                   </div>
                                   <p className="text-xs leading-relaxed font-medium">"{rev.adminReply}"</p>
                                </div>
                              )}
                           </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            filteredReviews.map((review) => {
              const { cleanComment, details } = parseReviewDetails(review.comment);
              return (
                <div key={review._id} className="group relative rounded-[2.5rem] border border-slate-100 bg-white p-8 shadow-sm transition-all hover:shadow-2xl hover:shadow-indigo-50/50">
                  <div className="flex flex-col xl:flex-row gap-8 items-start">
                    <div className="flex-1 space-y-6">
                      <div className="flex flex-wrap items-center gap-4">
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">{review.title}</h2>
                        <span className={`inline-flex rounded-full border px-4 py-1.5 text-[10px] font-black uppercase tracking-widest ${statusTone[review.status] || 'bg-slate-100'}`}>
                          {review.status}
                        </span>
                        <div className="flex items-center gap-2 rounded-full bg-amber-50 px-4 py-1.5 text-xs font-black text-amber-600 border border-amber-100">
                          <IconStar className="fill-amber-400" />
                          {review.rating}.0 Quality Score
                        </div>
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-widest ${review.reviewerType === 'Student' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-indigo-100 text-indigo-700 border-indigo-200'} border`}>
                          {review.reviewerType === 'Student' ? <IconUser /> : <IconBuilding />}
                          {review.reviewerType || 'Company'} Feedback
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
                        <span className="text-indigo-600 hover:underline cursor-pointer">{review.reviewerType === 'Student' ? review.studentName : review.companyName}</span>
                        <span>•</span>
                        <span>{new Date(review.createdAt).toLocaleString(undefined, { dateStyle: 'long', timeStyle: 'short' })}</span>
                      </div>

                      <div className="prose prose-slate max-w-none">
                        <p className="text-lg leading-relaxed text-slate-600 font-medium">"{cleanComment}"</p>
                      </div>

                      {/* Display Parsed Details if available */}
                      {details && (
                        <div className="flex flex-wrap gap-4 pt-4">
                          {details['Category'] && (
                            <div className="rounded-2xl border border-indigo-50 bg-indigo-50/30 px-5 py-3 transition-all hover:bg-white">
                              <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-1">Feedback Domain</p>
                              <p className="text-sm font-bold text-indigo-900">{details['Category']}</p>
                            </div>
                          )}
                          {details['System Performance'] && (
                            <div className="rounded-2xl border border-violet-50 bg-violet-50/30 px-5 py-3 transition-all hover:bg-white">
                              <p className="text-[10px] font-black uppercase tracking-widest text-violet-400 mb-1">System Load Analysis</p>
                              <p className="text-sm font-bold text-violet-900">{details['System Performance']}</p>
                            </div>
                          )}
                          {details['Recommend'] && (
                            <div className="rounded-2xl border border-emerald-50 bg-emerald-50/30 px-5 py-3 transition-all hover:bg-white">
                              <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-1">Net Promoter Score</p>
                              <p className="text-sm font-bold text-emerald-900">{details['Recommend']}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-3 w-full xl:w-56 pt-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2 italic">Operation Manager</label>
                      <select
                        value={review.status}
                        onChange={(event) => handleStatusChange(review._id, event.target.value)}
                        className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 text-xs font-bold font-black transition-all focus:bg-white focus:ring-4 focus:ring-indigo-50 appearance-none text-slate-700"
                      >
                        <option value="pending">Mark as Pending</option>
                        <option value="replied">Mark as Replied</option>
                        <option value="closed">Close Case</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => handleStartReply(review)}
                        className="flex items-center justify-center gap-2 w-full rounded-2xl bg-indigo-900 py-4 text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-indigo-800 shadow-lg shadow-indigo-100"
                      >
                        <IconEdit />
                        {review.adminReply ? 'Revise Case' : 'Start Reply'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(review)}
                        className="flex items-center justify-center gap-2 w-full rounded-2xl border border-slate-100 py-4 text-xs font-black uppercase tracking-widest text-slate-400 transition-all hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100"
                      >
                        <IconTrash />
                        Purge Record
                      </button>
                    </div>
                  </div>

                  {review.adminReply && editingReviewId !== review._id && (
                    <div className="mt-8 relative overflow-hidden rounded-[2rem] border border-indigo-100 bg-indigo-50/60 p-6 text-slate-700">
                      <div className="absolute right-0 top-0 p-4 opacity-20">
                        <IconCheck className="text-4xl text-indigo-300" />
                      </div>
                      <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-3 text-[10px] font-black uppercase tracking-widest text-indigo-500">
                           <IconInfo />
                           Official Response from {review.repliedByName || 'Analysis Manager'}
                        </div>
                        <p className="text-base leading-relaxed font-medium text-slate-700">"{review.adminReply}"</p>
                      </div>
                    </div>
                  )}

                  {editingReviewId === review._id && (
                    <form onSubmit={handleReplySubmit} className="mt-8 rounded-[2.5rem] bg-indigo-50/50 border border-indigo-100 p-8 animate-in slide-in-from-top-4 duration-500">
                      <h3 className="text-xl font-black text-indigo-900 mb-6 flex items-center gap-3 tracking-tight">
                         <div className="h-10 w-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white">
                            <IconEdit />
                         </div>
                         Draft Official Analysis Response
                      </h3>
                      <div className="grid gap-6 md:grid-cols-[1fr_280px]">
                        <div className="space-y-2">
                          <label className="text-xs font-black uppercase tracking-widest text-indigo-400 px-2">Reply Message</label>
                          <textarea
                            name="adminReply"
                            value={replyForm.adminReply}
                            onChange={(event) => setReplyForm((current) => ({ ...current, adminReply: event.target.value }))}
                            placeholder="Address the company's concerns or provide performance insights..."
                            rows="6"
                            required
                            className="w-full rounded-[1.5rem] border-transparent bg-white px-6 py-5 text-sm outline-none transition-all focus:ring-4 focus:ring-indigo-100 placeholder:text-slate-300 shadow-sm font-medium"
                          />
                        </div>
                        <div className="space-y-6">
                           <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-indigo-400 px-2">Output Pipeline</label>
                            <select
                              name="status"
                              value={replyForm.status}
                              onChange={(event) => setReplyForm((current) => ({ ...current, status: event.target.value }))}
                              className="w-full rounded-[1.5rem] border-transparent bg-white px-6 py-5 text-sm font-bold outline-none transition-all focus:ring-4 focus:ring-indigo-100 shadow-sm"
                            >
                              <option value="replied">Update to Replied</option>
                              <option value="closed">Close Case File</option>
                              <option value="pending">Revert to Pending</option>
                            </select>
                          </div>
                          
                          <div className="space-y-2">
                            <button
                              type="submit"
                              className="w-full rounded-[1.5rem] bg-indigo-600 py-5 text-sm font-black uppercase tracking-widest text-white transition-all hover:bg-indigo-700 shadow-xl shadow-indigo-200"
                            >
                              Finalize Response
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingReviewId(null);
                                setReplyForm(initialReplyState);
                              }}
                              className="w-full rounded-[1.5rem] border-2 border-indigo-100 py-4 text-xs font-black uppercase tracking-widest text-indigo-600 transition-all hover:bg-white"
                            >
                              Discard Draft
                            </button>
                          </div>
                        </div>
                      </div>
                    </form>
                  )}
                </div>
              );
            })
          )}
          </div>
      </div>
    </AdminLayout>
  );
};

export default AdminReviewPage;
