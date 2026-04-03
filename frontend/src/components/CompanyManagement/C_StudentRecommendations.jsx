import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCompanyProAccount, getStudentRecommendations, searchStudentsDirectly } from './C_CompanyUtils';
import MatchSummary from './C_MatchSummary';
import { resolveUploadUrl } from '../StudentManagement/uploadUrl';

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

const SHORTLIST_STORAGE_KEY = 'companyShortlistedStudents';

const getFileExtension = (value) => {
    if (!value || typeof value !== 'string') return '';
    const cleanValue = value.split('?')[0].split('#')[0];
    const parts = cleanValue.split('.');
    return parts.length > 1 ? parts.pop().toLowerCase() : '';
};

const isImageFile = (value) => ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(getFileExtension(value));

const isPdfFile = (value) => getFileExtension(value) === 'pdf';

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
    const [shortlistedStudents, setShortlistedStudents] = useState([]);

    const isProActive = Boolean(proStatus?.isProActive);

    useEffect(() => {
        try {
            const savedShortlist = JSON.parse(localStorage.getItem(SHORTLIST_STORAGE_KEY) || '[]');
            setShortlistedStudents(Array.isArray(savedShortlist) ? savedShortlist : []);
        } catch {
            setShortlistedStudents([]);
        }
    }, []);

    useEffect(() => {
        localStorage.setItem(SHORTLIST_STORAGE_KEY, JSON.stringify(shortlistedStudents));
    }, [shortlistedStudents]);

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

    const fetchRecommendations = useCallback(async () => {
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
    }, [selectedInternship]);

    useEffect(() => {
        if (selectedInternship) {
            fetchRecommendations();
        }
    }, [selectedInternship, fetchRecommendations]);

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

    const toggleShortlist = (student) => {
        setShortlistedStudents((current) => {
            const exists = current.some((item) => item._id === student._id);
            if (exists) {
                return current.filter((item) => item._id !== student._id);
            }

            return [...current, student];
        });
    };

    const isShortlisted = (studentId) => shortlistedStudents.some((student) => student._id === studentId);

    const removeFromShortlist = (studentId) => {
        setShortlistedStudents((current) => current.filter((student) => student._id !== studentId));
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

    const getRecommendationReasons = (student) => {
        const apiReasons = student.recommendationDetails?.reasons;
        if (Array.isArray(apiReasons) && apiReasons.length > 0) {
            return apiReasons;
        }

        const reasons = [];
        if (student.district) reasons.push(`District: ${student.district}`);
        if (student.province) reasons.push(`Province: ${student.province}`);
        if (student.preferredField) reasons.push(`Preferred field: ${student.preferredField}`);

        const topSkills = [
            ...(student.frontendSkills || []),
            ...(student.backendSkills || []),
            ...(student.databaseSkills || [])
        ].slice(0, 4);

        if (topSkills.length > 0) {
            reasons.push(`Skills: ${topSkills.join(', ')}`);
        }

        return reasons.length > 0 ? reasons : ['Profile available for review'];
    };

    const getCvDisplayType = (cvValue) => {
        if (!cvValue) return 'none';
        if (isImageFile(cvValue)) return 'image';
        if (isPdfFile(cvValue)) return 'pdf';
        return 'file';
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
                            <div className="mt-6 grid gap-4 xl:grid-cols-2">
                                {directResults.map((student) => {
                                    const shortlisted = isShortlisted(student._id);
                                    const cvType = getCvDisplayType(student.cv);
                                    const cvUrl = student.cv ? resolveUploadUrl(student.cv) : '';
                                    const reasons = getRecommendationReasons(student);

                                    return (
                                        <div key={student._id} className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-slate-700 dark:bg-slate-800/80">
                                            <div className="flex flex-col gap-5 p-5 md:flex-row md:items-start">
                                                <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-900">
                                                    {student.profileImage ? (
                                                        <img
                                                            src={resolveUploadUrl(student.profileImage)}
                                                            alt={`${student.firstName} ${student.lastName}`}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        <span className="text-xl font-bold text-slate-500 dark:text-slate-400">
                                                            {student.firstName?.[0] || 'S'}
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                                        <div>
                                                            <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                                                                {student.firstName} {student.lastName}
                                                            </h4>
                                                            <p className="text-sm text-gray-600 dark:text-slate-300">{student.email}</p>
                                                            <p className="text-sm text-gray-600 dark:text-slate-300">{student.contactNumber || 'No contact number'}</p>
                                                        </div>
                                                        <div className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                                                            {Math.round(student.matchScore || 0)}% Match
                                                        </div>
                                                    </div>

                                                    <div className="mt-4 grid gap-2 text-sm text-slate-700 dark:text-slate-200 sm:grid-cols-2">
                                                        <p><b>Province:</b> {student.province || 'N/A'}</p>
                                                        <p><b>District:</b> {student.district || 'N/A'}</p>
                                                        <p><b>Level:</b> {student.eduLevel || 'N/A'}</p>
                                                        <p><b>Preferred:</b> {student.preferredField || 'N/A'}</p>
                                                    </div>

                                                    <div className="mt-4 rounded-2xl border border-indigo-100 bg-indigo-50/80 p-4 dark:border-cyan-400/10 dark:bg-cyan-400/5">
                                                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-700 dark:text-cyan-300">Recommendation Details</p>
                                                        <ul className="mt-2 space-y-1 text-sm text-slate-700 dark:text-slate-200">
                                                            {reasons.map((reason, index) => (
                                                                <li key={index}>• {reason}</li>
                                                            ))}
                                                        </ul>
                                                    </div>

                                                    <div className="mt-4 flex flex-wrap gap-2">
                                                        {(student.frontendSkills || []).slice(0, 3).map((skill) => (
                                                            <span key={`f-${skill}`} className="rounded-full bg-indigo-100 px-2 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">
                                                                {skill}
                                                            </span>
                                                        ))}
                                                        {(student.backendSkills || []).slice(0, 3).map((skill) => (
                                                            <span key={`b-${skill}`} className="rounded-full bg-violet-100 px-2 py-1 text-xs font-medium text-violet-700 dark:bg-violet-500/10 dark:text-violet-300">
                                                                {skill}
                                                            </span>
                                                        ))}
                                                        {(student.databaseSkills || []).slice(0, 3).map((skill) => (
                                                            <span key={`d-${skill}`} className="rounded-full bg-cyan-100 px-2 py-1 text-xs font-medium text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-300">
                                                                {skill}
                                                            </span>
                                                        ))}
                                                    </div>

                                                    {student.cv && (
                                                        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/70">
                                                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-600 dark:text-slate-400">Uploaded CV</p>
                                                            <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-950">
                                                                {cvType === 'image' ? (
                                                                    <img src={cvUrl} alt="Student CV" className="max-h-56 w-full object-contain" />
                                                                ) : cvType === 'pdf' ? (
                                                                    <iframe title="Student CV preview" src={cvUrl} className="h-56 w-full" />
                                                                ) : (
                                                                    <div className="flex h-56 flex-col items-center justify-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                                                                        <p>CV file uploaded</p>
                                                                        <p className="break-all px-4 text-center">{student.cv}</p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="mt-3 flex flex-wrap gap-3">
                                                                <a
                                                                    href={cvUrl}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-slate-200 dark:text-slate-950 dark:hover:bg-white"
                                                                >
                                                                    Open CV
                                                                </a>
                                                                <a
                                                                    href={cvUrl}
                                                                    download
                                                                    className="rounded-xl border border-cyan-500 px-4 py-2 text-sm font-semibold text-cyan-700 transition hover:bg-cyan-50 dark:border-cyan-400 dark:text-cyan-300 dark:hover:bg-cyan-400/10"
                                                                >
                                                                    Download CV
                                                                </a>
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div className="mt-5 flex flex-wrap gap-3">
                                                        <button
                                                            onClick={() => toggleShortlist(student)}
                                                            className={`rounded-xl px-4 py-2 text-sm font-semibold text-white transition hover:scale-[1.01] ${shortlisted ? 'bg-slate-700 hover:bg-slate-800 dark:bg-slate-200 dark:text-slate-950' : 'bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700'}`}
                                                        >
                                                            {shortlisted ? 'Remove from Shortlist' : 'Shortlist Student'}
                                                        </button>
                                                        <button
                                                            onClick={() => window.open(`/company/student-profile/${student._id}`, '_blank')}
                                                            className="rounded-xl border border-indigo-500 px-4 py-2 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-50 dark:border-cyan-400 dark:text-cyan-300 dark:hover:bg-cyan-400/10"
                                                        >
                                                            View Profile
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {!directLoading && !directError && directResults.length === 0 && (
                            <p className="mt-3 text-sm text-gray-500 dark:text-slate-400">No direct search results yet.</p>
                        )}
                    </div>
                )}
            </div>

            {shortlistedStudents.length > 0 && (
                <div className="rounded-2xl border border-cyan-200 bg-cyan-50/90 p-6 shadow-sm dark:border-cyan-800/40 dark:bg-slate-800/90">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h3 className="text-xl font-bold text-cyan-900 dark:text-cyan-300">Shortlisted Students</h3>
                            <p className="text-sm text-cyan-800 dark:text-cyan-400">
                                Students saved from direct search are kept here for quick review.
                            </p>
                        </div>
                        <button
                            onClick={() => setShortlistedStudents([])}
                            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 dark:bg-slate-200 dark:text-slate-950 dark:hover:bg-white"
                        >
                            Clear Shortlist
                        </button>
                    </div>

                    <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {shortlistedStudents.map((student) => (
                            <div key={student._id} className="rounded-2xl border border-white bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/80">
                                <div className="flex items-center gap-3">
                                    <img
                                        src={student.profileImage ? resolveUploadUrl(student.profileImage) : '/placeholder-profile.png'}
                                        alt={`${student.firstName} ${student.lastName}`}
                                        className="h-12 w-12 rounded-xl object-cover"
                                    />
                                    <div className="min-w-0 flex-1">
                                        <h4 className="truncate font-semibold text-slate-900 dark:text-white">
                                            {student.firstName} {student.lastName}
                                        </h4>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">{student.preferredField || 'No preferred field'}</p>
                                    </div>
                                </div>

                                <div className="mt-3 space-y-1 text-sm text-slate-700 dark:text-slate-300">
                                    <p><b>District:</b> {student.district || 'N/A'}</p>
                                    <p><b>Level:</b> {student.eduLevel || 'N/A'}</p>
                                    <p><b>CV:</b> {student.cv ? getCvDisplayType(student.cv).toUpperCase() : 'Not uploaded'}</p>
                                </div>

                                <div className="mt-4 flex gap-3">
                                    <button
                                        onClick={() => removeFromShortlist(student._id)}
                                        className="rounded-lg border border-red-300 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-950/30"
                                    >
                                        Remove
                                    </button>
                                    <button
                                        onClick={() => window.open(`/company/student-profile/${student._id}`, '_blank')}
                                        className="rounded-lg border border-cyan-300 px-3 py-2 text-xs font-semibold text-cyan-700 hover:bg-cyan-50 dark:border-cyan-700 dark:text-cyan-300 dark:hover:bg-cyan-950/30"
                                    >
                                        View Profile
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

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
                <MatchSummary
                    student={selectedStudent}
                    internshipId={selectedInternship}
                    onClose={() => setSelectedStudent(null)}
                />
            )}
        </div>
    );
};

export default C_StudentRecommendations;
