const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const studentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: 6,
        select: false
    },
    university: {
        type: String,
        required: [true, 'University is required']
    },
    course: {
        type: String,
        required: [true, 'Course is required']
    },
    year: {
        type: Number,
        required: [true, 'Year of study is required'],
        min: 1,
        max: 4
    },
    skills: [{
        type: String,
        trim: true
    }],
    experience: [{
        title: String,
        company: String,
        duration: String,
        description: String
    }],
    education: {
        degree: String,
        university: String,
        graduationYear: Number,
        cgpa: Number
    },
    resume: {
        type: String,
        default: ''
    },
    profilePicture: {
        type: String,
        default: ''
    },
    phone: {
        type: String
    },
    location: {
        type: String
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Hash password before saving
studentSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Compare password method
studentSchema.methods.comparePassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Student', studentSchema);