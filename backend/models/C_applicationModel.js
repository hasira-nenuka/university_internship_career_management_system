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
    studentProfileId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'StudentProfile',
        default: null
    },
    studentSnapshot: {
        firstName: { type: String, default: '' },
        lastName: { type: String, default: '' },
        fullName: { type: String, default: '' },
        email: { type: String, default: '' },
        contactNumber: { type: String, default: '' },
        district: { type: String, default: '' },
        province: { type: String, default: '' },
        university: { type: String, default: '' },
        degree: { type: String, default: '' },
        eduLevel: { type: String, default: '' },
        preferredField: { type: String, default: '' },
        frontendSkills: [{ type: String }],
        backendSkills: [{ type: String }],
        databaseSkills: [{ type: String }],
        cv: { type: String, default: '' },
        profileImage: { type: String, default: '' },
        bio: { type: String, default: '' }
    },
    coverLetter: {
        type: String,
        default: '',
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

module.exports = mongoose.models.Application || mongoose.model('Application', applicationSchema);
