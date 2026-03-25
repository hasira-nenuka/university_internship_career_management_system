const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        console.log('📡 Connecting to MongoDB...');
        
        const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/taskdb';
        const conn = await mongoose.connect(mongoUri);

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        return true;
    } catch (error) {
        console.error(`❌ MongoDB Connection Failed: ${error.message}`);

        console.log('\n💡 Troubleshooting Tips:');
        console.log('1. Check your internet connection');
        console.log('2. Verify MongoDB Atlas credentials in .env file');
        console.log('3. Make sure your IP is whitelisted in MongoDB Atlas');
        console.log('4. Check if the database name is correct');

        return false;
    }
};

module.exports = connectDB;
