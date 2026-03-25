const express = require('express');
const {
  createCompany,
  createInternship,
  createPayment,
  deleteCompany,
  deleteInternship,
  deletePayment,
  getCompanies,
  getInternships,
  getPayments,
  updateCompany,
  updateInternship,
  updatePayment,
} = require('../controllers/adminResourceController');
const { allowAdminRoles, protectAdmin } = require('../middleware/adminAuthMiddleware');

const router = express.Router();

const companyRoles = ['Super Admin', 'Company Manager'];
const internshipRoles = ['Super Admin', 'Internship Manager'];
const paymentRoles = ['Super Admin', 'Payment Manager'];

router.route('/companies')
  .get(protectAdmin, allowAdminRoles(...companyRoles), getCompanies)
  .post(protectAdmin, allowAdminRoles(...companyRoles), createCompany);

router.route('/companies/:id')
  .put(protectAdmin, allowAdminRoles(...companyRoles), updateCompany)
  .delete(protectAdmin, allowAdminRoles(...companyRoles), deleteCompany);

router.route('/internships')
  .get(protectAdmin, allowAdminRoles(...internshipRoles), getInternships)
  .post(protectAdmin, allowAdminRoles(...internshipRoles), createInternship);

router.route('/internships/:id')
  .put(protectAdmin, allowAdminRoles(...internshipRoles), updateInternship)
  .delete(protectAdmin, allowAdminRoles(...internshipRoles), deleteInternship);

router.route('/payments')
  .get(protectAdmin, allowAdminRoles(...paymentRoles), getPayments)
  .post(protectAdmin, allowAdminRoles(...paymentRoles), createPayment);

router.route('/payments/:id')
  .put(protectAdmin, allowAdminRoles(...paymentRoles), updatePayment)
  .delete(protectAdmin, allowAdminRoles(...paymentRoles), deletePayment);

module.exports = router;
