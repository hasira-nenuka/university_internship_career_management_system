const mongoose = require("mongoose");

const proAccountSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true
    },
    planName: {
      type: String,
      default: "Pro Account",
      trim: true
    },
    amount: {
      type: Number,
      required: true,
      default: 6000,
      min: 0
    },
    cycleDays: {
      type: Number,
      required: true,
      default: 30,
      min: 1
    },
    status: {
      type: String,
      enum: ["pending", "active", "expired", "inactive"],
      default: "inactive"
    },
    startsAt: { type: Date, default: null },
    expiresAt: { type: Date, default: null },
    lastPaymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      default: null
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("ProAccount", proAccountSchema);
