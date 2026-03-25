const Student = require("../models/s_registerModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// REGISTER
exports.registerStudent = async (req, res) => {
  try {
    const { firstName, lastName, address, contactNumber, email, password, confirmPassword } = req.body;

    // Check all required fields
    if (!firstName || !lastName || !address || !contactNumber || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Contact number validation
    if (!/^\d{10}$/.test(contactNumber)) {
      return res.status(400).json({ message: "Contact number must be 10 digits" });
    }

    // Email already exists
    const existing = await Student.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already registered" });

    // Password strength validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ 
        message: "Password must be at least 8 characters, include uppercase, lowercase, and number" 
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
      email,
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
    const { email, password } = req.body;

    // Check email
    const student = await Student.findOne({ email });
    if (!student) return res.status(400).json({ message: "Invalid email" });

    // Check password
    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid password" });

    // Create JWT token
    const token = jwt.sign(
      { id: student._id },
      process.env.JWT_SECRET || "secretKey",
      { expiresIn: "1d" }
    );

    res.json({ token, student });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
