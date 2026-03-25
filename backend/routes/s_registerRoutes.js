const express = require("express");
const router = express.Router();
const { registerStudent, loginStudent } = require("../controllers/s_registerController");

router.post("/register", registerStudent);
router.post("/login", loginStudent);

module.exports = router;