const express = require('express');
const router = express.Router();

const {
    registerCompany,
    loginCompany,
    getCompanyProfile,
    updateCompanyProfile,
    getAllCompanies
} = require('../controllers/c_companyController');

const { protectCompany } = require('../middleware/C_authMiddleware');

router.post('/register', registerCompany);
router.post('/login', loginCompany);
router.get('/', protectCompany, getAllCompanies);
router.get('/:id', protectCompany, getCompanyProfile);
router.put('/:id', protectCompany, updateCompanyProfile);

module.exports = router;
