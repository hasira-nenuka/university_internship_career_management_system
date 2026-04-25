import React, { useMemo, useState } from 'react';

const C_InterviewShedule = ({
    application,
    onClose,
    onSchedule,
    existingSchedule,
    internships = [],
    defaultSelectedInternship = ''
}) => {
    const extractInternshipId = (value) => {
        if (!value) return '';
        if (typeof value === 'string') return value;
        if (typeof value === 'object') {
            return value._id || value.id || '';
        }
        return '';
    };

    const resolveInternshipTitle = (id) => {
        if (!id) return 'Not available';

        const matchedInternship = internships.find((internship) => internship._id === id);
        if (matchedInternship?.title) return matchedInternship.title;

        if (application?.internshipTitle) return application.internshipTitle;
        if (application?.internship?.title) return application.internship.title;
        if (application?.internshipId?.title) return application.internshipId.title;
        if (existingSchedule?.internshipTitle) return existingSchedule.internshipTitle;

        return 'Selected internship';
    };

    const formatForDateTimeInput = (value) => {
        if (!value) return '';

        const dateValue = new Date(value);
        if (Number.isNaN(dateValue.getTime())) return '';

        const year = dateValue.getFullYear();
        const month = String(dateValue.getMonth() + 1).padStart(2, '0');
        const day = String(dateValue.getDate()).padStart(2, '0');
        const hours = String(dateValue.getHours()).padStart(2, '0');
        const minutes = String(dateValue.getMinutes()).padStart(2, '0');

        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    const [interviewDateTime, setInterviewDateTime] = useState(formatForDateTimeInput(existingSchedule?.interviewDateTime));
    const [internshipId] = useState(
        extractInternshipId(existingSchedule?.internshipId) ||
        extractInternshipId(application?.internshipId) ||
        extractInternshipId(application?.internship) ||
        extractInternshipId(defaultSelectedInternship)
    );
    const [duration, setDuration] = useState(existingSchedule?.duration || '30 mins');
    const [interviewType, setInterviewType] = useState(existingSchedule?.interviewType || 'online');
    const [venueOrLink, setVenueOrLink] = useState(existingSchedule?.venueOrLink || '');
    const [notes, setNotes] = useState(existingSchedule?.notes || '');
    const [formError, setFormError] = useState('');

    const applicant = application?.student || {};

    const typeLabel = useMemo(() => {
        if (interviewType === 'online') return 'Meeting Link';
        if (interviewType === 'onsite') return 'Venue';
        return 'Phone Number';
    }, [interviewType]);

    const studentName = applicant?.name || `${applicant?.firstName || ''} ${applicant?.lastName || ''}`.trim() || 'N/A';
    const studentEmail = applicant?.email || 'N/A';
    const studentPhone = applicant?.contactNumber || 'N/A';
    const studentId = applicant?._id || application?.student?.profileId || application?.student?.id || application?.studentId || '';

    const handleSubmit = (e) => {
        e.preventDefault();
        setFormError('');

        if (!internshipId) {
            setFormError('Please select an internship for this interview.');
            return;
        }

        if (!interviewDateTime) {
            setFormError('Please select an interview date and time.');
            return;
        }

        const selectedTime = new Date(interviewDateTime).getTime();
        if (Number.isNaN(selectedTime) || selectedTime <= Date.now()) {
            setFormError('Interview date/time must be in the future.');
            return;
        }

        if (!venueOrLink.trim()) {
            setFormError(`Please enter ${typeLabel.toLowerCase()}.`);
            return;
        }

        onSchedule({
            _id: existingSchedule?._id || '',
            referenceKey: application?._id,
            applicationId: application?._id,
            internshipId,
            studentId,
            studentName,
            studentEmail,
            studentPhone,
            interviewDateTime,
            duration,
            interviewType,
            venueOrLink: venueOrLink.trim(),
            notes: notes.trim(),
            scheduledAt: new Date().toISOString()
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] overflow-y-auto">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full mx-4 my-8 max-h-screen overflow-y-auto dark:bg-slate-800 dark:border dark:border-slate-700">
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Schedule Interview</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 dark:text-slate-300 dark:hover:text-white text-2xl"
                    >
                        &times;
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-700/40 p-4">
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-200 mb-3">Applicant Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            <p><strong>Name:</strong> {applicant?.name || 'N/A'}</p>
                            <p><strong>Email:</strong> {applicant?.email || 'N/A'}</p>
                            <p><strong>Phone:</strong> {applicant?.contactNumber || 'N/A'}</p>
                            <p><strong>Status:</strong> Hired</p>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">Internship</label>
                        <div className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-700/40 text-gray-800 dark:text-slate-100">
                            {resolveInternshipTitle(internshipId)}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">Interview Date & Time *</label>
                            <input
                                type="datetime-local"
                                value={interviewDateTime}
                                onChange={(e) => setInterviewDateTime(e.target.value)}
                                min={new Date(Date.now() + 60000).toISOString().slice(0, 16)}
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">Duration *</label>
                            <select
                                value={duration}
                                onChange={(e) => setDuration(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="30 mins">30 mins</option>
                                <option value="45 mins">45 mins</option>
                                <option value="60 mins">60 mins</option>
                                <option value="90 mins">90 mins</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">Interview Type *</label>
                            <select
                                value={interviewType}
                                onChange={(e) => setInterviewType(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="online">Online</option>
                                <option value="onsite">Onsite</option>
                                <option value="phone">Phone</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">{typeLabel} *</label>
                            <input
                                type="text"
                                value={venueOrLink}
                                onChange={(e) => setVenueOrLink(e.target.value)}
                                placeholder={interviewType === 'online' ? 'https://meet.example.com/room' : interviewType === 'onsite' ? 'Office address' : 'Interview call number'}
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">Notes</label>
                        <textarea
                            rows={3}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Optional interview instructions, panel details, or preparation notes"
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    {formError && (
                        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300">
                            {formError}
                        </div>
                    )}

                    <div className="flex flex-wrap gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                        >
                            Save Interview Schedule
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default C_InterviewShedule;
