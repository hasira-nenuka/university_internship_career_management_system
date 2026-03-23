const mongoose = require('mongoose');

const connectDB = async () => {
    try {
<<<<<<< Updated upstream
        const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/taskdb';

        await mongoose.connect(mongoUri);
        console.log('MongoDB Connected Successfully');
        return true;
    } catch (error) {
        console.error('MongoDB Connection Failed:', error);
        return false;
=======
        console.log('📡 Connecting to MongoDB...');
        
        const conn = await mongoose.connect(process.env.MONGO_URI);

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ MongoDB Connection Failed: ${error.message}`);

        console.log('\n💡 Troubleshooting Tips:');
        console.log('1. Check your internet connection');
        console.log('2. Verify MongoDB Atlas credentials in .env file');
        console.log('3. Make sure your IP is whitelisted in MongoDB Atlas');
        console.log('4. Check if the database name is correct');

        process.exit(1);
>>>>>>> Stashed changes
    }
};

module.exports = connectDB;
