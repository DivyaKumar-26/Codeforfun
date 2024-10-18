const mongoose = require('mongoose');

// MongoDB connection URL
// Replace 'your_database_url' with your actual MongoDB connection string
const dbUrl = process.env.MONGODB_URI || 'mongodb://localhost:27017/iitr_lending_platform';

const connectDB = async () => {
    try {
        await mongoose.connect(dbUrl, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
            useFindAndModify: false
        });
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1); // Exit process with failure
    }
};

module.exports = connectDB;