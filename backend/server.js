const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');

dotenv.config();

const app = express();

const isAllowedOrigin = (origin) => {
    if (!origin) return true;

    try {
        const { hostname } = new URL(origin);
        return (
            hostname === 'localhost' ||
            hostname === '127.0.0.1' ||
            hostname === '0.0.0.0' ||
            hostname.endsWith('.local') ||
            /^192\.168\.\d{1,3}\.\d{1,3}$/.test(hostname) ||
            /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname) ||
            /^172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}$/.test(hostname)
        );
    } catch (error) {
        return false;
    }
};

app.use(cors({
    origin: (origin, callback) => {
        if (isAllowedOrigin(origin)) {
            return callback(null, true);
        }

        return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/upload', express.static(path.join(__dirname, 'upload')));

app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/students', require('./routes/s_registerRoutes'));
app.use('/api/profiles', require('./routes/s_ProfileRoutes'));
app.use('/api/company', require('./routes/c_companyRoutes'));
app.use('/api/internships', require('./routes/c_internshipRoutes'));
app.use('/api/upload', require('./routes/c_uploadRoutes'));
app.use('/api/payments', require('./routes/p_paymentRoutes'));
app.use('/api/pro-accounts', require('./routes/p_proAccountRoutes'));
app.use('/api/applications', require('./routes/C_applicationRoutes'));
app.use('/api/matching', require('./routes/C_matchingRoutes'));
app.use('/api/interviews', require('./routes/interviewScheduleRoutes'));
app.use('/api/interview-schedules', require('./routes/interviewScheduleRoutes'));
app.use('/api/interviewSchedule', require('./routes/interviewScheduleRoutes'));
app.use('/api/company-tasks', require('./routes/C_taskRoutes'));
app.use('/api/admins', require('./routes/adminRoutes'));
app.use('/api/admin-resources', require('./routes/adminResourceRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));

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
