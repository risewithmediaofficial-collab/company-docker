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
      console.warn('MongoDB disconnected. Attempting to reconnect...');
      setTimeout(connectDB, 5000);
    });
  } catch (error) {
    const env = getEnv();
    console.error(`MongoDB connection failed (${env.mongoUri}): ${error.message}`);

    // Retry on connection refused (MongoDB not yet started)
    if (error.code === 'ECONNREFUSED' || error.message?.includes('ECONNREFUSED')) {
      console.warn('MongoDB not reachable. Retrying in 5 seconds...');
      setTimeout(connectDB, 5000);
    } else {
      process.exit(1);
    }
  }
};
