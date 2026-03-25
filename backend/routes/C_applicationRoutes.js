const express = require('express');
const router = express.Router();
const {
    applyForInternship,
    getApplicationsByInternship,
    getApplicationsByStudent,
    updateApplicationStatus,
    getApplicationDetails
} = require('../controllers/C_applicationController');
const { protectCompany, protectStudent } = require('../middleware/C_authMiddleware');

router.post('/', protectStudent, applyForInternship);
router.get('/internship/:internshipId', protectCompany, getApplicationsByInternship);
router.get('/student/:studentId', protectStudent, getApplicationsByStudent);
router.get('/:id', protectCompany, getApplicationDetails);
router.put('/:id', protectCompany, updateApplicationStatus);

module.exports = router;