const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Student = require('./models/s_registerModel');

dotenv.config();

const listStudents = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/internship_system');
        console.log('Connected to DB');
        
        const students = await Student.find({}, { email: 1 }).lean();
        console.log('Students:', students.map(s => s.email));
        
        await mongoose.disconnect();
    } catch (error) { console.error(error); }
};

listStudents();
