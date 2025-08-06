import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public details?: Record<string, any>
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
      ...(err.details && { details: err.details })
    });
  }

  // MongoDB Duplicate Key Error
  if (err.name === 'MongoServerError' && (err as any).code === 11000) {
    return res.status(400).json({
      status: 'error',
      message: 'Duplicate value entered'
    });
  }

  // MongoDB Validation Error
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      status: 'error',
      message: err.message
    });
  }

  // JWT Error
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid token'
    });
  }

  // Default Error
  console.error('Error 💥:', err);
  return res.status(500).json({
    status: 'error',
    message: 'Something went wrong!'
  });
};