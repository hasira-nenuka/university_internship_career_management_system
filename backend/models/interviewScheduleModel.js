const mongoose = require('mongoose');

const interviewScheduleSchema = new mongoose.Schema({
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    },
    referenceKey: {
        type: String,
        required: true
    },
    internshipId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Internship',
        required: true
    },
    applicationId: {
        type: String,
        default: ''
    },
    studentId: {
        type: String,
        default: ''
    },
    studentName: {
        type: String,
        default: ''
    },
    studentEmail: {
        type: String,
        default: ''
    },
    studentPhone: {
        type: String,
        default: ''
    },
    interviewDateTime: {
        type: Date,
        required: true
    },
    duration: {
        type: String,
        default: '30 mins'
    },
    interviewType: {
        type: String,
        enum: ['online', 'onsite', 'phone'],
        default: 'online'
    },
    venueOrLink: {
        type: String,
        required: true
    },
    notes: {
        type: String,
        default: ''
    },
    studentResponseStatus: {
        type: String,
        enum: ['pending', 'accepted', 'declined', 'reschedule_requested'],
        default: 'pending'
    },
    studentResponseMessage: {
        type: String,
        default: ''
    },
    studentRespondedAt: {
        type: Date,
        default: null
    },
    status: {
        type: String,
        enum: ['scheduled', 'completed', 'cancelled'],
        default: 'scheduled'
    },
    source: {
        type: String,
        enum: ['application', 'direct'],
        default: 'application'
    }
}, {
    timestamps: true
});

interviewScheduleSchema.index({ companyId: 1, referenceKey: 1 }, { unique: true });

module.exports = mongoose.models.InterviewSchedule || mongoose.model('InterviewSchedule', interviewScheduleSchema);
