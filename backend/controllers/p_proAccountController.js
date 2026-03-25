const mongoose = require("mongoose");
const ProAccount = require("../models/p_proAccountModel");

const PRO_AMOUNT = 6000;
const PRO_CYCLE_DAYS = 30;

const calculateExpiry = (startDate, cycleDays) => {
  const expiresAt = new Date(startDate);
  expiresAt.setDate(expiresAt.getDate() + cycleDays);
  return expiresAt;
};

const normalizeExpiredStatus = async (proAccount) => {
  if (!proAccount) return null;

  if (proAccount.status === "active" && proAccount.expiresAt && proAccount.expiresAt < new Date()) {
    proAccount.status = "expired";
    await proAccount.save();
  }

  return proAccount;
};

const buildProResponse = (proAccount) => {
  if (!proAccount) {
    return {
      isProActive: false,
      status: "inactive",
      amount: PRO_AMOUNT,
      cycleDays: PRO_CYCLE_DAYS,
      startsAt: null,
      expiresAt: null
    };
  }

  return {
    id: proAccount._id,
    companyId: proAccount.companyId,
    planName: proAccount.planName,
    amount: proAccount.amount,
    cycleDays: proAccount.cycleDays,
    status: proAccount.status,
    startsAt: proAccount.startsAt,
    expiresAt: proAccount.expiresAt,
    isProActive: proAccount.status === "active" && (!proAccount.expiresAt || proAccount.expiresAt > new Date()),
    lastPaymentId: proAccount.lastPaymentId,
    updatedAt: proAccount.updatedAt
  };
};

exports.PRO_AMOUNT = PRO_AMOUNT;
exports.PRO_CYCLE_DAYS = PRO_CYCLE_DAYS;

exports.getCompanyProAccount = async (req, res) => {
  try {
    const { companyId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(companyId)) {
      return res.status(400).json({ success: false, message: "Invalid companyId" });
    }

    const proAccount = await ProAccount.findOne({ companyId }).sort({ updatedAt: -1 });
    const normalized = await normalizeExpiredStatus(proAccount);

    return res.status(200).json({ success: true, data: buildProResponse(normalized) });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.ensureProAccess = async (companyId) => {
  const proAccount = await ProAccount.findOne({ companyId }).sort({ updatedAt: -1 });
  const normalized = await normalizeExpiredStatus(proAccount);
  const isActive = Boolean(
    normalized &&
      normalized.status === "active" &&
      (!normalized.expiresAt || normalized.expiresAt > new Date())
  );

  return {
    allowed: isActive,
    proAccount: normalized,
    reason: isActive ? "ok" : "Pro account required"
  };
};

exports.markProPaymentPending = async ({ companyId, paymentId }) => {
  const existing = await ProAccount.findOne({ companyId }).sort({ updatedAt: -1 });

  if (!existing) {
    await ProAccount.create({
      companyId,
      amount: PRO_AMOUNT,
      cycleDays: PRO_CYCLE_DAYS,
      status: "pending",
      lastPaymentId: paymentId,
      startsAt: null,
      expiresAt: null
    });
    return;
  }

  existing.amount = PRO_AMOUNT;
  existing.cycleDays = PRO_CYCLE_DAYS;
  existing.lastPaymentId = paymentId;

  if (existing.status !== "active") {
    existing.status = "pending";
  }

  await existing.save();
};

exports.applyProPaymentDecision = async ({ companyId, paymentId, status }) => {
  const existing = await ProAccount.findOne({ companyId }).sort({ updatedAt: -1 });

  if (!existing) {
    if (status !== "verified") {
      return;
    }

    const startsAt = new Date();
    await ProAccount.create({
      companyId,
      amount: PRO_AMOUNT,
      cycleDays: PRO_CYCLE_DAYS,
      status: "active",
      startsAt,
      expiresAt: calculateExpiry(startsAt, PRO_CYCLE_DAYS),
      lastPaymentId: paymentId
    });
    return;
  }

  if (status === "verified") {
    const startsAt = new Date();
    existing.status = "active";
    existing.startsAt = startsAt;
    existing.expiresAt = calculateExpiry(startsAt, existing.cycleDays || PRO_CYCLE_DAYS);
    existing.lastPaymentId = paymentId;
    await existing.save();
    return;
  }

  if (status === "rejected" && existing.status !== "active") {
    existing.status = "inactive";
    existing.lastPaymentId = paymentId;
    await existing.save();
  }
};
