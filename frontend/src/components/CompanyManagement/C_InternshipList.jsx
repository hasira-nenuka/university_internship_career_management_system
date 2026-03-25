import React, { useState } from 'react';
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
        if (status === 'verified') return 'Verified';
        if (status === 'pending') return 'Pending Verification';
        if (status === 'rejected') return 'Rejected';
        return 'Not Verified';
    };

    const getVerificationColor = (status) => {
        if (status === 'verified') return 'text-emerald-700 bg-emerald-100';
        if (status === 'pending') return 'text-amber-700 bg-amber-100';
        if (status === 'rejected') return 'text-rose-700 bg-rose-100';
        return 'text-slate-700 bg-slate-100';
    };

    const getThumbnail = (images) => {
        if (!Array.isArray(images) || images.length === 0) return null;
        return images[0] || null;
    };

    return (
        <div className="space-y-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow dark:shadow-lg p-6 border dark:border-slate-700">
                <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">My Internships</h2>
                <p className="text-gray-600 dark:text-slate-400 mb-6">
                    Manage your posted internships. You can edit, close, or delete opportunities as needed.
                </p>
                
                {internships.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">📭</div>
                        <p className="text-gray-500 dark:text-slate-400">No internships posted yet</p>
                        <p className="text-sm text-gray-400 dark:text-slate-500 mt-2">Click "Post Internship" to create your first opportunity</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {internships.map((internship) => (
                            <div key={internship._id} className="border border-gray-200 dark:border-slate-700 rounded-lg p-4 hover:shadow-md dark:hover:shadow-lg transition-shadow bg-gray-50 dark:bg-slate-700/50">
                                {editingId === internship._id ? (
                                    // Edit Mode
                                    <div className="space-y-3">
                                        <select
                                            value={editForm.title}
                                            onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                                        >
                                            {JOB_CATEGORIES.map((category) => (
                                                <option key={category} value={category}>{category}</option>
                                            ))}
                                        </select>
                                        <textarea
                                            value={editForm.description}
                                            onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                                            rows="3"
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                                        />
                                        <div className="grid grid-cols-2 gap-3">
                                            <select
                                                value={editForm.location}
                                                onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                                                className="px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                                            >
                                                {DISTRICTS.map((district) => (
                                                    <option key={district} value={district}>{district}</option>
                                                ))}
                                            </select>
                                            <select
                                                value={editForm.type}
                                                onChange={(e) => setEditForm({...editForm, type: e.target.value})}
                                                className="px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                                            >
                                                <option value="Full-time">Full-time</option>
                                                <option value="Part-time">Part-time</option>
                                                <option value="Remote">Remote</option>
                                                <option value="Hybrid">Hybrid</option>
                                            </select>
                                            <input
                                                type="text"
                                                value={editForm.duration}
                                                onChange={(e) => setEditForm({...editForm, duration: e.target.value})}
                                                placeholder="Duration"
                                                className="px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                                            />
                                            <input
                                                type="text"
                                                value={editForm.stipend}
                                                onChange={(e) => setEditForm({...editForm, stipend: e.target.value})}
                                                placeholder="Stipend"
                                                className="px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                                            />
                                            <input
                                                type="number"
                                                value={editForm.openings}
                                                onChange={(e) => setEditForm({...editForm, openings: e.target.value})}
                                                placeholder="Openings"
                                                className="px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                                            />
                                            <select
                                                value={editForm.status}
                                                onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                                                className="px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                                            >
                                                <option value="active">Active</option>
                                                <option value="closed">Closed</option>
                                            </select>
                                        </div>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleUpdate(internship._id)}
                                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                            >
                                                Save
                                            </button>
                                            <button
                                                onClick={() => setEditingId(null)}
                                                className="px-4 py-2 bg-gray-300 dark:bg-slate-600 text-gray-700 dark:text-slate-100 rounded-lg hover:bg-gray-400 dark:hover:bg-slate-500"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    // View Mode
                                    <div>
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-3 mb-2">
                                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                        {internship.title}
                                                    </h3>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(internship.status)}`}>
                                                        {internship.status}
                                                    </span>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getVerificationColor(internship.paymentVerificationStatus)}`}>
                                                        {getVerificationLabel(internship.paymentVerificationStatus)}
                                                    </span>
                                                </div>
                                                <div className="mb-3">
                                                    {getThumbnail(internship.images) ? (
                                                        <img
                                                            src={getThumbnail(internship.images)}
                                                            alt={`${internship.title} preview`}
                                                            className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                                                        />
                                                    ) : (
                                                        <div className="w-20 h-20 rounded-lg border border-dashed border-gray-300 text-xs text-gray-400 flex items-center justify-center">
                                                            No image
                                                        </div>
                                                    )}
                                                </div>
                                                <p className="text-gray-600 dark:text-slate-400 mb-3">{internship.description}</p>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                    <div>
                                                        <span className="text-gray-500 dark:text-slate-500">📍 Location:</span>
                                                        <span className="ml-2 text-gray-700 dark:text-slate-300">{internship.location}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500 dark:text-slate-500">💼 Type:</span>
                                                        <span className="ml-2 text-gray-700 dark:text-slate-300">{internship.type}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500 dark:text-slate-500">⏱️ Duration:</span>
                                                        <span className="ml-2 text-gray-700 dark:text-slate-300">{internship.duration}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500 dark:text-slate-500">💰 Stipend:</span>
                                                        <span className="ml-2 text-gray-700 dark:text-slate-300">{internship.stipend}</span>
                                                    </div>
                                                </div>
                                                <div className="mt-3">
                                                    <div className="text-sm text-gray-500 dark:text-slate-500">Required Skills:</div>
                                                    <div className="flex flex-wrap gap-2 mt-1">
                                                        {internship.skills?.map((skill, idx) => (
                                                            <span key={idx} className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-xs">
                                                                {skill}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="mt-3 text-sm text-gray-500 dark:text-slate-500">
                                                    Applications: {internship.applications?.length || 0} | 
                                                    Openings: {internship.openings}
                                                </div>
                                            </div>
                                            <div className="flex space-x-2 ml-4">
                                                <button
                                                    onClick={() => handleEdit(internship)}
                                                    className="px-3 py-1 text-indigo-600 hover:bg-indigo-50 rounded-lg"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => setShowDeleteConfirm(internship._id)}
                                                    className="px-3 py-1 text-red-600 hover:bg-red-50 rounded-lg"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                
                                {/* Delete Confirmation Modal */}
                                {showDeleteConfirm === internship._id && (
                                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                                        <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
                                            <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
                                            <p className="text-gray-600 mb-6">
                                                Are you sure you want to delete "{internship.title}"? This action cannot be undone.
                                            </p>
                                            <div className="flex space-x-3">
                                                <button
                                                    onClick={() => handleDelete(internship._id)}
                                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                                >
                                                    Delete
                                                </button>
                                                <button
                                                    onClick={() => setShowDeleteConfirm(null)}
                                                    className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                                                >
                                                    Cancel
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