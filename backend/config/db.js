const mongoose = require('mongoose');

const connectDB = async () => {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

    if (!mongoUri) {
        console.warn('MongoDB URI not configured. Set MONGO_URI or MONGODB_URI in backend/.env to enable database features.');
        return false;
    }

    try {
        console.log('Connecting to MongoDB...');

        const conn = await mongoose.connect(mongoUri, {
            // Fail fast so the API can still boot in degraded mode when MongoDB is unavailable.
            serverSelectionTimeoutMS: 5000
        });

        console.log(`MongoDB connected: ${conn.connection.host}`);
        return true;
    } catch (error) {
        console.error(`MongoDB connection failed: ${error.message}`);
        console.warn('Starting server without MongoDB. Database-backed features will not work until the connection is restored.');
        return false;
    }
};

module.exports = connectDB;
