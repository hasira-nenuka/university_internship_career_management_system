const express = require("express");
const {
  uploadSlip,
  createPayment,
  getCompanyPayments,
  getAllPayments,
  updatePaymentStatus
} = require("../controllers/p_paymentController");

const router = express.Router();

router.post("/", (req, res, next) => {
  uploadSlip(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
}, createPayment);

router.get("/all", getAllPayments);
router.get("/", getAllPayments);
router.get("/company/:companyId", getCompanyPayments);
router.put("/:paymentId/status", updatePaymentStatus);

module.exports = router;
