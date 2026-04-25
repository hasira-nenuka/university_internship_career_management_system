import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCompanyProAccount, getStudentRecommendations, searchStudentsDirectly, getInterviewSchedules, saveInterviewSchedule, deleteInterviewSchedule } from './C_CompanyUtils';
import MatchSummary from './C_MatchSummary';
import C_InterviewShedule from './C_interviewShedule';
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
const SHORTLIST_STATUS_STORAGE_KEY = 'companyShortlistedStudentStatuses';
const INTERVIEW_SCHEDULE_STORAGE_KEY = 'companyScheduledInterviews';

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
    const [shortlistStatuses, setShortlistStatuses] = useState({});
    const [scheduledInterviews, setScheduledInterviews] = useState({});
    const [interviewStudent, setInterviewStudent] = useState(null);

    const normalizeScheduleMap = useCallback((items = []) => {
        return items.reduce((accumulator, item) => {
            const key = item.referenceKey || item.applicationId || item._id;
            if (key) {
                accumulator[key] = item;
            }
            return accumulator;
        }, {});
    }, []);

    const loadScheduledInterviews = useCallback(async () => {
        try {
            const result = await getInterviewSchedules();
            const mappedSchedules = normalizeScheduleMap(result.data || []);
            setScheduledInterviews(mappedSchedules);
            localStorage.setItem(INTERVIEW_SCHEDULE_STORAGE_KEY, JSON.stringify(mappedSchedules));
        } catch {
            try {
                const savedSchedules = JSON.parse(localStorage.getItem(INTERVIEW_SCHEDULE_STORAGE_KEY) || '{}');
                setScheduledInterviews(savedSchedules && typeof savedSchedules === 'object' ? savedSchedules : {});
            } catch {
                setScheduledInterviews({});
            }
        }
    }, [normalizeScheduleMap]);

    const isProActive = Boolean(proStatus?.isProActive);

    useEffect(() => {
        try {
            const savedShortlist = JSON.parse(localStorage.getItem(SHORTLIST_STORAGE_KEY) || '[]');
            setShortlistedStudents(Array.isArray(savedShortlist) ? savedShortlist : []);
        } catch {
            setShortlistedStudents([]);
        }

        try {
            const savedStatuses = JSON.parse(localStorage.getItem(SHORTLIST_STATUS_STORAGE_KEY) || '{}');
            setShortlistStatuses(savedStatuses && typeof savedStatuses === 'object' ? savedStatuses : {});
        } catch {
            setShortlistStatuses({});
        }

        loadScheduledInterviews();
    }, [loadScheduledInterviews]);

    useEffect(() => {
        localStorage.setItem(SHORTLIST_STORAGE_KEY, JSON.stringify(shortlistedStudents));
    }, [shortlistedStudents]);

    useEffect(() => {
        localStorage.setItem(SHORTLIST_STATUS_STORAGE_KEY, JSON.stringify(shortlistStatuses));
    }, [shortlistStatuses]);

    useEffect(() => {
        localStorage.setItem(INTERVIEW_SCHEDULE_STORAGE_KEY, JSON.stringify(scheduledInterviews));
    }, [scheduledInterviews]);

    useEffect(() => {
        window.addEventListener('focus', loadScheduledInterviews);
        window.addEventListener('companyInterviewSchedulesUpdated', loadScheduledInterviews);
        return () => {
            window.removeEventListener('focus', loadScheduledInterviews);
            window.removeEventListener('companyInterviewSchedulesUpdated', loadScheduledInterviews);
        };
    }, [loadScheduledInterviews]);

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

        setShortlistStatuses((current) => {
            if (current[student._id]) {
                const next = { ...current };
                delete next[student._id];
                return next;
            }
            return { ...current, [student._id]: 'shortlisted' };
        });
    };

    const isShortlisted = (studentId) => shortlistedStudents.some((student) => student._id === studentId);

    const removeFromShortlist = (studentId) => {
        setShortlistedStudents((current) => current.filter((student) => student._id !== studentId));
        setShortlistStatuses((current) => {
            const next = { ...current };
            delete next[studentId];
            return next;
        });
    };

    const getShortlistStatus = (studentId) => shortlistStatuses[studentId] || 'shortlisted';

    const setStudentStatus = (studentId, status) => {
        setShortlistStatuses((current) => ({ ...current, [studentId]: status }));
    };

    const getInterviewRecordKey = (studentId) => `${studentId}-${selectedInternship || 'general'}`;

    const getScheduledInterviewForStudent = (studentId) => {
        const exactKey = getInterviewRecordKey(studentId);
        if (scheduledInterviews[exactKey]) {
            return { key: exactKey, schedule: scheduledInterviews[exactKey] };
        }

        const fallbackEntry = Object.entries(scheduledInterviews).find(([, schedule]) => schedule?.studentId === studentId);
        if (!fallbackEntry) return null;

        return { key: fallbackEntry[0], schedule: fallbackEntry[1] };
    };

    const openInterviewScheduler = (student) => {
        if (!internships || internships.length === 0) {
            const message = 'Please create an internship before scheduling interviews.';
            setDirectError(message);
            setError(message);
            alert(message);
            return;
        }

        setInterviewStudent(student);
    };

    const handleInterviewScheduleSave = (scheduleData) => {
        if (!interviewStudent) return;

        const referenceKey = scheduleData.referenceKey || getInterviewRecordKey(interviewStudent._id);
        const internshipId = scheduleData.internshipId || selectedInternship || '';
        const interviewDateTime = scheduleData.interviewDateTime || '';
        const venueOrLink = String(scheduleData.venueOrLink || '').trim();

        if (!referenceKey || !internshipId || !interviewDateTime || !venueOrLink) {
            const message = 'Please complete internship, date/time, and venue/link before saving.';
            setDirectError(message);
            setError(message);
            alert(message);
            return;
        }

        const persistSchedule = async () => {
            try {
                const response = await saveInterviewSchedule({
                    ...scheduleData,
                    referenceKey,
                    internshipId,
                    interviewDateTime,
                    venueOrLink,
                    source: 'direct'
                });

                const savedSchedule = response.data;
                const key = savedSchedule.referenceKey || scheduleData.referenceKey || getInterviewRecordKey(interviewStudent._id);

                setScheduledInterviews((current) => {
                    const updated = {
                        ...current,
                        [key]: savedSchedule
                    };
                    localStorage.setItem(INTERVIEW_SCHEDULE_STORAGE_KEY, JSON.stringify(updated));
                    return updated;
                });

                window.dispatchEvent(new Event('companyInterviewSchedulesUpdated'));
                setInterviewStudent(null);
                alert('Interview scheduled successfully.');
            } catch (err) {
                const message = err?.message || 'Failed to save interview schedule';
                setDirectError(message);
                setError(message);
                alert(message);
            }
        };

        persistSchedule();
    };

    const cancelInterviewSchedule = (recordKey) => {
        const confirmed = window.confirm('Are you sure you want to cancel this interview schedule?');
        if (!confirmed) return;

        const existingSchedule = scheduledInterviews[recordKey];

        const performCancel = async () => {
            try {
                if (existingSchedule?._id) {
                    await deleteInterviewSchedule(existingSchedule._id);
                }

                setScheduledInterviews((current) => {
                    const updated = { ...current };
                    delete updated[recordKey];
                    localStorage.setItem(INTERVIEW_SCHEDULE_STORAGE_KEY, JSON.stringify(updated));
                    return updated;
                });

                window.dispatchEvent(new Event('companyInterviewSchedulesUpdated'));
            } catch (err) {
                const message = err?.message || 'Failed to cancel interview schedule';
                setDirectError(message);
                setError(message);
                alert(message);
            }
        };

        performCancel();
    };

    const formatInterviewDate = (schedule) => {
        if (!schedule?.interviewDateTime) return '';
        return new Date(schedule.interviewDateTime).toLocaleString();
    };

    const getStatusBadgeClasses = (status) => {
        if (status === 'hired') return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300';
        if (status === 'rejected') return 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300';
        return 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300';
    };

    const getStatusLabel = (status) => {
        if (status === 'hired') return 'Hired';
        if (status === 'rejected') return 'Rejected';
        return 'Shortlisted';
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
                    <div className="rounded-lg border border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50 p-4">
                        <p className="text-indigo-900 text-sm leading-6">
                            This feature is available only for Pro accounts. Upgrade to Pro to unlock unlimited direct search.
                        </p>
                        <button
                            onClick={() => navigate('/payments/pro-upgrade', {
                                state: {
                                    companyId: localStorage.getItem('companyId'),
                                    companyName: localStorage.getItem('companyName') || ''
                                }
                            })}
                            className="mt-3 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 shadow-md"
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
                                    const scheduledInterview = getScheduledInterviewForStudent(student._id);

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
                                                        {shortlisted && (
                                                            <>
                                                                <button
                                                                    onClick={() => {
                                                                        setStudentStatus(student._id, 'hired');
                                                                        openInterviewScheduler(student);
                                                                    }}
                                                                    className="rounded-xl px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700"
                                                                >
                                                                    Hired
                                                                </button>
                                                                <button
                                                                    onClick={() => setStudentStatus(student._id, 'rejected')}
                                                                    className="rounded-xl px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700"
                                                                >
                                                                    Reject
                                                                </button>
                                                                {getShortlistStatus(student._id) === 'hired' && scheduledInterview && (
                                                                    <>
                                                                        <button
                                                                            onClick={() => openInterviewScheduler(student)}
                                                                            className="rounded-xl px-4 py-2 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700"
                                                                        >
                                                                            Reschedule Interview
                                                                        </button>
                                                                        <button
                                                                            onClick={() => cancelInterviewSchedule(scheduledInterview.key)}
                                                                            className="rounded-xl border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-950/30"
                                                                        >
                                                                            Cancel Interview
                                                                        </button>
                                                                    </>
                                                                )}
                                                            </>
                                                        )}
                                                        <button
                                                            onClick={() => window.open(`/company/student-profile/${student._id}`, '_blank')}
                                                            className="rounded-xl border border-indigo-500 px-4 py-2 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-50 dark:border-cyan-400 dark:text-cyan-300 dark:hover:bg-cyan-400/10"
                                                        >
                                                            View Profile
                                                        </button>
                                                    </div>

                                                    {scheduledInterview && (
                                                        <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700 dark:border-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300">
                                                            <span className="inline-flex rounded-full bg-emerald-100 px-2 py-0.5 font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300 mr-2">
                                                                Scheduled
                                                            </span>
                                                            {formatInterviewDate(scheduledInterview.schedule)}
                                                        </div>
                                                    )}
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
                        {shortlistedStudents.map((student) => {
                            const scheduledInterview = getScheduledInterviewForStudent(student._id);

                            return (
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
                                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{student.email || 'No email'}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">{student.contactNumber || 'No phone number'}</p>
                                    </div>
                                </div>

                                <div className="mt-3 space-y-1 text-sm text-slate-700 dark:text-slate-300">
                                    <p><b>District:</b> {student.district || 'N/A'}</p>
                                    <p><b>Level:</b> {student.eduLevel || 'N/A'}</p>
                                    <p><b>CV:</b> {student.cv ? getCvDisplayType(student.cv).toUpperCase() : 'Not uploaded'}</p>
                                    <p>
                                        <b>Status:</b>{' '}
                                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${getStatusBadgeClasses(getShortlistStatus(student._id))}`}>
                                            {getStatusLabel(getShortlistStatus(student._id))}
                                        </span>
                                    </p>
                                    {scheduledInterview && (
                                        <p>
                                            <b>Interview:</b>{' '}
                                            <span className="inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                                                Scheduled
                                            </span>
                                            <span className="ml-2 text-xs">{formatInterviewDate(scheduledInterview.schedule)}</span>
                                        </p>
                                    )}
                                </div>

                                <div className="mt-4 flex flex-wrap gap-3">
                                    <button
                                        onClick={() => {
                                            setStudentStatus(student._id, 'hired');
                                            openInterviewScheduler(student);
                                        }}
                                        className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
                                    >
                                        Hired
                                    </button>
                                    <button
                                        onClick={() => setStudentStatus(student._id, 'rejected')}
                                        className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700"
                                    >
                                        Reject
                                    </button>
                                    {getShortlistStatus(student._id) === 'hired' && (
                                        <button
                                            onClick={() => openInterviewScheduler(student)}
                                            className="rounded-lg bg-teal-600 px-3 py-2 text-xs font-semibold text-white hover:bg-teal-700"
                                        >
                                            Reschedule Interview
                                        </button>
                                    )}
                                    {scheduledInterview && (
                                        <button
                                            onClick={() => cancelInterviewSchedule(scheduledInterview.key)}
                                            className="rounded-lg border border-red-300 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-950/30"
                                        >
                                            Cancel Interview
                                        </button>
                                    )}
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
                        )})}
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

            {interviewStudent && (
                <C_InterviewShedule
                    application={{
                        _id: getScheduledInterviewForStudent(interviewStudent._id)?.schedule?.referenceKey || getInterviewRecordKey(interviewStudent._id),
                        internship: selectedInternship || getScheduledInterviewForStudent(interviewStudent._id)?.schedule?.internshipId || '',
                        student: {
                            _id: interviewStudent._id,
                            name: `${interviewStudent.firstName || ''} ${interviewStudent.lastName || ''}`.trim() || interviewStudent.name || 'Student',
                            email: interviewStudent.email,
                            contactNumber: interviewStudent.contactNumber,
                            university: interviewStudent.university,
                            degree: interviewStudent.degree,
                            preferredField: interviewStudent.preferredField,
                            district: interviewStudent.district,
                            province: interviewStudent.province,
                            frontendSkills: interviewStudent.frontendSkills,
                            backendSkills: interviewStudent.backendSkills,
                            databaseSkills: interviewStudent.databaseSkills,
                            bio: interviewStudent.bio
                        },
                        status: 'accepted',
                        createdAt: new Date().toISOString(),
                        coverLetter: 'Shortlisted from Find Students page.'
                    }}
                    existingSchedule={getScheduledInterviewForStudent(interviewStudent._id)?.schedule || null}
                    internships={internships.filter((item) => item.status === 'active')}
                    defaultSelectedInternship={selectedInternship}
                    onClose={() => setInterviewStudent(null)}
                    onSchedule={handleInterviewScheduleSave}
                />
            )}
        </div>
    );
};

export default C_StudentRecommendations;
