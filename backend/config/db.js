const mongoose = require('mongoose');

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const buildCandidateUris = () => {
    const primary = process.env.MONGO_URI || process.env.MONGODB_URI;
    const fallback = process.env.MONGO_URI_FALLBACK;

    return [primary, fallback].filter(Boolean);
};

const connectWithRetries = async (uri, maxAttempts = 3) => {
    let lastError = null;

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
        try {
            const conn = await mongoose.connect(uri, {
                // Fail fast so the API can still boot in degraded mode when MongoDB is unavailable.
                serverSelectionTimeoutMS: 5000,
                // Prefer IPv4 in environments where IPv6/DNS paths are unstable.
                family: 4
            });

            return conn;
        } catch (error) {
            lastError = error;
            console.warn(`MongoDB connect attempt ${attempt}/${maxAttempts} failed: ${error.message}`);

            if (attempt < maxAttempts) {
                await wait(1200);
            }
        }
    }

    throw lastError;
};

const connectDB = async () => {
    const candidateUris = buildCandidateUris();

    if (candidateUris.length === 0) {
        console.warn('MongoDB URI not configured. Set MONGO_URI (or MONGODB_URI) in backend/.env to enable database features.');
        return false;
    }

    for (const [index, uri] of candidateUris.entries()) {
        const label = index === 0 ? 'primary' : `fallback ${index}`;

        try {
            console.log(`Connecting to MongoDB (${label})...`);
            const conn = await connectWithRetries(uri, 3);
            console.log(`MongoDB connected: ${conn.connection.host}`);
            return true;
        } catch (error) {
            console.error(`MongoDB connection failed (${label}): ${error.message}`);
        }
    }

    console.warn('Starting server without MongoDB. Database-backed features will not work until the connection is restored.');
    return false;
};

module.exports = connectDB;
