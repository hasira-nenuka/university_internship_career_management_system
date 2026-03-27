const Company = require('../models/c_companyModel');
const { generateToken } = require('../middleware/C_authMiddleware');

const sendDatabaseUnavailable = (res) =>
    res.status(503).json({
        success: false,
        message: 'Database is currently unavailable. Start MongoDB or update backend/.env with a working MONGO_URI before logging in.'
    });

const isDatabaseUnavailableError = (error) => {
    const message = error?.message || '';

    return (
        message.includes('buffering timed out') ||
        message.includes('ECONNREFUSED') ||
        message.includes('MongoServerSelectionError') ||
        message.includes('Topology is closed')
    );
};

// @desc    Register a new company
// @route   POST /api/companies/register
// @access  Public
const registerCompany = async (req, res) => {
    try {
        const { companyName, email, password, phone, address, website, industry, companySize, description } = req.body;
        
        // Validate required fields
        if (!companyName || !email || !password || !phone || !address || !industry || !companySize || !description) {
            return res.status(400).json({ 
                success: false, 
                message: 'Please provide all required fields' 
            });
        }
        
        // Check if company already exists
        const companyExists = await Company.findOne({ $or: [{ email }, { companyName }] });
        if (companyExists) {
            return res.status(400).json({ 
                success: false, 
                message: companyExists.email === email ? 'Email already registered' : 'Company name already exists' 
            });
        }
        
        // Create company
        const company = await Company.create({
            companyName,
            email,
            password,
            phone,
            address,
            website,
            industry,
            companySize,
            description
        });
        
        // Generate token
        const token = generateToken(company._id);
        
        res.status(201).json({
            success: true,
            token,
            company: {
                _id: company._id,
                companyName: company.companyName,
                email: company.email,
                industry: company.industry,
                companySize: company.companySize,
                description: company.description
            }
        });
        
    } catch (error) {
        console.error('Registration error:', error);

        if (isDatabaseUnavailableError(error)) {
            return sendDatabaseUnavailable(res);
        }

        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Login company
// @route   POST /api/companies/login
// @access  Public
const loginCompany = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide email and password' });
        }
        
        // Check if company exists
        const company = await Company.findOne({ email }).select('+password');
        if (!company) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }
        
        // Check password
        const isPasswordMatch = await company.comparePassword(password);
        if (!isPasswordMatch) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }
        
        // Generate token
        const token = generateToken(company._id);
        
        res.json({
            success: true,
            token,
            company: {
                _id: company._id,
                companyName: company.companyName,
                email: company.email,
                industry: company.industry,
                companySize: company.companySize,
                description: company.description
            }
        });
        
    } catch (error) {
        console.error('Login error:', error);

        if (isDatabaseUnavailableError(error)) {
            return sendDatabaseUnavailable(res);
        }

        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get company profile
// @route   GET /api/companies/:id
// @access  Private/Company
const getCompanyProfile = async (req, res) => {
    try {
        const company = await Company.findById(req.params.id).select('-password');
        if (!company) {
            return res.status(404).json({ success: false, message: 'Company not found' });
        }
        
        res.json({ success: true, data: company });
        
    } catch (error) {
        console.error(error);

        if (isDatabaseUnavailableError(error)) {
            return sendDatabaseUnavailable(res);
        }

        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update company profile
// @route   PUT /api/companies/:id
// @access  Private/Company
const updateCompanyProfile = async (req, res) => {
    try {
        const company = await Company.findById(req.params.id);
        if (!company) {
            return res.status(404).json({ success: false, message: 'Company not found' });
        }
        
        const updatedCompany = await Company.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).select('-password');
        
        res.json({ success: true, data: updatedCompany });
        
    } catch (error) {
        console.error(error);

        if (isDatabaseUnavailableError(error)) {
            return sendDatabaseUnavailable(res);
        }

        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all companies (for admin)
// @route   GET /api/companies
// @access  Private/Admin
const getAllCompanies = async (req, res) => {
    try {
        const companies = await Company.find().select('-password').sort('-createdAt');
        res.json({ success: true, count: companies.length, data: companies });
    } catch (error) {
        console.error(error);

        if (isDatabaseUnavailableError(error)) {
            return sendDatabaseUnavailable(res);
        }

        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    registerCompany,
    loginCompany,
    getCompanyProfile,
    updateCompanyProfile,
    getAllCompanies
};
