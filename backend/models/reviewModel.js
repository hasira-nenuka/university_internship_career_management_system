const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    subject: { type: String, required: true, trim: true },
    targetType: { type: String, enum: ['Student', 'Employer', 'Payment', 'General'], default: 'General' },
    targetName: { type: String, default: '', trim: true },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
    notes: { type: String, default: '', trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Review', reviewSchema);
