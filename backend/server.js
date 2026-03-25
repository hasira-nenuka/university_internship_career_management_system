const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');

dotenv.config();

const app = express();

app.use(cors({
    origin: ['http://localhost:3000'],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/students', require('./routes/s_registerRoutes'));
app.use('/api/company', require('./routes/c_companyRoutes'));
app.use('/api/internships', require('./routes/c_internshipRoutes'));
app.use('/api/upload', require('./routes/c_uploadRoutes'));
app.use('/api/payments', require('./routes/p_paymentRoutes'));
app.use('/api/pro-accounts', require('./routes/p_proAccountRoutes'));
app.use('/api/applications', require('./routes/C_applicationRoutes'));
app.use('/api/matching', require('./routes/C_matchingRoutes'));
app.use('/api/company-tasks', require('./routes/C_taskRoutes'));
app.use('/api/admins', require('./routes/adminRoutes'));
app.use('/api/admin-resources', require('./routes/adminResourceRoutes'));

app.get('/', (req, res) => {
    res.json({
        message: 'StepIn Internship Management API',
        status: 'running'
    });
});

app.get('/health', (req, res) => {
    res.json({ status: 'OK' });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: err.message });
});

app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    await connectDB();

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
};

startServer();
