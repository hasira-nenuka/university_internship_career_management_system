const express = require('express');
const {
  createAdmin,
  deleteAdmin,
  getAdmin,
  getAdmins,
  loginAdmin,
  updateAdmin,
  updateAdminRole,
} = require('../controllers/adminController');
const { allowAdminRoles, attachAdminIfPresent, protectAdmin } = require('../middleware/adminAuthMiddleware');

const router = express.Router();

router.post('/login', loginAdmin);

router.route('/')
  .get(protectAdmin, allowAdminRoles('Super Admin', 'Admin Manager'), getAdmins)
  .post(attachAdminIfPresent, createAdmin);

router.route('/:id')
  .get(protectAdmin, allowAdminRoles('Super Admin', 'Admin Manager'), getAdmin)
  .put(protectAdmin, allowAdminRoles('Super Admin', 'Admin Manager'), updateAdmin)
  .delete(protectAdmin, allowAdminRoles('Super Admin', 'Admin Manager'), deleteAdmin);

router.patch('/:id/role', protectAdmin, allowAdminRoles('Super Admin', 'Admin Manager'), updateAdminRole);

module.exports = router;
