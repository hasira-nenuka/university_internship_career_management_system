const path = require("path");
const fs = require("fs");
const multer = require("multer");
const mongoose = require("mongoose");
const Payment = require("../models/p_paymentModel");
const Internship = require("../models/c_internshipModel");
const Company = require("../models/c_companyModel");
const Student = require("../models/s_registerModel");
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

const normalizeText = (value) => String(value || "").trim();

const normalizePaymentType = (paymentType, payerType) => {
  const normalized = normalizeText(paymentType);

  if (payerType === "student") {
    return normalized === "student_payment" ? "student_payment" : "other";
  }

  if (normalized === "pro_account") {
    return "pro_account";
  }

  if (normalized === "other") {
    return "other";
  }

  return "internship_post";
};

const validateReferenceNumber = (bankName, referenceNo) => {
  const normalizedBank = normalizeText(bankName);
  const reference = normalizeText(referenceNo);

  if (normalizedBank === "Sampath Bank" && reference.length !== 12) {
    return "Reference No must be 12 digits for Sampath Bank";
  }

  if (normalizedBank === "BOC Bank" && reference.length !== 16) {
    return "Reference No must be 16 digits for BOC Bank";
  }

  return "";
};

const syncPaymentRelations = async (payment, status = payment.status) => {
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

  if (payment.paymentType === "pro_account" && payment.companyId) {
    if (status === "pending") {
      await markProPaymentPending({
        companyId: payment.companyId,
        paymentId: payment._id
      });
    } else {
      await applyProPaymentDecision({
        companyId: payment.companyId,
        paymentId: payment._id,
        status
      });
    }
  }
};

const parsePaymentPayload = async (req, { isAdmin = false } = {}) => {
  const payerType = normalizeText(req.body.payerType) === "student" ? "student" : "company";
  const paymentTime = normalizeText(req.body.paymentTime) || buildTimeString(
    req.body.hours,
    req.body.minutes,
    req.body.seconds
  );

  const payload = {
    payerType,
    companyId: normalizeText(req.body.companyId) || null,
    studentId: normalizeText(req.body.studentId) || null,
    internshipId: normalizeText(req.body.internshipId) || null,
    internshipTitle: normalizeText(req.body.internshipTitle),
    companyName: normalizeText(req.body.companyName),
    studentName: normalizeText(req.body.studentName),
    name: normalizeText(req.body.name),
    nic: normalizeText(req.body.nic),
    payerEmail: normalizeText(req.body.payerEmail),
    phoneNumber: normalizeText(req.body.phoneNumber),
    bankName: normalizeText(req.body.bankName),
    branchName: normalizeText(req.body.branchName),
    accountNumber: normalizeText(req.body.accountNumber),
    amount: Number(req.body.amount),
    paymentDate: req.body.paymentDate,
    paymentTime,
    referenceNo: normalizeText(req.body.referenceNo),
    notes: normalizeText(req.body.notes),
    slipUrl: normalizeText(req.body.slipUrl),
    status: normalizeText(req.body.status) || "pending"
  };

  payload.paymentType = normalizePaymentType(req.body.paymentType, payerType);

  if (!["pending", "verified", "rejected"].includes(payload.status)) {
    return { error: "Invalid payment status" };
  }

  if (
    !payload.name || !payload.nic || !payload.phoneNumber || !payload.bankName ||
    !payload.branchName || !payload.accountNumber || !payload.referenceNo ||
    !payload.paymentDate || !payload.paymentTime || !Number.isFinite(payload.amount) || payload.amount <= 0
  ) {
    return { error: "All required payment fields must be provided" };
  }

  if (!/^\d{10}$/.test(payload.phoneNumber)) {
    return { error: "Mobile number must be 10 digits" };
  }

  const referenceError = validateReferenceNumber(payload.bankName, payload.referenceNo);
  if (referenceError) {
    return { error: referenceError };
  }

  if (payerType === "company") {
    if (!isAdmin && !payload.companyId) {
      return { error: "companyId is required" };
    }

    if (payload.companyId) {
      if (!mongoose.Types.ObjectId.isValid(payload.companyId)) {
        return { error: "Invalid companyId" };
      }

      const company = await Company.findById(payload.companyId).select("companyName email");
      if (!company) {
        return { error: "Company not found" };
      }

      if (!payload.companyName) {
        payload.companyName = company.companyName;
      }

      if (!payload.payerEmail) {
        payload.payerEmail = company.email || "";
      }
    }

    if (!payload.companyName) {
      return { error: "Company name is required for company payments" };
    }

    payload.studentId = null;
    payload.studentName = "";
  } else {
    if (payload.studentId) {
      if (!mongoose.Types.ObjectId.isValid(payload.studentId)) {
        return { error: "Invalid studentId" };
      }

      const student = await Student.findById(payload.studentId).select("firstName lastName email");
      if (!student) {
        return { error: "Student not found" };
      }

      if (!payload.studentName) {
        payload.studentName = `${student.firstName} ${student.lastName}`.trim();
      }

      if (!payload.payerEmail) {
        payload.payerEmail = student.email || "";
      }
    }

    if (!payload.studentName) {
      return { error: "Student name is required for student payments" };
    }

    payload.companyId = null;
    payload.companyName = "";
    payload.internshipId = null;
    payload.internshipTitle = "";
  }

  if (payload.internshipId) {
    if (!mongoose.Types.ObjectId.isValid(payload.internshipId)) {
      return { error: "Invalid internshipId" };
    }

    const internship = await Internship.findById(payload.internshipId).select("title");
    if (!internship) {
      return { error: "Internship not found" };
    }

    if (!payload.internshipTitle) {
      payload.internshipTitle = internship.title || "";
    }
  }

  if (payload.paymentType === "pro_account" && payload.payerType !== "company") {
    return { error: "Pro account payments can only be created for companies" };
  }

  if (payload.paymentType === "pro_account" && payload.amount !== PRO_AMOUNT) {
    return {
      error: `Pro account payment must be exactly Rs ${PRO_AMOUNT.toFixed(2)}`
    };
  }

  if (!isAdmin && !req.file) {
    return { error: "Payment slip is required" };
  }

  if (!payload.slipUrl && req.file) {
    payload.slipUrl = `${req.protocol}://${req.get("host")}/uploads/payments/${req.file.filename}`;
  }

  if (isAdmin && req.admin) {
    payload.recordedByAdminId = req.admin._id;
    payload.recordedByAdminName = req.admin.name || req.admin.fullName || "";
  }

  return { payload };
};

exports.createPayment = async (req, res) => {
  try {
    req.body.payerType = "company";
    const { payload, error } = await parsePaymentPayload(req, { isAdmin: false });
    if (error) {
      return res.status(400).json({ success: false, message: error });
    }

    const payment = await Payment.create(payload);
    await syncPaymentRelations(payment);

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
    const { paymentType, payerType, status } = req.query;
    const query = {};

    if (paymentType) {
      if (!["internship_post", "pro_account", "student_payment", "other"].includes(paymentType)) {
        return res.status(400).json({ success: false, message: "Invalid paymentType" });
      }
      query.paymentType = paymentType;
    }

    if (payerType) {
      if (!["company", "student"].includes(payerType)) {
        return res.status(400).json({ success: false, message: "Invalid payerType" });
      }
      query.payerType = payerType;
    }

    if (status) {
      if (!["pending", "verified", "rejected"].includes(status)) {
        return res.status(400).json({ success: false, message: "Invalid status" });
      }
      query.status = status;
    }

    const payments = await Payment.find(query).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: payments });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getPaymentAnalytics = async (req, res) => {
  try {
    const totalPayments = await Payment.countDocuments();
    const totalAmountResult = await Payment.aggregate([{ $group: { _id: null, totalAmount: { $sum: "$amount" } } }]);
    const totalAmount = totalAmountResult[0]?.totalAmount || 0;

    const statusCounts = await Payment.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 }, amount: { $sum: "$amount" } } }
    ]);

    const payerCounts = await Payment.aggregate([
      { $group: { _id: "$payerType", count: { $sum: 1 }, amount: { $sum: "$amount" } } }
    ]);

    const topPartners = await Payment.aggregate([
      { $match: { payerType: "company" } },
      {
        $group: {
          _id: { companyId: "$companyId", companyName: "$companyName" },
          totalAmount: { $sum: "$amount" },
          totalRecords: { $sum: 1 },
          verifiedRecords: { $sum: { $cond: [{ $eq: ["$status", "verified"] }, 1, 0] } },
          lastPaymentDate: { $max: "$paymentDate" }
        }
      },
      { $sort: { totalAmount: -1, totalRecords: -1 } },
      { $limit: 10 },
      {
        $project: {
          companyId: "$_id.companyId",
          companyName: "$_id.companyName",
          totalAmount: 1,
          totalRecords: 1,
          verifiedRecords: 1,
          lastPaymentDate: 1,
          _id: 0
        }
      }
    ]);

    return res.status(200).json({
      success: true,
      data: { totalPayments, totalAmount, statusCounts, payerCounts, topPartners }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.updatePaymentStatus = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const status = normalizeText(req.body.status);
    const rejectionReason = normalizeText(req.body.rejectionReason);

    if (!mongoose.Types.ObjectId.isValid(paymentId)) {
      return res.status(400).json({ success: false, message: "Invalid paymentId" });
    }

    if (!["pending", "verified", "rejected"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid payment status" });
    }

    if (status === "rejected" && !rejectionReason) {
      return res.status(400).json({
        success: false,
        message: "Rejection reason is required when rejecting a payment"
      });
    }

    const updatePayload = {
      status,
      rejectionReason: status === "rejected" ? rejectionReason : "",
      rejectionNotifiedAt: status === "rejected" ? new Date() : null
    };

    const payment = await Payment.findByIdAndUpdate(
      paymentId,
      updatePayload,
      { new: true, runValidators: true }
    );

    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment not found" });
    }

    await syncPaymentRelations(payment, status);

    return res.status(200).json({ success: true, message: "Payment status updated", data: payment });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.createAdminPayment = async (req, res) => {
  try {
    const { payload, error } = await parsePaymentPayload(req, { isAdmin: true });
    if (error) {
      return res.status(400).json({ success: false, message: error });
    }

    const payment = await Payment.create(payload);
    await syncPaymentRelations(payment, payment.status);

    return res.status(201).json({
      success: true,
      message: "Payment record created successfully",
      data: payment
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
