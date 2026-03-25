import React, { useState, useEffect } from 'react';
import { getMatchSummary } from './C_CompanyUtils';

const C_MatchSummary = ({ student, internshipId, onClose }) => {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchMatchSummary();
    }, []);

    const fetchMatchSummary = async () => {
        try {
            const result = await getMatchSummary(student._id, internshipId);
            setSummary(result.data);
        } catch (err) {
            setError(err.message || 'Failed to fetch match summary');
        } finally {
            setLoading(false);
        }
    };

    const getScoreColor = (score) => {
        if (score >= 80) return 'text-green-600';
        if (score >= 60) return 'text-yellow-600';
        return 'text-red-600';
    };

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4">
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4"></div>
                        <p>Analyzing match details...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4">
                    <div className="text-center text-red-600">
                        <p>{error}</p>
                        <button onClick={onClose} className="mt-4 px-4 py-2 bg-gray-300 rounded-lg">Close</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-3xl w-full mx-4 my-8 max-h-screen overflow-y-auto border dark:border-slate-700 dark:shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Match Analysis</h2>
                    <button onClick={onClose} className="text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300 text-2xl">&times;</button>
                </div>
                
                {/* Student Info */}
                <div className="bg-gradient-to-r from-indigo-50 dark:from-slate-700 to-purple-50 dark:to-slate-700 rounded-lg p-4 mb-6 border dark:border-slate-600">
                    <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                            {student.name.charAt(0)}
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{student.name}</h3>
                            <p className="text-gray-600 dark:text-slate-400">{student.course} - {student.university}</p>
                            <p className="text-sm text-gray-500 dark:text-slate-500">Year {student.year}</p>
                        </div>
                    </div>
                </div>
                
                {/* Match Score */}
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-lg font-semibold text-gray-900 dark:text-white">Overall Match Score</span>
                        <span className={`text-3xl font-bold ${getScoreColor(summary.matchScore)}`}>
                            {Math.round(summary.matchScore)}%
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-3">
                        <div
                            className="bg-gradient-to-r from-indigo-600 to-purple-600 h-3 rounded-full transition-all duration-500"
                            style={{ width: `${summary.matchScore}%` }}
                        ></div>
                    </div>
                </div>
                
                {/* Skills Match */}
                <div className="mb-6">
                    <h4 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Skills Analysis</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-4 border dark:border-green-800">
                            <p className="font-semibold text-green-700 dark:text-green-300 mb-2">Matched Skills ({summary.skillMatch.matchedSkills.length})</p>
                            <div className="flex flex-wrap gap-2">
                                {summary.skillMatch.matchedSkills.map((skill, idx) => (
                                    <span key={idx} className="px-2 py-1 bg-green-200 dark:bg-green-800 text-green-700 dark:text-green-200 rounded-full text-sm">
                                        ✓ {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div className="bg-red-50 dark:bg-red-900/30 rounded-lg p-4 border dark:border-red-800">
                            <p className="font-semibold text-red-700 dark:text-red-300 mb-2">Missing Skills ({summary.skillMatch.missingSkills.length})</p>
                            <div className="flex flex-wrap gap-2">
                                {summary.skillMatch.missingSkills.map((skill, idx) => (
                                    <span key={idx} className="px-2 py-1 bg-red-200 dark:bg-red-800 text-red-700 dark:text-red-200 rounded-full text-sm">
                                        ✗ {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Education & Experience */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <h4 className="text-lg font-semibold mb-3">Education</h4>
                        <div className="bg-gray-50 rounded-lg p-4">
                            <p><span className="font-medium">Course:</span> {summary.educationMatch.studentCourse}</p>
                            <p><span className="font-medium">University:</span> {summary.educationMatch.studentUniversity}</p>
                            <p><span className="font-medium">Match Status:</span> 
                                <span className="ml-2 text-green-600">{summary.educationMatch.requiredCourse}</span>
                            </p>
                        </div>
                    </div>
                    <div>
                        <h4 className="text-lg font-semibold mb-3">Experience</h4>
                        <div className="bg-gray-50 rounded-lg p-4">
                            <p><span className="font-medium">Years of Experience:</span> {summary.experienceLevel}</p>
                            {student.experience?.length > 0 && (
                                <div className="mt-2">
                                    <p className="font-medium">Recent Experience:</p>
                                    {student.experience.slice(0, 2).map((exp, idx) => (
                                        <div key={idx} className="text-sm mt-1">
                                            <p>{exp.title} at {exp.company}</p>
                                            <p className="text-gray-500">{exp.duration}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                
                {/* Recommendations */}
                {summary.recommendations && summary.recommendations.length > 0 && (
                    <div className="mb-6">
                        <h4 className="text-lg font-semibold mb-3">Recommendations for Improvement</h4>
                        <div className="bg-blue-50 rounded-lg p-4 space-y-2">
                            {summary.recommendations.map((rec, idx) => (
                                <div key={idx} className="flex items-start space-x-2">
                                    <span className="text-blue-600 mt-1">💡</span>
                                    <div>
                                        <p className="font-medium text-blue-800">{rec.area}</p>
                                        <p className="text-blue-700 text-sm">{rec.message}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                {/* Action Buttons */}
                <div className="flex space-x-3 pt-4 border-t">
                    <button
                        onClick={() => window.open(`/student/${student._id}`, '_blank')}
                        className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                        View Full Profile
                    </button>
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default C_MatchSummary;