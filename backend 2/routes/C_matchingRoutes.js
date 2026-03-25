const express = require('express');
const router = express.Router();
const {
    getRecommendedStudents,
    getMatchSummary,
    getApplicationMatchScore
} = require('../controllers/C_matchingController');
const { protectCompany } = require('../middleware/C_authMiddleware');

router.get('/recommendations/:internshipId', protectCompany, getRecommendedStudents);
router.get('/summary/:studentId/:internshipId', protectCompany, getMatchSummary);
router.get('/application/:applicationId', protectCompany, getApplicationMatchScore);

module.exports = router;