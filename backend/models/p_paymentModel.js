const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true
    },
    internshipId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Internship",
      default: null
    },
    paymentType: {
      type: String,
      enum: ["internship_post", "pro_account"],
      default: "internship_post"
    },
    internshipTitle: { type: String, default: "", trim: true },
    name: { type: String, required: true, trim: true },
    nic: { type: String, required: true, trim: true },
    companyName: { type: String, required: true, trim: true },
    phoneNumber: { type: String, required: true, trim: true },
    bankName: {
      type: String,
      required: true,
      enum: ["Sampath Bank", "BOC Bank"]
    },
    branchName: { type: String, required: true, trim: true },
    accountNumber: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    paymentDate: { type: Date, required: true },
    paymentTime: { type: String, required: true, trim: true },
    referenceNo: { type: String, required: true, trim: true },
    slipUrl: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
