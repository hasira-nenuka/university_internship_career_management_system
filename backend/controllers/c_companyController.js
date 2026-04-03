const Company = require('../models/c_companyModel');
const { generateToken } = require('../middleware/C_authMiddleware');
const mongoose = require('mongoose');
const StudentProfile = require('../models/s_ProfileModel');
const { ensureProAccess } = require('./p_proAccountController');

const isDatabaseConnected = () => mongoose.connection.readyState === 1;

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
                description: company.description,
                logo: company.logo
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
                description: company.description,
                logo: company.logo
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

const CATEGORY_KEYWORDS = {
    'Frontend Developer': ['frontend', 'react', 'javascript', 'html', 'css', 'ui', 'ux'],
    'Backend Developer': ['backend', 'node', 'python', 'java', 'php', 'api', 'server'],
    'Full Stack Developer': ['frontend', 'backend', 'full stack', 'react', 'node'],
    'Mobile App Developer': ['mobile', 'flutter', 'react native', 'android', 'ios'],
    'QA Engineer': ['qa', 'tester', 'testing'],
    'Software Tester': ['tester', 'testing', 'qa'],
    'Automation Tester': ['automation', 'selenium', 'cypress', 'playwright'],
    'DevOps Engineer': ['devops', 'docker', 'kubernetes', 'ci/cd', 'aws'],
    'Cloud Engineer': ['cloud', 'aws', 'azure', 'gcp'],
    'System Administrator': ['system admin', 'sysadmin', 'network', 'linux'],
    'Data Analyst': ['data', 'sql', 'excel', 'power bi', 'tableau', 'analytics'],
    'Data Scientist': ['data science', 'machine learning', 'python', 'statistics'],
    'Machine Learning Engineer': ['machine learning', 'ai', 'python', 'tensorflow', 'pytorch'],
    'UI/UX Designer': ['ui', 'ux', 'figma', 'design', 'prototype'],
    'Project Manager': ['project management', 'agile', 'scrum', 'planning'],
    'Product Manager': ['product', 'roadmap', 'strategy'],
    'Business Analyst': ['business', 'analysis', 'requirements'],
    'Cybersecurity Analyst': ['security', 'cyber', 'penetration', 'risk']
};

const buildCategoryMatchScore = (profile, category) => {
    const searchableText = [
        profile.preferredField,
        ...(profile.frontendSkills || []),
        ...(profile.backendSkills || []),
        ...(profile.databaseSkills || []),
        profile.degree,
        profile.bio
    ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

    const keywords = CATEGORY_KEYWORDS[category] || [String(category || '').toLowerCase()];
    const hitCount = keywords.filter((keyword) => searchableText.includes(keyword.toLowerCase())).length;
    const preferredHit = profile.preferredField && profile.preferredField.toLowerCase().includes(String(category || '').toLowerCase());

    return Math.min(100, (preferredHit ? 60 : 0) + hitCount * 15 + (searchableText.includes(String(category || '').toLowerCase()) ? 20 : 0));
};

// @desc    Search student profiles for company shortlist/recommendations
// @route   GET /api/company/:companyId/search-students
// @access  Private/Company (Pro Account)
const searchStudents = async (req, res) => {
    try {
        if (!isDatabaseConnected()) {
            return sendDatabaseUnavailable(res);
        }

        const { companyId } = req.params;
        const { category, district } = req.query;

        if (!mongoose.Types.ObjectId.isValid(companyId)) {
            return res.status(400).json({ success: false, message: 'Invalid companyId' });
        }

        if (!req.company || req.company._id.toString() !== companyId) {
            return res.status(403).json({ success: false, message: 'Not authorized to search for this company' });
        }

        const proAccess = await ensureProAccess(companyId);
        if (!proAccess.allowed) {
            return res.status(403).json({ success: false, message: 'Pro account required for student search' });
        }

        if (!category || !district) {
            return res.status(400).json({ success: false, message: 'Category and district are required' });
        }

        const districtRegex = new RegExp(`^${String(district).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
        const profiles = await StudentProfile.find({ district: districtRegex }).sort({ createdAt: -1 });

        const matchedStudents = profiles
            .map((profile) => {
                const matchScore = buildCategoryMatchScore(profile, category);
                const matchedKeywords = (CATEGORY_KEYWORDS[category] || [])
                    .filter((keyword) => [
                        profile.preferredField,
                        ...(profile.frontendSkills || []),
                        ...(profile.backendSkills || []),
                        ...(profile.databaseSkills || []),
                        profile.degree,
                        profile.bio
                    ].filter(Boolean).join(' ').toLowerCase().includes(keyword.toLowerCase()));

                return {
                    ...profile.toObject(),
                    matchScore,
                    recommendationDetails: {
                        category,
                        district,
                        matchedKeywords,
                        reasons: [
                            profile.district ? 'District matches the selected area' : 'District not listed',
                            profile.preferredField ? `Preferred field: ${profile.preferredField}` : 'No preferred field selected',
                            matchedKeywords.length > 0 ? `Relevant keywords: ${matchedKeywords.slice(0, 4).join(', ')}` : 'No keyword overlap found'
                        ]
                    }
                };
            })
            .filter((profile) => profile.matchScore > 0)
            .sort((a, b) => b.matchScore - a.matchScore);

        return res.json({
            success: true,
            count: matchedStudents.length,
            filters: { category, district },
            data: matchedStudents
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    registerCompany,
    loginCompany,
    getCompanyProfile,
    updateCompanyProfile,
    getAllCompanies,
    searchStudents
};
