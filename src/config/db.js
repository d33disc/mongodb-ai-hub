const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB connection URI - use environment variable
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-data-hub';

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
