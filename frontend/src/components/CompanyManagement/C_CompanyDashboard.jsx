import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getCompanyProfile, getCompanyInternships, logoutCompany } from './C_CompanyUtils';
import PostInternship from './C_PostInternship';
import InternshipList from './C_InternshipList';
import StudentRecommendations from './C_StudentRecommendations';
import CompanyProfile from './C_CompanyProfile';
import ApplicationManagement from './C_ApplicationManagement';
import CompanyReviews from './C_CompanyReviews';

const C_CompanyDashboard = () => {
    const navigate = useNavigate();
    const { state } = useLocation();
    const [activeTab, setActiveTab] = useState('overview');
    const [companyData, setCompanyData] = useState(null);
    const [internships, setInternships] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (state?.activeTab) {
            setActiveTab(state.activeTab);
        }
    }, [state]);

    const fetchCompanyData = useCallback(async () => {
        try {
            const result = await getCompanyProfile();
            setCompanyData(result.data);
        } catch (error) {
            console.error('Error fetching company data:', error);
            if (error.message === 'Unauthorized') {
                logoutCompany();
                navigate('/login/company');
            }
        }
    }, [navigate]);

    const fetchInternships = useCallback(async () => {
        try {
            const result = await getCompanyInternships();
            setInternships(result.data);
        } catch (error) {
            console.error('Error fetching internships:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const token = localStorage.getItem('companyToken');
        if (!token) {
            // UI preview mode: allow dashboard rendering without auth token.
            setCompanyData({
                companyName: localStorage.getItem('companyName') || 'Demo Company'
            });
            setInternships([]);
            setLoading(false);
            return;
        }
        
        fetchCompanyData();
        fetchInternships();
    }, [fetchCompanyData, fetchInternships]);

    useEffect(() => {
        if (activeTab === 'internships' || activeTab === 'overview') {
            fetchInternships();
        }
    }, [activeTab, fetchInternships]);

    useEffect(() => {
        const refreshOnFocus = () => {
            fetchInternships();
        };

        const refreshOnVisible = () => {
            if (document.visibilityState === 'visible') {
                fetchInternships();
            }
        };

        window.addEventListener('focus', refreshOnFocus);
        document.addEventListener('visibilitychange', refreshOnVisible);

        return () => {
            window.removeEventListener('focus', refreshOnFocus);
            document.removeEventListener('visibilitychange', refreshOnVisible);
        };
    }, [fetchInternships]);

    const handleLogout = () => {
        logoutCompany();
        navigate('/');
    };

    const refreshInternships = () => {
        fetchInternships();
    };

    if (loading) {
        return (
            <div className="min-h-screen dark:bg-slate-900 flex items-center justify-center">
                <div className="text-xl text-gray-600 dark:text-slate-300">Loading...</div>
            </div>
        );
    }

    const activeInternships = internships.filter(i => i.status === 'active');
    const totalApplications = internships.reduce((sum, i) => sum + (i.applications?.length || 0), 0);

    return (
        <div className="min-h-screen dark:bg-slate-900 bg-gray-50">
            {/* Header */}
            <header className="bg-white dark:bg-slate-800 shadow-sm sticky top-0 z-10 border-b dark:border-slate-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                StepIn Company Portal
                            </h1>
                            <span className="text-gray-600 dark:text-slate-400">|</span>
                            <span className="text-gray-600 dark:text-slate-400 font-medium">{companyData?.companyName}</span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-500 dark:text-slate-400">
                                Welcome, {companyData?.companyName}
                            </span>
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Navigation Tabs */}
            <div className="border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 sticky top-[73px] z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <nav className="flex space-x-8 overflow-x-auto">
                        {[
                            { id: 'overview', name: 'Dashboard Overview', icon: '📊' },
                            { id: 'post', name: 'Post Internship', icon: '📝' },
                            { id: 'internships', name: 'My Internships', icon: '💼' },
                            { id: 'applications', name: 'Applications', icon: '📋' },
                            { id: 'recommendations', name: 'Find Students', icon: '🎯' },
                            { id: 'reviews', name: 'Reviews', icon: '⭐' },
                            { id: 'profile', name: 'Company Profile', icon: '🏢' }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 whitespace-nowrap transition ${
                                    activeTab === tab.id
                                        ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                                        : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300 hover:border-gray-300 dark:hover:border-slate-600'
                                }`}
                            >
                                <span>{tab.icon}</span>
                                <span>{tab.name}</span>
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="bg-white dark:bg-slate-800 rounded-lg shadow dark:shadow-lg p-6 hover:shadow-lg dark:hover:shadow-xl transition-shadow border dark:border-slate-700">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{internships.length}</div>
                                        <div className="text-gray-600 dark:text-slate-400 mt-1">Total Internships</div>
                                    </div>
                                    <div className="text-4xl">💼</div>
                                </div>
                            </div>
                            <div className="bg-white dark:bg-slate-800 rounded-lg shadow dark:shadow-lg p-6 hover:shadow-lg dark:hover:shadow-xl transition-shadow border dark:border-slate-700">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-3xl font-bold text-green-600 dark:text-green-400">{activeInternships.length}</div>
                                        <div className="text-gray-600 dark:text-slate-400 mt-1">Active Internships</div>
                                    </div>
                                    <div className="text-4xl">✅</div>
                                </div>
                            </div>
                            <div className="bg-white dark:bg-slate-800 rounded-lg shadow dark:shadow-lg p-6 hover:shadow-lg dark:hover:shadow-xl transition-shadow border dark:border-slate-700">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{totalApplications}</div>
                                        <div className="text-gray-600 dark:text-slate-400 mt-1">Total Applications</div>
                                    </div>
                                    <div className="text-4xl">📋</div>
                                </div>
                            </div>
                            <div className="bg-white dark:bg-slate-800 rounded-lg shadow dark:shadow-lg p-6 hover:shadow-lg dark:hover:shadow-xl transition-shadow border dark:border-slate-700">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                                            {internships.filter(i => i.matchScore > 70).length}
                                        </div>
                                        <div className="text-gray-600 dark:text-slate-400 mt-1">High Match</div>
                                    </div>
                                    <div className="text-4xl">🎯</div>
                                </div>
                            </div>
                        </div>

                        {/* Welcome Message */}
                        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                Welcome back, {companyData?.companyName}!
                            </h2>
                            <p className="text-gray-600">
                                Post new internship opportunities and find the best student talent for your company.
                                Use our AI-powered matching system to discover the most suitable candidates.
                            </p>
                        </div>

                        {/* Quick Actions */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white rounded-lg shadow p-6">
                                <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                                <div className="space-y-3">
                                    <button
                                        onClick={() => setActiveTab('post')}
                                        className="w-full p-3 border-2 border-dashed border-indigo-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors text-left"
                                    >
                                        <div className="flex items-center space-x-3">
                                            <span className="text-2xl">📝</span>
                                            <div>
                                                <div className="font-semibold text-indigo-600">Post New Internship</div>
                                                <div className="text-sm text-gray-500">Create a new opportunity for students</div>
                                            </div>
                                        </div>
                                    </button>
                                    <button
                                        onClick={() => navigate('/payments/upload', {
                                            state: {
                                                companyId: localStorage.getItem('companyId'),
                                                companyName: companyData?.companyName || localStorage.getItem('companyName') || ''
                                            }
                                        })}
                                        className="w-full p-3 border-2 border-dashed border-emerald-300 rounded-lg hover:border-emerald-500 hover:bg-emerald-50 transition-colors text-left"
                                    >
                                        <div className="flex items-center space-x-3">
                                            <span className="text-2xl">💳</span>
                                            <div>
                                                <div className="font-semibold text-emerald-600">Upload Payment Slip</div>
                                                <div className="text-sm text-gray-500">Submit payment details and proof</div>
                                            </div>
                                        </div>
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('recommendations')}
                                        className="w-full p-3 border-2 border-dashed border-purple-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors text-left"
                                    >
                                        <div className="flex items-center space-x-3">
                                            <span className="text-2xl">🎯</span>
                                            <div>
                                                <div className="font-semibold text-purple-600">Find Suitable Students</div>
                                                <div className="text-sm text-gray-500">Get AI-powered student recommendations</div>
                                            </div>
                                        </div>
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('reviews')}
                                        className="w-full p-3 border-2 border-dashed border-amber-300 rounded-lg hover:border-amber-500 hover:bg-amber-50 transition-colors text-left"
                                    >
                                        <div className="flex items-center space-x-3">
                                            <span className="text-2xl">⭐</span>
                                            <div>
                                                <div className="font-semibold text-amber-600">Leave Platform Review</div>
                                                <div className="text-sm text-gray-500">Send feedback to the review management team</div>
                                            </div>
                                        </div>
                                    </button>
                                </div>
                            </div>
                            
                            {/* Recent Activity */}
                            <div className="bg-white rounded-lg shadow p-6">
                                <h3 className="text-lg font-semibold mb-4">Recent Internships</h3>
                                {internships.slice(0, 3).map((internship) => (
                                    <div key={internship._id} className="border-b border-gray-100 py-3 last:border-0">
                                        <div className="font-medium text-gray-900">{internship.title}</div>
                                        <div className="text-sm text-gray-500">
                                            Posted: {new Date(internship.createdAt).toLocaleDateString()}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            Status: {internship.status === 'active' ? '✅ Active' : '🔒 Closed'}
                                        </div>
                                    </div>
                                ))}
                                {internships.length === 0 && (
                                    <p className="text-gray-500 text-center py-4">No internships posted yet</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'post' && (
                    <PostInternship onSuccess={(createdInternship) => {
                        refreshInternships();
                        navigate('/payments/upload', {
                            state: {
                                companyId: localStorage.getItem('companyId'),
                                companyName: companyData?.companyName || localStorage.getItem('companyName') || '',
                                internshipId: createdInternship?._id || '',
                                internshipTitle: createdInternship?.title || ''
                            }
                        });
                    }} />
                )}

                {activeTab === 'internships' && (
                    <InternshipList internships={internships} onUpdate={refreshInternships} />
                )}

                {activeTab === 'applications' && (
                    <ApplicationManagement internships={internships} />
                )}

                {activeTab === 'recommendations' && (
                    <StudentRecommendations internships={internships} />
                )}

                {activeTab === 'reviews' && (
                    <CompanyReviews />
                )}

                {activeTab === 'profile' && (
                    <CompanyProfile companyData={companyData} onUpdate={fetchCompanyData} />
                )}
            </main>
        </div>
    );
};

export default C_CompanyDashboard;
