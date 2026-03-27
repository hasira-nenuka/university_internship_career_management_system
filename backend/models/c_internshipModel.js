const mongoose = require('mongoose');

const internshipSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
  },
  title: {
    type: String,
    required: [true, 'Internship title is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: 5000,
  },
  requirements: [{
    type: String,
    required: true,
  }],
  skills: [{
    type: String,
    required: true,
  }],
  location: {
    type: String,
    required: [true, 'Location is required'],
  },
  type: {
    type: String,
    required: true,
    enum: ['Full-time', 'Part-time', 'Remote', 'Hybrid'],
  },
  duration: {
    type: String,
    required: [true, 'Duration is required'],
  },
  stipend: {
    type: String,
    required: [true, 'Stipend is required'],
  },
  openings: {
    type: Number,
    required: true,
    min: 1,
    default: 1,
  },
  deadline: {
    type: Date,
    required: true,
  },
  images: [{
    type: String,
  }],
  status: {
    type: String,
    enum: ['active', 'closed'],
    default: 'active',
  },
  paymentVerificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending',
  },
  paymentVerifiedAt: {
    type: Date,
    default: null,
  },
  applications: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application',
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

internshipSchema.index({ title: 'text', description: 'text', skills: 'text' });

module.exports = mongoose.models.Internship || mongoose.model('Internship', internshipSchema);
