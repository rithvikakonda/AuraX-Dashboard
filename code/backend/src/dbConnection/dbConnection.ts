import mongoose, { Document, Schema, Model } from 'mongoose';


// MongoDB connection URI
const mongoURI = process.env.MONGODB_URI;

// Function to connect to MongoDB
async function connectToDatabase(): Promise<boolean> {
  try {
    if (!mongoURI) {
      throw new Error('MONGO_URI is not defined in the environment variables');
    }
    await mongoose.connect(mongoURI || '');
    console.log('Connected to MongoDB successfully');
    return true;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    return false;
  }
}

// Function to disconnect from MongoDB
async function disconnectFromDatabase(): Promise<boolean> {
  try {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB successfully');
    return true;
  } catch (error) {
    console.error('Error disconnecting from MongoDB:', error);
    return false;
  }
}

// Export the connection functions and models
export {
  connectToDatabase,
  disconnectFromDatabase,
};
