const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    internshipId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Internship',
        required: true
    },
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    coverLetter: {
        type: String,
        required: true,
        maxlength: 2000
    },
    resume: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['pending', 'reviewed', 'shortlisted', 'accepted', 'rejected'],
        default: 'pending'
    },
    matchScore: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    appliedAt: {
        type: Date,
        default: Date.now
    },
    reviewedAt: Date,
    notes: {
        type: String,
        maxlength: 1000
    }
}, {
    timestamps: true
});

// Ensure one application per student per internship
applicationSchema.index({ internshipId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);