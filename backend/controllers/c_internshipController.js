const Internship = require('../models/c_internshipModel');
const Company = require('../models/c_companyModel');
const { ensureProAccess } = require('./p_proAccountController');

// @desc    Create new internship
// @route   POST /api/internships
// @access  Private/Company
const createInternship = async (req, res) => {
    try {
        const {
            title,
            description,
            requirements,
            skills,
            location,
            type,
            duration,
            stipend,
            openings,
            deadline,
            images
        } = req.body;

        const companyId = req.company?._id;
        
        // Verify company exists
        const company = await Company.findById(companyId);
        if (!company) {
            return res.status(404).json({ success: false, message: 'Company not found' });
        }

        const proAccess = await ensureProAccess(companyId);
        const isProActive = Boolean(proAccess.allowed);
        
        const internship = await Internship.create({
            companyId,
            title,
            description,
            requirements,
            skills,
            location,
            type,
            duration,
            stipend,
            openings,
            deadline,
            images,
            paymentVerificationStatus: isProActive ? 'verified' : 'pending',
            paymentVerifiedAt: isProActive ? new Date() : null
        });
        
        res.status(201).json({ success: true, data: internship });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all internships
// @route   GET /api/internships
// @access  Public
const getAllInternships = async (req, res) => {
    try {
        const { status, type, location, search } = req.query;
        
        let query = {};
        
        if (status) query.status = status;
        if (type) query.type = type;
        if (location) query.location = { $regex: location, $options: 'i' };
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { skills: { $regex: search, $options: 'i' } }
            ];
        }
        
        const internships = await Internship.find(query)
            .populate('companyId', 'companyName logo industry')
            .sort('-createdAt');
        
        res.json({ success: true, count: internships.length, data: internships });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get single internship
// @route   GET /api/internships/:id
// @access  Public
const getInternshipById = async (req, res) => {
    try {
        const internship = await Internship.findById(req.params.id)
            .populate('companyId', 'companyName logo industry description');
        
        if (!internship) {
            return res.status(404).json({ success: false, message: 'Internship not found' });
        }
        
        res.json({ success: true, data: internship });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get internships by company
// @route   GET /api/internships/company/:companyId
// @access  Private/Company
const getInternshipsByCompany = async (req, res) => {
    try {
        const internships = await Internship.find({ companyId: req.params.companyId })
            .sort('-createdAt');
        
        res.json({ success: true, count: internships.length, data: internships });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update internship
// @route   PUT /api/internships/:id
// @access  Private/Company
const updateInternship = async (req, res) => {
    try {
        let internship = await Internship.findById(req.params.id);
        
        if (!internship) {
            return res.status(404).json({ success: false, message: 'Internship not found' });
        }

        const companyId = req.company?._id?.toString();
        if (!companyId || internship.companyId.toString() !== companyId) {
            return res.status(403).json({ success: false, message: 'Not allowed to update this internship' });
        }

        const proAccess = await ensureProAccess(companyId);
        const isProActive = Boolean(proAccess.allowed);

        const updateData = {
            ...req.body,
            companyId: internship.companyId,
            ...(isProActive ? { paymentVerificationStatus: 'verified', paymentVerifiedAt: new Date() } : {})
        };
        
        internship = await Internship.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );
        
        res.json({ success: true, data: internship });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete internship
// @route   DELETE /api/internships/:id
// @access  Private/Company
const deleteInternship = async (req, res) => {
    try {
        const internship = await Internship.findById(req.params.id);
        
        if (!internship) {
            return res.status(404).json({ success: false, message: 'Internship not found' });
        }

        const companyId = req.company?._id?.toString();
        if (!companyId || internship.companyId.toString() !== companyId) {
            return res.status(403).json({ success: false, message: 'Not allowed to delete this internship' });
        }
        
        await internship.remove();
        
        res.json({ success: true, message: 'Internship deleted successfully' });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    createInternship,
    getAllInternships,
    getInternshipById,
    getInternshipsByCompany,
    updateInternship,
    deleteInternship
};
