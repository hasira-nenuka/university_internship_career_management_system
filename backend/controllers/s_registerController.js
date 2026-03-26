const Student = require("../models/s_registerModel");
const StudentProfile = require("../models/s_ProfileModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const normalizeEmail = (email) => email?.trim().toLowerCase();
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^\d{10}$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8}$/;
const isDatabaseConnected = () => mongoose.connection.readyState === 1;

const sendDatabaseUnavailable = (res) =>
  res.status(503).json({
    message: "Database is currently unavailable. Start MongoDB or update backend/.env with a working MONGO_URI before student login."
  });

// REGISTER
exports.registerStudent = async (req, res) => {
  try {
    if (!isDatabaseConnected()) {
      return sendDatabaseUnavailable(res);
    }

    const { firstName, lastName, address, contactNumber, email, password, confirmPassword } = req.body;
    const normalizedEmail = normalizeEmail(email);

    // Check all required fields
    if (!firstName || !lastName || !address || !contactNumber || !normalizedEmail || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Contact number validation
    if (!phoneRegex.test(contactNumber)) {
      return res.status(400).json({ message: "Contact number must be 10 digits" });
    }

    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({ message: "Email must include @ and ." });
    }

    // Email already exists
    const existing = await Student.findOne({ email: normalizedEmail });
    if (existing) return res.status(400).json({ message: "Email already registered" });

    // Password strength validation
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ 
        message: "Password must be exactly 8 characters, include uppercase, lowercase, and number" 
      });
    }

    // Confirm password check
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create student
    const student = await Student.create({
      firstName,
      lastName,
      address,
      contactNumber,
      email: normalizedEmail,
      password: hashedPassword
    });

    res.status(201).json({ message: "Registered successfully", student });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// LOGIN
exports.loginStudent = async (req, res) => {
  try {
    if (!isDatabaseConnected()) {
      return sendDatabaseUnavailable(res);
    }

    const { email, password } = req.body;
    const normalizedEmail = normalizeEmail(email);

    // Check email
    const student = await Student.findOne({ email: normalizedEmail });
    if (!student) return res.status(400).json({ message: "Invalid email" });

    // Check password
    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid password" });

    // Create JWT token
    const token = jwt.sign({ id: student._id }, "secretKey", { expiresIn: "1d" });
    const profile = await StudentProfile.findOne({ email: normalizedEmail });

    res.json({ token, student, profile });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
