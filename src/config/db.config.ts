import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  try {
    const connStr = process.env.MONGODB_URI;
    await mongoose.connect(connStr!);
    console.log(`MongoDB Connected Successfully`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${(error as Error).message}`);
  }
};
