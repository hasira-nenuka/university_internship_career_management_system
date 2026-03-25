import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCompanyProAccount, getStudentRecommendations, searchStudentsDirectly } from './C_CompanyUtils';
import C_MatchSummary from './C_MatchSummary';

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

const C_StudentRecommendations = ({ internships }) => {
    const navigate = useNavigate();
    const [selectedInternship, setSelectedInternship] = useState('');
    const [recommendations, setRecommendations] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [proStatus, setProStatus] = useState(null);
    const [directSearch, setDirectSearch] = useState({ category: '', district: '' });
    const [directResults, setDirectResults] = useState([]);
    const [directLoading, setDirectLoading] = useState(false);
    const [directError, setDirectError] = useState('');

    const isProActive = Boolean(proStatus?.isProActive);

    useEffect(() => {
        const fetchProStatus = async () => {
            try {
                const result = await getCompanyProAccount();
                setProStatus(result.data);
            } catch (err) {
                setProStatus({ isProActive: false, status: 'inactive' });
            }
        };

        fetchProStatus();
    }, []);

    const fetchRecommendations = async () => {
        if (!selectedInternship) return;
        
        setLoading(true);
        setError('');
        
        try {
            const result = await getStudentRecommendations(selectedInternship);
            setRecommendations(result.data);
        } catch (err) {
            setError(err.message || 'Failed to fetch recommendations');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (selectedInternship) {
            fetchRecommendations();
        }
    }, [selectedInternship]);

    const handleDirectSearch = async () => {
        if (!directSearch.category || !directSearch.district) {
            setDirectError('Please select both job category and district');
            return;
        }

        setDirectLoading(true);
        setDirectError('');

        try {
            const result = await searchStudentsDirectly(directSearch.category, directSearch.district);
            setDirectResults(result.data || []);
        } catch (err) {
            setDirectResults([]);
            setDirectError(err.message || 'Failed to fetch direct search results');
        } finally {
            setDirectLoading(false);
        }
    };

    const getScoreColor = (score) => {
        if (score >= 80) return 'text-green-600';
        if (score >= 60) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getScoreBgColor = (score) => {
        if (score >= 80) return 'bg-green-100';
        if (score >= 60) return 'bg-yellow-100';
        return 'bg-red-100';
    };

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow dark:shadow-lg p-6 border dark:border-slate-700">
                <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Direct Student Search</h2>
                <p className="text-gray-600 dark:text-slate-400 mb-4">
                    Search students directly using job category and district.
                </p>

                {!isProActive ? (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                        <p className="text-amber-800 text-sm">
                            This feature is available only for Pro accounts. Upgrade to Pro to unlock unlimited direct search.
                        </p>
                        <button
                            onClick={() => navigate('/payments/pro-upgrade', {
                                state: {
                                    companyId: localStorage.getItem('companyId'),
                                    companyName: localStorage.getItem('companyName') || ''
                                }
                            })}
                            className="mt-3 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
                        >
                            Upgrade to Pro
                        </button>
                    </div>
                ) : (
                    <div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <select
                                value={directSearch.category}
                                onChange={(e) => setDirectSearch({ ...directSearch, category: e.target.value })}
                                className="px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                            >
                                <option value="">Select job category</option>
                                {JOB_CATEGORIES.map((category) => (
                                    <option key={category} value={category}>{category}</option>
                                ))}
                            </select>

                            <select
                                value={directSearch.district}
                                onChange={(e) => setDirectSearch({ ...directSearch, district: e.target.value })}
                                className="px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                            >
                                <option value="">Select district</option>
                                {DISTRICTS.map((district) => (
                                    <option key={district} value={district}>{district}</option>
                                ))}
                            </select>

                            <button
                                onClick={handleDirectSearch}
                                disabled={directLoading}
                                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-60"
                            >
                                {directLoading ? 'Searching...' : 'Find Students'}
                            </button>
                        </div>

                        {directError && (
                            <div className="mt-3 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
                                {directError}
                            </div>
                        )}

                        {directResults.length > 0 && (
                            <div className="mt-4 space-y-3">
                                {directResults.map((student) => (
                                    <div key={student.id} className="border border-gray-200 dark:border-slate-700 rounded-lg p-4 bg-gray-50 dark:bg-slate-700/40">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-semibold text-gray-900 dark:text-white">
                                                    {student.firstName} {student.lastName}
                                                </h4>
                                                <p className="text-sm text-gray-600 dark:text-slate-300">{student.email}</p>
                                                <p className="text-sm text-gray-600 dark:text-slate-300">{student.contactNumber}</p>
                                                <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">District: {student.district || 'N/A'}</p>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-lg font-bold text-emerald-600">{Math.round(student.matchScore)}%</div>
                                                <div className="text-xs text-gray-500">Match</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {!directLoading && !directError && directResults.length === 0 && (
                            <p className="mt-3 text-sm text-gray-500 dark:text-slate-400">No direct search results yet.</p>
                        )}
                    </div>
                )}
            </div>

            {/* Internship Selection */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow dark:shadow-lg p-6 border dark:border-slate-700">
                <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">AI-Powered Student Matching</h2>
                <p className="text-gray-600 dark:text-slate-400 mb-6">
                    Our intelligent matching algorithm analyzes student profiles against your internship requirements
                    to find the most suitable candidates. Select an internship to see the results.
                </p>
                
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                        Select Internship for Matching
                    </label>
                    <select
                        value={selectedInternship}
                        onChange={(e) => setSelectedInternship(e.target.value)}
                        className="w-full md:w-1/2 px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="">Choose an internship...</option>
                        {internships.filter(i => i.status === 'active').map(internship => (
                            <option key={internship._id} value={internship._id}>
                                {internship.title} - {internship.location} ({internship.skills?.length || 0} skills)
                            </option>
                        ))}
                    </select>
                    {internships.filter(i => i.status === 'active').length === 0 && (
                        <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-2">
                            No active internships found. Please post an internship first.
                        </p>
                    )}
                </div>
            </div>
            
            {/* Loading State */}
            {loading && (
                <div className="bg-white rounded-lg shadow p-12 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4"></div>
                    <p className="text-gray-600">Analyzing student profiles...</p>
                </div>
            )}
            
            {/* Error State */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                    {error}
                </div>
            )}
            
            {/* Recommendations */}
            {!loading && selectedInternship && recommendations.length > 0 && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-semibold">Top Matching Students</h3>
                        <span className="text-sm text-gray-500">{recommendations.length} candidates found</span>
                    </div>
                    
                    {recommendations.map((rec, index) => (
                        <div key={rec.student._id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-4">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl ${getScoreBgColor(rec.matchScore)}`}>
                                            <span className={getScoreColor(rec.matchScore)}>{rec.student.name.charAt(0)}</span>
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-semibold">{rec.student.name}</h4>
                                            <p className="text-gray-600">{rec.student.course} - {rec.student.university}</p>
                                            <p className="text-sm text-gray-500">Year {rec.student.year}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-4">
                                        <div className="mb-3">
                                            <div className="flex justify-between mb-1">
                                                <span className="text-sm font-medium text-gray-700">Match Score</span>
                                                <span className={`text-sm font-bold ${getScoreColor(rec.matchScore)}`}>
                                                    {Math.round(rec.matchScore)}%
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full transition-all duration-500"
                                                    style={{ width: `${rec.matchScore}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                            <div>
                                                <p className="text-sm font-semibold text-gray-700 mb-2">Skills:</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {rec.student.skills?.slice(0, 6).map((skill, i) => (
                                                        <span key={i} className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs">
                                                            {skill}
                                                        </span>
                                                    ))}
                                                    {rec.student.skills?.length > 6 && (
                                                        <span className="px-2 py-1 text-gray-500 text-xs">
                                                            +{rec.student.skills.length - 6} more
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-gray-700 mb-2">Experience:</p>
                                                <p className="text-sm text-gray-600">
                                                    {rec.student.experience?.length || 0} years of experience
                                                </p>
                                                {rec.student.experience?.length > 0 && (
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {rec.student.experience[0]?.title} at {rec.student.experience[0]?.company}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="ml-4 text-center">
                                    <div className={`text-3xl font-bold ${getScoreColor(rec.matchScore)}`}>
                                        {Math.round(rec.matchScore)}%
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">Match</div>
                                    <div className="mt-2 text-xs text-gray-400">
                                        Rank #{index + 1}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="mt-4 pt-4 border-t border-gray-200 flex space-x-3">
                                <button
                                    onClick={() => setSelectedStudent(rec.student)}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                                >
                                    View Detailed Analysis
                                </button>
                                <button
                                    onClick={() => window.open(`/student/${rec.student._id}`, '_blank')}
                                    className="px-4 py-2 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
                                >
                                    View Full Profile
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            
            {/* No Results State */}
            {!loading && selectedInternship && recommendations.length === 0 && !error && (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg">
                    <p className="font-semibold">No matching students found</p>
                    <p className="text-sm mt-1">
                        Try adjusting your internship requirements or skills. You can also edit your internship 
                        to make it more appealing to potential candidates.
                    </p>
                </div>
            )}
            
            {/* Match Summary Modal */}
            {selectedStudent && (
                <C_MatchSummary
                    student={selectedStudent}
                    internshipId={selectedInternship}
                    onClose={() => setSelectedStudent(null)}
                />
            )}
        </div>
    );
};

export default C_StudentRecommendations;