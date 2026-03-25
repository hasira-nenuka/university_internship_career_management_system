const express = require("express");
const { getCompanyProAccount } = require("../controllers/p_proAccountController");

const router = express.Router();

router.get("/company/:companyId", getCompanyProAccount);

module.exports = router;
