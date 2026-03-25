const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/adminModel');

const sanitizeAdmin = (adminDoc) => ({
  _id: adminDoc._id,
  fullName: adminDoc.fullName,
  email: adminDoc.email,
  role: adminDoc.role,
  department: adminDoc.department,
  status: adminDoc.status,
  createdAt: adminDoc.createdAt,
  updatedAt: adminDoc.updatedAt,
});

const validateAdminPayload = ({ fullName, email, password, role }) => {
  if (!fullName || !fullName.trim()) {
    return 'Full name is required';
  }

  if (!email || !email.trim()) {
    return 'Email is required';
  }

  if (!password || !password.trim()) {
    return 'Password is required';
  }

  if (!role || !role.trim()) {
    return 'Role is required';
  }

  return null;
};

exports.createAdmin = async (req, res) => {
  try {
    const adminCount = await Admin.countDocuments();

    if (
      adminCount > 0 &&
      (!req.admin || !['Super Admin', 'Admin Manager'].includes(req.admin.role))
    ) {
      return res.status(403).json({ success: false, message: 'Only Super Admin or Admin Manager can create admins' });
    }

    const validationError = validateAdminPayload(req.body);
    if (validationError) {
      return res.status(400).json({ success: false, message: validationError });
    }

    const normalizedEmail = req.body.email.trim().toLowerCase();
    const existingAdmin = await Admin.findOne({ email: normalizedEmail });

    if (existingAdmin) {
      return res.status(400).json({ success: false, message: 'Admin email already exists' });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const admin = await Admin.create({
      fullName: req.body.fullName.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: adminCount === 0 ? 'Super Admin' : req.body.role.trim(),
      department: req.body.department?.trim() || 'Admin Management',
      status: req.body.status || 'Active',
    });

    return res.status(201).json({
      success: true,
      data: {
        ...sanitizeAdmin(admin),
        password: req.body.password,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const admin = await Admin.findOne({ email: email.trim().toLowerCase() });
    if (!admin) {
      return res.status(400).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET || 'adminSecretKey',
      { expiresIn: '1d' }
    );

    return res.status(200).json({
      success: true,
      token,
      data: sanitizeAdmin(admin),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAdmins = async (req, res) => {
  try {
    const admins = await Admin.find().sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      data: admins.map(sanitizeAdmin),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAdmin = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }

    return res.status(200).json({ success: true, data: sanitizeAdmin(admin) });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateAdmin = async (req, res) => {
  try {
    const updates = {
      ...(req.body.fullName ? { fullName: req.body.fullName.trim() } : {}),
      ...(req.body.email ? { email: req.body.email.trim().toLowerCase() } : {}),
      ...(req.body.role ? { role: req.body.role.trim() } : {}),
      ...(req.body.department ? { department: req.body.department.trim() } : {}),
      ...(req.body.status ? { status: req.body.status } : {}),
    };

    if (req.body.password && req.body.password.trim()) {
      updates.password = await bcrypt.hash(req.body.password, 10);
    }

    const admin = await Admin.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }

    return res.status(200).json({
      success: true,
      data: sanitizeAdmin(admin),
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateAdminRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!role || !role.trim()) {
      return res.status(400).json({ success: false, message: 'Role is required' });
    }

    const admin = await Admin.findByIdAndUpdate(
      req.params.id,
      { role: role.trim() },
      { new: true, runValidators: true }
    );

    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }

    return res.status(200).json({
      success: true,
      data: sanitizeAdmin(admin),
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteAdmin = async (req, res) => {
  try {
    const admin = await Admin.findByIdAndDelete(req.params.id);
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }

    return res.status(200).json({ success: true, message: 'Admin deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
