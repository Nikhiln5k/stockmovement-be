import { Request, Response, NextFunction } from 'express';

export interface CustomError extends Error {
  statusCode?: number;
  code?: number; // MongoDB error codes
  keyValue?: Record<string, unknown>;
  errors?: Record<string, { message: string }>;
}

export const errorHandler = (
  err: CustomError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Log error for developers in dev environment
  if (process.env.NODE_ENV !== 'production') {
    console.error('Error details:', err);
  }

  // MongoDB Duplicate Key Error (code 11000)
  if (err.code === 11000) {
    statusCode = 400;
    const field = err.keyValue ? Object.keys(err.keyValue)[0] : 'field';
    const value = err.keyValue ? err.keyValue[field] : '';
    message = `Duplicate value: '${value}' for path '${field}' is not allowed.`;
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError' && err.errors) {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(', ');
  }

  // Mongoose Cast Error (e.g. invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Resource not found with that identifier.`;
  }

  res.status(statusCode).json({
    success: false,
    error: message,
  });
};
