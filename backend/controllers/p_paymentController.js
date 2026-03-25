const path = require("path");
const fs = require("fs");
const multer = require("multer");
const mongoose = require("mongoose");
const Payment = require("../models/p_paymentModel");
const Internship = require("../models/c_internshipModel");
const {
  PRO_AMOUNT,
  markProPaymentPending,
  applyProPaymentDecision
} = require("./p_proAccountController");

const uploadDir = path.join(__dirname, "..", "uploads", "payments");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `payment-${Date.now()}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/jpg") {
    cb(null, true);
  } else {
    cb(new Error("Only JPG/JPEG allowed"));
  }
};

exports.uploadSlip = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
}).single("slip");

const buildTimeString = (hours, minutes, seconds) => {
  const hh = String(hours || "00").padStart(2, "0");
  const mm = String(minutes || "00").padStart(2, "0");
  const ss = String(seconds || "00").padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
};

exports.createPayment = async (req, res) => {
  try {
    const {
      companyId,
      internshipId,
      paymentType,
      internshipTitle,
      name,
      nic,
      companyName,
      phoneNumber,
      bankName,
      branchName,
      accountNumber,
      amount,
      paymentDate,
      hours,
      minutes,
      seconds,
      referenceNo
    } = req.body;

    if (
      !companyId || !name || !nic || !companyName || !phoneNumber || !bankName ||
      !branchName || !accountNumber || !amount || !paymentDate || !referenceNo
    ) {
      return res.status(400).json({ success: false, message: "All required fields must be provided" });
    }

    if (!mongoose.Types.ObjectId.isValid(companyId)) {
      return res.status(400).json({ success: false, message: "Invalid companyId" });
    }

    if (internshipId && !mongoose.Types.ObjectId.isValid(internshipId)) {
      return res.status(400).json({ success: false, message: "Invalid internshipId" });
    }

    if (!/^\d{10}$/.test(phoneNumber)) {
      return res.status(400).json({ success: false, message: "Mobile number must be 10 digits" });
    }

    if (bankName === "Sampath Bank" && String(referenceNo).length !== 12) {
      return res.status(400).json({ success: false, message: "Reference No must be 12 digits for Sampath Bank" });
    }

    if (bankName === "BOC Bank" && String(referenceNo).length !== 16) {
      return res.status(400).json({ success: false, message: "Reference No must be 16 digits for BOC Bank" });
    }

    const amountNumber = Number(amount);
    if (!Number.isFinite(amountNumber) || amountNumber <= 0) {
      return res.status(400).json({ success: false, message: "Amount must be a valid number greater than 0" });
    }

    const normalizedPaymentType = paymentType === "pro_account" ? "pro_account" : "internship_post";

    if (normalizedPaymentType === "pro_account" && amountNumber !== PRO_AMOUNT) {
      return res.status(400).json({
        success: false,
        message: `Pro account payment must be exactly Rs ${PRO_AMOUNT.toFixed(2)}`
      });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: "Payment slip is required" });
    }

    const slipUrl = `${req.protocol}://${req.get("host")}/uploads/payments/${req.file.filename}`;

    const payment = await Payment.create({
      companyId,
      internshipId: internshipId || null,
      paymentType: normalizedPaymentType,
      internshipTitle: internshipTitle || "",
      name,
      nic,
      companyName,
      phoneNumber,
      bankName,
      branchName,
      accountNumber,
      amount: amountNumber,
      paymentDate,
      paymentTime: buildTimeString(hours, minutes, seconds),
      referenceNo,
      slipUrl
    });

    if (internshipId) {
      await Internship.findByIdAndUpdate(
        internshipId,
        {
          paymentVerificationStatus: "pending",
          paymentVerifiedAt: null
        },
        { runValidators: false }
      );
    }

    if (normalizedPaymentType === "pro_account") {
      await markProPaymentPending({
        companyId,
        paymentId: payment._id
      });
    }

    return res.status(201).json({ success: true, message: "Payment submitted successfully", data: payment });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getCompanyPayments = async (req, res) => {
  try {
    const { companyId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(companyId)) {
      return res.status(400).json({ success: false, message: "Invalid companyId" });
    }

    const payments = await Payment.find({ companyId }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: payments });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllPayments = async (req, res) => {
  try {
    const { paymentType } = req.query;
    const query = {};

    if (paymentType) {
      if (!["internship_post", "pro_account"].includes(paymentType)) {
        return res.status(400).json({ success: false, message: "Invalid paymentType" });
      }
      query.paymentType = paymentType;
    }

    const payments = await Payment.find(query).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: payments });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.updatePaymentStatus = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(paymentId)) {
      return res.status(400).json({ success: false, message: "Invalid paymentId" });
    }

    if (!["pending", "verified", "rejected"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid payment status" });
    }

    const payment = await Payment.findByIdAndUpdate(
      paymentId,
      { status },
      { new: true, runValidators: true }
    );

    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment not found" });
    }

    if (payment.internshipId) {
      const internshipStatus = status === "verified"
        ? "verified"
        : status === "rejected"
          ? "rejected"
          : "pending";

      await Internship.findByIdAndUpdate(
        payment.internshipId,
        {
          paymentVerificationStatus: internshipStatus,
          paymentVerifiedAt: status === "verified" ? new Date() : null
        },
        { runValidators: false }
      );
    }

    if (payment.paymentType === "pro_account") {
      await applyProPaymentDecision({
        companyId: payment.companyId,
        paymentId: payment._id,
        status
      });
    }

    return res.status(200).json({ success: true, message: "Payment status updated", data: payment });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
