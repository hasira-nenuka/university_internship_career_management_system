const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      default: null
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      default: null
    },
    internshipId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Internship",
      default: null
    },
    payerType: {
      type: String,
      enum: ["company", "student"],
      default: "company"
    },
    paymentType: {
      type: String,
      enum: ["internship_post", "pro_account", "student_payment", "other"],
      default: "internship_post"
    },
    internshipTitle: { type: String, default: "", trim: true },
    studentName: { type: String, default: "", trim: true },
    name: { type: String, required: true, trim: true },
    nic: { type: String, required: true, trim: true },
    companyName: { type: String, default: "", trim: true },
    payerEmail: { type: String, default: "", trim: true, lowercase: true },
    phoneNumber: { type: String, required: true, trim: true },
    bankName: {
      type: String,
      required: true,
      enum: ["Sampath Bank", "BOC Bank", "Other"]
    },
    branchName: { type: String, required: true, trim: true },
    accountNumber: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    paymentDate: { type: Date, required: true },
    paymentTime: { type: String, required: true, trim: true },
    referenceNo: { type: String, required: true, trim: true },
    slipUrl: { type: String, default: "" },
    notes: { type: String, default: "", trim: true },
    rejectionReason: { type: String, default: "", trim: true },
    rejectionNotifiedAt: { type: Date, default: null },
    recordedByAdminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null
    },
    recordedByAdminName: { type: String, default: "", trim: true },
    status: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.models.Payment || mongoose.model("Payment", paymentSchema);
