import dotenv from 'dotenv';
// Load environment variables before importing other modules
dotenv.config();

import app from './master';
import { connectDB } from './config/db.config';

const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
