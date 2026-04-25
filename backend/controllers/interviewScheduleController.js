const mongoose = require('mongoose');
const InterviewSchedule = require('../models/interviewScheduleModel');

const isDatabaseUnavailableError = (error) => {
    const message = error?.message || '';

    return (
        message.includes('buffering timed out') ||
        message.includes('ECONNREFUSED') ||
        message.includes('MongoServerSelectionError') ||
        message.includes('Topology is closed')
    );
};

const sendDatabaseUnavailable = (res) =>
    res.status(503).json({
        success: false,
        message: 'Database is currently unavailable. Start MongoDB or update backend/.env with a working MONGO_URI.'
    });

const escapeRegex = (value = '') => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const formatInterviewSchedule = (schedule) => ({
    ...schedule.toObject(),
    internship: schedule.internshipId?._id || schedule.internshipId || null,
    internshipTitle: schedule.internshipId?.title || '',
    internshipLocation: schedule.internshipId?.location || '',
    companyName: schedule.companyId?.companyName || '',
    companyLogo: schedule.companyId?.logo || ''
});

const getCompanyInterviewSchedules = async (req, res) => {
    try {
        const schedules = await InterviewSchedule.find({ companyId: req.company._id, status: { $ne: 'cancelled' } })
            .populate('internshipId', 'title location')
            .populate('companyId', 'companyName logo')
            .sort({ interviewDateTime: 1 });

        return res.json({
            success: true,
            count: schedules.length,
            data: schedules.map(formatInterviewSchedule)
        });
    } catch (error) {
        console.error(error);

        if (isDatabaseUnavailableError(error)) {
            return sendDatabaseUnavailable(res);
        }

        return res.status(500).json({ success: false, message: error.message });
    }
};

const getStudentInterviewSchedules = async (req, res) => {
    try {
        const studentId = req.student?._id ? String(req.student._id).trim() : '';
        const studentEmail = String(req.student?.email || '').trim();
        const normalizedStudentEmail = studentEmail.toLowerCase();
        const filters = [];

        if (studentId) {
            filters.push({ studentId });
        }

        if (studentEmail) {
            filters.push({ studentEmail });
            filters.push({ studentEmail: normalizedStudentEmail });
            filters.push({ studentEmail: { $regex: `^${escapeRegex(studentEmail)}$`, $options: 'i' } });
        }

        if (filters.length === 0) {
            return res.json({
                success: true,
                count: 0,
                data: []
            });
        }

        const schedules = await InterviewSchedule.find({
            status: { $ne: 'cancelled' },
            $or: filters
        })
            .populate('internshipId', 'title location')
            .populate('companyId', 'companyName logo')
            .sort({ interviewDateTime: 1 });

        return res.json({
            success: true,
            count: schedules.length,
            data: schedules.map(formatInterviewSchedule)
        });
    } catch (error) {
        console.error(error);

        if (isDatabaseUnavailableError(error)) {
            return sendDatabaseUnavailable(res);
        }

        return res.status(500).json({ success: false, message: error.message });
    }
};

const saveInterviewSchedule = async (req, res) => {
    try {
        const {
            referenceKey,
            internshipId,
            applicationId = '',
            studentId = '',
            studentName = '',
            studentEmail = '',
            studentPhone = '',
            interviewDateTime,
            duration = '30 mins',
            interviewType = 'online',
            venueOrLink,
            notes = '',
            source = 'application'
        } = req.body;

        if (!referenceKey || !internshipId || !interviewDateTime || !venueOrLink) {
            return res.status(400).json({
                success: false,
                message: 'referenceKey, internshipId, interviewDateTime, and venueOrLink are required'
            });
        }

        if (!mongoose.Types.ObjectId.isValid(internshipId)) {
            return res.status(400).json({ success: false, message: 'Invalid internshipId' });
        }

        const normalizedDate = new Date(interviewDateTime);
        if (Number.isNaN(normalizedDate.getTime())) {
            return res.status(400).json({ success: false, message: 'Invalid interview date and time' });
        }

        const normalizedStudentId = String(studentId || '').trim();
        const normalizedStudentEmail = String(studentEmail || '').trim().toLowerCase();
        const normalizedStudentName = String(studentName || '').trim();
        const normalizedStudentPhone = String(studentPhone || '').trim();

        const savedSchedule = await InterviewSchedule.findOneAndUpdate(
            { companyId: req.company._id, referenceKey },
            {
                $set: {
                    companyId: req.company._id,
                    referenceKey,
                    internshipId,
                    applicationId,
                    studentId: normalizedStudentId,
                    studentName: normalizedStudentName,
                    studentEmail: normalizedStudentEmail,
                    studentPhone: normalizedStudentPhone,
                    interviewDateTime: normalizedDate,
                    duration,
                    interviewType,
                    venueOrLink,
                    notes,
                    status: 'scheduled',
                    source
                }
            },
            { new: true, upsert: true, runValidators: true }
        ).populate('internshipId', 'title location');
        await savedSchedule.populate('companyId', 'companyName logo');

        return res.status(201).json({
            success: true,
            data: formatInterviewSchedule(savedSchedule),
            message: 'Interview schedule saved successfully'
        });
    } catch (error) {
        console.error(error);

        if (isDatabaseUnavailableError(error)) {
            return sendDatabaseUnavailable(res);
        }

        return res.status(500).json({ success: false, message: error.message });
    }
};

const updateInterviewSchedule = async (req, res) => {
    try {
        const schedule = await InterviewSchedule.findOne({ _id: req.params.id, companyId: req.company._id });

        if (!schedule) {
            return res.status(404).json({ success: false, message: 'Interview schedule not found' });
        }

        if (req.body.interviewDateTime) {
            const normalizedDate = new Date(req.body.interviewDateTime);
            if (Number.isNaN(normalizedDate.getTime())) {
                return res.status(400).json({ success: false, message: 'Invalid interview date and time' });
            }
            req.body.interviewDateTime = normalizedDate;
        }

        Object.assign(schedule, req.body);
        await schedule.save();

        await schedule.populate('internshipId', 'title location');
        await schedule.populate('companyId', 'companyName logo');

        return res.json({
            success: true,
            data: formatInterviewSchedule(schedule),
            message: 'Interview schedule updated successfully'
        });
    } catch (error) {
        console.error(error);

        if (isDatabaseUnavailableError(error)) {
            return sendDatabaseUnavailable(res);
        }

        return res.status(500).json({ success: false, message: error.message });
    }
};

const deleteInterviewSchedule = async (req, res) => {
    try {
        const schedule = await InterviewSchedule.findOneAndDelete({ _id: req.params.id, companyId: req.company._id });

        if (!schedule) {
            return res.status(404).json({ success: false, message: 'Interview schedule not found' });
        }

        return res.json({
            success: true,
            message: 'Interview schedule deleted successfully'
        });
    } catch (error) {
        console.error(error);

        if (isDatabaseUnavailableError(error)) {
            return sendDatabaseUnavailable(res);
        }

        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getCompanyInterviewSchedules,
    getStudentInterviewSchedules,
    saveInterviewSchedule,
    updateInterviewSchedule,
    deleteInterviewSchedule
};
