import express from 'express';
import cors from 'cors';
import compression from "compression";
import { errorHandler } from './middleware/errorHandler.middlware';
import routes from './routes';

const app = express();

app.use(cors());
app.use(express.json());
app.use(compression());

// API Routes
app.use('/api', routes)

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// Centralized error handler
app.use(errorHandler);

export default app;
