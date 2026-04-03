const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const Student = require('./models/s_registerModel');

dotenv.config();

const resetStudent = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/internship_system');
        console.log('Connected to DB');
        
        const hash = await bcrypt.hash('Testing1', 10);
        await Student.updateOne({ email: 'kavishka123@gmail.com' }, { password: hash });
        console.log('Password reset to Testing1 for kavishka123@gmail.com');
        
        await mongoose.disconnect();
    } catch (error) { console.error(error); }
};

resetStudent();
