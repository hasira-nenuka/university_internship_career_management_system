const express = require("express");
const {
  getCompanyProAccount,
  requestProAccountUpgrade
} = require("../controllers/p_proAccountController");
const { protectCompany } = require("../middleware/C_authMiddleware");

const router = express.Router();

router.post("/request", protectCompany, requestProAccountUpgrade);
router.get("/company/:companyId", getCompanyProAccount);

module.exports = router;
