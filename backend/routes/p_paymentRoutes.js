const express = require("express");
const {
  uploadSlip,
  createPayment,
  createAdminPayment,
  getCompanyPayments,
  getAllPayments,
  updatePaymentStatus
} = require("../controllers/p_paymentController");
const { protectAdmin, allowAdminRoles } = require("../middleware/adminAuthMiddleware");

const router = express.Router();

router.post("/", (req, res, next) => {
  uploadSlip(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
}, createPayment);

router.get("/admin", protectAdmin, allowAdminRoles("Super Admin", "Payment Manager"), getAllPayments);
router.post("/admin", protectAdmin, allowAdminRoles("Super Admin", "Payment Manager"), createAdminPayment);
router.get("/all", getAllPayments);
router.get("/", getAllPayments);
router.get("/company/:companyId", getCompanyPayments);
router.put("/:paymentId/status", protectAdmin, allowAdminRoles("Super Admin", "Payment Manager"), updatePaymentStatus);

module.exports = router;
