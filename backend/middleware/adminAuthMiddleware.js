const jwt = require('jsonwebtoken');
const Admin = require('../models/adminModel');

exports.protectAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';

    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'adminSecretKey');
    const admin = await Admin.findById(decoded.id);

    if (!admin) {
      return res.status(401).json({ success: false, message: 'Admin not found' });
    }

    req.admin = {
      id: admin._id,
      role: admin.role,
      email: admin.email,
    };

    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

exports.attachAdminIfPresent = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';

    if (!authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'adminSecretKey');
    const admin = await Admin.findById(decoded.id);

    if (admin) {
      req.admin = {
        id: admin._id,
        role: admin.role,
        email: admin.email,
      };
    }

    return next();
  } catch (error) {
    return next();
  }
};

exports.allowAdminRoles = (...roles) => (req, res, next) => {
  if (!req.admin || !roles.includes(req.admin.role)) {
    return res.status(403).json({ success: false, message: 'Access denied for this role' });
  }

  next();
};
