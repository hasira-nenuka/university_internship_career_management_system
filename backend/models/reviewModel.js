const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: false, // Optional if student review
    },
    companyName: {
      type: String,
      required: false, // Optional if student review
      trim: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: false, // Optional if company review
    },
    studentName: {
      type: String,
      required: false, // Optional if company review
      trim: true,
    },
    reviewerType: {
      type: String,
      enum: ['Company', 'Student'],
      required: true,
      default: 'Company',
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'replied', 'closed'],
      default: 'pending',
    },
    adminReply: {
      type: String,
      default: '',
      trim: true,
    },
    repliedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      default: null,
    },
    repliedByName: {
      type: String,
      default: '',
      trim: true,
    },
    repliedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Review || mongoose.model('Review', reviewSchema);
