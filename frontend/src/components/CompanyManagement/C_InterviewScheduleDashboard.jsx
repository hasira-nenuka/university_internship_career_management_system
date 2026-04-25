import React, { useMemo, useState } from 'react';
import { jsPDF } from 'jspdf';

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const C_InterviewScheduleDashboard = ({ interviews = {}, internships = [] }) => {
    const [currentMonth, setCurrentMonth] = useState(() => {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), 1);
    });
    const [selectedDateKey, setSelectedDateKey] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    });

    const interviewList = useMemo(() => {
        const sourceList = Array.isArray(interviews) ? interviews : Object.values(interviews || {});

        return sourceList
            .filter((item) => item?.interviewDateTime)
            .map((item) => {
                const interviewDate = new Date(item.interviewDateTime);
                return {
                    ...item,
                    interviewDate,
                    dateKey: `${interviewDate.getFullYear()}-${String(interviewDate.getMonth() + 1).padStart(2, '0')}-${String(interviewDate.getDate()).padStart(2, '0')}`,
                    internshipTitle: (item.internshipId && typeof item.internshipId === 'object' ? item.internshipId.title : internships.find((internship) => internship._id === item.internshipId)?.title) || 'Internship'
                };
            })
            .sort((a, b) => a.interviewDate.getTime() - b.interviewDate.getTime());
    }, [interviews, internships]);

    const interviewsByDate = useMemo(() => {
        return interviewList.reduce((acc, item) => {
            if (!acc[item.dateKey]) acc[item.dateKey] = [];
            acc[item.dateKey].push(item);
            return acc;
        }, {});
    }, [interviewList]);

    const monthGrid = useMemo(() => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const totalDays = new Date(year, month + 1, 0).getDate();
        const cells = [];

        for (let i = 0; i < firstDay; i += 1) {
            cells.push({ day: null, dateKey: `blank-${i}` });
        }

        for (let day = 1; day <= totalDays; day += 1) {
            const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            cells.push({ day, dateKey });
        }

        while (cells.length % 7 !== 0) {
            cells.push({ day: null, dateKey: `trailing-${cells.length}` });
        }

        return cells;
    }, [currentMonth]);

    const selectedDayInterviews = interviewsByDate[selectedDateKey] || [];

    const handleMonthChange = (offset) => {
        setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
    };

    const formatType = (type) => {
        if (!type) return 'Interview';
        return `${type.charAt(0).toUpperCase()}${type.slice(1)}`;
    };

    const formatStudentResponse = (status) => {
        switch (status) {
            case 'accepted':
                return 'Accepted';
            case 'declined':
                return 'Declined';
            case 'reschedule_requested':
                return 'Reschedule Requested';
            default:
                return 'Awaiting Response';
        }
    };

    const downloadInterviewSchedulePdf = () => {
        const doc = new jsPDF({ unit: 'pt', format: 'a4' });
        const margin = 40;
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const lineHeight = 16;
        let y = margin;

        const ensureSpace = (required = lineHeight) => {
            if (y + required > pageHeight - margin) {
                doc.addPage();
                y = margin;
            }
        };

        const addWrappedLine = (text, fontStyle = 'normal', fontSize = 10) => {
            doc.setFont('helvetica', fontStyle);
            doc.setFontSize(fontSize);
            const lines = doc.splitTextToSize(text, pageWidth - margin * 2);
            ensureSpace(lines.length * lineHeight + 4);
            doc.text(lines, margin, y);
            y += lines.length * lineHeight;
        };

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.text('Interview Schedule Details Report', margin, y);
        y += 24;

        addWrappedLine(`Generated: ${new Date().toLocaleString()}`);
        addWrappedLine(`Total Interviews: ${interviewList.length}`);
        y += 8;

        if (interviewList.length === 0) {
            addWrappedLine('No interviews scheduled yet.');
        } else {
            interviewList.forEach((interview, index) => {
                ensureSpace(130);
                doc.setDrawColor(210, 214, 220);
                doc.line(margin, y, pageWidth - margin, y);
                y += 14;

                addWrappedLine(`Interview ${index + 1}`, 'bold', 12);
                addWrappedLine(`Student: ${interview.studentName || 'N/A'}`);
                addWrappedLine(`Email: ${interview.studentEmail || 'N/A'}`);
                addWrappedLine(`Phone: ${interview.studentPhone || 'N/A'}`);
                addWrappedLine(`Internship: ${interview.internshipTitle || 'Internship'}`);
                addWrappedLine(`Date: ${interview.interviewDate.toLocaleDateString()}`);
                addWrappedLine(`Time: ${interview.interviewDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
                addWrappedLine(`Type: ${formatType(interview.interviewType)}`);
                addWrappedLine(`Duration: ${interview.duration || 'N/A'}`);
                addWrappedLine(`Location/Link: ${interview.venueOrLink || 'N/A'}`);
                addWrappedLine(`Student Response: ${formatStudentResponse(interview.studentResponseStatus)}`);
                addWrappedLine(`Student Reply Note: ${interview.studentResponseMessage || 'N/A'}`);
                addWrappedLine(`Notes: ${interview.notes || 'N/A'}`);
                y += 6;
            });
        }

        const fileDate = new Date().toISOString().slice(0, 10);
        doc.save(`interview-schedule-${fileDate}.pdf`);
    };

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow dark:shadow-lg p-6 border dark:border-slate-700">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Interview Schedule</h2>
                        <p className="text-gray-600 dark:text-slate-400 mt-1">
                            Track all scheduled interviews in one calendar view.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            onClick={downloadInterviewSchedulePdf}
                            className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                        >
                            Download Interview Schedule
                        </button>
                        <button
                            onClick={() => handleMonthChange(-1)}
                            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700"
                        >
                            Previous
                        </button>
                        <div className="px-4 py-2 rounded-lg bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300 font-semibold">
                            {currentMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                        </div>
                        <button
                            onClick={() => handleMonthChange(1)}
                            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-lg shadow dark:shadow-lg p-4 border dark:border-slate-700">
                    <div className="grid grid-cols-7 gap-2 mb-2">
                        {dayNames.map((day) => (
                            <div key={day} className="text-center text-xs font-semibold text-gray-500 dark:text-slate-400 py-2">
                                {day}
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-2">
                        {monthGrid.map((cell) => {
                            if (!cell.day) {
                                return <div key={cell.dateKey} className="h-20 rounded-lg bg-gray-50 dark:bg-slate-700/20" />;
                            }

                            const hasInterviews = (interviewsByDate[cell.dateKey] || []).length > 0;
                            const isSelected = selectedDateKey === cell.dateKey;

                            return (
                                <button
                                    key={cell.dateKey}
                                    onClick={() => setSelectedDateKey(cell.dateKey)}
                                    className={`h-20 rounded-lg border p-2 text-left transition ${isSelected ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10' : 'border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/30'}`}
                                >
                                    <div className="text-sm font-semibold text-gray-900 dark:text-slate-100">{cell.day}</div>
                                    {hasInterviews && (
                                        <div className="mt-2 inline-flex items-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300 px-2 py-0.5 text-xs font-semibold">
                                            {(interviewsByDate[cell.dateKey] || []).length} Interview
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-lg shadow dark:shadow-lg p-4 border dark:border-slate-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Schedule Details</h3>
                    <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{selectedDateKey}</p>

                    {selectedDayInterviews.length === 0 ? (
                        <p className="text-sm text-gray-500 dark:text-slate-400 mt-4">No interviews for selected date.</p>
                    ) : (
                        <div className="mt-4 space-y-3">
                            {selectedDayInterviews.map((interview, index) => (
                                <div
                                    key={`${interview.applicationId}-${index}`}
                                    className="rounded-lg border border-gray-200 dark:border-slate-700 p-3 bg-gray-50 dark:bg-slate-700/30"
                                >
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{interview.studentName || 'Student'}</p>
                                    <p className="text-xs text-gray-600 dark:text-slate-300 mt-1">{interview.studentEmail || 'N/A'}</p>
                                    <p className="text-xs text-gray-600 dark:text-slate-300">{interview.studentPhone || 'N/A'}</p>
                                    <p className="text-xs text-indigo-600 dark:text-indigo-300 mt-2 font-medium">
                                        {interview.interviewDate?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} | {interview.duration || 'N/A'}
                                    </p>
                                    <p className="text-xs text-gray-700 dark:text-slate-300 mt-1">Type: {formatType(interview.interviewType)}</p>
                                    <p className="text-xs text-gray-700 dark:text-slate-300">Location/Link: {interview.venueOrLink || 'N/A'}</p>
                                    <p className="text-xs text-gray-700 dark:text-slate-300">Internship: {interview.internshipTitle}</p>
                                    <p className="text-xs text-gray-700 dark:text-slate-300">Student Response: {formatStudentResponse(interview.studentResponseStatus)}</p>
                                    {interview.studentResponseMessage && (
                                        <p className="text-xs text-gray-700 dark:text-slate-300">Reply Note: {interview.studentResponseMessage}</p>
                                    )}
                                    {interview.notes && (
                                        <p className="text-xs text-gray-700 dark:text-slate-300 mt-1">Notes: {interview.notes}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg shadow dark:shadow-lg p-6 border dark:border-slate-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">All Scheduled Interviews</h3>
                {interviewList.length === 0 ? (
                    <p className="text-gray-500 dark:text-slate-400">No interviews scheduled yet. Hire a student and use Add Interview to create one.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-slate-700 text-left">
                                    <th className="py-2 pr-4">Date</th>
                                    <th className="py-2 pr-4">Time</th>
                                    <th className="py-2 pr-4">Applicant</th>
                                    <th className="py-2 pr-4">Email</th>
                                    <th className="py-2 pr-4">Phone</th>
                                    <th className="py-2 pr-4">Type</th>
                                    <th className="py-2 pr-4">Duration</th>
                                    <th className="py-2 pr-4">Student Response</th>
                                </tr>
                            </thead>
                            <tbody>
                                {interviewList.map((interview, index) => (
                                    <tr key={`${interview.applicationId}-${index}`} className="border-b border-gray-100 dark:border-slate-700/50">
                                        <td className="py-2 pr-4">{interview.interviewDate.toLocaleDateString()}</td>
                                        <td className="py-2 pr-4">{interview.interviewDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                                        <td className="py-2 pr-4 font-medium">{interview.studentName || 'N/A'}</td>
                                        <td className="py-2 pr-4">{interview.studentEmail || 'N/A'}</td>
                                        <td className="py-2 pr-4">{interview.studentPhone || 'N/A'}</td>
                                        <td className="py-2 pr-4">{formatType(interview.interviewType)}</td>
                                        <td className="py-2 pr-4">{interview.duration || 'N/A'}</td>
                                        <td className="py-2 pr-4">{formatStudentResponse(interview.studentResponseStatus)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default C_InterviewScheduleDashboard;
