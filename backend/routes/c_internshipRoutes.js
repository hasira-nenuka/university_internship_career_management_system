const express = require('express');
const router = express.Router();
const {
    createInternship,
    getAllInternships,
    getInternshipById,
    getInternshipsByCompany,
    updateInternship,
    deleteInternship
} = require('../controllers/c_internshipController');
const { protectCompany } = require('../middleware/C_authMiddleware');

router.get('/', getAllInternships);
router.get('/company/:companyId', protectCompany, getInternshipsByCompany);
router.get('/:id', getInternshipById);
router.post('/', protectCompany, createInternship);
router.put('/:id', protectCompany, updateInternship);
router.delete('/:id', protectCompany, deleteInternship);

module.exports = router;
