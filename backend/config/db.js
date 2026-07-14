// =============================================
// DATABASE CONNECTION CONFIG
// =============================================

import mongoose from 'mongoose';
import { getEnv } from './env.js';

// Register graceful shutdown once (prevents MaxListeners warning on nodemon restarts)
process.once('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB connection closed on app termination');
  process.exit(0);
});

export const connectDB = async () => {
  try {
    const env = getEnv();
    const conn = await mongoose.connect(env.mongoUri, {
      dbName: env.mongoDbName,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database: ${conn.connection.name}`);

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected');
    });
  } catch (error) {
    const env = getEnv();
    console.error(`MongoDB connection failed (${env.mongoUri}): ${error.message}`);
    if (error.code === 'ECONNREFUSED') {
      console.error('Ensure MongoDB is running and the MONGO_URI is correct.');
    }
    process.exit(1);
  }
};
