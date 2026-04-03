const express = require('express');
const {
  createCompanyReview,
  createStudentReview,
  deleteReview,
  getAllReviews,
  getCompanyReviews,
  getStudentReviews,
  replyToReview,
  updateReviewStatus,
} = require('../controllers/reviewController');
const { protectCompany, protectStudent } = require('../middleware/C_authMiddleware');
const { allowAdminRoles, protectAdmin } = require('../middleware/adminAuthMiddleware');

const router = express.Router();

router.get('/company', protectCompany, getCompanyReviews);
router.post('/company', protectCompany, createCompanyReview);

router.get('/student', protectStudent, getStudentReviews);
router.post('/student', protectStudent, createStudentReview);

router.get('/', protectAdmin, allowAdminRoles('Super Admin', 'Review Admin'), getAllReviews);
router.patch('/:id/reply', protectAdmin, allowAdminRoles('Super Admin', 'Review Admin'), replyToReview);
router.patch('/:id/status', protectAdmin, allowAdminRoles('Super Admin', 'Review Admin'), updateReviewStatus);
router.delete('/:id', protectAdmin, allowAdminRoles('Super Admin', 'Review Admin'), deleteReview);

module.exports = router;
