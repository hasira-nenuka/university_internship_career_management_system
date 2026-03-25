const jwt = require('jsonwebtoken');
const Company = require('../models/c_companyModel');

// Protect Company
const protectCompany = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];

            const decoded = jwt.verify(token, getJwtSecret());

            req.company = await Company.findById(decoded.id).select('-password');

            if (!req.company) {
                return res.status(401).json({ message: 'Company not found' });
            }

            next();
        } catch (error) {
            return res.status(401).json({ message: 'Token failed' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'No token' });
    }
};

const protectStudent = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];

            const decoded = jwt.verify(token, getJwtSecret());

            req.student = await Student.findById(decoded.id).select('-password');

            if (!req.student) {
                return res.status(401).json({ message: 'Student not found' });
            }

            next();
        } catch (error) {
            return res.status(401).json({ message: 'Token failed' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'No token' });
    }
};

// Generate Token
const generateToken = (id) => {
    return jwt.sign({ id }, getJwtSecret(), {
        expiresIn: '7d'
    });
};

module.exports = {
    protectCompany,
    protectStudent,
    generateToken
};
