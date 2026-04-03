const Application = require('../models/C_applicationModel');
const Internship = require('../models/c_internshipModel');
const Student = require('../models/C_studentModel');
const StudentProfile = require('../models/s_ProfileModel');
const { calculateMatchScore } = require('./C_matchingController');

const serializeProfileFile = (value) => {
    if (typeof value !== 'string') return value || '';
    const trimmed = value.trim();
    if (!trimmed) return '';
    if (/^https?:\/\//i.test(trimmed)) return trimmed;

    const normalized = trimmed.replace(/\\/g, '/');
    const uploadsIndex = normalized.toLowerCase().lastIndexOf('/uploads/');
    if (uploadsIndex >= 0) {
        return normalized.slice(uploadsIndex + '/uploads/'.length);
    }

    const uploadIndex = normalized.toLowerCase().lastIndexOf('/upload/');
    if (uploadIndex >= 0) {
        return normalized.slice(uploadIndex + '/upload/'.length);
    }

    return normalized.split('/').filter(Boolean).pop() || normalized;
};

const buildStudentSnapshot = (studentAccount, studentProfile) => {
    const accountFirstName = studentAccount?.firstName || studentAccount?.name?.split(' ')[0] || '';
    const accountLastName = studentAccount?.lastName || studentAccount?.name?.split(' ').slice(1).join(' ') || '';

    const firstName = studentProfile?.firstName || accountFirstName;
    const lastName = studentProfile?.lastName || accountLastName;
    const fullName = `${firstName} ${lastName}`.trim() || studentAccount?.name || '';

    return {
        firstName,
        lastName,
        fullName,
        email: studentProfile?.email || studentAccount?.email || '',
        contactNumber: studentProfile?.contactNumber || '',
        district: studentProfile?.district || '',
        province: studentProfile?.province || '',
        university: studentProfile?.university || '',
        degree: studentProfile?.degree || '',
        eduLevel: studentProfile?.eduLevel || '',
        preferredField: studentProfile?.preferredField || '',
        frontendSkills: Array.isArray(studentProfile?.frontendSkills) ? studentProfile.frontendSkills : [],
        backendSkills: Array.isArray(studentProfile?.backendSkills) ? studentProfile.backendSkills : [],
        databaseSkills: Array.isArray(studentProfile?.databaseSkills) ? studentProfile.databaseSkills : [],
        cv: serializeProfileFile(studentProfile?.cv),
        profileImage: serializeProfileFile(studentProfile?.profileImage),
        bio: studentProfile?.bio || ''
    };
};

const formatApplicationForCompany = (application) => {
    const snapshot = application.studentSnapshot || {};

    return {
        ...application.toObject(),
        student: {
            id: application.studentId?._id || application.studentId || null,
            profileId: application.studentProfileId?._id || application.studentProfileId || null,
            name: snapshot.fullName || application.studentId?.name || 'Student',
            email: snapshot.email || application.studentId?.email || '',
            university: snapshot.university || '',
            degree: snapshot.degree || '',
            eduLevel: snapshot.eduLevel || '',
            preferredField: snapshot.preferredField || '',
            contactNumber: snapshot.contactNumber || '',
            district: snapshot.district || '',
            province: snapshot.province || '',
            frontendSkills: snapshot.frontendSkills || [],
            backendSkills: snapshot.backendSkills || [],
            databaseSkills: snapshot.databaseSkills || [],
            profileImage: snapshot.profileImage || '',
            cv: snapshot.cv || '',
            bio: snapshot.bio || ''
        }
    };
};

const formatApplicationForStudent = (application) => {
    return {
        ...application.toObject(),
        companyName: application.internshipId?.companyId?.companyName || 'Company',
        companyLogo: application.internshipId?.companyId?.logo || '',
        internshipTitle: application.internshipId?.title || '',
        displayStatus: application.status === 'accepted' ? 'hired' : application.status
    };
};

// @desc    Apply for internship
// @route   POST /api/applications
// @access  Private/Student
const applyForInternship = async (req, res) => {
    try {
        const { internshipId, coverLetter, resume } = req.body;
        const studentId = req.student?._id;

        if (!internshipId || !studentId) {
            return res.status(400).json({
                success: false,
                message: 'Internship and authenticated student are required'
            });
        }
        
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
        const studentProfile = await StudentProfile.findOne({ email: student?.email || '' });
        
        if (!internship || !student) {
            return res.status(404).json({ success: false, message: 'Internship or Student not found' });
        }
        
        // Calculate match score
        const matchScore = calculateMatchScore(student, internship);
        
        // Create application
        const application = await Application.create({
            internshipId,
            studentId,
            studentProfileId: studentProfile?._id || null,
            studentSnapshot: buildStudentSnapshot(student, studentProfile),
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
            .populate('studentId', 'firstName lastName email contactNumber')
            .populate('studentProfileId')
            .sort('-appliedAt');
        
        res.json({
            success: true,
            count: applications.length,
            data: applications.map(formatApplicationForCompany)
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
        if (String(req.student?._id) !== String(req.params.studentId)) {
            return res.status(403).json({ success: false, message: 'Not authorized to view these applications' });
        }

        const applications = await Application.find({ studentId: req.params.studentId })
            .populate({
                path: 'internshipId',
                select: 'title companyId location type status',
                populate: {
                    path: 'companyId',
                    select: 'companyName logo'
                }
            })
            .sort('-appliedAt');
        
        res.json({
            success: true,
            count: applications.length,
            data: applications.map(formatApplicationForStudent)
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
        const normalizedStatus = status === 'hired' ? 'accepted' : status;
        const allowedStatuses = ['pending', 'reviewed', 'shortlisted', 'accepted', 'rejected'];

        if (!allowedStatuses.includes(normalizedStatus)) {
            return res.status(400).json({ success: false, message: 'Invalid application status' });
        }
        
        const application = await Application.findById(req.params.id);
        if (!application) {
            return res.status(404).json({ success: false, message: 'Application not found' });
        }
        
        application.status = normalizedStatus;
        if (notes) application.notes = notes;
        if (normalizedStatus === 'reviewed') application.reviewedAt = Date.now();
        
        await application.save();
        
        res.json({
            success: true,
            data: application,
            message: `Application ${normalizedStatus} successfully`
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
            .populate('studentId', 'firstName lastName email contactNumber')
            .populate('studentProfileId')
            .populate('internshipId', 'title companyId location type duration stipend');
        
        if (!application) {
            return res.status(404).json({ success: false, message: 'Application not found' });
        }
        
        res.json({ success: true, data: formatApplicationForCompany(application) });
        
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
