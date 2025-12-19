const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const isProduction = process.env.NODE_ENV === 'production';
    const mongoUri = isProduction 
      ? process.env.MONGO_URI_ATLAS 
      : process.env.MONGO_URI_LOCAL;

    if (!mongoUri) {
      throw new Error(
        `MongoDB URI is not defined. Please set ${
          isProduction ? 'MONGO_URI_ATLAS' : 'MONGO_URI_LOCAL'
        } in your .env file.`
      );
    }

    console.log(
      `Connecting to ${isProduction ? 'MongoDB Atlas' : 'Local MongoDB'}...`
    );
    
    const conn = await mongoose.connect(mongoUri);
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database Name: ${conn.connection.name}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
