import React, { useState, useEffect, useCallback } from 'react';
import { getApplications, updateApplicationStatus } from './C_CompanyUtils';

const C_ApplicationManagement = ({ internships }) => {
    const [selectedInternship, setSelectedInternship] = useState('');
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedApplication, setSelectedApplication] = useState(null);

    const fetchApplications = useCallback(async () => {
        if (!selectedInternship) return;
        
        setLoading(true);
        setError('');
        
        try {
            const result = await getApplications(selectedInternship);
            setApplications(result.data);
        } catch (err) {
            setError(err.message || 'Failed to fetch applications');
        } finally {
            setLoading(false);
        }
    }, [selectedInternship]);

    useEffect(() => {
        if (selectedInternship) {
            fetchApplications();
        }
    }, [selectedInternship, fetchApplications]);

    const handleStatusUpdate = async (applicationId, status) => {
        try {
            setError('');
            await updateApplicationStatus(applicationId, status);
            await fetchApplications();

            setSelectedApplication((current) => {
                if (!current || current._id !== applicationId) return current;
                return { ...current, status };
            });
        } catch (err) {
            const message = err?.message || 'Failed to update application status';
            setError(message);
            alert(message);
        }
    };

    const getStatusColor = (status) => {
        switch(status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'reviewed': return 'bg-blue-100 text-blue-800';
            case 'shortlisted': return 'bg-purple-100 text-purple-800';
            case 'accepted': return 'bg-green-100 text-green-800';
            case 'rejected': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow dark:shadow-lg p-6 border dark:border-slate-700">
                <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Application Management</h2>
                <p className="text-gray-600 dark:text-slate-400 mb-6">
                    Review and manage student applications for your internships.
                </p>
                
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                        Select Internship
                    </label>
                    <select
                        value={selectedInternship}
                        onChange={(e) => setSelectedInternship(e.target.value)}
                        className="w-full md:w-1/2 px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="">Choose an internship...</option>
                        {internships.map(internship => (
                            <option key={internship._id} value={internship._id}>
                                {internship.title} - {internship.location}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
            
            {loading && (
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4"></div>
                    <p className="text-gray-600 dark:text-slate-400">Loading applications...</p>
                </div>
            )}
            
            {error && (
                <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 px-4 py-3 rounded-lg">
                    {error}
                </div>
            )}
            
            {!loading && selectedInternship && applications.length === 0 && !error && (
                <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-300 px-4 py-3 rounded-lg">
                    No applications received for this internship yet.
                </div>
            )}
            
            {!loading && applications.length > 0 && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Applications ({applications.length})</h3>
                        <div className="flex space-x-2">
                            <span className="text-sm text-gray-500 dark:text-slate-400">
                                Pending: {applications.filter(a => a.status === 'pending').length}
                            </span>
                            <span className="text-sm text-gray-500 dark:text-slate-400">
                                Shortlisted: {applications.filter(a => a.status === 'shortlisted').length}
                            </span>
                        </div>
                    </div>
                    
                    {applications.map((app) => (
                        <div key={app._id} className="bg-white dark:bg-slate-800 rounded-lg shadow dark:shadow-lg p-6 hover:shadow-lg dark:hover:shadow-xl transition-shadow border dark:border-slate-700">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                                            {app.student?.name?.charAt(0) || 'S'}
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-semibold">{app.student?.name || 'Student'}</h4>
                                            <p className="text-gray-600">{app.student?.email || 'No email'}</p>
                                            <p className="text-sm text-gray-500">
                                                Preferred Field: {app.student?.preferredField || 'Not provided'}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                Applied: {new Date(app.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-4">
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <p className="font-medium mb-2">Cover Letter:</p>
                                            <p className="text-gray-700">{app.coverLetter || 'No cover letter provided'}</p>
                                        </div>
                                        
                                        {app.resume && (
                                            <div className="mt-3">
                                                <a
                                                    href={app.resume}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-indigo-600 hover:underline inline-flex items-center"
                                                >
                                                    📄 View Resume
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="ml-4">
                                    <select
                                        value={app.status}
                                        onChange={(e) => handleStatusUpdate(app._id, e.target.value)}
                                        className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(app.status)} border-0 focus:ring-2 focus:ring-indigo-500`}
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="reviewed">Reviewed</option>
                                        <option value="shortlisted">Shortlisted</option>
                                        <option value="accepted">Hired</option>
                                        <option value="rejected">Rejected</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <button
                                    onClick={() => setSelectedApplication(app)}
                                    className="px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                >
                                    View Full Details
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            
            {/* Application Details Modal */}
            {selectedApplication && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 my-8 max-h-screen overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold">Application Details</h2>
                            <button
                                onClick={() => setSelectedApplication(null)}
                                className="text-gray-500 hover:text-gray-700 text-2xl"
                            >
                                &times;
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <h3 className="font-semibold text-gray-700">Student Information</h3>
                                <p><strong>Name:</strong> {selectedApplication.student?.name}</p>
                                <p><strong>Email:</strong> {selectedApplication.student?.email}</p>
                                <p><strong>University:</strong> {selectedApplication.student?.university}</p>
                                <p><strong>Degree:</strong> {selectedApplication.student?.degree || 'Not provided'}</p>
                                <p><strong>Education Level:</strong> {selectedApplication.student?.eduLevel || 'Not provided'}</p>
                                <p><strong>Preferred Field:</strong> {selectedApplication.student?.preferredField || 'Not provided'}</p>
                                <p><strong>Contact Number:</strong> {selectedApplication.student?.contactNumber || 'Not provided'}</p>
                                <p><strong>District:</strong> {selectedApplication.student?.district || 'Not provided'}</p>
                                <p><strong>Province:</strong> {selectedApplication.student?.province || 'Not provided'}</p>
                                <p><strong>Frontend Skills:</strong> {selectedApplication.student?.frontendSkills?.join(', ') || 'Not provided'}</p>
                                <p><strong>Backend Skills:</strong> {selectedApplication.student?.backendSkills?.join(', ') || 'Not provided'}</p>
                                <p><strong>Database Skills:</strong> {selectedApplication.student?.databaseSkills?.join(', ') || 'Not provided'}</p>
                                <p><strong>Bio:</strong> {selectedApplication.student?.bio || 'Not provided'}</p>
                            </div>
                            
                            <div>
                                <h3 className="font-semibold text-gray-700">Application Details</h3>
                                <p><strong>Applied on:</strong> {new Date(selectedApplication.createdAt).toLocaleDateString()}</p>
                                <p><strong>Status:</strong> 
                                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedApplication.status)}`}>
                                        {selectedApplication.status}
                                    </span>
                                </p>
                            </div>
                            
                            <div>
                                <h3 className="font-semibold text-gray-700">Cover Letter</h3>
                                <div className="bg-gray-50 rounded-lg p-4 mt-1">
                                    <p className="whitespace-pre-wrap">{selectedApplication.coverLetter || 'No cover letter provided'}</p>
                                </div>
                            </div>
                            
                            {(selectedApplication.student?.cv || selectedApplication.resume) && (
                                <div>
                                    <h3 className="font-semibold text-gray-700">Resume / CV</h3>
                                    <a
                                        href={selectedApplication.student?.cv ? `http://localhost:5000/uploads/${selectedApplication.student.cv}` : selectedApplication.resume}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-block mt-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                                    >
                                        Download Resume
                                    </a>
                                </div>
                            )}
                            
                            <div className="flex space-x-3 pt-4">
                                <button
                                    onClick={() => handleStatusUpdate(selectedApplication._id, 'shortlisted')}
                                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                                >
                                    Shortlist
                                </button>
                                <button
                                    onClick={() => handleStatusUpdate(selectedApplication._id, 'accepted')}
                                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                >
                                    Hire
                                </button>
                                <button
                                    onClick={() => handleStatusUpdate(selectedApplication._id, 'rejected')}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                >
                                    Reject
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default C_ApplicationManagement;
