const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

const app = express();

// Body parser
app.use(express.json());
<<<<<<< Updated upstream
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use("/api/students", require('./routes/s_registerRoutes'));
app.use("/api/company", require("./routes/c_companyRoutes"));
app.use("/api/internships", require("./routes/c_internshipRoutes"));
app.use("/api/upload", require("./routes/c_uploadRoutes"));
app.use("/api/payments", require("./routes/p_paymentRoutes"));
app.use("/api/pro-accounts", require("./routes/p_proAccountRoutes"));
=======
app.use(express.urlencoded({ extended: true }));

// Enable CORS
app.use(cors({
    origin: ['http://localhost:3000'],
    credentials: true
}));

// Routes (ONLY existing ones)
app.use('/api/companies', require('./routes/C_companyRoutes'));
>>>>>>> Stashed changes

// Basic route
app.get('/', (req, res) => {
    res.json({ 
        message: 'StepIn Internship Management API',
        status: 'running'
    });
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: err.message });
});

// 404
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

<<<<<<< Updated upstream
const startServer = async () => {
    const isDatabaseConnected = await connectDB();

    if (!isDatabaseConnected) {
        console.warn('Starting server without MongoDB. Task data will be stored in memory until the process restarts.');
    }

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
};

startServer();
=======
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
>>>>>>> Stashed changes
