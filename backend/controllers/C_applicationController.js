const Application = require('../models/C_applicationModel');
const Internship = require('../models/c_internshipModel');
const Student = require('../models/C_studentModel');
const { calculateMatchScore } = require('./C_matchingController');

// @desc    Apply for internship
// @route   POST /api/applications
// @access  Private/Student
const applyForInternship = async (req, res) => {
    try {
        const { internshipId, studentId, coverLetter, resume } = req.body;
        
        // Check if already applied
        const existingApplication = await Application.findOne({ internshipId, studentId });
        if (existingApplication) {
            return res.status(400).json({ 
                success: false, 
                message: 'You have already applied for this internship' 
            });
        }
        
        // Get internship and student
        const internship = await Internship.findById(internshipId);
        const student = await Student.findById(studentId);
        
        if (!internship || !student) {
            return res.status(404).json({ success: false, message: 'Internship or Student not found' });
        }
        
        // Calculate match score
        const matchScore = calculateMatchScore(student, internship);
        
        // Create application
        const application = await Application.create({
            internshipId,
            studentId,
            coverLetter,
            resume,
            matchScore
        });
        
        // Add application to internship
        internship.applications.push(application._id);
        await internship.save();
        
        res.status(201).json({
            success: true,
            data: application,
            message: 'Application submitted successfully'
        });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get applications for an internship
// @route   GET /api/applications/internship/:internshipId
// @access  Private/Company
const getApplicationsByInternship = async (req, res) => {
    try {
        const applications = await Application.find({ internshipId: req.params.internshipId })
            .populate('studentId', 'name email university course skills')
            .sort('-appliedAt');
        
        res.json({
            success: true,
            count: applications.length,
            data: applications
        });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get applications by student
// @route   GET /api/applications/student/:studentId
// @access  Private/Student
const getApplicationsByStudent = async (req, res) => {
    try {
        const applications = await Application.find({ studentId: req.params.studentId })
            .populate('internshipId', 'title companyId location type status')
            .sort('-appliedAt');
        
        res.json({
            success: true,
            count: applications.length,
            data: applications
        });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update application status
// @route   PUT /api/applications/:id
// @access  Private/Company
const updateApplicationStatus = async (req, res) => {
    try {
        const { status, notes } = req.body;
        
        const application = await Application.findById(req.params.id);
        if (!application) {
            return res.status(404).json({ success: false, message: 'Application not found' });
        }
        
        application.status = status;
        if (notes) application.notes = notes;
        if (status === 'reviewed') application.reviewedAt = Date.now();
        
        await application.save();
        
        res.json({
            success: true,
            data: application,
            message: `Application ${status} successfully`
        });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get application details
// @route   GET /api/applications/:id
// @access  Private
const getApplicationDetails = async (req, res) => {
    try {
        const application = await Application.findById(req.params.id)
            .populate('studentId', 'name email university course skills experience')
            .populate('internshipId', 'title companyId location type duration stipend');
        
        if (!application) {
            return res.status(404).json({ success: false, message: 'Application not found' });
        }
        
        res.json({ success: true, data: application });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    applyForInternship,
    getApplicationsByInternship,
    getApplicationsByStudent,
    updateApplicationStatus,
    getApplicationDetails
};