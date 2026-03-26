const express = require('express');
const {
  createCompanyReview,
  deleteReview,
  getAllReviews,
  getCompanyReviews,
  replyToReview,
  updateReviewStatus,
} = require('../controllers/reviewController');
const { protectCompany } = require('../middleware/C_authMiddleware');
const { allowAdminRoles, protectAdmin } = require('../middleware/adminAuthMiddleware');

const router = express.Router();

router.get('/company', protectCompany, getCompanyReviews);
router.post('/company', protectCompany, createCompanyReview);

router.get('/', protectAdmin, allowAdminRoles('Super Admin', 'Review Admin'), getAllReviews);
router.patch('/:id/reply', protectAdmin, allowAdminRoles('Super Admin', 'Review Admin'), replyToReview);
router.patch('/:id/status', protectAdmin, allowAdminRoles('Super Admin', 'Review Admin'), updateReviewStatus);
router.delete('/:id', protectAdmin, allowAdminRoles('Super Admin', 'Review Admin'), deleteReview);

module.exports = router;
