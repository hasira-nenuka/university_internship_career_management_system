const express = require('express');
const router = express.Router();
const {
    getCompanyInterviewSchedules,
    getStudentInterviewSchedules,
    saveInterviewSchedule,
    updateInterviewSchedule,
    deleteInterviewSchedule
} = require('../controllers/interviewScheduleController');
const { protectCompany, protectStudent } = require('../middleware/C_authMiddleware');

router.get('/company', protectCompany, getCompanyInterviewSchedules);
router.get('/student', protectStudent, getStudentInterviewSchedules);
router.post('/', protectCompany, saveInterviewSchedule);
router.put('/:id', protectCompany, updateInterviewSchedule);
router.delete('/:id', protectCompany, deleteInterviewSchedule);

module.exports = router;
