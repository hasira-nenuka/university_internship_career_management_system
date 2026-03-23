const Student = require('../models/C_studentModel');
const Internship = require('../models/C_internshipModel');
const Application = require('../models/C_applicationModel');

// Calculate match score between student and internship
const calculateMatchScore = (student, internship) => {
    let score = 0;
    let maxScore = 0;
    
    // 1. Skills matching (40%)
    const studentSkills = student.skills ? student.skills.map(s => s.toLowerCase()) : [];
    const requiredSkills = internship.skills.map(s => s.toLowerCase());
    
    if (requiredSkills.length > 0) {
        const matchedSkills = requiredSkills.filter(skill => 
            studentSkills.includes(skill)
        );
        const skillScore = (matchedSkills.length / requiredSkills.length) * 40;
        score += skillScore;
        maxScore += 40;
    }
    
    // 2. Education matching (20%)
    if (student.course && internship.requirements.some(req => 
        req.toLowerCase().includes(student.course.toLowerCase())
    )) {
        score += 20;
    }
    maxScore += 20;
    
    // 3. Experience matching (20%)
    if (student.experience && student.experience.length > 0) {
        const expScore = Math.min(student.experience.length * 5, 20);
        score += expScore;
    }
    maxScore += 20;
    
    // 4. Availability matching (20%)
    if (internship.duration && student.year >= 3) {
        score += 20;
    }
    maxScore += 20;
    
    // Calculate final percentage
    return maxScore > 0 ? (score / maxScore) * 100 : 0;
};

// @desc    Get recommended students for an internship
// @route   GET /api/matching/recommendations/:internshipId
// @access  Private/Company
const getRecommendedStudents = async (req, res) => {
    try {
        const { internshipId } = req.params;
        
        // Get the internship
        const internship = await Internship.findById(internshipId);
        if (!internship) {
            return res.status(404).json({ success: false, message: 'Internship not found' });
        }
        
        // Get all students
        const students = await Student.find({ isActive: true });
        
        // Calculate match scores for each student
        const recommendations = students.map(student => ({
            student,
            matchScore: calculateMatchScore(student, internship),
            internship: internship
        }));
        
        // Filter and sort by match score
        const filteredRecommendations = recommendations
            .filter(rec => rec.matchScore >= 30)
            .sort((a, b) => b.matchScore - a.matchScore)
            .slice(0, 20); // Limit to top 20
        
        res.json({
            success: true,
            count: filteredRecommendations.length,
            data: filteredRecommendations
        });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get match summary for a student and internship
// @route   GET /api/matching/summary/:studentId/:internshipId
// @access  Private/Company
const getMatchSummary = async (req, res) => {
    try {
        const { studentId, internshipId } = req.params;
        
        const student = await Student.findById(studentId);
        const internship = await Internship.findById(internshipId);
        
        if (!student || !internship) {
            return res.status(404).json({ 
                success: false, 
                message: 'Student or Internship not found' 
            });
        }
        
        const matchScore = calculateMatchScore(student, internship);
        
        // Detailed match analysis
        const studentSkills = student.skills ? student.skills.map(s => s.toLowerCase()) : [];
        const requiredSkills = internship.skills.map(s => s.toLowerCase());
        const matchedSkills = requiredSkills.filter(skill => 
            studentSkills.includes(skill)
        );
        const missingSkills = requiredSkills.filter(skill => 
            !studentSkills.includes(skill)
        );
        
        // Generate recommendations
        const recommendations = [];
        
        if (matchScore < 70) {
            if (missingSkills.length > 0) {
                recommendations.push({
                    area: 'Skills',
                    message: `Consider adding these skills: ${missingSkills.slice(0, 3).join(', ')}`,
                    priority: 'high'
                });
            }
            
            if (!student.experience || student.experience.length < 1) {
                recommendations.push({
                    area: 'Experience',
                    message: 'Gain relevant experience through projects, coursework, or personal projects',
                    priority: 'medium'
                });
            }
            
            if (student.year < 3) {
                recommendations.push({
                    area: 'Timing',
                    message: 'Consider applying in your 3rd or 4th year for better opportunities',
                    priority: 'low'
                });
            }
        }
        
        const summary = {
            matchScore,
            matchLevel: matchScore >= 80 ? 'Excellent Match' : matchScore >= 60 ? 'Good Match' : matchScore >= 40 ? 'Potential Match' : 'Low Match',
            skills: {
                studentSkills: student.skills || [],
                requiredSkills: internship.skills,
                matchedSkills,
                missingSkills,
                matchPercentage: requiredSkills.length > 0 ? (matchedSkills.length / requiredSkills.length) * 100 : 0
            },
            education: {
                studentCourse: student.course,
                studentUniversity: student.university,
                studentYear: student.year,
                isRelevant: internship.requirements.some(req => 
                    req.toLowerCase().includes(student.course?.toLowerCase() || '')
                )
            },
            experience: {
                years: student.experience?.length || 0,
                hasExperience: (student.experience?.length || 0) > 0,
                details: student.experience || []
            },
            recommendations,
            strengths: [
                ...(matchedSkills.length > 0 ? [`Strong skills in ${matchedSkills.slice(0, 3).join(', ')}`] : []),
                ...(student.experience?.length > 0 ? ['Relevant experience'] : []),
                ...(student.year >= 3 ? ['Good timing for internship'] : [])
            ],
            areasForImprovement: missingSkills.slice(0, 3)
        };
        
        res.json({ success: true, data: summary });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get match score for application
// @route   GET /api/matching/application/:applicationId
// @access  Private/Company
const getApplicationMatchScore = async (req, res) => {
    try {
        const application = await Application.findById(req.params.applicationId)
            .populate('studentId')
            .populate('internshipId');
        
        if (!application) {
            return res.status(404).json({ success: false, message: 'Application not found' });
        }
        
        const matchScore = calculateMatchScore(application.studentId, application.internshipId);
        
        // Update application with match score
        application.matchScore = matchScore;
        await application.save();
        
        res.json({
            success: true,
            data: {
                matchScore,
                student: application.studentId,
                internship: application.internshipId
            }
        });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getRecommendedStudents,
    getMatchSummary,
    getApplicationMatchScore,
    calculateMatchScore
};