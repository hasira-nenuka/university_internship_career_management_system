import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import { updateInternship, deleteInternship } from './C_CompanyUtils';

const JOB_CATEGORIES = [
    'Frontend Developer',
    'Backend Developer',
    'Full Stack Developer',
    'Mobile App Developer',
    'QA Engineer',
    'Software Tester',
    'Automation Tester',
    'DevOps Engineer',
    'Cloud Engineer',
    'System Administrator',
    'Data Analyst',
    'Data Scientist',
    'Machine Learning Engineer',
    'UI/UX Designer',
    'Project Manager',
    'Product Manager',
    'Business Analyst',
    'Cybersecurity Analyst'
];

const DISTRICTS = [
    'Colombo', 'Gampaha', 'Kalutara',
    'Kandy', 'Matale', 'Nuwara Eliya',
    'Galle', 'Matara', 'Hambantota',
    'Jaffna', 'Kilinochchi', 'Mannar', 'Vavuniya', 'Mullaitivu',
    'Batticaloa', 'Ampara', 'Trincomalee',
    'Kurunegala', 'Puttalam',
    'Anuradhapura', 'Polonnaruwa',
    'Badulla', 'Moneragala',
    'Ratnapura', 'Kegalle'
];

const C_InternshipList = ({ internships, onUpdate }) => {
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

    const normalizeVerificationStatus = (status) => {
        if (status === 'verified') return 'verified';
        if (status === 'rejected') return 'rejected';
        if (status === 'pending') return 'pending';
        return 'pending';
    };

    const totalInternships = internships.length;
    const activeInternships = internships.filter((item) => item.status === 'active').length;
    const totalApplications = internships.reduce((sum, item) => sum + (item.applications?.length || 0), 0);
    const verifiedInternships = internships.filter((item) => item.paymentVerificationStatus === 'verified').length;

    const handleEdit = (internship) => {
        setEditingId(internship._id);
        setEditForm({
            title: internship.title,
            description: internship.description,
            location: internship.location,
            type: internship.type,
            duration: internship.duration,
            stipend: internship.stipend,
            openings: internship.openings,
            status: internship.status
        });
    };

    const handleUpdate = async (id) => {
        try {
            await updateInternship(id, editForm);
            setEditingId(null);
            onUpdate();
        } catch (error) {
            alert('Failed to update internship');
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteInternship(id);
            setShowDeleteConfirm(null);
            onUpdate();
        } catch (error) {
            alert('Failed to delete internship');
        }
    };

    const getStatusColor = (status) => {
        return status === 'active' ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100';
    };

    const getVerificationLabel = (status) => {
        const normalizedStatus = normalizeVerificationStatus(status);

        if (normalizedStatus === 'verified') return 'Verified';
        if (normalizedStatus === 'rejected') return 'Rejected';
        return 'Pending';
    };

    const getVerificationColor = (status) => {
        const normalizedStatus = normalizeVerificationStatus(status);

        if (normalizedStatus === 'verified') return 'text-emerald-700 bg-emerald-100';
        if (normalizedStatus === 'rejected') return 'text-rose-700 bg-rose-100';
        return 'text-amber-700 bg-amber-100';
    };

    const getThumbnail = (images) => {
        if (!Array.isArray(images) || images.length === 0) return null;
        return images[0] || null;
    };

    const getTypeStyle = (type) => {
        const category = (type || '').toLowerCase();

        if (category.includes('remote')) return 'bg-sky-100 text-sky-700 border-sky-300 dark:bg-sky-500/15 dark:text-sky-300 dark:border-sky-400/30';
        if (category.includes('part')) return 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-400/30';
        if (category.includes('hybrid')) return 'bg-cyan-100 text-cyan-700 border-cyan-300 dark:bg-cyan-500/15 dark:text-cyan-300 dark:border-cyan-400/30';
        return 'bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-400/30';
    };

    const formatStatusLabel = (status) => {
        if (!status) return 'Unknown';
        return `${status.charAt(0).toUpperCase()}${status.slice(1)}`;
    };

    const getSafeText = (value) => {
        if (value === null || value === undefined || value === '') return 'N/A';
        if (Array.isArray(value)) return value.length ? value.join(', ') : 'N/A';
        return String(value);
    };

    const downloadInternshipDetailsPdf = () => {
        const doc = new jsPDF({ unit: 'pt', format: 'a4' });
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 40;
        const lineHeight = 16;
        const sectionGap = 12;
        const companyName = localStorage.getItem('companyName') || 'Company';
        const reportDate = new Date().toLocaleString();
        let y = margin;

        const ensureSpace = (neededHeight = lineHeight) => {
            if (y + neededHeight > pageHeight - margin) {
                doc.addPage();
                y = margin;
            }
        };

        const addWrappedText = (text, x, maxWidth, fontSize = 10) => {
            doc.setFontSize(fontSize);
            const wrapped = doc.splitTextToSize(text, maxWidth);
            ensureSpace(wrapped.length * lineHeight + 4);
            doc.text(wrapped, x, y);
            y += wrapped.length * lineHeight;
        };

        const addField = (label, value) => {
            const formattedValue = getSafeText(value);
            const labelText = `${label}:`;
            const labelWidth = 130;

            ensureSpace(lineHeight * 2);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(10);
            doc.text(labelText, margin, y);

            doc.setFont('helvetica', 'normal');
            const wrapped = doc.splitTextToSize(formattedValue, pageWidth - (margin * 2) - labelWidth);
            doc.text(wrapped, margin + labelWidth, y);
            y += wrapped.length * lineHeight;
        };

        doc.setFillColor(14, 116, 144);
        doc.rect(0, 0, pageWidth, 82, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(18);
        doc.text('INTERNSHIP DETAILS REPORT', margin, 36);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.text(`Company: ${companyName}`, margin, 56);
        doc.text(`Generated: ${reportDate}`, margin, 72);

        y = 112;
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text('Summary', margin, y);
        y += lineHeight + 2;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        addWrappedText(`Total internships: ${totalInternships}   |   Active: ${activeInternships}   |   Verified: ${verifiedInternships}   |   Applications: ${totalApplications}`, margin, pageWidth - (margin * 2));
        y += sectionGap;

        internships.forEach((internship, index) => {
            ensureSpace(90);

            doc.setDrawColor(210, 214, 220);
            doc.line(margin, y, pageWidth - margin, y);
            y += 14;

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(12);
            addWrappedText(`Internship ${index + 1}: ${getSafeText(internship.title)}`, margin, pageWidth - (margin * 2), 12);
            y += 4;

            addField('Status', formatStatusLabel(internship.status));
            addField('Verification', getVerificationLabel(internship.paymentVerificationStatus));
            addField('Type', internship.type);
            addField('Location', internship.location);
            addField('Duration', internship.duration);
            addField('Stipend', internship.stipend);
            addField('Openings', internship.openings);
            addField('Applications', internship.applications?.length || 0);
            addField('Skills', internship.skills);
            addField('Posted Date', internship.createdAt ? new Date(internship.createdAt).toLocaleDateString() : 'N/A');
            addField('Description', internship.description);

            y += sectionGap;
        });

        const fileDate = new Date().toISOString().slice(0, 10);
        doc.save(`internship-details-${fileDate}.pdf`);
    };

    return (
        <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl dark:border-slate-700/50 dark:bg-[#0b1f43] dark:shadow-[0_24px_60px_-24px_rgba(15,23,42,0.9)]">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -left-20 -top-24 h-72 w-72 rounded-full bg-cyan-500/20 opacity-0 blur-3xl dark:opacity-100" />
                <div className="absolute right-0 top-10 h-72 w-72 rounded-full bg-emerald-500/15 opacity-0 blur-3xl dark:opacity-100" />
                <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-amber-400/10 opacity-0 blur-3xl dark:opacity-100" />
            </div>

            <div className="relative space-y-7 p-4 sm:p-6 lg:p-8">
                <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-5 sm:p-6 dark:border-white/15 dark:bg-white/5 dark:backdrop-blur-sm">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <span className="inline-flex items-center rounded-full border border-cyan-300 bg-cyan-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700 dark:border-cyan-300/40 dark:bg-cyan-400/15 dark:text-cyan-200">
                                Company workspace
                            </span>
                            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl dark:text-white">My Internships</h2>
                            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base dark:text-slate-300">
                                Curate every listing from one studio-style dashboard. Update details, track applications, and keep opportunities fresh.
                            </p>
                            <button
                                onClick={downloadInternshipDetailsPdf}
                                disabled={!internships.length}
                                className="mt-4 inline-flex items-center rounded-xl border border-cyan-300 bg-cyan-50 px-4 py-2 text-sm font-semibold text-cyan-700 transition hover:bg-cyan-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-cyan-400/40 dark:bg-cyan-500/10 dark:text-cyan-200 dark:hover:bg-cyan-500/20"
                            >
                                Download Details PDF
                            </button>
                        </div>

                        <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-4 lg:w-auto">
                            <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-white/15 dark:bg-slate-900/70">
                                <div className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400">Total</div>
                                <div className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-white">{totalInternships}</div>
                            </div>
                            <div className="rounded-xl border border-emerald-300/25 bg-emerald-500/10 p-3">
                                <div className="text-xs uppercase tracking-widest text-emerald-700 dark:text-emerald-300">Active</div>
                                <div className="mt-1 text-2xl font-extrabold text-emerald-700 dark:text-emerald-200">{activeInternships}</div>
                            </div>
                            <div className="rounded-xl border border-sky-300/25 bg-sky-500/10 p-3">
                                <div className="text-xs uppercase tracking-widest text-sky-700 dark:text-sky-300">Applications</div>
                                <div className="mt-1 text-2xl font-extrabold text-sky-700 dark:text-sky-100">{totalApplications}</div>
                            </div>
                            <div className="rounded-xl border border-amber-300/25 bg-amber-500/10 p-3">
                                <div className="text-xs uppercase tracking-widest text-amber-700 dark:text-amber-300">Verified</div>
                                <div className="mt-1 text-2xl font-extrabold text-amber-700 dark:text-amber-100">{verifiedInternships}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {internships.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center dark:border-slate-500/60 dark:bg-slate-900/70">
                        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl border border-slate-300 bg-white text-3xl dark:border-slate-500/60 dark:bg-slate-800/70">
                            +
                        </div>
                        <p className="text-xl font-semibold text-slate-900 dark:text-white">No internships posted yet</p>
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Use Post Internship to publish your first opening and start receiving applicants.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {internships.map((internship) => (
                            <div
                                key={internship._id}
                                className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-300/50 hover:shadow-md dark:border-slate-700/70 dark:bg-slate-900/75 dark:shadow-[0_12px_30px_-22px_rgba(8,47,73,0.9)] dark:hover:border-cyan-300/30 dark:hover:bg-slate-900"
                            >
                                <div className="pointer-events-none absolute -right-20 -top-20 h-44 w-44 rounded-full bg-cyan-500/10 opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100 dark:opacity-100" />

                                {editingId === internship._id ? (
                                    <div className="space-y-4">
                                        <div className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700 dark:text-cyan-200">Edit Internship</div>
                                        <select
                                            value={editForm.title}
                                            onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-cyan-300 transition focus:ring-2 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
                                        >
                                            {JOB_CATEGORIES.map((category) => (
                                                <option key={category} value={category}>{category}</option>
                                            ))}
                                        </select>
                                        <textarea
                                            value={editForm.description}
                                            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                            rows="3"
                                            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-cyan-300 transition focus:ring-2 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
                                        />
                                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                                            <select
                                                value={editForm.location}
                                                onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                                                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-cyan-300 transition focus:ring-2 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
                                            >
                                                {DISTRICTS.map((district) => (
                                                    <option key={district} value={district}>{district}</option>
                                                ))}
                                            </select>
                                            <select
                                                value={editForm.type}
                                                onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                                                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-cyan-300 transition focus:ring-2 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
                                            >
                                                <option value="Full-time">Full-time</option>
                                                <option value="Part-time">Part-time</option>
                                                <option value="Remote">Remote</option>
                                                <option value="Hybrid">Hybrid</option>
                                            </select>
                                            <input
                                                type="text"
                                                value={editForm.duration}
                                                onChange={(e) => setEditForm({ ...editForm, duration: e.target.value })}
                                                placeholder="Duration"
                                                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-cyan-300 transition focus:ring-2 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
                                            />
                                            <input
                                                type="text"
                                                value={editForm.stipend}
                                                onChange={(e) => setEditForm({ ...editForm, stipend: e.target.value })}
                                                placeholder="Stipend"
                                                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-cyan-300 transition focus:ring-2 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
                                            />
                                            <input
                                                type="number"
                                                value={editForm.openings}
                                                onChange={(e) => setEditForm({ ...editForm, openings: e.target.value })}
                                                placeholder="Openings"
                                                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-cyan-300 transition focus:ring-2 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
                                            />
                                            <select
                                                value={editForm.status}
                                                onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                                                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-cyan-300 transition focus:ring-2 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
                                            >
                                                <option value="active">Active</option>
                                                <option value="closed">Closed</option>
                                            </select>
                                        </div>
                                        <div className="flex flex-wrap gap-3">
                                            <button
                                                onClick={() => handleUpdate(internship._id)}
                                                className="rounded-xl bg-emerald-500 px-5 py-2 font-semibold text-white transition hover:bg-emerald-400"
                                            >
                                                Save Changes
                                            </button>
                                            <button
                                                onClick={() => setEditingId(null)}
                                                className="rounded-xl border border-slate-300 px-5 py-2 font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-500 dark:text-slate-200 dark:hover:bg-slate-800"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                            <div className="flex min-w-0 flex-1 gap-4">
                                                <div className="shrink-0">
                                                    {getThumbnail(internship.images) ? (
                                                        <img
                                                            src={getThumbnail(internship.images)}
                                                            alt={`${internship.title} preview`}
                                                            className="h-24 w-24 rounded-2xl border border-slate-300 object-cover dark:border-slate-600"
                                                        />
                                                    ) : (
                                                        <div className="flex h-24 w-24 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-100 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-500 dark:bg-slate-800 dark:text-slate-400">
                                                            No Image
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <h3 className="truncate text-xl font-bold text-slate-900 dark:text-white">{internship.title}</h3>
                                                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(internship.status)}`}>
                                                            {formatStatusLabel(internship.status)}
                                                        </span>
                                                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getVerificationColor(internship.paymentVerificationStatus)}`}>
                                                            {getVerificationLabel(internship.paymentVerificationStatus)}
                                                        </span>
                                                        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${getTypeStyle(internship.type)}`}>
                                                            {internship.type || 'N/A'}
                                                        </span>
                                                    </div>
                                                    <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base dark:text-slate-300">{internship.description}</p>
                                                </div>
                                            </div>

                                            <div className="flex shrink-0 gap-2 self-start">
                                                <button
                                                    onClick={() => handleEdit(internship)}
                                                    className="rounded-xl border border-cyan-300 bg-cyan-50 px-4 py-2 text-sm font-semibold text-cyan-700 transition hover:bg-cyan-100 dark:border-cyan-400/40 dark:bg-cyan-500/10 dark:text-cyan-200 dark:hover:bg-cyan-500/20"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => setShowDeleteConfirm(internship._id)}
                                                    className="rounded-xl border border-rose-300 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 dark:border-rose-400/40 dark:bg-rose-500/10 dark:text-rose-200 dark:hover:bg-rose-500/20"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                                            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-950/80">
                                                <div className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">Location</div>
                                                <div className="mt-1 font-semibold text-slate-800 dark:text-slate-100">{internship.location}</div>
                                            </div>
                                            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-950/80">
                                                <div className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">Duration</div>
                                                <div className="mt-1 font-semibold text-slate-800 dark:text-slate-100">{internship.duration}</div>
                                            </div>
                                            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-950/80">
                                                <div className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">Stipend</div>
                                                <div className="mt-1 font-semibold text-slate-800 dark:text-slate-100">{internship.stipend}</div>
                                            </div>
                                            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-950/80">
                                                <div className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">Openings</div>
                                                <div className="mt-1 font-semibold text-slate-800 dark:text-slate-100">{internship.openings}</div>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center justify-between gap-3">
                                            <div className="flex flex-wrap gap-2">
                                                {internship.skills?.length ? internship.skills.map((skill, idx) => (
                                                    <span key={idx} className="rounded-full border border-slate-300 bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200">
                                                        {skill}
                                                    </span>
                                                )) : (
                                                    <span className="text-sm text-slate-500 dark:text-slate-400">No skills listed</span>
                                                )}
                                            </div>
                                            <div className="rounded-full border border-slate-300 bg-slate-100 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-slate-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                                {internship.applications?.length || 0} applications
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {showDeleteConfirm === internship._id && (
                                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm dark:bg-slate-950/80">
                                        <div className="w-full max-w-md rounded-2xl border border-rose-200 bg-white p-6 shadow-2xl dark:border-rose-400/40 dark:bg-slate-900">
                                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Delete Internship</h3>
                                            <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                                                This will permanently remove <span className="font-semibold text-slate-900 dark:text-white">{internship.title}</span>. This action cannot be undone.
                                            </p>
                                            <div className="mt-6 flex gap-3">
                                                <button
                                                    onClick={() => handleDelete(internship._id)}
                                                    className="flex-1 rounded-xl bg-rose-600 px-4 py-2 font-semibold text-white transition hover:bg-rose-500"
                                                >
                                                    Yes, Delete
                                                </button>
                                                <button
                                                    onClick={() => setShowDeleteConfirm(null)}
                                                    className="flex-1 rounded-xl border border-slate-300 px-4 py-2 font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-500 dark:text-slate-200 dark:hover:bg-slate-800"
                                                >
                                                    Keep It
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default C_InternshipList;
